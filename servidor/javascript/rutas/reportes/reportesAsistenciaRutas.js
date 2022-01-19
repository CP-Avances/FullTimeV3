"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verificarToken_1 = require("../../libs/verificarToken");
const reportesAsistenciaControlador_1 = __importDefault(require("../../controlador/reportes/reportesAsistenciaControlador"));
class ReportesAsistenciasRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // lista departamentos con empleados activos o inactivos
        this.router.get('/departamentos/:estado', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.Departamentos);
        // Reportes de Atrasos
        this.router.put('/atrasos-empleados/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteAtrasosMultiple);
        // Reportes de Faltas
        this.router.put('/faltas-empleados/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteFaltasMultiple);
        this.router.put('/faltas-tabulado/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteFaltasMultipleTabulado);
        // Reportes de Horas Trabajadas
        this.router.put('/horas-trabaja/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteHorasTrabajaMultiple);
        // Reportes de Puntualidad
        this.router.put('/puntualidad/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReportePuntualidad);
        // Reportes de Timbres Multiple
        this.router.put('/timbres/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresMultiple);
        // Reportes de Timbres Habiertos
        this.router.get('/timbres-abiertos', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresAbiertos);
        // Reportes de Timbres Tabulado
        this.router.put('/timbres-tabulados/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresTabulado);
        // Reportes de Timbres incompletos
        this.router.put('/timbres-incompletos/:desde/:hasta', verificarToken_1.TokenValidation, reportesAsistenciaControlador_1.default.ReporteTimbresIncompletos);
    }
}
const REPORTES_A_RUTAS = new ReportesAsistenciasRutas();
exports.default = REPORTES_A_RUTAS.router;
