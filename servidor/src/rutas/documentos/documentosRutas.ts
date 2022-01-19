import { Router } from 'express';
import DOCUMENTOS_CONTROLADOR from '../../controlador/documentos/documentosControlador';
import { TokenValidation } from '../../libs/verificarToken'

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './documentacion',
});

class DoumentosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // this.router.get('/', TokenValidation, DOCUMENTOS_CONTROLADOR.ListarDocumentos);
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.listarArchivosCarpeta);
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        this.router.get('/', DOCUMENTOS_CONTROLADOR.ListarDocumentos);
        this.router.get('/:id', TokenValidation, DOCUMENTOS_CONTROLADOR.ObtenerUnDocumento);
        this.router.post('/', TokenValidation, DOCUMENTOS_CONTROLADOR.CrearDocumento);
        this.router.put('/editar/:id', TokenValidation, DOCUMENTOS_CONTROLADOR.EditarDocumento);
        this.router.get('/documentos/:docs', DOCUMENTOS_CONTROLADOR.ObtenerDocumento);
        this.router.put('/:id/documento', [TokenValidation, multipartMiddleware], DOCUMENTOS_CONTROLADOR.GuardarDocumentos);
        this.router.delete('/eliminar/:id', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);
    }
}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;