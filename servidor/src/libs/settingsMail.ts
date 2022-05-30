import nodemailer from 'nodemailer'
import pool from '../database';

export let email: string = process.env.EMAIL || '';
let pass: string = process.env.PASSWORD || '';
export let nombre: string = process.env.NOMBRE || '';
export let logo_: string = process.env.LOGO || '';
export let pie_firma: string = process.env.PIEF || '';
export let cabecera_firma: string = process.env.CABECERA || '';
export let servidor: string = process.env.SERVIDOR || '';
export let puerto: string = process.env.PUERTO || '';
// export let email: string;
// let pass: string;

export const Credenciales =
  async function (id_empresa: number, correo = process.env.EMAIL!,
    password = process.env.PASSWORD!, empresa = process.env.NOMBRE!,
    img = empresa = process.env.LOGO!, img_pie = process.env.PIEF!,
    img_cabecera = process.env.CABECERA!, port = process.env.PUERTO!,
    host = process.env.SERVIDOR!) {
    /*try {
      console.log('ESTAMOS EN TRY',);
      if (id_empresa === 0) {
        console.log('ESTAMOS EN IF EMPRESA 0',);
        email = correo;
        pass = password;
        nombre = empresa;
        logo_ = img;
        pie_firma = img_pie;
        cabecera_firma = img_cabecera;
        puerto = port;
        servidor = host;
        return
      } else {
        console.log('ESTAMOS EN ELSE EMPRESA DIFERENTE DE 0',);
        let credenciales = await pool.query(
          'SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto ' +
          'FROM cg_empresa WHERE id = $1', [id_empresa]).then(result => {
            return result.rows[0]
          });


        console.log('Credenciales-------------------------------------------------- === ', credenciales);
        email = credenciales.correo;
        pass = credenciales.password_correo;
        nombre = credenciales.nombre;
        logo_ = credenciales.logo;
        pie_firma = credenciales.pie_firma;
        cabecera_firma = credenciales.cabecera_firma;
        servidor = credenciales.servidor;
        puerto = credenciales.puerto;
        // console.log('Credenciales === ', credenciales);
        return


      }

    } catch (error) {
      // console.log(error);

      console.info(error.toString())
    }
    */


    let credenciales = await pool.query(
      'SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto ' +
      'FROM cg_empresa WHERE id = $1', [id_empresa]).then(result => {
        return result.rows[0]
      });


    console.log('Credenciales-------------------------------------------------- === ', credenciales);
    email = credenciales.correo;
    pass = credenciales.password_correo;
    nombre = credenciales.nombre;
    logo_ = credenciales.logo;
    pie_firma = credenciales.pie_firma;
    cabecera_firma = credenciales.cabecera_firma;
    servidor = credenciales.servidor;
    puerto = credenciales.puerto;
    // console.log('Credenciales === ', credenciales);
    return

  }

export const enviarMail = function (data: any, servidor: any, puerto: number) {
  var seguridad: boolean = false;
  if (puerto === 465) {
    seguridad = true;
  } else {
    seguridad = false;
  }
  // console.log(email,'>>>>>>', pass);
  // const smtpTransport = nodemailer.createTransport({
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: servidor,
    port: puerto,
    secure: seguridad,
    //ignoreTLS: true,
    auth: {
      user: email,
      pass: pass
    },
    //tls: { rejectUnauthorized: false }

  });

  try {
    transporter.sendMail(data, async (error: any, info: any) => {
      //smtpTransport.sendMail(data, async (error: any, info: any) => {
      // console.log('****************************************************');
      // console.log(data);
      // console.log('****************************************************');

      if (error) {
        console.warn(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.log(error.toString());
    return { err: error.toString() }
  }

}