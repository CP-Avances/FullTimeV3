"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catHorarioControlador_1 = __importDefault(require("../../controlador/catalogos/catHorarioControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});
const multipartMiddlewareD = multipart({
    uploadDir: './horarios',
});
class HorarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REGISTRAR HORARIO
        this.router.post('/', verificarToken_1.TokenValidation, catHorarioControlador_1.default.CrearHorario);
        // BUSCAR HORARIO POR SU NOMBRE
        this.router.get('/buscar-horario/nombre', verificarToken_1.TokenValidation, catHorarioControlador_1.default.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO
        this.router.put('/:id/documento/:nombre', [verificarToken_1.TokenValidation, multipartMiddlewareD], catHorarioControlador_1.default.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO
        this.router.put('/editar/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_horario/base_servidor', [verificarToken_1.TokenValidation], catHorarioControlador_1.default.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR
        this.router.put('/eliminar_horario/servidor', [verificarToken_1.TokenValidation], catHorarioControlador_1.default.EliminarDocumentoServidor);
        this.router.get('/', verificarToken_1.TokenValidation, catHorarioControlador_1.default.ListarHorarios);
        this.router.get('/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.ObtenerUnHorario);
        this.router.put('/update-horas-trabaja/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EditarHoraTrabajaByHorarioDetalle);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, catHorarioControlador_1.default.FileXML);
        this.router.get('/download/:nameXML', catHorarioControlador_1.default.downloadXML);
        this.router.get('/documentos/:docs', catHorarioControlador_1.default.ObtenerDocumento);
        this.router.put('/editar/editarDocumento/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EditarDocumento);
        this.router.delete('/eliminar/:id', verificarToken_1.TokenValidation, catHorarioControlador_1.default.EliminarRegistros);
        this.router.get('/verificarDuplicados/edicion', verificarToken_1.TokenValidation, catHorarioControlador_1.default.VerificarDuplicadosEdicion);
        // Verificar datos de la plantilla de catálogo horario y luego subir al sistema
        this.router.post('/cargarHorario/verificarDatos/upload', [verificarToken_1.TokenValidation, multipartMiddleware], catHorarioControlador_1.default.VerificarDatos);
        this.router.post('/cargarHorario/verificarPlantilla/upload', [verificarToken_1.TokenValidation, multipartMiddleware], catHorarioControlador_1.default.VerificarPlantilla);
        this.router.post('/cargarHorario/upload', [verificarToken_1.TokenValidation, multipartMiddleware], catHorarioControlador_1.default.CargarHorarioPlantilla);
    }
}
const HORARIO_RUTAS = new HorarioRutas();
exports.default = HORARIO_RUTAS.router;
