import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vacacione } from "../../vacaciones/entities/vacacione.entity";

export enum TipoRolSistema{
    SUPERVISOR="SUPERVISOR",
    ADMINISTRADOR="ADMINISTRADOR",
    EMPLEADO="EMPLEADO"
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

}
