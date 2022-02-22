"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catRolesControlador_1 = __importDefault(require("../../controlador/catalogos/catRolesControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class PruebasRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catRolesControlador_1.default.ListarRoles);
        this.router.get('/:id', verificarToken_1.TokenValidation, catRolesControlador_1.default.ObtnenerUnRol);
        this.router.get('/actualiza/:id', verificarToken_1.TokenValidation, catRolesControlador_1.default.ListarRolesActualiza);
        this.router.post('/', verificarToken_1.TokenValidation, catRolesControlador_1.default.CrearRol);
        this.router.put('/', verificarToken_1.TokenValidation, catRolesControlador_1.default.ActualizarRol);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catRolesControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catRolesControlador_1.default.downloadXML);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catRolesControlador_1.default.EliminarRol);
    }
}
const ROLES_RUTAS = new PruebasRutas();
exports.default = ROLES_RUTAS.router;
