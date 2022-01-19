import { Router } from 'express';
import EMPRESA_CONTROLADOR from '../../controlador/catalogos/catEmpresaControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './logos',
});

class DepartamentoRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresa);
        this.router.get('/buscar/:nombre', TokenValidation, EMPRESA_CONTROLADOR.ListarUnaEmpresa);
        this.router.post('/', TokenValidation, EMPRESA_CONTROLADOR.CrearEmpresa);
        this.router.put('/', TokenValidation, EMPRESA_CONTROLADOR.ActualizarEmpresa);
        this.router.post('/xmlDownload/', TokenValidation, EMPRESA_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', EMPRESA_CONTROLADOR.downloadXML);
        this.router.delete('/eliminar/:id', TokenValidation, EMPRESA_CONTROLADOR.EliminarRegistros);
        this.router.get('/buscar/datos/:id', TokenValidation, EMPRESA_CONTROLADOR.ListarEmpresaId);
        this.router.get('/logo/codificado/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.getImagenBase64);

        // CONSULTA USADA EN MÓDULO DE ALMUERZOS
        this.router.get('/logo/codificados/:id_empresa', EMPRESA_CONTROLADOR.getImagenBase64);

        this.router.put('/logo/:id_empresa/uploadImage', [TokenValidation, multipartMiddleware], EMPRESA_CONTROLADOR.ActualizarLogoEmpresa);
        this.router.put('/colores', [TokenValidation], EMPRESA_CONTROLADOR.ActualizarColores);
        this.router.put('/credenciales/:id_empresa', TokenValidation, EMPRESA_CONTROLADOR.EditarPassword);
        this.router.put('/doble/seguridad', TokenValidation, EMPRESA_CONTROLADOR.ActualizarSeguridad);
        this.router.put('/acciones-timbre', TokenValidation, EMPRESA_CONTROLADOR.ActualizarAccionesTimbres);

        this.router.put('/reporte/marca', TokenValidation, EMPRESA_CONTROLADOR.ActualizarMarcaAgua);

        // CADENA DE NAVEGACIÓN
        this.router.get('/navegar', EMPRESA_CONTROLADOR.BuscarCadena);
    }
}

const EMPRESA_RUTAS = new DepartamentoRutas();

export default EMPRESA_RUTAS.router;