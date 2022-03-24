"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../../libs/verificarToken");
const contratoEmpleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoContrato/contratoEmpleadoControlador"));
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './contratos',
});
class DepartamentoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ListarContratos);
        this.router.get('/:id/get', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ObtenerUnContrato);
        this.router.get('/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarIdContrato);
        this.router.get('/contratoActual/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarIdContratoActual);
        this.router.get('/contrato/:id', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarDatosUltimoContrato);
        this.router.get('/contratoRegimen/:id_empleado', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarContratoEmpleadoRegimen);
        this.router.post('/', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.CrearContrato);
        this.router.put('/:id_empleado/:id/actualizar', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EditarContrato);
        this.router.put('/:id/documento', [verificarToken_1.TokenValidation, multipartMiddleware], contratoEmpleadoControlador_1.default.GuardarDocumentoContrato);
        this.router.get('/documentos/:docs', contratoEmpleadoControlador_1.default.ObtenerDocumento);
        this.router.put('/editar/editarDocumento/:id', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EditarDocumento);
        this.router.post('/buscarFecha', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarFechaContrato);
        this.router.post('/buscarFecha/contrato', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.EncontrarFechaContratoId);
        /** MÉTODOS PARA SER USADOS EN LA TABLA MODAL_TRABAJO O TIPO DE CONTRATOS */
        this.router.post('/modalidad/trabajo', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.CrearTipoContrato);
        this.router.get('/modalidad/trabajo', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ListarTiposContratos);
        this.router.get('/modalidad/trabajo/ultimo', verificarToken_1.TokenValidation, contratoEmpleadoControlador_1.default.ListarUltimoTipoContrato);
    }
}
const CONTRATO_EMPLEADO_RUTAS = new DepartamentoRutas();
exports.default = CONTRATO_EMPLEADO_RUTAS.router;
