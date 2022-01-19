"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const permisosControlador_1 = __importDefault(require("../../controlador/permisos/permisosControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const verificarPermisos_1 = require("../../libs/Modulos/verificarPermisos");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './docRespaldosPermisos',
});
class PermisosRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarPermisos);
        this.router.get('/lista/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarEstadosPermisos);
        this.router.get('/lista-autorizados/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarPermisosAutorizados);
        this.router.get('/:id', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerUnPermiso);
        this.router.get('/permiso/editar/:id', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoEditar);
        this.router.get('/un-permiso/:id_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ListarUnPermisoInfo);
        this.router.post('/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.CrearPermisos);
        this.router.post('/mail-noti/', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.SendMailNotifiPermiso);
        this.router.get('/documentos/:docs', permisosControlador_1.default.getDoc);
        this.router.get('/numPermiso/:id_empleado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerNumPermiso);
        this.router.get('/permisoContrato/:id_empl_contrato', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoContrato);
        this.router.put('/:id/documento', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation, multipartMiddleware], permisosControlador_1.default.guardarDocumentoPermiso);
        this.router.put('/:id/estado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ActualizarEstado);
        this.router.put('/:id/permiso-solicitado', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EditarPermiso);
        this.router.get('/datosSolicitud/:id_emple_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerDatosSolicitud);
        this.router.get('/datosAutorizacion/:id_permiso', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerDatosAutorizacion);
        this.router.delete('/eliminar/:id_permiso/:doc', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.EliminarPermiso);
        this.router.get('/permisoCodigo/:codigo', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerPermisoCodigo);
        this.router.post('/fechas_permiso/:codigo', [verificarToken_1.TokenValidation, verificarPermisos_1.ModuloPermisosValidation], permisosControlador_1.default.ObtenerFechasPermiso);
    }
}
const PERMISOS_RUTAS = new PermisosRutas();
exports.default = PERMISOS_RUTAS.router;
