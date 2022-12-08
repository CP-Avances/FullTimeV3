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
        /** ** ********************************************************************************************** **
         ** ** **                         MANEJO DE CODIGOS DE USUARIOS                                    ** **
         ** ** ********************************************************************************************** **/
        // METODO DE BUSQUEDA DE CONFIGURACION DE CODIGO DE USUARIOS
        this.router.get('/encontrarDato/codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerCodigo);
        // METODO PARA REGISTRAR CODIGO DE USUARIO
        this.router.post('/crearCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearCodigo);
        // METODO DE BUSQUEDA DEL ULTIMO CODIGO DE EMPLEADO REGISTRADO EN EL SISTEMA
        this.router.get('/encontrarDato/codigo/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerMAXCodigo);
        // METODO PARA ACTUALIZAR CODIGO VALOR TOTAL
        this.router.put('/cambiarValores', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigoTotal);
        // METODO DE ACTUALIZACION DE CODIGO
        this.router.put('/cambiarCodigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarCodigo);
        /** **************************************************************************************** **
         ** **                            MANEJO DE DATOS DE EMPLEADOS                            ** **
         ** **************************************************************************************** **/
        // LISTAR DATOS DE UN USUARIO
        this.router.get('/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleado);
        // LISTAR EMPLEADOS REGISTRADOS
        this.router.get('/buscador/empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarBusquedaEmpleados);
        // REGISTRO DE EMPLEADOS
        this.router.post('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.InsertarEmpleado);
        // EDICION DE EMPLEADOS
        this.router.put('/:id/usuario', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarEmpleado);
        // METODO PARA LISTAR EMPLEADOS ACTIVOS
        this.router.get('/', verificarToken_1.TokenValidation, empleadoControlador_1.default.Listar);
        // METODO PARA LISTAR EMPLEADOS INACTIVOS
        this.router.get('/desactivados/empleados', verificarToken_1.TokenValidation, empleadoControlador_1.default.ListarEmpleadosDesactivados);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', verificarToken_1.TokenValidation, empleadoControlador_1.default.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', empleadoControlador_1.default.downloadXML);
        // METODO PARA DESACTIVAR EMPLEADOS
        this.router.put('/desactivar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.DesactivarMultiplesEmpleados);
        // METODO PARA ACTIVAR EMPLEADOS
        this.router.put('/activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActivarMultiplesEmpleados);
        // METODO PARA REACTIVAR EMPLEADOS
        this.router.put('/re-activar/masivo', verificarToken_1.TokenValidation, empleadoControlador_1.default.ReactivarMultiplesEmpleados);
        // METODO PARA CARGAR IMAGEN DEL USUARIO
        this.router.put('/:id_empleado/uploadImage', [verificarToken_1.TokenValidation, multipartMiddleware], empleadoControlador_1.default.CrearImagenEmpleado);
        // METODO PARA ACTUALIZAR UBICACION DE DOMICILIO
        this.router.put('/geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.GeolocalizacionCrokis);
        /** **************************************************************************************** **
         ** **                       MANEJO DE DATOS DE TITULO PROFESIONAL                        ** **
         ** **************************************************************************************** **/
        // METODO PARA BUSCAR TITULO DEL USUARIO
        this.router.get('/emplTitulos/:id_empleado', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerTitulosEmpleado);
        // METODO PARA REGISTRAR TITULO PROFESIONAL
        this.router.post('/emplTitulos/', verificarToken_1.TokenValidation, empleadoControlador_1.default.CrearEmpleadoTitulos);
        // METODO PARA ACTUALIZAR REGISTRO
        this.router.put('/:id_empleado_titulo/titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EditarTituloEmpleado);
        // METODO PARA ELIMINAR TITULO 
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', verificarToken_1.TokenValidation, empleadoControlador_1.default.EliminarTituloEmpleado);
        this.router.post('/buscar/informacion', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarEmpleadoNombre);
        // INFORMACIÓN TÍTULO PROFESIONALES
        this.router.post('/buscarDepartamento', verificarToken_1.TokenValidation, empleadoControlador_1.default.ObtenerDepartamentoEmpleado);
        // INFORMACIÓN DE LA IMAGEN
        this.router.get('/img/:imagen', empleadoControlador_1.default.BuscarImagen);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMÁTICA 
        this.router.post('/verificar/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Automatica);
        this.router.post('/verificar/datos/automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Automatico);
        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL 
        this.router.post('/verificar/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_Manual);
        this.router.post('/verificar/datos/manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', [verificarToken_1.TokenValidation, multipartMiddlewarePlantilla], empleadoControlador_1.default.CargarPlantilla_Manual);
        // HABILITACIÓN Y DESHABILITACIÓN DE USUARIOS
        // METODOS PARA CONTROL DE MARCACIONES DENTRO DE UNA UBICACIÓN GEOGRÁFICA 
        this.router.post('/geolocalizacion-domicilio/:id/:codigo', verificarToken_1.TokenValidation, empleadoControlador_1.default.IngresarGelocalizacion);
        this.router.get('/ubicacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.BuscarCoordenadas);
        this.router.put('/geolocalizacion-trabajo/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarTrabajo);
        this.router.put('/geolocalizacion-nuevo-domicilio/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarDomicilio);
        this.router.put('/actualizar-geolocalizacion/:id', verificarToken_1.TokenValidation, empleadoControlador_1.default.ActualizarGeolocalizacion);
    }
}
const EMPLEADO_RUTAS = new EmpleadoRutas();
exports.default = EMPLEADO_RUTAS.router;
