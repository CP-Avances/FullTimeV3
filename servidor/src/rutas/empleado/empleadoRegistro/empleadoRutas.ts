// SECCIÓN DE LIBRERIAS
import EMPLEADO_CONTROLADOR from '../../../controlador/empleado/empleadoRegistro/empleadoControlador';
import { TokenValidation } from '../../../libs/verificarToken';
import { Router } from 'express';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './imagenesEmpleados',
});

const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});

class EmpleadoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        /** **************************************************************************************** **
         ** **                            MANEJO DE DATOS DE EMPLEADOS                            ** ** 
         ** **************************************************************************************** **/

        // LISTAR DATOS DE UN USUARIO
        this.router.get('/:id', TokenValidation, EMPLEADO_CONTROLADOR.BuscarEmpleado);
        // LISTAR EMPLEADOS REGISTRADOS
        this.router.get('/buscador/empleado', TokenValidation, EMPLEADO_CONTROLADOR.ListarBusquedaEmpleados);

        this.router.get('/', TokenValidation, EMPLEADO_CONTROLADOR.Listar);
        this.router.post('/buscar/informacion', TokenValidation, EMPLEADO_CONTROLADOR.BuscarEmpleadoNombre);
        this.router.post('/', TokenValidation, EMPLEADO_CONTROLADOR.InsertarEmpleado);
        this.router.put('/:id/usuario', TokenValidation, EMPLEADO_CONTROLADOR.EditarEmpleado);

        // INFORMACIÓN TÍTULO PROFESIONALES
        this.router.get('/emplTitulos/:id_empleado', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerTitulosEmpleado);
        this.router.put('/:id_empleado_titulo/titulo', TokenValidation, EMPLEADO_CONTROLADOR.EditarTituloEmpleado);
        this.router.post('/emplTitulos/', TokenValidation, EMPLEADO_CONTROLADOR.CrearEmpleadoTitulos);
        this.router.delete('/eliminar/titulo/:id_empleado_titulo', TokenValidation, EMPLEADO_CONTROLADOR.EliminarTituloEmpleado);
        this.router.post('/buscarDepartamento', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerDepartamentoEmpleado);

        // INFORMACIÓN DE LA IMAGEN
        this.router.get('/img/:imagen', EMPLEADO_CONTROLADOR.BuscarImagen);
        this.router.get('/download/:nameXML', EMPLEADO_CONTROLADOR.downloadXML);
        this.router.put('/:id_empleado/uploadImage', [TokenValidation, multipartMiddleware], EMPLEADO_CONTROLADOR.CrearImagenEmpleado);
        this.router.post('/xmlDownload/', TokenValidation, EMPLEADO_CONTROLADOR.FileXML);

        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA AUTOMÁTICA 
        this.router.post('/verificar/automatico/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_Automatica);
        this.router.post('/verificar/datos/automatico/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosAutomatico);
        this.router.post('/cargar_automatico/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.CargarPlantilla_Automatico);

        // RUTAS DE ACCESO A LA CARGA DE DATOS DE FORMA MANUAL 
        this.router.post('/verificar/manual/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_Manual);
        this.router.post('/verificar/datos/manual/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.VerificarPlantilla_DatosManual);
        this.router.post('/cargar_manual/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], EMPLEADO_CONTROLADOR.CargarPlantilla_Manual);

        // INFORMACIÓN CÓDIGO DEL EMPLEADO
        this.router.get('/encontrarDato/codigo', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerCodigo);
        this.router.get('/encontrarDato/codigo/empleado', TokenValidation, EMPLEADO_CONTROLADOR.ObtenerMAXCodigo);
        this.router.post('/crearCodigo', TokenValidation, EMPLEADO_CONTROLADOR.CrearCodigo);
        this.router.put('/cambiarCodigo', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarCodigo);
        this.router.put('/cambiarValores', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarCodigoTotal);

        // HABILITACIÓN Y DESHABILITACIÓN DE USUARIOS
        this.router.get('/desactivados/empleados', TokenValidation, EMPLEADO_CONTROLADOR.ListarEmpleadosDesactivados);
        this.router.put('/desactivar/masivo', TokenValidation, EMPLEADO_CONTROLADOR.DesactivarMultiplesEmpleados);
        this.router.put('/activar/masivo', TokenValidation, EMPLEADO_CONTROLADOR.ActivarMultiplesEmpleados);
        this.router.put('/re-activar/masivo', TokenValidation, EMPLEADO_CONTROLADOR.ReactivarMultiplesEmpleados);

        // MÉTODOS PARA CONTROL DE MARCACIONES DENTRO DE UNA UBICACIÓN GEOGRÁFICA 
        this.router.post('/geolocalizacion-domicilio/:id/:codigo', TokenValidation, EMPLEADO_CONTROLADOR.IngresarGelocalizacion);
        this.router.get('/ubicacion/:id', TokenValidation, EMPLEADO_CONTROLADOR.BuscarCoordenadas);
        this.router.put('/geolocalizacion-trabajo/:id', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarTrabajo);
        this.router.put('/geolocalizacion/:id', TokenValidation, EMPLEADO_CONTROLADOR.GeolocalizacionCrokis);
        this.router.put('/geolocalizacion-nuevo-domicilio/:id', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarDomicilio);
        this.router.put('/actualizar-geolocalizacion/:id', TokenValidation, EMPLEADO_CONTROLADOR.ActualizarGeolocalizacion);

    }

}

const EMPLEADO_RUTAS = new EmpleadoRutas();

export default EMPLEADO_RUTAS.router;
