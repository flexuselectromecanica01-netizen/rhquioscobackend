import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TipoEmpleadoEnum{
    QUINCENAL="QUINCENAL",
    SEMANAL="SEMANAL"
}

export enum SemaforoEnum{
    CONTROLADO="CONTROLADO",
    ATENCION="ATENCION",
    SINSALDO="SINSALDO"
}


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

    @Column({
        type:"varchar",
        length:100
    })
    nombre:string

    @Column({
        type:"enum",
        enum:TipoEmpleadoEnum
    })
    tipoempleado:TipoEmpleadoEnum

    @Column({
  type: "varchar",
  length: 100,
})
    area:string

@Column({
  type: "varchar",
  length: 100,
})
    puesto:string

    @Column({
        type:"date"
    })
    fechaingreso:Date

    @Column({
        type:'int'
    })
    antiguedad:number

    @Column({
        type:'int'
    })
    diasderecho:string

    @Column({
        type:"date"
    })
    iniciocicloactual:string

    @Column({
        type:"date"
    })
    fincicloactual:string

    @Column({
        type:"decimal",
        precision:5,
        scale:2
    })
    proporcionaldevengado:number

    @Column({
        type:'int'
    })
    diastomados:string

    @Column({
        type:"decimal",
        precision:6,
        scale:2
    })
    saldodisponible:number

    @Column({
        type:'int'
    })
    diasporvencer:string


    @Column({
        type:'int'
    })
    diasavencer:string

    @Column({
       type:'enum',
       enum:SemaforoEnum 
    })
    semaforo:SemaforoEnum


    @Column({
        type:"text",
        nullable:true
    })
    accionsugerida:string
}
