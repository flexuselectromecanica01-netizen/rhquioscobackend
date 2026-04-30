import { DataSource } from "typeorm";
import { Area, AreaEnum } from "../area/entities/area.entity";

export async function seedAreas(dataSource: DataSource) {
  const areaRepository = dataSource.getRepository(Area);

  const areas = Object.values(AreaEnum);

  console.log("Áreas del enum:", areas);

  let insertadas = 0;
  let existentes = 0;

  for (const area of areas) {
    const exists = await areaRepository.findOne({
      where: { area },
    });

    if (!exists) {
      await areaRepository.save({ area });
      insertadas++;
      console.log(`Insertada: ${area}`);
    } else {
      existentes++;
      console.log(`Ya existía: ${area}`);
    }
  }

  console.log(`Áreas insertadas: ${insertadas}`);
  console.log(`Áreas existentes: ${existentes}`);
}