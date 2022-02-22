"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const empleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoRegistro/empleadoControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './imagenesEmpleados',
});
const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});
class EmpleadoRutas {
    constructor() {
        this.router = express_1.Router();
        this.configuracion();
    }
    configuracion() {
        this.router.get('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.list);
        this.router.post('/buscar/informacion', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleadoNombre);
        this.router.get('/buscador-empl', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListaBusquedaEmpleados);
        this.router.get('/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.getOne);
        this.router.get('/img/:imagen', empleadoControlador_1.default.getImagen);
        this.router.get('/download/:nameXML', empleadoControlador_1.default.downloadXML);
        this.router.get('/emplTitulos/:id_empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.getTitulosDelEmpleado);
        this.router.put('/:id/usuario', verificarToken_1.TokenValidation, empleadoControlador_1.default.editar);
        this.router.put('/:id_empleado/uploadImage', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoControlador_1.default.crearImagenEmpleado);
        this.router.put('/:id_empleado_titulo/titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.editarTituloDelEmpleado);
        this.router.post('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.create);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, empleadoControlador_1.default.FileXML);
        this.router.post('/emplTitulos/', verificarToken_1.TokenValidation, empleadoControlador_1.default.createEmpleadoTitulos);
        /** Rutas de acceso a la carga de datos de forma automática */
        this.router.post('/verificar/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Automatica);
        this.router.post('/verificar/datos/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Automatico);
        /** Rutas de acceso a la carga de datos de forma manual */
        this.router.post('/verificar/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Manual);
        this.router.post('/verificar/datos/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Manual);
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.eliminarTituloDelEmpleado);
        this.router.post('/buscarDepartamento', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerDepartamentoEmpleado);
        // Código del empleado
        this.router.get('/encontrarDato/codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerCodigo);
        this.router.post('/crearCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCodigo);
        this.router.put('/cambiarCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigo);
        this.router.put('/cambiarValores', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigoTotal);
        this.router.get('/encontrarDato/codigo/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerMAXCodigo);
        this.router.get('/desactivados/empleados', verificarToken_1.TokenValidation, empleadoControlador_1.default.listaEmpleadosDesactivados);
        this.router.put('/desactivar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.DesactivarMultiplesEmpleados);
        this.router.put('/activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActivarMultiplesEmpleados);
        this.router.put('/re-activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ReactivarMultiplesEmpleados);
        this.router.put('/geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.GeolocalizacionCrokis);
    }
}
const EMPLEADO_RUTAS = new EmpleadoRutas();
exports.default = EMPLEADO_RUTAS.router;
