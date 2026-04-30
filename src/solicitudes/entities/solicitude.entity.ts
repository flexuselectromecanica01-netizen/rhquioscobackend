import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Vacacione } from "../../vacaciones/entities/vacacione.entity"

export enum EstatusSolicitud{
    PENDIENTE="PENDIENTE",
    APROBADA="APROBADA",
    RECHAZADA="RECHAZADA",
    CANCELADA="CANCELADA"
}

@Entity()
export class Solicitude {
    @PrimaryGeneratedColumn()
    id:number
    @Column({
        type:"date"
    })
    fechainicio:string
    @Column({
        type:"int"
    })
    diastotales:number
    @Column({
        type:"date"
    })
    fechatermino:string

    @Column({
        type:"enum",
        enum:EstatusSolicitud,
        default:EstatusSolicitud.PENDIENTE
    })
    estatus:EstatusSolicitud
    
    @Column({
        type:"text",
        nullable:true
    })
    motivorechazo?:string

    @ManyToOne(()=>Vacacione,(vacacione)=>vacacione.idempleado,{
        nullable:false
    })
    @JoinColumn({
        name:"idempleado",
        referencedColumnName:"idempleado"
    })
    empleado:Vacacione

    @CreateDateColumn({
  type: "timestamp",
})
fechacreacion: Date;
}
