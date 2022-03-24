"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catFeriadosControlador_1 = __importDefault(require("../../controlador/catalogos/catFeriadosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
class FeriadosRuta {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriados);
        this.router.get('/listar/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ListarFeriadosActualiza);
        this.router.get('/ultimoId', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ObtenerUltimoId);
        this.router.get('/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ObtenerUnFeriado);
        this.router.post('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.CrearFeriados);
        this.router.post('/upload/revision', [verificarToken_1.TokenValidation, multipartMiddleware], catFeriadosControlador_1.default.RevisarDatos);
        this.router.post('/upload/revision_data', [verificarToken_1.TokenValidation, multipartMiddleware], catFeriadosControlador_1.default.RevisarDatos_Duplicados);
        this.router.post('/upload', [verificarToken_1.TokenValidation, multipartMiddleware], catFeriadosControlador_1.default.CrearFeriadoPlantilla);
        this.router.put('/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.ActualizarFeriado);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catFeriadosControlador_1.default.downloadXML);
        this.router.delete('/delete/:id', verificarToken_1.TokenValidation, catFeriadosControlador_1.default.EliminarFeriado);
    }
}
const FERIADOS_RUTA = new FeriadosRuta();
exports.default = FERIADOS_RUTA.router;
