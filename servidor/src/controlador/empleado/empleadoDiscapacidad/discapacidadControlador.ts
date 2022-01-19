import { Request, Response } from 'express';
import pool from '../../../database';

class DiscapacidadControlador {

  public async list(req: Request, res: Response) {
    const DISCAPACIDAD = await pool.query('SELECT * FROM cg_discapacidades');
    if (DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(DISCAPACIDAD.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unaDiscapacidad = await pool.query('SELECT * FROM VistaNombreDiscapacidad WHERE id_empleado = $1', [id_empleado]);
    if (unaDiscapacidad.rowCount > 0) {
      return res.jsonp(unaDiscapacidad.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
    }
  }

  public async create(req: Request, res: Response): Promise<void> {
    const { id_empleado, carn_conadis, porcentaje, tipo } = req.body;
    await pool.query('INSERT INTO cg_discapacidades ( id_empleado, carn_conadis, porcentaje, tipo) VALUES ($1, $2, $3, $4)', [id_empleado, carn_conadis, porcentaje, tipo]);
    console.log(req.body);
    res.jsonp({ message: 'Discapacidad guardada' });
  }

  public async update(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    const { carn_conadis, porcentaje, tipo } = req.body;
    await pool.query('UPDATE cg_discapacidades SET carn_conadis = $1, porcentaje = $2, tipo = $3 WHERE id_empleado = $4', [carn_conadis, porcentaje, tipo, id_empleado]);
    res.jsonp({ message: 'Discapacidad actualizada exitosamente' });
  }

  public async deleteDiscapacidad(req: Request, res: Response): Promise<void> {
    const id_empleado = req.params.id_empleado;
    await pool.query('DELETE FROM cg_discapacidades WHERE id_empleado = $1', [id_empleado]);
    res.jsonp({ message: 'Registro eliminado' });
  }

  /* TIPO DISCAPACIDAD */

  public async ListarTipoD(req: Request, res: Response) {
    const TIPO_DISCAPACIDAD = await pool.query('SELECT * FROM tipo_discapacidad');
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    } 
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ObtenerUnTipoD(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const TIPO_DISCAPACIDAD = await pool.query('SELECT * FROM tipo_discapacidad WHERE id = $1', [id]);
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
      return res.jsonp(TIPO_DISCAPACIDAD.rows)
    } 
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ActualizarTipoD(req: Request, res: Response): Promise<void> {
    const id = req.params;
    const { nombre } = req.body;
    await pool.query('UPDATE tipo_discapacidad SET nombre = $1 WHERE id = $2', [nombre, id]);
    res.jsonp({ message: 'Tipo de Discapacidad actualizado exitosamente' });
  }

  public async CrearTipoD(req: Request, res: Response): Promise<void> {
    const { nombre } = req.body;
    await pool.query('INSERT INTO tipo_discapacidad (nombre) VALUES ($1)', [nombre]);
    console.log(req.body);
    res.jsonp({ message: 'Registro guardado' });
  }

  public async ObtenerUltimoIdTD(req: Request, res: Response) {
    const TIPO_DISCAPACIDAD = await pool.query('SELECT MAX(id) FROM tipo_discapacidad');
    if (TIPO_DISCAPACIDAD.rowCount > 0) {
        return res.jsonp(TIPO_DISCAPACIDAD.rows)
    }
    else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
}

}

export const DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();

export default DISCAPACIDAD_CONTROLADOR;