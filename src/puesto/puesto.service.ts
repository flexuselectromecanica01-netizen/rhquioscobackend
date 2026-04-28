import { Injectable } from '@nestjs/common';
import { CreatePuestoDto } from './dto/create-puesto.dto';
import { UpdatePuestoDto } from './dto/update-puesto.dto';

@Injectable()
export class PuestoService {
  create(createPuestoDto: CreatePuestoDto) {
    return 'This action adds a new puesto';
  }

  findAll() {
    return `This action returns all puesto`;
  }

  findOne(id: number) {
    return `This action returns a #${id} puesto`;
  }

  update(id: number, updatePuestoDto: UpdatePuestoDto) {
    return `This action updates a #${id} puesto`;
  }

  remove(id: number) {
    return `This action removes a #${id} puesto`;
  }
}
