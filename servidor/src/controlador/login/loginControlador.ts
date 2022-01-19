// IMPORTAR LIBRERIAS
import { email, enviarMail, Credenciales } from '../../libs/settingsMail';
import { Licencias } from '../../class/Licencia';
import { Request, Response } from 'express';
import pool from '../../database';
import jwt from 'jsonwebtoken';
import fs from 'fs';

interface IPayload {
  _id: number,
  iat: number,
  exp: number
}

class LoginControlador {

  // MÉTODO PARA VALIDAR DATOS DE ACCESO AL SISTEMA
  public async ValidarCredenciales(req: Request, res: Response) {

    // VARIABLE USADO PARA BÚSQUEDA DE LICENCIA
    let caducidad_licencia: Date = new Date();

    // OBTENCIÓN DE DIRECCIÓN IP
    var requestIp = require('request-ip');
    var clientIp = requestIp.getClientIp(req);
    if (clientIp != null && clientIp != '' && clientIp != undefined) {
      var ip_cliente = clientIp.split(':')[3];
    }

    try {
      const { nombre_usuario, pass, latitud, longitud } = req.body;
      // BÚSQUEDA DE USUARIO
      const USUARIO = await pool.query('SELECT id, usuario, id_rol, id_empleado ' +
        'FROM accesoUsuarios($1, $2)', [nombre_usuario, pass]);
      // BÚSQUEDA DE DATOS DEL EMPLEADO
      const SUC_DEP = await pool.query('SELECT c.id_departamento, c.id_sucursal, s.id_empresa, ' +
        'c.id AS id_cargo, cg_e.acciones_timbres, cg_e.public_key ' +
        'FROM empl_contratos AS e, empl_cargos AS c, sucursales AS s, cg_empresa AS cg_e ' +
        'WHERE e.id_empleado = $1 AND c.id_empl_contrato = e.id AND c.id_sucursal = s.id AND ' +
        's.id_empresa = cg_e.id ORDER BY c.fec_inicio DESC LIMIT 1', [USUARIO.rows[0].id_empleado]);

      if (SUC_DEP.rowCount > 0) {
        const { public_key } = SUC_DEP.rows[0];
        if (!public_key) return res.status(404).jsonp({ message: 'No tiene asignada una licencia para uso de la aplicacion.' })

        try {
          // BÚSQUEDA DE LICENCIA DE USO DE APLICACIÓN
          const data = fs.readFileSync('licencia.conf.json', 'utf8')
          const FileLicencias = JSON.parse(data);

          const ok_licencias = FileLicencias.filter((o: Licencias) => {
            return o.public_key === public_key
          }).map((o: Licencias) => {
            o.fec_activacion = new Date(o.fec_activacion),
              o.fec_desactivacion = new Date(o.fec_desactivacion)
            return o
          })
          if (ok_licencias.length === 0) return res.status(404).jsonp({ message: 'La licencia no existe, consulte con el administrador del sistema.' });

          const hoy = new Date();
          const { fec_activacion, fec_desactivacion } = ok_licencias[0];
          if (hoy > fec_desactivacion) return res.status(404).jsonp({ message: 'La licencia a expirado.' });
          if (hoy < fec_activacion) return res.status(404).jsonp({ message: 'La licencia a expirado.' });
          caducidad_licencia = fec_desactivacion
        } catch (error) {
          return res.status(404).jsonp({ message: 'No existe registro de licencias.' });
        }

      }

      if (USUARIO.rowCount === 0) return res.jsonp({ message: 'No existe Usuario.' });

      let ACTIVO = await pool.query('SELECT e.estado AS empleado, u.estado AS usuario, u.app_habilita, ' +
        'e.codigo, e.web_access FROM empleados AS e, usuarios AS u WHERE e.id = u.id_empleado AND u.id = $1',
        [USUARIO.rows[0].id])
        .then(result => {
          return result.rows
        });

      if (ACTIVO.length === 0) return res.jsonp({ message: 'No existe Usuario.' });

      const { id, id_empleado, id_rol, usuario: user } = USUARIO.rows[0];
      const { empleado, usuario, app_habilita, codigo, web_access } = ACTIVO[0];

      if (empleado === 2 && usuario === false && app_habilita === false) {
        return res.jsonp({ message: 'EL usuario se encuentra con estado inactivo.' });
      }

      if (!web_access) return res.status(404).jsonp({ message: "Sistema deshabilitado para usuarios." })

      await pool.query('UPDATE usuarios SET longitud = $2, latitud = $3 WHERE id = $1',
        [id, longitud, latitud]);

      const [modulos] = await pool.query('SELECT * FROM funciones LIMIT 1').
        then(result => { return result.rows; })

      if (SUC_DEP.rowCount > 0) {
        const { id_cargo, id_departamento, acciones_timbres, id_sucursal, id_empresa, public_key: licencia } = SUC_DEP.rows[0];
        const AUTORIZA = await pool.query('SELECT estado FROM depa_autorizaciones ' +
          'WHERE id_empl_cargo = $1 AND id_departamento = $2', [id_cargo, id_departamento])

        if (AUTORIZA.rowCount > 0) {

          const { estado: autoriza_est } = AUTORIZA.rows[0]
          const token = jwt.sign({
            _licencia: licencia, codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol,
            _dep: id_departamento, _web_access: web_access, _acc_tim: acciones_timbres, _suc: id_sucursal,
            _empresa: id_empresa, estado: autoriza_est, cargo: id_cargo, ip_adress: ip_cliente,
            modulos: modulos
          },
            process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
          return res.status(200).jsonp({
            caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
            departamento: id_departamento, acciones_timbres: acciones_timbres, sucursal: id_sucursal,
            empresa: id_empresa, cargo: id_cargo, estado: autoriza_est, ip_adress: ip_cliente,
            modulos: modulos
          });

        } else {

          const token = jwt.sign({
            _licencia: licencia, codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol,
            _dep: id_departamento, _web_access: web_access, _acc_tim: acciones_timbres, _suc: id_sucursal,
            _empresa: id_empresa, estado: false, cargo: id_cargo, ip_adress: ip_cliente, modulos: modulos
          },
            process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
          return res.status(200).jsonp({
            caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
            departamento: id_departamento, acciones_timbres: acciones_timbres, sucursal: id_sucursal,
            empresa: id_empresa, cargo: id_cargo, estado: false, ip_adress: ip_cliente, modulos: modulos
          });

        }

      } else {

        const token = jwt.sign({
          codigo: codigo, _id: id, _id_empleado: id_empleado, rol: id_rol, _web_access: web_access,
          ip_adress: ip_cliente, modulos: modulos
        },
          process.env.TOKEN_SECRET || 'llaveSecreta', { expiresIn: 60 * 60 * 23, algorithm: 'HS512' });
        return res.status(200).jsonp({
          caducidad_licencia, token, usuario: user, rol: id_rol, empleado: id_empleado,
          ip_adress: ip_cliente, modulos: modulos
        });
      }

    } catch (error) {
      return res.jsonp({ message: 'error', text: ip_cliente });
    }
  }

  public async CambiarContrasenia(req: Request, res: Response) {
    var token = req.body.token;
    var contrasena = req.body.contrasena;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail') as IPayload;
      const id_empleado = payload._id;
      await pool.query('UPDATE usuarios SET contrasena = $2 WHERE id_empleado = $1 ',
        [id_empleado, contrasena]);
      return res.jsonp({
        expiro: 'no',
        message: "Contraseña actualizada. Intente ingresar con la nueva contraseña."
      });
    } catch (error) {
      return res.jsonp({
        expiro: 'si',
        message: "Tiempo para cambiar contraseña ha expirado. Vuelva a solicitar cambio de contraseña."
      });
    }
  }

  public async RestablecerContrasenia(req: Request, res: Response) {
    const correo = req.body.correo;
    const url_page = req.body.url_page;
    Credenciales(1);
    const correoValido = await pool.query('SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, ' +
      'u.contrasena FROM empleados AS e, usuarios AS u WHERE correo = $1 AND u.id_empleado = e.id', [correo]);

    if (correoValido.rows[0] == undefined) return res.status(401).send('Correo de usuario no válido.');

    const token = jwt.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail',
      { expiresIn: 60 * 5, algorithm: 'HS512' });
    var url = url_page + '/confirmar-contrasenia';
    // ESTRUCTURA DEL MENSAJE DE CORREO ELECTRÓNICO
    var data = {
      to: correoValido.rows[0].correo,
      from: email,
      template: 'forgot-password-email',
      subject: 'FullTime Recuperar contraseña!',
      html: `<p>Hola <b>${correoValido.rows[0].nombre.split(' ')[0] + ' ' +
        correoValido.rows[0].apellido.split(' ')[0]}</b>
       ingrese al siguiente link y registre una nueva contraseña: </p>
        <a href="${url}/${token}">
        ${url}/${token}
        </a>
      `
    };

    enviarMail(data);

    res.jsonp({ mail: 'si', message: 'Mail enviado' })

  }


  // PRUEBA AUDITAR
  public async Auditar(req: Request, res: Response): Promise<void> {
    const { esquema, tabla, user, ip, old_data, new_data, accion } = req.body;
    await pool.query(' INSERT INTO audit.auditoria (schema_name, table_name, user_name, action, ' +
      'original_data, new_data, ip) ' +
      'VALUES ($1, $2, $3, substring($7,1,1), $4, $5, $6)',
      [esquema, tabla, user, old_data, new_data, ip, accion]);
    console.log('req auditar', req.body);
    res.jsonp({ message: 'Auditar' });
  }

}

const LOGIN_CONTROLADOR = new LoginControlador();

export default LOGIN_CONTROLADOR;


