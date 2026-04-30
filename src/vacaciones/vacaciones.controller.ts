import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';
import { JwtAuthGuard } from '../login/guards/jwt-auth.guard';

@Controller('vacaciones')
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @Get("empleado/:idempleado")
findByIdEmpleado(@Param("idempleado") idempleado: string) {
  return this.vacacionesService.findByIdEmpleado(idempleado);
}
@UseGuards(JwtAuthGuard)
@Get("empleados")
findAllEmpleadosConSolicitudes() {
  return this.vacacionesService.findAllEmpleadosConSolicitudes();
}

  @Get("area/:area")
findByArea(@Param("area") area: string) {
  return this.vacacionesService.findByArea(area);
}
  @Post()
  create(@Body() createVacacioneDto: CreateVacacioneDto) {
    return this.vacacionesService.create(createVacacioneDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.vacacionesService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacacionesService.findOne(+id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVacacioneDto: UpdateVacacioneDto) {
    return this.vacacionesService.update(+id, updateVacacioneDto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacacionesService.remove(+id);
  }
}
