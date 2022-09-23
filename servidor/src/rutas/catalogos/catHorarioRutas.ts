import { Router } from 'express';
import HORARIO_CONTROLADOR from '../../controlador/catalogos/catHorarioControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

const multipartMiddlewareD = multipart({
    uploadDir: './horarios',
});

class HorarioRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // REGISTRAR HORARIO
        this.router.post('/', TokenValidation, HORARIO_CONTROLADOR.CrearHorario);
        // BUSCAR HORARIO POR SU NOMBRE
        this.router.get('/buscar-horario/nombre', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO
        this.router.put('/:id/documento/:nombre', [TokenValidation, multipartMiddlewareD], HORARIO_CONTROLADOR.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO
        this.router.put('/editar/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_horario/base_servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR
        this.router.put('/eliminar_horario/servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumentoServidor);




        this.router.get('/', TokenValidation, HORARIO_CONTROLADOR.ListarHorarios);
        this.router.get('/:id', TokenValidation, HORARIO_CONTROLADOR.ObtenerUnHorario);

        this.router.put('/update-horas-trabaja/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHoraTrabajaByHorarioDetalle);
        this.router.post('/xmlDownload/', TokenValidation, HORARIO_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', HORARIO_CONTROLADOR.downloadXML);
        this.router.get('/documentos/:docs', HORARIO_CONTROLADOR.ObtenerDocumento);

        this.router.put('/editar/editarDocumento/:id', TokenValidation, HORARIO_CONTROLADOR.EditarDocumento);
        this.router.delete('/eliminar/:id', TokenValidation, HORARIO_CONTROLADOR.EliminarRegistros);
        this.router.get('/verificarDuplicados/edicion', TokenValidation, HORARIO_CONTROLADOR.VerificarDuplicadosEdicion);

        // Verificar datos de la plantilla de catálogo horario y luego subir al sistema
        this.router.post('/cargarHorario/verificarDatos/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.VerificarDatos);
        this.router.post('/cargarHorario/verificarPlantilla/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.VerificarPlantilla);
        this.router.post('/cargarHorario/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.CargarHorarioPlantilla);
    }
}

const HORARIO_RUTAS = new HorarioRutas();

export default HORARIO_RUTAS.router;