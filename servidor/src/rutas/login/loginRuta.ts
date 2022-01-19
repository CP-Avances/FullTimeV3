import { Router } from 'express';
import LOGIN_CONTROLADOR from '../../controlador/login/loginControlador';

class LoginRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.post('/', LOGIN_CONTROLADOR.ValidarCredenciales);
        this.router.post('/recuperar-contrasenia/', LOGIN_CONTROLADOR.RestablecerContrasenia);
        this.router.post('/cambiar-contrasenia/', LOGIN_CONTROLADOR.CambiarContrasenia);
        this.router.post('/auditar', LOGIN_CONTROLADOR.Auditar);

    }

}

const LOGIN_RUTA = new LoginRuta();

export default LOGIN_RUTA.router;