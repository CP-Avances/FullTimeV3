import { Router } from 'express';
import { TokenValidation } from '../../libs/verificarToken'
import SUCURSAL_CONTROLADOR from '../../controlador/sucursal/sucursalControlador';

class SucursalRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, SUCURSAL_CONTROLADOR.ListarSucursales);
        this.router.get('/registro', TokenValidation, SUCURSAL_CONTROLADOR.ListarSucursalesRegistro);
        this.router.get('/actualizar/:id', TokenValidation, SUCURSAL_CONTROLADOR.ListarSucursalesActualizar);
        this.router.get('/unaSucursal/:id', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerUnaSucursal);
        this.router.get('/buscar/nombreSuc/:id_empresa', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerSucursalEmpresa);
        this.router.post('/', TokenValidation, SUCURSAL_CONTROLADOR.CrearSucursal);
        this.router.get('/ultimoId', TokenValidation, SUCURSAL_CONTROLADOR.ObtenerUltimoId);
        this.router.put('/', TokenValidation, SUCURSAL_CONTROLADOR.ActualizarSucursal);
        this.router.post('/xmlDownload/', TokenValidation, SUCURSAL_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', SUCURSAL_CONTROLADOR.downloadXML);
        this.router.delete('/eliminar/:id', TokenValidation, SUCURSAL_CONTROLADOR.EliminarRegistros);
    }
}

const SUCURSAL_RUTAS = new SucursalRutas();

export default SUCURSAL_RUTAS.router;