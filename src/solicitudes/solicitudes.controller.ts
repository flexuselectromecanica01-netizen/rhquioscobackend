import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudeDto } from './dto/create-solicitude.dto';
import { UpdateSolicitudeDto } from './dto/update-solicitude.dto';
import { JwtAuthGuard } from '../login/guards/jwt-auth.guard';
import { RechazarSolicitudDto } from './dto/rechazar-solicitud.dto';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

 @UseGuards(JwtAuthGuard)
@Post()
create(
  @Req() req: Request,
  @Body() createSolicitudeDto: CreateSolicitudeDto,
) {
  const usuario = req["user"];

  return this.solicitudesService.create(
    createSolicitudeDto,
    usuario.idempleado,
  );
}


  @Get("empleado/:idempleado")
  findByIdEmpleado(@Param("idempleado") idempleado:string){
    return this.solicitudesService.findByIdEmpleado(idempleado)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.solicitudesService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudesService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudeDto: UpdateSolicitudeDto) {
    return this.solicitudesService.update(+id, updateSolicitudeDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudesService.remove(+id);
  }

  @Patch(":id/aprobar")
aprobarSolicitud(@Param("id") id: string) {
  return this.solicitudesService.aprobarSolicitud(+id);
}

@Patch(":id/rechazar")
rechazarSolicitud(
  @Param("id") id: string,
  @Body() rechazarSolicitudDto: RechazarSolicitudDto,
) {
  return this.solicitudesService.rechazarSolicitud(
    +id,
    rechazarSolicitudDto.motivorechazo,
  );
}
}
