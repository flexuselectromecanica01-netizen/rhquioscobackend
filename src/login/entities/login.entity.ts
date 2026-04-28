import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Vacacione } from "../../vacaciones/entities/vacacione.entity";
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
        type:"varchar",
        length:50,
        default:"Empleado"
    })
    rol:string

}
