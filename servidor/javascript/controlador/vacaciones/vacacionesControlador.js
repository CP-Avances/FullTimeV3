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
exports.VACACIONES_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const CargarVacacion_1 = require("../../libs/CargarVacacion");
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
class VacacionesControlador {
    ListarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACACIONES = yield database_1.default.query(`
    SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
    v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empl_solicita, e.nombre, e.apellido 
	  FROM vacaciones AS v, datos_empleado_cargo AS dc, empleados AS e   
	  WHERE dc.cargo_id = v.id_empl_cargo AND dc.empl_id = e.id  
	  AND (v.estado = 1 OR v.estado = 2) ORDER BY id DESC
    `);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionesAutorizadas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACACIONES = yield database_1.default.query(`
    SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
    v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empl_solicita, e.nombre, e.apellido 
	  FROM vacaciones AS v, datos_empleado_cargo AS dc, empleados AS e   
	  WHERE dc.cargo_id = v.id_empl_cargo AND dc.empl_id = e.id  
	  AND (v.estado = 3 OR v.estado = 4) ORDER BY id DESC
    `);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnaVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const VACACIONES = yield database_1.default.query(`
    SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
    v.id, v.id_peri_vacacion, v.id_empl_cargo, pv.id_empl_contrato AS id_contrato, ec.id_empleado 
    FROM vacaciones AS v, peri_vacaciones AS pv, empl_contratos AS ec 
    WHERE v.id = $1 AND v.id_peri_vacacion = pv.id AND ec.id = pv.id_empl_contrato
    `, [id]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    VacacionesIdPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const VACACIONES = yield database_1.default.query(`
    SELECT v.fec_inicio, v.fec_final, fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, 
    v.id, v.id_peri_vacacion 
    FROM vacaciones AS v, peri_vacaciones AS p 
    WHERE v.id_peri_vacacion = p.id AND p.id = $1 ORDER BY v.fec_inicio DESC
    `, [id]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerFechasFeriado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fechaSalida, fechaIngreso } = req.body;
            const FECHAS = yield database_1.default.query('SELECT fecha FROM cg_feriados WHERE fecha BETWEEN $1 AND $2 ORDER BY fecha ASC', [fechaSalida, fechaIngreso]);
            if (FECHAS.rowCount > 0) {
                return res.jsonp(FECHAS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const path_folder = path_1.default.resolve('logos');
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const id = req.params.id;
            const { estado, id_vacacion, id_rece_emp, id_depa_send } = req.body;
            yield database_1.default.query('UPDATE vacaciones SET estado = $1 WHERE id = $2', [estado, id]);
            console.log(estado, id_vacacion, id_rece_emp, id_depa_send);
            const JefeDepartamento = yield database_1.default.query(`SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
      ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo, e.apellido 
      FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, 
      empl_contratos AS ecn, empleados AS e 
      WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND 
      cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id`, [id_depa_send]);
            const InfoVacacionesReenviarEstadoEmpleado = yield database_1.default.query(`SELECT v.id, v.estado, v.fec_inicio, v.fec_final, v.fec_ingreso, e.id AS id_empleado, e.cedula, 
      e.nombre, e.apellido, e.correo, co.vaca_mail, co.vaca_noti 
      FROM vacaciones AS v, peri_vacaciones AS pv, empl_contratos AS c, empleados AS e, 
      config_noti AS co WHERE v.id = $1 AND v.id_peri_vacacion = pv.id AND c.id = pv.id_empl_contrato AND 
      co.id_empleado = e.id AND e.id = $2`, [id_vacacion, id_rece_emp]);
            if (3 === estado) {
                (0, CargarVacacion_1.RestarPeriodoVacacionAutorizada)(parseInt(id));
            }
            JefeDepartamento.rows.forEach(obj => {
                var url = `${process.env.URL_DOMAIN}/vacacionesEmpleado`;
                InfoVacacionesReenviarEstadoEmpleado.rows.forEach(ele => {
                    let notifi_realtime = {
                        id_send_empl: obj.empleado,
                        id_receives_depa: obj.id_dep,
                        estado: estado,
                        id_vacaciones: id_vacacion,
                        id_permiso: null
                    };
                    var estado_letras;
                    if (estado === 1) {
                        estado_letras = 'Pendiente';
                    }
                    else if (estado === 2) {
                        estado_letras = 'Pre-autorizado';
                    }
                    else if (estado === 3) {
                        estado_letras = 'Autorizado';
                    }
                    else if (estado === 4) {
                        estado_letras = 'Negado';
                    }
                    var f = new Date();
                    f.setUTCHours(f.getHours());
                    let fecha = f.toJSON();
                    fecha = fecha.split('T')[0];
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de solicitud de Vacaciones',
                        html: `
          <img src="cid:cabeceraf" width="50%" height="50%"/>
               
          <p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                cédula ${obj.cedula} a cambiado el estado de su solicitud de vacaciones a: <b>${estado_letras}</b></p>
                <h4><b>Informacion de las vacaciones</b></h4>
                <ul>
                    <li><b>Empleado</b>: ${ele.nombre} ${ele.apellido} </li>
                    <li><b>Cédula</b>: ${ele.cedula} </li>
                    <li><b>Sucursal</b>: ${obj.sucursal} </li>
                    <li><b>Departamento</b>: ${obj.departamento} </li>
                    <li><b>Fecha inicio </b>: ${ele.fec_inicio.toLocaleString().split(" ")[0]} </li> 
                    <li><b>Fecha final </b>: ${ele.fec_final.toLocaleString().split(" ")[0]} </li>
                    <li><b>Fecha ingresa </b>: ${ele.fec_ingreso.toLocaleString().split(" ")[0]} </li>
                    </ul>
                <a href="${url}">Ir a verificar estado vacaciones</a>
                <p style="font-family: Arial; font-size:12px; line-height: 1em;">
                <b>Gracias por la atención</b><br>
                <b>Saludos cordiales,</b> <br><br>
              </p>
              <img src="cid:pief" width="50%" height="50%"/>
         `, attachments: [
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
                    let port = 465;
                    if (settingsMail_1.puerto != null && settingsMail_1.puerto != '') {
                        port = parseInt(settingsMail_1.puerto);
                    }
                    if (ele.vaca_mail === true && ele.vaca_noti === true) {
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
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    }
                    else if (ele.vaca_mail === true && ele.vaca_noti === false) {
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
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
                    else if (ele.vaca_mail === false && ele.vaca_noti === true) {
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    }
                    else if (ele.vaca_mail === false && ele.vaca_noti === false) {
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
                });
            });
        });
    }
    ObtenerSolicitudVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_vacacion;
            const SOLICITUD = yield database_1.default.query('SELECT *FROM vista_datos_solicitud_vacacion WHERE id_emple_vacacion = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerAutorizacionVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_vacaciones;
            const SOLICITUD = yield database_1.default.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
                'v.id AS vacacion_id FROM autorizaciones AS a, vacaciones AS v ' +
                'WHERE v.id = a.id_vacacion AND v.id = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    /** ********************************************************************************************* **
     ** **                        METODOS DE REGISTROS DE VACACIONES                               ** **
     ** ********************************************************************************************* **/
    // METODO PARA CREAR REGISTRO DE VACACIONES
    CrearVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion, depa_user_loggin, id_empl_cargo, codigo } = req.body;
                const response = yield database_1.default.query(`
        INSERT INTO vacaciones (fec_inicio, fec_final, 
        fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion, id_empl_cargo, codigo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `, [fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion,
                    id_empl_cargo, codigo]);
                const [objetoVacacion] = response.rows;
                if (!objetoVacacion)
                    return res.status(400)
                        .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' });
                const vacacion = objetoVacacion;
                const JefesDepartamentos = yield database_1.default.query(`
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.vaca_mail, c.vaca_noti 
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
        `, [depa_user_loggin]).then(result => { return result.rows; });
                if (JefesDepartamentos.length === 0)
                    return res.status(400)
                        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });
                const [obj] = JefesDepartamentos;
                let depa_padre = obj.depa_padre;
                let JefeDepaPadre;
                if (depa_padre !== null) {
                    console.log('******************', depa_padre);
                    do {
                        JefeDepaPadre = yield database_1.default.query(`
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
            c.vaca_mail, c.vaca_noti
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
            `, [depa_padre]);
                        console.log(JefeDepaPadre.rows.length);
                        depa_padre = JefeDepaPadre.rows[0].depa_padre;
                        JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                    } while (depa_padre !== null);
                    vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(vacacion);
                }
                else {
                    vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(vacacion);
                }
            }
            catch (error) {
                return res.status(500).
                    jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // METODO DE EDICIÓN DE REGISTRO DE VACACIONES
    EditarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, depa_user_loggin } = req.body;
                const response = yield database_1.default.query(`
        UPDATE vacaciones SET fec_inicio = $1, fec_final = $2, fec_ingreso = $3, dia_libre = $4, 
        dia_laborable = $5 WHERE id = $6 RETURNING *
        `, [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, id]);
                const [objetoVacacion] = response.rows;
                if (!objetoVacacion)
                    return res.status(400)
                        .jsonp({ message: 'Upps !!! algo salio mal. Solicitud de vacación no ingresada' });
                const vacacion = objetoVacacion;
                const JefesDepartamentos = yield database_1.default.query(`
        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, 
        cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, 
        e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo, 
        c.vaca_mail, c.vaca_noti 
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
        `, [depa_user_loggin]).then(result => { return result.rows; });
                if (JefesDepartamentos.length === 0)
                    return res.status(400)
                        .jsonp({ message: 'Ups !!! algo salio mal. Solicitud ingresada, pero es necesario verificar configuraciones jefes de departamento.' });
                const [obj] = JefesDepartamentos;
                let depa_padre = obj.depa_padre;
                let JefeDepaPadre;
                if (depa_padre !== null) {
                    do {
                        JefeDepaPadre = yield database_1.default.query(`
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
            c.vaca_mail, c.vaca_noti
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
            `, [depa_padre]);
                        console.log(JefeDepaPadre.rows.length);
                        depa_padre = JefeDepaPadre.rows[0].depa_padre;
                        JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                    } while (depa_padre !== null);
                    vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(vacacion);
                }
                else {
                    vacacion.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(vacacion);
                }
            }
            catch (error) {
                return res.status(500)
                    .jsonp({ message: 'Contactese con el Administrador del sistema (593) 2 – 252-7663 o https://casapazmino.com.ec' });
            }
        });
    }
    // ELIMINAR SOLICITUD DE VACACION
    EliminarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id_vacacion } = req.params;
            yield database_1.default.query(`
      DELETE FROM realtime_noti WHERE id_vacaciones = $1
           `, [id_vacacion]);
            const response = yield database_1.default.query(`
      DELETE FROM vacaciones WHERE id = $1 RETURNING *
        `, [id_vacacion]);
            const [objetoVacacion] = response.rows;
            if (objetoVacacion) {
                return res.status(200).jsonp(objetoVacacion);
            }
            else {
                return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
            }
        });
    }
    // BUSCAR VACACIONES MEDIANTE ID DE VACACION
    ListarVacacionId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const VACACIONES = yield database_1.default.query(`
      SELECT v.id, v.fec_inicio, v.fec_final, fec_ingreso, v.estado, 
      v.dia_libre, v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion, e.id AS id_empleado, de.id_contrato
      FROM vacaciones AS v, empleados AS e, datos_actuales_empleado AS de
	    WHERE v.id = $1 AND e.codigo::integer = v.codigo AND e.id = de.id
      `, [id]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    /** ********************************************************************************************** **
     **                MÉTODOS DE ENVIO DE CORREOS DE SOLICITUDES DE VACACIONES                        **
     ** ********************************************************************************************** **/
    // MÉTODO DE ENVIO DE CORREO DESDE APLICACIÓN WEB
    EnviarCorreoVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPideVacacion = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
        ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
        d.nombre AS departamento 
        FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
        cg_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
        (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
        AND tc.id = ecr.cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);
                // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
                var url = `${process.env.URL_DOMAIN}/ver-vacacion`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
               <body>
                   <div style="text-align: center;">
                       <img width="50%" height="50%" src="cid:cabeceraf"/>
                   </div>
                   <br>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       El presente correo es para informar que se ha ${proceso} la siguiente solicitud de vacaciones: <br>  
                   </p>
                   <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                       <b>Asunto:</b> ${asunto} <br> 
                       <b>Colaborador que envía:</b> ${correoInfoPideVacacion.rows[0].nombre} ${correoInfoPideVacacion.rows[0].apellido} <br>
                       <b>Número de Cédula:</b> ${correoInfoPideVacacion.rows[0].cedula} <br>
                       <b>Cargo:</b> ${correoInfoPideVacacion.rows[0].tipo_cargo} <br>
                       <b>Departamento:</b> ${correoInfoPideVacacion.rows[0].departamento} <br>
                       <b>Generado mediante:</b> Aplicación Web <br>
                       <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                       <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                   </p>
                   <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                   <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                       <b>Motivo:</b> Vacaciones <br>   
                       <b>Fecha de Solicitud:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                       <b>Desde:</b> ${desde} <br>
                       <b>Hasta:</b> ${hasta} <br>
                       <b>Estado:</b> ${estado_v} <br><br>
                       <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de realización de vacaciones.</a> <br><br>                           
                       <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
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
    // MÉTODO DE ENVIO DE CORREO ELECTRÓNICO MEDIANTE APLICACIÓN MOVIL
    EnviarCorreoVacacionesMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { idContrato, desde, hasta, id_dep, id_suc, estado_v, correo, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPideVacacion = yield database_1.default.query(`
        SELECT e.correo, e.nombre, e.apellido, e.cedula, 
        ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, 
        d.nombre AS departamento 
        FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, 
        cg_departamentos AS d 
        WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND 
        (SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id) = ecr.id 
        AND tc.id = ecr.cargo AND d.id = ecr.id_departamento 
        ORDER BY cargo DESC
        `, [idContrato]);
                // obj.id_dep === correoInfoPideVacacion.rows[0].id_departamento && obj.id_suc === correoInfoPideVacacion.rows[0].id_sucursal
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                 <body>
                     <div style="text-align: center;">
                         <img width="50%" height="50%" src="cid:cabeceraf"/>
                     </div>
                     <br>
                     <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                         El presente correo es para informar que se ha ${proceso} la siguiente solicitud de vacaciones: <br>  
                     </p>
                     <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                     <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                         <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                         <b>Asunto:</b> ${asunto} <br> 
                         <b>Colaborador que envía:</b> ${correoInfoPideVacacion.rows[0].nombre} ${correoInfoPideVacacion.rows[0].apellido} <br>
                         <b>Número de Cédula:</b> ${correoInfoPideVacacion.rows[0].cedula} <br>
                         <b>Cargo:</b> ${correoInfoPideVacacion.rows[0].tipo_cargo} <br>
                         <b>Departamento:</b> ${correoInfoPideVacacion.rows[0].departamento} <br>
                         <b>Generado mediante:</b> Aplicación Móvil <br>
                         <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                         <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                     </p>
                     <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                     <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                         <b>Motivo:</b> Vacaciones <br>   
                         <b>Fecha de Solicitud:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                         <b>Desde:</b> ${desde} <br>
                         <b>Hasta:</b> ${hasta} <br>
                         <b>Estado:</b> ${estado_v} <br><br>
                         <b>${tipo_solicitud}:</b> ${solicitado_por} <br><br>
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
                res.jsonp({ message: 'Ups algo salio mal !!! No fue posible enviar correo electrónico.' });
            }
        });
    }
}
exports.VACACIONES_CONTROLADOR = new VacacionesControlador();
exports.default = exports.VACACIONES_CONTROLADOR;
