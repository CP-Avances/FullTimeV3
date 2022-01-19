import { Router } from 'express';
import DEPARTAMENTO_CONTROLADOR from '../../controlador/catalogos/catDepartamentoControlador';
import { TokenValidation } from '../../libs/verificarToken';

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentos);
        this.router.get('/nombreDepartamento', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarNombreDepartamentos);
        this.router.get('/idDepartamento/:nombre', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarIdDepartamentoNombre);
        this.router.get('/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerUnDepartamento);
        this.router.get('/buscarDepa/:id_sucursal', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerDepartamentosSucursal);
        this.router.post('/', TokenValidation, DEPARTAMENTO_CONTROLADOR.CrearDepartamento);
        this.router.get('/busqueda/:nombre', TokenValidation, DEPARTAMENTO_CONTROLADOR.ObtenerIdDepartamento);
        this.router.get('/busqueda-cargo/:id_cargo', TokenValidation, DEPARTAMENTO_CONTROLADOR.BuscarDepartamentoPorCargo);
        this.router.put('/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ActualizarDepartamento);
        this.router.post('/xmlDownload/', TokenValidation, DEPARTAMENTO_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', DEPARTAMENTO_CONTROLADOR.downloadXML);
        this.router.delete('/eliminar/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.EliminarRegistros);
        this.router.get('/buscar/datosDepartamento/:id_sucursal', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosSucursal);
        this.router.get('/buscar/regimen-departamento/:id', TokenValidation, DEPARTAMENTO_CONTROLADOR.ListarDepartamentosRegimen);

    }
}

const DEPARTAMENTO_RUTAS = new DepartamentoRutas();

export default DEPARTAMENTO_RUTAS.router;