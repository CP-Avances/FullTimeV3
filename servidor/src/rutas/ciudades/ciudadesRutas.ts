import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken';
import CIUDAD_CONTROLADOR from '../../controlador/ciudad/ciudadControlador';

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, CIUDAD_CONTROLADOR.ListarNombreCiudad);
        this.router.get('/listaCiudad', TokenValidation, CIUDAD_CONTROLADOR.ListarCiudades);
        this.router.get('/:id', TokenValidation, CIUDAD_CONTROLADOR.ConsularUnaCiudad);
        this.router.post('/', TokenValidation, CIUDAD_CONTROLADOR.CrearCiudad);
        this.router.delete('/eliminar/:id', TokenValidation, CIUDAD_CONTROLADOR.EliminarCiudad);
    }
}

const CIUDAD_RUTAS = new CiudadRutas();

export default CIUDAD_RUTAS.router;