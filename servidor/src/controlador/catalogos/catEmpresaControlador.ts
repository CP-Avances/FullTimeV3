import { ImagenBase64LogosEmpresas } from '../../libs/ImagenCodificacion'
import { Request, Response } from 'express';
const builder = require('xmlbuilder');
import pool from '../../database';
import fs from 'fs';

class EmpresaControlador {

    public async ListarEmpresa(req: Request, res: Response) {
        const EMPRESA = await pool.query('SELECT id, nombre, ruc, direccion, telefono, correo, ' +
            'representante, tipo_empresa, establecimiento, logo, color_p, color_s, num_partida, marca_agua, ' +
            'correo_empresa FROM cg_empresa ORDER BY nombre ASC');
        if (EMPRESA.rowCount > 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async ListarUnaEmpresa(req: Request, res: Response) {
        const { nombre } = req.params;
        const EMPRESA = await pool.query('SELECT id, nombre, ruc, direccion, telefono, correo, representante, ' +
            'tipo_empresa, establecimiento, logo, color_p, color_s, num_partida, marca_agua, correo_empresa ' +
            'FROM cg_empresa WHERE nombre = $1', [nombre]);
        if (EMPRESA.rowCount > 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async CrearEmpresa(req: Request, res: Response): Promise<void> {
        const { nombre, ruc, direccion, telefono, tipo_empresa, representante,
            establecimiento, color_p, color_s, correo_empresa } = req.body;
        await pool.query('INSERT INTO cg_empresa (nombre, ruc, direccion, telefono, tipo_empresa, ' +
            'representante, establecimiento, color_p, color_s, correo_empresa) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [nombre, ruc, direccion, telefono, tipo_empresa, representante, establecimiento,
                color_p, color_s, correo_empresa]);
        res.jsonp({ message: 'La Empresa se registró con éxito' });
    }

    public async ActualizarEmpresa(req: Request, res: Response): Promise<void> {
        const { nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante,
            establecimiento, dias_cambio, cambios, num_partida, id } = req.body;
        await pool.query('UPDATE cg_empresa SET nombre = $1, ruc = $2, direccion = $3, telefono = $4, ' +
            'correo_empresa = $5, tipo_empresa = $6, representante = $7, establecimiento = $8, dias_cambio = $9, ' +
            'cambios = $10, num_partida = $11 WHERE id = $12',
            [nombre, ruc, direccion, telefono, correo_empresa, tipo_empresa, representante, establecimiento,
                dias_cambio, cambios, num_partida, id]);
        res.jsonp({ message: 'Empresa actualizada exitosamente' });
    }

    public async FileXML(req: Request, res: Response): Promise<any> {
        var xml = builder.create('root').ele(req.body).end({ pretty: true });
        console.log(req.body.userName);
        let filename = "Empresas-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() +
            '.xml';
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

    public async EliminarRegistros(req: Request, res: Response): Promise<void> {
        const id = req.params.id;
        await pool.query('DELETE FROM cg_empresa WHERE id = $1', [id]);
        res.jsonp({ message: 'Registro eliminado' });
    }

    public async ListarEmpresaId(req: Request, res: Response) {
        const { id } = req.params;
        const EMPRESA = await pool.query('SELECT * FROM cg_empresa WHERE id = $1', [id]);
        if (EMPRESA.rowCount > 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

    public async getImagenBase64(req: Request, res: Response): Promise<any> {

        const file_name =
            await pool.query('select nombre, logo from cg_empresa where id = $1', [req.params.id_empresa])
                .then(result => {
                    return result.rows[0];
                });
        const codificado = await ImagenBase64LogosEmpresas(file_name.logo);
        if (codificado === 0) {
            res.status(200).jsonp({ imagen: 0, nom_empresa: file_name.nombre })
        } else {
            res.status(200).jsonp({ imagen: codificado, nom_empresa: file_name.nombre })
        }
    }

    public async ActualizarLogoEmpresa(req: Request, res: Response): Promise<any> {

        let list: any = req.files;
        let logo = list.image[0].path.split("\\")[1];
        let id = req.params.id_empresa;
        console.log(logo, '====>', id);

        const logo_name = await pool.query('SELECT nombre, logo FROM cg_empresa WHERE id = $1', [id]);

        if (logo_name.rowCount > 0) {
            logo_name.rows.map(async (obj) => {
                if (obj.logo != null) {
                    try {
                        console.log(obj.logo);
                        let filePath = `servidor\\logos\\${obj.logo}`;
                        let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                        fs.unlinkSync(direccionCompleta);
                        await pool.query('Update cg_empresa Set logo = $2 Where id = $1 ', [id, logo]);
                    } catch (error) {
                        await pool.query('Update cg_empresa Set logo = $2 Where id = $1 ', [id, logo]);
                    }
                } else {
                    await pool.query('Update cg_empresa Set logo = $2 Where id = $1 ', [id, logo]);
                }
            });
        }

        const codificado = await ImagenBase64LogosEmpresas(logo);
        res.send({ imagen: codificado, nom_empresa: logo_name.rows[0].nombre, message: 'Logo actualizado' })
    }

    public async ActualizarColores(req: Request, res: Response): Promise<void> {
        const { color_p, color_s, id } = req.body;
        await pool.query('UPDATE cg_empresa SET color_p = $1, color_s = $2 WHERE id = $3',
            [color_p, color_s, id]);
        res.jsonp({ message: 'Colores de Empresa actualizados exitosamente' });
    }

    public async ActualizarSeguridad(req: Request, res: Response): Promise<void> {
        const { seg_contrasena, seg_frase, seg_ninguna, id } = req.body;
        await pool.query('UPDATE cg_empresa SET seg_contrasena = $1, seg_frase = $2, seg_ninguna = $3 ' +
            'WHERE id = $4', [seg_contrasena, seg_frase, seg_ninguna, id]);
        res.jsonp({ message: 'Seguridad exitosamente' });
    }

    public async ActualizarMarcaAgua(req: Request, res: Response): Promise<void> {
        const { marca_agua, id } = req.body;
        await pool.query('UPDATE cg_empresa SET marca_agua = $1 WHERE id = $2', [marca_agua, id]);
        res.jsonp({ message: 'Registro guardado' });
    }

    public async EditarPassword(req: Request, res: Response): Promise<void> {
        const id = req.params.id_empresa
        const { correo, password_correo } = req.body;
        console.log('Objeto ===== ', req.body);

        await pool.query('UPDATE cg_empresa SET correo = $1, password_correo = $2 WHERE id = $3',
            [correo, password_correo, id]);
        res.status(200).jsonp({ message: 'Guardada la configuracion de credenciales' })
    }

    public async ActualizarAccionesTimbres(req: Request, res: Response): Promise<void> {
        try {
            const { id, bool_acciones } = req.body;
            await pool.query('UPDATE cg_empresa SET acciones_timbres = $1 WHERE id = $2', [bool_acciones, id]);
            res.status(200).jsonp({
                message: 'Empresa actualizada exitosamente',
                title: 'Ingrese nuevamente al sistema'
            });
        } catch (error) {
            res.status(404).jsonp(error)
        }
    }

    public async BuscarCadena(req: Request, res: Response) {
        const EMPRESA = await pool.query('SELECT cadena FROM cg_empresa');
        if (EMPRESA.rowCount > 0) {
            return res.jsonp(EMPRESA.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'No se encuentran registros' });
        }
    }

}

export const EMPRESA_CONTROLADOR = new EmpresaControlador();

export default EMPRESA_CONTROLADOR;