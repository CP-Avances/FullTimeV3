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
exports.VACUNAS_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../../database"));
class VacunasControlador {
    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    ListarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query('SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna_1, ' +
                'ev.id_tipo_vacuna_2, ev.id_tipo_vacuna_3, ev.carnet, ev.nom_carnet, ev.dosis_1, ev.dosis_2, ' +
                'ev.dosis_3, ev.fecha_1, ev.fecha_2, ev.fecha_3 FROM empl_vacuna AS ev ORDER BY ev.id ASC');
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    ListarUnRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACUNA = yield database_1.default.query('SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna_1, ' +
                'ev.id_tipo_vacuna_2, ev.id_tipo_vacuna_3, ev.carnet, ev.nom_carnet, ev.dosis_1, ev.dosis_2, ' +
                'ev.dosis_3, ev.fecha_1, ev.fecha_2, ev.fecha_3 FROM empl_vacuna AS ev WHERE ev.id_empleado = $1 ' +
                'ORDER BY ev.id DESC', [id_empleado]);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // CREAR REGISTRO DE VACUNACIÓN
    CrearRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, dosis_1, dosis_2, dosis_3, fecha_1, fecha_2, fecha_3, nom_carnet, id_tipo_vacuna_1, id_tipo_vacuna_2, id_tipo_vacuna_3 } = req.body;
            yield database_1.default.query('INSERT INTO empl_vacuna ( id_empleado, dosis_1, dosis_2, dosis_3, fecha_1, ' +
                'fecha_2, fecha_3, nom_carnet, id_tipo_vacuna_1, id_tipo_vacuna_2, id_tipo_vacuna_3) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [id_empleado, dosis_1, dosis_2, dosis_3, fecha_1, fecha_2, fecha_3, nom_carnet, id_tipo_vacuna_1,
                id_tipo_vacuna_2, id_tipo_vacuna_3]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // ACTUALIZAR REGISTRO DE VACUNACIÓN
    ActualizarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { dosis_1, dosis_2, dosis_3, fecha_1, fecha_2, fecha_3, nom_carnet, id_tipo_vacuna_1, id_tipo_vacuna_2, id_tipo_vacuna_3 } = req.body;
            yield database_1.default.query('UPDATE empl_vacuna SET dosis_1 = $1, dosis_2 = $2, dosis_3 = $3, ' +
                'fecha_1 = $4, fecha_2 = $5, fecha_3 = $6, nom_carnet = $7, id_tipo_vacuna_1 = $8, ' +
                'id_tipo_vacuna_2 = $9, id_tipo_vacuna_3 = $10 WHERE id = $11', [dosis_1, dosis_2, dosis_3, fecha_1, fecha_2, fecha_3, nom_carnet, id_tipo_vacuna_1,
                id_tipo_vacuna_2, id_tipo_vacuna_3, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // OBTENER EL ULTIMO REGISTRO DE TIPO VACUNA
    ObtenerUltimoIdVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query('SELECT MAX(id) FROM empl_vacuna');
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // ELIMINAR REGISTRO DE VACUNACIÓN
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query('DELETE FROM empl_vacuna WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACIÓN
    GuardarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let documento = list.uploads[0].path.split("\\")[1];
            let id = req.params.id;
            yield database_1.default.query('UPDATE empl_vacuna SET carnet = $2 WHERE id = $1', [id, documento]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // OBTENER CERTIFICADO DE VACUNACIÓN
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\carnetVacuna\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    /** ****************************************************************************************  *
     *                                      TIPO DE VACUNA                                        *
     *  ***************************************************************************************** */
    // LISTAR REGISTRO TIPO DE VACUNA
    ListarTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query('SELECT * FROM tipo_vacuna');
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // CREAR REGISTRO DE TIPO DE VACUNA
    CrearTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre } = req.body;
                yield database_1.default.query('INSERT INTO tipo_vacuna (nombre) VALUES ($1)', [nombre]);
                res.jsonp({ message: 'Registro guardado.' });
            }
            catch (error) {
                res.jsonp({ message: 'error' });
            }
        });
    }
}
exports.VACUNAS_CONTROLADOR = new VacunasControlador();
exports.default = exports.VACUNAS_CONTROLADOR;
