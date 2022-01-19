import { Request, Response } from 'express';
import pool from '../../../database';

class EmpleadoProcesoControlador {

  public async ListarEmpleProcesos(req: Request, res: Response) {
    const PROCESOS = await pool.query('SELECT *FROM empl_procesos');
    if (PROCESOS.rowCount > 0) {
      return res.jsonp(PROCESOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CrearEmpleProcesos(req: Request, res: Response): Promise<void> {
    const { id, id_empl_cargo, fec_inicio, fec_final } = req.body;
    await pool.query('INSERT INTO empl_procesos (id, id_empl_cargo, fec_inicio, fec_final) VALUES ($1, $2, $3, $4)', [id, id_empl_cargo, fec_inicio, fec_final]);
    res.jsonp({ message: 'Procesos del empleado guardados con éxito' });
  }

  public async EncontrarProcesoPorIdCargo(req: Request, res: Response): Promise<any> {
    const { id_empl_cargo } = req.params;
    const HORARIO_CARGO = await pool.query('SELECT ep.id_p, ep.id, ep.id_empl_cargo, ep.fec_inicio, ep.fec_final, cp.nombre AS proceso FROM empl_procesos AS ep, cg_procesos AS cp WHERE ep.id_empl_cargo = $1 AND ep.id = cp.id', [id_empl_cargo]);
    if (HORARIO_CARGO.rowCount > 0) {
      return res.jsonp(HORARIO_CARGO.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  public async ActualizarProcesoEmpleado(req: Request, res: Response): Promise<void> {
    const { id, id_empl_cargo, fec_inicio, fec_final, id_p } = req.body;
    await pool.query('UPDATE empl_procesos SET id = $1, id_empl_cargo = $2, fec_inicio = $3, fec_final = $4 WHERE id_p = $5', [id, id_empl_cargo, fec_inicio, fec_final, id_p]);
    res.jsonp({ message: 'Proceso actualizado exitosamente' });
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query('DELETE FROM empl_procesos WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado' });
  }




}

export const EMPLEADO_PROCESO_CONTROLADOR = new EmpleadoProcesoControlador();

export default EMPLEADO_PROCESO_CONTROLADOR;