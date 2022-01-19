import { Router } from 'express';
import { TokenValidation } from '../../../libs/verificarToken';
import VACUNA_CONTROLADOR from '../../../controlador/empleado/empleadoVacuna/vacunasControlador';
// ALMACENAMIENTO DEL CERTIFICADO DE VACUNACIÓN EN CARPETA
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({
    uploadDir: './carnetVacuna',
});

class VacunaRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        // RUTAS REGISTROS DE VACUNACIÓN
        this.router.get('/', TokenValidation, VACUNA_CONTROLADOR.ListarRegistro);
        this.router.post('/', TokenValidation, VACUNA_CONTROLADOR.CrearRegistro);
        this.router.get('/documentos/:docs', VACUNA_CONTROLADOR.ObtenerDocumento);
        this.router.put('/:id', TokenValidation, VACUNA_CONTROLADOR.ActualizarRegistro);
        this.router.get('/:id_empleado', TokenValidation, VACUNA_CONTROLADOR.ListarUnRegistro);
        this.router.delete('/eliminar/:id', TokenValidation, VACUNA_CONTROLADOR.EliminarRegistro);
        this.router.put('/:id/documento', [TokenValidation, multipartMiddleware], VACUNA_CONTROLADOR.GuardarDocumento);
        this.router.get('/buscar/ultimo', TokenValidation, VACUNA_CONTROLADOR.ObtenerUltimoIdVacuna);

        // RUTAS REGISTROS TIPOS DE VACUNA
        this.router.get('/lista/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.ListarTipoVacuna);
        this.router.post('/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.CrearTipoVacuna);
    }
}

const VACUNA_RUTAS = new VacunaRutas();

export default VACUNA_RUTAS.router;