"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const emplCargosControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoCargos/emplCargosControlador"));
class EmpleadosCargpsRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.list);
        this.router.get('/lista-empleados/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarCargoEmpleado);
        this.router.get('/empleadosAutorizan/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarEmpleadoAutoriza);
        this.router.get('/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.getOne);
        this.router.get('/cargoInfo/:id_empl_contrato', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarInfoCargoEmpleado);
        this.router.post('/', verificarToken_1.TokenValidation, emplCargosControlador_1.default.Crear);
        this.router.get('/buscar/:id_empleado', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarIdCargo);
        this.router.get('/buscar/cargoActual/:id_empleado', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EncontrarIdCargoActual);
        this.router.put('/:id_empl_contrato/:id/actualizar', verificarToken_1.TokenValidation, emplCargosControlador_1.default.EditarCargo);
        // Crear tipo cargo
        this.router.post('/tipo_cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.CrearTipoCargo);
        this.router.get('/listar/tiposCargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.ListarTiposCargo);
        this.router.get('/buscar/ultimoTipo/cargo', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarUltimoTipo);
        this.router.get('/buscar/ultimoTipo/nombreCargo/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarUnTipo);
        this.router.get('/buscar/cargo-departamento/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', verificarToken_1.TokenValidation, emplCargosControlador_1.default.BuscarTipoRegimen);
    }
}
const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();
exports.default = EMPLEADO_CARGO_RUTAS.router;
