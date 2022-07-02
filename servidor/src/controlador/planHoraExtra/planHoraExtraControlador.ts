import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales }
  from '../../libs/settingsMail';
import moment from 'moment';
import pool from '../../database';
import path from 'path';

class PlanHoraExtraControlador {

  public async ListarPlanificacion(req: Request, res: Response) {
    const PLAN = await pool.query('SELECT * FROM plan_hora_extra ORDER BY fecha_desde DESC');
    if (PLAN.rowCount > 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPlanHoraExtra(req: Request, res: Response) {
    const PLAN = await pool.query('SELECT e.id AS empl_id, e.codigo, e.cedula, e.nombre, e.apellido, ' +
      't.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta, ' +
      't.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan, ' +
      't.fecha_timbre, t.timbre_entrada, t.timbre_salida, ' +
      '(t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, ' +
      't.estado AS plan_estado ' +
      'FROM empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe ' +
      'FULL JOIN timbres_salida_plan_hora_extra AS tshe ' +
      'ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t ' +
      'WHERE t.observacion = false AND (e.codigo::int = t.id_empleado OR e.codigo::int = t.id_empl) AND (t.estado = 1 OR t.estado = 2)');
    if (PLAN.rowCount > 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPlanHoraExtraObserva(req: Request, res: Response) {
    const PLAN = await pool.query('SELECT e.id AS empl_id, e.codigo, e.cedula, e.nombre, e.apellido, ' +
      't.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta, ' +
      't.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan, ' +
      't.fecha_timbre, t.timbre_entrada, t.timbre_salida, ' +
      '(t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, ' +
      't.estado AS plan_estado ' +
      'FROM empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe ' +
      'FULL JOIN timbres_salida_plan_hora_extra AS tshe ' +
      'ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t ' +
      'WHERE t.observacion = true AND (e.codigo::int = t.id_empleado OR e.codigo::int = t.id_empl) AND (t.estado = 1 OR t.estado = 2)');
    if (PLAN.rowCount > 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPlanHoraExtraAutorizada(req: Request, res: Response) {
    const PLAN = await pool.query('SELECT e.id AS empl_id, e.codigo, e.cedula, e.nombre, e.apellido, ' +
      't.id_empl_cargo, t.id_empl_contrato, t.id_plan_extra, t.tiempo_autorizado, t.fecha_desde, t.fecha_hasta, ' +
      't.hora_inicio, t.hora_fin, (t.h_fin::interval - t.h_inicio::interval)::time AS hora_total_plan, ' +
      't.fecha_timbre, t.timbre_entrada, t.timbre_salida, ' +
      '(t.timbre_salida::interval - t.timbre_entrada::interval)::time AS hora_total_timbre, t.observacion, ' +
      't.estado AS plan_estado ' +
      'FROM empleados AS e, (SELECT * FROM timbres_entrada_plan_hora_extra AS tehe ' +
      'FULL JOIN timbres_salida_plan_hora_extra AS tshe ' +
      'ON tehe.fecha_timbre_e = tshe.fecha_timbre AND tehe.id_empl = tshe.id_empleado) AS t ' +
      'WHERE (e.codigo::int = t.id_empleado OR e.codigo::int = t.id_empl) AND (t.estado = 3 OR t.estado = 4)');
    if (PLAN.rowCount > 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  /** ************************************************************************************************* **
   ** **                METODOS PARA CREACION DE PLANIFICACION DE HORAS EXTRAS                       ** ** 
   ** ************************************************************************************************* **/

  // CREACION DE PLANIFICACION DE HORAS EXTRAS
  public async CrearPlanHoraExtra(req: Request, res: Response): Promise<Response> {
    try {

      const { id_empl_planifica, fecha_desde, fecha_hasta, hora_inicio, hora_fin, descripcion,
        horas_totales } = req.body;

      const response: QueryResult = await pool.query(`
      INSERT INTO plan_hora_extra (id_empl_planifica, fecha_desde, fecha_hasta, hora_inicio, hora_fin, 
        descripcion, horas_totales) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
      `,
        [id_empl_planifica, fecha_desde, fecha_hasta,
          hora_inicio, hora_fin, descripcion, horas_totales]);

      const [planHoraExtra] = response.rows;

      if (!planHoraExtra) {
        return res.status(404).jsonp({ message: 'error' })
      }
      else {
        return res.status(200).jsonp({ message: 'ok', info: planHoraExtra });
      }

    } catch (error) {
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }




  public async ActualizarPlanHoraExtra(req: Request, res: Response) {
    const id = req.params.id;
    const { id_empl_planifica, fecha_desde, fecha_hasta, hora_inicio,
      hora_fin, descripcion, horas_totales } = req.body;
    await pool.query('UPDATE plan_hora_extra SET id_empl_planifica = $1, fecha_desde = $2, ' +
      'fecha_hasta = $3, hora_inicio = $4, hora_fin = $5, descripcion = $6, horas_totales = $7 WHERE id = $8 ',
      [id_empl_planifica, fecha_desde, fecha_hasta,
        hora_inicio, hora_fin, descripcion, horas_totales, id]);
    res.jsonp({ message: 'Planificacion registrada' });

  }

  public async EncontrarUltimoPlan(req: Request, res: Response): Promise<any> {
    const PLAN = await pool.query('SELECT MAX(id) AS id_plan_hora FROM plan_hora_extra');
    if (PLAN.rowCount > 0) {
      if (PLAN.rows[0]['id_plan_hora'] != null) {
        return res.jsonp(PLAN.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registro no encontrado' });
      }
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  /** ************************************************************************************************* **
   ** **                  METODOS DE PLANIFICACION DE HORAS EXTRAS POR USUARIO                       ** **
   ** ************************************************************************************************* **/

  // CREAR PLANIFICACION DE HE POR USUARIO
  public async CrearPlanHoraExtraEmpleado(req: Request, res: Response) {

    try {

      const { id_plan_hora, id_empl_realiza, observacion, id_empl_cargo, id_empl_contrato, estado, codigo } = req.body;

      const response: QueryResult = await pool.query(
        `
          INSERT INTO plan_hora_extra_empleado (id_plan_hora, id_empl_realiza, observacion, 
            id_empl_cargo, id_empl_contrato, estado, codigo)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `,
        [id_plan_hora, id_empl_realiza, observacion, id_empl_cargo, id_empl_contrato, estado, codigo]);

      const [planEmpleado] = response.rows;
      if (!planEmpleado) return res.status(400).jsonp({ message: 'Error' });

      return res.status(200).jsonp({ message: 'Planificación registrada con éxito.', info: planEmpleado });

    } catch (error) {
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }

  }

  public async ListarPlanEmpleados(req: Request, res: Response) {
    const id = req.params.id_plan_hora;
    const PLAN = await pool.query('SELECT * FROM plan_hora_extra_empleado WHERE id_plan_hora = $1', [id]);
    if (PLAN.rowCount > 0) {
      res.jsonp(PLAN.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async TiempoAutorizado(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const { hora } = req.body;
    let respuesta = await pool.query('UPDATE plan_hora_extra_empleado SET tiempo_autorizado = $2 WHERE id = $1', [id, hora]).then(result => {
      return { message: 'Tiempo de hora autorizada confirmada' }
    });
    res.jsonp(respuesta)
  }

  public async ActualizarObservacion(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { observacion } = req.body;
    await pool.query('UPDATE plan_hora_extra_empleado SET observacion = $1 WHERE id = $2', [observacion, id]);
    res.jsonp({ message: 'Planificación Actualizada' });
  }

  public async ActualizarEstado(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { estado } = req.body;
    await pool.query('UPDATE plan_hora_extra_empleado SET estado = $1 WHERE id = $2', [estado, id]);
    res.jsonp({ message: 'Estado de Planificación Actualizada' });
  }


  public async EnviarCorreoNotificacion(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {


      let { id_empl_envia, id_empl_recive, mensaje } = req.body;

      var f = new Date();
      f.setUTCHours(f.getHours())

      let create_at = f.toJSON();
      let tipo = 1; // es el tipo de aviso 
      // console.log(id_empl_envia, id_empl_recive, create_at, mensaje, tipo);
      await pool.query('INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) VALUES($1, $2, $3, $4, $5)', [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);

      const Envia = await pool.query('SELECT nombre, apellido, correo FROM empleados WHERE id = $1', [id_empl_envia]).then(resultado => { return resultado.rows[0] });
      const Recibe = await pool.query('SELECT nombre, apellido, correo FROM empleados WHERE id = $1', [id_empl_recive]).then(resultado => { return resultado.rows[0] });

      let data = {
        // from: Envia.correo,
        from: email,
        to: Recibe.correo,
        subject: 'Justificacion Hora Extra',
        html: `<p><h4><b>${Envia.nombre} ${Envia.apellido}</b> </h4> escribe: <b>${mensaje}</b> 
            <h4>A usted: <b>${Recibe.nombre} ${Recibe.apellido} </b></h4>
            `
      };
      let port = 465;

      if (puerto != null && puerto != '') {
        port = parseInt(puerto);
      }
      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });


      res.jsonp({ message: 'Se envio notificacion y correo electrónico.' })
    } else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }
  }

  public async ObtenerDatosAutorizacion(req: Request, res: Response) {
    const id = req.params.id_plan_extra;
    const SOLICITUD = await pool.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
      'p.id AS id_plan_extra, pe.id AS plan_hora_extra_empleado FROM autorizaciones AS a, plan_hora_extra AS p, ' +
      'plan_hora_extra_empleado AS pe ' +
      'WHERE pe.id = a.id_plan_hora_extra AND pe.id_plan_hora = p.id AND p.id = $1', [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }


  /** ********************************************************************************************* **
   ** *             ENVIO DE CORREOS ELECTRONICOS DE PLANIFICACIÓN DE HORAS EXTRAS                  **
   ** ********************************************************************************************* **/

  // MÉTODO ENVIO CORREO DESDE APLICACIÓN WEB CREACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS
  public async EnviarCorreoPlanificacion(req: Request, res: Response): Promise<void> {
    var tiempo = fechaHora();

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_empl_envia, correos, nombres, observacion, desde, hasta, inicio, fin, horas } = req.body;

      const Envia = await pool.query(`
        SELECT da.nombre, da.apellido, da.cedula, da.correo, 
        (SELECT tc.cargo FROM tipo_cargo AS tc WHERE tc.id = ec.cargo) AS tipo_cargo,
        (SELECT cd.nombre FROM cg_departamentos AS cd WHERE cd.id = ec.id_departamento) AS departamento
        FROM datos_actuales_empleado AS da, empl_cargos AS ec
        WHERE da.id = $1 AND ec.id = da.id_cargo
      `,
        [id_empl_envia]).then(resultado => { return resultado.rows[0] });

      let data = {
        from: email,
        to: correos,
        subject: 'PLANIFICACION DE HORAS EXTRAS',
        html: `
               <body>
                   <div style="text-align: center;">
                       <img width="25%" height="25%" src="cid:cabeceraf"/>
                   </div>
                   <br>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       El presente correo es para informar que se ha creado la siguiente planificación de horas extras: <br>  
                   </p>
                   <h3 style="font-family: Arial; text-align: center;">DATOS DEL COLABORADOR QUE REALIZA PLANIFICACIÓN HORAS EXTRAS</h3>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       <b>Empresa:</b> ${nombre} <br>   
                       <b>Asunto:</b> Planificación de realización de horas extras <br> 
                       <b>Colaborador que envía:</b> ${Envia.nombre} ${Envia.apellido} <br>
                       <b>Número de Cédula:</b> ${Envia.cedula} <br>
                       <b>Cargo:</b> ${Envia.tipo_cargo} <br>
                       <b>Departamento:</b> ${Envia.departamento} <br>
                       <b>Generado mediante:</b> Aplicación Web <br>
                       <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                       <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                   </p>
                   <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA PLANIFICACIÓN DE HORAS EXTRAS</h3>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       <b>Motivo:</b> ${observacion} <br>   
                       <b>Fecha de Planificación:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                       <b>Desde:</b> ${desde} <br>
                       <b>Hasta:</b> ${hasta} <br>
                       <b>Horario:</b> ${inicio} a ${fin} <br>
                       <b>Número de horas planificadas:</b> ${horas} <br>
                       <b>Colabores que cuenta con planificación de horas extras:</b>
                  </p>
                  <div style="text-align: center;"> 
                      <table border=2 cellpadding=10 cellspacing=0 style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px;">
                        <tr>
                          <th><h5>COLABORADOR</h5></th> 
                          <th><h5>CÉDULA</h5></th> 
                        </tr>            
                        ${nombres} 
                     </table>
                  </div>
                   <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                       <b>Gracias por la atención</b> <br>
                       <b>Saludos cordiales,</b> <br><br>
                   </p>
                   <img src="cid:pief" width="50%" height="50%"/>                 
                </body>
            `,
        attachments: [
          {
            filename: 'cabecera_firma.jpg',
            path: `${path_folder}/${cabecera_firma}`,
            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          },
          {
            filename: 'pie_firma.jpg',
            path: `${path_folder}/${pie_firma}`,
            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
          }]
      };

      var corr = enviarMail(servidor, parseInt(puerto));
      corr.sendMail(data, function (error: any, info: any) {
        if (error) {
          console.log('Email error: ' + error);
          return res.jsonp({ message: 'error' });
        } else {
          console.log('Email sent: ' + info.response);
          return res.jsonp({ message: 'ok' });
        }
      });
    } else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }

  }


  /** ********************************************************************************************* **
   ** *             ENVIO DE NOTIFICACIONES DE PLANIFICACIÓN DE HORAS EXTRAS                      * **
   ** ********************************************************************************************* **/

  // ENVIO DE NOTIFICACION DE PLANIFICACION DE HORAS EXTRAS
  public async EnviarNotiPlanHE(req: Request, res: Response): Promise<Response> {
    try {
      var tiempo = fechaHora();

      const { id_empl_envia, id_empl_recive, mensaje, tipo } = req.body;
      let create_at = tiempo.fecha_formato + ' ' + tiempo.hora;

      const response: QueryResult = await pool.query(
        `
      INSERT INTO realtime_timbres (create_at, id_send_empl, id_receives_empl, descripcion, tipo) 
      VALUES($1, $2, $3, $4, $5) RETURNING *
      `,
        [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);
      const [notificiacion] = response.rows;

      if (!notificiacion) return res.status(400).jsonp({ message: 'error' });

      return res.status(200).jsonp({ message: 'ok' });

    } catch (error) {
      return res.status(500)
        .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }

  }

}

export const PLAN_HORA_EXTRA_CONTROLADOR = new PlanHoraExtraControlador();

export default PLAN_HORA_EXTRA_CONTROLADOR;