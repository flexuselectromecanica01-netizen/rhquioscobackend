import { IsEnum, IsOptional } from "class-validator";
import {
  TipoRolSistema,
  SubrolSistema,
  BodegaSistema,
  LineaSistema,
} from "../entities/login.entity";

export class UpdateLoginSupervisorDto {
  @IsOptional()
  @IsEnum(TipoRolSistema)
  rol?: TipoRolSistema;

  @IsOptional()
  @IsEnum(SubrolSistema)
  subrol?: SubrolSistema;

  @IsOptional()
  @IsEnum(BodegaSistema)
  bodega?: BodegaSistema;

  @IsOptional()
  @IsEnum(LineaSistema)
  linea?: LineaSistema;
}