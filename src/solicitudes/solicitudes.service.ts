import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto';
import { UpdateSolicitudeDto } from './dto/update-solicitude.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EstatusSolicitud, Solicitude } from './entities/solicitude.entity';
import { Repository } from 'typeorm';
import { Vacacione } from '../vacaciones/entities/vacacione.entity';
import { MailService } from '../mail/mail.service';
import { Login, SubrolSistema, TipoRolSistema } from '../login/entities/login.entity';




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
    @InjectRepository(Vacacione) private readonly vacacionesrepository: Repository<Vacacione>,
     @InjectRepository(Login)
  private readonly loginRepository: Repository<Login>,
    private readonly mailService: MailService
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

  const fechaInicio = this.convertirFechaLocal(createSolicitudeDto.iniciocicloactual);
  const fechaTermino = this.convertirFechaLocal(createSolicitudeDto.fincicloactual);

  if (fechaTermino < fechaInicio) {
    throw new BadRequestException(
      "La fecha de término no puede ser menor a la fecha de inicio",
    );
  }

  const diastotales = this.contarDiasHabiles(
    createSolicitudeDto.iniciocicloactual,
    createSolicitudeDto.fincicloactual,
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
    fechainicio: createSolicitudeDto.iniciocicloactual,
    fechatermino: createSolicitudeDto.fincicloactual,
    diastotales,
    estatus: EstatusSolicitud.PENDIENTE,
    empleado,
  });

 const solicitudGuardada = await this.solicitudesRepository.save(solicitud);

const responsable = await this.obtenerResponsableParaNotificar(
  empleado.idempleado,
);

await this.mailService.enviarCorreoNuevaSolicitudVacaciones({
  correoElectronico: responsable.correoElectronico,
  destinatario: responsable.nombreResponsable,
  tipoResponsable: responsable.tipoResponsable,
  empleado: empleado.nombre,
  idempleado: empleado.idempleado,
  area: empleado.area,
  bodega: responsable.bodega,
  linea: responsable.linea,
  saldoDisponible: empleado.saldodisponible,
 fechaIngreso: String(empleado.fechaingreso),
  fechaInicio: solicitudGuardada.fechainicio,
  fechaFin: solicitudGuardada.fechatermino,
  diasSolicitados: solicitudGuardada.diastotales,
});

return solicitudGuardada;
}

  async aprobarSolicitud(id: number,correoElectronico:string) {
    if(!correoElectronico){
      throw new BadRequestException("El correo electronico es obligatorio")
    }
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
  console.log("Enviando correo a:", correoElectronico);
  console.log("Solicitud aprobada en BD");
console.log("Intentando enviar correo de APROBACIÓN");
console.log("Correo destino:", correoElectronico);
console.log("Empleado:", empleado.nombre);
console.log("Fechas:", solicitud.fechainicio, solicitud.fechatermino);

  await this.mailService.enviarCorreoVacaciones({
    correoElectronico,
    empleado:solicitud.empleado.nombre,
    estatus:"APROBADA",
    fechaInicio:solicitud.fechainicio,
    fechaFin:solicitud.fechatermino,
    diasSolicitados:solicitud.diastotales
  })

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

private async obtenerResponsableParaNotificar(idempleado: string) {
  const loginSolicitante = await this.loginRepository.findOne({
    where: {
      empleado: {
        idempleado,
      },
    },
    relations: {
      empleado: true,
    },
  });

  if (!loginSolicitante) {
    throw new NotFoundException(
      "No se encontró el usuario login del solicitante",
    );
  }

  if (loginSolicitante.subrol === "EMPLEADO") {
    const maestra = await this.loginRepository.findOne({
      where: {
        subrol: SubrolSistema.MAESTRA,
        bodega: loginSolicitante.bodega,
        linea: loginSolicitante.linea,
      },
      relations: {
        empleado: true,
      },
    });

    if (!maestra) {
      throw new NotFoundException(
        "No se encontró una maestra para la misma bodega y línea",
      );
    }

    if (
      !maestra.correoElectronico ||
      maestra.correoElectronico === "sin-correo@flexuselec.com"
    ) {
      throw new BadRequestException(
        "La maestra no tiene correo electrónico configurado",
      );
    }

    return {
      correoElectronico: maestra.correoElectronico,
      nombreResponsable: maestra.empleado?.nombre ?? "Maestra",
      tipoResponsable: "MAESTRA",
      bodega: loginSolicitante.bodega,
      linea: loginSolicitante.linea,
    };
  }

  if (loginSolicitante.subrol === "MAESTRA") {
    const supervisor = await this.loginRepository.findOne({
      where: {
        rol: TipoRolSistema.SUPERVISOR,
      },
      relations: {
        empleado: true,
      },
    });

    if (!supervisor) {
      throw new NotFoundException("No se encontró un supervisor registrado");
    }

    if (
      !supervisor.correoElectronico ||
      supervisor.correoElectronico === "sin-correo@flexuselec.com"
    ) {
      throw new BadRequestException(
        "El supervisor no tiene correo electrónico configurado",
      );
    }

    return {
      correoElectronico: supervisor.correoElectronico,
      nombreResponsable: supervisor.empleado?.nombre ?? "Supervisor",
      tipoResponsable: "SUPERVISOR",
      bodega: loginSolicitante.bodega,
      linea: loginSolicitante.linea,
    };
  }

  throw new BadRequestException(
    "No se pudo determinar a quién enviar la solicitud",
  );
}

async rechazarSolicitud(id: number, motivorechazo: string,correoElectronico:string) {
  if(!correoElectronico){
    throw new BadRequestException("El correo electronico es obligatorio")
  }
    if (!motivorechazo || motivorechazo.trim().length === 0) {
    throw new BadRequestException("El motivo de rechazo es obligatorio");
  }
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
      "Solo se pueden rechazar solicitudes pendientes",
    );
  }

  solicitud.estatus = EstatusSolicitud.RECHAZADA;
  solicitud.motivorechazo = motivorechazo;

  await this.solicitudesRepository.save(solicitud);

  console.log("Solicitud rechazada en BD");
console.log("Intentando enviar correo de RECHAZO");
console.log("Correo destino:", correoElectronico);
console.log("Empleado:", solicitud.empleado.nombre);
console.log("Motivo:", motivorechazo.trim());

    await this.mailService.enviarCorreoVacaciones({
    correoElectronico,
    empleado: solicitud.empleado.nombre,
    estatus: "RECHAZADA",
    fechaInicio: solicitud.fechainicio,
    fechaFin: solicitud.fechatermino,
    diasSolicitados: solicitud.diastotales,
    motivoRechazo: motivorechazo.trim(),
  });

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
