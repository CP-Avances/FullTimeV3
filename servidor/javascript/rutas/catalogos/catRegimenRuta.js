"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catRegimenControlador_1 = __importDefault(require("../../controlador/catalogos/catRegimenControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class RegimenRuta {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarRegimen);
        this.router.get('/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarUnRegimen);
        this.router.post('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.CrearRegimen);
        this.router.put('/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ActualizarRegimen);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.EliminarRegistros);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catRegimenControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catRegimenControlador_1.default.downloadXML);
        this.router.get('/sucursal-regimen/:id', verificarToken_1.TokenValidation, catRegimenControlador_1.default.ListarRegimenSucursal);
    }
}
const REGIMEN_RUTA = new RegimenRuta();
exports.default = REGIMEN_RUTA.router;
