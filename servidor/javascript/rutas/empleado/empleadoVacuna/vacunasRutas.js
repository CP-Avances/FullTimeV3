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
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // METODO REGISTRO DE VACUNACIÓN
        this.router.post('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearRegistro);
        // METODO PARA GUARDAR DOCUMENTO 
        this.router.put('/:id/documento', [verificarToken_1.TokenValidation, multipartMiddleware], vacunasControlador_1.default.GuardarDocumento);
        // METODO PARA LISTAR REGISTROS DE UN USUARIO
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarUnRegistro);
        // METODO PARA LEER TODOS LOS REGISTROS DE VACUNACION
        this.router.get('/', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarRegistro);
        // METODO PARA BUSCAR UN DOCUMENTO
        this.router.get('/documentos/:docs', vacunasControlador_1.default.ObtenerDocumento);
        // METODO ACTUALIZACION DE REGISTROS DE VACUNACION
        this.router.put('/:id', verificarToken_1.TokenValidation, vacunasControlador_1.default.ActualizarRegistro);
        // METODO DE ELIMINACION D EREGISTRO DE VACUNA
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, vacunasControlador_1.default.EliminarRegistro);
        // METODO REGISTRO DE TIPO DE VACUNA
        this.router.post('/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.CrearTipoVacuna);
        // METODO DE BUSQUEDA DE TIPOS DE VACUNA REGISTRADOS
        this.router.get('/lista/tipo_vacuna', verificarToken_1.TokenValidation, vacunasControlador_1.default.ListarTipoVacuna);
    }
}
const VACUNA_RUTAS = new VacunaRutas();
exports.default = VACUNA_RUTAS.router;
