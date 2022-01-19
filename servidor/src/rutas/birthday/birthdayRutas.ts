import { Router } from 'express';
import BIRTHDAY_CONTROLADOR from '../../controlador/birthday/birthdayControlador';
import { TokenValidation } from '../../libs/verificarToken'
const multipart = require('connect-multiparty');

const multipartMiddleware = multipart({
    uploadDir: './cumpleanios', 
});

class BirthdayRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/:id_empresa', TokenValidation, BIRTHDAY_CONTROLADOR.MensajeEmpresa);
        this.router.get('/img/:imagen', BIRTHDAY_CONTROLADOR.getImagen);
        this.router.post('/', TokenValidation, BIRTHDAY_CONTROLADOR.CrearMensajeBirthday);
        this.router.put('/:id_empresa/uploadImage', [TokenValidation, multipartMiddleware], BIRTHDAY_CONTROLADOR.CrearImagenEmpleado);
        this.router.put('/editar/:id_mensaje', TokenValidation, BIRTHDAY_CONTROLADOR.EditarMensajeBirthday);
    }
}

const BIRTHDAY_RUTAS = new BirthdayRutas();

export default BIRTHDAY_RUTAS.router;