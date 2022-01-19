import { Router } from 'express';
import NIVEL_TITULO_CONTROLADOR from '../../controlador/nivelTitulo/nivelTituloControlador';
import { TokenValidation } from '../../libs/verificarToken'

class NivelTituloRutas {
    public router: Router = Router();

    constructor() {

        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.list);
        this.router.get('/:id', TokenValidation, NIVEL_TITULO_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.create);
        this.router.get('/buscar/:nombre', TokenValidation, NIVEL_TITULO_CONTROLADOR.ObtenerNivelNombre);
        this.router.put('/', TokenValidation, NIVEL_TITULO_CONTROLADOR.ActualizarNivelTitulo);
        this.router.delete('/eliminar/:id', TokenValidation, NIVEL_TITULO_CONTROLADOR.EliminarNivelTitulo);
        this.router.get('/nivel/datos', TokenValidation, NIVEL_TITULO_CONTROLADOR.ObtenerUltimoId);
        this.router.post('/xmlDownload/', TokenValidation, NIVEL_TITULO_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', NIVEL_TITULO_CONTROLADOR.downloadXML);
    }
}

const NIVEL_TITULO_RUTAS = new NivelTituloRutas();

export default NIVEL_TITULO_RUTAS.router;