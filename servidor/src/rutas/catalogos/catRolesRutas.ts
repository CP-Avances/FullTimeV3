import { Router } from 'express';
import ROLES_CONTROLADOR from '../../controlador/catalogos/catRolesControlador';
import { TokenValidation } from '../../libs/verificarToken';

class PruebasRutas {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, ROLES_CONTROLADOR.ListarRoles);
        this.router.get('/:id', TokenValidation, ROLES_CONTROLADOR.ObtnenerUnRol);
        this.router.get('/actualiza/:id', TokenValidation, ROLES_CONTROLADOR.ListarRolesActualiza);
        this.router.post('/', TokenValidation, ROLES_CONTROLADOR.CrearRol);
        this.router.put('/', TokenValidation, ROLES_CONTROLADOR.ActualizarRol);
        this.router.post('/xmlDownload/', TokenValidation, ROLES_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', ROLES_CONTROLADOR.downloadXML);
        this.router.delete('/eliminar/:id', TokenValidation, ROLES_CONTROLADOR.EliminarRol);
    }
}

const ROLES_RUTAS = new PruebasRutas();

export default ROLES_RUTAS.router;