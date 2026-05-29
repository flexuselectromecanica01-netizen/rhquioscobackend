import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVacacioneDto } from './dto/create-vacacione.dto';
import { UpdateVacacioneDto } from './dto/update-vacacione.dto';
import { IsNull, Not } from "typeorm";
import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import { Solicitude } from "../solicitudes/entities/solicitude.entity";
import * as bcrypt from "bcrypt";
import { Vacacione } from './entities/vacacione.entity';
import { DeepPartial, Repository } from "typeorm";
import { BodegaSistema, LineaSistema, Login, SubrolSistema, TipoRolSistema } from '../login/entities/login.entity';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class VacacionesService {
  constructor(
    @InjectRepository(Vacacione) private readonly vacacionesRepository:Repository<Vacacione>,
    @InjectRepository(Login) private readonly loginRepository: Repository<Login>

  ){}

  @Cron("5 0 * * *")
async recalcularVacacionesAutomaticamente() {
  await this.recalcularTodosLosEmpleados();
}

  private formatearFechaInput(fecha: Date) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

private crearFechaLocal(fecha: string | Date) {
  if (fecha instanceof Date) {
    return new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
    );
  }

  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

private sumarMeses(fecha: Date, meses: number) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
}

private sumarAnios(fecha: Date, anios: number) {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setFullYear(nuevaFecha.getFullYear() + anios);
  return nuevaFecha;
}

private calcularDiasVacacionesLey(antiguedad: number) {
  if (antiguedad <= 0) return 0;

  if (antiguedad === 1) return 12;
  if (antiguedad === 2) return 14;
  if (antiguedad === 3) return 16;
  if (antiguedad === 4) return 18;
  if (antiguedad === 5) return 20;

  if (antiguedad >= 6 && antiguedad <= 10) return 22;
  if (antiguedad >= 11 && antiguedad <= 15) return 24;
  if (antiguedad >= 16 && antiguedad <= 20) return 26;
  if (antiguedad >= 21 && antiguedad <= 25) return 28;
  if (antiguedad >= 26 && antiguedad <= 30) return 30;
  if (antiguedad >= 31 && antiguedad <= 35) return 32;

  return 32;
}

async restore(id: number) {
  const empleado = await this.vacacionesRepository.findOne({
    where: { id },
    withDeleted: true,
  });

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado");
  }

  if (!empleado.deletedAt) {
    throw new BadRequestException("El empleado no está eliminado");
  }

  await this.vacacionesRepository.restore(id);

  return {
    message: "Empleado restaurado correctamente",
  };
}

private obtenerUltimoAniversarioCumplido(fechaIngreso: string | Date, hoy = new Date()) {
  const ingreso = this.crearFechaLocal(fechaIngreso);

  let aniversario = new Date(
    hoy.getFullYear(),
    ingreso.getMonth(),
    ingreso.getDate(),
  );

  // Si el aniversario de este año todavía no llega,
  // entonces el ciclo actual inició en el aniversario del año pasado.
  if (hoy < aniversario) {
    aniversario = new Date(
      hoy.getFullYear() - 1,
      ingreso.getMonth(),
      ingreso.getDate(),
    );
  }

  return aniversario;
}

private calcularAntiguedad(fechaIngreso: string | Date, hoy = new Date()) {
  const ingreso = this.crearFechaLocal(fechaIngreso);

  let antiguedad = hoy.getFullYear() - ingreso.getFullYear();

  const aniversarioEsteAnio = new Date(
    hoy.getFullYear(),
    ingreso.getMonth(),
    ingreso.getDate(),
  );

  if (hoy < aniversarioEsteAnio) {
    antiguedad--;
  }

  return Math.max(antiguedad, 0);
}

private calcularMesesTranscurridos(inicio: Date, hoy = new Date()) {
  let meses =
    (hoy.getFullYear() - inicio.getFullYear()) * 12 +
    (hoy.getMonth() - inicio.getMonth());

  if (hoy.getDate() < inicio.getDate()) {
    meses--;
  }

  return Math.max(meses, 0);
}

private calcularDiasEntreFechas(desde: Date, hasta: Date) {
  const inicio = new Date(
    desde.getFullYear(),
    desde.getMonth(),
    desde.getDate(),
  );

  const fin = new Date(
    hasta.getFullYear(),
    hasta.getMonth(),
    hasta.getDate(),
  );

  const diferencia = fin.getTime() - inicio.getTime();

  return Math.max(Math.ceil(diferencia / (1000 * 60 * 60 * 24)), 0);
}

private calcularSemaforo(saldoDisponible: number) {
  if (saldoDisponible <= 0) return "SINSALDO";
  if (saldoDisponible <= 3) return "ATENCION";
  return "CONTROLADO";
}
private calcularVacacionesPorFechaIngreso(
  fechaIngreso: string | Date,
  diasTomados: number = 0,
) {
  if (!fechaIngreso) {
    throw new BadRequestException("La fecha de ingreso es obligatoria");
  }

  const ingreso = this.crearFechaLocal(fechaIngreso);
  const hoy = new Date();

  const fechaSeisMeses = this.sumarMeses(ingreso, 6);
  const fechaPrimerAniversario = this.sumarAnios(ingreso, 1);

  const antiguedad = this.calcularAntiguedad(fechaIngreso, hoy);

  let diasderecho = 0;
  let inicioCiclo: Date;
  let finCiclo: Date;

  // ESCENARIO 1:
  // Empleado nuevo que todavía NO cumple 6 meses.
  if (hoy < fechaSeisMeses) {
    diasderecho = 0;

    // Aunque todavía no tenga días, su primer ciclo futuro inicia a los 6 meses.
    inicioCiclo = fechaSeisMeses;

    // Según tu regla: al ciclo de 6 meses se le suman 4 meses.
    finCiclo = this.sumarMeses(inicioCiclo, 4);
  }

  // ESCENARIO 2:
  // Ya cumplió 6 meses, pero todavía NO cumple 1 año.
  else if (hoy >= fechaSeisMeses && hoy < fechaPrimerAniversario) {
    diasderecho = 6;

    // Sigue siendo el ciclo proporcional de 6 meses.
    inicioCiclo = fechaSeisMeses;

    // Según tu regla: al ciclo de 6 meses se le suman 4 meses.
    finCiclo = this.sumarMeses(inicioCiclo, 4);
  }

  // ESCENARIO 3:
  // Ya cumplió 1 año o más.
  else {
    diasderecho = this.calcularDiasVacacionesLey(antiguedad);

    // Aquí ya NO usamos fechaIngreso + 6 meses.
    // Usamos el último aniversario cumplido.
    inicioCiclo = this.obtenerUltimoAniversarioCumplido(fechaIngreso, hoy);

    // Según tu regla: al ciclo anual se le suman 5 meses.
    finCiclo = this.sumarMeses(inicioCiclo, 5);
  }

  const proporcionaldevengado = this.calcularMesesTranscurridos(
    ingreso,
    hoy,
  );

  const saldoDisponible = diasderecho - diasTomados;
  const diasPorVencer = saldoDisponible;
  const diasAVencer = this.calcularDiasEntreFechas(hoy, finCiclo);
  const semaforo = this.calcularSemaforo(saldoDisponible);

  return {
    antiguedad,
    diasderecho,
    iniciocicloactual: inicioCiclo,
    fincicloactual: finCiclo,
    proporcionaldevengado: Number(proporcionaldevengado.toFixed(2)),
    saldodisponible: Number(saldoDisponible.toFixed(2)),
    diasporvencer: diasPorVencer,
    diasavencer: diasAVencer,
    semaforo,
  };
}

  private generarPasswordInicial(idempleado:string):string{
    return `Empleado${idempleado}`;
  }

  async findAllPaginado(page = 1, limit = 10, idempleado?: string) {
  const currentPage = Number(page) || 1;
  const currentLimit = Number(limit) || 10;

  const skip = (currentPage - 1) * currentLimit;

  const where = idempleado
    ? {
        idempleado: idempleado.trim().padStart(4, "0"),
      }
    : {};

  const [data, total] = await this.vacacionesRepository.findAndCount({
    where,
    relations: {
      solicitudes: true,
    },
    order: {
      id: "ASC",
    },
    skip,
    take: currentLimit,
  });

  return {
    data,
    meta: {
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
}
  async create(createVacacioneDto: CreateVacacioneDto) {
  return this.vacacionesRepository.manager.transaction(async (manager) => {
    const fechaIngreso = createVacacioneDto.fechaingreso;

    if (!fechaIngreso) {
      throw new BadRequestException("La fecha de ingreso es obligatoria");
    }

    if (!createVacacioneDto.idempleado) {
      throw new BadRequestException("El número de empleado es obligatorio");
    }

    const idempleado = createVacacioneDto.idempleado.trim();

    const empleadoExistente = await manager.findOne(Vacacione, {
      where: {
        idempleado,
      },
    });

    if (empleadoExistente) {
      throw new BadRequestException(
        `Ya existe un empleado con el número ${idempleado}`,
      );
    }

    const loginExistente = await manager.findOne(Login, {
      where: {
        empleado: {
          idempleado,
        },
      },
      relations: {
        empleado: true,
      },
    });

    if (loginExistente) {
      throw new BadRequestException(
        `Ya existe un login registrado para el empleado ${idempleado}`,
      );
    }

    const calcularInicioCicloActual = (fecha: string) => {
      const [year, month, day] = fecha.split("-").map(Number);
      const fechaBase = new Date(year, month - 1, day);

      const anioActual = new Date().getFullYear();
      fechaBase.setFullYear(anioActual);

      return fechaBase.toISOString().split("T")[0];
    };

    const calcularFinCicloActual = (inicioCiclo: string) => {
      const [year, month, day] = inicioCiclo.split("-").map(Number);
      const fechaFin = new Date(year, month - 1, day);

      fechaFin.setDate(fechaFin.getDate() + 7);

      return fechaFin.toISOString().split("T")[0];
    };

    const inicioCicloActual =
      createVacacioneDto.iniciocicloactual &&
      createVacacioneDto.iniciocicloactual.trim() !== ""
        ? createVacacioneDto.iniciocicloactual
        : calcularInicioCicloActual(fechaIngreso);

    const finCicloActual =
      createVacacioneDto.fincicloactual &&
      createVacacioneDto.fincicloactual.trim() !== ""
        ? createVacacioneDto.fincicloactual
        : calcularFinCicloActual(inicioCicloActual);

    const diasDerecho = Number(createVacacioneDto.diasderecho ?? 0);
    const diasTomados = Number(createVacacioneDto.diastomados ?? 0);


const calculo = this.calcularVacacionesPorFechaIngreso(
  fechaIngreso,
  diasTomados,
);

    const saldoDisponible =
      createVacacioneDto.saldodisponible !== undefined &&
      createVacacioneDto.saldodisponible !== null
        ? Number(createVacacioneDto.saldodisponible)
        : diasDerecho - diasTomados;

    const empleadoData: DeepPartial<Vacacione> = {
  idempleado,
  nombre: createVacacioneDto.nombre,
  tipoempleado: createVacacioneDto.tipoempleado,
  area: createVacacioneDto.area,
  puesto: createVacacioneDto.puesto,

  fechaingreso: this.crearFechaLocal(fechaIngreso),

  antiguedad: calculo.antiguedad,
  diasderecho: calculo.diasderecho,
  iniciocicloactual: calculo.iniciocicloactual,
  fincicloactual: calculo.fincicloactual,
  proporcionaldevengado: calculo.proporcionaldevengado,
  diastomados: diasTomados,
  saldodisponible: calculo.saldodisponible,
  diasporvencer: calculo.diasporvencer,
  diasavencer: calculo.diasavencer,
  semaforo: calculo.semaforo as any,

  accionsugerida: createVacacioneDto.accionsugerida,
};

const empleado = manager.create(Vacacione, empleadoData);

const empleadoGuardado = await manager.save(Vacacione, empleado);

    const passwordInicial = this.generarPasswordInicial(
      empleadoGuardado.idempleado,
    );

    const passwordHasheada = await bcrypt.hash(passwordInicial, 10);

    const login = manager.create(Login, {
      empleado: empleadoGuardado,
      password: passwordHasheada,
      actualizarpassword: true,
      rol: TipoRolSistema.EMPLEADO,
    });

    await manager.save(Login, login);

    return {
      message: "Empleado creado correctamente",
      empleado: empleadoGuardado,
    };
  });
}

  async importarDesdeJson(empleados: CreateVacacioneDto[]) {
  if (!empleados || empleados.length === 0) {
    throw new BadRequestException("No se recibieron empleados para importar");
  }

  let creados = 0;
  let omitidos = 0;
  const errores: string[] = [];

  for (const [index, empleado] of empleados.entries()) {
    const fila = index + 1;

    try {
      const idempleado = String(empleado.idempleado ?? "")
        .trim()
        .padStart(4, "0");

      const existe = await this.vacacionesRepository.findOne({
        where: {
          idempleado,
        },
      });

      if (existe) {
        omitidos++;
        errores.push(`Fila ${fila}: el empleado ${idempleado} ya existe`);
        continue;
      }

      await this.create({
        ...empleado,
        idempleado,
      });

      creados++;
    } catch (error) {
      omitidos++;

      console.error("ERROR IMPORTANDO FILA:", fila);
      console.error("EMPLEADO:", empleado);
      console.error("ERROR:", error);

      errores.push(
        `Fila ${fila}: no se pudo crear el empleado ${empleado.idempleado}. ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    }
  }

  return {
    message: "Importación finalizada",
    creados,
    omitidos,
    errores,
  };
}

  findAll() {
    return this.vacacionesRepository.find();
  }

  async findOne(id: number) {
    const vacaciones = await this.vacacionesRepository.findOneBy({id})
    if(!vacaciones){
      throw new NotFoundException(`No existe la solicitud de vacaciones ${id}`)
    }
    return vacaciones;
  }

  async findSolicitudesPorAsignacion(
  subrol: SubrolSistema,
  bodega: BodegaSistema,
  linea: LineaSistema,
) {
  const vacaciones = await this.vacacionesRepository.find({
    where: {
      login: {
        subrol,
        bodega,
        linea,
      },
    },
    relations: {
      solicitudes: true,
      login: true,
    },
    order: {
      nombre: "ASC",
    },
  });

  const empleadosConSolicitudes = vacaciones.filter(
    (empleado) => empleado.solicitudes && empleado.solicitudes.length > 0,
  );

  if (empleadosConSolicitudes.length === 0) {
    throw new NotFoundException(
      "No existen solicitudes de vacaciones para esa bodega y línea",
    );
  }

  return empleadosConSolicitudes;
}

  async findByArea(area:string){
    const vacaciones = await this.vacacionesRepository.find({
      where:{
        area,
      },
      relations:{
        solicitudes:true
      },
      order:{
        nombre:'ASC'
      }
    })
    if(vacaciones.length===0){
      throw new NotFoundException(`No existen solicitudes de vacaciones`)
    }
    return vacaciones
  }

  async update(id: number, updateVacacioneDto: UpdateVacacioneDto) {
    const vacaciones = await this.findOne(id)
    if(!vacaciones){
      throw new NotFoundException("Empleado no encontrado")
    }
    if(vacaciones.idempleado ==="0001" && updateVacacioneDto.idempleado && updateVacacioneDto.idempleado !== "0001"){
      throw new BadRequestException("No puedes cambiar el ID del administrador principal")
    }

     if (
    updateVacacioneDto.idempleado &&
    updateVacacioneDto.idempleado !== vacaciones.idempleado
  ) {
    const empleadoConMismoId = await this.vacacionesRepository.findOne({
      where: {
        idempleado: updateVacacioneDto.idempleado,
      },
    });

    if (empleadoConMismoId && empleadoConMismoId.id !== id) {
      throw new BadRequestException(
        `El ID empleado ${updateVacacioneDto.idempleado} ya está registrado`
      );
    }
  }

  const fechaIngreso = updateVacacioneDto.fechaingreso
  ? updateVacacioneDto.fechaingreso
  : vacaciones.fechaingreso;

const diasTomados = Number(
  updateVacacioneDto.diastomados ?? vacaciones.diastomados ?? 0,
);

const calculo = this.calcularVacacionesPorFechaIngreso(
  fechaIngreso,
  diasTomados,
);
    Object.assign(vacaciones, {
  ...updateVacacioneDto,
  fechaingreso: this.crearFechaLocal(fechaIngreso),
  antiguedad: calculo.antiguedad,
  diasderecho: calculo.diasderecho,
  iniciocicloactual: calculo.iniciocicloactual,
  fincicloactual: calculo.fincicloactual,
  proporcionaldevengado: calculo.proporcionaldevengado,
  saldodisponible: calculo.saldodisponible,
  diasporvencer: calculo.diasporvencer,
  diasavencer: calculo.diasavencer,
  semaforo: calculo.semaforo as any,
});

return await this.vacacionesRepository.save(vacaciones);
  }

  async remove(id: number) {
  return this.vacacionesRepository.manager.transaction(async (manager) => {
    const empleado = await manager.findOne(Vacacione, {
      where: { id },
    });

    if (!empleado) {
      throw new NotFoundException("Empleado no encontrado");
    }

    if(!empleado){
      throw new BadRequestException("El administrador principal no se puede eliminar")
    }

    await manager.delete(Login, {
      empleado: {
        idempleado: empleado.idempleado,
      },
    });

    await manager.delete(Solicitude, {
      empleado: {
        idempleado: empleado.idempleado,
      },
    });

    await manager.delete(Vacacione, {
      id: empleado.id,
    });

    return {
      message: "Empleado eliminado correctamente",
    };
  });
}

async recalcularTodosLosEmpleados() {
  const empleados = await this.vacacionesRepository.find();

  for (const empleado of empleados) {
    const calculo = this.calcularVacacionesPorFechaIngreso(
      empleado.fechaingreso,
      Number(empleado.diastomados ?? 0),
    );

    empleado.antiguedad = calculo.antiguedad;
    empleado.diasderecho = calculo.diasderecho;
    empleado.iniciocicloactual = calculo.iniciocicloactual;
    empleado.fincicloactual = calculo.fincicloactual;
    empleado.proporcionaldevengado = calculo.proporcionaldevengado;
    empleado.saldodisponible = calculo.saldodisponible;
    empleado.diasporvencer = calculo.diasporvencer;
    empleado.diasavencer = calculo.diasavencer;
    empleado.semaforo = calculo.semaforo as any;

    await this.vacacionesRepository.save(empleado);
  }

  return {
    message: "Vacaciones recalculadas correctamente",
    total: empleados.length,
  };
}

  async findByIdEmpleado(idempleado: string) {
  const empleado = await this.vacacionesRepository.findOne({
    where: {
      idempleado,
    },
    relations: {
      solicitudes: true,
    },
  });

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado");
  }

  return empleado;
}
async findAllEmpleadosConSolicitudes() {
  const empleados = await this.vacacionesRepository.find({
    relations: {
      solicitudes: true,
    },
    order: {
      id: "ASC",
      solicitudes: {
        id: "ASC",
      },
    },
  });

  return empleados;
}

  async importarDesdeExcel(file: any) {
    if (!file) {
      throw new BadRequestException('Debes subir un archivo Excel');
    }

    const workbook = XLSX.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
    });

    const sheetName = 'Vacaciones';
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new BadRequestException(
        `El archivo debe tener una hoja llamada "${sheetName}"`,
      );
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: null,
    });

    if (rows.length === 0) {
      throw new BadRequestException('El Excel no tiene registros');
    }

    return this.vacacionesRepository.manager.transaction(async (manager) => {
      let creados = 0;
      let omitidos = 0;
      const errores: string[] = [];

      for (const [index, row] of rows.entries()) {
        const filaExcel = index + 2;

        try {
          const idempleado = String(row.idempleado ?? '').padStart(4, '0');

          if (!idempleado || idempleado === '0000') {
            errores.push(`Fila ${filaExcel}: idempleado es obligatorio`);
            continue;
          }

          const empleadoExistente = await manager.findOne(Vacacione, {
            where: { idempleado },
          });

          if (empleadoExistente) {
            omitidos++;
            errores.push(
              `Fila ${filaExcel}: el empleado ${idempleado} ya existe`,
            );
            continue;
          }

          const createVacacioneDto: CreateVacacioneDto = {
            idempleado,
            nombre: String(row.nombre ?? '').trim(),
            tipoempleado: row.tipoempleado,
            area: String(row.area ?? '').trim(),
            puesto: String(row.puesto ?? '').trim(),
            fechaingreso: this.formatearFechaExcel(row.fechaingreso),
            antiguedad: Number(row.antiguedad ?? 0),
            diasderecho: Number(row.diasderecho ?? 0),
            iniciocicloactual: this.formatearFechaExcel(row.iniciocicloactual),
            fincicloactual: this.formatearFechaExcel(row.fincicloactual),
            proporcionaldevengado: Number(row.proporcionaldevengado ?? '0.00'),
            diastomados: Number(row.diastomados ?? 0),
            saldodisponible: Number(row.saldodisponible ?? '0.00'),
            diasporvencer: Number(row.diasporvencer ?? 0),
            diasavencer: Number(row.diasavencer ?? 0),
            semaforo: row.semaforo,
            accionsugerida: String(row.accionsugerida ?? '').trim(),
          };

          const empleado = manager.create(Vacacione, createVacacioneDto);
          const empleadoGuardado = await manager.save(Vacacione, empleado);

          const loginExistente = await manager.findOne(Login, {
            where: {
              empleado: {
                idempleado: empleadoGuardado.idempleado,
              },
            },
            relations: {
              empleado: true,
            },
          });

          if (!loginExistente) {
            const passwordInicial = this.generarPasswordInicial(
              empleadoGuardado.idempleado,
            );

            const passwordHasheada = await bcrypt.hash(passwordInicial, 10);

            const login = manager.create(Login, {
              empleado: empleadoGuardado,
              password: passwordHasheada,
              actualizarpassword: true,
              rol: TipoRolSistema.EMPLEADO,
            });

            await manager.save(Login, login);
          }

          creados++;
        } catch (error) {
          errores.push(`Fila ${filaExcel}: error al importar registro`);
        }
      }

      return {
        message: 'Importación finalizada',
        creados,
        omitidos,
        errores,
      };
    });
  }

  async findEliminadosPaginado(
  page: number = 1,
  limit: number = 5,
  idempleado?: string
) {
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: Not(IsNull()),
  };

  if (idempleado && idempleado.trim() !== "") {
    where.idempleado = idempleado.trim();
  }

  const [data, total] = await this.vacacionesRepository.findAndCount({
    withDeleted: true,
    where,
    skip,
    take: limit,
    order: {
      deletedAt: "DESC",
    },
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

  async softDelete(id:number){
    const empleado = await this.vacacionesRepository.findOne({
      where:{id}
    })
    if(!empleado){
      throw new NotFoundException("Empleado no encontrado")
    }
    if(empleado.idempleado==="0001"){
      throw new ForbiddenException("El usuario administrador principal no se puede eliminar")
    }
    await this.vacacionesRepository.softDelete(id)
    return{
      message:"Empleado eliminado correctamente"
    }
  }

  private formatearFechaExcel(value: any): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'number') {
      const excelDate = XLSX.SSF.parse_date_code(value);

      if (!excelDate) {
        return '';
      }

      const year = excelDate.y;
      const month = String(excelDate.m).padStart(2, '0');
      const day = String(excelDate.d).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }

    return String(value);
  }


  async findDetalleEmpleadoConLogin(id: number) {
  const empleado = await this.vacacionesRepository.findOne({
    where: { id },
    relations: {
      solicitudes: true,
    },
  });

  if (!empleado) {
    throw new NotFoundException("Empleado no encontrado");
  }

  const login = await this.loginRepository.findOne({
    where: {
      empleado: {
        idempleado: empleado.idempleado,
      },
    },
    relations: {
      empleado: true,
    },
  });

  return {
    empleado,
    login: login
      ? {
          id: login.id,
          idempleado: empleado.idempleado,
          rol: login.rol,
          actualizarpassword: login.actualizarpassword,
          passwordInicial: `Empleado${empleado.idempleado}`,
        }
      : null,
  };
}
  

  

}
