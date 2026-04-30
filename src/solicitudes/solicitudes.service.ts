import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto';
import { UpdateSolicitudeDto } from './dto/update-solicitude.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EstatusSolicitud, Solicitude } from './entities/solicitude.entity';
import { Repository } from 'typeorm';
import { Vacacione } from '../vacaciones/entities/vacacione.entity';

@Injectable()
export class SolicitudesService {
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

  const fechaInicio = new Date(createSolicitudeDto.fechainicio);
  const fechaTermino = new Date(createSolicitudeDto.fechatermino);

  if (fechaTermino < fechaInicio) {
    throw new BadRequestException(
      "La fecha de término no puede ser menor a la fecha de inicio",
    );
  }

  const diferenciaMs = fechaTermino.getTime() - fechaInicio.getTime();

  const diastotales =
    Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)) + 1;

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
  });

  if (!solicitud) {
    throw new NotFoundException("Solicitud no encontrada");
  }

  if (solicitud.estatus !== EstatusSolicitud.PENDIENTE) {
    throw new BadRequestException(
      "Solo se pueden aprobar solicitudes pendientes",
    );
  }

  solicitud.estatus = EstatusSolicitud.APROBADA;
  solicitud.motivorechazo = null;

  await this.solicitudesRepository.save(solicitud);

  return {
    message: "Solicitud aprobada correctamente",
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
