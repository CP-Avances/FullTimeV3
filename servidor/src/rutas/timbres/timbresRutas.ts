import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import TIMBRES_CONTROLADOR from '../../controlador/timbres/timbresControlador';

class TimbresRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/noti-timbres/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerRealTimeTimbresEmpleado);
        this.router.get('/noti-timbres/avisos/:id_empleado', TokenValidation, TIMBRES_CONTROLADOR.ObtenerAvisosTimbresEmpleado);
        this.router.put('/noti-timbres/vista/:id_noti_timbre', TokenValidation, TIMBRES_CONTROLADOR.ActualizarVista);
        this.router.put('/eliminar-multiples/avisos', TokenValidation, TIMBRES_CONTROLADOR.EliminarMultiplesAvisos);
        this.router.post('/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWeb);
        this.router.post('/admin/', TokenValidation, TIMBRES_CONTROLADOR.CrearTimbreWebAdmin);
        this.router.get('/', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbres);
        this.router.get('/ver/timbres/:id', TokenValidation, TIMBRES_CONTROLADOR.ObtenerTimbresEmpleado);
        this.router.get('/ultimo-timbre', TokenValidation, TIMBRES_CONTROLADOR.ObtenerUltimoTimbreEmpleado);
    }
}

const TIMBRES_RUTAS = new TimbresRutas();

export default TIMBRES_RUTAS.router;