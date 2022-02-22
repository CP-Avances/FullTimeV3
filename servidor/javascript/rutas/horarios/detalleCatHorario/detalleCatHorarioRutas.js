"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detalleCatHorarioControlador_1 = __importDefault(require("../../../controlador/horarios/detalleCatHorario/detalleCatHorarioControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class PermisosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ListarDetalleHorarios);
        this.router.post('/', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.CrearDetalleHorarios);
        this.router.get('/:id_horario', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ListarUnDetalleHorario);
        this.router.put('/', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.ActualizarDetalleHorarios);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, detalleCatHorarioControlador_1.default.EliminarRegistros);
        // Verificar los datos de la plantilla de detalles de horario y subirlos al sistema
        this.router.post('/verificarDatos/upload', [verificarToken_1.TokenValidation, multipartMiddleware], detalleCatHorarioControlador_1.default.VerificarDatosDetalles);
        this.router.post('/upload', [verificarToken_1.TokenValidation, multipartMiddleware], detalleCatHorarioControlador_1.default.CrearDetallePlantilla);
    }
}
const DETALLE_CATALOGO_HORARIO_RUTAS = new PermisosRutas();
exports.default = DETALLE_CATALOGO_HORARIO_RUTAS.router;
