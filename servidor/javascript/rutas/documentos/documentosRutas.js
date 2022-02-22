"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentosControlador_1 = __importDefault(require("../../controlador/documentos/documentosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});
class DoumentosRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        // this.router.get('/', TokenValidation, DOCUMENTOS_CONTROLADOR.ListarDocumentos);
        this.router.get('/carpetas/', documentosControlador_1.default.Carpetas);
        this.router.get('/lista-carpetas/:nom_carpeta', documentosControlador_1.default.listarArchivosCarpeta);
        this.router.get('/download/files/:nom_carpeta/:filename', documentosControlador_1.default.DownLoadFile);
        this.router.get('/', documentosControlador_1.default.ListarDocumentos);
        this.router.get('/:id', verificarToken_1.TokenValidation, documentosControlador_1.default.ObtenerUnDocumento);
        this.router.post('/', verificarToken_1.TokenValidation, documentosControlador_1.default.CrearDocumento);
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, documentosControlador_1.default.EditarDocumento);
        this.router.get('/documentos/:docs', documentosControlador_1.default.ObtenerDocumento);
        this.router.put('/:id/documento', [verificarToken_1.TokenValidation, multipartMiddleware], documentosControlador_1.default.GuardarDocumentos);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, documentosControlador_1.default.EliminarRegistros);
    }
}
const DOCUMENTOS_RUTAS = new DoumentosRutas();
exports.default = DOCUMENTOS_RUTAS.router;
