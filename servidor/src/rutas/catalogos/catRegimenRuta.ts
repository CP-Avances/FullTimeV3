import REGIMEN_CONTROLADOR from '../../controlador/catalogos/catRegimenControlador';
import { TokenValidation } from '../../libs/verificarToken';
import { Router } from 'express';

class RegimenRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // LISTAR REGISTROS DE REGIMEN LABORAL
        this.router.get('/', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimen);
        // REGISTRAR REGIMEN LABORAL
        this.router.post('/', TokenValidation, REGIMEN_CONTROLADOR.CrearRegimen);
        // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
        this.router.put('/', TokenValidation, REGIMEN_CONTROLADOR.ActualizarRegimen);
        

        this.router.get('/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarUnRegimen);
        this.router.delete('/eliminar/:id', TokenValidation, REGIMEN_CONTROLADOR.EliminarRegistros);
        this.router.post('/xmlDownload/', TokenValidation, REGIMEN_CONTROLADOR.FileXML);
        this.router.get('/download/:nameXML', REGIMEN_CONTROLADOR.downloadXML);
        this.router.get('/sucursal-regimen/:id', TokenValidation, REGIMEN_CONTROLADOR.ListarRegimenSucursal);
    }
}

const REGIMEN_RUTA = new RegimenRuta();

export default REGIMEN_RUTA.router;