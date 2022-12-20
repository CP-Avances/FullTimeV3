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
        this.router.post('/buscar-horario/nombre', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre);
        // CARGAR ARCHIVO DE RESPALDO
        this.router.put('/:id/documento/:nombre', [TokenValidation, multipartMiddlewareD], HORARIO_CONTROLADOR.GuardarDocumentoHorario);
        // ACTUALIZAR DATOS DE HORARIO
        this.router.put('/editar/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorario);
        // ELIMINAR DOCUMENTO DE HORARIO BASE DE DATOS - SERVIDOR
        this.router.put('/eliminar_horario/base_servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumento);
        // ELIMINAR DOCUMENTO DE HORARIOS DEL SERVIDOR
        this.router.put('/eliminar_horario/servidor', [TokenValidation], HORARIO_CONTROLADOR.EliminarDocumentoServidor);
        // BUSCAR LISTA DE CATALOGO HORARIOS
        this.router.get('/', TokenValidation, HORARIO_CONTROLADOR.ListarHorarios);
        // OBTENER VISTA DE DOCUMENTOS
        this.router.get('/documentos/:docs', HORARIO_CONTROLADOR.ObtenerDocumento);
        // BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)
        this.router.post('/buscar_horario/edicion', TokenValidation, HORARIO_CONTROLADOR.BuscarHorarioNombre_);
        // METODO PARA ELIMINAR REGISTRO
        this.router.delete('/eliminar/:id', TokenValidation, HORARIO_CONTROLADOR.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, HORARIO_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/xmlDownload/:nameXML', HORARIO_CONTROLADOR.downloadXML);
        // METODO PARA BUSCAR DATOS DE UN HORARIO
        this.router.get('/:id', TokenValidation, HORARIO_CONTROLADOR.ObtenerUnHorario);
        // METODO PARA ACTUALIZAR HORAS TRABAJADAS
        this.router.put('/update-horas-trabaja/:id', TokenValidation, HORARIO_CONTROLADOR.EditarHorasTrabaja);




        // VERIFICAR DATOS DE LA PLANTILLA DE CATÁLOGO HORARIO Y LUEGO SUBIR AL SISTEMA
        this.router.post('/cargarHorario/verificarDatos/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.VerificarDatos);
        this.router.post('/cargarHorario/verificarPlantilla/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.VerificarPlantilla);
        this.router.post('/cargarHorario/upload', [TokenValidation, multipartMiddleware], HORARIO_CONTROLADOR.CargarHorarioPlantilla);
    }
}

const HORARIO_RUTAS = new HorarioRutas();

export default HORARIO_RUTAS.router;