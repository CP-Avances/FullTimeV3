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
    // CREAR REGISTRO DE VACUNACIÓN
    CrearRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, nom_carnet } = req.body;
            const response = yield database_1.default.query(`
            INSERT INTO empl_vacunas (id_empleado, descripcion, fecha, id_tipo_vacuna, nom_carnet) 
            VALUES ($1, $2, $3, $4, $5) RETURNING *
            `, [id_empleado, descripcion, fecha, id_tipo_vacuna, nom_carnet]);
            const [vacuna] = response.rows;
            if (vacuna) {
                return res.status(200).jsonp(vacuna);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // REGISTRO DE CERTIFICADO O CARNET DE VACUNACIÓN
    GuardarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let documento = list.uploads[0].path.split("\\")[1];
            let id = req.params.id;
            yield database_1.default.query('UPDATE empl_vacunas SET carnet = $2 WHERE id = $1', [id, documento]);
            res.jsonp({ message: 'Registro guardado.' });
        });
    }
    // LISTAR REGISTROS DE VACUNACIÓN DEL EMPLEADO POR SU ID
    ListarUnRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado } = req.params;
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.nom_carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id AND ev.id_empleado = $1
            ORDER BY ev.id DESC
            `, [id_empleado]);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // LISTAR TODOS LOS REGISTROS DE VACUNACIÓN
    ListarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`
            SELECT ev.id, ev.id_empleado, ev.id_tipo_vacuna, ev.carnet, ev.nom_carnet, ev.fecha, 
            tv.nombre, ev.descripcion
            FROM empl_vacunas AS ev, tipo_vacuna AS tv 
            WHERE ev.id_tipo_vacuna = tv.id
            ORDER BY ev.id DESC
            `);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE VACUNACIÓN
    ActualizarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { id_empleado, descripcion, fecha, id_tipo_vacuna, nom_carnet } = req.body;
            yield database_1.default.query(`
            UPDATE empl_vacunas SET id_empleado = $1, descripcion = $2, fecha = $3, 
            id_tipo_vacuna = $4, nom_carnet = $5 WHERE id = $6
            `, [id_empleado, descripcion, fecha, id_tipo_vacuna, nom_carnet, id]);
            res.jsonp({ message: 'Registro actualizado.' });
        });
    }
    // ELIMINAR REGISTRO DE VACUNACIÓN
    EliminarRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            yield database_1.default.query(`
            DELETE FROM empl_vacunas WHERE id = $1
            `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
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
    /** **************************************************************************************** **
     ** **                       METODOS DE REGISTRO DE TIPO DE VACUNA                        ** **
     ** **************************************************************************************** **/
    // CREAR REGISTRO DE TIPO DE VACUNA
    CrearTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nombre } = req.body;
                const response = yield database_1.default.query(`
                INSERT INTO tipo_vacuna (nombre) VALUES ($1) RETURNING *
                `, [nombre]);
                const [vacunas] = response.rows;
                if (vacunas) {
                    return res.status(200).jsonp(vacunas);
                }
                else {
                    return res.status(404).jsonp({ message: 'error' });
                }
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // LISTAR REGISTRO TIPO DE VACUNA
    ListarTipoVacuna(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const VACUNA = yield database_1.default.query(`SELECT * FROM tipo_vacuna`);
            if (VACUNA.rowCount > 0) {
                return res.jsonp(VACUNA.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado.' });
            }
        });
    }
}
exports.VACUNAS_CONTROLADOR = new VacunasControlador();
exports.default = exports.VACUNAS_CONTROLADOR;
