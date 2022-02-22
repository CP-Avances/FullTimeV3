"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catTituloControlador_1 = __importDefault(require("../../controlador/catalogos/catTituloControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class TituloRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.list);
        this.router.get('/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.getOne);
        this.router.post('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.create);
        this.router.put('/', verificarToken_1.TokenValidation, catTituloControlador_1.default.ActualizarTitulo);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catTituloControlador_1.default.EliminarRegistros);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catTituloControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catTituloControlador_1.default.downloadXML);
    }
}
const TITULO_RUTAS = new TituloRutas();
exports.default = TITULO_RUTAS.router;
