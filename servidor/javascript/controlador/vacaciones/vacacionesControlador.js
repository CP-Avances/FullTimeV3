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
const database_1 = __importDefault(require("../../database"));
const settingsMail_1 = require("../../libs/settingsMail");
const CargarVacacion_1 = require("../../libs/CargarVacacion");
class VacacionesControlador {
    ListarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACACIONES = yield database_1.default.query('SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, ' +
                'v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empl_solicita, ' +
                'e.nombre, e.apellido FROM vacaciones AS v, peri_vacaciones AS p, empl_contratos AS c, ' +
                'empleados AS e WHERE v.id_peri_vacacion = p.id AND ' +
                'p.estado = 1 AND p.id_empl_contrato = c.id AND c.id_empleado = e.id  AND (v.estado = 1 OR v.estado = 2) ORDER BY id DESC');
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
            const VACACIONES = yield database_1.default.query('SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, ' +
                'v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion, v.id_empl_cargo, e.id AS id_empl_solicita, e.nombre, e.apellido FROM vacaciones AS v, ' +
                'peri_vacaciones AS p, empl_contratos AS c, empleados AS e WHERE v.id_peri_vacacion = p.id AND ' +
                'p.estado = 1 AND p.id_empl_contrato = c.id AND c.id_empleado = e.id  AND (v.estado = 3 OR v.estado = 4) ORDER BY id DESC');
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
            const VACACIONES = yield database_1.default.query('SELECT v.fec_inicio, v.fec_final, v.fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion, v.id_empl_cargo, pv.id_empl_contrato AS id_contrato, ec.id_empleado FROM vacaciones AS v, peri_vacaciones AS pv, empl_contratos AS ec WHERE v.id = $1 AND pv.estado = 1 AND v.id_peri_vacacion = pv.id AND ec.id = pv.id_empl_contrato', [id]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion, depa_user_loggin, id_empl_cargo, codigo } = req.body;
            yield database_1.default.query('INSERT INTO vacaciones (fec_inicio, fec_final, fec_ingreso, estado, dia_libre, ' +
                'dia_laborable, legalizado, id_peri_vacacion, id_empl_cargo, codigo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [fec_inicio, fec_final, fec_ingreso, estado, dia_libre, dia_laborable, legalizado, id_peri_vacacion, id_empl_cargo, codigo]);
            console.log('******************', depa_user_loggin);
            const JefesDepartamentos = yield database_1.default.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
                'ecn.id AS contrato, e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.vaca_mail, ' +
                'c.vaca_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                'sucursales AS s, empl_contratos AS ecn, empleados AS e, config_noti AS c ' +
                'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
                'cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id AND ' +
                'e.id = c.id_empleado', [depa_user_loggin]);
            console.log('******************', JefesDepartamentos.rows[0]);
            let depa_padre = JefesDepartamentos.rows[0].depa_padre;
            let JefeDepaPadre;
            if (depa_padre !== null) {
                console.log('******************', depa_padre);
                do {
                    JefeDepaPadre = yield database_1.default.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.vaca_mail, c.vaca_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e, config_noti AS c WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre]);
                    console.log(JefeDepaPadre.rows.length);
                    if (JefeDepaPadre.rows.length > 0) {
                        depa_padre = JefeDepaPadre.rows[0].depa_padre;
                        JefesDepartamentos.rows.push(JefeDepaPadre.rows[0]);
                    }
                    else {
                        depa_padre = null;
                    }
                } while (depa_padre !== null || JefeDepaPadre.rows.length !== 0);
                res.jsonp(JefesDepartamentos.rows);
            }
            else {
                res.jsonp(JefesDepartamentos.rows);
            }
        });
    }
    SendMailNotifiPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const { idContrato, fec_inicio, fec_final, id, estado, id_dep, depa_padre, nivel, id_suc, departamento, sucursal, cargo, contrato, empleado, nombre, apellido, cedula, correo, vaca_mail, vaca_noti } = req.body;
            const ultimo = yield database_1.default.query('SELECT * FROM vacaciones WHERE fec_inicio = $1 AND fec_final = $2  ORDER BY id DESC LIMIT 1', [fec_inicio, fec_final]);
            const correoInfoPidePermiso = yield database_1.default.query('SELECT e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ecn.id = ecr.id_empl_contrato ORDER BY cargo DESC', [idContrato]);
            // obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
            if (estado === true) {
                var url = `${process.env.URL_DOMAIN}/ver-vacacion`;
                let id_departamento_autoriza = id_dep;
                let id_empleado_autoriza = empleado;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: 'Solicitud de vacaciones',
                    html: `<p><b>${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido}</b> con número de
        cédula ${correoInfoPidePermiso.rows[0].cedula} solicita vacaciones desde la fecha ${fec_inicio.split("T")[0]}
        hasta ${fec_final.split("T")[0]} </p>
        <a href="${url}/${ultimo.rows[0].id}">Ir a verificar permiso</a>`
                };
                if (vaca_mail === true && vaca_noti === true) {
                    (0, settingsMail_1.enviarMail)(data);
                    res.jsonp({ message: 'Vacaciones guardadas con éxito', notificacion: true, id_vacacion: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado });
                }
                else if (vaca_mail === true && vaca_noti === false) {
                    (0, settingsMail_1.enviarMail)(data);
                    res.jsonp({ message: 'Vacaciones guardadas con éxito', notificacion: false, id_vacacion: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado });
                }
                else if (vaca_mail === false && vaca_noti === true) {
                    res.jsonp({ message: 'Vacaciones guardadas con éxito', notificacion: true, id_vacacion: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado });
                }
                else if (vaca_mail === false && vaca_noti === false) {
                    res.jsonp({ message: 'Vacaciones guardadas con éxito', notificacion: false, id_vacacion: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado });
                }
            }
        });
    }
    VacacionesIdPeriodo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const VACACIONES = yield database_1.default.query('SELECT v.fec_inicio, v.fec_final, fec_ingreso, v.estado, v.dia_libre, v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion FROM vacaciones AS v, peri_vacaciones AS p WHERE v.id_peri_vacacion = p.id AND p.estado = 1 AND p.id = $1 ORDER BY p.fec_final ASC', [id]);
            if (VACACIONES.rowCount > 0) {
                return res.jsonp(VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarVacacionId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const VACACIONES = yield database_1.default.query('SELECT v.fec_inicio, v.fec_final, fec_ingreso, v.estado, ' +
                'v.dia_libre, v.dia_laborable, v.legalizado, v.id, v.id_peri_vacacion ' +
                'FROM vacaciones AS v, peri_vacaciones AS p WHERE v.id_peri_vacacion = p.id AND p.estado = 1 AND ' +
                'v.id = $1 ORDER BY p.fec_final ASC', [id]);
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
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const id = req.params.id;
            const { estado, id_vacacion, id_rece_emp, id_depa_send } = req.body;
            yield database_1.default.query('UPDATE vacaciones SET estado = $1 WHERE id = $2', [estado, id]);
            console.log(estado, id_vacacion, id_rece_emp, id_depa_send);
            const JefeDepartamento = yield database_1.default.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_depa_send]);
            const InfoVacacionesReenviarEstadoEmpleado = yield database_1.default.query('SELECT v.id, v.estado, v.fec_inicio, v.fec_final, v.fec_ingreso, e.id AS id_empleado, e.cedula, e.nombre, e.apellido, e.correo, co.vaca_mail, co.vaca_noti FROM vacaciones AS v, peri_vacaciones AS pv, empl_contratos AS c, empleados AS e, config_noti AS co WHERE v.id = $1 AND v.id_peri_vacacion = pv.id AND pv.estado = 1 AND c.id = pv.id_empl_contrato AND co.id_empleado = e.id AND e.id = $2', [id_vacacion, id_rece_emp]);
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
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de solicitud de Vacaciones',
                        html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
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
                <a href="${url}">Ir a verificar estado vacaciones</a>`
                    };
                    if (ele.vaca_mail === true && ele.vaca_noti === true) {
                        (0, settingsMail_1.enviarMail)(data);
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    }
                    else if (ele.vaca_mail === true && ele.vaca_noti === false) {
                        (0, settingsMail_1.enviarMail)(data);
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
    EliminarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_vacacion } = req.params;
            yield database_1.default.query('DELETE FROM realtime_noti WHERE id_vacaciones = $1', [id_vacacion]);
            yield database_1.default.query('DELETE FROM vacaciones WHERE id = $1', [id_vacacion]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    EditarVacaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable } = req.body;
            yield database_1.default.query('UPDATE vacaciones SET fec_inicio = $1, fec_final = $2, fec_ingreso = $3, dia_libre = $4, dia_laborable = $5 WHERE id = $6', [fec_inicio, fec_final, fec_ingreso, dia_libre, dia_laborable, id]);
            res.jsonp({ message: 'Vacaciones editadas' });
        });
    }
}
exports.VACACIONES_CONTROLADOR = new VacacionesControlador();
exports.default = exports.VACACIONES_CONTROLADOR;
