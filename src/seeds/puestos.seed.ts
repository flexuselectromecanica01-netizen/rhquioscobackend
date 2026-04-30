import { DataSource } from "typeorm";
import { Puesto, PuestoEnum } from "../puesto/entities/puesto.entity";


export async function seedPuestos(dataSource:DataSource) {
    const puestoRepository = dataSource.getRepository(Puesto)

    const puestos = Object.values(PuestoEnum)
    console.log("Puestos del enum:",puestos)

    let insertados = 0;
    let existentes = 0;

    for(const puesto of puestos){
        const exists = await puestoRepository.findOne({
            where:{puesto}
        })
        if(!exists){
            await puestoRepository.save({puesto})
            insertados++;
            console.log(`Insertado: ${puesto}`)
        }else{
            existentes++;
            console.log(`Ya existia: ${puesto}`)
        }
    }
console.log(`Puestos insertados: ${insertados}`);
  console.log(`Puestos existentes: ${existentes}`);
}