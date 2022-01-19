import { Router } from 'express';
import DETALLE_CATALOGO_HORARIO_CONTROLADOR from '../../../controlador/horarios/detalleCatHorario/detalleCatHorarioControlador';
import { TokenValidation } from '../../../libs/verificarToken'
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './plantillas',
});

class PermisosRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarDetalleHorarios);
        this.router.post('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.CrearDetalleHorarios);
        this.router.get('/:id_horario', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ListarUnDetalleHorario);
        this.router.put('/', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.ActualizarDetalleHorarios);
        this.router.delete('/eliminar/:id', TokenValidation, DETALLE_CATALOGO_HORARIO_CONTROLADOR.EliminarRegistros);

        // Verificar los datos de la plantilla de detalles de horario y subirlos al sistema
        this.router.post('/verificarDatos/upload', [TokenValidation, multipartMiddleware], DETALLE_CATALOGO_HORARIO_CONTROLADOR.VerificarDatosDetalles);
        this.router.post('/upload', [TokenValidation, multipartMiddleware], DETALLE_CATALOGO_HORARIO_CONTROLADOR.CrearDetallePlantilla);
    }
}

const DETALLE_CATALOGO_HORARIO_RUTAS = new PermisosRutas();

export default DETALLE_CATALOGO_HORARIO_RUTAS.router;