import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import VACACIONES_CONTROLADOR from '../../controlador/vacaciones/vacacionesControlador';

class VacacionesRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, VACACIONES_CONTROLADOR.ListarVacaciones);
        this.router.get('/estado-solicitud', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionesAutorizadas);
        this.router.get('/:id', TokenValidation, VACACIONES_CONTROLADOR.VacacionesIdPeriodo);
        this.router.get('/listar/vacacion/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarVacacionId);
        this.router.get('/one/:id', TokenValidation, VACACIONES_CONTROLADOR.ListarUnaVacacion);
        this.router.post('/', TokenValidation, VACACIONES_CONTROLADOR.CrearVacaciones);
        this.router.post('/fechasFeriado', TokenValidation, VACACIONES_CONTROLADOR.ObtenerFechasFeriado);
        this.router.post('/mail-noti/', TokenValidation, VACACIONES_CONTROLADOR.SendMailNotifiPermiso);
        this.router.put('/:id/estado', TokenValidation, VACACIONES_CONTROLADOR.ActualizarEstado);
        this.router.put('/:id/vacacion-solicitada', TokenValidation, VACACIONES_CONTROLADOR.EditarVacaciones);
        this.router.get('/datosSolicitud/:id_emple_vacacion', TokenValidation, VACACIONES_CONTROLADOR.ObtenerSolicitudVacaciones);
        this.router.get('/datosAutorizacion/:id_vacaciones', TokenValidation, VACACIONES_CONTROLADOR.ObtenerAutorizacionVacaciones);
        this.router.delete('/eliminar/:id_vacacion', TokenValidation, VACACIONES_CONTROLADOR.EliminarVacaciones);
    }
}

const VACACIONES_RUTAS = new VacacionesRutas();

export default VACACIONES_RUTAS.router;