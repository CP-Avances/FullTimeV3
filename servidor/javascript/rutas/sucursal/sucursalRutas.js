"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const sucursalControlador_1 = __importDefault(require("../../controlador/sucursal/sucursalControlador"));
class SucursalRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ListarSucursales);
        this.router.get('/registro', verificarToken_1.TokenValidation, sucursalControlador_1.default.ListarSucursalesRegistro);
        this.router.get('/actualizar/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.ListarSucursalesActualizar);
        this.router.get('/unaSucursal/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerUnaSucursal);
        this.router.get('/buscar/nombreSuc/:id_empresa', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerSucursalEmpresa);
        this.router.post('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.CrearSucursal);
        this.router.get('/ultimoId', verificarToken_1.TokenValidation, sucursalControlador_1.default.ObtenerUltimoId);
        this.router.put('/', verificarToken_1.TokenValidation, sucursalControlador_1.default.ActualizarSucursal);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, sucursalControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', sucursalControlador_1.default.downloadXML);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, sucursalControlador_1.default.EliminarRegistros);
    }
}
const SUCURSAL_RUTAS = new SucursalRutas();
exports.default = SUCURSAL_RUTAS.router;
