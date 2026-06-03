import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  ParseIntPipe,
} from "@nestjs/common";

import { VacacionesService } from "./vacaciones.service";
import { CreateVacacioneDto } from "./dto/create-vacacione.dto";
import { UpdateVacacioneDto } from "./dto/update-vacacione.dto";
import { JwtAuthGuard } from "../login/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import {
  BodegaSistema,
  LineaSistema,
  SubrolSistema,
} from "../login/entities/login.entity";

const ejemploEmpleado = {
  id: 4,
  idempleado: "0004",
  nombre: "Diego Trejo",
  tipoempleado: "SEMANAL",
  area: "SISTEMAS",
  puesto: "DESARROLLADOR",
  fechaingreso: "2021-04-28",
  antiguedad: 5,
  diasderecho: 12,
  iniciocicloactual: "2026-01-01",
  fincicloactual: "2026-12-31",
  proporcionaldevengado: "3.18",
  diastomados: 0,
  saldodisponible: "7.00",
  diasporvencer: 0,
  diasavencer: 0,
  semaforo: "CONTROLADO",
  accionsugerida: "Revisar con RH si el saldo está próximo a vencer.",
};

@ApiTags("Vacaciones")
@Controller("vacaciones")
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch("recalcular-ciclos")
  @ApiOperation({
    summary: "Recalcular ciclos de vacaciones",
    description:
      "Recalcula antigüedad, días de derecho, inicio de ciclo, fin de ciclo, proporcional devengado, saldo disponible, días por vencer, días a vencer y semáforo de todos los empleados.",
  })
  @ApiResponse({
    status: 200,
    description: "Vacaciones recalculadas correctamente",
    schema: {
      example: {
        message: "Vacaciones recalculadas correctamente",
        total: 40,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  recalcularCiclos() {
    return this.vacacionesService.recalcularTodosLosEmpleados();
  }

  @Get("empleado/:idempleado")
  @ApiOperation({
    summary: "Buscar empleado por número de empleado",
    description:
      "Obtiene la información de vacaciones de un empleado usando su número de empleado.",
  })
  @ApiParam({
    name: "idempleado",
    example: "0004",
    description: "Número de empleado de 4 dígitos",
  })
  @ApiResponse({
    status: 200,
    description: "Empleado encontrado correctamente",
    schema: {
      example: ejemploEmpleado,
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  findByIdEmpleado(@Param("idempleado") idempleado: string) {
    return this.vacacionesService.findByIdEmpleado(idempleado);
  }

  @Get("detalle/:id")
  @ApiOperation({
    summary: "Obtener detalle de empleado con login",
    description:
      "Obtiene información del empleado junto con su usuario/login del sistema.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Detalle del empleado obtenido correctamente",
    schema: {
      example: {
        empleado: ejemploEmpleado,
        login: {
          id: 4,
          idempleado: "0004",
          rol: "EMPLEADO",
          subrol: "MAESTRA",
          bodega: "B1",
          linea: "L1",
          actualizarpassword: true,
          passwordInicial: "Empleado0004",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  findDetalleEmpleadoConLogin(@Param("id", ParseIntPipe) id: number) {
    return this.vacacionesService.findDetalleEmpleadoConLogin(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get("eliminados/paginado")
  @ApiOperation({
    summary: "Listar empleados eliminados paginados",
    description:
      "Obtiene empleados eliminados lógicamente mediante soft delete. Permite paginar y buscar por número de empleado.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Número de página",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 5,
    description: "Cantidad de registros por página",
  })
  @ApiQuery({
    name: "idempleado",
    required: false,
    example: "0004",
    description: "Filtro opcional por número de empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Listado de empleados eliminados obtenido correctamente",
    schema: {
      example: {
        data: [
          {
            ...ejemploEmpleado,
            deletedAt: "2026-06-02T17:00:00.000Z",
          },
        ],
        meta: {
          page: 1,
          limit: 5,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  findEliminadosPaginado(
    @Query("page") page = "1",
    @Query("limit") limit = "5",
    @Query("idempleado") idempleado?: string,
  ) {
    return this.vacacionesService.findEliminadosPaginado(
      Number(page),
      Number(limit),
      idempleado,
    );
  }

  @Get("paginado")
  @ApiOperation({
    summary: "Listar empleados paginados",
    description:
      "Obtiene empleados de vacaciones con paginación y búsqueda opcional por número de empleado.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    example: 1,
    description: "Número de página",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    example: 5,
    description: "Cantidad de registros por página",
  })
  @ApiQuery({
    name: "idempleado",
    required: false,
    example: "0004",
    description: "Filtro opcional por número de empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Listado paginado obtenido correctamente",
    schema: {
      example: {
        data: [
          ejemploEmpleado,
          {
            id: 5,
            idempleado: "0005",
            nombre: "Juan Pérez",
            tipoempleado: "QUINCENAL",
            area: "PRODUCCION",
            puesto: "OPERADOR",
            fechaingreso: "2020-03-15",
            antiguedad: 6,
            diasderecho: 14,
            iniciocicloactual: "2026-01-01",
            fincicloactual: "2026-12-31",
            proporcionaldevengado: "4.20",
            diastomados: 2,
            saldodisponible: "12.00",
            diasporvencer: 0,
            diasavencer: 0,
            semaforo: "CONTROLADO",
            accionsugerida: null,
          },
        ],
        meta: {
          page: 1,
          limit: 5,
          total: 40,
          totalPages: 8,
        },
      },
    },
  })
  findAllPaginado(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("idempleado") idempleado?: string,
  ) {
    return this.vacacionesService.findAllPaginado(
      Number(page) || 1,
      Number(limit) || 10,
      idempleado,
    );
  }

  @Get("empleados")
  @ApiOperation({
    summary: "Listar empleados con solicitudes",
    description:
      "Obtiene todos los empleados junto con sus solicitudes de vacaciones.",
  })
  @ApiResponse({
    status: 200,
    description: "Empleados con solicitudes obtenidos correctamente",
    schema: {
      example: [
        {
          ...ejemploEmpleado,
          solicitudes: [
            {
              id: 1,
              fechainicio: "2026-04-29",
              fechatermino: "2026-05-08",
              diastotales: 8,
              estatus: "PENDIENTE",
              motivorechazo: null,
            },
          ],
        },
      ],
    },
  })
  findAllEmpleadosConSolicitudes() {
    return this.vacacionesService.findAllEmpleadosConSolicitudes();
  }

  @Post("importar-excel")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Importar empleados desde Excel",
    description:
      "Permite subir un archivo Excel para importar empleados de vacaciones.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Archivo importado correctamente",
    schema: {
      example: {
        message: "Importación finalizada",
        creados: 10,
        omitidos: 2,
        errores: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Archivo inválido",
    schema: {
      example: {
        statusCode: 400,
        message: 'El archivo debe tener una hoja llamada "Vacaciones"',
        error: "Bad Request",
      },
    },
  })
  importarExcel(@UploadedFile() file: any) {
    return this.vacacionesService.importarDesdeExcel(file);
  }

  @Get("area/:area")
  @ApiOperation({
    summary: "Buscar empleados por área",
    description: "Obtiene empleados filtrados por área.",
  })
  @ApiParam({
    name: "area",
    example: "SISTEMAS",
    description: "Nombre del área",
  })
  @ApiResponse({
    status: 200,
    description: "Empleados del área obtenidos correctamente",
    schema: {
      example: [
        ejemploEmpleado,
        {
          id: 7,
          idempleado: "0007",
          nombre: "Ana López",
          tipoempleado: "SEMANAL",
          area: "SISTEMAS",
          puesto: "SOPORTE TECNICO",
          fechaingreso: "2022-02-10",
          antiguedad: 4,
          diasderecho: 12,
          iniciocicloactual: "2026-01-01",
          fincicloactual: "2026-12-31",
          proporcionaldevengado: "3.18",
          diastomados: 0,
          saldodisponible: "12.00",
          diasporvencer: 0,
          diasavencer: 0,
          semaforo: "CONTROLADO",
          accionsugerida: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: "No existen empleados o solicitudes para esa área",
    schema: {
      example: {
        statusCode: 404,
        message: "No existen solicitudes de vacaciones",
        error: "Not Found",
      },
    },
  })
  findByArea(@Param("area") area: string) {
    return this.vacacionesService.findByArea(area);
  }

  @Get("autorizacion")
  @ApiOperation({
    summary: "Buscar solicitudes por subrol, bodega y línea",
    description:
      "Obtiene empleados con solicitudes filtrando por subrol, bodega y línea desde la tabla login.",
  })
  @ApiQuery({
    name: "subrol",
    required: true,
    enum: SubrolSistema,
    example: "EMPLEADO",
    description: "Subrol a buscar: EMPLEADO o MAESTRA",
  })
  @ApiQuery({
    name: "bodega",
    required: true,
    enum: BodegaSistema,
    example: "B1",
    description: "Bodega asignada",
  })
  @ApiQuery({
    name: "linea",
    required: true,
    enum: LineaSistema,
    example: "L1",
    description: "Línea asignada",
  })
  @ApiResponse({
    status: 200,
    description: "Solicitudes encontradas correctamente",
    schema: {
      example: [
        {
          ...ejemploEmpleado,
          login: {
            id: 4,
            rol: "EMPLEADO",
            subrol: "EMPLEADO",
            bodega: "B1",
            linea: "L1",
          },
          solicitudes: [
            {
              id: 24,
              fechainicio: "2026-07-07",
              fechatermino: "2026-07-08",
              diastotales: 2,
              estatus: "PENDIENTE",
              motivorechazo: null,
            },
          ],
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: "No existen solicitudes para esa bodega y línea",
    schema: {
      example: {
        statusCode: 404,
        message: "No existen solicitudes de vacaciones para esa bodega y línea",
        error: "Not Found",
      },
    },
  })
  findSolicitudesPorAsignacion(
    @Query("subrol") subrol: SubrolSistema,
    @Query("bodega") bodega: BodegaSistema,
    @Query("linea") linea: LineaSistema,
  ) {
    return this.vacacionesService.findSolicitudesPorAsignacion(
      subrol,
      bodega,
      linea,
    );
  }

  @Post()
  @ApiOperation({
    summary: "Crear empleado de vacaciones",
    description:
      "Crea un nuevo registro de vacaciones para un empleado. También crea su login inicial.",
  })
  @ApiBody({
    type: CreateVacacioneDto,
    examples: {
      empleadoSemanal: {
        summary: "Empleado semanal",
        value: {
          idempleado: "0004",
          nombre: "Diego Trejo",
          tipoempleado: "SEMANAL",
          area: "SISTEMAS",
          puesto: "DESARROLLADOR",
          fechaingreso: "2021-04-28",
          antiguedad: 5,
          diasderecho: 12,
          iniciocicloactual: "2026-01-01",
          fincicloactual: "2026-12-31",
          proporcionaldevengado: 3.18,
          diastomados: 0,
          saldodisponible: 7.0,
          diasporvencer: 0,
          diasavencer: 0,
          semaforo: "CONTROLADO",
          accionsugerida:
            "Revisar con RH si el saldo está próximo a vencer.",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Empleado creado correctamente",
    schema: {
      example: {
        message: "Empleado creado correctamente",
        empleado: ejemploEmpleado,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o empleado duplicado",
    schema: {
      example: {
        statusCode: 400,
        message: "Ya existe un empleado con el número 0004",
        error: "Bad Request",
      },
    },
  })
  create(@Body() createVacacioneDto: CreateVacacioneDto) {
    return this.vacacionesService.create(createVacacioneDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({
    summary: "Listar todos los empleados",
    description: "Obtiene todos los empleados. Requiere token JWT.",
  })
  @ApiResponse({
    status: 200,
    description: "Listado obtenido correctamente",
    schema: {
      example: [
        ejemploEmpleado,
        {
          id: 5,
          idempleado: "0005",
          nombre: "Juan Pérez",
          tipoempleado: "QUINCENAL",
          area: "PRODUCCION",
          puesto: "OPERADOR",
          fechaingreso: "2020-03-15",
          antiguedad: 6,
          diasderecho: 14,
          iniciocicloactual: "2026-01-01",
          fincicloactual: "2026-12-31",
          proporcionaldevengado: "4.20",
          diastomados: 2,
          saldodisponible: "12.00",
          diasporvencer: 0,
          diasavencer: 0,
          semaforo: "CONTROLADO",
          accionsugerida: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  findAll() {
    return this.vacacionesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @ApiOperation({
    summary: "Buscar empleado por ID",
    description: "Obtiene un empleado por su ID interno. Requiere token JWT.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Empleado encontrado correctamente",
    schema: {
      example: ejemploEmpleado,
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "No existe la solicitud de vacaciones 4",
        error: "Not Found",
      },
    },
  })
  findOne(@Param("id") id: string) {
    return this.vacacionesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @ApiOperation({
    summary: "Actualizar empleado",
    description:
      "Actualiza la información de vacaciones de un empleado. Requiere token JWT.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado",
  })
  @ApiBody({
    type: UpdateVacacioneDto,
    examples: {
      actualizarDias: {
        summary: "Actualizar días y semáforo",
        value: {
          diasderecho: 14,
          diastomados: 2,
          saldodisponible: 12.0,
          semaforo: "CONTROLADO",
          accionsugerida: "Empleado actualizado correctamente.",
        },
      },
      actualizarAreaPuesto: {
        summary: "Actualizar área y puesto",
        value: {
          area: "PRODUCCION",
          puesto: "OPERADOR",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Empleado actualizado correctamente",
    schema: {
      example: {
        message: "Empleado actualizado correctamente",
        empleado: {
          ...ejemploEmpleado,
          diasderecho: 14,
          diastomados: 2,
          saldodisponible: "12.00",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  update(
    @Param("id") id: string,
    @Body() updateVacacioneDto: UpdateVacacioneDto,
  ) {
    return this.vacacionesService.update(+id, updateVacacioneDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id/soft")
  @ApiOperation({
    summary: "Eliminar empleado lógicamente",
    description:
      "Realiza un soft delete del empleado. El registro no se elimina físicamente, solo queda marcado como eliminado.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Empleado eliminado correctamente",
    schema: {
      example: {
        message: "Empleado eliminado correctamente",
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "No permitido",
    schema: {
      example: {
        statusCode: 403,
        message: "El usuario administrador principal no se puede eliminar",
        error: "Forbidden",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  softDelete(@Param("id") id: string) {
    return this.vacacionesService.softDelete(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id/restore")
  @ApiOperation({
    summary: "Restaurar empleado eliminado",
    description:
      "Restaura un empleado eliminado lógicamente mediante soft delete.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado eliminado",
  })
  @ApiResponse({
    status: 200,
    description: "Empleado restaurado correctamente",
    schema: {
      example: {
        message: "Empleado restaurado correctamente",
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "El empleado no está eliminado",
    schema: {
      example: {
        statusCode: 400,
        message: "El empleado no está eliminado",
        error: "Bad Request",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  restore(@Param("id") id: string) {
    return this.vacacionesService.restore(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  @ApiOperation({
    summary: "Eliminar empleado permanentemente",
    description:
      "Elimina un empleado por ID junto con su login y solicitudes relacionadas. Requiere token JWT.",
  })
  @ApiParam({
    name: "id",
    example: 4,
    description: "ID interno del empleado",
  })
  @ApiResponse({
    status: 200,
    description: "Empleado eliminado correctamente",
    schema: {
      example: {
        message: "Empleado eliminado correctamente",
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
    schema: {
      example: {
        statusCode: 401,
        message: "Unauthorized",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Empleado no encontrado",
    schema: {
      example: {
        statusCode: 404,
        message: "Empleado no encontrado",
        error: "Not Found",
      },
    },
  })
  remove(@Param("id") id: string) {
    return this.vacacionesService.remove(+id);
  }

  @Post("importar-json")
  @ApiOperation({
    summary: "Importar empleados desde JSON",
    description:
      "Recibe un arreglo de empleados en formato JSON y los importa a la base de datos.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        empleados: {
          type: "array",
          items: {
            $ref: "#/components/schemas/CreateVacacioneDto",
          },
        },
      },
      required: ["empleados"],
    },
    examples: {
      importacionBasica: {
        summary: "Importar dos empleados",
        value: {
          empleados: [
            {
              idempleado: "0004",
              nombre: "Diego Trejo",
              tipoempleado: "SEMANAL",
              area: "SISTEMAS",
              puesto: "DESARROLLADOR",
              fechaingreso: "2021-04-28",
              antiguedad: 5,
              diasderecho: 12,
              iniciocicloactual: "2026-01-01",
              fincicloactual: "2026-12-31",
              proporcionaldevengado: 3.18,
              diastomados: 0,
              saldodisponible: 7.0,
              diasporvencer: 0,
              diasavencer: 0,
              semaforo: "CONTROLADO",
              accionsugerida:
                "Revisar con RH si el saldo está próximo a vencer.",
            },
            {
              idempleado: "0005",
              nombre: "Juan Pérez",
              tipoempleado: "QUINCENAL",
              area: "PRODUCCION",
              puesto: "OPERADOR",
              fechaingreso: "2020-03-15",
              antiguedad: 6,
              diasderecho: 14,
              iniciocicloactual: "2026-01-01",
              fincicloactual: "2026-12-31",
              proporcionaldevengado: 4.2,
              diastomados: 2,
              saldodisponible: 12.0,
              diasporvencer: 0,
              diasavencer: 0,
              semaforo: "CONTROLADO",
              accionsugerida: null,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Empleados importados correctamente",
    schema: {
      example: {
        message: "Importación finalizada",
        creados: 2,
        omitidos: 0,
        errores: [],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos",
    schema: {
      example: {
        statusCode: 400,
        message: "No se recibieron empleados para importar",
        error: "Bad Request",
      },
    },
  })
  importarJson(@Body() body: { empleados: CreateVacacioneDto[] }) {
    return this.vacacionesService.importarDesdeJson(body.empleados);
  }
}