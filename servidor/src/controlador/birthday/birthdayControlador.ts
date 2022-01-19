import { Request, Response } from 'express';
import pool from '../../database';
import fs from 'fs';

class BirthdayControlador {

    public async getImagen(req: Request, res: Response): Promise<any> {
        const imagen = req.params.imagen;
        let filePath = `servidor\\cumpleanios\\${imagen}`
        res.sendFile(__dirname.split("servidor")[0] + filePath);
    }

    public async MensajeEmpresa(req: Request, res: Response): Promise<any> {
        const { id_empresa } = req.params;
        const DAY = await pool.query('SELECT * FROM Message_birthday WHERE id_empresa = $1', [id_empresa]);
        if (DAY.rowCount > 0) {
            return res.jsonp(DAY.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearMensajeBirthday(req: Request, res: Response): Promise<void> {
        const { id_empresa, titulo, link, mensaje } = req.body;
        await pool.query('INSERT INTO Message_birthday ( id_empresa, titulo, mensaje, url ) VALUES ($1, $2, $3, $4)', [id_empresa, titulo, mensaje, link]);
        const oneMessage = await pool.query('SELECT id FROM Message_birthday WHERE id_empresa = $1', [id_empresa]);
        const idMessageGuardado = oneMessage.rows[0].id;
        res.jsonp([{ message: 'Mensaje de cumpleaños empresarial guardado', id: idMessageGuardado }]);
    }

    public async CrearImagenEmpleado(req: Request, res: Response): Promise<void> {
        let list: any = req.files;        
        let imagen = list.uploads[0].path.split("\\")[1];
        let id = req.params.id_empresa;
    
        const unEmpleado = await pool.query('SELECT * FROM Message_birthday WHERE id = $1', [id]);
        if (unEmpleado.rowCount > 0) {
            unEmpleado.rows.map(async (obj) => {
                if (obj.img != null) {
                try {
                    console.log(obj.img);
                    let filePath = `servidor\\cumpleanios\\${obj.img}`;
                    let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                    fs.unlinkSync(direccionCompleta);
                    await pool.query('Update Message_birthday Set img = $2 Where id = $1 ', [id, imagen]);
                    res.jsonp({ message: 'Imagen Actualizada' });
                } catch (error) {
                    await pool.query('Update Message_birthday Set img = $2 Where id = $1 ', [id, imagen]);
                    res.jsonp({ message: 'Imagen Actualizada' });
                }
                } else {
                await pool.query('Update Message_birthday Set img = $2 Where id = $1 ', [id, imagen]);
                res.jsonp({ message: 'Imagen Actualizada' });
                }
            });
        }
    }

    public async EditarMensajeBirthday(req: Request, res: Response): Promise<void> {
        const { titulo, mensaje, link } = req.body;
        const {id_mensaje} = req.params;
        await pool.query('UPDATE Message_birthday SET titulo = $1, mensaje = $2, url = $3 WHERE id = $4', [titulo, mensaje, link, id_mensaje]);
        res.jsonp({ message: 'Mensaje de cumpleaños actualizado'});
    }

}

export const BIRTHDAY_CONTROLADOR = new BirthdayControlador();

export default BIRTHDAY_CONTROLADOR;