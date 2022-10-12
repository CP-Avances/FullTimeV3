import DOCUMENTOS_CONTROLADOR from '../../controlador/documentos/documentosControlador';
import { TokenValidation } from '../../libs/verificarToken'
import { Router } from 'express';
import { carpeta } from '../../controlador/documentos/documentosControlador'

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
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarArchivosCarpeta);
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);

        this.router.get('/lista-contratos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaContratos);
        this.router.get('/lista-permisos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaPermisos);
        this.router.get('/lista-horarios/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaHorarios);

        this.router.get('/documentacion/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaDocumentos);
        this.router.post('/registrar/:doc_nombre', TokenValidation, multipartMiddleware, DOCUMENTOS_CONTROLADOR.CrearDocumento);
        this.router.delete('/eliminar/:id/:documento', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);

    }

}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;