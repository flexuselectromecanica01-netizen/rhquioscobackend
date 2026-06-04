import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  SemaforoEnum,
  TipoEmpleadoEnum,
} from "../entities/vacacione.entity";

export class CreateVacacioneDto {
  @ApiProperty({
    example: "0004",
    description: "ID del empleado. Debe tener exactamente 4 dígitos numéricos.",
    minLength: 4,
    maxLength: 4,
  })
  @IsString({
    message: "El id del empleado debe ser texto",
  })
  @Length(4, 4, {
    message: "El id del empleado debe tener exactamente 4 dígitos",
  })
  @Matches(/^\d{4}$/, {
    message: "El id del empleado solo debe contener números",
  })
  idempleado: string;

  @ApiProperty({
    example: "Diego Trejo",
    description: "Nombre completo del empleado. Solo permite letras y espacios.",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({
    message: "El nombre debe ser texto",
  })
  @Length(2, 100, {
    message: "El nombre debe tener entre 2 y 100 caracteres",
  })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: "El nombre solo puede contener letras y espacios",
  })
  nombre: string;

  @ApiProperty({
    enum: TipoEmpleadoEnum,
    example: TipoEmpleadoEnum.SEMANAL,
    description: "Tipo de empleado.",
  })
  @IsEnum(TipoEmpleadoEnum, {
    message: "El tipo de empleado no es válido",
  })
  tipoempleado: TipoEmpleadoEnum;

  @ApiProperty({
    example: "SISTEMAS",
    description: "Área a la que pertenece el empleado.",
    maxLength: 100,
  })
  @IsString({
    message: "El área debe ser texto",
  })
  @MaxLength(100, {
    message: "El área no puede superar los 100 caracteres",
  })
  area: string;

  @ApiProperty({
    example: "DESARROLLADOR",
    description: "Puesto del empleado.",
    maxLength: 100,
  })
  @IsString({
    message: "El puesto debe ser texto",
  })
  @MaxLength(100, {
    message: "El puesto no puede superar los 100 caracteres",
  })
  puesto: string;

  @ApiPropertyOptional({
    example: "2021-04-28",
    description: "Fecha de ingreso del empleado en formato YYYY-MM-DD.",
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: "La fecha de ingreso debe tener un formato válido YYYY-MM-DD",
    },
  )
  fechaingreso?: string;

  @ApiPropertyOptional({
    example: 5,
    description: "Antigüedad del empleado en años.",
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "La antigüedad debe ser un número entero",
  })
  @Min(0, {
    message: "La antigüedad no puede ser menor a 0",
  })
  @Max(60, {
    message: "La antigüedad no puede ser mayor a 60",
  })
  antiguedad?: number;

  @ApiPropertyOptional({
    example: 12,
    description: "Días de vacaciones a los que tiene derecho el empleado.",
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "Los días derecho deben ser un número entero",
  })
  @Min(0, {
    message: "Los días derecho no pueden ser menores a 0",
  })
  @Max(60, {
    message: "Los días derecho no pueden ser mayores a 60",
  })
  diasderecho?: number;

  @ApiPropertyOptional({
    example: "2026-01-01",
    description: "Fecha de inicio del ciclo actual en formato YYYY-MM-DD.",
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: "La fecha de inicio del ciclo actual debe tener un formato válido YYYY-MM-DD",
    },
  )
  iniciocicloactual?: string;

  @ApiPropertyOptional({
    example: "2026-12-31",
    description: "Fecha de fin del ciclo actual en formato YYYY-MM-DD.",
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message: "La fecha de fin del ciclo actual debe tener un formato válido YYYY-MM-DD",
    },
  )
  fincicloactual?: string;

  @ApiPropertyOptional({
    example: 3.18,
    description: "Días proporcionales devengados. Máximo 2 decimales.",
    minimum: 0,
    maximum: 999.99,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        "El proporcional devengado debe ser un número con máximo 2 decimales",
    },
  )
  @Min(0, {
    message: "El proporcional devengado no puede ser menor a 0",
  })
  @Max(999.99, {
    message: "El proporcional devengado no puede ser mayor a 999.99",
  })
  proporcionaldevengado?: number;

  @ApiPropertyOptional({
    example: 0,
    description: "Días de vacaciones ya tomados.",
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "Los días tomados deben ser un número entero",
  })
  @Min(0, {
    message: "Los días tomados no pueden ser menores a 0",
  })
  @Max(60, {
    message: "Los días tomados no pueden ser mayores a 60",
  })
  diastomados?: number;

  @ApiPropertyOptional({
    example: 7.0,
    description: "Saldo disponible de vacaciones. Puede ser negativo.",
    minimum: -9999.99,
    maximum: 9999.99,
  })
  @IsOptional()
  @Type(() => Number)
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

  @ApiPropertyOptional({
    example: 0,
    description: "Días próximos a vencer.",
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "Los días por vencer deben ser un número entero",
  })
  @Min(0, {
    message: "Los días por vencer no pueden ser menores a 0",
  })
  @Max(60, {
    message: "Los días por vencer no pueden ser mayores a 60",
  })
  diasporvencer?: number;

  @ApiPropertyOptional({
    example: 304,
    description: "Cantidad de días restantes para que finalice el ciclo actual.",
    minimum: 0,
    maximum: 9999,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({
    message: "Los días a vencer deben ser un número entero",
  })
  @Min(0, {
    message: "Los días a vencer no pueden ser menores a 0",
  })
  @Max(9999, {
    message: "Los días a vencer no pueden ser mayores a 9999",
  })
  diasavencer?: number;

  @ApiPropertyOptional({
    enum: SemaforoEnum,
    example: SemaforoEnum.CONTROLADO,
    description: "Estado de control del empleado respecto a sus vacaciones.",
  })
  @IsOptional()
  @IsEnum(SemaforoEnum, {
    message: "El semáforo no es válido",
  })
  semaforo?: SemaforoEnum;

  @ApiPropertyOptional({
    example: "Revisar con RH porque el saldo disponible está en negativo.",
    description: "Comentario o recomendación para RH.",
    maxLength: 2000,
  })
  @IsOptional()
  @IsString({
    message: "La acción sugerida debe ser texto",
  })
  @MaxLength(2000, {
    message: "La acción sugerida no puede superar los 2000 caracteres",
  })
  accionsugerida?: string;
}