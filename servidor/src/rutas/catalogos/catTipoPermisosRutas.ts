import { Router } from 'express';

import TIPO_PERMISOS_CONTROLADOR from  '../../controlador/catalogos/catTipoPermisosControlador';
import { TokenValidation } from '../../libs/verificarToken';

class TipoPermisosRutas {
    public router: Router = Router();
    

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, TIPO_PERMISOS_CONTROLADOR.list);
        this.router.get('/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.getOne);
        this.router.post('/', TokenValidation, TIPO_PERMISOS_CONTROLADOR.create);
        this.router.put('/editar/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.editar);
        this.router.post('/xmlDownload/', TokenValidation, TIPO_PERMISOS_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', TIPO_PERMISOS_CONTROLADOR.downloadXML);
        this.router.get('/acceso/:acce_empleado', TokenValidation, TIPO_PERMISOS_CONTROLADOR.listAccess);
        this.router.delete('/eliminar/:id', TokenValidation, TIPO_PERMISOS_CONTROLADOR.EliminarRegistros);
    }
}

const TIPO_PERMISOS_RUTAS = new TipoPermisosRutas();

export default TIPO_PERMISOS_RUTAS.router;