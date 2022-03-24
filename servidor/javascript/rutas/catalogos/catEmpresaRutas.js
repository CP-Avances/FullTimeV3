"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catEmpresaControlador_1 = __importDefault(require("../../controlador/catalogos/catEmpresaControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './logos',
});
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarEmpresa);
        this.router.get('/buscar/:nombre', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarUnaEmpresa);
        this.router.post('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.CrearEmpresa);
        this.router.put('/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarEmpresa);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catEmpresaControlador_1.default.downloadXML);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.EliminarRegistros);
        this.router.get('/buscar/datos/:id', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ListarEmpresaId);
        this.router.get('/logo/codificado/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.getImagenBase64);
        // CONSULTA USADA EN MÓDULO DE ALMUERZOS
        this.router.get('/logo/codificados/:id_empresa', catEmpresaControlador_1.default.getImagenBase64);
        this.router.put('/logo/:id_empresa/uploadImage', [verificarToken_1.TokenValidation, multipartMiddleware], catEmpresaControlador_1.default.ActualizarLogoEmpresa);
        this.router.put('/colores', [verificarToken_1.TokenValidation], catEmpresaControlador_1.default.ActualizarColores);
        this.router.put('/credenciales/:id_empresa', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.EditarPassword);
        this.router.put('/doble/seguridad', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarSeguridad);
        this.router.put('/acciones-timbre', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarAccionesTimbres);
        this.router.put('/reporte/marca', verificarToken_1.TokenValidation, catEmpresaControlador_1.default.ActualizarMarcaAgua);
        // CADENA DE NAVEGACIÓN
        this.router.get('/navegar', catEmpresaControlador_1.default.BuscarCadena);
    }
}
const EMPRESA_RUTAS = new DepartamentoRutas();
exports.default = EMPRESA_RUTAS.router;
