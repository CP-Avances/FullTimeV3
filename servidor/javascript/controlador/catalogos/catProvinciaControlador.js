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
exports.PROVINCIA_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class ProvinciaControlador {
    ListarProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PROVINCIA = yield database_1.default.query('SELECT *FROM VistaNombrePais ORDER BY pais, nombre ASC');
            if (PROVINCIA.rowCount > 0) {
                return res.jsonp(PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarContinentes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const CONTINENTE = yield database_1.default.query('SELECT continente FROM cg_paises GROUP BY continente ORDER BY continente ASC');
            if (CONTINENTE.rowCount > 0) {
                return res.jsonp(CONTINENTE.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarPaises(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { continente } = req.params;
            const CONTINENTE = yield database_1.default.query('SELECT * FROM cg_paises WHERE continente = $1 ORDER BY nombre ASC', [continente]);
            if (CONTINENTE.rowCount > 0) {
                return res.jsonp(CONTINENTE.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_pais } = req.params;
            const UNA_PROVINCIA = yield database_1.default.query('SELECT * FROM cg_provincias WHERE id_pais = $1', [id_pais]);
            if (UNA_PROVINCIA.rowCount > 0) {
                return res.jsonp(UNA_PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
            }
        });
    }
    ObtenerProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UNA_PROVINCIA = yield database_1.default.query('SELECT * FROM cg_provincias WHERE id = $1', [id]);
            if (UNA_PROVINCIA.rowCount > 0) {
                return res.jsonp(UNA_PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
            }
        });
    }
    ObtenerIdProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const UNA_PROVINCIA = yield database_1.default.query('SELECT * FROM cg_provincias WHERE nombre = $1', [nombre]);
            if (UNA_PROVINCIA.rowCount > 0) {
                return res.jsonp(UNA_PROVINCIA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
            }
        });
    }
    ObtenerPais(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const PAIS = yield database_1.default.query('SELECT * FROM cg_paises WHERE id = $1', [id]);
            if (PAIS.rowCount > 0) {
                return res.jsonp(PAIS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'La provincia no ha sido encontrada' });
            }
        });
    }
    ListarTodoPais(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const PAIS = yield database_1.default.query('SELECT *FROM cg_paises');
            if (PAIS.rowCount > 0) {
                return res.jsonp(PAIS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_pais } = req.body;
            yield database_1.default.query('INSERT INTO cg_provincias (nombre, id_pais) VALUES ($1, $2)', [nombre, id_pais]);
            res.jsonp({ message: 'La provincia ha sido guardada con éxito' });
        });
    }
    EliminarProvincia(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_provincias WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
}
exports.PROVINCIA_CONTROLADOR = new ProvinciaControlador();
exports.default = exports.PROVINCIA_CONTROLADOR;
