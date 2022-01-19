import nodemailer from 'nodemailer'
import pool from '../database';

export let email: string = process.env.EMAIL || '';
let pass: string = process.env.PASSWORD || '';
// export let email: string;
// let pass: string;

export const Credenciales = async function (id_empresa: number, correo = process.env.EMAIL!, password = process.env.PASSWORD!): Promise<void> {
  try {

    if (id_empresa === 0) {
      email = correo;
      pass = password;
      return
    } else {
      let credenciales = await pool.query('SELECT correo, password_correo FROM cg_empresa WHERE id = $1', [id_empresa]).then(result => {
        return result.rows[0]
      });
      // console.log('Credenciales === ',credenciales);
      email = credenciales.correo;
      pass = credenciales.password_correo;
      console.log('Credenciales === ',credenciales);
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