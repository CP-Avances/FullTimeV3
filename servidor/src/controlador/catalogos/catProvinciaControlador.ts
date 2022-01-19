import { Request, Response } from 'express';
import pool from '../../database';

class ProvinciaControlador {
  
    public async ListarProvincia(req: Request, res: Response) {
      const PROVINCIA = await pool.query('SELECT *FROM VistaNombrePais ORDER BY pais, nombre ASC');
      if (PROVINCIA.rowCount > 0) {
        return res.jsonp(PROVINCIA.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
      }
    }

    public async ListarContinentes(req: Request, res: Response) {
      const CONTINENTE = await pool.query('SELECT continente FROM cg_paises GROUP BY continente ORDER BY continente ASC');
      if (CONTINENTE.rowCount > 0) {
        return res.jsonp(CONTINENTE.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
      }
    }

    public async ListarPaises(req: Request, res: Response) {
      const { continente } = req.params;
      const CONTINENTE = await pool.query('SELECT * FROM cg_paises WHERE continente = $1 ORDER BY nombre ASC', [continente]);
      if (CONTINENTE.rowCount > 0) {
        return res.jsonp(CONTINENTE.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
      }
    }
 
    public async ObtenerUnaProvincia(req: Request, res: Response): Promise<any> {
      const { id_pais } = req.params;
      const UNA_PROVINCIA = await pool.query('SELECT * FROM cg_provincias WHERE id_pais = $1', [id_pais]);
      if (UNA_PROVINCIA.rowCount > 0) {
        return res.jsonp(UNA_PROVINCIA.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
      }
    }

    public async ObtenerProvincia(req: Request, res: Response): Promise<any> {
      const { id } = req.params;
      const UNA_PROVINCIA = await pool.query('SELECT * FROM cg_provincias WHERE id = $1', [id]);
      if (UNA_PROVINCIA.rowCount > 0) {
        return res.jsonp(UNA_PROVINCIA.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
      }
    }

    public async ObtenerIdProvincia(req: Request, res: Response): Promise<any> {
      const { nombre } = req.params;
      const UNA_PROVINCIA = await pool.query('SELECT * FROM cg_provincias WHERE nombre = $1', [nombre]);
      if (UNA_PROVINCIA.rowCount > 0) {
        return res.jsonp(UNA_PROVINCIA.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
      }
    }

    public async ObtenerPais(req: Request, res: Response): Promise<any> {
      const { id } = req.params;
      const PAIS = await pool.query('SELECT * FROM cg_paises WHERE id = $1', [id]);
      if (PAIS.rowCount > 0) {
        return res.jsonp(PAIS.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
      }
    }

    public async ListarTodoPais(req: Request, res: Response) {
      const PAIS = await pool.query('SELECT *FROM cg_paises');
      if (PAIS.rowCount > 0) {
        return res.jsonp(PAIS.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'No se encuentran registros' });
      }
    }
  
    public async CrearProvincia(req: Request, res: Response): Promise<void> {
      const { nombre, id_pais } = req.body;
      await pool.query('INSERT INTO cg_provincias (nombre, id_pais) VALUES ($1, $2)', [nombre, id_pais]);
      res.jsonp({ message: 'La provincia ha sido guardada con éxito' });
    }

    public async EliminarProvincia(req: Request, res: Response): Promise<void> {
      const id  = req.params.id;
      await pool.query('DELETE FROM cg_provincias WHERE id = $1', [id]);
      res.jsonp({ message: 'Registro eliminado' });
    }
  }
  
  export const PROVINCIA_CONTROLADOR = new ProvinciaControlador();
  
  export default PROVINCIA_CONTROLADOR;