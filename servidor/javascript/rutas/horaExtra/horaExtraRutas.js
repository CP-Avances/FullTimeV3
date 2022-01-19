"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const horaExtraControlador_1 = __importDefault(require("../../controlador/horaExtra/horaExtraControlador"));
const verificarToken_1 = require("../../libs/verificarToken");
const verificarHoraExtra_1 = require("../../libs/Modulos/verificarHoraExtra");
class HorasExtrasPedidasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidas);
        this.router.get('/pedidos_autorizados', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidasAutorizadas);
        this.router.get('/observaciones', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarHorasExtrasPedidasObservacion);
        this.router.get('/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerUnaHoraExtraPedida);
        this.router.get('/lista/:id_user', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerlistaHora);
        this.router.post('/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.CrearHoraExtraPedida);
        this.router.post('/mail-noti/', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.SendMailNotifiHoraExtra);
        this.router.get('/datosSolicitud/:id_emple_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerSolicitudHoraExtra);
        this.router.put('/:id/estado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ActualizarEstado);
        this.router.put('/:id/hora-extra-solicitada', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EditarHoraExtra);
        this.router.get('/datosAutorizacion/:id_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerAutorizacionHoraExtra);
        this.router.get('/horario-empleado/:id_cargo', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ObtenerHorarioEmpleado);
        this.router.put('/tiempo-autorizado/:id_hora', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.TiempoAutorizado);
        this.router.delete('/eliminar/:id_hora_extra', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.EliminarHoraExtra);
        this.router.put('/observacion/:id', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ActualizarObservacion);
        this.router.get('/listar/solicitudes', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHE);
        this.router.get('/solicitudes/autorizadas', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHEAutorizadas);
        this.router.get('/listar/solicitudes/empleado/:id_empleado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHE_Empleado);
        this.router.get('/solicitudes/autorizadas/empleado/:id_empleado', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ListarPedidosHEAutorizadas_Empleado);
        // REPORTE CRITERIOS DE BÚSQUEDA MÚLTIPLES
        this.router.put('/horas-planificadas/:desde/:hasta', [verificarToken_1.TokenValidation, verificarHoraExtra_1.ModuloHoraExtraValidation], horaExtraControlador_1.default.ReporteVacacionesMultiple);
    }
}
const HORA_EXTRA_PEDIDA_RUTA = new HorasExtrasPedidasRutas();
exports.default = HORA_EXTRA_PEDIDA_RUTA.router;
