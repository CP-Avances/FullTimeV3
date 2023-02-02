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

        // METODO PARA REGISTRAR DOCUMENTOS
        this.router.post('/registrar/:doc_nombre', TokenValidation, multipartMiddleware, DOCUMENTOS_CONTROLADOR.CrearDocumento);
        // METODO PARA LISTAR CARPETAS
        this.router.get('/carpetas/', DOCUMENTOS_CONTROLADOR.Carpetas);
        // METODO PARA LISTAR ARCHIVOS DE CARPETAS
        this.router.get('/lista-carpetas/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarArchivosCarpeta);
        // METODO PARA LISTAR DOCUMENTOS DE DOCUMENTACION
        this.router.get('/documentacion/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaDocumentos);
        // METODO PARA LISTAR DOCUMENTOS DE CONTRATOS
        this.router.get('/lista-contratos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaContratos);
        // METODO PARA LISTAR DOCUMENTOS DE PERMISOS
        this.router.get('/lista-permisos/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaPermisos);
        // METODO PARA LISTAR DOCUMENTOS DE HORARIOS
        this.router.get('/lista-horarios/:nom_carpeta', DOCUMENTOS_CONTROLADOR.ListarCarpetaHorarios);
        // METODO PARA DESCARGAR ARCHIVOS
        this.router.get('/download/files/:nom_carpeta/:filename', DOCUMENTOS_CONTROLADOR.DownLoadFile);
        // METODO PARA ELIMINAR ARCHIVOS
        this.router.delete('/eliminar/:id/:documento', TokenValidation, DOCUMENTOS_CONTROLADOR.EliminarRegistros);
  
    }

}

const DOCUMENTOS_RUTAS = new DoumentosRutas();

export default DOCUMENTOS_RUTAS.router;