import { Router } from 'express';
import  PROVINCIA_CONTROLADOR  from '../../controlador/catalogos/catProvinciaControlador';
import { TokenValidation } from '../../libs/verificarToken';

class ProvinciaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, PROVINCIA_CONTROLADOR.ListarProvincia);
        this.router.get('/paises', TokenValidation, PROVINCIA_CONTROLADOR.ListarTodoPais);
        this.router.get('/continentes', TokenValidation, PROVINCIA_CONTROLADOR.ListarContinentes);
        this.router.get('/pais/:continente', TokenValidation, PROVINCIA_CONTROLADOR.ListarPaises);
        this.router.get('/nombreProvincia/:nombre', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerIdProvincia);
        this.router.get('/:id_pais', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerUnaProvincia);
        this.router.get('/buscar/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerProvincia);
        this.router.get('/buscar/pais/:id', TokenValidation, PROVINCIA_CONTROLADOR.ObtenerPais);
        this.router.post('/', TokenValidation, PROVINCIA_CONTROLADOR.CrearProvincia);
        this.router.delete('/eliminar/:id', TokenValidation, PROVINCIA_CONTROLADOR.EliminarProvincia);
    }
}

const PROVINCIA_RUTAS = new ProvinciaRutas();

export default PROVINCIA_RUTAS.router;