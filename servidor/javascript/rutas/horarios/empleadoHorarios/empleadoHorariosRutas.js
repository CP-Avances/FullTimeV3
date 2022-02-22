"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empleadoHorariosControlador_1 = __importDefault(require("../../../controlador/horarios/empleadoHorarios/empleadoHorariosControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class EmpleadoHorariosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ListarEmpleadoHorarios);
        this.router.post('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.CrearEmpleadoHorarios);
        this.router.get('/horarioCargo/:id_empl_cargo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ListarHorarioCargo);
        this.router.post('/cargaMultiple', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CargarMultiplesHorariosEmpleadosPlantilla);
        this.router.post('/horas', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerNumeroHoras);
        this.router.put('/', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ActualizarEmpleadoHorarios);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.EliminarRegistros);
        this.router.post('/fechas_horario/:id_empleado', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.ObtenerHorariosEmpleadoFechas);
        this.router.post('/validarFechas/:empl_id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarFechasHorario);
        this.router.post('/validarFechas/horarioEmpleado/:id/empleado/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarFechasHorarioEdicion);
        this.router.post('/busqueda-horarios/:codigo', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.BuscarHorariosFechas);
        this.router.post('/horarios-existentes/:empl_id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarHorariosExistentes);
        this.router.post('/horarios-existentes-edicion/:empl_id', verificarToken_1.TokenValidation, empleadoHorariosControlador_1.default.VerificarHorariosExistentesEdicion);
        // Verificar datos de la plantilla del horario de un empleado
        this.router.post('/revisarData/:id', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.VerificarDatos_PlantillaEmpleado_Horario);
        this.router.post('/verificarPlantilla/upload', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.VerificarPlantilla_HorarioEmpleado);
        this.router.post('/plan_general/upload/:id/:codigo', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CrearPlanificacionGeneral);
        this.router.post('/upload/:id/:codigo', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoHorariosControlador_1.default.CrearHorarioEmpleadoPlantilla);
    }
}
const EMPLEADO_HORARIOS_RUTAS = new EmpleadoHorariosRutas();
exports.default = EMPLEADO_HORARIOS_RUTAS.router;
