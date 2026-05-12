import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto';
import { UpdateSolicitudeDto } from './dto/update-solicitude.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EstatusSolicitud, Solicitude } from './entities/solicitude.entity';
import { Repository } from 'typeorm';
import { Vacacione } from '../vacaciones/entities/vacacione.entity';




@Injectable()
export class SolicitudesService {


  private diasFestivos = [
  "2026-01-01",
  "2026-02-02",
  "2026-03-16",
  "2026-05-01",
  "2026-09-16",
  "2026-11-16",
  "2026-12-25",
];

private convertirFechaLocal(fecha: string): Date {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

private formatearFechaInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

private esFinDeSemana(date: Date): boolean {
  const dia = date.getDay();
  return dia === 0 || dia === 6;
}

private esDiaFestivo(date: Date): boolean {
  const fechaTexto = this.formatearFechaInput(date);
  return this.diasFestivos.includes(fechaTexto);
}

private contarDiasHabiles(fechaInicio: string, fechaTermino: string): number {
  let contador = 0;

  const fechaActual = this.convertirFechaLocal(fechaInicio);
  const fechaFinal = this.convertirFechaLocal(fechaTermino);

  while (fechaActual <= fechaFinal) {
    if (!this.esFinDeSemana(fechaActual) && !this.esDiaFestivo(fechaActual)) {
      contador++;
    }

    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return contador;
}
  constructor(
    @InjectRepository(Solicitude) private readonly solicitudesRepository:Repository<Solicitude>,
    @InjectRepository(Vacacione) private readonly vacacionesrepository: Repository<Vacacione>
  ){}
  async create(createSolicitudeDto: CreateSolicitudeDto, idempleado: string) {
  const empleado = await this.vacacionesrepository.findOne({
    where: {
      idempleado,
    },
  });

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado");
  }

  const fechaInicio = this.convertirFechaLocal(createSolicitudeDto.fechainicio);
  const fechaTermino = this.convertirFechaLocal(createSolicitudeDto.fechatermino);

  if (fechaTermino < fechaInicio) {
    throw new BadRequestException(
      "La fecha de término no puede ser menor a la fecha de inicio",
    );
  }

  const diastotales = this.contarDiasHabiles(
    createSolicitudeDto.fechainicio,
    createSolicitudeDto.fechatermino,
  );

  if (diastotales <= 0) {
    throw new BadRequestException(
      "La solicitud debe tener al menos un día hábil",
    );
  }

  const saldoDisponible = Number(empleado.saldodisponible ?? 0);

  if (diastotales > saldoDisponible) {
    throw new BadRequestException(
      `No tienes días suficientes. Disponibles: ${saldoDisponible}, solicitados: ${diastotales}`,
    );
  }

  const solicitud = this.solicitudesRepository.create({
    fechainicio: createSolicitudeDto.fechainicio,
    fechatermino: createSolicitudeDto.fechatermino,
    diastotales,
    estatus: EstatusSolicitud.PENDIENTE,
    empleado,
  });

  return this.solicitudesRepository.save(solicitud);
}

  async aprobarSolicitud(id: number) {
  const solicitud = await this.solicitudesRepository.findOne({
    where: { id },
    relations: {
      empleado: true,
    },
  });

  if (!solicitud) {
    throw new NotFoundException("Solicitud no encontrada");
  }

  if (solicitud.estatus !== EstatusSolicitud.PENDIENTE) {
    throw new BadRequestException(
      "Solo se pueden aprobar solicitudes pendientes",
    );
  }

  const empleado = solicitud.empleado;

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado para esta solicitud");
  }

  const diasDerecho = Number(empleado.diasderecho);
  const diasTomadosActuales = Number(empleado.diastomados ?? 0);
  const diasSolicitados = Number(solicitud.diastotales);

  const nuevoDiasTomados = diasTomadosActuales + diasSolicitados;
  const nuevoSaldoDisponible = diasDerecho - nuevoDiasTomados;

  if (nuevoSaldoDisponible < 0) {
    throw new BadRequestException(
      "El empleado no tiene suficientes días disponibles para aprobar esta solicitud",
    );
  }

  empleado.diastomados = nuevoDiasTomados;
  empleado.saldodisponible = nuevoSaldoDisponible;

  solicitud.estatus = EstatusSolicitud.APROBADA;
  solicitud.motivorechazo = null;

  await this.vacacionesrepository.save(empleado);
  await this.solicitudesRepository.save(solicitud);

  return {
    message: "Solicitud aprobada correctamente",
    empleado: {
      idempleado: empleado.idempleado,
      diasderecho: empleado.diasderecho,
      diastomados: empleado.diastomados,
      saldodisponible: empleado.saldodisponible,
    },
    solicitud,
  };
}

async rechazarSolicitud(id: number, motivorechazo: string) {
  const solicitud = await this.solicitudesRepository.findOne({
    where: { id },
  });

  if (!solicitud) {
    throw new NotFoundException("Solicitud no encontrada");
  }

  if (solicitud.estatus !== EstatusSolicitud.PENDIENTE) {
    throw new BadRequestException(
      "Solo se pueden rechazar solicitudes pendientes",
    );
  }

  solicitud.estatus = EstatusSolicitud.RECHAZADA;
  solicitud.motivorechazo = motivorechazo;

  await this.solicitudesRepository.save(solicitud);

  return {
    message: "Solicitud rechazada correctamente",
    solicitud,
  };
}

  findAll() {
    return this.solicitudesRepository.find({
      relations: {
        empleado: true,
      },
      order: {
        id: "DESC",
      },
    });
  }

  findByIdEmpleado(idempleado:string){
    return this.solicitudesRepository.find({
      where:{
        empleado:{
          idempleado
        }
      },
      relations:{
        empleado:true
      },
      order:{
        id:'DESC'
      }
    })
  }

  async findOne(id: number) {
    const solicitud = await this.solicitudesRepository.findOne({
      where: { id },
      relations: {
        empleado: true,
      },
    });

    if (!solicitud) {
      throw new NotFoundException("Solicitud no encontrada");
    }

    return solicitud;
  }

   async update(id: number, updateSolicitudeDto: UpdateSolicitudeDto) {
    const solicitud = await this.findOne(id);

    Object.assign(solicitud, updateSolicitudeDto);

    return this.solicitudesRepository.save(solicitud);
  }

  async remove(id: number) {
    const solicitud = await this.findOne(id);

    await this.solicitudesRepository.remove(solicitud);

    return {
      message: "Solicitud eliminada correctamente",
    };
  }
}
