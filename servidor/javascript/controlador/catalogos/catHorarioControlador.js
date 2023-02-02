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
exports.HORARIO_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const builder = require('xmlbuilder');
class HorarioControlador {
    // REGISTRAR HORARIO
    CrearHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo } = req.body;
            const response = yield database_1.default.query(`
      INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo,
      nocturno, detalle, codigo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
      `, [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo]);
            const [horario] = response.rows;
            if (horario) {
                return res.status(200).jsonp(horario);
            }
            else {
                return res.status(404).jsonp({ message: 'error' });
            }
        });
    }
    // BUSCAR HORARIOS POR EL NOMBRE
    BuscarHorarioNombre(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nombre, codigo } = req.body;
            try {
                const HORARIOS = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE UPPER(nombre) = $1 OR UPPER(codigo) = $2
        `, [nombre.toUpperCase(), codigo.toUpperCase()]);
                if (HORARIOS.rowCount > 0)
                    return res.status(200).jsonp({ message: 'No se encuentran registros.' });
                return res.status(404).jsonp({ message: 'No existe horario. Continua.' });
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // GUARDAR DOCUMENTO DE HORARIO
    GuardarDocumentoHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let doc = list.uploads[0].path.split("\\")[1];
            let { nombre } = req.params;
            let id = req.params.id;
            yield database_1.default.query(`
      UPDATE cg_horarios SET documento = $2, doc_nombre = $3 WHERE id = $1
      `, [id, doc, nombre]);
            res.jsonp({ message: 'Documento Actualizado' });
        });
    }
    // METODO PARA ACTUALIZAR DATOS DE HORARIO
    EditarHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo } = req.body;
            try {
                const respuesta = yield database_1.default.query(`
        UPDATE cg_horarios SET nombre = $1, min_almuerzo = $2, hora_trabajo = $3,  
        nocturno = $4, detalle = $5, codigo = $6 
        WHERE id = $7 RETURNING *
        `, [nombre, min_almuerzo, hora_trabajo, nocturno, detalle, codigo, id,])
                    .then(result => { return result.rows; });
                if (respuesta.length === 0)
                    return res.status(400).jsonp({ message: 'Horario no Actualizado' });
                return res.status(200).jsonp(respuesta);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // ELIMINAR DOCUMENTO HORARIO BASE DE DATOS - SERVIDOR
    EliminarDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento, id } = req.body;
            yield database_1.default.query(`
            UPDATE cg_horarios SET documento = null, doc_nombre = null WHERE id = $1
            `, [id]);
            if (documento != 'null' && documento != '' && documento != null) {
                let filePath = `servidor\\horarios\\${documento}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
            res.jsonp({ message: 'Documento Actualizado' });
        });
    }
    // ELIMINAR DOCUMENTO HORARIO DEL SERVIDOR
    EliminarDocumentoServidor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let { documento } = req.body;
            if (documento != 'null' && documento != '' && documento != null) {
                let filePath = `servidor\\horarios\\${documento}`;
                let direccionCompleta = __dirname.split("servidor")[0] + filePath;
                fs_1.default.unlinkSync(direccionCompleta);
            }
            res.jsonp({ message: 'Documento Actualizado' });
        });
    }
    // BUSCAR LISTA DE CATALOGO HORARIOS
    ListarHorarios(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const HORARIOS = yield database_1.default.query(`
      SELECT * FROM cg_horarios ORDER BY id
      `);
            if (HORARIOS.rowCount > 0) {
                return res.jsonp(HORARIOS.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'No se encuentran registros' });
            }
        });
    }
    // METODO PARA BUSCAR HORARIOS SIN CONSIDERAR UNO EN ESPECIFICO (METODO DE EDICION)
    BuscarHorarioNombre_(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, nombre, codigo } = req.body;
            try {
                const HORARIOS = yield database_1.default.query(`
        SELECT * FROM cg_horarios WHERE NOT id = $1 AND (UPPER(nombre) = $2 OR UPPER(codigo) = $3)
        `, [parseInt(id), nombre.toUpperCase(), codigo.toUpperCase()]);
                if (HORARIOS.rowCount > 0)
                    return res.status(200).jsonp({ message: 'El nombre de horario ya existe, ingresar un nuevo nombre.' });
                return res.status(404).jsonp({ message: 'No existe horario. Continua.' });
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA ELIMINAR REGISTROS
    EliminarRegistros(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            yield database_1.default.query(`
      DELETE FROM cg_horarios WHERE id = $1
      `, [id]);
            res.jsonp({ message: 'Registro eliminado.' });
        });
    }
    // METODO PARA CREAR ARCHIVO XML
    FileXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var xml = builder.create('root').ele(req.body).end({ pretty: true });
            let filename = "Horarios-" + req.body.userName + '-' + req.body.userId + '-' + new Date().getTime() + '.xml';
            fs_1.default.writeFile(`xmlDownload/${filename}`, xml, function (err) {
            });
            res.jsonp({ text: 'XML creado', name: filename });
        });
    }
    // METODO PARA DESCARGAR ARCHIVO XML
    downloadXML(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = req.params.nameXML;
            let filePath = `servidor/xmlDownload/${name}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    // METODO PARA BUSCAR DATOS DE UN HORARIO
    ObtenerUnHorario(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const UN_HORARIO = yield database_1.default.query(`
      SELECT * FROM cg_horarios WHERE id = $1
      `, [id]);
            if (UN_HORARIO.rowCount > 0) {
                return res.jsonp(UN_HORARIO.rows);
            }
            else {
                res.status(404).jsonp({ text: 'No se encuentran registros.' });
            }
        });
    }
    // METODO PARA EDITAR HORAS TRABAJADAS
    EditarHorasTrabaja(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { hora_trabajo } = req.body;
            try {
                const respuesta = yield database_1.default.query(`
        UPDATE cg_horarios SET hora_trabajo = $1 WHERE id = $2 RETURNING *
        `, [hora_trabajo, id])
                    .then(result => { return result.rows; });
                if (respuesta.length === 0)
                    return res.status(400).jsonp({ message: 'No Actualizado.' });
                return res.status(200).jsonp(respuesta);
            }
            catch (error) {
                return res.status(400).jsonp({ message: error });
            }
        });
    }
    // METODO PARA BUSCAR DOCUMENTO
    ObtenerDocumento(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const docs = req.params.docs;
            let filePath = `servidor\\horarios\\${docs}`;
            res.sendFile(__dirname.split("servidor")[0] + filePath);
        });
    }
    CargarHorarioPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            /** Horarios */
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
                if (minutos_almuerzo != undefined) {
                    yield database_1.default.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
                    res.jsonp({ message: 'correcto' });
                }
                else {
                    minutos_almuerzo = 0;
                    yield database_1.default.query('INSERT INTO cg_horarios (nombre, min_almuerzo, hora_trabajo, nocturno) VALUES ($1, $2, $3, $4)', [nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno]);
                    res.jsonp({ message: 'correcto' });
                }
            }));
            fs_1.default.unlinkSync(filePath);
        });
    }
    /** Verificar si existen datos duplicados dentro del sistema */
    VerificarDatos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames; // Array de hojas de calculo
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            /** Horarios */
            var contarNombre = 0;
            var contarDatos = 0;
            var contador = 1;
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
                // Verificar que los datos obligatorios existan
                if (nombre_horario != undefined && hora_trabajo != undefined && horario_nocturno != undefined) {
                    contarDatos = contarDatos + 1;
                }
                // Verificar que el nombre del horario no se encuentre registrado
                if (nombre_horario != undefined) {
                    const NOMBRES = yield database_1.default.query('SELECT * FROM cg_horarios WHERE UPPER(nombre) = $1', [nombre_horario.toUpperCase()]);
                    if (NOMBRES.rowCount === 0) {
                        contarNombre = contarNombre + 1;
                    }
                }
                // Verificar que todos los datos sean correctos
                if (contador === plantilla.length) {
                    if (contarNombre === plantilla.length && contarDatos === plantilla.length) {
                        return res.jsonp({ message: 'correcto' });
                    }
                    else {
                        return res.jsonp({ message: 'error' });
                    }
                }
                contador = contador + 1;
            }));
            fs_1.default.unlinkSync(filePath);
        });
    }
    /** Verificar que los datos dentro de la plantilla no se encuntren duplicados */
    VerificarPlantilla(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = req.files;
            let cadena = list.uploads[0].path;
            let filename = cadena.split("\\")[1];
            var filePath = `./plantillas/${filename}`;
            const workbook = xlsx_1.default.readFile(filePath);
            const sheet_name_list = workbook.SheetNames;
            const plantilla = xlsx_1.default.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            var contarNombreData = 0;
            var contador_arreglo = 1;
            var arreglos_datos = [];
            //Leer la plantilla para llenar un array con los datos nombre para verificar que no sean duplicados
            plantilla.forEach((data) => __awaiter(this, void 0, void 0, function* () {
                // Datos que se leen de la plantilla ingresada
                var { nombre_horario, minutos_almuerzo, hora_trabajo, horario_nocturno } = data;
                let datos_array = {
                    nombre: nombre_horario,
                };
                arreglos_datos.push(datos_array);
            }));
            // Vamos a verificar dentro de arreglo_datos que no se encuentren datos duplicados
            for (var i = 0; i <= arreglos_datos.length - 1; i++) {
                for (var j = 0; j <= arreglos_datos.length - 1; j++) {
                    if (arreglos_datos[i].nombre.toUpperCase() === arreglos_datos[j].nombre.toUpperCase()) {
                        contarNombreData = contarNombreData + 1;
                    }
                }
                contador_arreglo = contador_arreglo + 1;
            }
            // Cuando todos los datos han sido leidos verificamos si todos los datos son correctos
            console.log('nombre_data', contarNombreData, plantilla.length, contador_arreglo);
            if ((contador_arreglo - 1) === plantilla.length) {
                if (contarNombreData === plantilla.length) {
                    return res.jsonp({ message: 'correcto' });
                }
                else {
                    return res.jsonp({ message: 'error' });
                }
            }
            fs_1.default.unlinkSync(filePath);
        });
    }
}
exports.HORARIO_CONTROLADOR = new HorarioControlador();
exports.default = exports.HORARIO_CONTROLADOR;
