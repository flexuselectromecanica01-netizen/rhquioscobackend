import { AppDataSource } from "../data-source";
import { seedAreas } from "./areas.seed";
import { seedPuestos } from "./puestos.seed";

async function runSeeders() {
  await AppDataSource.initialize();

  await seedAreas(AppDataSource);
  await seedPuestos(AppDataSource);

  await AppDataSource.destroy();

  console.log("Seeders ejecutados correctamente");
}

runSeeders().catch((error) => {
  console.error("Error ejecutando seeders:", error);
});