import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VacacionesModule } from './vacaciones/vacaciones.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [VacacionesModule, LoginModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
