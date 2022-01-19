import { Router } from 'express';
import FERIADOS_CONTROLADOR from '../../controlador/catalogos/catFeriadosControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class FeriadosRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriados);
        this.router.get('/listar/:id', TokenValidation, FERIADOS_CONTROLADOR.ListarFeriadosActualiza);
        this.router.get('/ultimoId', TokenValidation, FERIADOS_CONTROLADOR.ObtenerUltimoId);
        this.router.get('/:id', TokenValidation, FERIADOS_CONTROLADOR.ObtenerUnFeriado);
        this.router.post('/', TokenValidation, FERIADOS_CONTROLADOR.CrearFeriados);
        this.router.post('/upload/revision', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.RevisarDatos);
        this.router.post('/upload/revision_data', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.RevisarDatos_Duplicados);
        this.router.post('/upload', [TokenValidation, multipartMiddleware], FERIADOS_CONTROLADOR.CrearFeriadoPlantilla);
        this.router.put('/', TokenValidation, FERIADOS_CONTROLADOR.ActualizarFeriado);
        this.router.post('/xmlDownload/', TokenValidation, FERIADOS_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', FERIADOS_CONTROLADOR.downloadXML);
        this.router.delete('/delete/:id', TokenValidation, FERIADOS_CONTROLADOR.EliminarFeriado);
    }
}

const FERIADOS_RUTA = new FeriadosRuta();

export default FERIADOS_RUTA.router;