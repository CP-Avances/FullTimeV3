"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.horaExtraPedidasControlador = void 0;
const MetodosHorario_1 = require("../../libs/MetodosHorario");
const settingsMail_1 = require("../../libs/settingsMail");
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const nodemailer = require("nodemailer");
class HorasExtrasPedidasControlador {
    ListarHorasExtrasPedidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
                'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
                'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
                'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
                '(h.estado = 1 OR h.estado = 2) AND ' +
                'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo AND h.observacion = false');
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarHorasExtrasPedidasObservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
                'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
                'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
                'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
                '(h.estado = 1 OR h.estado = 2) AND ' +
                'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo AND h.observacion = true');
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarHorasExtrasPedidasAutorizadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT h.id, h.fec_inicio, h.fec_final, h.estado, ' +
                'h.fec_solicita, h.descripcion, h.num_hora, h.tiempo_autorizado, e.id AS id_usua_solicita, h.id_empl_cargo, ' +
                'e.nombre, e.apellido, contrato.id AS id_contrato FROM hora_extr_pedidos AS h, empleados AS e, ' +
                'empl_contratos As contrato, empl_cargos AS cargo WHERE h.id_usua_solicita = e.id AND ' +
                '(h.estado = 3 OR h.estado = 4) AND ' +
                'contrato.id = cargo.id_empl_contrato AND cargo.id = h.id_empl_cargo');
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaHoraExtraPedida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT h.id_empl_cargo, h.id_usua_solicita, h.fec_inicio, h.fec_final, h.fec_solicita, h.descripcion, h.estado, h.tipo_funcion, h.num_hora, h.id, h.tiempo_autorizado, c.cargo, c.id_empl_contrato AS id_contrato, c.id_departamento, e.nombre, e.apellido FROM hora_extr_pedidos AS h, empl_cargos AS c, empleados AS e WHERE h.id = $1 AND h.id_empl_cargo = c.id AND e.id = h.id_usua_solicita', [id]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerlistaHora(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_user } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT * FROM hora_extr_pedidos WHERE id_usua_solicita = $1', [id_user]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearHoraExtraPedida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion, estado, observacion, tipo_funcion, depa_user_loggin, codigo } = req.body;
                const response = yield database_1.default.query('INSERT INTO hora_extr_pedidos ( id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, ' +
                    'fec_solicita, num_hora, descripcion, estado, observacion, tipo_funcion, codigo ) ' +
                    'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *', [id_empl_cargo, id_usua_solicita, fec_inicio, fec_final, fec_solicita, num_hora, descripcion,
                    estado, observacion, tipo_funcion, codigo]);
                const [objetoHoraExtra] = response.rows;
                if (!objetoHoraExtra)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const hora_extra = objetoHoraExtra;
                const JefesDepartamentos = yield database_1.default.query(`
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
                    return result.rows;
                });
                if (JefesDepartamentos.length === 0)
                    return res.status(400)
                        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });
                const [obj] = JefesDepartamentos;
                let depa_padre = obj.depa_padre;
                let JefeDepaPadre;
                if (depa_padre !== null) {
                    do {
                        JefeDepaPadre = yield database_1.default.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
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
                    hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(hora_extra);
                }
                else {
                    hora_extra.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(hora_extra);
                }
            }
            catch (error) {
                console.log(error);
                return res.status(500).jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    /** ************************************************************************************************* **
     ** **         MÉTODO PARA ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE HORAS EXTRAS                 **
     ** ************************************************************************************************* **/
    // MÉTODO PARA ENVIAR CORREOS DESDE APLICACIÓN WEB
    SendMailNotifiHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo, solicitado_por, h_inicio, h_final, id } = req.body;
                const correoInfoPideHoraExtra = yield database_1.default.query('SELECT e.correo, e.nombre, e.apellido, e.cedula, ' +
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
                    from: settingsMail_1.email,
                    subject: 'SOLICITUD DE REALIZACION DE HORAS EXTRA',
                    html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="25%" height="25%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha creado la siguiente solicitud de realización de horas extras: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
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
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
            }
        });
    }
    // MÉTODO DE ENVÍO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoHoraExtraMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_empl_contrato, solicitud, desde, hasta, num_horas, observacion, estado_h, correo, solicitado_por, h_inicio, h_final } = req.body;
                const correoInfoPideHoraExtra = yield database_1.default.query('SELECT e.correo, e.nombre, e.apellido, e.cedula, ' +
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
                    from: settingsMail_1.email,
                    subject: 'SOLICITUD DE REALIZACION DE HORAS EXTRA',
                    html: `
                   <body>
                       <div style="text-align: center;">
                           <img width="25%" height="25%" src="cid:cabeceraf"/>
                       </div>
                       <br>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           El presente correo es para informar que se ha creado la siguiente solicitud de realización de horas extras: <br>  
                       </p>
                       <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                       <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                           <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
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
                            path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                            cid: 'cabeceraf' // COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        },
                        {
                            filename: 'pie_firma.jpg',
                            path: `${path_folder}/${settingsMail_1.pie_firma}`,
                            cid: 'pief' //COLOCAR EL MISMO cid EN LA ETIQUETA html img src QUE CORRESPONDA
                        }
                    ]
                };
                var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                corr.sendMail(data, function (error, info) {
                    if (error) {
                        console.log('Email error: ' + error);
                        return res.jsonp({ message: 'error' });
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                        return res.jsonp({ message: 'ok' });
                    }
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
            }
        });
    }
    ObtenerSolicitudHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_hora;
            const SOLICITUD = yield database_1.default.query('SELECT *FROM VistaSolicitudHoraExtra WHERE id_emple_hora = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ActualizarObservacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { observacion } = req.body;
            yield database_1.default.query('UPDATE hora_extr_pedidos SET observacion = $1 WHERE id = $2', [observacion, id]);
            res.jsonp({ message: 'Pedido hora extra Actualizada' });
        });
    }
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const id = req.params.id;
                const { estado, id_hora_extra, id_departamento } = req.body;
                console.log(estado, id_hora_extra, id_departamento);
                yield database_1.default.query('UPDATE hora_extr_pedidos SET estado = $1 WHERE id = $2', [estado, id]);
                const JefeDepartamento = yield database_1.default.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, ' +
                    'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, ' +
                    'e.nombre, e.cedula, e.correo, c.hora_extra_mail, c.hora_extra_noti FROM depa_autorizaciones AS da, ' +
                    'empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e, ' +
                    'config_noti AS c WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND ' +
                    'da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id ' +
                    'AND ecn.id_empleado = e.id AND e.id = c.id_empleado AND da.estado = true', [id_departamento]);
                const InfoHoraExtraReenviarEstadoEmpleado = yield database_1.default.query('SELECT h.descripcion, h.fec_inicio, h.fec_final, h.fec_solicita, h.estado, h.num_hora, h.id, e.id AS empleado, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo FROM empleados AS e, empl_cargos AS ecr, hora_extr_pedidos AS h WHERE h.id = $1 AND h.id_empl_cargo = ecr.id AND e.id = h.id_usua_solicita ORDER BY cargo DESC LIMIT 1', [id_hora_extra]);
                console.log(InfoHoraExtraReenviarEstadoEmpleado.rows);
                let estadoHoraExtra = [
                    { valor: 1, nombre: 'Pendiente' },
                    { valor: 2, nombre: 'Pre-Autorizado' },
                    { valor: 3, nombre: 'Autorizado' },
                    { valor: 4, nombre: 'Negado' }
                ];
                let nombreEstado = '';
                estadoHoraExtra.forEach(obj => {
                    if (obj.valor === estado) {
                        nombreEstado = obj.nombre;
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
                        };
                        var f = new Date();
                        f.setUTCHours(f.getHours());
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
                <a href="${url}">Ir a verificar estado hora extra</a>`,
                            attachments: [
                                {
                                    filename: 'cabecera_firma.jpg',
                                    path: `${path_folder}/${settingsMail_1.cabecera_firma}`,
                                    cid: 'cabeceraf' //same cid value as in the html img src
                                },
                                {
                                    filename: 'pie_firma.jpg',
                                    path: `${path_folder}/${settingsMail_1.pie_firma}`,
                                    cid: 'pief' //same cid value as in the html img src
                                }
                            ]
                        };
                        console.log(data);
                        let port = 465;
                        if (settingsMail_1.puerto != null && settingsMail_1.puerto != '') {
                            port = parseInt(settingsMail_1.puerto);
                        }
                        if (obj.hora_extra_mail === true && obj.hora_extra_noti === true) {
                            var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                            corr.sendMail(data, function (error, info) {
                                if (error) {
                                    console.log('Email error: ' + error);
                                    return res.jsonp({ message: 'error' });
                                }
                                else {
                                    console.log('Email sent: ' + info.response);
                                    return res.jsonp({ message: 'ok' });
                                }
                            });
                            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                        }
                        else if (obj.hora_extra_maill === true && obj.hora_extra_noti === false) {
                            var corr = (0, settingsMail_1.enviarMail)(settingsMail_1.servidor, parseInt(settingsMail_1.puerto));
                            corr.sendMail(data, function (error, info) {
                                if (error) {
                                    console.log('Email error: ' + error);
                                    return res.jsonp({ message: 'error' });
                                }
                                else {
                                    console.log('Email sent: ' + info.response);
                                    return res.jsonp({ message: 'ok' });
                                }
                            });
                            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                        }
                        else if (obj.hora_extra_mail === false && obj.hora_extra_noti === true) {
                            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                        }
                        else if (obj.hora_extra_mail === false && obj.hora_extra_noti === false) {
                            res.json({ message: 'Estado de hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                        }
                    });
                });
            }
            else {
                res.jsonp({ message: 'Ups! algo salio mal!!! No fue posible enviar correo electrónico.' });
            }
        });
    }
    ObtenerAutorizacionHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_hora;
            const SOLICITUD = yield database_1.default.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
                'hp.id AS hora_extra FROM autorizaciones AS a, hora_extr_pedidos AS hp ' +
                'WHERE hp.id = a.id_hora_extra AND hp.id = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    EliminarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_hora_extra } = req.params;
            yield database_1.default.query('DELETE FROM realtime_noti WHERE id_hora_extra = $1', [id_hora_extra]);
            yield database_1.default.query('DELETE FROM hora_extr_pedidos WHERE id = $1', [id_hora_extra]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    EditarHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion } = req.body;
            console.log(fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion);
            yield database_1.default.query('UPDATE hora_extr_pedidos SET fec_inicio = $1, fec_final = $2, num_hora = $3, descripcion = $4, estado = $5, tipo_funcion = $6 WHERE id = $7', [fec_inicio, fec_final, num_hora, descripcion, estado, tipo_funcion, id]);
            res.jsonp({ message: 'Hora Extra editado' });
        });
    }
    ObtenerHorarioEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empl_cargo = parseInt(req.params.id_cargo);
            console.log('IDS: ', id_empl_cargo);
            // let respuesta = await ValidarHorarioEmpleado(id_empleado, id_empl_cargo)
            let respuesta = yield (0, MetodosHorario_1.VerificarHorario)(id_empl_cargo);
            console.log(respuesta);
            res.jsonp(respuesta);
        });
    }
    TiempoAutorizado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_hora = parseInt(req.params.id_hora);
            const { hora } = req.body;
            console.log(id_hora);
            console.log(hora);
            let respuesta = yield database_1.default.query('UPDATE hora_extr_pedidos SET tiempo_autorizado = $2 WHERE id = $1', [id_hora, hora]).then(result => {
                return { message: 'Tiempo de hora autorizada confirmada' };
            });
            res.jsonp(respuesta);
        });
    }
    ListarPedidosHE(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
                'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
                'ph.descripcion, ph.num_hora, ph.fec_inicio::time AS hora_inicio, ph.fec_final::time AS hora_final ' +
                'FROM hora_extr_pedidos AS ph, empleados AS e ' +
                'WHERE e.id = ph.id_usua_solicita ORDER BY e.nombre ASC, ph.fec_inicio ASC');
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidosHEAutorizadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
                'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
                'ph.descripcion, ph.tiempo_autorizado, ph.fec_inicio::time AS hora_inicio, ' +
                'ph.fec_final::time AS hora_final, a.estado, a.id_documento FROM hora_extr_pedidos AS ph, ' +
                'empleados AS e, autorizaciones AS a ' +
                'WHERE e.id = ph.id_usua_solicita AND a.id_hora_extra = ph.id AND a.estado = 3 ' +
                'ORDER BY e.nombre ASC, ph.fec_inicio ASC');
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidosHE_Empleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
                'ph.id AS id_solicitud, ph.fec_inicio::date AS fec_inicio, ph.fec_final::date AS fec_final, ' +
                'ph.descripcion, ph.num_hora, ph.fec_inicio::time AS hora_inicio, ph.fec_final::time AS hora_fin ' +
                'FROM hora_extr_pedidos AS ph, empleados AS e ' +
                'WHERE e.id = ph.id_usua_solicita AND e.id = $1 ORDER BY e.nombre ASC, ph.fec_inicio ASC', [id_empleado]);
            if (HORAS_EXTRAS_PEDIDAS.rowCount > 0) {
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPedidosHEAutorizadas_Empleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const HORAS_EXTRAS_PEDIDAS = yield database_1.default.query('SELECT e.id AS id_empleado, e.nombre, e.apellido, e.codigo, ' +
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
                return res.jsonp(HORAS_EXTRAS_PEDIDAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    /** ******************************************************************************* *
     **       REPORTE PARA VER INFORMACIÓN DE PLANIFICACIÓN DE HORAS EXTRAS             *
     ** ******************************************************************************* */
    ReporteVacacionesMultiple(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('datos recibidos', req.body);
            let datos = req.body;
            let { desde, hasta } = req.params;
            let n = yield Promise.all(datos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((ele) => __awaiter(this, void 0, void 0, function* () {
                    ele.empleado = yield Promise.all(ele.empleado.map((o) => __awaiter(this, void 0, void 0, function* () {
                        o.horaE = yield BuscarHorasExtras(o.codigo, desde, hasta);
                        console.log('Vacaciones: ', o);
                        return o;
                    })));
                    return ele;
                })));
                return obj;
            })));
            let nuevo = n.map((obj) => {
                obj.departamentos = obj.departamentos.map((e) => {
                    e.empleado = e.empleado.filter((v) => { return v.vacaciones.length > 0; });
                    return e;
                }).filter((e) => { return e.empleado.length > 0; });
                return obj;
            }).filter(obj => { return obj.departamentos.length > 0; });
            if (nuevo.length === 0)
                return res.status(400).jsonp({ message: 'No se ha encontrado registro de planificaciones.' });
            return res.status(200).jsonp(nuevo);
        });
    }
}
exports.horaExtraPedidasControlador = new HorasExtrasPedidasControlador();
exports.default = exports.horaExtraPedidasControlador;
const BuscarHorasExtras = function (id, desde, hasta) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield database_1.default.query('SELECT p.fecha_desde, p.fecha_hasta, p.hora_inicio, p.hora_fin, p.descripcion, ' +
            'p.horas_totales, e.nombre AS planifica_nombre, e.apellido AS planifica_apellido ' +
            'FROM plan_hora_extra AS p, plan_hora_extra_empleado AS pe, empleados AS e ' +
            'WHERE p.id = pe.id_plan_hora AND e.id = p.id_empl_planifica AND pe.codigo = $1 AND ' +
            'p.fecha_desde BETWEEN $2 AND $3', [id, desde, hasta])
            .then(res => {
            return res.rows;
        });
    });
};
