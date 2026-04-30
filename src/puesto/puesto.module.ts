import { Module } from '@nestjs/common';
import { PuestoService } from './puesto.service';
import { PuestoController } from './puesto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Puesto])
  ],
  controllers: [PuestoController],
  providers: [PuestoService],
})
export class PuestoModule {}
