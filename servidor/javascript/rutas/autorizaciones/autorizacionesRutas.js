"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const autorizacionesControlador_1 = __importDefault(require("../../controlador/autorizaciones/autorizacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ListarAutorizaciones);
        this.router.get('/by-permiso/:id_permiso', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ObtenerAutorizacionByPermiso);
        this.router.get('/by-vacacion/:id_vacacion', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ObtenerAutorizacionByVacacion);
        this.router.get('/by-hora-extra/:id_hora_extra', autorizacionesControlador_1.default.ObtenerAutorizacionByHoraExtra);
        this.router.post('/', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.CrearAutorizacion);
        this.router.put('/:id/estado-permiso', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoPermiso);
        this.router.put('/estado-permiso/multiple', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoAutorizacionPermiso);
        this.router.put('/estado-vacacion', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoVacacion);
        this.router.put('/:id_hora_extra/estado-hora-extra', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoHoraExtra);
        this.router.put('/:id_plan_hora_extra/estado-plan-hora-extra', verificarToken_1.TokenValidation, autorizacionesControlador_1.default.ActualizarEstadoPlanificacion);
    }
}
const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = AUTORIZA_DEPARTAMENTO_RUTAS.router;
