import { Request, Response } from 'express';
import pool from '../../database';
import fs from 'fs';
const nodemailer = require("nodemailer");

class PermisosControlador {

    public async ListarPermisos(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT * FROM permisos');
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarEstadosPermisos(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
            'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
            'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato FROM permisos AS p, ' +
            'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id_empl_contrato = ec.id AND ' +
            'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id  AND (p.estado = 1 OR p.estado = 2) ' +
            'ORDER BY estado DESC, fec_creacion DESC');
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ message: 'Resource not found' }).end();
        }
    }

    public async ListarPermisosAutorizados(req: Request, res: Response) {
        const PERMISOS = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
            'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
            'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato FROM permisos AS p, ' +
            'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id_empl_contrato = ec.id AND ' +
            'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id  AND (p.estado = 3 OR p.estado = 4) ' +
            'ORDER BY estado ASC, fec_creacion DESC');
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUnPermisoInfo(req: Request, res: Response) {
        const id = req.params.id_permiso
        const PERMISOS = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
            'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.nombre, e.apellido, e.cedula, ' +
            'e.id AS id_empleado, cp.id AS id_tipo_permiso, cp.descripcion AS nom_permiso, ec.id AS id_contrato ' +
            'FROM permisos AS p, empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id = $1 AND ' +
            'p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id ORDER ' +
            'BY fec_creacion DESC', [id]);
        if (PERMISOS.rowCount > 0) {
            return res.json(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerUnPermiso(req: Request, res: Response) {
        const id = req.params.id;
        const PERMISOS = await pool.query('SELECT * FROM permisos WHERE id = $1', [id]);
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearPermisos(req: Request, res: Response): Promise<void> {
        const { fec_creacion, descripcion, fec_inicio, fec_final, dia, hora_numero, legalizado, estado,
            dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, num_permiso, docu_nombre,
            id_empl_cargo, hora_salida, hora_ingreso, codigo, depa_user_loggin } = req.body;
        await pool.query('INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, ' +
            'hora_numero, legalizado, estado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, ' +
            'num_permiso, docu_nombre, id_empl_cargo, hora_salida, hora_ingreso, codigo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, ' +
            '$13, $14, $15, $16, $17, $18)', [fec_creacion, descripcion, fec_inicio, fec_final, dia, hora_numero, legalizado,
            estado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, num_permiso, docu_nombre,
            id_empl_cargo, hora_salida, hora_ingreso, codigo]);

        const JefesDepartamentos = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
            'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
            'ecn.id AS contrato, e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.permiso_mail, ' +
            'c.permiso_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
            'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
            'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
            'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
            'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_user_loggin]);
        let depa_padre = JefesDepartamentos.rows[0].depa_padre;
        let JefeDepaPadre;

        if (depa_padre !== null) {
            do {
                JefeDepaPadre = await pool.query('SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, ' +
                    'cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ' +
                    'ecn.id AS contrato, e.id AS empleado, e.nombre, e.apellido, e.cedula, e.correo, c.permiso_mail, ' +
                    'c.permiso_noti FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, ' +
                    'sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c ' +
                    'WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND ' +
                    'da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
                    'ecn.id_empleado = e.id AND e.id = c.id_empleado', [depa_padre])
                depa_padre = JefeDepaPadre.rows[0].depa_padre;
                JefesDepartamentos.rows.push(JefeDepaPadre.rows[0]);
            } while (depa_padre !== null);

            res.jsonp(JefesDepartamentos.rows);
        } else {
            res.jsonp(JefesDepartamentos.rows);
        }

    }

    public async SendMailNotifiPermiso(req: Request, res: Response): Promise<void> {
        const { fec_creacion, id_tipo_permiso, id_empl_contrato, id, estado, id_dep, depa_padre, nivel, id_suc, departamento, sucursal, cargo, contrato, empleado, nombre, apellido, cedula, correo, permiso_mail, permiso_noti } = req.body;
        const ultimo = await pool.query('SELECT id, estado FROM permisos WHERE fec_creacion = $1 AND  id_tipo_permiso = $2 AND id_empl_contrato = $3', [fec_creacion, id_tipo_permiso, id_empl_contrato]);
        const correoInfoPidePermiso = await pool.query('SELECT e.id, e.correo, e.nombre, e.apellido, e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ecn.id = ecr.id_empl_contrato ORDER BY cargo DESC', [id_empl_contrato]);

        const email = process.env.EMAIL;
        const pass = process.env.PASSWORD;

        let smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: email,
                pass: pass
            }
        });

        // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
        // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
        if (estado === true) {
            var url = `${process.env.URL_DOMAIN}/ver-permiso`;
            let id_departamento_autoriza = id_dep;
            let id_empleado_autoriza = empleado;
            let data = {
                to: correo,
                from: email,
                subject: 'Solicitud de permiso',
                html: `<p><b>${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido}</b> con número de
                cédula ${correoInfoPidePermiso.rows[0].cedula} solicita autorización de permiso: </p>
                <a href="${url}/${ultimo.rows[0].id}">Ir a verificar permisos</a>`
            };
            if (permiso_mail === true && permiso_noti === true) {
                smtpTransport.sendMail(data, async (error: any, info: any) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.jsonp({ message: 'Permiso se registró con éxito', notificacion: true, id: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado: ultimo.rows[0].estado });
            } else if (permiso_mail === true && permiso_noti === false) {
                smtpTransport.sendMail(data, async (error: any, info: any) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                res.jsonp({ message: 'Permiso se registró con éxito', notificacion: false, id: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado: ultimo.rows[0].estado });
            } else if (permiso_mail === false && permiso_noti === true) {
                res.jsonp({ message: 'Permiso se registró con éxito', notificacion: true, id: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado: ultimo.rows[0].estado });
            } else if (permiso_mail === false && permiso_noti === false) {
                res.jsonp({ message: 'Permiso se registró con éxito', notificacion: false, id: ultimo.rows[0].id, id_departamento_autoriza, id_empleado_autoriza, estado: ultimo.rows[0].estado });
            }
        }
    }

    public async ObtenerNumPermiso(req: Request, res: Response): Promise<any> {
        const { id_empleado } = req.params;
        const NUMERO_PERMISO = await pool.query('SELECT MAX(p.num_permiso) FROM permisos AS p, empl_contratos AS ec, empleados AS e WHERE p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND e.id = $1', [id_empleado]);
        if (NUMERO_PERMISO.rowCount > 0) {
            return res.jsonp(NUMERO_PERMISO.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' }).end;
        }
    }

    public async ObtenerPermisoContrato(req: Request, res: Response) {
        try {
            const { id_empl_contrato } = req.params;
            const PERMISO = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                'WHERE p.id_tipo_permiso = t.id AND p.id_empl_contrato = $1', [id_empl_contrato]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }

    public async ObtenerPermisoCodigo(req: Request, res: Response) {
        try {
            const { codigo } = req.params;
            const PERMISO = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                'WHERE p.id_tipo_permiso = t.id AND p.codigo = $1 ORDER BY p.num_permiso DESC', [codigo]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }

    public async ObtenerPermisoEditar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const PERMISO = await pool.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                'WHERE p.id_tipo_permiso = t.id AND p.id = $1 ORDER BY p.num_permiso DESC', [id]);
            return res.jsonp(PERMISO.rows)
        } catch (error) {
            return res.jsonp(null);
        }
    }

    public async getDoc(req: Request, res: Response): Promise<any> {
        const docs = req.params.docs;
        let filePath = `servidor\\docRespaldosPermisos\\${docs}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

    public async guardarDocumentoPermiso(req: Request, res: Response): Promise<void> {
        let list: any = req.files;
        let doc = list.uploads[0].path.split("\\")[1];
        let id = req.params.id

        await pool.query('UPDATE permisos SET documento = $2 WHERE id = $1', [id, doc]);
        res.jsonp({ message: 'Documento Actualizado' });
    }

    public async ActualizarEstado(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        var estado_letras: any;
        const { estado, id_permiso, id_departamento, id_empleado } = req.body;
        await pool.query('UPDATE permisos SET estado = $1 WHERE id = $2', [estado, id]);

        const JefeDepartamento = await pool.query('SELECT da.id, cg.id AS id_dep, s.id AS id_suc, ' +
            'cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato, ' +
            'e.id AS empleado, e.nombre, e.cedula, e.correo, e.apellido FROM depa_autorizaciones AS da, ' +
            'empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, ' +
            'empleados AS e WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND ' +
            'da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ' +
            'ecn.id_empleado = e.id', [id_departamento]);

        const InfoPermisoReenviarEstadoEmpleado = await pool.query('SELECT p.id, p.descripcion, p.estado, ' +
            'e.cedula, e.nombre, e.apellido, e.correo, co.permiso_mail, co.permiso_noti FROM permisos AS p, ' +
            'empl_contratos AS c, empleados AS e, config_noti AS co WHERE p.id = $1 AND ' +
            'p.id_empl_contrato = c.id AND c.id_empleado = e.id AND co.id_empleado = e.id AND e.id = $2',
            [id_permiso, id_empleado]);

        console.log(estado, id_permiso, id_departamento, id_empleado);
        console.log(JefeDepartamento.rows)
        console.log(InfoPermisoReenviarEstadoEmpleado.rows)

        const email = process.env.EMAIL;
        const pass = process.env.PASSWORD;

        let smtpTransport = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: email,
                pass: pass
            }
        });

        JefeDepartamento.rows.forEach(obj => {

            var url = `${process.env.URL_DOMAIN}/solicitarPermiso`;
            InfoPermisoReenviarEstadoEmpleado.rows.forEach(ele => {
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

                let notifi_realtime = {
                    id_send_empl: obj.empleado,
                    id_receives_depa: obj.id_dep,
                    estado: estado_letras,
                    id_permiso: id_permiso,
                    id_vacaciones: null
                }

                console.log(notifi_realtime);
                let data = {
                    from: obj.correo,
                    to: ele.correo,
                    template: 'hola',
                    subject: 'Estado de solicitud de permiso',
                    html: `<p><b>${obj.nombre} ${obj.apellido}</b> jefe/a del departamento de <b>${obj.departamento}</b> con número de
                    cédula ${obj.cedula} a cambiado el estado de su permiso a: <b>${estado_letras}</b></p>
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
                    smtpTransport.sendMail(data, async (error: any, info: any) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });
                } else if (ele.permiso_mail === true && ele.permiso_noti === false) {
                    smtpTransport.sendMail(data, async (error: any, info: any) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });
                } else if (ele.permiso_mail === false && ele.permiso_noti === true) {
                    res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: true, realtime: [notifi_realtime] });

                } else if (ele.permiso_mail === false && ele.permiso_noti === false) {
                    res.json({ message: 'Estado de permiso actualizado exitosamente', notificacion: false, realtime: [notifi_realtime] });

                }
            });
        });
    }

    public async ObtenerDatosSolicitud(req: Request, res: Response) {
        const id = req.params.id_emple_permiso;
        const SOLICITUD = await pool.query('SELECT *FROM vista_datos_solicitud_permiso WHERE id_emple_permiso = $1', [id]);
        if (SOLICITUD.rowCount > 0) {
            return res.json(SOLICITUD.rows)
        }
        else {
            return res.status(404).json({ text: 'No se encuentran registros' });
        }
    }

    public async ObtenerDatosAutorizacion(req: Request, res: Response) {
        const id = req.params.id_permiso;
        const SOLICITUD = await pool.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
            'p.id AS permiso_id FROM autorizaciones AS a, permisos AS p ' +
            'WHERE p.id = a.id_permiso AND p.id = $1', [id]);
        if (SOLICITUD.rowCount > 0) {
            return res.json(SOLICITUD.rows)
        }
        else {
            return res.status(404).json({ text: 'No se encuentran registros' });
        }
    }

    public async EliminarPermiso(req: Request, res: Response) {
        const { id_permiso, doc } = req.params;
        console.log(id_permiso, doc);

        await pool.query('DELETE FROM realtime_noti where id_permiso = $1', [id_permiso])
        await pool.query('DELETE FROM permisos WHERE id = $1', [id_permiso]);

        let filePath = `servidor\\docRespaldosPermisos\\${doc}`
        let direccionCompleta = __dirname.split("servidor")[0] + filePath;
        fs.unlinkSync(direccionCompleta);

        res.jsonp({ message: 'registro eliminado' });
    }

    public async EditarPermiso(req: Request, res: Response): Promise<void> {
        const id = req.params.id
        const { descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, anterior_doc, docu_nombre, hora_salida, hora_ingreso } = req.body;
        console.log(descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, anterior_doc, docu_nombre);
        if (anterior_doc === null && docu_nombre === null) {
            await pool.query('UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, hora_salida = $9, hora_ingreso = $10 WHERE id = $11', [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, hora_salida, hora_ingreso, id]);
            res.jsonp({ message: 'Permiso Editado' });
        } else {
            await pool.query('UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, docu_nombre = $9, hora_salida = $10, hora_ingreso = $11 WHERE id = $12', [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, docu_nombre, hora_salida, hora_ingreso, id]);
            console.log(anterior_doc, docu_nombre);
            let filePath = `servidor\\docRespaldosPermisos\\${anterior_doc}`
            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
            fs.unlinkSync(direccionCompleta);
            res.jsonp({ message: 'Permiso Editado' });
        }
    }

    public async ObtenerFechasPermiso(req: Request, res: Response) {
        const codigo = req.params.codigo;
        const { fec_inicio, fec_final } = req.body;
        const PERMISOS = await pool.query('SELECT pg.fec_hora_horario::date AS fecha, pg.fec_hora_horario::time AS hora, ' +
            'pg.tipo_entr_salida FROM plan_general AS pg WHERE(pg.tipo_entr_salida = \'E\' OR pg.tipo_entr_salida = \'S\') ' +
            'AND pg.codigo = $3 AND(pg.fec_hora_horario:: date = $1 OR pg.fec_hora_horario:: date = $2)',
            [fec_inicio, fec_final, codigo]);
        if (PERMISOS.rowCount > 0) {
            return res.jsonp(PERMISOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }
}

export const PERMISOS_CONTROLADOR = new PermisosControlador();

export default PERMISOS_CONTROLADOR;