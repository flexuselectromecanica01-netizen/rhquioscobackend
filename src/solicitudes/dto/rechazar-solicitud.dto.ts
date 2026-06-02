import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RechazarSolicitudDto {
  @IsString()
  @IsNotEmpty()
  motivorechazo: string;

  @IsEmail()
  @IsNotEmpty()
  correoElectronico: string;
}