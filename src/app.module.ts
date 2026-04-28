import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VacacionesModule } from './vacaciones/vacaciones.module';
import { LoginModule } from './login/login.module';
import { AreaModule } from './area/area.module';
import { PuestoModule } from './puesto/puesto.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
          isGlobal:true
        }),
        TypeOrmModule.forRootAsync({
          useFactory:typeOrmConfig,
          inject:[ConfigService]
        }),
    VacacionesModule, LoginModule, AreaModule, PuestoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
