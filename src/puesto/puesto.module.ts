import { Module } from '@nestjs/common';
import { PuestoService } from './puesto.service';
import { PuestoController } from './puesto.controller';

@Module({
  controllers: [PuestoController],
  providers: [PuestoService],
})
export class PuestoModule {}
