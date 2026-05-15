import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vacacione } from "../../vacaciones/entities/vacacione.entity";

export enum TipoRolSistema{
    SUPERVISOR="SUPERVISOR",
    ADMINISTRADOR="ADMINISTRADOR",
    EMPLEADO="EMPLEADO"
}

export enum SubrolSistema {
  MAESTRA = "MAESTRA",
  EMPLEADO = "EMPLEADO",
}

export enum BodegaSistema {
  B1 = "B1",
  B2 = "B2",
}


export enum LineaSistema {
  L1 = "L1",
  L2 = "L2",
  L3 = "L3",
  L4 = "L4",
  L5 = "L5",
  L6 = "L6",
  L7 = "L7",
  L8 = "L8",
  L9 = "L9",
  L10 = "L10",
  L11 = "L11",
  L12 = "L12",
  L13 = "L13",
  L14 = "L14",
}


@Entity()
export class Login {
    @PrimaryGeneratedColumn()
    id:number

    @OneToOne(()=>Vacacione)
    @JoinColumn({
        name:"idempleado",
        referencedColumnName:"idempleado"
    })
    empleado:Vacacione

    @Column({
        type:"varchar",
        length:255
    })
    password:string

    @Column({
        type:"boolean",
        default:true
    })
    actualizarpassword:boolean

    @Column({
  type: "enum",
  enum: TipoRolSistema,
  default: TipoRolSistema.EMPLEADO,
})
rol: TipoRolSistema;

    @Column({
        type:"enum",
        enum:SubrolSistema,
        default:SubrolSistema.EMPLEADO
    })
    subrol:SubrolSistema
    @Column({
        type:"enum",
        enum:BodegaSistema,
        default:BodegaSistema.B1
    })
    bodega:BodegaSistema 
    @Column({
        type:"enum",
        enum:LineaSistema,
        default:LineaSistema.L1
    })
    linea:LineaSistema

    
}
