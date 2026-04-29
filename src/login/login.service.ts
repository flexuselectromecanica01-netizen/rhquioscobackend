import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import * as bcrypt from "bcrypt";
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Login) private readonly loginRepository:Repository<Login>,
    private readonly jwtService:JwtService
  ){}
  async login(loginDto: LoginDto) {
    const usuario = await this.loginRepository.findOne({
      where: {
        empleado: {
          idempleado: loginDto.idempleado,
        },
      },
      relations: {
        empleado: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException("Usuario no existe");
    }

    const passwordValida = await bcrypt.compare(
      loginDto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException("Contraseña incorrecta");
    }

    const payload = {
      sub:usuario.id,
      idempleado:usuario.empleado.idempleado
    }

    const token = await this.jwtService.signAsync(payload)

    return {
      token
    };
  }

  async me(user: any) {
  const usuario = await this.loginRepository.findOne({
    where: {
      id: user.sub,
    },
    relations: {
      empleado: true,
    },
  });

  return {
    id: usuario.id,
    idempleado: usuario.empleado.idempleado,
    nombre: usuario.empleado.nombre,
    rol: usuario.rol,
    actualizarpassword: usuario.actualizarpassword,
    empleado: usuario.empleado,
  };
}
  async actualizarPassword(usuarioId:number,password:string){
    if(!password || password.length < 8){
      throw new BadRequestException("La contraseña debe de tener minimo 8 caracteres")
    }
    const passwordHasheada = await bcrypt.hash(password,10)

    await this.loginRepository.update(
      {id:usuarioId},
      {password:passwordHasheada,
        actualizarpassword:false
      }
    )
    return{
      message:"Contraseña actualizada correctamente"
    }
  }

  create(CreateLoginDto:CreateLoginDto) {
    return `This action returns all login`;
  }

  findAll() {
    return `This action returns all login`;
  }

  findOne(id: number) {
    return `This action returns a #${id} login`;
  }

  update(id: number, updateLoginDto: UpdateLoginDto) {
    return `This action updates a #${id} login`;
  }

  remove(id: number) {
    return `This action removes a #${id} login`;
  }
}
