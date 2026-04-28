import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PuestoService } from './puesto.service';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Controller('puesto')
export class PuestoController {
  constructor(private readonly puestoService: PuestoService) {}

  @Post()
  create(@Body() createPuestoDto: CreatePuestoDto) {
    return this.puestoService.create(createPuestoDto);
  }

  @Get()
  findAll() {
    return this.puestoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.puestoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePuestoDto: UpdatePuestoDto) {
    return this.puestoService.update(+id, updatePuestoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.puestoService.remove(+id);
  }
}
