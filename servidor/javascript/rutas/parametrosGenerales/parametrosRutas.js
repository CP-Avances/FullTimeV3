"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parametrosControlador_1 = __importDefault(require("../../controlador/parametrosGenerales/parametrosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class ParametrosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, parametrosControlador_1.default.ListarParametros);
        this.router.get('/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.VerDetalleParametro);
        this.router.get('/ver-parametro/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.ListarUnParametro);
        this.router.post('/detalle', verificarToken_1.TokenValidation, parametrosControlador_1.default.IngresarDetalleParametro);
        this.router.post('/tipo', verificarToken_1.TokenValidation, parametrosControlador_1.default.IngresarTipoParametro);
        this.router.put('/actual-detalle', verificarToken_1.TokenValidation, parametrosControlador_1.default.ActualizarDetalleParametro);
        this.router.put('/actual-tipo', verificarToken_1.TokenValidation, parametrosControlador_1.default.ActualizarTipoParametro);
        this.router.delete('/eliminar-detalle/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.EliminarDetalleParametro);
        this.router.delete('/eliminar-tipo/:id', verificarToken_1.TokenValidation, parametrosControlador_1.default.EliminarTipoParametro);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, parametrosControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', parametrosControlador_1.default.downloadXML);
        this.router.post('/coordenadas', verificarToken_1.TokenValidation, parametrosControlador_1.default.CompararCoordenadas);
    }
}
const PARAMETROS_RUTAS = new ParametrosRutas();
exports.default = PARAMETROS_RUTAS.router;
