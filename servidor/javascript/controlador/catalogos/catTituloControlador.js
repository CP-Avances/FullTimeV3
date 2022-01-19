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
exports.TITULO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class TituloControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query('SELECT ct.id, ct.nombre, nt.nombre as nivel FROM cg_titulos AS ct, nivel_titulo AS nt WHERE ct.id_nivel = nt.id ORDER BY ct.nombre ASC');
            res.jsonp(titulo.rows);
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unTitulo = yield database_1.default.query('SELECT * FROM cg_titulos WHERE id = $1', [id]);
            if (unTitulo.rowCount > 0) {
                return res.jsonp(unTitulo.rows);
            }
            res.status(404).jsonp({ text: 'El empleado no ha sido encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_nivel } = req.body;
            yield database_1.default.query('INSERT INTO cg_titulos ( nombre, id_nivel ) VALUES ($1, $2)', [nombre, id_nivel]);
            console.log(req.body);
            res.jsonp({ message: 'Título guardado' });
        });
    }
    ActualizarTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_nivel, id } = req.body;
            yield database_1.default.query('UPDATE cg_titulos SET nombre = $1, id_nivel = $2 WHERE id = $3', [nombre, id_nivel, id]);
            res.jsonp({ message: 'Título actualizado exitosamente' });
        });
    }
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query('DELETE FROM cg_titulos WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Titulos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
}
exports.TITULO_CONTROLADOR = new TituloControlador();
exports.default = exports.TITULO_CONTROLADOR;
