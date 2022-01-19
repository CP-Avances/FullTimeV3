import { Router } from 'express';
import TITULO_CONTROLADOR from '../../controlador/catalogos/catTituloControlador';
import { TokenValidation } from '../../libs/verificarToken';

class TituloRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, TITULO_CONTROLADOR.list);
        this.router.get('/:id', TokenValidation, TITULO_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, TITULO_CONTROLADOR.create);
        this.router.put('/', TokenValidation, TITULO_CONTROLADOR.ActualizarTitulo);
        this.router.delete('/eliminar/:id', TokenValidation, TITULO_CONTROLADOR.EliminarRegistros);
        this.router.post('/xmlDownload/', TokenValidation, TITULO_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', TITULO_CONTROLADOR.downloadXML);
    }
}

const TITULO_RUTAS = new TituloRutas();

export default TITULO_RUTAS.router;