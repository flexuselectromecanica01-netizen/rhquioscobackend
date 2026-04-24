import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';

@Module({
  controllers: [VacacionesController],
  providers: [VacacionesService],
})
export class VacacionesModule {}
