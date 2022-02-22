"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const vacacionesControlador_1 = __importDefault(require("../../controlador/vacaciones/vacacionesControlador"));
class VacacionesRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacaciones);
        this.router.get('/estado-solicitud', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacacionesAutorizadas);
        this.router.get('/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.VacacionesIdPeriodo);
        this.router.get('/listar/vacacion/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarVacacionId);
        this.router.get('/one/:id', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ListarUnaVacacion);
        this.router.post('/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.CrearVacaciones);
        this.router.post('/fechasFeriado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerFechasFeriado);
        this.router.post('/mail-noti/', verificarToken_1.TokenValidation, vacacionesControlador_1.default.SendMailNotifiPermiso);
        this.router.put('/:id/estado', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ActualizarEstado);
        this.router.put('/:id/vacacion-solicitada', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EditarVacaciones);
        this.router.get('/datosSolicitud/:id_emple_vacacion', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerSolicitudVacaciones);
        this.router.get('/datosAutorizacion/:id_vacaciones', verificarToken_1.TokenValidation, vacacionesControlador_1.default.ObtenerAutorizacionVacaciones);
        this.router.delete('/eliminar/:id_vacacion', verificarToken_1.TokenValidation, vacacionesControlador_1.default.EliminarVacaciones);
    }
}
const VACACIONES_RUTAS = new VacacionesRutas();
exports.default = VACACIONES_RUTAS.router;
