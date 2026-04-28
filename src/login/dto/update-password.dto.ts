import { IsString, Length, MinLength } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @Length(4, 4)
  idempleado: string;

  @IsString()
  passwordActual: string;

  @IsString()
  @MinLength(6)
  nuevaPassword: string;
}