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
        // METODO REGISTRO DE VACUNACIÓN
        this.router.post('/', TokenValidation, VACUNA_CONTROLADOR.CrearRegistro);
        // METODO PARA GUARDAR DOCUMENTO 
        this.router.put('/:id/documento', [TokenValidation, multipartMiddleware], VACUNA_CONTROLADOR.GuardarDocumento);
        // METODO PARA LISTAR REGISTROS DE UN USUARIO
        this.router.get('/:id_empleado', TokenValidation, VACUNA_CONTROLADOR.ListarUnRegistro);
        // METODO PARA LEER TODOS LOS REGISTROS DE VACUNACION
        this.router.get('/', TokenValidation, VACUNA_CONTROLADOR.ListarRegistro);
        // METODO PARA BUSCAR UN DOCUMENTO
        this.router.get('/documentos/:docs', VACUNA_CONTROLADOR.ObtenerDocumento);
        // METODO ACTUALIZACION DE REGISTROS DE VACUNACION
        this.router.put('/:id', TokenValidation, VACUNA_CONTROLADOR.ActualizarRegistro);
        // METODO DE ELIMINACION D EREGISTRO DE VACUNA
        this.router.delete('/eliminar/:id', TokenValidation, VACUNA_CONTROLADOR.EliminarRegistro);


        // METODO REGISTRO DE TIPO DE VACUNA
        this.router.post('/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.CrearTipoVacuna);
        // METODO DE BUSQUEDA DE TIPOS DE VACUNA REGISTRADOS
        this.router.get('/lista/tipo_vacuna', TokenValidation, VACUNA_CONTROLADOR.ListarTipoVacuna);
    }
}

const VACUNA_RUTAS = new VacunaRutas();

export default VACUNA_RUTAS.router;