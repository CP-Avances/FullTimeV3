import { Router } from 'express';
import EMPLEADO_HORARIOS_CONTROLADOR from '../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador';
import { TokenValidation } from '../../../libs/verificarToken'

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class EmpleadoHorariosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ListarEmpleadoHorarios);
        this.router.post('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.CrearEmpleadoHorarios);
        this.router.get('/horarioCargo/:id_empl_cargo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ListarHorarioCargo);

        this.router.post('/cargaMultiple', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CargarMultiplesHorariosEmpleadosPlantilla);
        this.router.post('/horas', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerNumeroHoras);
        this.router.put('/', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ActualizarEmpleadoHorarios);
        this.router.delete('/eliminar/:id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.EliminarRegistros);
        this.router.post('/fechas_horario/:id_empleado', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.ObtenerHorariosEmpleadoFechas);
        this.router.post('/validarFechas/:empl_id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarFechasHorario);
        this.router.post('/validarFechas/horarioEmpleado/:id/empleado/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarFechasHorarioEdicion);

        this.router.post('/busqueda-horarios/:codigo', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.BuscarHorariosFechas);

        this.router.post('/horarios-existentes/:empl_id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentes);
        this.router.post('/horarios-existentes-edicion/:empl_id', TokenValidation, EMPLEADO_HORARIOS_CONTROLADOR.VerificarHorariosExistentesEdicion);

        // Verificar datos de la plantilla del horario de un empleado
        this.router.post('/revisarData/:id', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.VerificarDatos_PlantillaEmpleado_Horario);
        this.router.post('/verificarPlantilla/upload', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CrearPlanificacionGeneral);
        this.router.post('/upload/:id/:codigo', [TokenValidation, multipartMiddleware], EMPLEADO_HORARIOS_CONTROLADOR.CrearHorarioEmpleadoPlantilla);
    }
}

const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();

export default EMPLEADO_HORARIOS_RUTAS.router;