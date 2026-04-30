import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PuestoService {
  constructor(
    @InjectRepository(Puesto) private readonly puestoRepository:Repository<Puesto>
  ){}
  async create(createPuestoDto: CreatePuestoDto) {
    await this.puestoRepository.save(createPuestoDto)
    return {message:"Puesto creado correctamente"};
  }

  findAll() {
    return this.puestoRepository.find();
  }

  async findOne(id: number) {
    const puesto = await this.puestoRepository.findOne({
      where:{id}
    })
    if(!puesto){
      throw new NotFoundException("Puesto no encontrado")
    }
    return puesto;
  }

  async update(id: number, updatePuestoDto: UpdatePuestoDto) {
    const puesto = await this.findOne(id)
    Object.assign(puesto,updatePuestoDto)
    await this.puestoRepository.save(puesto)
    return {message:"Puesto actualizado correctamente"};
  }

  async remove(id: number) {
    const puesto = await this.findOne(id)
    await this.puestoRepository.remove(puesto) 
    return {message:"Puesto eliminado correctamente"};
  }
}
