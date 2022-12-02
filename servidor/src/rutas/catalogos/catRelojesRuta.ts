import { Router } from 'express';
import RELOJES_CONTROLADOR from '../../controlador/catalogos/catRelojesControlador';
import { TokenValidation } from '../../libs/verificarToken';

const multipart = require('connect-multiparty');

const multipartMiddlewarePlantilla = multipart({
    uploadDir: './plantillas',
});

class RelojesRuta {
    public router: Router = Router();

    constructor() {
        this.configuracion();
    }

    configuracion(): void {

        // METODO PARA BUSCAR DISPOSITIVOS
        this.router.get('/', TokenValidation, RELOJES_CONTROLADOR.ListarRelojes);
        // METODO PARA ELIMINAR REGISTROS
        this.router.delete('/eliminar/:id', TokenValidation, RELOJES_CONTROLADOR.EliminarRegistros);
        // METODO PARA CREAR ARCHIVO XML
        this.router.post('/xmlDownload/', TokenValidation, RELOJES_CONTROLADOR.FileXML);
        // METODO PARA DESCARGAR ARCHIVO XML
        this.router.get('/download/:nameXML', RELOJES_CONTROLADOR.downloadXML);











        this.router.get('/:id', TokenValidation, RELOJES_CONTROLADOR.ListarUnReloj);
        this.router.post('/', TokenValidation, RELOJES_CONTROLADOR.CrearRelojes);
        this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.CargaPlantillaRelojes);
        this.router.put('/', TokenValidation, RELOJES_CONTROLADOR.ActualizarReloj);


        this.router.get('/datosReloj/:id', TokenValidation, RELOJES_CONTROLADOR.ListarDatosUnReloj);
        // METODO para verificar datos de plantilla antes de subirlos
        this.router.post('/verificar_datos/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.VerificarDatos);
        this.router.post('/verificar_plantilla/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.VerificarPlantilla);
        this.router.post('/plantillaExcel/', [TokenValidation, multipartMiddlewarePlantilla], RELOJES_CONTROLADOR.CargaPlantillaRelojes);
    }
}

const RELOJES_RUTA = new RelojesRuta();

export default RELOJES_RUTA.router;