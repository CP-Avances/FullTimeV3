import { ModuloHoraExtraValidation } from '../../libs/Modulos/verificarHoraExtra';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';
import HorasExtrasPedidasControlador from '../../controlador/horaExtra/horaExtraControlador';

class HorasExtrasPedidasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidas);
        this.router.get('/pedidos_autorizados', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidasAutorizadas);
        this.router.get('/observaciones', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarHorasExtrasPedidasObservacion);
        this.router.get('/:id', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerUnaHoraExtraPedida);

        this.router.get('/datosSolicitud/:id_emple_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerSolicitudHoraExtra);

        this.router.get('/datosAutorizacion/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerAutorizacionHoraExtra);
        this.router.get('/horario-empleado/:id_cargo', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerHorarioEmpleado);
        this.router.get('/listar/solicitudes', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE);
        this.router.get('/solicitudes/autorizadas', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas);
        this.router.get('/listar/solicitudes/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE_Empleado);
        this.router.get('/solicitudes/autorizadas/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas_Empleado);

        // REPORTE CRITERIOS DE BÚSQUEDA MÚLTIPLES
        this.router.put('/horas-planificadas/:desde/:hasta', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ReporteVacacionesMultiple);




        /** ************************************************************************************************* ** 
         ** **                         METODO DE MANEJO DE HORAS EXTRAS                                    ** ** 
         ** ************************************************************************************************* **/

        // CREAR REGISTRO DE HORAS EXTRAS
        this.router.post('/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.CrearHoraExtraPedida);
        // ELIMINAR REGISTRO DE HORAS EXTRAS
        this.router.delete('/eliminar/:id_hora_extra', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EliminarHoraExtra);
        // EDITAR REGISTRO DE HORA EXTRA
        this.router.put('/:id/solicitud', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EditarHoraExtra);
        // BUSCAR LISTA DE HORAS EXTRAS DE UN USUARIO
        this.router.get('/lista/:id_user', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerlistaHora);
        // EDITAR TIEMPO AUTORIZADO DE SOLICITUD
        this.router.put('/tiempo-autorizado/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.TiempoAutorizado);
        // EDITAR ESTADO DE LA SOLIICTUD
        this.router.put('/:id/estado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarEstado);
        // EDITAR OBSERVACION DE SOLICITUD DE HORAS EXTRAS
        this.router.put('/observacion/:id', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarObservacion);


        /** ************************************************************************************************** ** 
         ** **                         METODO PARA ENVIO DE NOTIFICACIONES                                  ** ** 
         ** ************************************************************************************************** **/

        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.SendMailNotifiHoraExtra);
        // METODO DE ENVIO DE CORREO DESDE APLICACION WEB
        this.router.post('/mail-noti-horas-extras-movil/:id_empresa', HorasExtrasPedidasControlador.EnviarCorreoHoraExtraMovil);

    }
}

const HORA_EXTRA_PEDIDA_RUTA = new HorasExtrasPedidasRutas();

export default HORA_EXTRA_PEDIDA_RUTA.router;