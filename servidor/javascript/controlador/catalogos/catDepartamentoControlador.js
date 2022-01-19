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
exports.DEPARTAMENTO_CONTROLADOR = void 0;
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
class DepartamentoControlador {
    ListarDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM VistaDepartamentoPadre ORDER BY nombre ASC');
            // const Con_depa_padre = await pool.query('SELECT d.id, d.nombre, d.nivel, nom_d.nombre AS departamento_padre, d.id_sucursal, s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa FROM cg_departamentos AS d, nombredepartamento AS nom_d, sucursales AS s, cg_empresa AS e WHERE d.depa_padre = nom_d.id AND d.id_sucursal = s.id AND e.id = s.id_empresa ORDER BY nombre ASC');
            // const Sin_depa_padre = await pool.query('SELECT d.id, d.nombre, d.nivel, d.depa_padre AS departamento_padre, d.id_sucursal, s.nombre AS nomsucursal, e.id AS id_empresa, e.nombre AS nomempresa FROM cg_departamentos AS d, sucursales AS s, cg_empresa AS e WHERE d.id_sucursal = s.id AND e.id = s.id_empresa AND d.depa_padre IS NULL ORDER BY nombre ASC');
            // if (Sin_depa_padre.rowCount > 0) {
            //   Sin_depa_padre.rows.forEach(obj => {
            //     Con_depa_padre.rows.push(obj);
            //   })
            //   res.jsonp(Con_depa_padre.rows);
            // }
            if (DEPARTAMENTOS.rowCount > 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarNombreDepartamentos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM cg_departamentos');
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarIdDepartamentoNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE nombre = $1', [nombre]);
            if (DEPARTAMENTOS.rowCount > 0) {
                return res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerIdDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const DEPARTAMENTO = yield database_1.default.query('SELECT id FROM cg_departamentos WHERE nombre = $1', [nombre]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    ObtenerUnDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const DEPARTAMENTO = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE id = $1', [id]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows[0]);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    ObtenerDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_sucursal } = req.params;
            const DEPARTAMENTO = yield database_1.default.query('SELECT * FROM cg_departamentos WHERE NOT UPPER(nombre) = \'NINGUNO\' AND id_sucursal = $1', [id_sucursal]);
            if (DEPARTAMENTO.rowCount > 0) {
                return res.jsonp(DEPARTAMENTO.rows);
            }
            res.status(404).jsonp({ text: 'El departamento no ha sido encontrado' });
        });
    }
    CrearDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, depa_padre, nivel, id_sucursal } = req.body;
                yield database_1.default.query('INSERT INTO cg_departamentos (nombre, depa_padre, nivel, id_sucursal ) VALUES ($1, $2, $3, $4)', [nombre, depa_padre, nivel, id_sucursal]);
                res.jsonp({ message: 'El departamento ha sido guardado con éxito' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    ActualizarDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre, depa_padre, nivel, id_sucursal } = req.body;
                const id = req.params.id;
                console.log(id);
                yield database_1.default.query('UPDATE cg_departamentos set nombre = $1, depa_padre = $2, nivel = $3 , id_sucursal = $4 WHERE id = $5', [nombre, depa_padre, nivel, id_sucursal, id]);
                res.jsonp({ message: 'El departamento ha sido modificado con éxito' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Departamentos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Archivo guardado");
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor\\xmlDownload\\${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    BuscarDepartamentoPorCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_cargo;
            const departamento = yield database_1.default.query('SELECT ec.id_departamento, d.nombre, ec.id AS cargo ' +
                'FROM empl_cargos AS ec, cg_departamentos AS d WHERE d.id = ec.id_departamento AND ec.id = $1 ' +
                'ORDER BY cargo DESC', [id]);
            if (departamento.rowCount > 0) {
                return res.json([departamento.rows[0]]);
            }
            else {
                return res.status(404).json({ text: 'No se encuentran registros' });
            }
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_departamentos WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    ListarDepartamentosSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_sucursal;
            const DEPARTAMENTOS = yield database_1.default.query('SELECT * FROM VistaDepartamentoPadre WHERE id_sucursal = $1 ORDER BY nombre ASC', [id]);
            if (DEPARTAMENTOS.rowCount > 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarDepartamentosRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const DEPARTAMENTOS = yield database_1.default.query('SELECT d.id, d.nombre FROM cg_regimenes AS r, empl_cargos AS ec, ' +
                'empl_contratos AS c, cg_departamentos AS d WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ' +
                'ec.id_departamento = d.id AND r.id = $1 GROUP BY d.id, d.nombre', [id]);
            if (DEPARTAMENTOS.rowCount > 0) {
                res.jsonp(DEPARTAMENTOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.DEPARTAMENTO_CONTROLADOR = new DepartamentoControlador();
exports.default = exports.DEPARTAMENTO_CONTROLADOR;
