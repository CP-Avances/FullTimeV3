import { Request, Response } from 'express';
import pool from '../../database';

class PlanGeneralControlador {

    public async CrearPlanificacion(req: Request, res: Response): Promise<any> {
        const { fec_hora_horario, maxi_min_espera, estado, id_det_horario,
            fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario } = req.body;
        try {
            console.log(req.body);
            
            const [result] = await pool.query('INSERT INTO plan_general (fec_hora_horario, maxi_min_espera, estado, id_det_horario, ' +
                'fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [fec_hora_horario, maxi_min_espera, estado, id_det_horario, fec_horario, id_empl_cargo, tipo_entr_salida, codigo, id_horario])
                .then(result => { return result.rows })
            if (result === undefined) return res.status(404).jsonp({message: 'Planificacion no creada'})

            return res.jsonp({ message: 'Planificación ha sido guardado con éxito' });
            
        } catch (error) {
            console.log(error);
            
            return res.status(500).jsonp({ message: 'Registros no encontrados' });
        }
    }

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM plan_general WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado' });
    }

    public async BuscarFechas(req: Request, res: Response) {
        const { fec_inicio, fec_final, id_horario, codigo } = req.body;
        const FECHAS = await pool.query('SELECT id FROM plan_general WHERE ' +
            '(fec_horario BETWEEN $1 AND $2) AND id_horario = $3 AND codigo = $4',
            [fec_inicio, fec_final, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async BuscarFecha(req: Request, res: Response) {
        const { fec_inicio, id_horario, codigo } = req.body;
        const FECHAS = await pool.query('SELECT id FROM plan_general WHERE fec_horario = $1 AND ' +
            'id_horario = $2 AND codigo = $3',
            [fec_inicio, id_horario, codigo]);
        if (FECHAS.rowCount > 0) {
            return res.jsonp(FECHAS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

}

export const PLAN_GENERAL_CONTROLADOR = new PlanGeneralControlador();

export default PLAN_GENERAL_CONTROLADOR;