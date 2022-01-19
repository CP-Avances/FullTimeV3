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
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class AutorizaDepartamentoControlador {
    ListarAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const AUTORIZA = yield database_1.default.query('SELECT * FROM depa_autorizaciones');
            if (AUTORIZA.rowCount > 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_empl_cargo, estado } = req.body;
            yield database_1.default.query('INSERT INTO depa_autorizaciones (id_departamento, id_empl_cargo, estado) VALUES ($1, $2, $3)', [id_departamento, id_empl_cargo, estado]);
            res.jsonp({ message: 'Autorización se registró con éxito' });
        });
    }
    EncontrarAutorizacionCargo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empl_cargo } = req.params;
            const AUTORIZA = yield database_1.default.query('SELECT * FROM VistaDepartamentoAutoriza WHERE id_empl_cargo= $1', [id_empl_cargo]);
            if (AUTORIZA.rowCount > 0) {
                return res.jsonp(AUTORIZA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerQuienesAutorizan(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_depar } = req.params;
            const EMPLEADOS = yield database_1.default.query('SELECT * FROM VistaAutorizanCargo WHERE id_depar = $1', [id_depar]);
            if (EMPLEADOS.rowCount > 0) {
                return res.jsonp(EMPLEADOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registros no encontrados' });
            }
        });
    }
    ActualizarAutorizaDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_departamento, id_empl_cargo, estado, id } = req.body;
            yield database_1.default.query('UPDATE depa_autorizaciones SET id_departamento = $1, id_empl_cargo = $2, estado = $3 WHERE id = $4', [id_departamento, id_empl_cargo, estado, id]);
            res.jsonp({ message: 'Autorización se registró con éxito' });
        });
    }
    EliminarAutorizacionDepartamento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM depa_autorizaciones WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
}
exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR = new AutorizaDepartamentoControlador();
exports.default = exports.AUTORIZA_DEPARTAMENTO_CONTROLADOR;
