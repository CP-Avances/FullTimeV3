import { Router } from 'express';
import PARAMETROS_CONTROLADOR from '../../controlador/parametrosGenerales/parametrosControlador';
import { TokenValidation } from '../../libs/verificarToken'

class ParametrosRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, PARAMETROS_CONTROLADOR.ListarParametros);
        this.router.get('/:id', TokenValidation, PARAMETROS_CONTROLADOR.VerDetalleParametro);
        this.router.get('/ver-parametro/:id', TokenValidation, PARAMETROS_CONTROLADOR.ListarUnParametro);
        this.router.post('/detalle', TokenValidation, PARAMETROS_CONTROLADOR.IngresarDetalleParametro);
        this.router.post('/tipo', TokenValidation, PARAMETROS_CONTROLADOR.IngresarTipoParametro);
        this.router.put('/actual-detalle', TokenValidation, PARAMETROS_CONTROLADOR.ActualizarDetalleParametro);
        this.router.put('/actual-tipo', TokenValidation, PARAMETROS_CONTROLADOR.ActualizarTipoParametro);
        this.router.delete('/eliminar-detalle/:id', TokenValidation, PARAMETROS_CONTROLADOR.EliminarDetalleParametro);
        this.router.delete('/eliminar-tipo/:id', TokenValidation, PARAMETROS_CONTROLADOR.EliminarTipoParametro);
        this.router.post('/xmlDownload/', TokenValidation, PARAMETROS_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', PARAMETROS_CONTROLADOR.downloadXML);
    }
}

const PARAMETROS_RUTAS = new ParametrosRutas();

export default PARAMETROS_RUTAS.router;