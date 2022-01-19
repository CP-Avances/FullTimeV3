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
exports.DISCAPACIDAD_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class DiscapacidadControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const DISCAPACIDAD = yield database_1.default.query('SELECT * FROM cg_discapacidades');
            if (DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
            }
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const unaDiscapacidad = yield database_1.default.query('SELECT * FROM VistaNombreDiscapacidad WHERE id_empleado = $1', [id_empleado]);
            if (unaDiscapacidad.rowCount > 0) {
                return res.jsonp(unaDiscapacidad.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Discapacidad no encontrada' });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, carn_conadis, porcentaje, tipo } = req.body;
            yield database_1.default.query('INSERT INTO cg_discapacidades ( id_empleado, carn_conadis, porcentaje, tipo) VALUES ($1, $2, $3, $4)', [id_empleado, carn_conadis, porcentaje, tipo]);
            console.log(req.body);
            res.jsonp({ message: 'Discapacidad guardada' });
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id_empleado;
            const { carn_conadis, porcentaje, tipo } = req.body;
            yield database_1.default.query('UPDATE cg_discapacidades SET carn_conadis = $1, porcentaje = $2, tipo = $3 WHERE id_empleado = $4', [carn_conadis, porcentaje, tipo, id_empleado]);
            res.jsonp({ message: 'Discapacidad actualizada exitosamente' });
        });
    }
    deleteDiscapacidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id_empleado;
            yield database_1.default.query('DELETE FROM cg_discapacidades WHERE id_empleado = $1', [id_empleado]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    /* TIPO DISCAPACIDAD */
    ListarTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_DISCAPACIDAD = yield database_1.default.query('SELECT * FROM tipo_discapacidad');
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ObtenerUnTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const TIPO_DISCAPACIDAD = yield database_1.default.query('SELECT * FROM tipo_discapacidad WHERE id = $1', [id]);
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ActualizarTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params;
            const { nombre } = req.body;
            yield database_1.default.query('UPDATE tipo_discapacidad SET nombre = $1 WHERE id = $2', [nombre, id]);
            res.jsonp({ message: 'Tipo de Discapacidad actualizado exitosamente' });
        });
    }
    CrearTipoD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            yield database_1.default.query('INSERT INTO tipo_discapacidad (nombre) VALUES ($1)', [nombre]);
            console.log(req.body);
            res.jsonp({ message: 'Registro guardado' });
        });
    }
    ObtenerUltimoIdTD(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const TIPO_DISCAPACIDAD = yield database_1.default.query('SELECT MAX(id) FROM tipo_discapacidad');
            if (TIPO_DISCAPACIDAD.rowCount > 0) {
                return res.jsonp(TIPO_DISCAPACIDAD.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
exports.DISCAPACIDAD_CONTROLADOR = new DiscapacidadControlador();
exports.default = exports.DISCAPACIDAD_CONTROLADOR;
