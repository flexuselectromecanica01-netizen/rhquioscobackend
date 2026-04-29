import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';

@Controller('vacaciones')
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @Get("empleado/:idempleado")
findByIdEmpleado(@Param("idempleado") idempleado: string) {
  return this.vacacionesService.findByIdEmpleado(idempleado);
}

  @Post()
  create(@Body() createVacacioneDto: CreateVacacioneDto) {
    return this.vacacionesService.create(createVacacioneDto);
  }

  @Get()
  findAll() {
    return this.vacacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vacacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVacacioneDto: UpdateVacacioneDto) {
    return this.vacacionesService.update(+id, updateVacacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vacacionesService.remove(+id);
  }
}
