"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const ciudadControlador_1 = __importDefault(require("../../controlador/ciudad/ciudadControlador"));
class CiudadRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarNombreCiudad);
        this.router.get('/listaCiudad', verificarToken_1.TokenValidation, ciudadControlador_1.default.ListarCiudades);
        this.router.get('/:id', verificarToken_1.TokenValidation, ciudadControlador_1.default.ConsularUnaCiudad);
        this.router.post('/', verificarToken_1.TokenValidation, ciudadControlador_1.default.CrearCiudad);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, ciudadControlador_1.default.EliminarCiudad);
    }
}
const CIUDAD_RUTAS = new CiudadRutas();
exports.default = CIUDAD_RUTAS.router;
