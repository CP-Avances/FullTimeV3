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
exports.AUTORIZACION_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const settingsMail_1 = require("../../libs/settingsMail");
const nodemailer = require("nodemailer");
class AutorizacionesControlador {
    ListarAutorizaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones ORDER BY id');
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerAutorizacionByPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_permiso = $1', [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerAutorizacionByVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_vacacion;
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_vacacion = $1', [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerAutorizacionByHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_hora_extra;
            const AUTORIZACIONES = yield database_1.default.query('SELECT * FROM autorizaciones WHERE id_hora_extra = $1', [id]);
            if (AUTORIZACIONES.rowCount > 0) {
                return res.jsonp(AUTORIZACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento } = req.body;
            yield database_1.default.query('INSERT INTO autorizaciones ( orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [orden, estado, id_departamento, id_permiso, id_vacacion, id_hora_extra, id_plan_hora_extra, id_documento]);
            res.jsonp({ message: 'Autorizacion guardado' });
        });
    }
    ActualizarEstadoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const id = req.params.id;
            const { id_documento, estado, id_permiso, id_departamento, id_empleado } = req.body;
            yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id = $3', [estado, id_documento, id]);
            res.jsonp({ message: 'Autorizacion guardado' });
            /*const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_departamento]);
            const InfoPermisoReenviarEstadoEmpleado = await pool.query('SELECT p.id, p.descripcion, p.estado, e.cedula, e.nombre, e.apellido, e.correo, co.permiso_mail, co.permiso_noti FROM permisos AS p, empl_contratos AS c, empleados AS e, config_noti AS co WHERE p.id = $1 AND p.id_empl_contrato = c.id AND c.id_empleado = e.id AND co.id_empleado = e.id AND e.id = $2', [id_permiso, id_empleado]);
    
            // console.log(JefeDepartamento.rows)
            // console.log(InfoPermisoReenviarEstadoEmpleado.rows)
            const estadoAutorizacion = [
                { id: 1, nombre: 'Pendiente' },
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' },
            ];
    
            let nombreEstado = '';
            estadoAutorizacion.forEach(obj => {
                if (obj.id === estado) {
                    nombreEstado = obj.nombre
                }
            });
    
            JefeDepartamento.rows.forEach(obj => {
                var url = `${process.env.URL_DOMAIN}/solicitarPermiso`;
                InfoPermisoReenviarEstadoEmpleado.rows.forEach(ele => {
                    let notifi_realtime = {
                        id_send_empl: obj.empleado,
                        id_receives_depa: obj.id_dep,
                        estado: nombreEstado,
                        id_permiso: id_permiso,
                        id_vacaciones: null,
                        id_hora_extra: null
                    }
    
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de solicitud de permiso',
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
                        <a href="${url}">Ir a verificar estado permisos</a>`
                    };
                    console.log(data);
                    if (ele.permiso_mail === true && ele.permiso_noti === true) {
                        enviarMail(data);
                        res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.permiso_mail === true && ele.permiso_noti === false) {
                        enviarMail(data);
                        res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    } else if (ele.permiso_mail === false && ele.permiso_noti === true) {
                        res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.permiso_mail === false && ele.permiso_noti === false) {
                        res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
                });
            });*/
        });
    }
    ActualizarEstadoAutorizacionPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_documento, estado, id_permiso } = req.body;
            yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_permiso = $3', [estado, id_documento, id_permiso]);
            res.jsonp({ message: 'Autorizacion guardado' });
        });
    }
    ActualizarEstadoVacacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            //const { id_documento, estado, id_vacaciones, id_departamento, id_empleado } = req.body;
            const { id_documento, estado, id_vacacion } = req.body;
            yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_vacacion = $3', [estado, id_documento, id_vacacion]);
            res.jsonp({ message: 'Autorizacion guardado' });
            /*  const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_departamento]);
            const InfoVacacionesReenviarEstadoEmpleado = await pool.query('SELECT v.id, v.estado, v.fec_inicio, v.fec_final, v.fec_ingreso, e.id AS id_empleado, e.cedula, e.nombre, e.apellido, e.correo, co.vaca_mail, co.vaca_noti FROM vacaciones AS v, peri_vacaciones AS pv, empl_contratos AS c, empleados AS e, config_noti AS co WHERE v.id = $1 AND v.id_peri_vacacion = pv.id AND c.id = pv.id_empl_contrato AND pv.estado = 1 AND co.id_empleado = e.id AND e.id = $2', [id_vacaciones, id_empleado]);
            // console.log(JefeDepartamento.rows)
            // console.log(InfoVacacionesReenviarEstadoEmpleado.rows)
            const estadoAutorizacion = [
                { id: 1, nombre: 'Pendiente' },
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' },
            ];
    
            let nombreEstado = '';
            estadoAutorizacion.forEach(obj => {
                if (obj.id === estado) {
                    nombreEstado = obj.nombre
                }
            })
    
            JefeDepartamento.rows.forEach(obj => {
                var url = `${process.env.URL_DOMAIN}/datosEmpleado`;
                InfoVacacionesReenviarEstadoEmpleado.rows.forEach(ele => {
                    let notifi_realtime = {
                        id_send_empl: obj.empleado,
                        id_receives_depa: obj.id_dep,
                        estado: nombreEstado,
                        id_permiso: null,
                        id_vacaciones: id_vacaciones,
                        id_hora_extra: null,
                    }
    
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de la Autorización de Vacaciones',
                        html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                        cédula ${obj.cedula} a cambiado el estado de la Autorización de su solicitud de vacaciones a: <b>${nombreEstado}</b></p>
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
                        <a href="${url}">Ir a verificar estado permisos</a>`
                    };
    
                    if (ele.vaca_mail === true && ele.vaca_noti === true) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.vaca_mail === true && ele.vaca_noti === false) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    } else if (ele.vaca_mail === false && ele.vaca_noti === true) {
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.vaca_mail === false && ele.vaca_noti === false) {
                        res.json({ message: 'Estado de las vacaciones actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
                });
            });*/
        });
    }
    ActualizarEstadoHoraExtra(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const id = req.params.id_hora_extra;
            //const { id_documento, estado, id_hora_extra, id_departamento } = req.body;
            const { id_documento, estado } = req.body;
            yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_hora_extra = $3', [estado, id_documento, id]);
            res.jsonp({ message: 'Autorizacion guardado' });
            /*const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_departamento]);
            const InfoHoraExtraReenviarEstadoEmpleado = await pool.query('SELECT h.descripcion, h.fec_inicio, h.fec_final, h.fec_solicita, h.estado, h.num_hora, h.id, e.id AS empleado, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, c.hora_extra_mail, c.hora_extra_noti FROM empleados AS e, empl_cargos AS ecr, hora_extr_pedidos AS h, config_noti AS c WHERE h.id = $1 AND h.id_empl_cargo = ecr.id AND e.id = h.id_usua_solicita AND e.id = c.id_empleado ORDER BY cargo DESC LIMIT 1', [id_hora_extra]);
    
            const estadoAutorizacion = [
                { id: 1, nombre: 'Pendiente' },
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' },
            ];
    
            let nombreEstado = '';
            estadoAutorizacion.forEach(obj => {
                if (obj.id === estado) {
                    nombreEstado = obj.nombre
                }
            })
    
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
    
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de la Autorización de Hora Extra',
                        html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                        cédula ${obj.cedula} a cambiado el estado de la Autorización de su solicitud de hora extra a: <b>${nombreEstado}</b></p>
                        <h4><b>Informacion de las vacaciones</b></h4>
                        <ul>
                            <li><b>Empleado</b>: ${ele.nombre} ${ele.apellido} </li>
                            <li><b>Cédula</b>: ${ele.cedula} </li>
                            <li><b>Sucursal</b>: ${obj.sucursal} </li>
                            <li><b>Departamento</b>: ${obj.departamento} </li>
                            </ul>
                        <a href="${url}">Ir a verificar estado hora extra</a>`
                    };
    
                    if (ele.hora_extra_mail === true && ele.hora_extra_noti === true) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === true && ele.hora_extra_noti === false) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === true) {
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === false) {
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
    
                });
            });*/
        });
    }
    ActualizarEstadoPlanificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, settingsMail_1.Credenciales)(req.id_empresa);
            const id = req.params.id_plan_hora_extra;
            //const { id_documento, estado, id_hora_extra, id_departamento } = req.body;
            const { id_documento, estado } = req.body;
            yield database_1.default.query('UPDATE autorizaciones SET estado = $1, id_documento = $2 WHERE id_plan_hora_extra = $3', [estado, id_documento, id]);
            res.jsonp({ message: 'Autorizacion guardado' });
            /*const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, e.nombre, e.cedula, e.correo FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id', [id_departamento]);
            const InfoHoraExtraReenviarEstadoEmpleado = await pool.query('SELECT h.descripcion, h.fec_inicio, h.fec_final, h.fec_solicita, h.estado, h.num_hora, h.id, e.id AS empleado, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, c.hora_extra_mail, c.hora_extra_noti FROM empleados AS e, empl_cargos AS ecr, hora_extr_pedidos AS h, config_noti AS c WHERE h.id = $1 AND h.id_empl_cargo = ecr.id AND e.id = h.id_usua_solicita AND e.id = c.id_empleado ORDER BY cargo DESC LIMIT 1', [id_hora_extra]);
    
            const estadoAutorizacion = [
                { id: 1, nombre: 'Pendiente' },
                { id: 2, nombre: 'Pre-autorizado' },
                { id: 3, nombre: 'Autorizado' },
                { id: 4, nombre: 'Negado' },
            ];
    
            let nombreEstado = '';
            estadoAutorizacion.forEach(obj => {
                if (obj.id === estado) {
                    nombreEstado = obj.nombre
                }
            })
    
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
    
                    let data = {
                        from: obj.correo,
                        to: ele.correo,
                        subject: 'Estado de la Autorización de Hora Extra',
                        html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                        cédula ${obj.cedula} a cambiado el estado de la Autorización de su solicitud de hora extra a: <b>${nombreEstado}</b></p>
                        <h4><b>Informacion de las vacaciones</b></h4>
                        <ul>
                            <li><b>Empleado</b>: ${ele.nombre} ${ele.apellido} </li>
                            <li><b>Cédula</b>: ${ele.cedula} </li>
                            <li><b>Sucursal</b>: ${obj.sucursal} </li>
                            <li><b>Departamento</b>: ${obj.departamento} </li>
                            </ul>
                        <a href="${url}">Ir a verificar estado hora extra</a>`
                    };
    
                    if (ele.hora_extra_mail === true && ele.hora_extra_noti === true) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === true && ele.hora_extra_noti === false) {
                        enviarMail(data);
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === true) {
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                    } else if (ele.hora_extra_mail === false && ele.hora_extra_noti === false) {
                        res.json({ message: 'Estado de las hora extra actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                    }
    
                });
            });*/
        });
    }
}
exports.AUTORIZACION_CONTROLADOR = new AutorizacionesControlador();
exports.default = exports.AUTORIZACION_CONTROLADOR;
