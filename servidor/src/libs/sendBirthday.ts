import pool from '../database';
import { enviarMail, email, Credenciales } from './settingsMail';
import path from 'path'

// metodo para enviar los cumpleaños a una hora determinada, verificando a cada hora hasta que sean las 12 pm y se envie el correo
export const cumpleanios = function () {
    setInterval(async () => {

        const path_folder = path.resolve('cumpleanios')
        // console.log(path_folder);
        const date = new Date();
        // console.log(date.toLocaleDateString());
        // console.log(date.toLocaleTimeString());
        const hora = date.getHours();
        const fecha = date.toJSON().slice(4).split("T")[0];
        // console.log(fecha)
        if (hora === 10) {
            const felizCumple = await pool.query("SELECT e.nombre, e.apellido, e.correo, e.fec_nacimiento, em.nombre AS empresa, em.correo AS correo_empresa, em.password_correo , m.titulo, m.mensaje, m.img, m.url FROM empleados AS e, empl_contratos AS cn, empl_cargos AS cr, sucursales AS s, cg_empresa AS em, message_birthday AS m WHERE CAST(e.fec_nacimiento AS VARCHAR) LIKE '%' || $1 AND cn.id_empleado = e.id AND e.estado = 1 AND cr.id_empl_contrato = cn.id AND s.id = cr.id_sucursal AND em.id = s.id_empresa AND m.id_empresa = em.id", [fecha]);
            // console.log(felizCumple.rows);
            if (felizCumple.rowCount > 0) {

                // Enviar mail a todos los que nacieron en la fecha seleccionada
                felizCumple.rows.forEach(obj => {
                    // <p>Sabemos que es un dia especial para ti <b>${obj.nombre.split(" ")[0]} ${obj.apellido.split(" ")[0]}</b> 
                    // , esperamos que la pases muy bien en compañia de tus seres queridos.
                    //     </p>
                    Credenciales(0, obj.correo_empresa, obj.password_correo);
                    let message_url = `<p></p>`;
                    if (obj.url != null) {
                        message_url = `<p>Da click en el siguiente enlace para ver tu felicitación <a href="${obj.url}">Happy</></p>`
                    }
                    let data = {
                        to: obj.correo,
                        from: obj.correo_empresa,
                        subject: 'Felicidades',
                        html: ` <h2> <b> ${obj.empresa} </b> </h2>
                        <h3 style="text-align-center"><b>¡Feliz Cumpleaños ${obj.nombre.split(" ")[0]}!</b></h3>
                        <h4>${obj.titulo}</h4>
                        <p>${obj.mensaje}</p>
                        ${message_url}
                        <img src="cid:cumple"/>`,
                        attachments: [{
                            filename: 'birthday1.jpg',
                            path: `${path_folder}/${obj.img}`,
                            cid: 'cumple' //same cid value as in the html img src
                        }]
                    };
                    console.log(data)
                    enviarMail(data);
                })
            }
        }
    }, 3600000);
    // }, 10000);

}