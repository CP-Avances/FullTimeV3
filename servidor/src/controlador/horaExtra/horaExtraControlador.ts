import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import { VerificarHorario } from '../../libs/MetodosHorario';
import { ReporteHoraExtra } from '../../class/HorasExtras';
import { enviarMail, email, nombre, cabecera_firma, pie_firma, servidor, puerto, fechaHora, Credenciales }
  from '../../libs/settingsMail';
import pool from '../../database';
import path from 'path';
const nodemailer = require("nodemailer");

class HorasExtrasPedidasControlador {
  public async ListarHorasExtrasPedidas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
      'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
      'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
      'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
      '(h.estado = 1 OR h.estado = 2) AND ' +
      'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo AND h.observacion = false');
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarHorasExtrasPedidasObservacion(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
      'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
      'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
      'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
      '(h.estado = 1 OR h.estado = 2) AND ' +
      'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo AND h.observacion = true');
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarHorasExtrasPedidasAutorizadas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
      'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
      'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
      'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
      '(h.estado = 3 OR h.estado = 4) AND ' +
      'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo');
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerUnaHoraExtraPedida(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT h.id_empl_cargo, h.id_usua_solicita, h.fec_inicio, h.fec_final, h.fec_solicita, h.descripcion, h.estado, h.tipo_funcion, h.num_hora, h.id, h.tiempo_autorizado, c.cargo, c.id_empl_contrato AS id_contrato, c.id_departamento, e.nombre, e.apellido FROM hora_extr_pedidos AS h, empl_cargos AS c, empleados AS e WHERE h.id = $1 AND h.id_empl_cargo = c.id AND e.id = h.id_usua_solicita', [id]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ObtenerlistaHora(req: Request, res: Response): Promise<any> {
    const { id_user } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT * FROM hora_extr_pedidos WHERE id_usua_solicita = $1', [id_user]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CrearHoraExtraPedida(req: Request, res: Response): Promise<Response> {
    try {

      const { id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora,
        descripcion, estado, observacion, tipo_funcion, depa_user_loggin, codigo } = req.body;

      const response: QueryResult = await pool.query(
        'INSERT INTO hora_extr_pedidos ( id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, ' +
        'fec_solicita, num_hora, descripcion, estado, observacion, tipo_funcion, codigo ) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
        [id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion,
          estado, observacion, tipo_funcion, codigo])
      const [objetoHoraExtra] = response.rows;

      if (!objetoHoraExtra) return res.status(404).jsonp({ message: 'Solicitud no registrada.' });

      const hora_extra = objetoHoraExtra;

      const JefesDepartamentos = await pool.query(`
      SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
      cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
      e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname , e.cedula, e.correo, c.hora_extra_mail, c.hora_extra_noti
      FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
      sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
      WHERE da.id_departamento = $1 AND 
      da.id_empl_cargo = ecr.id AND 
      da.id_departamento = cg.id AND 
      da.estado = true AND 
      cg.id_sucursal = s.id AND 
      ecr.id_empl_contrato = ecn.id AND 
      ecn.id_empleado = e.id AND 
      e.id = c.id_empleado
      `, [depa_user_loggin])
        .then(result => {
          return result.rows
        })

      if (JefesDepartamentos.length === 0) return res.status(400)
        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });

      const [obj] = JefesDepartamentos;
      let depa_padre = obj.depa_padre;
      let JefeDepaPadre;

      if (depa_padre !== null) {
        do {
          JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
            'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
            'ecn.id AS contrato, e.id AS empleado, (e.nombre || \' \' || e.apellido) as fullname, e.cedula, ' +
            'e.correo, c.hora_extra_mail, c.hora_extra_noti ' +
            'FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
            'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
            'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
            'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
            'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre]);

          depa_padre = JefeDepaPadre.rows[0].depa_padre;
          JefesDepartamentos.push(JefeDepaPadre.rows[0]);

        } while (depa_padre !== null);
        hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(hora_extra);

      } else {
        hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos
        return res.status(200).jsonp(hora_extra);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
    }
  }

  /** ************************************************************************************************* **
   ** **         MÉTODO PARA ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE HORAS EXTRAS                 **      
   ** ************************************************************************************************* **/

  // MÉTODO PARA ENVIAR CORREOS DESDE APLICACIÓN WEB
  public async SendMailNotifiHoraExtra(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(req.id_empresa);

    if (datos === 'ok') {

      const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo,
        solicitado_por, h_inicio, h_final, id } = req.body;

      const correoInfoPideHoraExtra = await pool.query('SELECT e.correo, e.nombre, e.apellido, e.cedula, ' +
        'ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
        'd.nombre AS departamento ' +
        'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
        'cg_departamentos AS d ' +
        'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
        '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id ' +
        'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ' +
        'ORDER BY cargo DESC', [id_empl_contrato]);

      console.log(correoInfoPideHoraExtra.rows);

      var url = `${process.env.URL_DOMAIN}/ver-hora-extra`;

      let data = {
        to: correo,
        from: email,
        subject: 'SOLICITUD DE REALIZACION DE HORAS EXTRA',
        html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="50%" height="50%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha creado la siguiente solicitud de realización de horas extras: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${nombre} <br>   
                           <b>Asunto:</b> Solicitud de Horas Extras <br> 
                           <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
                           <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
                           <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
                           <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
                           <b>Generado mediante:</b> Aplicación Web <br>
                           <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                           <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Motivo:</b> Solicitud de Horas Extras <br>   
                           <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                           <b>Desde:</b> ${desde} ${h_inicio} <br>
                           <b>Hasta:</b> ${hasta} ${h_final} <br>
                           <b>Observación:</b> ${observacion} <br>
                           <b>Num. horas solicitadas:</b> ${num_horas} <br>
                           <b>Estado:</b> ${estado_h} <br><br>
                           <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de hora extra.</a> <br><br>
                           <b>Solicitado por:</b> ${solicitado_por} <br><br>
                       </p>
                       <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Gracias por la atención</b><br>
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
    }
    else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }

  }

  // MÉTODO DE ENVÍO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
  public async EnviarCorreoHoraExtraMovil(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {

      const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo,
        solicitado_por, h_inicio, h_final } = req.body;

      const correoInfoPideHoraExtra = await pool.query('SELECT e.correo, e.nombre, e.apellido, e.cedula, ' +
        'ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
        'd.nombre AS departamento ' +
        'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
        'cg_departamentos AS d ' +
        'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
        '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id ' +
        'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ' +
        'ORDER BY cargo DESC', [id_empl_contrato]);

      console.log(correoInfoPideHoraExtra.rows);

      let data = {
        to: correo,
        from: email,
        subject: 'SOLICITUD DE REALIZACION DE HORAS EXTRA',
        html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="50%" height="50%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha creado la siguiente solicitud de realización de horas extras: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${nombre} <br>   
                           <b>Asunto:</b> Solicitud de Horas Extras <br> 
                           <b>Colaborador que envía:</b> ${correoInfoPideHoraExtra.rows[0].nombre} ${correoInfoPideHoraExtra.rows[0].apellido} <br>
                           <b>Número de Cédula:</b> ${correoInfoPideHoraExtra.rows[0].cedula} <br>
                           <b>Cargo:</b> ${correoInfoPideHoraExtra.rows[0].tipo_cargo} <br>
                           <b>Departamento:</b> ${correoInfoPideHoraExtra.rows[0].departamento} <br>
                           <b>Generado mediante:</b> Aplicación Móvil <br>
                           <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                           <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Motivo:</b> Solicitud de Horas Extras <br>   
                           <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                           <b>Desde:</b> ${desde} ${h_inicio} <br>
                           <b>Hasta:</b> ${hasta} ${h_final} <br>
                           <b>Observación:</b> ${observacion} <br>
                           <b>Num. horas solicitadas:</b> ${num_horas} <br>
                           <b>Estado:</b> ${estado_h} <br><br>
                           <b>Solicitado por:</b> ${solicitado_por} <br><br>
                       </p>
                       <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Gracias por la atención</b><br>
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
    }
    else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }

  }




  public async ObtenerSolicitudHoraExtra(req: Request, res: Response) {
    const id = req.params.id_emple_hora;
    const SOLICITUD = await pool.query('SELECT *FROM VistaSolicitudHoraExtra WHERE id_emple_hora = $1', [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }

  public async ActualizarObservacion(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const { observacion } = req.body;
    await pool.query('UPDATE hora_extr_pedidos SET observacion = $1 WHERE id = $2', [observacion, id]);
    res.jsonp({ message: 'Pedido hora extra Actualizada' });
  }

  public async ActualizarEstado(req: Request, res: Response): Promise<void> {

    var tiempo = fechaHora();

    const path_folder = path.resolve('logos');

    var datos = await Credenciales(parseInt(req.params.id_empresa));

    if (datos === 'ok') {


      const id = req.params.id;
      const { estado, id_hora_extra, id_departamento } = req.body;
      console.log(estado, id_hora_extra, id_departamento);

      await pool.query('UPDATE hora_extr_pedidos SET estado = $1 WHERE id = $2', [estado, id]);

      const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, ' +
        'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, ' +
        'e.nombre, e.cedula, e.correo, c.hora_extra_mail, c.hora_extra_noti FROM depa_autorizaciones AS da, ' +
        'empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e, ' +
        'config_noti AS c WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND ' +
        'da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id ' +
        'AND ecn.id_empleado = e.id AND e.id = c.id_empleado AND da.estado = true', [id_departamento]);
      const InfoHoraExtraReenviarEstadoEmpleado = await pool.query('SELECT h.descripcion, h.fec_inicio, h.fec_final, h.fec_solicita, h.estado, h.num_hora, h.id, e.id AS empleado, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo FROM empleados AS e, empl_cargos AS ecr, hora_extr_pedidos AS h WHERE h.id = $1 AND h.id_empl_cargo = ecr.id AND e.id = h.id_usua_solicita ORDER BY cargo DESC LIMIT 1', [id_hora_extra]);

      console.log(InfoHoraExtraReenviarEstadoEmpleado.rows)

      let estadoHoraExtra = [
        { valor: 1, nombre: 'Pendiente' },
        { valor: 2, nombre: 'Pre-Autorizado' },
        { valor: 3, nombre: 'Autorizado' },
        { valor: 4, nombre: 'Negado' }
      ]

      let nombreEstado = '';
      estadoHoraExtra.forEach(obj => {
        if (obj.valor === estado) {
          nombreEstado = obj.nombre
        }
        if (obj.valor === 3) { //cuando este en estado tres se registra la hora_extr_calculos.

        }
      });

      JefeDepartamento.rows.forEach(obj => {
        var url = `${process.env.URL_DOMAIN}/horaExtraEmpleado`;
        InfoHoraExtraReenviarEstadoEmpleado.rows.forEach(ele => {
          let notifi_realtime = {
            id_send_empl: obj.empleado,
            id_receives_depa: obj.id_dep,
            estado: nombreEstado,
            id_permiso: null,
            id_vacaciones: null,
            id_hora_extra: id_hora_extra
          }
          var f = new Date();
          f.setUTCHours(f.getHours())
          let fecha = f.toJSON();
          fecha = fecha.split('T')[0];

          let data = {
            from: obj.correo,
            to: ele.correo,
            subject: 'Estado de solicitud de Hora Extra',
            html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                cédula ${obj.cedula} a cambiado el estado de su permiso a: <b>${nombreEstado}</b></p>
                <h4><b>Informacion del permiso</b></h4>
                <ul>
                    <li><b>Descripción</b>: ${ele.descripcion} </li>
                    <li><b>Empleado</b>: ${ele.nombre} ${ele.apellido} </li>
                    <li><b>Cédula</b>: ${ele.cedula} </li>
                    <li><b>Sucursal</b>: ${obj.sucursal} </li>
                    <li><b>Departamento</b>: ${obj.departamento} </li>
                    </ul>
                <a href="${url}">Ir a verificar estado hora extra</a>`
            ,
            attachments: [
              {
                filename: 'cabecera_firma.jpg',
                path: `${path_folder}/${cabecera_firma}`,
                cid: 'cabeceraf' //same cid value as in the html img src
              },
              {
                filename: 'pie_firma.jpg',
                path: `${path_folder}/${pie_firma}`,
                cid: 'pief' //same cid value as in the html img src
              }]
          };
          console.log(data);
          let port = 465;

          if (puerto != null && puerto != '') {
            port = parseInt(puerto);
          }
          if (obj.hora_extra_mail === true && obj.hora_extra_noti === true) {
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

            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
          } else if (obj.hora_extra_maill === true && obj.hora_extra_noti === false) {
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

            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
          } else if (obj.hora_extra_mail === false && obj.hora_extra_noti === true) {
            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });

          } else if (obj.hora_extra_mail === false && obj.hora_extra_noti === false) {
            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });

          }
        });
      });
    }
    else {
      res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
    }
  }

  public async ObtenerAutorizacionHoraExtra(req: Request, res: Response) {
    const id = req.params.id_hora;
    const SOLICITUD = await pool.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
      'hp.id AS hora_extra FROM autorizaciones AS a, hora_extr_pedidos AS hp ' +
      'WHERE hp.id = a.id_hora_extra AND hp.id = $1', [id]);
    if (SOLICITUD.rowCount > 0) {
      return res.json(SOLICITUD.rows)
    }
    else {
      return res.status(404).json({ text: 'No se encuentran registros' });
    }
  }

  public async EliminarHoraExtra(req: Request, res: Response) {
    const { id_hora_extra } = req.params;
    await pool.query('DELETE FROM realtime_noti WHERE id_hora_extra = $1', [id_hora_extra])
    await pool.query('DELETE FROM hora_extr_pedidos WHERE id = $1', [id_hora_extra]);
    res.jsonp({ message: 'Registro eliminado' });
  }

  public async EditarHoraExtra(req: Request, res: Response): Promise<void> {
    const id = req.params.id
    const { fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion } = req.body;
    console.log(fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion);
    await pool.query('UPDATE hora_extr_pedidos SET fec_inicio = $1, fec_final = $2, num_hora = $3, descripcion = $4, estado = $5, tipo_funcion = $6 WHERE id = $7', [fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, id]);
    res.jsonp({ message: 'Hora Extra editado' });
  }

  public async ObtenerHorarioEmpleado(req: Request, res: Response) {
    const id_empl_cargo = parseInt(req.params.id_cargo);
    console.log('IDS: ', id_empl_cargo);
    // let respuesta = await ValidarHorarioEmpleado(id_empleado, id_empl_cargo)
    let respuesta = await VerificarHorario(id_empl_cargo)
    console.log(respuesta);

    res.jsonp(respuesta)
  }

  public async TiempoAutorizado(req: Request, res: Response) {
    const id_hora = parseInt(req.params.id_hora);
    const { hora } = req.body;
    console.log(id_hora);
    console.log(hora);
    let respuesta = await pool.query('UPDATE hora_extr_pedidos SET tiempo_autorizado = $2 WHERE id = $1', [id_hora, hora]).then(result => {
      return { message: 'Tiempo de hora autorizada confirmada' }
    });
    res.jsonp(respuesta)
  }

  public async ListarPedidosHE(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
      'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
      'ph.descripcion, ph.num_hora, ph.fec_inicio::time AS hora_inicio, ph.fec_final::time AS hora_final ' +
      'FROM hora_extr_pedidos AS ph, empleados AS e ' +
      'WHERE e.id = ph.id_usua_solicita ORDER BY e.nombre ASC, ph.fec_inicio ASC');
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPedidosHEAutorizadas(req: Request, res: Response) {
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
      'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
      'ph.descripcion, ph.tiempo_autorizado, ph.fec_inicio::time AS hora_inicio, ' +
      'ph.fec_final::time AS hora_final, a.estado, a.id_documento FROM hora_extr_pedidos AS ph, ' +
      'empleados AS e, autorizaciones AS a ' +
      'WHERE e.id = ph.id_usua_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 ' +
      'ORDER BY e.nombre ASC, ph.fec_inicio ASC');
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPedidosHE_Empleado(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
      'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
      'ph.descripcion, ph.num_hora, ph.fec_inicio::time AS hora_inicio, ph.fec_final::time AS hora_fin ' +
      'FROM hora_extr_pedidos AS ph, empleados AS e ' +
      'WHERE e.id = ph.id_usua_solicita AND e.id = $1 ORDER BY e.nombre ASC, ph.fec_inicio ASC', [id_empleado]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async ListarPedidosHEAutorizadas_Empleado(req: Request, res: Response) {
    const { id_empleado } = req.params;
    const HORAS_EXTRAS_PEDIDAS = await pool.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
      'ph.id AS id_solicitud, ph.fec_inicio::date fec_inicio, ph.fec_final::date fec_final, ' +
      'ph.descripcion, ph.tiempo_autorizado, ph.fec_inicio::time hora_inicio, ' +
      'ph.fec_final::time hora_final, a.estado, a.id_documento FROM hora_extr_pedidos AS ph, ' +
      'empleados AS e, autorizaciones AS a ' +
      'WHERE e.id = ph.id_usua_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 AND e.id = $1' +
      'ORDER BY e.nombre ASC, ph.fec_inicio ASC', [id_empleado]);
    if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
      HORAS_EXTRAS_PEDIDAS.rows.map(obj => {
        if (obj.id_documento != null && obj.id_documento != '' && obj.estado != 1) {
          var autorizaciones = obj.id_documento.split(',');
          let empleado_id = autorizaciones[autorizaciones.length - 2].split('_')[0];
          obj.autoriza = parseInt(empleado_id);
        }
      });
      return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }


  /** ******************************************************************************* *
   **       REPORTE PARA VER INFORMACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS             *
   ** ******************************************************************************* */
  public async ReporteVacacionesMultiple(req: Request, res: Response) {
    console.log('datos recibidos', req.body)
    let datos: any[] = req.body;
    let { desde, hasta } = req.params;
    let n: Array<any> = await Promise.all(datos.map(async (obj: ReporteHoraExtra) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (ele) => {
        ele.empleado = await Promise.all(ele.empleado.map(async (o) => {
          o.horaE = await BuscarHorasExtras(o.codigo, desde, hasta);
          console.log('Vacaciones: ', o);
          return o
        })
        )
        return ele
      })
      )
      return obj
    })
    )


    let nuevo = n.map((obj: ReporteHoraExtra) => {

      obj.departamentos = obj.departamentos.map((e) => {

        e.empleado = e.empleado.filter((v: any) => { return v.vacaciones.length > 0 })
        return e

      }).filter((e: any) => { return e.empleado.length > 0 })
      return obj

    }).filter(obj => { return obj.departamentos.length > 0 })

    if (nuevo.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registro de planificaciones.' })

    return res.status(200).jsonp(nuevo)

  }


}

export const horaExtraPedidasControlador = new HorasExtrasPedidasControlador();

export default horaExtraPedidasControlador;

const BuscarHorasExtras = async function (id: number, desde: string, hasta: string) {
  return await pool.query('SELECT p.fecha_desde, p.fecha_hasta, p.hora_inicio, p.hora_fin, p.descripcion, ' +
    'p.horas_totales, e.nombre AS planifica_nombre, e.apellido AS planifica_apellido ' +
    'FROM plan_hora_extra AS p, plan_hora_extra_empleado AS pe, empleados AS e ' +
    'WHERE p.id = pe.id_plan_hora AND e.id = p.id_empl_planifica AND pe.codigo = $1 AND ' +
    'p.fecha_desde BETWEEN $2 AND $3',
    [id, desde, hasta])
    .then(res => {
      return res.rows;
    })
}