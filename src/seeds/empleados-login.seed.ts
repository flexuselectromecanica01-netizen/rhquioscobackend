import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import {
  Vacacione,
  TipoEmpleadoEnum,
  SemaforoEnum,
} from "../vacaciones/entities/vacacione.entity";
import {
  Login,
  TipoRolSistema,
} from "../login/entities/login.entity";



const nombres = [
  "Diego Trejo",
  "Juan Pérez",
  "María López",
  "Carlos Ramírez",
  "Ana Torres",
  "Roberto García",
  "Laura Méndez",
  "Fernanda Ruiz",
  "Miguel Hernández",
  "Sofía Martínez",
];


const areas = [
  "TI",
  "RH",
  "FINANZAS",
  "PRODUCCION",
  "VENTAS",
  "ALMACEN",
];



const puestos = [
  "Desarrollador",
  "Auxiliar RH",
  "Contador",
  "Supervisor",
  "Analista",
  "Operador",
  "Coordinador",
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarIdEmpleado(index: number): string {
  return String(index).padStart(4, "0");
}

function generarFechaIngreso(): Date {
  const year = randomInt(2018, 2025);
  const month = randomInt(0, 11);
  const day = randomInt(1, 28);

  return new Date(year, month, day);
}


function calcularAntiguedad(fechaIngreso: Date): number {
  const hoy = new Date();

  let antiguedad = hoy.getFullYear() - fechaIngreso.getFullYear();

  const mesActual = hoy.getMonth();
  const mesIngreso = fechaIngreso.getMonth();

  if (
    mesActual < mesIngreso ||
    (mesActual === mesIngreso && hoy.getDate() < fechaIngreso.getDate())
  ) {
    antiguedad--;
  }

  return antiguedad < 0 ? 0 : antiguedad;
}


function calcularDiasDerecho(antiguedad: number): number {
  if (antiguedad <= 0) return 12;
  if (antiguedad === 1) return 12;
  if (antiguedad === 2) return 14;
  if (antiguedad === 3) return 16;
  if (antiguedad === 4) return 18;
  if (antiguedad === 5) return 20;

  return 22;
}


function calcularSemaforo(saldoDisponible: number): SemaforoEnum {
  if (saldoDisponible <= 0) return SemaforoEnum.SINSALDO;
  if (saldoDisponible <= 3) return SemaforoEnum.ATENCION;

  return SemaforoEnum.CONTROLADO;
}

function accionSugerida(semaforo: SemaforoEnum): string {
  switch (semaforo) {
    case SemaforoEnum.SINSALDO:
      return "Revisar con RH porque el saldo disponible está en cero o negativo.";

    case SemaforoEnum.ATENCION:
      return "Sugerir al empleado programar vacaciones pronto.";

    case SemaforoEnum.CONTROLADO:
      return "Sin acción urgente.";

    default:
      return "Sin acción sugerida.";
  }
}

export async function seedEmpleadosLogin(dataSource: DataSource) {
  const vacacionesRepository = dataSource.getRepository(Vacacione);
  const loginRepository = dataSource.getRepository(Login);

  const passwordHasheada = await bcrypt.hash("Password123", 10);

  let empleadosInsertados = 0;
  let loginsInsertados = 0;

  for (let i = 1; i <= 40; i++) {
    const idempleado = generarIdEmpleado(i);

    let empleado = await vacacionesRepository.findOne({
      where: {
        idempleado,
      },
    });

    if (!empleado) {
      const fechaIngreso = generarFechaIngreso();
      const antiguedad = calcularAntiguedad(fechaIngreso);
      const diasDerecho = calcularDiasDerecho(antiguedad);
      const diasTomados = randomInt(0, diasDerecho);
      const saldoDisponible = diasDerecho - diasTomados;
      const semaforo = calcularSemaforo(saldoDisponible);

      empleado = vacacionesRepository.create({
        idempleado,
        nombre: randomItem(nombres),
        tipoempleado: randomItem([
          TipoEmpleadoEnum.SEMANAL,
          TipoEmpleadoEnum.QUINCENAL,
        ]),
        area: randomItem(areas),
        puesto: randomItem(puestos),
        fechaingreso: fechaIngreso,
        antiguedad,
        diasderecho: diasDerecho,
        iniciocicloactual: new Date("2026-01-01"),
        fincicloactual: new Date("2026-12-31"),
        proporcionaldevengado: Number((Math.random() * diasDerecho).toFixed(2)),
        diastomados: diasTomados,
        saldodisponible: saldoDisponible,
        diasporvencer: randomInt(0, 5),
        diasavencer: randomInt(0, 5),
        semaforo,
        accionsugerida: accionSugerida(semaforo),
      });

      empleado = await vacacionesRepository.save(empleado);
      empleadosInsertados++;
    }

    const loginExistente = await loginRepository.findOne({
      where: {
        empleado: {
          idempleado,
        },
      },
      relations: {
        empleado: true,
      },
    });

    if (!loginExistente) {
      const login = loginRepository.create({
        empleado,
        password: passwordHasheada,
        actualizarpassword: true,
        rol: TipoRolSistema.EMPLEADO,
      });

      await loginRepository.save(login);
      loginsInsertados++;
    }
  }

  console.log(`Empleados insertados: ${empleadosInsertados}`);
  console.log(`Logins insertados: ${loginsInsertados}`);
  console.log("Contraseña default: Password123");
}