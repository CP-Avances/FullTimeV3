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
exports.PERMISOS_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const path_1 = __importDefault(require("path"));
const nodemailer = require("nodemailer");
class PermisosControlador {
    ListarPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT * FROM permisos');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarEstadosPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
                'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato FROM permisos AS p, ' +
                'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id_empl_contrato = ec.id AND ' +
                'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id  AND (p.estado = 1 OR p.estado = 2) ' +
                'ORDER BY estado DESC, fec_creacion DESC');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ message: 'Resource not found' }).end();
            }
        });
    }
    ListarPermisosAutorizados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PERMISOS = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                'p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.id AS id_emple_solicita, e.nombre, e.apellido, ' +
                'e.cedula, cp.descripcion AS nom_permiso, ec.id AS id_contrato FROM permisos AS p, ' +
                'empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp WHERE p.id_empl_contrato = ec.id AND ' +
                'ec.id_empleado = e.id AND p.id_tipo_permiso = cp.id  AND (p.estado = 3 OR p.estado = 4) ' +
                'ORDER BY estado ASC, fec_creacion DESC');
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnPermisoInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const PERMISOS = yield database_1.default.query(`
            SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, p.dia, p.hora_salida, p.hora_ingreso, 
            p.hora_numero, p.documento, p.docu_nombre, p.fec_final, p.estado, p.id_empl_cargo, e.nombre, 
            e.apellido, e.cedula, e.id AS id_empleado, cp.id AS id_tipo_permiso, 
            cp.descripcion AS nom_permiso, ec.id AS id_contrato 
            FROM permisos AS p, empl_contratos AS ec, empleados AS e, cg_tipo_permisos AS cp 
            WHERE p.id = $1 AND p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND 
            p.id_tipo_permiso = cp.id
            `, [id]);
            if (PERMISOS.rowCount > 0) {
                return res.json(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    ObtenerUnPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const PERMISOS = yield database_1.default.query('SELECT * FROM permisos WHERE id = $1', [id]);
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerNumPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const NUMERO_PERMISO = yield database_1.default.query('SELECT MAX(p.num_permiso) FROM permisos AS p, empl_contratos AS ec, empleados AS e WHERE p.id_empl_contrato = ec.id AND ec.id_empleado = e.id AND e.id = $1', [id_empleado]);
            if (NUMERO_PERMISO.rowCount > 0) {
                return res.jsonp(NUMERO_PERMISO.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' }).end;
            }
        });
    }
    ObtenerPermisoContrato(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id_empl_contrato } = req.params;
                const PERMISO = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                    'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                    'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                    't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                    'WHERE p.id_tipo_permiso = t.id AND p.id_empl_contrato = $1', [id_empl_contrato]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    ObtenerPermisoCodigo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { codigo } = req.params;
                const PERMISO = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                    'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                    'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                    'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                    't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                    'WHERE p.id_tipo_permiso = t.id AND p.codigo = $1 ORDER BY p.num_permiso DESC', [codigo]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    ObtenerPermisoEditar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const PERMISO = yield database_1.default.query('SELECT p.id, p.fec_creacion, p.descripcion, p.fec_inicio, ' +
                    'p.fec_final, p.dia, p.hora_numero, p.legalizado, p.estado, p.dia_libre, p.id_tipo_permiso, ' +
                    'p.id_empl_contrato, p.id_peri_vacacion, p.num_permiso, p.documento, p.docu_nombre, ' +
                    'p.hora_salida, p.hora_ingreso, p.codigo, ' +
                    't.descripcion AS nom_permiso FROM permisos AS p, cg_tipo_permisos AS t ' +
                    'WHERE p.id_tipo_permiso = t.id AND p.id = $1 ORDER BY p.num_permiso DESC', [id]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    getDoc(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\docRespaldosPermisos\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    ObtenerDatosSolicitud(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_emple_permiso;
            const SOLICITUD = yield database_1.default.query('SELECT *FROM vista_datos_solicitud_permiso WHERE id_emple_permiso = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerDatosAutorizacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_permiso;
            const SOLICITUD = yield database_1.default.query('SELECT a.id AS id_autorizacion, a.id_documento AS empleado_estado, ' +
                'p.id AS permiso_id FROM autorizaciones AS a, permisos AS p ' +
                'WHERE p.id = a.id_permiso AND p.id = $1', [id]);
            if (SOLICITUD.rowCount > 0) {
                return res.json(SOLICITUD.rows);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerFechasPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const codigo = req.params.codigo;
            const { fec_inicio, fec_final } = req.body;
            const PERMISOS = yield database_1.default.query('SELECT pg.fec_hora_horario::date AS fecha, pg.fec_hora_horario::time AS hora, ' +
                'pg.tipo_entr_salida FROM plan_general AS pg WHERE(pg.tipo_entr_salida = \'E\' OR pg.tipo_entr_salida = \'S\') ' +
                'AND pg.codigo = $3 AND(pg.fec_hora_horario:: date = $1 OR pg.fec_hora_horario:: date = $2)', [fec_inicio, fec_final, codigo]);
            if (PERMISOS.rowCount > 0) {
                return res.jsonp(PERMISOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // CONSULTA DE SOLICITUDES DENTRO DE UN RANGO DE FECHAS
    BuscarPermisos_Fechas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { fec_inicio, fec_final, codigo } = req.body;
                const PERMISO = yield database_1.default.query('SELECT id FROM permisos ' +
                    'WHERE ((fec_inicio between $1 AND $2) OR (fec_final between $1 AND $2)) ' +
                    'AND codigo = $3', [fec_inicio, fec_final, codigo]);
                return res.jsonp(PERMISO.rows);
            }
            catch (error) {
                return res.jsonp(null);
            }
        });
    }
    /** ************************************************************************************************* **
     ** **                             METODOS PARA REGISTRO DE PERMISOS                               ** **
     ** ************************************************************************************************* **/
    // METODO PARA CREAR PERMISOS
    CrearPermisos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo, depa_user_loggin } = req.body;
            const response = yield database_1.default.query('INSERT INTO permisos (fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, ' +
                'dia_libre, id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso, ' +
                'docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo) ' +
                'VALUES( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18 ) ' +
                'RETURNING * ', [fec_creacion, descripcion, fec_inicio, fec_final, dia, legalizado, dia_libre,
                id_tipo_permiso, id_empl_contrato, id_peri_vacacion, hora_numero, num_permiso,
                docu_nombre, estado, id_empl_cargo, hora_salida, hora_ingreso, codigo]);
            const [objetoPermiso] = response.rows;
            if (!objetoPermiso)
                return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
            const permiso = objetoPermiso;
            console.log(permiso);
            console.log(req.query);
            const JefesDepartamentos = yield database_1.default.query(`
            SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
            cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
            e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
            c.permiso_mail, c.permiso_noti
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
                    SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
                    cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
                    ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, 
                    (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, 
                    c.permiso_noti 
                    FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                    sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                    WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                    da.id_departamento = cg.id AND 
                    da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
                    ecn.id_empleado = e.id AND e.id = c.id_empleado
                    `, [depa_padre]);
                    depa_padre = JefeDepaPadre.rows[0].depa_padre;
                    JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                } while (depa_padre !== null);
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
            else {
                permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                return res.status(200).jsonp(permiso);
            }
        });
    }
    // REGISTRAR DOCUMENTO DE RESPALDO DE PERMISO  
    GuardarDocumentoPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let doc = list.uploads[0].path.split("\\")[1];
            let id = req.params.id;
            yield database_1.default.query(`
            UPDATE permisos SET documento = $2 WHERE id = $1
            `, [id, doc]);
            res.jsonp({ message: 'Documento Actualizado' });
        });
    }
    // METODO PARA EDITAR SOLICITUD DE PERMISOS
    EditarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso, anterior_doc, docu_nombre, hora_salida, hora_ingreso, depa_user_loggin } = req.body;
            if ((anterior_doc === null && docu_nombre === null) || (anterior_doc === '' && docu_nombre === '')) {
                console.log('entra ver permiso');
                const response = yield database_1.default.query(`
                    UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, 
                    id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, hora_salida = $9, 
                    hora_ingreso = $10 WHERE id = $11 RETURNING *
                `, [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero, num_permiso,
                    hora_salida, hora_ingreso, id]);
                const [objetoPermiso] = response.rows;
                if (!objetoPermiso)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const permiso = objetoPermiso;
                console.log(permiso);
                console.log(req.query);
                const JefesDepartamentos = yield database_1.default.query(`
                SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
                cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
                e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
                c.permiso_mail, c.permiso_noti
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
                        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
                        cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
                        ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, 
                        (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, 
                        c.permiso_noti 
                        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                        WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                        da.id_departamento = cg.id AND 
                        da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
                        ecn.id_empleado = e.id AND e.id = c.id_empleado
                        `, [depa_padre]);
                        depa_padre = JefeDepaPadre.rows[0].depa_padre;
                        JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                    } while (depa_padre !== null);
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(permiso);
                }
                else {
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(permiso);
                }
            }
            else {
                const response = yield database_1.default.query(`
                    UPDATE permisos SET descripcion = $1, fec_inicio = $2, fec_final = $3, dia = $4, dia_libre = $5, 
                    id_tipo_permiso = $6, hora_numero = $7, num_permiso = $8, docu_nombre = $9, hora_salida = $10, 
                    hora_ingreso = $11 WHERE id = $12 RETURNING *
                `, [descripcion, fec_inicio, fec_final, dia, dia_libre, id_tipo_permiso, hora_numero,
                    num_permiso, docu_nombre, hora_salida, hora_ingreso, id]);
                let filePath = `servidor\\docRespaldosPermisos\\${anterior_doc}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
                const [objetoPermiso] = response.rows;
                if (!objetoPermiso)
                    return res.status(404).jsonp({ message: 'Solicitud no registrada.' });
                const permiso = objetoPermiso;
                console.log(permiso);
                console.log(req.query);
                const JefesDepartamentos = yield database_1.default.query(`
                SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, cg.nivel, s.id AS id_suc,
                cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, ecn.id AS contrato,
                e.id AS empleado, (e.nombre || ' ' || e.apellido) as fullname , e.cedula, e.correo,
                c.permiso_mail, c.permiso_noti
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
                        SELECT da.id, da.estado, cg.id AS id_dep, cg.depa_padre, 
                        cg.nivel, s.id AS id_suc, cg.nombre AS departamento, s.nombre AS sucursal, 
                        ecr.id AS cargo, ecn.id AS contrato, e.id AS empleado, 
                        (e.nombre || ' ' || e.apellido) as fullname, e.cedula, e.correo, c.permiso_mail, 
                        c.permiso_noti 
                        FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, 
                        sucursales AS s, empl_contratos AS ecn,empleados AS e, config_noti AS c 
                        WHERE da.id_departamento = $1 AND da.id_empl_cargo = ecr.id AND 
                        da.id_departamento = cg.id AND 
                        da.estado = true AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND 
                        ecn.id_empleado = e.id AND e.id = c.id_empleado
                        `, [depa_padre]);
                        depa_padre = JefeDepaPadre.rows[0].depa_padre;
                        JefesDepartamentos.push(JefeDepaPadre.rows[0]);
                    } while (depa_padre !== null);
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(permiso);
                }
                else {
                    permiso.EmpleadosSendNotiEmail = JefesDepartamentos;
                    return res.status(200).jsonp(permiso);
                }
            }
        });
    }
    // METODO PARA ELIMINAR PERMISO
    EliminarPermiso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { id_permiso, doc } = req.params;
            yield database_1.default.query(`
               DELETE FROM realtime_noti where id_permiso = $1
               `, [id_permiso]);
            const response = yield database_1.default.query(`
            DELETE FROM permisos WHERE id = $1 RETURNING *
            `, [id_permiso]);
            if (doc != 'null' && doc != '' && doc != null) {
                console.log(id_permiso, doc, ' entra ');
                let filePath = `servidor\\docRespaldosPermisos\\${doc}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
            const [objetoPermiso] = response.rows;
            if (objetoPermiso) {
                return res.status(200).jsonp(objetoPermiso);
            }
            else {
                return res.status(404).jsonp({ message: 'Solicitud no eliminada.' });
            }
        });
    }
    // METODO PARA ACTUALIZAR ESTADO DEL PERMISO
    ActualizarEstado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { estado } = req.body;
            yield database_1.default.query(`
            UPDATE permisos SET estado = $1 WHERE id = $2
            `, [estado, id]);
        });
    }
    /** ********************************************************************************************* **
     ** *         MÉTODO PARA ENVÍO DE CORREO ELECTRÓNICO DE SOLICITUDES DE PERMISOS                * **
     ** ********************************************************************************************* **/
    // MÉTODO PARA ENVIAR CORREO ELECTRÓNICO DESDE APLICACIÓN WEB
    EnviarCorreoWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(req.id_empresa);
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, id, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query('SELECT e.id, e.correo, e.nombre, e.apellido, ' +
                    'e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
                    'd.nombre AS departamento ' +
                    'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
                    'cg_departamentos AS d ' +
                    'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
                    '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id ' +
                    'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC', [id_empl_contrato]);
                // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
                // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
                var url = `${process.env.URL_DOMAIN}/ver-permiso`;
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                        <body>
                            <div style="text-align: center;">
                                <img width="25%" height="25%" src="cid:cabeceraf"/>
                            </div>
                            <br>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                            <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                                <b>Asunto:</b> ${asunto} <br> 
                                <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                <b>Número de Cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                <b>Generado mediante:</b> Aplicación Web <br>
                                <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                                <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                            </p>
                            <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                                <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                    <b>Motivo:</b> ${tipo_permiso} <br>   
                                    <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                                    <b>Desde:</b> ${desde} ${h_inicio} <br>
                                    <b>Hasta:</b> ${hasta} ${h_fin} <br>
                                    <b>Observación:</b> ${observacion} <br>
                                    <b>Días permiso:</b> ${dias_permiso} <br>
                                    <b>Horas permiso:</b> ${horas_permiso} <br>
                                    <b>Estado:</b> ${estado_p} <br><br>
                                    <a href="${url}/${id}">Dar clic en el siguiente enlace para revisar solicitud de permiso.</a> <br><br>
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
    // ENVIO DE CORREO AL CREAR UN PERMISO MEDIANTE APLICACIÓN MÓVIL
    EnviarCorreoPermisoMovil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var tiempo = (0, settingsMail_1.fechaHora)();
            const path_folder = path_1.default.resolve('logos');
            var datos = yield (0, settingsMail_1.Credenciales)(parseInt(req.params.id_empresa));
            if (datos === 'ok') {
                const { id_empl_contrato, id_dep, correo, id_suc, desde, hasta, h_inicio, h_fin, observacion, estado_p, solicitud, tipo_permiso, dias_permiso, horas_permiso, solicitado_por, asunto, tipo_solicitud, proceso } = req.body;
                const correoInfoPidePermiso = yield database_1.default.query('SELECT e.id, e.correo, e.nombre, e.apellido, ' +
                    'e.cedula, ecr.id_departamento, ecr.id_sucursal, ecr.id AS cargo, tc.cargo AS tipo_cargo, ' +
                    'd.nombre AS departamento ' +
                    'FROM empl_contratos AS ecn, empleados AS e, empl_cargos AS ecr, tipo_cargo AS tc, ' +
                    'cg_departamentos AS d ' +
                    'WHERE ecn.id = $1 AND ecn.id_empleado = e.id AND ' +
                    '(SELECT MAX(cargo_id) AS cargo FROM datos_empleado_cargo WHERE empl_id = e.id ) = ecr.id ' +
                    'AND tc.id = ecr.cargo AND d.id = ecr.id_departamento ORDER BY cargo DESC', [id_empl_contrato]);
                // codigo para enviar notificacion o correo al jefe de su propio departamento, independientemente del nivel.
                // && obj.id_dep === correoInfoPidePermiso.rows[0].id_departamento && obj.id_suc === correoInfoPidePermiso.rows[0].id_sucursal
                let data = {
                    to: correo,
                    from: settingsMail_1.email,
                    subject: asunto,
                    html: `
                           <body>
                               <div style="text-align: center;">
                                   <img width="25%" height="25%" src="cid:cabeceraf"/>
                               </div>
                               <br>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   El presente correo es para informar que se ha ${proceso} la siguiente solicitud de permiso: <br>  
                               </p>
                               <h3 style="font-family: Arial; text-align: center;">DATOS DEL SOLICITANTE</h3>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   <b>Empresa:</b> ${settingsMail_1.nombre} <br>   
                                   <b>Asunto:</b> ${asunto} <br> 
                                   <b>Colaborador que envía:</b> ${correoInfoPidePermiso.rows[0].nombre} ${correoInfoPidePermiso.rows[0].apellido} <br>
                                   <b>Número de Cédula:</b> ${correoInfoPidePermiso.rows[0].cedula} <br>
                                   <b>Cargo:</b> ${correoInfoPidePermiso.rows[0].tipo_cargo} <br>
                                   <b>Departamento:</b> ${correoInfoPidePermiso.rows[0].departamento} <br>
                                   <b>Generado mediante:</b> Aplicación Móvil <br>
                                   <b>Fecha de envío:</b> ${tiempo.dia} ${tiempo.fecha} <br> 
                                   <b>Hora de envío:</b> ${tiempo.hora} <br><br> 
                               </p>
                               <h3 style="font-family: Arial; text-align: center;">INFORMACIÓN DE LA SOLICITUD</h3>
                               <p style="color:rgb(11, 22, 121); font-family: Arial; font-size:12px; line-height: 1em;">
                                   <b>Motivo:</b> ${tipo_permiso} <br>   
                                   <b>Fecha de Solicitud:</b> ${solicitud} <br> 
                                   <b>Desde:</b> ${desde} ${h_inicio} <br>
                                   <b>Hasta:</b> ${hasta} ${h_fin} <br>
                                   <b>Observación:</b> ${observacion} <br>
                                   <b>Días permiso:</b> ${dias_permiso} <br>
                                   <b>Horas permiso:</b> ${horas_permiso} <br>
                                   <b>Estado:</b> ${estado_p} <br><br>
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
}
exports.PERMISOS_CONTROLADOR = new PermisosControlador();
exports.default = exports.PERMISOS_CONTROLADOR;
