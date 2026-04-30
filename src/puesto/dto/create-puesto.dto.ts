import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreatePuestoDto {
    @IsString({
        message:"El puesto debe ser texto"
    })
    @IsNotEmpty({
        message:"El puesto es obligatorio"
    })
    @MaxLength(100,{
        message:"El puesto no puede tener mas de 100 caracteres"
    })
    puesto:string

}
