import { IsDateString, IsNotEmpty, IsString, Length, Matches } from "class-validator";

export class CreateSolicitudeDto {
  @IsString()
    @Length(4, 4, {
      message: "El id del empleado debe tener exactamente 4 digitos",
    })
    @Matches(/^\d{4}$/, {
      message: "El id del empleado solo debe contener números",
    })
    idempleado: string;
  
   @IsDateString()
  @IsNotEmpty()
    iniciocicloactual: string;
     @IsDateString()
  @IsNotEmpty()
  fincicloactual: string;
}
