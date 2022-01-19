import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import PLAN_COMIDAS_CONTROLADOR from '../../controlador/planComidas/planComidasControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        /** SOLICITUD DE ALIMENTACIÓN */
        this.router.post('/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearSolicitaComida);
        this.router.put('/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarSolicitaComida);
        this.router.put('/solicitud/estado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarEstadoSolicitaComida);
        this.router.get('/infoComida/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaIdEmpleado);
        this.router.get('/infoComida/estado/aprobado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaAprobada);
        this.router.get('/infoComida/estado/negado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaNull);
        this.router.get('/infoComida/estado/expirada', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarSolicitaComidaExpirada);

        /** CONOCER JEFES DE UN DEPARTAMENTO */
        this.router.get('/enviar/notificacion/:id_departamento', TokenValidation, PLAN_COMIDAS_CONTROLADOR.BuscarJefes);
        this.router.post('/mail-noti/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoComidas);

        this.router.post('/mail-noti/eliminar-sol', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoEliminarSolComidas);

        /** PLANIFICACIÓN DE ALIMENTACIÓN */
        this.router.get('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ListarPlanComidas);
        this.router.post('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearPlanComidas);
        this.router.get('/fin_registro', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ObtenerUltimaPlanificacion);
        this.router.get('/infoComida/plan/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaIdEmpleado);
        this.router.delete('/eliminar/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarRegistros);
        this.router.put('/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarPlanComidas);

        /** REGISTRO DE LA PLANIFICACIÓN DE ALIMENTACIÓN AL EMPLEADO */
        this.router.post('/empleado/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearPlanEmpleado);
        this.router.post('/empleado/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearSolEmpleado);
        this.router.post('/duplicidad/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.BuscarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/solicitud', TokenValidation, PLAN_COMIDAS_CONTROLADOR.BuscarSolEmpleadoFechasActualizar);

        this.router.post('/mail-plan/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoPlanComidas);
        this.router.post('/mail-plan/eliminar-plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoEliminaPlanComidas);
        this.router.post('/mail-solicita/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoEstadoSolComidas);
        this.router.post('/mail-solicitud/actualizacion', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarCorreoActualizaSolComidas);
        this.router.delete('/eliminar/plan-solicitud/:id/:fecha/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarSolComidaEmpleado);
        this.router.post('/duplicidad/actualizar/plan', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarPlanComidaEmpleadoFechas);
        this.router.post('/duplicidad/actualizar/sol', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ActualizarSolComidaEmpleadoFechas);
        this.router.delete('/eliminar/plan-comida/:id/:id_empleado', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarPlanComidaEmpleado);

        this.router.delete('/eliminar/sol-comida/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EliminarRegistroSolicitudComida);

        this.router.post('/empleado/plan/consumido', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaEmpleadoConsumido);

        this.router.get('/comida-empleado/plan/:id', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EncontrarPlanComidaIdPlan);

        // Registrar en tabla tipo_comida
        this.router.post('/tipo_comida', TokenValidation, PLAN_COMIDAS_CONTROLADOR.CrearTipoComidas);
        this.router.get('/tipo_comida', TokenValidation, PLAN_COMIDAS_CONTROLADOR.ListarTipoComidas);
        this.router.get('/tipo_comida/ultimo', TokenValidation, PLAN_COMIDAS_CONTROLADOR.VerUltimoTipoComidas);
        this.router.post('/send/planifica/', TokenValidation, PLAN_COMIDAS_CONTROLADOR.EnviarNotificacionPlanComida);
    }
}

const PLAN_COMIDAS_RUTAS = new DepartamentoRutas();

export default PLAN_COMIDAS_RUTAS.router;