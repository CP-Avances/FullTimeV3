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
exports.USUARIO_CONTROLADOR = void 0;
const settingsMail_1 = require("../../libs/settingsMail");
const database_1 = __importDefault(require("../../database"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UsuarioControlador {
    // CREAR REGISTRO DE USUARIOS
    CrearUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, estado, id_rol, id_empleado } = req.body;
                yield database_1.default.query(`
        INSERT INTO usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
        VALUES ($1, $2, $3, $4, $5)
        `, [usuario, contrasena, estado, id_rol, id_empleado]);
                res.jsonp({ message: 'Usuario Guardado' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO DE BUSQUEDA DE DATOS DE USUARIO
    ObtenerDatosUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const UN_USUARIO = yield database_1.default.query(`
      SELECT * FROM usuarios WHERE id_empleado = $1
      `, [id_empleado]);
            if (UN_USUARIO.rowCount > 0) {
                return res.jsonp(UN_USUARIO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
            }
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE USUARIO
    ActualizarUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { usuario, contrasena, id_rol, id_empleado } = req.body;
                yield database_1.default.query(`
        UPDATE usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4
        `, [usuario, contrasena, id_rol, id_empleado]);
                res.jsonp({ message: 'Registro actualizado.' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // METODO PARA ACTUALIZAR CONTRASEÑA
    CambiarPasswordUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { contrasena, id_empleado } = req.body;
            yield database_1.default.query(`
      UPDATE usuarios SET contrasena = $1 WHERE id_empleado = $2
      `, [contrasena, id_empleado]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // ADMINISTRACION DEL MODULO DE ALIMENTACION
    RegistrarAdminComida(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { admin_comida, id_empleado } = req.body;
            yield database_1.default.query(`
      UPDATE usuarios SET admin_comida = $1 WHERE id_empleado = $2
      `, [admin_comida, id_empleado]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    /** ************************************************************************************* **
     ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
     ** ************************************************************************************* **/
    // METODO PARA GUARDAR FRASE DE SEGURIDAD
    ActualizarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { frase, id_empleado } = req.body;
            yield database_1.default.query(`
      UPDATE usuarios SET frase = $1 WHERE id_empleado = $2
      `, [frase, id_empleado]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    /** ******************************************************************************************** **
     ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE WEB                         ** **
     ** ******************************************************************************************** **/
    // METODO DE BUSQUEDA DE USUARIOS QUE USAN TIMBRE WEB
    UsuariosTimbreWeb(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const USUARIOS = yield database_1.default.query(`
        SELECT (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
          u.web_habilita, u.id AS userId, d.nombre AS departamento
        FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d
        WHERE e.id = u.id_empleado AND d.id = e.id_departamento 
        ORDER BY nombre
        `).then(result => { return result.rows; });
                if (USUARIOS.length === 0)
                    return res.status(404).jsonp({ message: 'No se encuentran registros.' });
                return res.status(200).jsonp(USUARIOS);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    /**
     * METODO DE CONSULTA DE DATOS GENERALES DE USUARIOS
     * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DEL ESTADO DEL
     * EMPLEADO SI BUSCA EMPLEADOS ACTIVOS O INACTIVOS.
     * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
     **/
    DatosGenerales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let estado = req.params.estado;
            // CONSULTA DE BUSQUEDA DE SUCURSALES
            let suc = yield database_1.default.query(`
          SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
              ciudades AS c 
          WHERE s.id_ciudad = c.id ORDER BY s.id
          `).then(result => { return result.rows; });
            if (suc.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
            let departamentos = yield Promise.all(suc.map((dep) => __awaiter(this, void 0, void 0, function* () {
                dep.departamentos = yield database_1.default.query(`
              SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
              FROM cg_departamentos AS d, sucursales AS s
              WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
              `, [dep.id_suc]).then(result => {
                    return result.rows.filter(obj => {
                        return obj.name_dep != 'Ninguno';
                    });
                });
                return dep;
            })));
            let depa = departamentos.filter(obj => {
                return obj.departamentos.length > 0;
            });
            if (depa.length === 0)
                return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
            // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
            let lista = yield Promise.all(depa.map((obj) => __awaiter(this, void 0, void 0, function* () {
                obj.departamentos = yield Promise.all(obj.departamentos.map((empl) => __awaiter(this, void 0, void 0, function* () {
                    if (estado === '1') {
                        empl.empleado = yield database_1.default.query(`
            SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
              u.web_habilita, u.id AS userId, d.nombre AS departamento
            FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d
            WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
            ORDER BY nombre
            `, [empl.id_depa, estado])
                            .then(result => { return result.rows; });
                    }
                    else {
                        empl.empleado = yield database_1.default.query(`
            SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
              u.web_habilita, u.id AS userId, d.nombre AS departamento
            FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d
            WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
            ORDER BY nombre
            `, [empl.id_depa, estado])
                            .then(result => { return result.rows; });
                    }
                    return empl;
                })));
                return obj;
            })));
            if (lista.length === 0)
                return res.status(404)
                    .jsonp({ message: 'No se han encontrado registros.' });
            let respuesta = lista.map(obj => {
                obj.departamentos = obj.departamentos.filter((ele) => {
                    return ele.empleado.length > 0;
                });
                return obj;
            }).filter(obj => {
                return obj.departamentos.length > 0;
            });
            if (respuesta.length === 0)
                return res.status(404)
                    .jsonp({ message: 'No se han encontrado registros.' });
            return res.status(200).jsonp(respuesta);
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const USUARIOS = yield database_1.default.query('SELECT * FROM usuarios');
            if (USUARIOS.rowCount > 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    usersEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const USUARIOS = yield database_1.default.query('SELECT (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, u.app_habilita, u.id AS userId ' +
                    'FROM usuarios AS u, empleados AS e WHERE e.id = u.id_empleado ORDER BY nombre')
                    .then(result => { return result.rows; });
                if (USUARIOS.length === 0)
                    return res.status(404).jsonp({ message: 'No se encuentran registros' });
                return res.status(200).jsonp(USUARIOS);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    updateUsersEmpleados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const array = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No llego datos para actualizar' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query('UPDATE usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id', [!o.app_habilita, o.userid])
                            .then(result => { return result.rows; });
                        return result;
                    }
                    catch (error) {
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos actualizados exitosamente', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    updateUsersEmpleadosWebHabilita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const array = req.body;
                if (array.length === 0)
                    return res.status(400).jsonp({ message: 'No llego datos para actualizar' });
                const nuevo = yield Promise.all(array.map((o) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query('UPDATE usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id', [!o.web_habilita, o.userid])
                            .then(result => { return result.rows; });
                        return result;
                    }
                    catch (error) {
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos actualizados exitosamente', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    getIdByUsuario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { usuario } = req.params;
            const unUsuario = yield database_1.default.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
            if (unUsuario.rowCount > 0) {
                return res.jsonp(unUsuario.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
            }
        });
    }
    ListarUsuriosNoEnrolados(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const USUARIOS = yield database_1.default.query('SELECT u.id, u.usuario, ce.id_usuario FROM usuarios AS u LEFT JOIN cg_enrolados AS ce ON u.id = ce.id_usuario WHERE ce.id_usuario IS null');
            if (USUARIOS.rowCount > 0) {
                return res.jsonp(USUARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    RestablecerFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const correo = req.body.correo;
            const url_page = req.body.url_page;
            (0, settingsMail_1.Credenciales)(1);
            const correoValido = yield database_1.default.query('SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, ' +
                'u.contrasena FROM empleados AS e, usuarios AS u WHERE correo = $1 AND u.id_empleado = e.id AND ' +
                'e.estado = 1', [correo]);
            if (correoValido.rows[0] == undefined)
                return res.status(401).send('Correo no registrado en el sistema.');
            const token = jsonwebtoken_1.default.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail', { expiresIn: 60 * 5, algorithm: 'HS512' });
            var url = url_page + '/recuperar-frase';
            var data = {
                to: correoValido.rows[0].correo,
                from: settingsMail_1.email,
                template: 'forgot-password-frase',
                subject: 'Recuperar frase de seguridad!',
                html: `<p>Hola <b>${correoValido.rows[0].nombre.split(' ')[0] + ' ' + correoValido.rows[0].apellido.split(' ')[0]}</b>
       ingresar al siguiente link y registrar una nueva frase que le sea fácil de recordar.: </p>
        <a href="${url}/${token}">
        ${url}/${token}
        </a>
      `
            };
            let port = 465;
            if (settingsMail_1.puerto != null && settingsMail_1.puerto != '') {
                port = parseInt(settingsMail_1.puerto);
            }
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
            res.jsonp({ mail: 'si', message: 'Mail enviado.' });
        });
    }
    CambiarFrase(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var token = req.body.token;
            var frase = req.body.frase;
            try {
                const payload = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail');
                const id_empleado = payload._id;
                yield database_1.default.query('UPDATE usuarios SET frase = $2 WHERE id_empleado = $1 ', [id_empleado, frase]);
                return res.jsonp({ expiro: 'no', message: "Frase de Seguridad Actualizada." });
            }
            catch (error) {
                return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar la frase ha expirado." });
            }
        });
    }
    //ACCESOS AL SISTEMA
    AuditarAcceso(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modulo, user_name, fecha, hora, acceso, ip_address } = req.body;
            yield database_1.default.query('INSERT INTO logged_user ( modulo, user_name, fecha, hora, acceso, ip_address ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6)', [modulo, user_name, fecha, hora, acceso, ip_address]);
            return res.jsonp({ message: 'Auditoria Realizada' });
        });
    }
    //LISTADO DE DISPOSITIVOS REGISTRADOS POR EL CODIGO DE USUARIO
    usersListadispositivosMoviles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const DISPOSITIVOS = yield database_1.default.query('SELECT e.codigo, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo ' +
                    'FROM id_dispositivos AS d INNER JOIN empleados AS e ON d.id_empleado = CAST(e.codigo AS Integer) ORDER BY nombre')
                    .then(result => { return result.rows; });
                if (DISPOSITIVOS.length === 0)
                    return res.status(404).jsonp({ message: 'No se han encontrado registros.' });
                return res.status(200).jsonp(DISPOSITIVOS);
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
    deleteDispositivoRegistrado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const array = req.params.dispositivo;
                let dispositivos = array.split(',');
                console.log("id_dispositivos: ", dispositivos);
                if (dispositivos.length === 0)
                    return res.status(400).jsonp({ message: 'No llego datos para actualizar' });
                const nuevo = yield Promise.all(dispositivos.map((id_dispo) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const [result] = yield database_1.default.query('DELETE FROM id_dispositivos WHERE id_dispositivo = $1 RETURNING *', [id_dispo])
                            .then(result => { return result.rows; });
                        return result;
                    }
                    catch (error) {
                        return { error: error.toString() };
                    }
                })));
                return res.status(200).jsonp({ message: 'Datos eliminados exitosamente', nuevo });
            }
            catch (error) {
                return res.status(500).jsonp({ message: error });
            }
        });
    }
}
exports.USUARIO_CONTROLADOR = new UsuarioControlador();
exports.default = exports.USUARIO_CONTROLADOR;
