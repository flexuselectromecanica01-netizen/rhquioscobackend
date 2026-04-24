import { Injectable } from '@nestjs/common';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';

@Injectable()
export class VacacionesService {
  create(createVacacioneDto: CreateVacacioneDto) {
    return 'This action adds a new vacacione';
  }

  findAll() {
    return { mensaje: "Hola luis" };
  }

  findOne(id: number) {
    return `This action returns a #${id} vacacione`;
  }

  update(id: number, updateVacacioneDto: UpdateVacacioneDto) {
    return `This action updates a #${id} vacacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} vacacione`;
  }
}
