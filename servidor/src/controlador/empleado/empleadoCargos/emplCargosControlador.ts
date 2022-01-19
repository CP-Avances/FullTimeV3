import { Request, Response } from 'express';
import pool from '../../../database';

class EmpleadoCargosControlador {
  public async list(req: Request, res: Response) {
    const Cargos = await pool.query('SELECT * FROM empl_cargos');
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListarCargoEmpleado(req: Request, res: Response) {
    const empleadoCargos = await pool.query('SELECT cg.nombre AS departamento, s.nombre AS sucursal, ecr.id AS cargo, e.id AS empleado, e.nombre, e.apellido FROM depa_autorizaciones AS da, empl_cargos AS ecr, cg_departamentos AS cg, sucursales AS s, empl_contratos AS ecn, empleados AS e WHERE da.id_empl_cargo = ecr.id AND da.id_departamento = cg.id AND cg.id_sucursal = s.id AND ecr.id_empl_contrato = ecn.id AND ecn.id_empleado = e.id ORDER BY nombre ASC');
    if (empleadoCargos.rowCount > 0) {
      return res.jsonp(empleadoCargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async ListarEmpleadoAutoriza(req: Request, res: Response) {
    const { id } = req.params;
    const empleadoCargos = await pool.query('SELECT * FROM Lista_empleados_autoriza WHERE id_notificacion = $1', [id]);
    if (empleadoCargos.rowCount > 0) {
      return res.jsonp(empleadoCargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async getOne(req: Request, res: Response): Promise<any> {
    const { id } = req.params;
    const unEmplCargp = await pool.query('SELECT ec.id, ec.id_empl_contrato, ec.cargo, ec.fec_inicio, ec.fec_final, ec.sueldo, ec.hora_trabaja, ec.id_sucursal, s.nombre AS sucursal, d.id AS id_departamento, d.nombre AS departamento, e.id AS id_empresa, e.nombre AS empresa FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d, cg_empresa AS e WHERE ec.id = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id AND s.id_empresa = e.id ORDER BY ec.id', [id]);
    if (unEmplCargp.rowCount > 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Cargo del empleado no encontrado' });
    }

  }

  public async Crear(req: Request, res: Response): Promise<void> {
    const { id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo } = req.body;
    await pool.query('INSERT INTO empl_cargos ( id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id_empl_contrato, id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo]);
    console.log(req.body);
    res.jsonp({ message: 'Cargo empleado guardado' });
  }

  public async EncontrarIdCargo(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query('SELECT ec.id FROM empl_cargos AS ec, empl_contratos AS ce, empleados AS e WHERE ce.id_empleado = e.id AND ec.id_empl_contrato = ce.id AND e.id = $1', [id_empleado]);
    if (CARGO.rowCount > 0) {
      return res.jsonp(CARGO.rows)
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async EncontrarIdCargoActual(req: Request, res: Response): Promise<any> {
    const { id_empleado } = req.params;
    const CARGO = await pool.query('SELECT MAX(e_cargo.id), e_cargo.hora_trabaja FROM empl_cargos AS e_cargo, empl_contratos AS contrato_e, empleados AS e WHERE contrato_e.id_empleado = e.id AND e_cargo.id_empl_contrato = contrato_e.id AND e.id = $1 GROUP BY e_cargo.id', [id_empleado]);
    if (CARGO.rowCount > 0) {
      if (CARGO.rows[0]['max'] != null) {
        return res.jsonp(CARGO.rows)
      }
      else {
        return res.status(404).jsonp({ text: 'Registro no encontrado' });
      }
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async EncontrarInfoCargoEmpleado(req: Request, res: Response): Promise<any> {
    const { id_empl_contrato } = req.params;
    const unEmplCargp = await pool.query('SELECT ec.id, ec.cargo, ec.fec_inicio, ec.fec_final, ec.sueldo, ec.hora_trabaja, s.nombre AS sucursal, d.nombre AS departamento FROM empl_cargos AS ec, sucursales AS s, cg_departamentos AS d WHERE ec.id_empl_contrato = $1 AND ec.id_sucursal = s.id AND ec.id_departamento = d.id', [id_empl_contrato]);
    if (unEmplCargp.rowCount > 0) {
      return res.jsonp(unEmplCargp.rows)
    }
    else {
      return res.status(404).jsonp({ message: 'error' });
    }

  }

  public async EditarCargo(req: Request, res: Response): Promise<any> {
    const { id_empl_contrato, id } = req.params;
    const { id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo } = req.body;

    await pool.query('UPDATE empl_cargos SET id_departamento = $1, fec_inicio = $2, fec_final = $3, id_sucursal = $4, sueldo = $5, hora_trabaja = $6, cargo = $7  WHERE id_empl_contrato = $8 AND id = $9', [id_departamento, fec_inicio, fec_final, id_sucursal, sueldo, hora_trabaja, cargo, id_empl_contrato, id]);
    res.jsonp({ message: 'Cargo del empleado actualizado exitosamente' });
  }

  // CREAR TIPO DE CARGO

  public async CrearTipoCargo(req: Request, res: Response): Promise<void> {
    const { cargo } = req.body;
    await pool.query('INSERT INTO tipo_cargo (cargo) VALUES ($1)', [cargo]);
    console.log(req.body);
    res.jsonp({ message: 'Cargo empleado guardado' });
  }

  public async ListarTiposCargo(req: Request, res: Response) {
    const Cargos = await pool.query('SELECT *FROM tipo_cargo');
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarUltimoTipo(req: Request, res: Response) {
    const Cargos = await pool.query('SELECT MAX(id) FROM tipo_cargo');
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarUnTipo(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT *FROM tipo_cargo WHERE id = $1', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoDepartamento(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
      'WHERE tc.id = ec.cargo AND id_departamento = $1 GROUP BY tc.cargo, tc.id', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoSucursal(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM tipo_cargo AS tc, empl_cargos AS ec ' +
      'WHERE tc.id = ec.cargo AND id_sucursal = $1 GROUP BY tc.cargo, tc.id', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

  public async BuscarTipoRegimen(req: Request, res: Response) {
    const id = req.params.id;
    const Cargos = await pool.query('SELECT tc.id, tc.cargo FROM cg_regimenes AS r, empl_cargos AS ec, ' +
      'empl_contratos AS c, tipo_cargo AS tc WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
      'ec.cargo = tc.id AND r.id = $1 GROUP BY tc.id, tc.cargo', [id]);
    if (Cargos.rowCount > 0) {
      return res.jsonp(Cargos.rows);
    }
    else {
      return res.status(404).jsonp({ text: 'Registro no encontrado' });
    }
  }

}

export const EMPLEADO_CARGO_CONTROLADOR = new EmpleadoCargosControlador();

export default EMPLEADO_CARGO_CONTROLADOR;