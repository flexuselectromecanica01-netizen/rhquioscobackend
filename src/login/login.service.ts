import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Login, TipoRolSistema } from './entities/login.entity';
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

  async cambiarRolPorEmpleado(idempleado: string, rol: TipoRolSistema) {
  const login = await this.loginRepository.findOne({
    where: {
      empleado: {
        idempleado,
      },
    },
    relations: {
      empleado: true,
    },
  });

  if (!login) {
    throw new BadRequestException("Login no encontrado para este empleado");
  }

  if( login.empleado.idempleado === "0001" &&  rol !== TipoRolSistema.ADMINISTRADOR){
    throw new BadRequestException("El usuario 0001 debe permanecer como ADMINISTRADOR")
  }

  login.rol = rol;

  await this.loginRepository.save(login);

  return {
    message: "Rol actualizado correctamente",
    login: {
      id: login.id,
      idempleado: login.empleado.idempleado,
      nombre: login.empleado.nombre,
      rol: login.rol,
      actualizarpassword: login.actualizarpassword,
    },
  };
}

async resetearPasswordPorEmpleado(idempleado: string) {
  const login = await this.loginRepository.findOne({
    where: {
      empleado: {
        idempleado,
      },
    },
    relations: {
      empleado: true,
    },
  });

  if (!login) {
    throw new BadRequestException("Login no encontrado para este empleado");
  }

  const passwordTemporal = `Empleado${idempleado}`;
  const passwordHasheada = await bcrypt.hash(passwordTemporal, 10);

  login.password = passwordHasheada;
  login.actualizarpassword = true;

  await this.loginRepository.save(login);

  return {
    message: "Contraseña restablecida correctamente",
    usuario: login.empleado.idempleado,
    passwordTemporal,
    actualizarpassword: login.actualizarpassword,
  };
}
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
    return this.loginRepository
      .createQueryBuilder('login')
      .select([
        'login.id AS id',
        'login.idempleado AS idempleado',
        'login.rol AS rol',
        'login.subrol AS subrol',
        'login.bodega AS bodega',
        'login.linea AS linea',
      ])
      .where('login.rol != :rol', {
        rol: TipoRolSistema.ADMINISTRADOR,
      })
      .orderBy('login.idempleado', 'ASC')
      .getRawMany();
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
