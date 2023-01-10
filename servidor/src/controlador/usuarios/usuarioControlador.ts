import { email, enviarMail, servidor, puerto, Credenciales } from '../../libs/settingsMail';
import { Request, Response } from 'express';
import pool from '../../database';
import jwt from 'jsonwebtoken';

interface IPayload {
  _id: number,
}

class UsuarioControlador {

  // CREAR REGISTRO DE USUARIOS
  public async CrearUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, estado, id_rol, id_empleado } = req.body;
      await pool.query(
        `
        INSERT INTO usuarios (usuario, contrasena, estado, id_rol, id_empleado) 
        VALUES ($1, $2, $3, $4, $5)
        `
        , [usuario, contrasena, estado, id_rol, id_empleado]);

      res.jsonp({ message: 'Usuario Guardado' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  public async ObtenerDatosUsuario(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const UN_USUARIO = await pool.query(
      `
      SELECT * FROM usuarios WHERE id_empleado = $1
      `
      , [id_empleado]);
    if (UN_USUARIO.rowCount > 0) {
      return res.jsonp(UN_USUARIO.rows);
    }
    else {
      res.status(404).jsonp({ text: 'No se ha encontrado el usuario' });
    }
  }

  // METODO PARA ACTUALIZAR DATOS DE USUARIO
  public async ActualizarUsuario(req: Request, res: Response) {
    try {
      const { usuario, contrasena, id_rol, id_empleado } = req.body;
      await pool.query(
        `
        UPDATE usuarios SET usuario = $1, contrasena = $2, id_rol = $3 WHERE id_empleado = $4
        `
        , [usuario, contrasena, id_rol, id_empleado]);
      res.jsonp({ message: 'Registro actualizado.' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  // METODO PARA ACTUALIZAR CONTRASEÑA
  public async CambiarPasswordUsuario(req: Request, res: Response): Promise<any> {
    const { contrasena, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET contrasena = $1 WHERE id_empleado = $2
      `
      , [contrasena, id_empleado]);
    res.jsonp({ message: 'Registro actualizado.' });
  }


  // ADMINISTRACION DEL MODULO DE ALIMENTACION
  public async RegistrarAdminComida(req: Request, res: Response): Promise<void> {
    const { admin_comida, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET admin_comida = $1 WHERE id_empleado = $2
      `
      , [admin_comida, id_empleado]);
    res.jsonp({ message: 'Registro guardado.' });
  }


  /** ************************************************************************************* ** 
   ** **                METODO FRASE DE SEGURIDAD ADMINISTRADOR                          ** **
   ** ************************************************************************************* **/

  // METODO PARA GUARDAR FRASE DE SEGURIDAD
  public async ActualizarFrase(req: Request, res: Response): Promise<void> {
    const { frase, id_empleado } = req.body;
    await pool.query(
      `
      UPDATE usuarios SET frase = $1 WHERE id_empleado = $2
      `
      , [frase, id_empleado]);
    res.jsonp({ message: 'Registro guardado.' });
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE WEB                         ** **
   ** ******************************************************************************************** **/

  /**
   * METODO DE BUSQUEDA DE USUARIOS QUE USAN TIMBRE WEB
   * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DE SU ESTADO 
   * BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
   **/

  public async UsuariosTimbreWeb(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let suc = await pool.query(
      `
        SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
          ciudades AS c 
        WHERE s.id_ciudad = c.id ORDER BY s.id
      `
    ).then(result => { return result.rows });

    if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos = await Promise.all(suc.map(async (dep: any) => {
      dep.departamentos = await pool.query(
        `
          SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
          FROM cg_departamentos AS d, sucursales AS s
          WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
        `
        , [dep.id_suc]
      ).then(result => {
        return result.rows
      });
      return dep;
    }));

    let depa = departamentos.filter(obj => {
      return obj.departamentos.length > 0
    });

    if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
    let lista = await Promise.all(depa.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await pool.query(
          `
            SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
              u.web_habilita, u.id AS userid, d.nombre AS departamento
            FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d
            WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
              AND u.web_habilita = $3
            ORDER BY nombre
          `,
          [empl.id_depa, estado, habilitado])
          .then(result => { return result.rows });
        return empl;
      }));
      return obj;
    }))

    if (lista.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let respuesta = lista.map(obj => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        return ele.empleado.length > 0;
      })
      return obj;
    }).filter(obj => {
      return obj.departamentos.length > 0;
    });

    if (respuesta.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }

  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE WEB
  public async ActualizarEstadoTimbreWeb(req: Request, res: Response) {
    try {
      const array = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          const [result] = await pool.query(
            `
            UPDATE usuarios SET web_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.web_habilita, o.userid])
            .then(result => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }

      }))

      return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }


  /** ******************************************************************************************** **
   ** **               METODO PARA MANEJAR DATOS DE USUARIOS TIMBRE MOVIL                       ** **
   ** ******************************************************************************************** **/

  /**
   * METODO DE BUSQUEDA DE USUARIOS QUE USAN TIMBRE MOVIL
   * REALIZA UN ARRAY DE SUCURSALES CON DEPARTAMENTOS Y EMPLEADOS DEPENDIENDO DE SU ESTADO 
   * BUSCA EMPLEADOS ACTIVOS O INACTIVOS. 
   * @returns Retorna Array de [Sucursales[Departamentos[empleados[]]]]
   **/

  public async UsuariosTimbreMovil(req: Request, res: Response) {
    let estado = req.params.estado;
    let habilitado = req.params.habilitado;

    // CONSULTA DE BUSQUEDA DE SUCURSALES
    let suc = await pool.query(
      `
        SELECT s.id AS id_suc, s.nombre AS name_suc, c.descripcion AS ciudad FROM sucursales AS s, 
          ciudades AS c 
        WHERE s.id_ciudad = c.id ORDER BY s.id
      `
    ).then(result => { return result.rows });

    if (suc.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE DEPARTAMENTOS
    let departamentos = await Promise.all(suc.map(async (dep: any) => {
      dep.departamentos = await pool.query(
        `
          SELECT d.id as id_depa, d.nombre as name_dep, s.nombre AS sucursal
          FROM cg_departamentos AS d, sucursales AS s
          WHERE d.id_sucursal = $1 AND d.id_sucursal = s.id
        `
        , [dep.id_suc]
      ).then(result => {
        return result.rows
      });
      return dep;
    }));

    let depa = departamentos.filter(obj => {
      return obj.departamentos.length > 0
    });

    if (depa.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

    // CONSULTA DE BUSQUEDA DE COLABORADORES POR DEPARTAMENTO
    let lista = await Promise.all(depa.map(async (obj: any) => {
      obj.departamentos = await Promise.all(obj.departamentos.map(async (empl: any) => {
        empl.empleado = await pool.query(
          `
            SELECT DISTINCT e.id, (e.nombre || ' ' || e.apellido) AS nombre, e.cedula, e.codigo, u.usuario, 
              u.app_habilita, u.id AS userid, d.nombre AS departamento
            FROM usuarios AS u, datos_actuales_empleado AS e, cg_departamentos AS d
            WHERE e.id = u.id_empleado AND d.id = e.id_departamento AND e.id_departamento = $1 AND e.estado = $2
              AND u.app_habilita = $3
            ORDER BY nombre
          `,
          [empl.id_depa, estado, habilitado])
          .then(result => { return result.rows });
        return empl;
      }));
      return obj;
    }))

    if (lista.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' });

    let respuesta = lista.map(obj => {
      obj.departamentos = obj.departamentos.filter((ele: any) => {
        return ele.empleado.length > 0;
      })
      return obj;
    }).filter(obj => {
      return obj.departamentos.length > 0;
    });

    if (respuesta.length === 0) return res.status(404)
      .jsonp({ message: 'No se han encontrado registros.' })

    return res.status(200).jsonp(respuesta);
  }

  // METODO PARA ACTUALIZAR ESTADO DE TIMBRE MOVIL
  public async ActualizarEstadoTimbreMovil(req: Request, res: Response) {
    try {
      console.log(req.body);
      const array = req.body;

      if (array.length === 0) return res.status(400).jsonp({ message: 'No se ha encontrado registros.' })

      const nuevo = await Promise.all(array.map(async (o: any) => {

        try {
          const [result] = await pool.query(
            `
            UPDATE usuarios SET app_habilita = $1 WHERE id = $2 RETURNING id
            `
            , [!o.app_habilita, o.userid])
            .then(result => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }
      }))

      return res.status(200).jsonp({ message: 'Datos actualizados exitosamente.', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }





























  public async list(req: Request, res: Response) {
    const USUARIOS = await pool.query('SELECT * FROM usuarios');
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
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



  public async ListarUsuriosNoEnrolados(req: Request, res: Response) {
    const USUARIOS = await pool.query('SELECT u.id, u.usuario, ce.id_usuario FROM usuarios AS u LEFT JOIN cg_enrolados AS ce ON u.id = ce.id_usuario WHERE ce.id_usuario IS null');
    if (USUARIOS.rowCount > 0) {
      return res.jsonp(USUARIOS.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'No se encuentran registros' });
    }
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
    let port = 465;

    if (puerto != null && puerto != '') {
      port = parseInt(puerto);
    }
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



  //LISTADO DE DISPOSITIVOS REGISTRADOS POR EL CODIGO DE USUARIO
  public async usersListadispositivosMoviles(req: Request, res: Response) {
    try {
      const DISPOSITIVOS = await pool.query('SELECT e.codigo, (e.nombre || \' \' || e.apellido) AS nombre, e.cedula, d.id_dispositivo, d.modelo_dispositivo ' +
        'FROM id_dispositivos AS d INNER JOIN empleados AS e ON d.id_empleado = CAST(e.codigo AS Integer) ORDER BY nombre')
        .then(result => { return result.rows });

      if (DISPOSITIVOS.length === 0) return res.status(404).jsonp({ message: 'No se han encontrado registros.' });

      return res.status(200).jsonp(DISPOSITIVOS)

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

  public async deleteDispositivoRegistrado(req: Request, res: Response) {
    try {
      const array = req.params.dispositivo;

      let dispositivos = array.split(',');
      console.log("id_dispositivos: ", dispositivos);

      if (dispositivos.length === 0) return res.status(400).jsonp({ message: 'No llego datos para actualizar' })

      const nuevo = await Promise.all(dispositivos.map(async (id_dispo: any) => {
        try {
          const [result] = await pool.query('DELETE FROM id_dispositivos WHERE id_dispositivo = $1 RETURNING *', [id_dispo])
            .then(result => { return result.rows })
          return result
        } catch (error) {
          return { error: error.toString() }
        }
      }))

      return res.status(200).jsonp({ message: 'Datos eliminados exitosamente', nuevo })

    } catch (error) {
      return res.status(500).jsonp({ message: error })
    }
  }

}

export const USUARIO_CONTROLADOR = new UsuarioControlador();

export default USUARIO_CONTROLADOR;