import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import DISCAPACIDAD_CONTROLADOR from '../../../controlador/empleado/empleadoDiscapacidad/discapacidadControlador';

class DiscapacidadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, DISCAPACIDAD_CONTROLADOR.list);
        this.router.get('/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, DISCAPACIDAD_CONTROLADOR.create);
        this.router.put('/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.update);
        this.router.delete('/eliminar/:id_empleado', TokenValidation, DISCAPACIDAD_CONTROLADOR.deleteDiscapacidad);

        // TIPO DISCAPACIDAD
        this.router.get('/buscarTipo/tipo', TokenValidation, DISCAPACIDAD_CONTROLADOR.ListarTipoD);
        this.router.get('/buscarTipo/tipo/:id', TokenValidation, DISCAPACIDAD_CONTROLADOR.ObtenerUnTipoD);
        this.router.post('/buscarTipo', TokenValidation, DISCAPACIDAD_CONTROLADOR.CrearTipoD);
        this.router.put('/buscarTipo/:id', TokenValidation, DISCAPACIDAD_CONTROLADOR.ActualizarTipoD);
        this.router.get('/buscarTipo/ultimoId', TokenValidation, DISCAPACIDAD_CONTROLADOR.ObtenerUltimoIdTD);
    }
}

const DISCAPACIDAD_RUTAS = new DiscapacidadRutas();

export default DISCAPACIDAD_RUTAS.router;