import { Router } from 'express';
import HorasExtrasPedidasControlador from '../../controlador/horaExtra/horaExtraControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { ModuloHoraExtraValidation } from '../../libs/Modulos/verificarHoraExtra'

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
        this.router.get('/lista/:id_user', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerlistaHora);
        this.router.post('/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.CrearHoraExtraPedida);
        this.router.post('/mail-noti/', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.SendMailNotifiHoraExtra);
        this.router.get('/datosSolicitud/:id_emple_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerSolicitudHoraExtra);
        this.router.put('/:id/estado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarEstado);
        this.router.put('/:id/hora-extra-solicitada', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EditarHoraExtra);
        this.router.get('/datosAutorizacion/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerAutorizacionHoraExtra);
        this.router.get('/horario-empleado/:id_cargo', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ObtenerHorarioEmpleado);
        this.router.put('/tiempo-autorizado/:id_hora', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.TiempoAutorizado);
        this.router.delete('/eliminar/:id_hora_extra', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.EliminarHoraExtra);
        this.router.put('/observacion/:id', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ActualizarObservacion);
        this.router.get('/listar/solicitudes', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE);
        this.router.get('/solicitudes/autorizadas', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas);
        this.router.get('/listar/solicitudes/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHE_Empleado);
        this.router.get('/solicitudes/autorizadas/empleado/:id_empleado', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ListarPedidosHEAutorizadas_Empleado);

        // REPORTE CRITERIOS DE BÚSQUEDA MÚLTIPLES
        this.router.put('/horas-planificadas/:desde/:hasta', [TokenValidation, ModuloHoraExtraValidation], HorasExtrasPedidasControlador.ReporteVacacionesMultiple);

    }
}

const HORA_EXTRA_PEDIDA_RUTA = new HorasExtrasPedidasRutas();

export default HORA_EXTRA_PEDIDA_RUTA.router;