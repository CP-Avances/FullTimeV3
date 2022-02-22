"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const planComidasControlador_1 = __importDefault(require("../../controlador/planComidas/planComidasControlador"));
class DepartamentoRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        /** SOLICITUD DE ALIMENTACIÓN */
        this.router.post('/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearSolicitaComida);
        this.router.put('/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarSolicitaComida);
        this.router.put('/solicitud/estado', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarEstadoSolicitaComida);
        this.router.get('/infoComida/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaIdEmpleado);
        this.router.get('/infoComida/estado/aprobado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaAprobada);
        this.router.get('/infoComida/estado/negado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaNull);
        this.router.get('/infoComida/estado/expirada', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarSolicitaComidaExpirada);
        /** CONOCER JEFES DE UN DEPARTAMENTO */
        this.router.get('/enviar/notificacion/:id_departamento', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarJefes);
        this.router.post('/mail-noti/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoComidas);
        this.router.post('/mail-noti/eliminar-sol', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoEliminarSolComidas);
        /** PLANIFICACIÓN DE ALIMENTACIÓN */
        this.router.get('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.ListarPlanComidas);
        this.router.post('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearPlanComidas);
        this.router.get('/fin_registro', verificarToken_1.TokenValidation, planComidasControlador_1.default.ObtenerUltimaPlanificacion);
        this.router.get('/infoComida/plan/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaIdEmpleado);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarRegistros);
        this.router.put('/', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarPlanComidas);
        /** REGISTRO DE LA PLANIFICACIÓN DE ALIMENTACIÓN AL EMPLEADO */
        this.router.post('/empleado/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearPlanEmpleado);
        this.router.post('/empleado/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearSolEmpleado);
        this.router.post('/duplicidad/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/solicitud', verificarToken_1.TokenValidation, planComidasControlador_1.default.BuscarSolEmpleadoFechasActualizar);
        this.router.post('/mail-plan/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoPlanComidas);
        this.router.post('/mail-plan/eliminar-plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoEliminaPlanComidas);
        this.router.post('/mail-solicita/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoEstadoSolComidas);
        this.router.post('/mail-solicitud/actualizacion', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarCorreoActualizaSolComidas);
        this.router.delete('/eliminar/plan-solicitud/:id/:fecha/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarSolComidaEmpleado);
        this.router.post('/duplicidad/actualizar/plan', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/actualizar/sol', verificarToken_1.TokenValidation, planComidasControlador_1.default.ActualizarSolComidaEmpleadoFechas);
        this.router.delete('/eliminar/plan-comida/:id/:id_empleado', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarPlanComidaEmpleado);
        this.router.delete('/eliminar/sol-comida/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EliminarRegistroSolicitudComida);
        this.router.post('/empleado/plan/consumido', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaEmpleadoConsumido);
        this.router.get('/comida-empleado/plan/:id', verificarToken_1.TokenValidation, planComidasControlador_1.default.EncontrarPlanComidaIdPlan);
        // Registrar en tabla tipo_comida
        this.router.post('/tipo_comida', verificarToken_1.TokenValidation, planComidasControlador_1.default.CrearTipoComidas);
        this.router.get('/tipo_comida', verificarToken_1.TokenValidation, planComidasControlador_1.default.ListarTipoComidas);
        this.router.get('/tipo_comida/ultimo', verificarToken_1.TokenValidation, planComidasControlador_1.default.VerUltimoTipoComidas);
        this.router.post('/send/planifica/', verificarToken_1.TokenValidation, planComidasControlador_1.default.EnviarNotificacionPlanComida);
    }
}
const PLAN_COMIDAS_RUTAS = new DepartamentoRutas();
exports.default = PLAN_COMIDAS_RUTAS.router;
