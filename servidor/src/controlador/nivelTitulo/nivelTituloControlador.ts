import { Request, Response } from 'express';
const builder = require('xmlbuilder');
import pool from '../../database';
import fs from 'fs';

class NivelTituloControlador {
  public async list(req: Request, res: Response) {
    const titulo = await pool.query('SELECT * FROM nivel_titulo ORDER BY nombre ASC');
    if (titulo.rowCount > 0) {
      return res.jsonp(titulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unNivelTitulo = await pool.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'Registro no encontrado' });
    }

  }

  public async ObtenerNivelNombre(req: Request, res: Response): Promise<any> {
    const { nombre } = req.params;
    const unNivelTitulo = await pool.query('SELECT * FROM nivel_titulo WHERE nombre = $1', [nombre]);
    if (unNivelTitulo.rowCount > 0) {
      return res.jsonp(unNivelTitulo.rows)
    }
    res.status(404).jsonp({ text: 'Registro no encontrado' });
  }

  public async create(req: Request, res: Response): Promise<void> {
    const { nombre } = req.body;
    await pool.query('INSERT INTO nivel_titulo ( nombre ) VALUES ($1)', [nombre]);
    res.jsonp({ message: 'Nivel del Titulo guardado' });
  }

  public async ActualizarNivelTitulo(req: Request, res: Response): Promise<void> {
    const { nombre, id } = req.body;
    await pool.query('UPDATE nivel_titulo SET nombre = $1 WHERE id = $2', [nombre, id]);
    res.jsonp({ message: 'Nivel de Título actualizado exitosamente' });
  }

  public async EliminarNivelTitulo(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    console.log(id);
    await pool.query('DELETE FROM nivel_titulo WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado' });
  }

  public async ObtenerUltimoId(req: Request, res: Response) {
    const ultimoRegistro = await pool.query('SELECT MAX(id) FROM nivel_titulo');
    if (ultimoRegistro.rowCount > 0) {
      return res.jsonp(ultimoRegistro.rows)
    }
    else {
      return res.jsonp({ message: 'Registro no encontrado' })
    }
  }

  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "NvelTitulos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

}

export const NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();

export default NIVEL_TITULO_CONTROLADOR;