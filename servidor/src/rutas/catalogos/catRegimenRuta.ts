import { Router } from 'express';
import REGIMEN_CONTROLADOR from '../../controlador/catalogos/catRegimenControlador';
import { TokenValidation } from '../../libs/verificarToken';

class RegimenRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {
        this.router.get('/', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimen);
        this.router.get('/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarUnRegimen);
        this.router.post('/', TokenValidation, REGIMEN_CONTROLADOR.CrearRegimen);
        this.router.put('/', TokenValidation, REGIMEN_CONTROLADOR.ActualizarRegimen);
        this.router.delete('/eliminar/:id', TokenValidation, REGIMEN_CONTROLADOR.EliminarRegistros);
        this.router.post('/xmlDownload/', TokenValidation, REGIMEN_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', REGIMEN_CONTROLADOR.downloadXML);
        this.router.get('/sucursal-regimen/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimenSucursal);
    }
}

const REGIMEN_RUTA = new RegimenRuta();

export default REGIMEN_RUTA.router;