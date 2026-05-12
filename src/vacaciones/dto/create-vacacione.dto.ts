import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from "class-validator";
import { SemaforoEnum, TipoEmpleadoEnum } from "../entities/vacacione.entity";
import { Column } from "typeorm";

export class CreateVacacioneDto {
    @IsString()
    @Length(4,4,{
        message:"El id del empleado debe tener exactamente 4 digitos"
    })
    @Matches(/^\d{4}$/, {
    message: "El id del empleado solo debe contener números",
    })
    idempleado:string

    @IsString()
  @Length(2, 100, {
    message: "El nombre debe tener entre 2 y 100 caracteres",
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: "El nombre solo puede contener letras y espacios",
  })
  nombre: string;

  @IsEnum(TipoEmpleadoEnum, {
    message: "El tipo de empleado no es válido",
  })
  tipoempleado: TipoEmpleadoEnum;
@IsString()
@MaxLength(100)
  area: string;
@IsString()
@MaxLength(100)
  puesto: string;

  @IsDateString({}, {
    message: "La fecha de ingreso debe tener un formato válido",
  })
  fechaingreso?: string;

  @IsInt({
    message: "La antigüedad debe ser un número entero",
  })
  @Max(60, {
    message: "La antigüedad no puede ser mayor a 60",
  })
  antiguedad?: number;


  @IsInt({
    message: "Los dias derecho debe ser un número entero",
  })
  @Max(60, {
    message: "Los dias derecho no puede ser mayor a 60",
  })
  diasderecho?: number;


   @IsDateString({}, {
    message: "La fecha de ingreso debe tener un formato válido",
  })
  iniciocicloactual?: string;

  @IsDateString({}, {
    message: "La fecha de ingreso debe tener un formato válido",
  })
  fincicloactual?: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: "El proporcional devengado debe ser un número con máximo 2 decimales",
    },
  )
  @Max(999.99)
  proporcionaldevengado?: number;

    @IsInt({
    message: "Los dias tomados debe ser un número entero",
  })
  @Max(60, {
    message: "Los dias tomados no puede ser mayor a 60",
  })
  diastomados?: number;

 @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message: "El saldo disponible debe ser un número con máximo 2 decimales",
    },
  )
  @Min(-9999.99, {
    message: "El saldo disponible no puede ser menor a -9999.99",
  })
  @Max(9999.99, {
    message: "El saldo disponible no puede ser mayor a 9999.99",
  })
  saldodisponible?: number;


   @IsInt({
    message: "Los dias por vencer debe ser un número entero",
  })
  @Max(60, {
    message: "Los dias por vencer no puede ser mayor a 60",
  })
  diasporvencer?: number;

  @IsInt({
    message: "Los dias a vencer debe ser un número entero",
  })
  @Max(60, {
    message: "Los dias a vencer no puede ser mayor a 60",
  })
  diasavencer?: number;

     @IsEnum(SemaforoEnum, {
    message: "El semaforo no es válido",
  })
  semaforo: SemaforoEnum;  

  @IsOptional()
  @IsString({
    message: "La acción sugerida debe ser texto",
  })
  @MaxLength(2000, {
    message: "La acción sugerida no puede superar los 2000 caracteres",
  })
  accionsugerida?: string;
}
