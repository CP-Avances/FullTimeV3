import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import PLAN_GENERAL_CONTROLADOR from '../../controlador/planGeneral/planGeneralControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // METODO PARA REGISTRAR PLAN GENERAL
        this.router.post('/', TokenValidation, PLAN_GENERAL_CONTROLADOR.CrearPlanificacion);
        // METOOD PARA BUSCAR ID POR FECHAS PLAN GENERAL
        this.router.post('/buscar_fechas', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarFechas);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, PLAN_GENERAL_CONTROLADOR.EliminarRegistros);






        this.router.post('/buscar_fecha/plan', TokenValidation, PLAN_GENERAL_CONTROLADOR.BuscarFecha);
    }
}

const PLAN_GENERAL_RUTAS = new DepartamentoRutas();

export default PLAN_GENERAL_RUTAS.router;