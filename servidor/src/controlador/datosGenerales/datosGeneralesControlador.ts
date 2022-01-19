import { Request, response, Response } from 'express';
import pool from '../../database';

class DatosGeneralesControlador {

    public async ListarDatosEmpleadoAutoriza(req: Request, res: Response) {
        const { empleado_id } = req.params;
        const DATOS = await pool.query('SELECT * FROM datosCargoActual ($1)', [empleado_id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarDatosActualesEmpleado(req: Request, res: Response) {
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad, c.hora_trabaja ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id ORDER BY e_datos.nombre ASC');
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    /** INICIO CONSULTAS USADAS PARA FILTRAR INFORMACIÓN */
    public async ListarEmpleadoSucursal(req: Request, res: Response) {
        const { id } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND c.id_sucursal = $1', [id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuDepa(req: Request, res: Response) {
        const { id_sucursal, id_departamento } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND c.id_departamento = $2', [id_sucursal, id_departamento]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuDepaCargo(req: Request, res: Response) {
        const { id_sucursal, id_departamento, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND c.id_departamento = $2 AND tc.id = $3',
            [id_sucursal, id_departamento, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuDepaRegimen(req: Request, res: Response) {
        const { id_sucursal, id_departamento, id_regimen } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND c.id_departamento = $2 AND r.id = $3', [id_sucursal, id_departamento, id_regimen]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuDepaRegimenCargo(req: Request, res: Response) {
        const { id_sucursal, id_departamento, id_regimen, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND c.id_departamento = $2 AND r.id = $3 AND tc.id = $4',
            [id_sucursal, id_departamento, id_regimen, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuCargo(req: Request, res: Response) {
        const { id_sucursal, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND tc.id = $2',
            [id_sucursal, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuRegimen(req: Request, res: Response) {
        const { id_sucursal, id_regimen } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND r.id = $2 ',
            [id_sucursal, id_regimen]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoSucuRegimenCargo(req: Request, res: Response) {
        const { id_sucursal, id_regimen, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_sucursal = $1 AND r.id = $2 AND tc.id = $3',
            [id_sucursal, id_regimen, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoDepartamento(req: Request, res: Response) {
        const { id } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND c.id_departamento = $1', [id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoDepaCargo(req: Request, res: Response) {
        const { id_departamento, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_departamento = $1 AND tc.id = $2',
            [id_departamento, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoDepaRegimen(req: Request, res: Response) {
        const { id_departamento, id_regimen } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_departamento = $1 AND r.id = $2',
            [id_departamento, id_regimen]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoDepaRegimenCargo(req: Request, res: Response) {
        const { id_departamento, id_regimen, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'c.id_departamento = $1 AND r.id = $2 AND tc.id = $3',
            [id_departamento, id_regimen, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoRegimen(req: Request, res: Response) {
        const { id } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND r.id = $1', [id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoRegimenCargo(req: Request, res: Response) {
        const { id_regimen, id_cargo } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND ' +
            'r.id = $1 AND tc.id = $2',
            [id_regimen, id_cargo]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    public async ListarEmpleadoCargo(req: Request, res: Response) {
        const { id } = req.params;
        const DATOS = await pool.query('SELECT e_datos.id, e_datos.cedula, e_datos.apellido, e_datos.nombre, ' +
            'e_datos.esta_civil, e_datos.genero, e_datos.correo, e_datos.fec_nacimiento, e_datos.estado, ' +
            'e_datos.mail_alternativo, e_datos.domicilio, e_datos.telefono, e_datos.id_nacionalidad, ' +
            'e_datos.imagen, e_datos.codigo, e_datos.id_contrato, r.id AS id_regimen, r.descripcion AS regimen, ' +
            'e_datos.id_cargo, tc.id AS id_tipo_cargo, tc.cargo, c.id_departamento, d.nombre AS departamento, ' +
            'c.id_sucursal, s.nombre AS sucursal, s.id_empresa, empre.nombre AS empresa, s.id_ciudad, ' +
            'ciudades.descripcion AS ciudad ' +
            'FROM datos_actuales_empleado AS e_datos, empl_cargos AS c, cg_departamentos AS d, sucursales AS s, ' +
            'cg_empresa AS empre, ciudades, cg_regimenes AS r, tipo_cargo AS tc, empl_contratos AS co ' +
            'WHERE c.id = e_datos.id_cargo AND d.id = c.id_departamento AND s.id = c.id_sucursal AND ' +
            's.id_empresa = empre.id AND ciudades.id = s.id_ciudad AND c.cargo = tc.id AND ' +
            'e_datos.id_contrato = co.id AND co.id_regimen = r.id AND tc.id = $1', [id]);
        if (DATOS.rowCount > 0) {
            return res.jsonp(DATOS.rows)
        }
        else {
            return res.status(404).jsonp({ text: 'error' });
        }
    }

    /** FIN DE CONSULTAS PARA FILTRAR INFORMACIÓN */

}

const DATOS_GENERALES_CONTROLADOR = new DatosGeneralesControlador();

export default DATOS_GENERALES_CONTROLADOR;


