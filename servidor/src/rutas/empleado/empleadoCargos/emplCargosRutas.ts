import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import EMPLEADO_CARGO_CONTROLADOR from '../../../controlador/empleado/empleadoCargos/emplCargosControlador';

class EmpleadosCargpsRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.list);
        this.router.get('/lista-empleados/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarCargoEmpleado);
        this.router.get('/empleadosAutorizan/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarEmpleadoAutoriza);
        this.router.get('/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.getOne);
        this.router.get('/cargoInfo/:id_empl_contrato', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarInfoCargoEmpleado);
        this.router.post('/', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.Crear);
        this.router.get('/buscar/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargo);
        this.router.get('/buscar/cargoActual/:id_empleado', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EncontrarIdCargoActual);
        this.router.put('/:id_empl_contrato/:id/actualizar', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.EditarCargo);

        // Crear tipo cargo
        this.router.post('/tipo_cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.CrearTipoCargo);
        this.router.get('/listar/tiposCargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.ListarTiposCargo);
        this.router.get('/buscar/ultimoTipo/cargo', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarUltimoTipo);
        this.router.get('/buscar/ultimoTipo/nombreCargo/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarUnTipo);
        this.router.get('/buscar/cargo-departamento/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoDepartamento);
        this.router.get('/buscar/cargo-sucursal/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoSucursal);
        this.router.get('/buscar/cargo-regimen/:id', TokenValidation, EMPLEADO_CARGO_CONTROLADOR.BuscarTipoRegimen);

    }
}

const EMPLEADO_CARGO_RUTAS = new EmpleadosCargpsRutas();

export default EMPLEADO_CARGO_RUTAS.router;