import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import pool from '../../database';
import excel from 'xlsx';
import fs from 'fs';
const builder = require('xmlbuilder');

class HorarioControlador {


  // REGISTRAR HORARIO
  public async CrearHorario(req: Request, res: Response): Promise<Response> {
    const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle } = req.body;
    const response: QueryResult = await pool.query(
      `
      INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
      nocturno, detalle) VALUES ($1, $2, $3, $4, $5) RETURNING *
      `
      , [nombre, min_almuerzo, hora_trabajo, nocturno, detalle]);

    const [horario] = response.rows;

    if (horario) {
      return res.status(200).jsonp(horario)
    }
    else {
      return res.status(404).jsonp({ message: 'error' })
    }
  }

  // BUSCAR HORARIOS POR EL NOMBRE
  public async BuscarHorarioNombre(req: Request, res: Response) {
    const { nombre } = req.query;
    try {
      const HORARIOS = await pool.query(
        `
        SELECT * FROM cg_horarios WHERE UPPER(nombre) = $1
        `
        , [nombre.toUpperCase()]);

      if (HORARIOS.rowCount > 0) return res.status(200).jsonp({ message: 'No se encuentran registros.' });

      return res.status(400).jsonp({ message: 'No existe horario. Continua.' })

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }

  }

  // GUARDAR DOCUMENTO DE HORARIO
  public async GuardarDocumentoHorario(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let doc = list.uploads[0].path.split("\\")[1];
    let { nombre } = req.params;
    let id = req.params.id

    await pool.query(
      `
      UPDATE cg_horarios SET documento = $2, doc_nombre = $3 WHERE id = $1
      `
      , [id, doc, nombre]);

    res.jsonp({ message: 'Documento Actualizado' });
  }

  // METODO PARA ACTUALIZAR DATOS DE HORARIO
  public async EditarHorario(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle } = req.body;

    try {
      const respuesta = await pool.query(
        `
        UPDATE cg_horarios SET nombre = $1, min_almuerzo = $2, hora_trabajo = $3,  
        nocturno = $4, detalle = $5 
        WHERE id = $6 RETURNING *
        `
        , [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, id])
        .then(result => { return result.rows })

      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'Horario no Actualizado' });

      return res.status(200).jsonp(respuesta);

    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

  // ELIMINAR DOCUMENTO HORARIO BASE DE DATOS - SERVIDOR
  public async EliminarDocumento(req: Request, res: Response): Promise<void> {
    let { documento, id } = req.body;

    await pool.query(
      `
            UPDATE cg_horarios SET documento = null, doc_nombre = null WHERE id = $1
            `
      , [id]);

    if (documento != 'null' && documento != '' && documento != null) {
      let filePath = `servidor\\horarios\\${documento}`
      let direccionCompleta = __dirname.split("servidor")[0] + filePath;
      fs.unlinkSync(direccionCompleta);
    }

    res.jsonp({ message: 'Documento Actualizado' });
  }

  // ELIMINAR DOCUMENTO HORARIO DEL SERVIDOR
  public async EliminarDocumentoServidor(req: Request, res: Response): Promise<void> {
    let { documento } = req.body;
    if (documento != 'null' && documento != '' && documento != null) {
      let filePath = `servidor\\horarios\\${documento}`
      let direccionCompleta = __dirname.split("servidor")[0] + filePath;
      fs.unlinkSync(direccionCompleta);
    }

    res.jsonp({ message: 'Documento Actualizado' });
  }











  public async ListarHorarios(req: Request, res: Response) {
    const HORARIOS = await pool.query('SELECT * FROM cg_horarios ORDER BY id');
    if (HORARIOS.rowCount > 0) {
      return res.jsonp(HORARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerUnHorario(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const UN_HORARIO = await pool.query('SELECT * FROM cg_horarios WHERE id = $1', [id]);
    if (UN_HORARIO.rowCount > 0) {
      return res.jsonp(UN_HORARIO.rows)
    }
    else {
      res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }



  public async CargarHorarioPlantilla(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    /** Horarios */
    plantilla.forEach(async (data: any) => {
      var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
      if (minutos_almuerzo != undefined) {
        await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
        res.jsonp({ message: 'correcto' });
      } else {
        minutos_almuerzo = 0;
        await pool.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
        res.jsonp({ message: 'correcto' });
      }
    });
    fs.unlinkSync(filePath);
  }

  /** Verificar si existen datos duplicados dentro del sistema */
  public async VerificarDatos(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    /** Horarios */
    var contarNombre = 0;
    var contarDatos = 0;
    var contador = 1;
    plantilla.forEach(async (data: any) => {
      var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;

      // Verificar que los datos obligatorios existan
      if (nombre_horario != undefined && hora_trabajo != undefined && horario_nocturno != undefined) {
        contarDatos = contarDatos + 1;
      }

      // Verificar que el nombre del horario no se encuentre registrado
      if (nombre_horario != undefined) {
        const NOMBRES = await pool.query('SELECT * FROM cg_horarios WHERE UPPER(nombre) = $1',
          [nombre_horario.toUpperCase()]);
        if (NOMBRES.rowCount === 0) {
          contarNombre = contarNombre + 1;
        }
      }

      // Verificar que todos los datos sean correctos
      if (contador === plantilla.length) {
        if (contarNombre === plantilla.length && contarDatos === plantilla.length) {
          return res.jsonp({ message: 'correcto' });
        } else {
          return res.jsonp({ message: 'error' });
        }
      }
      contador = contador + 1;
    });
    fs.unlinkSync(filePath);
  }

  /** Verificar que los datos dentro de la plantilla no se encuntren duplicados */
  public async VerificarPlantilla(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarNombreData = 0;
    var contador_arreglo = 1;
    var arreglos_datos: any = [];
    //Leer la plantilla para llenar un array con los datos nombre para verificar que no sean duplicados
    plantilla.forEach(async (data: any) => {
      // Datos que se leen de la plantilla ingresada
      var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
      let datos_array = {
        nombre: nombre_horario,
      }
      arreglos_datos.push(datos_array);
    });

    // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
    for (var i = 0; i <= arreglos_datos.length - 1; i++) {
      for (var j = 0; j <= arreglos_datos.length - 1; j++) {
        if (arreglos_datos[i].nombre.toUpperCase() === arreglos_datos[j].nombre.toUpperCase()) {
          contarNombreData = contarNombreData + 1;
        }
      }
      contador_arreglo = contador_arreglo + 1;
    }

    // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
    console.log('nombre_data', contarNombreData, plantilla.length, contador_arreglo);
    if ((contador_arreglo - 1) === plantilla.length) {
      if (contarNombreData === plantilla.length) {
        return res.jsonp({ message: 'correcto' });
      } else {
        return res.jsonp({ message: 'error' });
      }
    }
    fs.unlinkSync(filePath);
  }



  public async EditarHoraTrabajaByHorarioDetalle(req: Request, res: Response): Promise<any> {
    const id = req.params.id;
    const { hora_trabajo } = req.body;
    try {
      const respuesta = await pool.query('UPDATE cg_horarios SET hora_trabajo = $1 WHERE id = $2 RETURNING *', [hora_trabajo, id])
        .then(result => { return result.rows })
      if (respuesta.length === 0) return res.status(400).jsonp({ message: 'No Actualizado' });

      return res.status(200).jsonp(respuesta)
    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "Horarios-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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

  public async ObtenerDocumento(req: Request, res: Response): Promise<any> {
    const docs = req.params.docs;
    let filePath = `servidor\\horarios\\${docs}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }






  public async EditarDocumento(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { documento } = req.body;
    await pool.query('UPDATE cg_horarios SET documento = $1 WHERE id = $2', [documento, id]);

    res.jsonp({ message: 'Tipo Permiso Actualizado' });
  }

  public async EliminarRegistros(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await pool.query('DELETE FROM cg_horarios WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado' });
  }



  public async VerificarDuplicadosEdicion(req: Request, res: Response) {
    const { id, nombre } = req.query;
    //console.log('+++++++++++++++++++++++++++++++++++++ llego aqui');
    console.log(req.query);
    try {
      const HORARIOS = await pool.query('SELECT * FROM cg_horarios WHERE NOT id = $1 AND UPPER(nombre) = $2',
        [parseInt(id), nombre.toUpperCase()]);
      console.log(HORARIOS.rows);
      if (HORARIOS.rowCount > 0) return res.status(200).jsonp({ message: 'El nombre de horario ya existe, ingresar un nuevo nombre.' });

      return res.status(400).jsonp({ message: 'No existe horario. Continua.' })
    } catch (error) {
      return res.status(400).jsonp({ message: error });
    }
  }

}

export const HORARIO_CONTROLADOR = new HorarioControlador();

export default HORARIO_CONTROLADOR;