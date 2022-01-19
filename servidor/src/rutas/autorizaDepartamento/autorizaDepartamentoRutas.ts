import { Router } from 'express';
import AUTORIZA_DEPARTAMENTO_CONTROLADOR from '../../controlador/autorizaDepartamento/autorizaDepartamentoControlador';
import { TokenValidation } from '../../libs/verificarToken'

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ListarAutorizaDepartamento);
        this.router.post('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.CrearAutorizaDepartamento);
        this.router.get('/autoriza/:id_empl_cargo', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EncontrarAutorizacionCargo);
        this.router.get('/empleadosAutorizan/:id_depar', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ObtenerQuienesAutorizan);
        this.router.put('/', AUTORIZA_DEPARTAMENTO_CONTROLADOR.ActualizarAutorizaDepartamento);
        this.router.delete('/eliminar/:id', AUTORIZA_DEPARTAMENTO_CONTROLADOR.EliminarAutorizacionDepartamento);
    }
}

const AUTORIZA_DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default AUTORIZA_DEPARTAMENTO_RUTAS.router;