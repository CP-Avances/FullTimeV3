import { Router } from 'express';
import { USUARIO_CONTROLADOR } from '../../controlador/usuarios/usuarioControlador'
import { TokenValidation } from '../../libs/verificarToken'

class UsuarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // CREAR REGISTRO DE USUARIOS
        this.router.post('/', TokenValidation, USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO
        this.router.get('/datos/:id_empleado', TokenValidation, USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO
        this.router.put('/actualizarDatos', TokenValidation, USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA REGISTRAR ACCESOS AL SISTEMA
        this.router.post('/acceso', USUARIO_CONTROLADOR.AuditarAcceso);
        // METODO PARA ACTUALIZAR CONTRASEÑA
        this.router.put('/', TokenValidation, USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', TokenValidation, USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', TokenValidation, USUARIO_CONTROLADOR.ActualizarFrase);
        // METODO PARA BUSCAR DATOS DE USUARIOS TIMBRE WEB
        this.router.get('/lista-web/', TokenValidation, USUARIO_CONTROLADOR.UsuariosTimbreWeb);







        this.router.get('/', TokenValidation, USUARIO_CONTROLADOR.list);
        this.router.get('/lista-app-movil/', TokenValidation, USUARIO_CONTROLADOR.usersEmpleados);
        this.router.put('/lista-app-movil/', TokenValidation, USUARIO_CONTROLADOR.updateUsersEmpleados);

        this.router.put('/lista-web/', TokenValidation, USUARIO_CONTROLADOR.updateUsersEmpleadosWebHabilita);
        this.router.get('/busqueda/:usuario', TokenValidation, USUARIO_CONTROLADOR.getIdByUsuario);
        this.router.get('/registro-dispositivos/', TokenValidation, USUARIO_CONTROLADOR.usersListadispositivosMoviles);
        this.router.delete('/delete-registro-dispositivos/:dispositivo', TokenValidation, USUARIO_CONTROLADOR.deleteDispositivoRegistrado);


        this.router.get('/noEnrolados', TokenValidation, USUARIO_CONTROLADOR.ListarUsuriosNoEnrolados);


        this.router.post('/frase/olvido-frase', USUARIO_CONTROLADOR.RestablecerFrase);
        this.router.post('/frase/restaurar-frase/nueva', USUARIO_CONTROLADOR.CambiarFrase);


    }
}

const USUARIO_RUTA = new UsuarioRutas();

export default USUARIO_RUTA.router;