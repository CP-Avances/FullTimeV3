import { Router } from 'express';
import AUTORIZACIONES_CONTROLADOR from '../../controlador/autorizaciones/autorizacionesControlador';
import { TokenValidation } from '../../libs/verificarToken'

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, AUTORIZACIONES_CONTROLADOR.ListarAutorizaciones);
        this.router.get('/by-permiso/:id_permiso', TokenValidation, AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionByPermiso);
        this.router.get('/by-vacacion/:id_vacacion', TokenValidation, AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionByVacacion);
        this.router.get('/by-hora-extra/:id_hora_extra', AUTORIZACIONES_CONTROLADOR.ObtenerAutorizacionByHoraExtra);
        this.router.post('/', TokenValidation, AUTORIZACIONES_CONTROLADOR.CrearAutorizacion);
        this.router.put('/:id/estado-permiso', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoPermiso);
        this.router.put('/estado-permiso/multiple', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoAutorizacionPermiso);
        this.router.put('/estado-vacacion', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoVacacion);
        this.router.put('/:id_hora_extra/estado-hora-extra', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoHoraExtra);
        this.router.put('/:id_plan_hora_extra/estado-plan-hora-extra', TokenValidation, AUTORIZACIONES_CONTROLADOR.ActualizarEstadoPlanificacion);
    }
}

const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default AUTORIZA_DEPARTAMENTO_RUTAS.router;