import { IsEmail, IsNotEmpty } from "class-validator";

export class AprobarSolicitudDto {
  @IsEmail()
  correoElectronico: string;
}