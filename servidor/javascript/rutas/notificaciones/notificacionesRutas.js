"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificacionesControlador_1 = __importDefault(require("../../controlador/notificaciones/notificacionesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class NotificacionTiempoRealRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListarNotificacion);
        this.router.get('/one/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ObtenerUnaNotificacion);
        this.router.get('/send/:id_send', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListaPorEmpleado);
        this.router.get('/all-receives/:id_receive', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListaNotificacionesRecibidas);
        this.router.get('/receives/:id_receive', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ListaPorJefe);
        this.router.post('/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.create);
        this.router.put('/vista/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', verificarToken_1.TokenValidation, notificacionesControlador_1.default.EliminarMultiplesNotificaciones);
        // RUTAS CONFIG_NOTI
        this.router.get('/config/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ObtenerConfigEmpleado);
        this.router.post('/config/', verificarToken_1.TokenValidation, notificacionesControlador_1.default.CrearConfiguracion);
        this.router.put('/config/noti-put/:id', verificarToken_1.TokenValidation, notificacionesControlador_1.default.ActualizarConfigEmpleado);
    }
}
const NOTIFICACION_TIEMPO_REAL_RUTAS = new NotificacionTiempoRealRutas();
exports.default = NOTIFICACION_TIEMPO_REAL_RUTAS.router;
