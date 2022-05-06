import nodemailer from 'nodemailer'
import pool from '../database';

export let email: string = process.env.EMAIL || '';
let pass: string = process.env.PASSWORD || '';
export let nombre: string = process.env.NOMBRE || '';
export let logo_: string = process.env.LOGO || '';
export let pie_firma: string = process.env.PIEF || '';
// export let email: string;
// let pass: string;

export const Credenciales = async function (id_empresa: number, correo = process.env.EMAIL!, password = process.env.PASSWORD!, empresa = process.env.NOMBRE!, img = empresa = process.env.LOGO!, img_pie = process.env.PIEF!): Promise<void> {
  try {

    if (id_empresa === 0) {
      email = correo;
      pass = password;
      nombre = empresa;
      logo_ = img;
      pie_firma = img_pie;
      return
    } else {
      let credenciales = await pool.query('SELECT correo, password_correo, nombre, logo, pie_firma FROM cg_empresa WHERE id = $1', [id_empresa]).then(result => {
        return result.rows[0]
      });
      // console.log('Credenciales === ',credenciales);
      email = credenciales.correo;
      pass = credenciales.password_correo;
      nombre = credenciales.nombre;
      logo_ = credenciales.logo;
      pie_firma = credenciales.pie_firma;
      console.log('Credenciales === ', credenciales);
      return
    }

  } catch (error) {
    // console.log(error);
    console.info(error.toString())
  }
}

export const enviarMail = function (data: any) {
  // console.log(email,'>>>>>>', pass);

  const smtpTransport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: email,
      pass: pass
    }
  });

  try {
    smtpTransport.sendMail(data, async (error: any, info: any) => {
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