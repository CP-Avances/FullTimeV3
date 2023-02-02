import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import fs from 'fs';
import pool from '../../database';
const builder = require('xmlbuilder');

class TipoPermisosControlador {

  // METODO PARA BUSCAR TIPO DE PERMISOS
  public async Listar(req: Request, res: Response) {
    const rolPermisos = await pool.query(
      `
      SELECT * FROM cg_tipo_permisos ORDER BY descripcion ASC
      `
    );
    if (rolPermisos.rowCount > 0) {
      return res.jsonp(rolPermisos.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registros no encontrados.' });
    }
  }

  // METODO PARA ELIMINAR REGISTROS
  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query(
      `
      DELETE FROM cg_tipo_permisos WHERE id = $1
      `
      , [id]);
    res.jsonp({ message: 'Registro eliminado.' });
  }

  // METODO PARA CREAR ARCHIVO XML
  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "TipoPermisos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
    fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
    });
    res.jsonp({ text: 'XML creado', name: filename });
  }

  // METODO PARA DESCARGAR ARCHIVO XML
  public async downloadXML(req: Request, res: Response): Promise<any> {
    const name = req.params.nameXML;
    let filePath = `servidor\\xmlDownload\\${name}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }

  // METODO PARA LISTAR DATOS DE UN TIPO DE PERMISO
  public async BuscarUnTipoPermiso(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unTipoPermiso = await pool.query('SELECT * FROM cg_tipo_permisos WHERE id = $1', [id]);
    if (unTipoPermiso.rowCount > 0) {
      return res.jsonp(unTipoPermiso.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado.' });
  }

  // METODO PARA EDITAR REGISTRO
  public async Editar(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, gene_justificacion, fec_validar, acce_empleado,
      legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha, documento, contar_feriados } = req.body;
    await pool.query(
      `
      UPDATE cg_tipo_permisos SET descripcion = $1, tipo_descuento = $2, num_dia_maximo = $3, num_dia_ingreso = $4, 
        gene_justificacion = $5, fec_validar = $6, acce_empleado = $7, legalizar = $8, almu_incluir = $9, 
        num_dia_justifica = $10, num_hora_maximo = $11, fecha = $12, documento = $13, contar_feriados = $14 
      WHERE id = $15
      `
      , [descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, gene_justificacion, fec_validar, acce_empleado,
        legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha, documento, contar_feriados, id]);
    res.jsonp({ message: 'Registro actualizado.' });
  }

  // METODO PARA CREAR REGISTRO DE TIPO DE PERMISO
  public async Crear(req: Request, res: Response) {
    try {
      const { descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, gene_justificacion, fec_validar, acce_empleado,
        legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha, documento, contar_feriados } = req.body;

      const response: QueryResult = await pool.query(
        `
        INSERT INTO cg_tipo_permisos (descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, gene_justificacion, fec_validar,
           acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha, documento, contar_feriados)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *
        `,
        [descripcion, tipo_descuento, num_dia_maximo, num_dia_ingreso, gene_justificacion, fec_validar,
          acce_empleado, legalizar, almu_incluir, num_dia_justifica, num_hora_maximo, fecha, documento, contar_feriados]);

      const [tipo] = response.rows;

      if (tipo) {
        return res.status(200).jsonp(tipo)
      }
      else {
        return res.status(404).jsonp({ message: 'error' })
      }
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL
  public async ListarTipoPermisoRol(req: Request, res: Response) {
    const acce_empleado = req.params.acce_empleado;
    const rolPermisos = await pool.query(
      `
      SELECT * FROM cg_tipo_permisos WHERE acce_empleado = $1 ORDER BY descripcion
      `
      , [acce_empleado]);
    res.json(rolPermisos.rows);
  }

}

export const TIPO_PERMISOS_CONTROLADOR = new TipoPermisosControlador();

export default TIPO_PERMISOS_CONTROLADOR;