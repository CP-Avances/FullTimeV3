"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catDepartamentoControlador_1 = __importDefault(require("../../controlador/catalogos/catDepartamentoControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentos);
        this.router.get('/nombreDepartamento', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarNombreDepartamentos);
        this.router.get('/idDepartamento/:nombre', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarIdDepartamentoNombre);
        this.router.get('/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerUnDepartamento);
        this.router.get('/buscarDepa/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerDepartamentosSucursal);
        this.router.post('/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.CrearDepartamento);
        this.router.get('/busqueda/:nombre', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ObtenerIdDepartamento);
        this.router.get('/busqueda-cargo/:id_cargo', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.BuscarDepartamentoPorCargo);
        this.router.put('/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ActualizarDepartamento);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catDepartamentoControlador_1.default.downloadXML);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.EliminarRegistros);
        this.router.get('/buscar/datosDepartamento/:id_sucursal', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosSucursal);
        this.router.get('/buscar/regimen-departamento/:id', verificarToken_1.TokenValidation, catDepartamentoControlador_1.default.ListarDepartamentosRegimen);
    }
}
const DEPARTAMENTO_RUTAS = new DepartamentoRutas();
exports.default = DEPARTAMENTO_RUTAS.router;
