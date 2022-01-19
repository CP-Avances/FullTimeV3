import { Router } from 'express';
import DATOS_GENERALES_CONTROLADOR from '../../controlador/datosGenerales/datosGeneralesControlador';
import { TokenValidation } from '../../libs/verificarToken'

class CiudadRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/empleadoAutoriza/:empleado_id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosEmpleadoAutoriza);
        this.router.get('/info_actual', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarDatosActualesEmpleado);

        /** INICIO RUTAS PARA ACCEDER A CONSULTAS PARA FILTRAR INFORMACIÓN */
        this.router.get('/filtros/sucursal/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucursal);
        this.router.get('/filtros/sucursal/departamento/:id_sucursal/:id_departamento', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepa);
        this.router.get('/filtros/sucursal/departamento-cargo/:id_sucursal/:id_departamento/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaCargo);
        this.router.get('/filtros/sucursal/departamento-regimen/:id_sucursal/:id_departamento/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaRegimen);
        this.router.get('/filtros/sucursal/departamento-regimen-cargo/:id_sucursal/:id_departamento/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuDepaRegimenCargo);
        this.router.get('/filtros/sucursal/regimen/:id_sucursal/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuRegimen);
        this.router.get('/filtros/sucursal/regimen-cargo/:id_sucursal/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuRegimenCargo);
        this.router.get('/filtros/sucursal/cargo/:id_sucursal/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoSucuCargo);
        this.router.get('/filtros/departamento/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepartamento);
        this.router.get('/filtros/departamento/cargo/:id_departamento/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaCargo);
        this.router.get('/filtros/departamento/regimen/:id_departamento/:id_regimen', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaRegimen);
        this.router.get('/filtros/departamento/regimen-cargo/:id_departamento/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoDepaRegimenCargo);
        this.router.get('/filtros/regimen/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoRegimen);
        this.router.get('/filtros/regimen-cargo/:id_regimen/:id_cargo', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoRegimenCargo);
        this.router.get('/filtros/cargo/:id', TokenValidation, DATOS_GENERALES_CONTROLADOR.ListarEmpleadoCargo);
        /** FIN RUTAS PARA ACCEDER A CONSULTAS PARA FILTRAR INFORMACIÓN */

    }
}

const DATOS_GENERALES_RUTAS = new CiudadRutas();

export default DATOS_GENERALES_RUTAS.router;