import { IsString, Length } from "class-validator";

export class LoginDto {
  @IsString()
  @Length(4, 4)
  idempleado: string;

  @IsString()
  password: string;
}