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
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/planificaciones', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanificacion);
        this.router.get('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtra);
        this.router.put('/planificacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarPlanHoraExtra);
        this.router.get('/id_plan_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.EncontrarUltimoPlan);
        this.router.get('/justificar', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraObserva);
        this.router.get('/autorizacion', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanHoraExtraAutorizada);
        this.router.post('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtra);
        this.router.put('/tiempo-autorizado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.TiempoAutorizado);
        this.router.put('/observacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarObservacion);
        this.router.put('/estado/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ActualizarEstado);
        this.router.post('/send/aviso/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.EnviarCorreoNotificacion);
        this.router.post('/send/planifica/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.EnviarCorreoPlanificacion);
        this.router.get('/datosAutorizacion/:id_plan_extra', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ObtenerDatosAutorizacion);
        // TABLA plan_hora_extra_empleado
        this.router.post('/hora_extra_empleado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.CrearPlanHoraExtraEmpleado);
        this.router.get('/plan_empleado/:id_plan_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], planHoraExtraControlador_1.default.ListarPlanEmpleados);
    }
}
const PLAN_HORA_EXTRA_RUTAS = new DepartamentoRutas();
exports.default = PLAN_HORA_EXTRA_RUTAS.router;
