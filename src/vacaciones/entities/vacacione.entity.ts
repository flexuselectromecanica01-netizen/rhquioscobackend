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
    diasderecho:number

    @Column({
        type:"date"
    })
    iniciocicloactual:Date

    @Column({
        type:"date"
    })
    fincicloactual:Date

    @Column({
        type:"decimal",
        precision:5,
        scale:2
    })
    proporcionaldevengado:number

    @Column({
        type:'int'
    })
    diastomados:number

    @Column({
        type:"decimal",
        precision:6,
        scale:2
    })
    saldodisponible:number

    @Column({
        type:'int'
    })
    diasporvencer:number


    @Column({
        type:'int'
    })
    diasavencer:number

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
