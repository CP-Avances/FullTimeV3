import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import EMPLEADO_PROCESO_CONTROLADOR from '../../../controlador/empleado/empleadoProcesos/empleProcesoControlador';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.ListarEmpleProcesos);
        this.router.get('/infoProceso/:id_empl_cargo', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.EncontrarProcesoPorIdCargo);
        this.router.post('/', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.CrearEmpleProcesos);
        this.router.put('/', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.ActualizarProcesoEmpleado);
        this.router.delete('/eliminar/:id', TokenValidation, EMPLEADO_PROCESO_CONTROLADOR.EliminarRegistros);
    }
}

const EMPLEADO_PROCESO_RUTAS = new DepartamentoRutas();

export default EMPLEADO_PROCESO_RUTAS.router;