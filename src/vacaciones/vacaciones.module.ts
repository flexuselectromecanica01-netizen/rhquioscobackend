import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  controllers: [VacacionesController],
  providers: [VacacionesService],
})
export class VacacionesModule {}
