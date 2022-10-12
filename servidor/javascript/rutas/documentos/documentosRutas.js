"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const documentosControlador_1 = __importDefault(require("../../controlador/documentos/documentosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const express_1 = require("express");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});
class DoumentosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/lista-carpetas/:nom_carpeta', documentosControlador_1.default.ListarArchivosCarpeta);
        this.router.get('/download/files/:nom_carpeta/:filename', documentosControlador_1.default.DownLoadFile);
        this.router.get('/carpetas/', documentosControlador_1.default.Carpetas);
        this.router.get('/lista-contratos/:nom_carpeta', documentosControlador_1.default.ListarCarpetaContratos);
        this.router.get('/lista-permisos/:nom_carpeta', documentosControlador_1.default.ListarCarpetaPermisos);
        this.router.get('/lista-horarios/:nom_carpeta', documentosControlador_1.default.ListarCarpetaHorarios);
        this.router.get('/documentacion/:nom_carpeta', documentosControlador_1.default.ListarCarpetaDocumentos);
        this.router.post('/registrar/:doc_nombre', verificarToken_1.TokenValidation, multipartMiddleware, documentosControlador_1.default.CrearDocumento);
        this.router.delete('/eliminar/:id/:documento', verificarToken_1.TokenValidation, documentosControlador_1.default.EliminarRegistros);
    }
}
const DOCUMENTOS_RUTAS = new DoumentosRutas();
exports.default = DOCUMENTOS_RUTAS.router;
