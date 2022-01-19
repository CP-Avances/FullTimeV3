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
exports.NIVEL_TITULO_CONTROLADOR = void 0;
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
const fs_1 = __importDefault(require("fs"));
class NivelTituloControlador {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const titulo = yield database_1.default.query('SELECT * FROM nivel_titulo ORDER BY nombre ASC');
            if (titulo.rowCount > 0) {
                return res.jsonp(titulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    getOne(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const unNivelTitulo = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE id = $1', [id]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            else {
                res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ObtenerNivelNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.params;
            const unNivelTitulo = yield database_1.default.query('SELECT * FROM nivel_titulo WHERE nombre = $1', [nombre]);
            if (unNivelTitulo.rowCount > 0) {
                return res.jsonp(unNivelTitulo.rows);
            }
            res.status(404).jsonp({ text: 'Registro no encontrado' });
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre } = req.body;
            yield database_1.default.query('INSERT INTO nivel_titulo ( nombre ) VALUES ($1)', [nombre]);
            res.jsonp({ message: 'Nivel del Titulo guardado' });
        });
    }
    ActualizarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id } = req.body;
            yield database_1.default.query('UPDATE nivel_titulo SET nombre = $1 WHERE id = $2', [nombre, id]);
            res.jsonp({ message: 'Nivel de Título actualizado exitosamente' });
        });
    }
    EliminarNivelTitulo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            console.log(id);
            yield database_1.default.query('DELETE FROM nivel_titulo WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
    ObtenerUltimoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const ultimoRegistro = yield database_1.default.query('SELECT MAX(id) FROM nivel_titulo');
            if (ultimoRegistro.rowCount > 0) {
                return res.jsonp(ultimoRegistro.rows);
            }
            else {
                return res.jsonp({ message: 'Registro no encontrado' });
            }
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "NvelTitulos-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
exports.NIVEL_TITULO_CONTROLADOR = new NivelTituloControlador();
exports.default = exports.NIVEL_TITULO_CONTROLADOR;
