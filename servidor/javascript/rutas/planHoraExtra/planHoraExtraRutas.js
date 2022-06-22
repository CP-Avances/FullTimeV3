"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const planHoraExtraControlador_1 = __importDefault(require("../../controlador/planHoraExtra/planHoraExtraControlador"));
const verificarHoraExtra_1 = require("../../libs/Modulos/verificarHoraExtra");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/planificaciones', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanificacion);
        this.router.get('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtra);
        this.router.put('/planificacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarPlanHoraExtra);
        this.router.get('/id_plan_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.EncontrarUltimoPlan);
        this.router.get('/justificar', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraObserva);
        this.router.get('/autorizacion', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraAutorizada);
        this.router.put('/tiempo-autorizado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.TiempoAutorizado);
        this.router.put('/observacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarObservacion);
        this.router.put('/estado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarEstado);
        this.router.post('/send/aviso/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.EnviarCorreoNotificacion);
        this.router.get('/datosAutorizacion/:id_plan_extra', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ObtenerDatosAutorizacion);
        // TABLA plan_hora_extra_empleado
        this.router.get('/plan_empleado/:id_plan_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanEmpleados);
        /** ******************************************************************************************************* **
         ** **                               PLANIFICACION DE HORAS EXTRAS                                       ** **
         ** ******************************************************************************************************* **/
        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtra);
        /** ***************************************************************************************************** **
         ** **                           PLANIFICACION DE HORAS EXTRAS POR USUARIO                             ** **
         ** ***************************************************************************************************** **/
        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS POR USUARIO
        this.router.post('/hora_extra_empleado', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtraEmpleado);
        /** ******************************************************************************************** **
         ** *             ENVIO DE CORREO ELECTRONICO DE PLANIFICACIONES DE HORAS EXTRAS               * **
         ** ******************************************************************************************** **/
        // CREACIÓN DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/send/correo-planifica/', [verificarToken_1.TokenValidation], planHoraExtraControlador_1.default.EnviarCorreoPlanificacion);
        /** ******************************************************************************************** **
         ** *                   NOTIFICACIONES DE PLANIFICACIÓN DE HORAS EXTRAS                       ** **
         ** ******************************************************************************************** **/
        // CREACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS
        this.router.post('/send/noti-planifica', verificarToken_1.TokenValidation, planHoraExtraControlador_1.default.EnviarNotiPlanHE);
    }
}
const PLAN_HORA_EXTRA_RUTAS = new DepartamentoRutas();
exports.default = PLAN_HORA_EXTRA_RUTAS.router;
