import { Request, Response } from 'express';
import pool from '../../../database';
import excel from 'xlsx';
import fs from 'fs';
import { Md5 } from 'ts-md5';
import { EstadoHorarioPeriVacacion } from '../../../libs/MetodosHorario'
const builder = require('xmlbuilder');

class EmpleadoControlador {

  public async list(req: Request, res: Response) {
    const empleado = await pool.query('SELECT * FROM empleados WHERE estado = 1 ORDER BY id');
    res.jsonp(empleado.rows);
  }

  // BÚSQUEDA DE DATOS DE EMPLEADO INGRESANDO EL NOMBRE
  public async BuscarEmpleadoNombre(req: Request, res: Response): Promise<any> {
    const { informacion } = req.body;
    const EMPLEADO = await pool.query('SELECT * FROM empleados WHERE ' +
      '(UPPER (apellido) || \' \' || UPPER (nombre)) = $1', [informacion]);
    if (EMPLEADO.rowCount > 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'El empleado no ha sido encontrado' });
    }

  }
  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const EMPLEADO = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    if (EMPLEADO.rowCount > 0) {
      return res.jsonp(EMPLEADO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'El empleado no ha sido encontrado' });
    }

  }

  public async getImagen(req: Request, res: Response): Promise<any> {
    const imagen = req.params.imagen;
    let filePath = `servidor\\imagenesEmpleados\\${imagen}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }

  public async create(req: Request, res: Response) {
    try {
      const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, mail_alternativo,
        domicilio, telefono, id_nacionalidad, codigo } = req.body;
      await pool.query('INSERT INTO empleados ( cedula, apellido, nombre, esta_civil, genero, correo, ' +
        'fec_nacimiento, estado, mail_alternativo, domicilio, telefono, id_nacionalidad, codigo) VALUES ' +
        '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [cedula, apellido, nombre, esta_civil,
        genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio, telefono, id_nacionalidad, codigo]);
      const oneEmpley = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula]);
      const idEmployGuardado = oneEmpley.rows[0].id;
      res.jsonp({ message: 'Empleado guardado', id: idEmployGuardado });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  public async editar(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { cedula, apellido, nombre, esta_civil, genero, correo, fec_nacimiento, estado, mail_alternativo,
        domicilio, telefono, id_nacionalidad, codigo } = req.body;
      await pool.query('UPDATE empleados SET cedula = $2, apellido = $3, nombre = $4, esta_civil = $5, ' +
        'genero = $6, correo = $7, fec_nacimiento = $8, estado = $9, mail_alternativo = $10, domicilio = $11, ' +
        'telefono = $12, id_nacionalidad = $13, codigo = $14 WHERE id = $1 ', [id, cedula, apellido, nombre,
        esta_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio, telefono,
        id_nacionalidad, codigo]);
      res.jsonp({ message: 'Empleado Actualizado' });
    }
    catch (error) {
      return res.jsonp({ message: 'error' });
    }
  }

  public async crearImagenEmpleado(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let imagen = list.image[0].path.split("\\")[1];
    let id = req.params.id_empleado

    const unEmpleado = await pool.query('SELECT * FROM empleados WHERE id = $1', [id]);
    if (unEmpleado.rowCount > 0) {
      unEmpleado.rows.map(async (obj) => {
        if (obj.imagen != null) {
          try {
            console.log(obj.imagen);
            let filePath = `servidor\\imagenesEmpleados\\${obj.imagen}`;
            let direccionCompleta = __dirname.split("servidor")[0] + filePath;
            fs.unlinkSync(direccionCompleta);
            await pool.query('Update empleados Set imagen = $2 Where id = $1 ', [id, imagen]);
            res.jsonp({ message: 'Imagen Actualizada' });
          } catch (error) {
            await pool.query('Update empleados Set imagen = $2 Where id = $1 ', [id, imagen]);
            res.jsonp({ message: 'Imagen Actualizada' });
          }
        } else {
          await pool.query('Update empleados Set imagen = $2 Where id = $1 ', [id, imagen]);
          res.jsonp({ message: 'Imagen Actualizada' });
        }
      });
    }
  }

  public async VerificarPlantilla_Automatica(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarCodigo = 0;
    var contarCedula = 0;
    var contarUsuario = 0;
    var contarRol = 0;
    var contarECivil = 0;
    var contarGenero = 0;
    var contarEstado = 0;
    var contarNacionalidad = 0;
    var contarLlenos = 0;
    var contador = 1;
    const VALOR = await pool.query('SELECT * FROM codigo');
    var codigo = parseInt(VALOR.rows[0].valor);

    plantilla.forEach(async (data: any) => {
      // Datos que se leen de la plantilla ingresada
      const { cedula, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;

      //Verificar que la cédula no se encuentre registrada
      const VERIFICAR_CEDULA = await pool.query('SELECT * FROM empleados WHERE cedula = $1', [cedula]);
      if (VERIFICAR_CEDULA.rowCount === 0) {
        contarCedula = contarCedula + 1;
      }

      //Verificar que el usuario no se encuentre registrado
      const VERIFICAR_USUARIO = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
      if (VERIFICAR_USUARIO.rowCount === 0) {
        contarUsuario = contarUsuario + 1;
      }

      //Verificar que el rol exista dentro del sistema
      const VERIFICAR_ROL = await pool.query('SELECT * FROM cg_roles WHERE UPPER(nombre) = $1',
        [rol.toUpperCase()]);
      if (VERIFICAR_ROL.rowCount > 0) {
        contarRol = contarRol + 1;
      }

      //Verificar que el estado civil exista dentro del sistema
      if (estado_civil.toUpperCase() === 'SOLTERA/A' || estado_civil.toUpperCase() === 'UNION DE HECHO' ||
        estado_civil.toUpperCase() === 'CASADO/A' || estado_civil.toUpperCase() === 'DIVORCIADO/A' ||
        estado_civil.toUpperCase() === 'VIUDO/A') {
        contarECivil = contarECivil + 1;
      }

      //Verificar que el genero exista dentro del sistema
      if (genero.toUpperCase() === 'MASCULINO' || genero.toUpperCase() === 'FEMENINO') {
        contarGenero = contarGenero + 1;
      }

      //Verificar que el estado exista dentro del sistema
      if (estado.toUpperCase() === 'ACTIVO' || estado.toUpperCase() === 'INACTIVO') {
        contarEstado = contarEstado + 1;
      }

      //Verificar que la nacionalidad exista dentro del sistema
      const VERIFICAR_NACIONALIDAD = await pool.query('SELECT * FROM nacionalidades WHERE UPPER(nombre) = $1',
        [nacionalidad.toUpperCase()]);
      if (VERIFICAR_NACIONALIDAD.rowCount > 0) {
        contarNacionalidad = contarNacionalidad + 1;
      }

      // Verificar que el código no se duplique en los registros
      codigo = codigo + 1;
      console.log('codigo_ver', codigo);
      const VERIFICAR_CODIGO = await pool.query('SELECT * FROM empleados WHERE codigo::int = $1', [codigo]);
      if (VERIFICAR_CODIGO.rowCount === 0) {
        contarCodigo = contarCodigo + 1;
      }

      //Verificar que los datos no esten vacios a excepción del dato mail_alternativo
      if (cedula != undefined && estado_civil != undefined && genero != undefined && correo != undefined &&
        fec_nacimiento != undefined && estado != undefined && domicilio != undefined && telefono != undefined &&
        nacionalidad != undefined && usuario != undefined && estado_user != undefined && rol != undefined &&
        app_habilita != undefined && data.nombre != undefined && data.apellido != undefined) {
        contarLlenos = contarLlenos + 1;
      }

      // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
      console.log('codigo', contarCodigo, plantilla.length, contador);
      console.log('cedula', contarCedula, plantilla.length, contador);
      console.log('usuario', contarUsuario, plantilla.length, contador);
      console.log('rol', contarRol, plantilla.length, contador);
      console.log('llenos', contarLlenos, plantilla.length, contador);
      if (contador === plantilla.length) {
        if (contarCodigo === plantilla.length && contarCedula === plantilla.length &&
          contarUsuario === plantilla.length && contarLlenos === plantilla.length &&
          contarRol === plantilla.length && contarECivil === plantilla.length &&
          contarGenero === plantilla.length && contarEstado === plantilla.length &&
          contarNacionalidad === plantilla.length) {
          return res.jsonp({ message: 'correcto' });
        } else {
          return res.jsonp({ message: 'error' });
        }
      }
      contador = contador + 1;
    });
    fs.unlinkSync(filePath);
  }

  public async VerificarPlantilla_DatosAutomatico(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarCedulaData = 0;
    var contarUsuarioData = 0;
    var contador_arreglo = 1;
    var arreglos_datos: any = [];
    //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
    plantilla.forEach(async (data: any) => {
      // Datos que se leen de la plantilla ingresada
      const { cedula, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;
      let datos_array = {
        cedula: cedula,
        usuario: usuario,
      }
      arreglos_datos.push(datos_array);
    });

    // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
    for (var i = 0; i <= arreglos_datos.length - 1; i++) {
      for (var j = 0; j <= arreglos_datos.length - 1; j++) {
        if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
          contarCedulaData = contarCedulaData + 1;
        }
        if (arreglos_datos[i].usuario === arreglos_datos[j].usuario) {
          contarUsuarioData = contarUsuarioData + 1;
        }
      }
      contador_arreglo = contador_arreglo + 1;
    }

    // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
    console.log('cedula_data', contarCedulaData, plantilla.length, contador_arreglo);
    console.log('usuario_data', contarUsuarioData, plantilla.length, contador_arreglo);
    if ((contador_arreglo - 1) === plantilla.length) {
      if (contarCedulaData === plantilla.length && contarUsuarioData === plantilla.length) {
        return res.jsonp({ message: 'correcto' });
      } else {
        return res.jsonp({ message: 'error' });
      }
    }
    fs.unlinkSync(filePath);
  }

  public async CargarPlantilla_Automatico(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

    const VALOR = await pool.query('SELECT * FROM codigo');
    var codigo = parseInt(VALOR.rows[0].valor);
    var contador = 1;
    plantilla.forEach(async (data: any) => {

      // Realiza un capital letter a los nombres y apellidos
      var nombreE: any;
      let nombres = data.nombre.split(' ');
      if (nombres.length > 1) {
        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
        let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
        nombreE = name1 + ' ' + name2;
      }
      else {
        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
        nombreE = name1
      }

      var apellidoE: any;
      let apellidos = data.apellido.split(' ');
      if (apellidos.length > 1) {
        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
        let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
        apellidoE = lastname1 + ' ' + lastname2;
      }
      else {
        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
        apellidoE = lastname1
      }

      // Encriptar contraseña
      const md5 = new Md5();
      const contrasena = md5.appendStr(data.contrasena).end();

      // Datos que se leen de la plantilla ingresada
      const { cedula, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio, telefono,
        nacionalidad, usuario, estado_user, rol, app_habilita } = data;

      //Obtener id del estado_civil
      var id_estado_civil = 0;
      if (estado_civil.toUpperCase() === 'SOLTERA/A') {
        id_estado_civil = 1;
      }
      else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
        id_estado_civil = 2;
      }
      else if (estado_civil.toUpperCase() === 'CASADO/A') {
        id_estado_civil = 3;
      }
      else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
        id_estado_civil = 4;
      }
      else if (estado_civil.toUpperCase() === 'VIUDO/A') {
        id_estado_civil = 5;
      }

      //Obtener id del genero
      var id_genero = 0;
      if (genero.toUpperCase() === 'MASCULINO') {
        id_genero = 1;
      }
      else if (genero.toUpperCase() === 'FEMENINO') {
        id_genero = 2;
      }

      //OBTENER ID DEL ESTADO
      var id_estado = 0;
      if (estado.toUpperCase() === 'ACTIVO') {
        id_estado = 1;
      }
      else if (estado.toUpperCase() === 'INACTIVO') {
        id_estado = 2;
      }

      //Obtener id de la nacionalidad
      const id_nacionalidad = await pool.query('SELECT * FROM nacionalidades WHERE UPPER(nombre) = $1',
        [nacionalidad.toUpperCase()]);

      //Obtener id del rol
      const id_rol = await pool.query('SELECT * FROM cg_roles WHERE UPPER(nombre) = $1', [rol.toUpperCase()]);

      // Incrementar el valor del código
      codigo = codigo + 1;

      // Registro de nuevo empleado
      await pool.query('INSERT INTO empleados (cedula, apellido, nombre, esta_civil, genero, correo, ' +
        'fec_nacimiento, estado, mail_alternativo, domicilio, telefono, id_nacionalidad, codigo) VALUES ' +
        '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [cedula, apellidoE, nombreE,
        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
        mail_alternativo, domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo]);

      // Obtener el id del empleado ingresado
      const oneEmpley = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula]);
      const id_empleado = oneEmpley.rows[0].id;

      // Registro de los datos de usuario
      await pool.query('INSERT INTO usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita) ' +
        'VALUES ($1, $2, $3, $4, $5, $6)', [usuario, contrasena, estado_user, id_rol.rows[0]['id'],
        id_empleado, app_habilita]);

      if (contador === plantilla.length) {
        console.log('codigo_ver', codigo, VALOR.rows[0].id);
        // Actualización del código
        await pool.query('UPDATE codigo SET valor = $1 WHERE id = $2', [codigo, VALOR.rows[0].id]);
        return res.jsonp({ message: 'correcto' });
      }
      contador = contador + 1;
    });
    fs.unlinkSync(filePath);
  }

  /** MÉTODOS PARA VERIFICAR PLANTILLA CON CÓDIGO INGRESADO DE FORMA MANUAL */
  public async VerificarPlantilla_Manual(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarCodigo = 0;
    var contarCedula = 0;
    var contarUsuario = 0;
    var contarRol = 0;
    var contarECivil = 0;
    var contarGenero = 0;
    var contarEstado = 0;
    var contarNacionalidad = 0;
    var contarLlenos = 0;
    var contador = 1;

    plantilla.forEach(async (data: any) => {
      // Datos que se leen de la plantilla ingresada
      const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;

      //Verificar que la cédula no se encuentre registrada
      const VERIFICAR_CEDULA = await pool.query('SELECT * FROM empleados WHERE cedula = $1', [cedula]);
      if (VERIFICAR_CEDULA.rowCount === 0) {
        contarCedula = contarCedula + 1;
      }

      // Verificar que el código no se duplique en los registros
      const VERIFICAR_CODIGO = await pool.query('SELECT * FROM empleados WHERE codigo::int = $1', [codigo]);
      if (VERIFICAR_CODIGO.rowCount === 0) {
        contarCodigo = contarCodigo + 1;
      }

      //Verificar que el usuario no se encuentre registrado
      const VERIFICAR_USUARIO = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
      if (VERIFICAR_USUARIO.rowCount === 0) {
        contarUsuario = contarUsuario + 1;
      }

      //Verificar que el rol exista dentro del sistema
      const VERIFICAR_ROL = await pool.query('SELECT * FROM cg_roles WHERE UPPER(nombre) = $1',
        [rol.toUpperCase()]);
      if (VERIFICAR_ROL.rowCount > 0) {
        contarRol = contarRol + 1;
      }

      //Verificar que el estado civil exista dentro del sistema
      if (estado_civil.toUpperCase() === 'SOLTERA/A' || estado_civil.toUpperCase() === 'UNION DE HECHO' ||
        estado_civil.toUpperCase() === 'CASADO/A' || estado_civil.toUpperCase() === 'DIVORCIADO/A' ||
        estado_civil.toUpperCase() === 'VIUDO/A') {
        contarECivil = contarECivil + 1;
      }

      //Verificar que el genero exista dentro del sistema
      if (genero.toUpperCase() === 'MASCULINO' || genero.toUpperCase() === 'FEMENINO') {
        contarGenero = contarGenero + 1;
      }

      //Verificar que el estado exista dentro del sistema
      if (estado.toUpperCase() === 'ACTIVO' || estado.toUpperCase() === 'INACTIVO') {
        contarEstado = contarEstado + 1;
      }

      //Verificar que la nacionalidad exista dentro del sistema
      const VERIFICAR_NACIONALIDAD = await pool.query('SELECT * FROM nacionalidades WHERE UPPER(nombre) = $1',
        [nacionalidad.toUpperCase()]);
      if (VERIFICAR_NACIONALIDAD.rowCount > 0) {
        contarNacionalidad = contarNacionalidad + 1;
      }

      //Verificar que los datos no esten vacios a excepción del dato mail_alternativo
      if (cedula != undefined && estado_civil != undefined && genero != undefined && correo != undefined &&
        fec_nacimiento != undefined && estado != undefined && domicilio != undefined && telefono != undefined &&
        nacionalidad != undefined && usuario != undefined && estado_user != undefined && rol != undefined &&
        app_habilita != undefined && data.nombre != undefined && data.apellido != undefined) {
        contarLlenos = contarLlenos + 1;
      }

      // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
      console.log('codigo', contarCodigo, plantilla.length, contador);
      console.log('cedula', contarCedula, plantilla.length, contador);
      console.log('usuario', contarUsuario, plantilla.length, contador);
      console.log('rol', contarRol, plantilla.length, contador);
      console.log('llenos', contarLlenos, plantilla.length, contador);
      if (contador === plantilla.length) {
        if (contarCodigo === plantilla.length && contarCedula === plantilla.length &&
          contarUsuario === plantilla.length && contarLlenos === plantilla.length &&
          contarRol === plantilla.length && contarECivil === plantilla.length &&
          contarGenero === plantilla.length && contarEstado === plantilla.length &&
          contarNacionalidad === plantilla.length) {
          return res.jsonp({ message: 'correcto' });
        } else {
          return res.jsonp({ message: 'error' });
        }
      }
      contador = contador + 1;
    });
    fs.unlinkSync(filePath);
  }

  public async VerificarPlantilla_DatosManual(req: Request, res: Response) {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`
    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contarCedulaData = 0;
    var contarUsuarioData = 0;
    var contarCodigoData = 0;
    var contador_arreglo = 1;
    var arreglos_datos: any = [];
    //Leer la plantilla para llenar un array con los datos cedula y usuario para verificar que no sean duplicados
    plantilla.forEach(async (data: any) => {
      // Datos que se leen de la plantilla ingresada
      const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;
      let datos_array = {
        cedula: cedula,
        usuario: usuario,
        codigo: codigo
      }
      arreglos_datos.push(datos_array);
    });

    // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
    for (var i = 0; i <= arreglos_datos.length - 1; i++) {
      for (var j = 0; j <= arreglos_datos.length - 1; j++) {
        if (arreglos_datos[i].cedula === arreglos_datos[j].cedula) {
          contarCedulaData = contarCedulaData + 1;
        }
        if (arreglos_datos[i].usuario === arreglos_datos[j].usuario) {
          contarUsuarioData = contarUsuarioData + 1;
        }
        if (arreglos_datos[i].codigo === arreglos_datos[j].codigo) {
          contarCodigoData = contarCodigoData + 1;
        }
      }
      contador_arreglo = contador_arreglo + 1;
    }

    // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
    console.log('cedula_data', contarCedulaData, plantilla.length, contador_arreglo);
    console.log('usuario_data', contarUsuarioData, plantilla.length, contador_arreglo);
    console.log('codigo_data', contarCodigoData, plantilla.length, contador_arreglo);
    if ((contador_arreglo - 1) === plantilla.length) {
      if (contarCedulaData === plantilla.length && contarUsuarioData === plantilla.length &&
        contarCodigoData === plantilla.length) {
        return res.jsonp({ message: 'correcto' });
      } else {
        return res.jsonp({ message: 'error' });
      }
    }
    fs.unlinkSync(filePath);
  }

  public async CargarPlantilla_Manual(req: Request, res: Response): Promise<void> {
    let list: any = req.files;
    let cadena = list.uploads[0].path;
    let filename = cadena.split("\\")[1];
    var filePath = `./plantillas/${filename}`

    const workbook = excel.readFile(filePath);
    const sheet_name_list = workbook.SheetNames;
    const plantilla = excel.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
    var contador = 1;
    plantilla.forEach(async (data: any) => {

      // Realiza un capital letter a los nombres y apellidos
      var nombreE: any;
      let nombres = data.nombre.split(' ');
      if (nombres.length > 1) {
        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
        let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
        nombreE = name1 + ' ' + name2;
      }
      else {
        let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
        nombreE = name1
      }

      var apellidoE: any;
      let apellidos = data.apellido.split(' ');
      if (apellidos.length > 1) {
        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
        let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
        apellidoE = lastname1 + ' ' + lastname2;
      }
      else {
        let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
        apellidoE = lastname1
      }

      // Encriptar contraseña
      const md5 = new Md5();
      const contrasena = md5.appendStr(data.contrasena).end();

      // Datos que se leen de la plantilla ingresada
      const { cedula, codigo, estado_civil, genero, correo, fec_nacimiento, estado, mail_alternativo, domicilio,
        telefono, nacionalidad, usuario, estado_user, rol, app_habilita } = data;

      //Obtener id del estado_civil
      var id_estado_civil = 0;
      if (estado_civil.toUpperCase() === 'SOLTERA/A') {
        id_estado_civil = 1;
      }
      else if (estado_civil.toUpperCase() === 'UNION DE HECHO') {
        id_estado_civil = 2;
      }
      else if (estado_civil.toUpperCase() === 'CASADO/A') {
        id_estado_civil = 3;
      }
      else if (estado_civil.toUpperCase() === 'DIVORCIADO/A') {
        id_estado_civil = 4;
      }
      else if (estado_civil.toUpperCase() === 'VIUDO/A') {
        id_estado_civil = 5;
      }

      //Obtener id del genero
      var id_genero = 0;
      if (genero.toUpperCase() === 'MASCULINO') {
        id_genero = 1;
      }
      else if (genero.toUpperCase() === 'FEMENINO') {
        id_genero = 2;
      }

      //OBTENER ID DEL ESTADO
      var id_estado = 0;
      if (estado.toUpperCase() === 'ACTIVO') {
        id_estado = 1;
      }
      else if (estado.toUpperCase() === 'INACTIVO') {
        id_estado = 2;
      }

      //Obtener id de la nacionalidad
      const id_nacionalidad = await pool.query('SELECT * FROM nacionalidades WHERE UPPER(nombre) = $1',
        [nacionalidad.toUpperCase()]);

      //Obtener id del rol
      const id_rol = await pool.query('SELECT * FROM cg_roles WHERE UPPER(nombre) = $1', [rol.toUpperCase()]);

      // Registro de nuevo empleado
      await pool.query('INSERT INTO empleados ( cedula, apellido, nombre, esta_civil, genero, correo, ' +
        'fec_nacimiento, estado, mail_alternativo, domicilio, telefono, id_nacionalidad, codigo) VALUES ' +
        '($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)', [cedula, apellidoE, nombreE,
        id_estado_civil, id_genero, correo, fec_nacimiento, id_estado,
        mail_alternativo, domicilio, telefono, id_nacionalidad.rows[0]['id'], codigo]);

      // Obtener el id del empleado ingresado
      const oneEmpley = await pool.query('SELECT id FROM empleados WHERE cedula = $1', [cedula]);
      const id_empleado = oneEmpley.rows[0].id;

      // Registro de los datos de usuario
      await pool.query('INSERT INTO usuarios (usuario, contrasena, estado, id_rol, id_empleado, app_habilita) ' +
        'VALUES ($1, $2, $3, $4, $5, $6)', [usuario, contrasena, estado_user, id_rol.rows[0]['id'], id_empleado,
        app_habilita]);

      if (contador === plantilla.length) {
        // Actualización del código
        await pool.query('UPDATE codigo SET valor = null WHERE id = 1');
        return res.jsonp({ message: 'correcto' });
      }
      contador = contador + 1;
    });
    fs.unlinkSync(filePath);
  }


  public async createEmpleadoTitulos(req: Request, res: Response): Promise<void> {
    const { observacion, id_empleado, id_titulo } = req.body;
    await pool.query('INSERT INTO empl_titulos ( observacion, id_empleado, id_titulo ) VALUES ($1, $2, $3)',
      [observacion, id_empleado, id_titulo]);
    res.jsonp({ message: 'Titulo del empleado Guardado' });
  }

  public async editarTituloDelEmpleado(req: Request, res: Response): Promise<void> {
    const id = req.params.id_empleado_titulo;
    const { observacion, id_titulo } = req.body;
    await pool.query('UPDATE empl_titulos SET observacion = $1, id_titulo = $2 WHERE id = $3 ', [observacion,
      id_titulo, id]);
    res.jsonp({ message: 'Titulo del empleado Actualizado' });
  }

  public async eliminarTituloDelEmpleado(req: Request, res: Response): Promise<void> {
    const id = req.params.id_empleado_titulo;
    await pool.query('DELETE FROM empl_titulos WHERE id = $1', [id]);
    res.jsonp({ message: 'Registro eliminado' });
  }

  public async getTitulosDelEmpleado(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const unEmpleadoTitulo = await pool.query('SELECT et.id, et.observacion As observaciones, et.id_titulo, ' +
      'et.id_empleado, ct.nombre, nt.nombre as nivel FROM empl_titulos AS et, cg_titulos AS ct, ' +
      'nivel_titulo AS nt WHERE et.id_empleado = $1 and et.id_titulo = ct.id and ct.id_nivel = nt.id ORDER BY id',
      [id_empleado]);
    if (unEmpleadoTitulo.rowCount > 0) {
      return res.jsonp(unEmpleadoTitulo.rows)
    }
    else {
      res.status(404).jsonp({ text: 'El empleado no tiene titulos asignados' });
    }

  }

  public async FileXML(req: Request, res: Response): Promise<any> {
    var xml = builder.create('root').ele(req.body).end({ pretty: true });
    console.log(req.body.userName);
    let filename = "Empleado-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
    fs.writeFile(`xmlDownload/${filename}`, xml, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("Archivo guardado");
    });
    res.jsonp({ text: 'XML creado', name: filename });
  }

  public async downloadXML(req: Request, res: Response): Promise<any> {
    const name = req.params.nameXML;
    let filePath = `servidor\\xmlDownload\\${name}`
    res.sendFile(__dirname.split("servidor")[0] + filePath);
  }

  public async ObtenerDepartamentoEmpleado(req: Request, res: Response): Promise<any> {
    const { id_emple, id_cargo } = req.body;
    const DEPARTAMENTO = await pool.query('SELECT *FROM VistaDepartamentoEmpleado WHERE id_emple = $1 AND ' +
      'id_cargo = $2', [id_emple, id_cargo]);
    if (DEPARTAMENTO.rowCount > 0) {
      return res.jsonp(DEPARTAMENTO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados' });
    }
  }

  // CREAR CÓDIGO
  public async CrearCodigo(req: Request, res: Response) {
    const { id, valor, automatico, manual } = req.body;
    await pool.query('INSERT INTO codigo ( id, valor, automatico, manual) VALUES ($1, $2, $3, $4)',
      [id, valor, automatico, manual]);
    res.jsonp({ message: 'Codigo guardado' });
  }

  public async ActualizarCodigoTotal(req: Request, res: Response) {
    const { valor, automatico, manual, id } = req.body;
    await pool.query('UPDATE codigo SET valor = $1, automatico = $2, manual = $3 WHERE id = $4',
      [valor, automatico, manual, id]);
    res.jsonp({ message: 'Codigo guardado' });
  }

  public async ActualizarCodigo(req: Request, res: Response) {
    const { valor, id } = req.body;
    await pool.query('UPDATE codigo SET valor = $1 WHERE id = $2', [valor, id]);
    res.jsonp({ message: 'Codigo actualizado' });
  }

  public async ObtenerCodigo(req: Request, res: Response): Promise<any> {
    const VALOR = await pool.query('SELECT *FROM codigo');
    if (VALOR.rowCount > 0) {
      return res.jsonp(VALOR.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados' });
    }
  }

  public async ObtenerMAXCodigo(req: Request, res: Response): Promise<any> {
    const VALOR = await pool.query('SELECT MAX(codigo) AS codigo FROM empleados');
    if (VALOR.rowCount > 0) {
      return res.jsonp(VALOR.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registros no encontrados' });
    }
  }

  public async ListaBusquedaEmpleados(req: Request, res: Response): Promise<any> {
    const empleado = await pool.query('SELECT id, nombre, apellido FROM empleados ORDER BY apellido')
      .then(result => {
        return result.rows.map(obj => {
          return {
            id: obj.id,
            empleado: obj.apellido + ' ' + obj.nombre
          }
        })
      })

    res.jsonp(empleado);
  }

  public async DesactivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const arrayIdsEmpleados = req.body;
    console.log(arrayIdsEmpleados);

    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {
        await pool.query('UPDATE empleados SET estado = 2 WHERE id = $1', [obj]) // 2 => desactivado o inactivo
          .then(result => {
            console.log(result.command, 'EMPLEADO ====>', obj);
          });
        await pool.query('UPDATE usuarios SET estado = false, app_habilita = false WHERE id_empleado = $1', [obj]) // false => Ya no tiene acceso
          .then(result => {
            console.log(result.command, 'USUARIO ====>', obj);
          });
      });
      return res.jsonp({ message: 'Todos los empleados han sido desactivados' });
    }
    return res.jsonp({ message: 'No ha sido desactivado ningún empleado' });
  }

  public async listaEmpleadosDesactivados(req: Request, res: Response) {
    const empleado = await pool.query('SELECT * FROM empleados WHERE estado = 2 ORDER BY id');

    res.jsonp(empleado.rows);
  }

  public async ActivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const arrayIdsEmpleados = req.body;
    console.log(arrayIdsEmpleados);

    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {
        await pool.query('UPDATE empleados SET estado = 1 WHERE id = $1', [obj]) // 1 => activado 
          .then(result => {
            console.log(result.command, 'EMPLEADO ====>', obj);
          });
        await pool.query('UPDATE usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1', [obj]) // true => Tiene acceso
          .then(result => {
            console.log(result.command, 'USUARIO ====>', obj);
          });
      });
      // var tiempo = 1000 * arrayIdsEmpleados.length
      // setInterval(() => {
      // }, tiempo)
      return res.jsonp({ message: 'Todos los empleados han sido activados' });
    }
    return res.jsonp({ message: 'No ha sido activado ningún empleado' });
  }

  public async ReactivarMultiplesEmpleados(req: Request, res: Response): Promise<any> {
    const arrayIdsEmpleados = req.body;
    console.log(arrayIdsEmpleados);

    if (arrayIdsEmpleados.length > 0) {
      arrayIdsEmpleados.forEach(async (obj: number) => {

        await pool.query('UPDATE empleados SET estado = 1 WHERE id = $1', [obj]) // 1 => activado 
          .then(result => {
            console.log(result.command, 'EMPLEADO ====>', obj);
          });
        await pool.query('UPDATE usuarios SET estado = true, app_habilita = true WHERE id_empleado = $1', [obj]) // true => Tiene acceso
          .then(result => {
            console.log(result.command, 'USUARIO ====>', obj);
          });
        EstadoHorarioPeriVacacion(obj);
      });

      return res.jsonp({ message: 'Todos los empleados seleccionados han sido reactivados' });
    }
    return res.jsonp({ message: 'No ha sido reactivado ningún empleado' });
  }
  public async GeolocalizacionCrokis(req: Request, res: Response): Promise<any> {
    let id = req.params.id
    let { lat, lng } = req.body
    console.log(lat, lng, id);

    try {
      await pool.query('UPDATE empleados SET latitud = $1, longitud = $2 WHERE id = $3', [lat, lng, id])
        .then(result => {
          console.log(result.command);
        })
      res.status(200).jsonp({ message: 'Geolocalizacion actulizada' });
    } catch (error) {
      res.status(400).jsonp({ message: error });
    }
  }

}

export const EMPLEADO_CONTROLADOR = new EmpleadoControlador();

export default EMPLEADO_CONTROLADOR;
