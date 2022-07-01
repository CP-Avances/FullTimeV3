import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import { ModuloPermisosValidation } from '../../libs/Modulos/verificarPermisos'
import PERMISOS_CONTROLADOR from '../../controlador/permisos/permisosControlador';
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './docRespaldosPermisos',
});

class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisos);
        this.router.get('/lista/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarEstadosPermisos);
        this.router.get('/lista-autorizados/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarPermisosAutorizados);
        this.router.get('/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerUnPermiso);
        this.router.get('/permiso/editar/:id', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoEditar);
        



        this.router.get('/documentos/:docs', PERMISOS_CONTROLADOR.getDoc);
        this.router.get('/numPermiso/:id_empleado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerNumPermiso);
        this.router.get('/permisoContrato/:id_empl_contrato', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoContrato);
        this.router.get('/datosSolicitud/:id_emple_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosSolicitud);
        this.router.get('/datosAutorizacion/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerDatosAutorizacion);


        this.router.get('/permisoCodigo/:codigo', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerPermisoCodigo);
        this.router.post('/fechas_permiso/:codigo', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ObtenerFechasPermiso);
        this.router.post('/permisos-solicitados', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.BuscarPermisos_Fechas);

        // CREAR PERMISO
        this.router.post('/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.CrearPermisos);
        // GUARDAR DOCUMENTO DE RESPALDO DE PERMISO
        this.router.put('/:id/documento', [TokenValidation, ModuloPermisosValidation, multipartMiddleware], PERMISOS_CONTROLADOR.GuardarDocumentoPermiso);
        // ACTUALIZAR PERMISO
        this.router.put('/:id/permiso-solicitado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EditarPermiso);
        // ELIMINAR PERMISO
        
        this.router.delete('/eliminar/:id_permiso/:doc', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EliminarPermiso);
        // ACTUALIZAR ESTADO DEL PERMISO
        this.router.put('/:id/estado', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ActualizarEstado);

        // BUSCAR INFORMACION DE UN PERMISO
        this.router.get('/un-permiso/:id_permiso', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.ListarUnPermisoInfo);

        // ENVIAR CORREO MEDIANTE APLICACION WEB
        this.router.post('/mail-noti/', [TokenValidation, ModuloPermisosValidation], PERMISOS_CONTROLADOR.EnviarCorreoWeb);
        // ENVIAR CORREO MEDIANTE APLICACION MOVIL
        this.router.post('/mail-noti-permiso-movil/:id_empresa', PERMISOS_CONTROLADOR.EnviarCorreoPermisoMovil);

    }
}

const PERMISOS_RUTAS = new PermisosRutas();

export default PERMISOS_RUTAS.router;