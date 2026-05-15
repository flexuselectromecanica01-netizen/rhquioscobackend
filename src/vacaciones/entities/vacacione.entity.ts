import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Solicitude } from "../../solicitudes/entities/solicitude.entity";
import { Login } from "../../login/entities/login.entity";

export enum TipoEmpleadoEnum {
  QUINCENAL = "QUINCENAL",
  SEMANAL = "SEMANAL",
}

export enum SemaforoEnum {
  CONTROLADO = "CONTROLADO",
  ATENCION = "ATENCION",
  SINSALDO = "SINSALDO",
}

@Entity()
export class Vacacione {
  @ApiProperty({
    example: 1,
    description: "ID interno del empleado en la tabla vacaciones",
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "0004",
    description: "Número de empleado de 4 dígitos",
  })
  @Column({
    type: "varchar",
    length: 4,
    unique: true,
  })
  idempleado: string;

  @ApiProperty({
    example: "Diego Trejo",
    description: "Nombre completo del empleado",
  })
  @Column({
    type: "varchar",
    length: 100,
  })
  nombre: string;

  @ApiProperty({
    enum: TipoEmpleadoEnum,
    example: TipoEmpleadoEnum.SEMANAL,
    description: "Tipo de empleado",
  })
  @Column({
    type: "enum",
    enum: TipoEmpleadoEnum,
  })
  tipoempleado: TipoEmpleadoEnum;

  @ApiProperty({
    example: "SISTEMAS",
    description: "Área del empleado",
  })
  @Column({
    type: "varchar",
    length: 100,
  })
  area: string;

  @ApiProperty({
    example: "DESARROLLADOR",
    description: "Puesto del empleado",
  })
  @Column({
    type: "varchar",
    length: 100,
  })
  puesto: string;

  @ApiProperty({
    example: "2021-04-28",
    description: "Fecha de ingreso del empleado",
  })
  @Column({
    type: "date",
  })
  fechaingreso: Date;

  @ApiProperty({
    example: 5,
    description: "Antigüedad del empleado en años",
  })
  @Column({
    type: "int",
  })
  antiguedad: number;

  @ApiProperty({
    example: 12,
    description: "Días de vacaciones a los que tiene derecho",
  })
  @Column({
    type: "int",
  })
  diasderecho: number;

  @ApiProperty({
    example: "2026-01-01",
    description: "Fecha de inicio del ciclo actual",
  })
  @Column({
    type: "date",
  })
  iniciocicloactual: Date;

  @ApiProperty({
    example: "2026-12-31",
    description: "Fecha de fin del ciclo actual",
  })
  @Column({
    type: "date",
  })
  fincicloactual: Date;

  @ApiProperty({
    example: 3.18,
    description: "Vacaciones proporcionales devengadas",
  })
  @Column({
    type: "decimal",
    precision: 5,
    scale: 2,
  })
  proporcionaldevengado: number;

  @ApiProperty({
    example: 0,
    description: "Días de vacaciones ya tomados",
  })
  @Column({
    type: "int",
  })
  diastomados: number;

  @ApiProperty({
    example: 7.0,
    description: "Saldo disponible de vacaciones",
  })
  @Column({
    type: "decimal",
    precision: 6,
    scale: 2,
  })
  saldodisponible: number;

  @ApiProperty({
    example: 0,
    description: "Días próximos a vencer",
  })
  @Column({
    type: "int",
  })
  diasporvencer: number;

  @ApiProperty({
    example: 0,
    description: "Días a vencer",
  })
  @Column({
    type: "int",
  })
  diasavencer: number;

  @ApiProperty({
    enum: SemaforoEnum,
    example: SemaforoEnum.CONTROLADO,
    description: "Estado del empleado según sus vacaciones",
  })
  @Column({
    type: "enum",
    enum: SemaforoEnum,
  })
  semaforo: SemaforoEnum;

  @ApiProperty({
    example: "Revisar con RH porque el saldo disponible está en negativo.",
    description: "Acción sugerida para RH",
    nullable: true,
  })
  @Column({
    type: "text",
    nullable: true,
  })
  accionsugerida: string;

  @OneToMany(() => Solicitude, (solicitud) => solicitud.empleado)
  solicitudes: Solicitude[];

  @OneToOne(() => Login, (login) => login.empleado)
login: Login;
}