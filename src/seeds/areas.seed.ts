import { DataSource } from "typeorm";
import { Area } from "../area/entities/area.entity";
import { AreaEnum } from "../area/entities/area.entity";

export async function seedAreas(dataSource:DataSource) {
    const areaRepository=dataSource.getRepository(Area)
    const areas = Object.values(AreaEnum);

    for(const area of areas){
        const exists = await areaRepository.findOne({
            where:{area}
        });
        if(!exists){
            await areaRepository.save({area})
        }
    }

    console.log("Areas insertadas")
}
