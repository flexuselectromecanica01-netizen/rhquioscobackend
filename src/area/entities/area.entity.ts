import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum AreaEnum{
    ALMACEN="ALMACEN",
    CALIDAD="CALIDAD",
    PRODUCCION="PRODUCCION",
    MANTENIMIENTO="MANTENIMIENTO",
    ADMINISTRACION="ADMINISTRACION"
}

@Entity()
export class Area {
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    area:string
}
