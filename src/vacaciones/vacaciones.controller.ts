import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors, Query, ParseIntPipe } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';
import { JwtAuthGuard } from '../login/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vacaciones')
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @Get("empleado/:idempleado")
findByIdEmpleado(@Param("idempleado") idempleado: string) {
  return this.vacacionesService.findByIdEmpleado(idempleado);
}
@Get("detalle/:id")
findDetalleEmpleadoConLogin(@Param("id", ParseIntPipe) id: number) {
  return this.vacacionesService.findDetalleEmpleadoConLogin(id);
}

  @Get("paginado")
  findAllPaginado(@Query("page") page?: string,@Query("limit") limit?:string, @Query("idempleado") idempleado?:string){
    return this.vacacionesService.findAllPaginado(Number(page) || 1,Number(limit) || 10,idempleado)
  }



@Get("empleados")
findAllEmpleadosConSolicitudes() {
  return this.vacacionesService.findAllEmpleadosConSolicitudes();
}
@Post('importar-excel')
  @UseInterceptors(FileInterceptor('file'))
  importarExcel(@UploadedFile() file: any) {
    return this.vacacionesService.importarDesdeExcel(file);
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

  @Post("importar-json")
  importarJson(@Body() body: { empleados: CreateVacacioneDto[] }) {
    return this.vacacionesService.importarDesdeJson(body.empleados);
  }

}
