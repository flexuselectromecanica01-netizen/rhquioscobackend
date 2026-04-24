import { PartialType } from '@nestjs/mapped-types';
import { CreateVacacioneDto } from './create-vacacione.dto';

export class UpdateVacacioneDto extends PartialType(CreateVacacioneDto) {}
