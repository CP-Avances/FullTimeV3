import { Router } from 'express';
import nacionalidadControlador from '../../controlador/nacionalidad/nacionalidadControlador';
import { TokenValidation } from '../../libs/verificarToken'

class NacionalidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, nacionalidadControlador.list);
    }
}

const nacionalidadRutas = new NacionalidadRutas();

export default nacionalidadRutas.router;