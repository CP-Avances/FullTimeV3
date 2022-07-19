import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import PLAN_HORA_EXTRA_CONTROLADOR from '../../controlador/planHoraExtra/planHoraExtraControlador';
import { ModuloHoraExtraValidation } from '../../libs/Modulos/verificarHoraExtra'

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/planificaciones', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanificacion);
        this.router.get('/', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtra);
        this.router.put('/planificacion/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ActualizarPlanHoraExtra);
        this.router.get('/id_plan_hora', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.EncontrarUltimoPlan);
        this.router.get('/justificar', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtraObserva);
        this.router.get('/autorizacion', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanHoraExtraAutorizada);

        this.router.put('/observacion/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ActualizarObservacion);
        this.router.put('/estado/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ActualizarEstado);

        this.router.get('/datosAutorizacion/:id_plan_extra', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ObtenerDatosAutorizacion);


        // TABLA plan_hora_extra_empleado
        this.router.get('/plan_empleado/:id_plan_hora', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.ListarPlanEmpleados);


        /** ******************************************************************************************************* **
         ** **                               PLANIFICACION DE HORAS EXTRAS                                       ** **
         ** ******************************************************************************************************* **/

        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.CrearPlanHoraExtra);

        /** ***************************************************************************************************** **
         ** **                           PLANIFICACION DE HORAS EXTRAS POR USUARIO                             ** ** 
         ** ***************************************************************************************************** **/

        // METODO DE CREACION DE PLANIFICACION DE HORAS EXTRAS POR USUARIO
        this.router.post('/hora_extra_empleado', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.CrearPlanHoraExtraEmpleado);


        /** ******************************************************************************************** **
         ** *             ENVIO DE CORREO ELECTRONICO DE PLANIFICACIONES DE HORAS EXTRAS               * **
         ** ******************************************************************************************** **/

        // CREACIÓN DE PLANIFICACION DE HORAS EXTRAS
        this.router.post('/send/correo-planifica/', [TokenValidation], PLAN_HORA_EXTRA_CONTROLADOR.EnviarCorreoPlanificacion);


        /** ******************************************************************************************** **
         ** *                   NOTIFICACIONES DE PLANIFICACIÓN DE HORAS EXTRAS                       ** **
         ** ******************************************************************************************** **/

        // CREACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS
        this.router.post('/send/noti-planifica', TokenValidation, PLAN_HORA_EXTRA_CONTROLADOR.EnviarNotiPlanHE);



        // ACTUALIZACION DE TIEMPO AUTORIZADO 
        this.router.put('/tiempo-autorizado/:id', [TokenValidation, ModuloHoraExtraValidation], PLAN_HORA_EXTRA_CONTROLADOR.TiempoAutorizado);
    }
}

const PLAN_HORA_EXTRA_RUTAS = new DepartamentoRutas();

export default PLAN_HORA_EXTRA_RUTAS.router;