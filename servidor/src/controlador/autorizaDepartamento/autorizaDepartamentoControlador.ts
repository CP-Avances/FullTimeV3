import { Request, Response } from 'express';
import pool from '../../database';

class AutorizaDepartamentoControlador {

    public async ListarAutorizaDepartamento(req: Request, res: Response) {
        const AUTORIZA = await pool.query('SELECT * FROM depa_autorizaciones');
        if (AUTORIZA.rowCount > 0) {
            return res.jsonp(AUTORIZA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearAutorizaDepartamento(req: Request, res: Response): Promise<void> {
        const { id_departamento, id_empl_cargo, estado } = req.body;
        await pool.query('INSERT INTO depa_autorizaciones (id_departamento, id_empl_cargo, estado) VALUES ($1, $2, $3)', [id_departamento, id_empl_cargo, estado]);
        res.jsonp({ message: 'Autorización se registró con éxito' });
    }

    public async EncontrarAutorizacionCargo(req: Request, res: Response) {
        const { id_empl_cargo } = req.params;
        const AUTORIZA = await pool.query('SELECT * FROM VistaDepartamentoAutoriza WHERE id_empl_cargo= $1', [id_empl_cargo]);
        if (AUTORIZA.rowCount > 0) {
            return res.jsonp(AUTORIZA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerQuienesAutorizan(req: Request, res: Response): Promise<any> {
        const { id_depar } = req.params;
        const EMPLEADOS = await pool.query('SELECT * FROM VistaAutorizanCargo WHERE id_depar = $1', [id_depar]);
        if (EMPLEADOS.rowCount > 0) {
            return res.jsonp(EMPLEADOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'Registros no encontrados' });
        }
    }

    public async ActualizarAutorizaDepartamento(req: Request, res: Response): Promise<void> {
        const { id_departamento, id_empl_cargo, estado, id } = req.body;
        await pool.query('UPDATE depa_autorizaciones SET id_departamento = $1, id_empl_cargo = $2, estado = $3 WHERE id = $4', [id_departamento, id_empl_cargo, estado, id]);
        res.jsonp({ message: 'Autorización se registró con éxito' });
    }

    public async EliminarAutorizacionDepartamento(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM depa_autorizaciones WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado' });
    }

}

export const AUTORIZA_DEPARTAMENTO_CONTROLADOR = new AutorizaDepartamentoControlador();

export default AUTORIZA_DEPARTAMENTO_CONTROLADOR;