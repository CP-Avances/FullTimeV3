import { ModuloPermisosValidation } from '../../libs/Modulos/verificarPermisos'
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import PERMISOS_CONTROLADOR from '../../controlador/permisos/permisosControlador';
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './permisos',
});

class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR NUMERO DE PERMISO
        this.router.get('/numPermiso/:id_empleado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerNumPermiso);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS 
        this.router.post('/permisos-solicitados-totales', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosTotales);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
        this.router.post('/permisos-solicitados', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosDias);
        // METODO PARA BUSCAR PERMISOS SOLICITADOS POR HORAS
        this.router.post('/permisos-solicitados-horas', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisosHoras);


        
        this.router.get('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisos);
        this.router.get('/lista/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarEstadosPermisos);
        this.router.get('/lista-autorizados/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisosAutorizados);
        this.router.get('/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerUnPermiso);
        this.router.get('/permiso/editar/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoEditar);
        this.router.get('/permisoContrato/:id_empl_contrato', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoContrato);
        this.router.get('/datosSolicitud/:id_emple_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosSolicitud);
        this.router.get('/datosAutorizacion/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosAutorizacion);

        this.router.post('/fechas_permiso/:codigo', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerFechasPermiso);



        this.router.post('/permisos-solicitados/movil', PERMISOS_CONTROLADOR.BuscarPermisosDias);



        /** ************************************************************************************************** **
         ** **                         METODOS PARA MANEJO DE PERMISOS                                      ** **
         ** ************************************************************************************************** **/

        // CREAR PERMISO
        this.router.post('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.CrearPermisos);
        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO
        this.router.put('/:id/documento/:documento', [TokenValidation, ModuloPermisosValidation, multipartMiddleware], PERMISOS_CONTROLADOR.GuardarDocumentoPermiso);
        // ACTUALIZAR PERMISO
        this.router.put('/:id/permiso-solicitado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EditarPermiso);
        // ELIMINAR PERMISO
        this.router.delete('/eliminar/:id_permiso/:doc', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EliminarPermiso);
        // ACTUALIZAR ESTADO DEL PERMISO
        this.router.put('/:id/estado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ActualizarEstado);
        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/un-permiso/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarUnPermisoInfo);
        // BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
        this.router.get('/permiso-usuario/:id_empleado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoEmpleado);
        // BUSQUEDA DE RESPALDOS D EPERMISOS
        this.router.get('/documentos/:docs', PERMISOS_CONTROLADOR.getDoc);
        // ELIMINAR DOCUMENTO DE PERMISO DESDE APLICACION MOVIL
        this.router.delete('/eliminar-movil/:documento', PERMISOS_CONTROLADOR.EliminarPermisoMovil);

        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, PERMISOS_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', PERMISOS_CONTROLADOR.downloadXML);


        /** ************************************************************************************************* **
         ** **                           ENVIO DE NOTIFICACIONES DE PERMISOS                               ** ** 
         ** ************************************************************************************************* **/

        // ENVIAR CORREO MEDIANTE APLICACION WEB
        this.router.post('/mail-noti/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EnviarCorreoWeb);
        // ENVIAR CORREO MEDIANTE APLICACION MOVIL
        this.router.post('/mail-noti-permiso-movil/:id_empresa', PERMISOS_CONTROLADOR.EnviarCorreoPermisoMovil);
        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO APLICACION MOVIL
        this.router.put('/:id/documento-movil/:documento', [multipartMiddleware], PERMISOS_CONTROLADOR.GuardarDocumentoPermiso);
    }
}

const PERMISOS_RUTAS = new PermisosRutas();

export default PERMISOS_RUTAS.router;