"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const vacunasControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoVacuna/vacunasControlador"));
// ALMACENAMIENTO DEL CERTIFICADO DE VACUNACIÓN EN CARPETA
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './carnetVacuna',
});
class VacunaRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        // RUTAS REGISTROS DE VACUNACIÓN
        this.router.get('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarRegistro);
        this.router.post('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearRegistro);
        this.router.get('/documentos/:docs', vacunasControlador_1.default.ObtenerDocumento);
        this.router.put('/:id', verificarToken_1.TokenValidation, vacunasControlador_1.default.ActualizarRegistro);
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarUnRegistro);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, vacunasControlador_1.default.EliminarRegistro);
        this.router.put('/:id/documento', [verificarToken_1.TokenValidation, multipartMiddleware], vacunasControlador_1.default.GuardarDocumento);
        this.router.get('/buscar/ultimo', verificarToken_1.TokenValidation, vacunasControlador_1.default.ObtenerUltimoIdVacuna);
        // RUTAS REGISTROS TIPOS DE VACUNA
        this.router.get('/lista/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarTipoVacuna);
        this.router.post('/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearTipoVacuna);
    }
}
const VACUNA_RUTAS = new VacunaRutas();
exports.default = VACUNA_RUTAS.router;
