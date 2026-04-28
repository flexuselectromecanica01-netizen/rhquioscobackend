import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    TypeOrmModule.forFeature([Login]),
    JwtModule.register({
      secret:"secret",
      signOptions:{
        expiresIn:"1d"
      }
    })
  ],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
