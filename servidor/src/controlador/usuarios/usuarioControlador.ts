import { email, enviarMail, Credenciales } from '../../libs/settingsMail';
import { Request, Response } from 'express';
import pool from '../../database';
import jwt from 'jsonwebtoken';

interface IPayload {
  _id: number,
}

class UsuarioControlador {
  public async list(req: Request, res: Response) {
    const USUARIOS = await pool.query('SELECT * FROM usuarios');
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async usersEmpleados(req: Request, res: Response) {
    try {
      const USUARIOS = await pool.query('SELECT (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, u.app_habilita, u.id AS userId ' +
        'FROM usuarios AS u, empleados AS e WHERE e.id = u.id_empleado ORDER BY nombre')
        .then(result => { return result.rows });

      if (USUARIOS.length === 0) return res.status(404).jsonp({ message: 'No se encuentran registros' });

      return res.status(200).jsonp(USUARIOS)

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  public async updateUsersEmpleados(req: Request, res: Response) {
    try {
      console.log(req.body);
      const array = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No llego datos para actualizar' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          const [result] = await pool.query('UPDATE usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id', [!o.app_habilita, o.userid])
            .then(result => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }

      }))

      return res.status(200).jsonp({ message: 'Datos actualizados exitosamente', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  public async getIdByUsuario(req: Request, res: Response): Promise<any> {
    const { usuario } = req.params;
    const unUsuario = await pool.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
    if (unUsuario.rowCount > 0) {
      return res.jsonp(unUsuario.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
    }
  }

  public async ObtenerDatosUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const UN_USUARIO = await pool.query('SELECT * FROM usuarios WHERE id_empleado = $1', [id_empleado]);
    if (UN_USUARIO.rowCount > 0) {
      return res.jsonp(UN_USUARIO.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
    }
  }

  public async ListarUsuriosNoEnrolados(req: Request, res: Response) {
    const USUARIOS = await pool.query('SELECT u.id, u.usuario, ce.id_usuario FROM usuarios AS u LEFT JOIN cg_enrolados AS ce ON u.id = ce.id_usuario WHERE ce.id_usuario IS null');
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
  }

  public async CambiarPasswordUsuario(req: Request, res: Response): Promise<any> {
    const { contrasena, id_empleado } = req.body;
    const UN_USUARIO = await pool.query('UPDATE usuarios SET contrasena = $1 WHERE id_empleado = $2', [contrasena, id_empleado]);
    res.jsonp({ message: 'Registro actualizado exitosamente' });
  }

  // public async getIdByUsuario(req: Request, res: Response): Promise<any>{
  //   const  {id_empleado} = req.params;
  //   const unUsuario = await pool.query('SELECT * FROM usuarios WHERE id_empleado = $1', [id_empleado]);
  //   if (unUsuario.rowCount > 0) {
  //     return res.jsonp(unUsuario.rows);
  //   }

  //   res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
  // }

  public async create(req: Request, res: Response) {
    try {
      const { usuario, contrasena, estado, id_rol, id_empleado, app_habilita } = req.body;
      await pool.query('INSERT INTO usuarios ( usuario, contrasena, estado, id_rol, id_empleado, app_habilita ) VALUES ($1, $2, $3, $4, $5, $6)', [usuario, contrasena, estado, id_rol, id_empleado, app_habilita]);
      res.jsonp({ message: 'Usuario Guardado' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  public async ActualizarUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, id_rol, id_empleado } = req.body;
      await pool.query('UPDATE usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4', [usuario, contrasena, id_rol, id_empleado]);
      res.jsonp({ message: 'Usuario Actualizado' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // ADMINISTRACIÓN DEL MÓDULO DE ALIMENTACIÓN
  public async RegistrarAdminComida(req: Request, res: Response): Promise<void> {
    const { admin_comida, id_empleado } = req.body;
    await pool.query('UPDATE usuarios SET admin_comida = $1 WHERE id_empleado = $2', [admin_comida, id_empleado]);
    res.jsonp({ message: 'Registro exitoso' });
  }

  /** ************************************************************************************** *
   **                MÉTODO FRASE DE SEGURIDAD ADMINISTRADOR                                 *
   ** ************************************************************************************** */
  // MÉTODO PARA GUARDAR FRASE DE SEGURIDAD
  public async ActualizarFrase(req: Request, res: Response): Promise<void> {
    const { frase, id_empleado } = req.body;
    await pool.query('UPDATE usuarios SET frase = $1 WHERE id_empleado = $2', [frase, id_empleado]);
    res.jsonp({ message: 'Frase exitosa' });
  }

  public async RestablecerFrase(req: Request, res: Response) {
    const correo = req.body.correo;
    const url_page = req.body.url_page;
    Credenciales(1);
    const correoValido = await pool.query('SELECT e.id, e.nombre, e.apellido, e.correo, u.usuario, ' +
      'u.contrasena FROM empleados AS e, usuarios AS u WHERE correo = $1 AND u.id_empleado = e.id AND ' +
      'e.estado = 1', [correo]);

    if (correoValido.rows[0] == undefined) return res.status(401).send('Correo no registrado en el sistema.');

    const token = jwt.sign({ _id: correoValido.rows[0].id }, process.env.TOKEN_SECRET_MAIL || 'llaveEmail', { expiresIn: 60 * 5, algorithm: 'HS512' });

    var url = url_page + '/recuperar-frase';
    var data = {
      to: correoValido.rows[0].correo,
      from: email,
      template: 'forgot-password-frase',
      subject: 'Recuperar frase de seguridad!',
      html: `<p>Hola <b>${correoValido.rows[0].nombre.split(' ')[0] + ' ' + correoValido.rows[0].apellido.split(' ')[0]}</b>
       ingresar al siguiente link y registrar una nueva frase que le sea fácil de recordar.: </p>
        <a href="${url}/${token}">
        ${url}/${token}
        </a>
      `
    };
    enviarMail(data);
    res.jsonp({ mail: 'si', message: 'Mail enviado.' })
  }

  public async CambiarFrase(req: Request, res: Response) {
    var token = req.body.token;
    var frase = req.body.frase;
    try {
      const payload = jwt.verify(token, process.env.TOKEN_SECRET_MAIL || 'llaveEmail') as IPayload;
      const id_empleado = payload._id;
      await pool.query('UPDATE usuarios SET frase = $2 WHERE id_empleado = $1 ', [id_empleado, frase]);
      return res.jsonp({ expiro: 'no', message: "Frase de Seguridad Actualizada." });
    } catch (error) {
      return res.jsonp({ expiro: 'si', message: "Tiempo para cambiar la frase ha expirado." });
    }
  }

  //ACCESOS AL SISTEMA
  public async AuditarAcceso(req: Request, res: Response) {
    const { modulo, user_name, fecha, hora, acceso, ip_address } = req.body;
    await pool.query('INSERT INTO logged_user ( modulo, user_name, fecha, hora, acceso, ip_address ) ' +
      'VALUES ($1, $2, $3, $4, $5, $6)', [modulo, user_name, fecha, hora, acceso, ip_address]);
    return res.jsonp({ message: 'Auditoria Realizada' });
  }


}

export const USUARIO_CONTROLADOR = new UsuarioControlador();

export default USUARIO_CONTROLADOR;