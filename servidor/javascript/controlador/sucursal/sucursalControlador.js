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
exports.SUCURSAL_CONTROLADOR = void 0;
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
const database_1 = __importDefault(require("../../database"));
class SucursalControlador {
    ListarSucursalesRegistro(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query('SELECT * FROM sucursales');
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSucursalesActualizar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const SUCURSAL = yield database_1.default.query('SELECT * FROM sucursales WHERE NOT id = $1', [id]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ListarSucursales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query('SELECT * FROM NombreCiudadEmpresa ORDER BY nomempresa');
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerUnaSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const SUCURSAL = yield database_1.default.query('SELECT * FROM NombreCiudadEmpresa WHERE id = $1', [id]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ObtenerSucursalEmpresa(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empresa } = req.params;
            const SUCURSAL = yield database_1.default.query('SELECT * FROM sucursales WHERE id_empresa = $1', [id_empresa]);
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    CrearSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id_empresa } = req.body;
            yield database_1.default.query('INSERT INTO sucursales (nombre, id_ciudad, id_empresa) VALUES ($1, $2, $3)', [nombre, id_ciudad, id_empresa]);
            res.jsonp({ message: 'Sucursal ha sido guardado con éxito' });
        });
    }
    ObtenerUltimoId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const SUCURSAL = yield database_1.default.query('SELECT MAX(id) FROM sucursales');
            if (SUCURSAL.rowCount > 0) {
                return res.jsonp(SUCURSAL.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    ActualizarSucursal(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, id_ciudad, id_empresa, id } = req.body;
            yield database_1.default.query('UPDATE sucursales SET nombre = $1, id_ciudad = $2, id_empresa = $3 WHERE id = $4', [nombre, id_ciudad, id_empresa, id]);
            res.jsonp({ message: 'Sucursal actualizada exitosamente' });
        });
    }
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            console.log(req.body.userName);
            let filename = "Sucursales-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
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
            yield database_1.default.query('DELETE FROM sucursales WHERE id = $1', [id]);
            res.jsonp({ message: 'Registro eliminado' });
        });
    }
}
exports.SUCURSAL_CONTROLADOR = new SucursalControlador();
exports.default = exports.SUCURSAL_CONTROLADOR;
