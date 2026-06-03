import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdateEmailDto {
  @IsNotEmpty({ message: "El correo electrónico es obligatorio" })
  @IsEmail({}, { message: "El correo electrónico no es válido" })
  correoElectronico: string;
}


