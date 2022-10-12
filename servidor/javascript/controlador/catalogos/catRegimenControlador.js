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
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../../database"));
const builder = require('xmlbuilder');
class RegimenControlador {
    // REGISTRO DE REGIMEN LABORAL
    CrearRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario, dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion, anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes, dias_totales_anio } = req.body;
                yield database_1.default.query(`
                INSERT INTO cg_regimenes 
                    (descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                    dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion, 
                    anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes, 
                    dias_totales_anio)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                    dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
                    anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
                    dias_totales_anio]);
                res.jsonp({ message: 'Regimen guardado' });
            }
            catch (error) {
                return res.jsonp({ message: 'error' });
            }
        });
    }
    // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
    ActualizarRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario, dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion, anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes, dias_totales_anio, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_regimenes SET descripcion = $1, meses_periodo = $2, dias_per_vacacion_laboral = $3,
            dias_per_vacacion_calendario = $4, dias_mes_vacacion_laboral = $5,
            dias_mes_vacacion_calendario = $6, dias_libre_vacacion = $7, anio_antiguedad = $8,
            dia_incr_antiguedad = $9, max_dia_acumulacion = $10, dias_totales_mes = $11, 
            dias_totales_anio = $12 WHERE id = $13
            `, [descripcion, meses_periodo, dias_per_vacacion_laboral, dias_per_vacacion_calendario,
                dias_mes_vacacion_laboral, dias_mes_vacacion_calendario, dias_libre_vacacion,
                anio_antiguedad, dia_incr_antiguedad, max_dia_acumulacion, dias_totales_mes,
                dias_totales_anio, id]);
            res.jsonp({ message: 'Regimen guardado' });
        });
    }
    // METODO PARA BUSCAR LISTA DE REGIMEN
    ListarRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const REGIMEN = yield database_1.default.query(`
            SELECT * FROM cg_regimenes ORDER BY descripcion ASC
            `);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarUnRegimen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const REGIMEN = yield database_1.default.query('SELECT * FROM cg_regimenes WHERE id = $1', [id]);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "RegimenLaboral-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_regimenes WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    ListarRegimenSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const REGIMEN = yield database_1.default.query(' SELECT r.id, r.descripcion FROM cg_regimenes AS r, empl_cargos AS ec, ' +
                'empl_contratos AS c WHERE c.id_regimen = r.id AND c.id = ec.id_empl_contrato AND ec.id_sucursal = $1 ' +
                'GROUP BY r.id, r.descripcion', [id]);
            if (REGIMEN.rowCount > 0) {
                return res.jsonp(REGIMEN.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
}
const REGIMEN_CONTROLADOR = new RegimenControlador();
exports.default = REGIMEN_CONTROLADOR;
