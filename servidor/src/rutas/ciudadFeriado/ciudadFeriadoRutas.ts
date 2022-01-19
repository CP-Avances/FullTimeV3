import { Router } from 'express';
import CIUDAD_FERIADO_CONTROLADOR from '../../controlador/ciudadFeriado/ciudadFeriadoControlador';
import { TokenValidation } from '../../libs/verificarToken'

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/insertar', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.AsignarCiudadFeriado);
        this.router.post('/buscar', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ObtenerIdCiudades);
        this.router.get('/:nombre', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.FiltrarCiudadesProvincia);
        this.router.get('/nombresCiudades/:idferiado', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.EncontrarCiudadesFeriado);
        this.router.put('/', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ActualizarCiudadFeriado);
        this.router.delete('/eliminar/:id', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.EliminarCiudadFeriado);
        this.router.get('/ciudad/:id_ciudad', TokenValidation, CIUDAD_FERIADO_CONTROLADOR.ObtenerFeriadosCiudad);
    }
}

const CIUDAD_FERIADOS_RUTAS = new CiudadRutas();

export default CIUDAD_FERIADOS_RUTAS.router;