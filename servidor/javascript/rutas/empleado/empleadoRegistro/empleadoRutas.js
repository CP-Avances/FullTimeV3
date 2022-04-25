"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// SECCIÓN DE LIBRERIAS
const empleadoControlador_1 = __importDefault(require("../../../controlador/empleado/empleadoRegistro/empleadoControlador"));
const verificarToken_1 = require("../../../libs/verificarToken");
const express_1 = require("express");
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './imagenesEmpleados',
});
const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});
class EmpleadoRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // REGISTRO EMPLEADO
        this.router.get('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.Listar);
        this.router.get('/buscador-empl', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarBusquedaEmpleados);
        this.router.get('/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleado);
        this.router.post('/buscar/informacion', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleadoNombre);
        this.router.post('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.InsertarEmpleado);
        this.router.put('/:id/usuario', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarEmpleado);
        // INFORMACIÓN TÍTULO PROFESIONALES
        this.router.get('/emplTitulos/:id_empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerTitulosEmpleado);
        this.router.put('/:id_empleado_titulo/titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarTituloEmpleado);
        this.router.post('/emplTitulos/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearEmpleadoTitulos);
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EliminarTituloEmpleado);
        this.router.post('/buscarDepartamento', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerDepartamentoEmpleado);
        // INFORMACIÓN DE LA IMAGEN
        this.router.get('/img/:imagen', empleadoControlador_1.default.BuscarImagen);
        this.router.get('/download/:nameXML', empleadoControlador_1.default.downloadXML);
        this.router.put('/:id_empleado/uploadImage', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoControlador_1.default.CrearImagenEmpleado);
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, empleadoControlador_1.default.FileXML);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMÁTICA 
        this.router.post('/verificar/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Automatica);
        this.router.post('/verificar/datos/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Automatico);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL 
        this.router.post('/verificar/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Manual);
        this.router.post('/verificar/datos/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Manual);
        // INFORMACIÓN CÓDIGO DEL EMPLEADO
        this.router.get('/encontrarDato/codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerCodigo);
        this.router.get('/encontrarDato/codigo/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerMAXCodigo);
        this.router.post('/crearCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCodigo);
        this.router.put('/cambiarCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigo);
        this.router.put('/cambiarValores', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigoTotal);
        // HABILITACIÓN Y DESHABILITACIÓN DE USUARIOS
        this.router.get('/desactivados/empleados', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarEmpleadosDesactivados);
        this.router.put('/desactivar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.DesactivarMultiplesEmpleados);
        this.router.put('/activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActivarMultiplesEmpleados);
        this.router.put('/re-activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ReactivarMultiplesEmpleados);
        // MÉTODOS PARA CONTROL DE MARCACIONES DENTRO DE UNA UBICACIÓN GEOGRÁFICA 
        this.router.post('/geolocalizacion-domicilio/:id/:codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.IngresarGelocalizacion);
        this.router.get('/ubicacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarCoordenadas);
        this.router.put('/geolocalizacion-trabajo/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarTrabajo);
        this.router.put('/geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.GeolocalizacionCrokis);
        this.router.put('/geolocalizacion-nuevo-domicilio/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarDomicilio);
        this.router.put('/actualizar-geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarGeolocalizacion);
    }
}
const EMPLEADO_RUTAS = new EmpleadoRutas();
exports.default = EMPLEADO_RUTAS.router;
