import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vacacione {
    @PrimaryGeneratedColumn()
    id:number
    @Column({
        type:'varchar',
        length:4,
        unique:true
    })
    idempleado:string
    nombre:string
    tipoempleado:string
    area:string
    puesto:string
    fechaingreso:string
    antiguedad:string
    diasderecho:string
    iniciocicloactual:string
    fincicloactual:string
    proporcionaldevengado:string
    diastomados:string
    saldodisponible:string
    diasporvencer:string
    diasavencer:string
    semaforo:string
    accionsugerida:string
}
