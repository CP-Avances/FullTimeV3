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
exports.enviarMail = exports.Credenciales = exports.puerto = exports.servidor = exports.cabecera_firma = exports.pie_firma = exports.logo_ = exports.nombre = exports.email = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const database_1 = __importDefault(require("../database"));
exports.email = process.env.EMAIL || '';
let pass = process.env.PASSWORD || '';
exports.nombre = process.env.NOMBRE || '';
exports.logo_ = process.env.LOGO || '';
exports.pie_firma = process.env.PIEF || '';
exports.cabecera_firma = process.env.CABECERA || '';
exports.servidor = process.env.SERVIDOR || '';
exports.puerto = process.env.PUERTO || '';
// export let email: string;
// let pass: string;
const Credenciales = function (id_empresa, correo = process.env.EMAIL, password = process.env.PASSWORD, empresa = process.env.NOMBRE, img = empresa = process.env.LOGO, img_pie = process.env.PIEF, img_cabecera = process.env.CABECERA, port = process.env.PUERTO, host = process.env.SERVIDOR) {
    return __awaiter(this, void 0, void 0, function* () {
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
        let credenciales = yield database_1.default.query('SELECT correo, password_correo, nombre, logo, pie_firma, cabecera_firma, servidor, puerto ' +
            'FROM cg_empresa WHERE id = $1', [id_empresa]).then(result => {
            return result.rows[0];
        });
        console.log('Credenciales-------------------------------------------------- === ', credenciales);
        exports.email = credenciales.correo;
        pass = credenciales.password_correo;
        exports.nombre = credenciales.nombre;
        exports.logo_ = credenciales.logo;
        exports.pie_firma = credenciales.pie_firma;
        exports.cabecera_firma = credenciales.cabecera_firma;
        exports.servidor = credenciales.servidor;
        exports.puerto = credenciales.puerto;
        // console.log('Credenciales === ', credenciales);
        return;
    });
};
exports.Credenciales = Credenciales;
const enviarMail = function (data, servidor, puerto) {
    var seguridad = false;
    if (puerto === 465) {
        seguridad = true;
    }
    else {
        seguridad = false;
    }
    // console.log(email,'>>>>>>', pass);
    // const smtpTransport = nodemailer.createTransport({
    const transporter = nodemailer_1.default.createTransport({
        // service: 'Gmail',
        host: servidor,
        port: puerto,
        secure: seguridad,
        //ignoreTLS: true,
        auth: {
            user: exports.email,
            pass: pass
        },
        //tls: { rejectUnauthorized: false }
    });
    try {
        transporter.sendMail(data, (error, info) => __awaiter(this, void 0, void 0, function* () {
            //smtpTransport.sendMail(data, async (error: any, info: any) => {
            // console.log('****************************************************');
            // console.log(data);
            // console.log('****************************************************');
            if (error) {
                console.warn(error);
            }
            else {
                console.log('Email sent: ' + info.response);
            }
        }));
    }
    catch (error) {
        console.log(error.toString());
        return { err: error.toString() };
    }
};
exports.enviarMail = enviarMail;
