import { Request, Response } from 'express';
import pool from '../../database';
import fs from 'fs';
const builder = require('xmlbuilder');

class ParametrosControlador {

    // MÉTODO PARA LISTAR PARÁMETROS GENERALES
    public async ListarParametros(req: Request, res: Response) {
        const PARAMETRO = await pool.query('SELECT * FROM tipo_parametro ORDER BY descripcion ASC');
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // MÉTODO PARA LISTAR UN PARÁMETRO GENERALE
    public async ListarUnParametro(req: Request, res: Response) {
        const { id } = req.params;
        const PARAMETRO = await pool.query('SELECT * FROM tipo_parametro WHERE id = $1', [id]);
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registros no encontrados.' });
        }
    }

    // MÉTODO PARA LISTAR DETALLE DE PARÁMETROS GENERALES
    public async VerDetalleParametro(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const PARAMETRO = await pool.query('SELECT tp.id AS id_tipo, tp.descripcion AS tipo, ' +
            'dtp.id AS id_detalle, dtp.descripcion ' +
            'FROM tipo_parametro AS tp, detalle_tipo_parametro AS dtp ' +
            'WHERE tp.id = dtp.id_tipo_parametro AND tp.id = $1', [id]);
        if (PARAMETRO.rowCount > 0) {
            return res.jsonp(PARAMETRO.rows)
        }
        else {
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        }
    }

    // MÉTODO PARA INGRESAR TIPO PARÁMETRO GENERAL
    public async IngresarTipoParametro(req: Request, res: Response): Promise<any> {
        const { descripcion } = req.body;
        await pool.query('INSERT INTO tipo_parametro ' +
            '(descripcion) VALUES ($1)',
            [descripcion]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // MÉTODO PARA INGRESAR DETALLE TIPO PARÁMETRO GENERAL
    public async IngresarDetalleParametro(req: Request, res: Response): Promise<any> {
        const { id_tipo, descripcion } = req.body;
        await pool.query('INSERT INTO detalle_tipo_parametro ' +
            '(id_tipo_parametro, descripcion) VALUES ($1, $2)',
            [id_tipo, descripcion]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // MÉTODO PARA ACTUALIZAR DETALLE TIPO PARÁMETRO GENERAL
    public async ActualizarDetalleParametro(req: Request, res: Response): Promise<void> {
        const { id, descripcion } = req.body;
        await pool.query('UPDATE detalle_tipo_parametro SET descripcion = $1 WHERE id = $2',
            [descripcion, id]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // MÉTODO PARA ACTUALIZAR TIPO PARÁMETRO GENERAL
    public async ActualizarTipoParametro(req: Request, res: Response): Promise<void> {
        const { descripcion, id } = req.body;
        await pool.query('UPDATE tipo_parametro SET descripcion = $1 WHERE id = $2',
            [descripcion, id]);
        res.jsonp({ message: 'Registro exitoso.' });
    }

    // MÉTODO PARA ELIMINAR TIPO PARÁMETRO GENERAL
    public async EliminarTipoParametro(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            await pool.query('DELETE FROM tipo_parametro WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            res.jsonp({ message: 'false' });
        }
    }

    // MÉTODO PARA ELIMINAR DETALLE TIPO PARÁMETRO GENERAL
    public async EliminarDetalleParametro(req: Request, res: Response) {
        try {
            const id = req.params.id;
            await pool.query('DELETE FROM detalle_tipo_parametro WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        }
        catch {
            res.jsonp({ message: 'false' });
        }
    }

    // MÉTODO PARA CREAR FORMATO XML
    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "ParametrosGenerales-" + req.body.userName + '-' +
            req.body.userId + '-' + new Date().getTime() + '.xml';
        fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Archivo guardado");
        });
        res.jsonp({ text: 'XML creado', name: filename });
    }

    // MÉTODO PARA DESCARGAR FORMATO XML
    public async downloadXML(req: Request, res: Response): Promise<any> {
        const name = req.params.nameXML;
        let filePath = `servidor\\xmlDownload\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

    public async CompararCoordenadas(req: Request, res: Response): Promise<Response> {
        try {
            const { lat1, lng1, lat2, lng2, valor } = req.body;
            console.log(lat1, lng1, lat2, lng2, valor);
            const VALIDACION = await pool.query('SELECT CASE ( SELECT 1 ' +
                'WHERE ' +
                ' ($1::DOUBLE PRECISION  BETWEEN $3::DOUBLE PRECISION  - $5 AND $3::DOUBLE PRECISION  + $5) AND ' +
                ' ($2::DOUBLE PRECISION  BETWEEN $4::DOUBLE PRECISION  - $5 AND $4::DOUBLE PRECISION  + $5) ' +
                ') IS null WHEN true THEN \'vacio\' ELSE \'ok\' END AS verificar',
                [lat1, lng1, lat2, lng2, valor]);

            console.log(VALIDACION.rows);
            return res.jsonp(VALIDACION.rows);
        } catch (error) {
            console.log(error);
            return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
        }
    }

}

export const PARAMETROS_CONTROLADOR = new ParametrosControlador();

export default PARAMETROS_CONTROLADOR;