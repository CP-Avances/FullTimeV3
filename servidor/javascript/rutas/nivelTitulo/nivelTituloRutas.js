"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nivelTituloControlador_1 = __importDefault(require("../../controlador/nivelTitulo/nivelTituloControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class NivelTituloRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.list);
        this.router.get('/:id', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.create);
        this.router.get('/buscar/:nombre', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ObtenerNivelNombre);
        this.router.put('/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ActualizarNivelTitulo);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.EliminarNivelTitulo);
        this.router.get('/nivel/datos', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.ObtenerUltimoId);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, nivelTituloControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', nivelTituloControlador_1.default.downloadXML);
    }
}
const NIVEL_TITULO_RUTAS = new NivelTituloRutas();
exports.default = NIVEL_TITULO_RUTAS.router;
