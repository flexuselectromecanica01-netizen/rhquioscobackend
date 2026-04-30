import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Puesto } from '../puesto/entities/puesto.entity';
import { Repository } from 'typeorm';
import { Area } from './entities/area.entity';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area) private readonly areaRepository:Repository<Area>
  ){}
  async create(createAreaDto: CreateAreaDto) {
    await this.areaRepository.save(createAreaDto)
    return {message:"Area creada correctamente"};
  }

  findAll() {
    return this.areaRepository.find()
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({
      where:{id}
    })
    if(!area){
      throw new NotFoundException("Area no encontrada")
    }
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.findOne(id)
    Object.assign(area,updateAreaDto)
    await this.areaRepository.save(area)
    return {message:"Area actualizada correctamente"};
  }

  async remove(id: number) {
    const area = await this.findOne(id)
    await this.areaRepository.remove(area)
    return {message:"Area eliminada correctamente"};
  }
}
