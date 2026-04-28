import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../config/typeorm.config';
import { Vacacione } from './entities/vacacione.entity';
import { Login } from '../login/entities/login.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Vacacione,Login])
  ],
  controllers: [VacacionesController],
  providers: [VacacionesService],
})
export class VacacionesModule {}
