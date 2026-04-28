import { IsBoolean, IsOptional, IsString, Length } from "class-validator";

export class CreateLoginDto {
    @IsString()
  @Length(4, 4)
  idempleado: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsBoolean()
  actualizarpassword?: boolean;

  @IsString()
  rol: string;
}
