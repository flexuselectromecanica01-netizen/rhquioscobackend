import "reflect-metadata"
import {DataSource} from "typeorm"
import {config} from "dotenv"
import { Puesto } from "./puesto/entities/puesto.entity"
import { Area } from "./area/entities/area.entity"



config()



export const AppDataSource= new DataSource({
    type:"postgres",
    host:process.env.DATABASE_HOST,
    port:Number(process.env.DATABASE_PORT ?? 5432),
    username:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASS,
    database:process.env.DATABASE_NAME,
    entities:[Puesto,Area],
    synchronize:true,
     ssl: {
    rejectUnauthorized: false,
  }
})