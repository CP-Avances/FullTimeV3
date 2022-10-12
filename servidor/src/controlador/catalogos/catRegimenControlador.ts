import { Request, Response } from 'express';
import fs from 'fs';
import pool from '../../database';
const builder = require('xmlbuilder');

class RegimenControlador {

    // REGISTRO DE REGIMEN LABORAL
    public async CrearRegimen(req: Request, res: Response) {

        try {
            const { descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
                anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
                dias_totales_anio } = req.body;

            await pool.query(
                `
                INSERT INTO cg_regimenes 
                    (descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                    dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion, 
                    anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes, 
                    dias_totales_anio)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `
                , [descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                    dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
                    anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
                    dias_totales_anio]);

            res.jsonp({ message: 'Regimen guardado' });
        }
        catch (error) {
            return res.jsonp({ message: 'error' });
        }
    }

    // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
    public async ActualizarRegimen(req: Request, res: Response): Promise<void> {

        const { descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
            dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
            anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
            dias_totales_anio, id } = req.body;

        await pool.query(
            `
            UPDATE cg_regimenes SET descripcion = $1, meses_periodo = $2, dias_per_vacacion_laboral = $3,
            dias_per_vacacion_calendario = $4, dias_mes_vacacion_laboral = $5,
            dias_mes_vacacion_calendario = $6, dias_libre_vacacion = $7, anio_antiguedad = $8,
            dia_incr_antiguedad = $9, max_dia_acumulacion = $10, dias_totales_mes = $11, 
            dias_totales_anio = $12 WHERE id = $13
            `
            , [descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
                anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
                dias_totales_anio, id]);

        res.jsonp({ message: 'Regimen guardado' });
    }

    // METODO PARA BUSCAR LISTA DE REGIMEN
    public async ListarRegimen(req: Request, res: Response) {
        const REGIMEN = await pool.query(
            `
            SELECT * FROM cg_regimenes ORDER BY descripcion ASC
            `
        );
        if (REGIMEN.rowCount > 0) {
            return res.jsonp(REGIMEN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }




    public async ListarUnRegimen(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const REGIMEN = await pool.query('SELECT * FROM cg_regimenes WHERE id = $1', [id]);
        if (REGIMEN.rowCount > 0) {
            return res.jsonp(REGIMEN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }



    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "RegimenLaboral-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
        fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Archivo guardado");
        });
        res.jsonp({ text: 'XML creado', name: filename });
    }

    public async downloadXML(req: Request, res: Response): Promise<any> {
        const name = req.params.nameXML;
        let filePath = `servidor\\xmlDownload\\${name}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM cg_regimenes WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado' });
    }

    public async ListarRegimenSucursal(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const REGIMEN = await pool.query(' SELECT r.id, r.descripcion FROM cg_regimenes AS r, empl_cargos AS ec, ' +
            'empl_contratos AS c WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ec.id_sucursal = $1 ' +
            'GROUP BY r.id, r.descripcion', [id]);
        if (REGIMEN.rowCount > 0) {
            return res.jsonp(REGIMEN.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }


}

const REGIMEN_CONTROLADOR = new RegimenControlador();

export default REGIMEN_CONTROLADOR;
