import { Request, Response } from 'express';
import pool from '../../database';
import { enviarMail, email, Credenciales } from '../../libs/settingsMail'

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

  public async CrearPlanHoraExtra(req: Request, res: Response) {
    const { id_empl_planifica, fecha_desde, fecha_hasta, hora_inicio,
      hora_fin, descripcion, horas_totales } = req.body;
    await pool.query('INSERT INTO plan_hora_extra (id_empl_planifica, fecha_desde, ' +
      'fecha_hasta, hora_inicio, hora_fin, descripcion, horas_totales) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id_empl_planifica, fecha_desde, fecha_hasta,
        hora_inicio, hora_fin, descripcion, horas_totales]);
    res.jsonp({ message: 'Planificacion registrada' });
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

  // PLANIFICACIÓN DE CADA EMPLEADO --- TABLA plan_hora_extra_empleado
  public async CrearPlanHoraExtraEmpleado(req: Request, res: Response) {
    const { id_plan_hora, id_empl_realiza, observacion, id_empl_cargo,
      id_empl_contrato, estado, codigo } = req.body;
    await pool.query('INSERT INTO plan_hora_extra_empleado (id_plan_hora, id_empl_realiza, observacion, ' +
      'id_empl_cargo, id_empl_contrato, estado, codigo) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id_plan_hora, id_empl_realiza, observacion, id_empl_cargo,
        id_empl_contrato, estado, codigo]);
    res.jsonp({ message: 'Planificacion registrada' });
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
    Credenciales(req.id_empresa);
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
    enviarMail(data);

    res.jsonp({ message: 'Se envio notificacion y correo electrónico.' })
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

  public async EnviarCorreoPlanificacion(req: Request, res: Response): Promise<void> {
    Credenciales(req.id_empresa)
    let { id_empl_envia, id_empl_recive, mensaje } = req.body;

    var f = new Date();
    f.setUTCHours(f.getHours())

    let create_at = f.toJSON();
    let tipo = 1; // es el tipo de aviso 
    // console.log(id_empl_envia, id_empl_recive, create_at, mensaje, tipo);
    await pool.query('INSERT INTO realtime_timbres(create_at, id_send_empl, id_receives_empl, descripcion, tipo) VALUES($1, $2, $3, $4, $5)', [create_at, id_empl_envia, id_empl_recive, mensaje, tipo]);

    const Envia = await pool.query('SELECT nombre, apellido, correo FROM empleados WHERE id = $1', [id_empl_envia]).then(resultado => { return resultado.rows[0] });
    const Recibe = await pool.query('SELECT nombre, apellido, correo FROM empleados WHERE id = $1', [id_empl_recive]).then(resultado => { return resultado.rows[0] });
    console.log(Envia.correo, 'djjj', Recibe.correo)
    let data = {
      // from: Envia.correo,
      from: email,
      to: Recibe.correo,
      subject: 'Planificación de Horas Extras',
      html: `<p><h4><b>${Envia.nombre} ${Envia.apellido}</b> </h4> escribe: <b>${mensaje}</b> 
            <h4>A usted: <b>${Recibe.nombre} ${Recibe.apellido} </b></h4>
            `
    };
    enviarMail(data);

    res.jsonp({ message: 'Se envio notificacion y correo electrónico.' })
  }

}

export const PLAN_HORA_EXTRA_CONTROLADOR = new PlanHoraExtraControlador();

export default PLAN_HORA_EXTRA_CONTROLADOR;