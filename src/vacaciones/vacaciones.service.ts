import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcrypt";
import { Vacacione } from './entities/vacacione.entity';
import { Repository } from 'typeorm';
import { Login, TipoRolSistema } from '../login/entities/login.entity';

@Injectable()
export class VacacionesService {
  constructor(
    @InjectRepository(Vacacione) private readonly vacacionesRepository:Repository<Vacacione>,
    @InjectRepository(Login) private readonly loginRepository: Repository<Login>

  ){}

  private generarPasswordInicial(idempleado:string):string{
    return `Empleado${idempleado}`;
  }

  async create(createVacacioneDto: CreateVacacioneDto) {
      return this.vacacionesRepository.manager.transaction(async(manager)=>{
        const empleado = manager.create(Vacacione,createVacacioneDto);
        const empleadoGuardado = await manager.save(Vacacione, empleado);
        const loginExistente = await manager.findOne(Login, {
        where: {
          empleado: {
            idempleado: empleadoGuardado.idempleado,
          },
        },
        relations: {
          empleado: true,
        },
      });
      if (!loginExistente) {
        const passwordInicial = this.generarPasswordInicial(
          empleadoGuardado.idempleado,
        );

        const passwordHasheada = await bcrypt.hash(passwordInicial, 10);

        const login = manager.create(Login, {
          empleado: empleadoGuardado,
          password: passwordHasheada,
          actualizarpassword: true,
          rol: TipoRolSistema.EMPLEADO,
        });

        await manager.save(Login, login);
      }
      return {
        message: "Empleado creado correctamente"};

      }

      )    

  }

  findAll() {
    return this.vacacionesRepository.find();
  }

  async findOne(id: number) {
    const vacaciones = await this.vacacionesRepository.findOneBy({id})
    if(!vacaciones){
      throw new NotFoundException(`No existe la solicitud de vacaciones ${id}`)
    }
    return vacaciones;
  }

  async update(id: number, updateVacacioneDto: UpdateVacacioneDto) {
    const vacaciones = await this.findOne(id)
    Object.assign(vacaciones,updateVacacioneDto) 
    return await this.vacacionesRepository.save(vacaciones);
  }

  async remove(id: number) {
    const vacaciones = await this.findOne(id)
    await this.vacacionesRepository.remove(vacaciones)
    return {message:'vacaciones eliminadas'};
  }

  async findByIdEmpleado(idempleado: string) {
  const empleado = await this.vacacionesRepository.findOne({
    where: {
      idempleado,
    },
    relations: {
      solicitudes: true,
    },
  });

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado");
  }

  return empleado;
}
async findAllEmpleadosConSolicitudes() {
  const empleados = await this.vacacionesRepository.find({
    relations: {
      solicitudes: true,
    },
    order: {
      id: "ASC",
      solicitudes: {
        id: "ASC",
      },
    },
  });

  return empleados;
}
}
