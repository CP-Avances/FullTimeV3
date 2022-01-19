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
exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR = void 0;
const database_1 = __importDefault(require("../../database"));
class NotificacionTiempoRealControlador {
    ListarNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const REAL_TIME_NOTIFICACION = yield database_1.default.query('SELECT * FROM realtime_noti ORDER BY id DESC');
            if (REAL_TIME_NOTIFICACION.rowCount > 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ListaPorEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_send;
            const REAL_TIME_NOTIFICACION = yield database_1.default.query('SELECT * FROM realtime_noti WHERE id_send_empl = $1 ORDER BY id DESC', [id]).
                then(result => {
                return result.rows.map(obj => {
                    obj;
                    return obj;
                });
            });
            if (REAL_TIME_NOTIFICACION.length > 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ListaNotificacionesRecibidas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_receive;
            const REAL_TIME_NOTIFICACION = yield database_1.default.query('SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, r.create_at, r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, e.nombre, e.apellido FROM realtime_noti AS r, empleados AS e WHERE r.id_receives_empl = $1 AND e.id = r.id_send_empl ORDER BY id DESC', [id])
                .then(result => {
                return result.rows.map(obj => {
                    console.log(obj);
                    return {
                        id: obj.id,
                        id_send_empl: obj.id_send_empl,
                        id_receives_empl: obj.id_receives_empl,
                        id_receives_depa: obj.id_receives_depa,
                        estado: obj.estado,
                        create_at: obj.create_at,
                        id_permiso: obj.id_permiso,
                        id_vacaciones: obj.id_vacaciones,
                        id_hora_extra: obj.id_hora_extra,
                        visto: obj.visto,
                        empleado: obj.nombre + ' ' + obj.apellido
                    };
                });
            });
            if (REAL_TIME_NOTIFICACION.length > 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    ListaPorJefe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id_receive;
            console.log(id);
            if (id != 'NaN') {
                const REAL_TIME_NOTIFICACION = yield database_1.default.query('SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, r.create_at, r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, e.nombre, e.apellido FROM realtime_noti AS r, empleados AS e WHERE r.id_receives_empl = $1 AND e.id = r.id_send_empl ORDER BY id DESC LIMIT 5', [id]);
                if (REAL_TIME_NOTIFICACION.rowCount > 0) {
                    return res.jsonp(REAL_TIME_NOTIFICACION.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrado' });
                }
            }
            else {
                return res.status(404).jsonp({ message: 'sin registros' });
            }
        });
    }
    ObtenerUnaNotificacion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const REAL_TIME_NOTIFICACION_VACACIONES = yield database_1.default.query('SELECT r.id, r.id_send_empl, r.id_receives_empl, r.id_receives_depa, r.estado, r.create_at, r.id_permiso, r.id_vacaciones, r.id_hora_extra, r.visto, e.nombre, e.apellido FROM realtime_noti AS r, empleados AS e WHERE r.id = $1 AND e.id = r.id_send_empl', [id]);
            if (REAL_TIME_NOTIFICACION_VACACIONES.rowCount > 0) {
                return res.jsonp(REAL_TIME_NOTIFICACION_VACACIONES.rows);
            }
            else {
                return res.status(404).jsonp({ text: 'Registro no encontrado' });
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones, id_hora_extra } = req.body;
            yield database_1.default.query('INSERT INTO realtime_noti ( id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones, id_hora_extra ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id_send_empl, id_receives_empl, id_receives_depa, estado, create_at, id_permiso, id_vacaciones, id_hora_extra]);
            const REAL_TIME_NOTIFICACION = yield database_1.default.query('SELECT id FROM realtime_noti ORDER BY id DESC LIMIT 1');
            res.jsonp({ message: 'Notificacion guardada', _id: REAL_TIME_NOTIFICACION.rows[0].id });
        });
    }
    ActualizarVista(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            const { visto } = req.body;
            yield database_1.default.query('UPDATE realtime_noti SET visto = $1 WHERE id = $2', [visto, id]);
            res.jsonp({ message: 'Vista modificado' });
        });
    }
    EliminarMultiplesNotificaciones(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const arrayIdsRealtimeNotificaciones = req.body;
            console.log(arrayIdsRealtimeNotificaciones);
            if (arrayIdsRealtimeNotificaciones.length > 0) {
                arrayIdsRealtimeNotificaciones.forEach((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield database_1.default.query('DELETE FROM realtime_noti WHERE id = $1', [obj])
                        .then(result => {
                        console.log(result.command, 'REALTIME ELIMINADO ====>', obj);
                    });
                }));
                return res.jsonp({ message: 'Todos las notificaciones seleccionadas han sido eliminadas' });
            }
            return res.jsonp({ message: 'No seleccionó ninguna notificación' });
        });
    }
    /*
      METODOS PARA LA TABLA DE CONFIG_NOTI
    */
    CrearConfiguracion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id_empleado, vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti } = req.body;
            yield database_1.default.query('INSERT INTO config_noti ( id_empleado, vaca_mail, vaca_noti, permiso_mail, ' +
                'permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [id_empleado, vaca_mail, vaca_noti, permiso_mail,
                permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti]);
            res.jsonp({ message: 'Configuracion guardada' });
        });
    }
    ObtenerConfigEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_empleado = req.params.id;
            console.log(id_empleado);
            if (id_empleado != 'NaN') {
                const CONFIG_NOTI = yield database_1.default.query('SELECT * FROM config_noti WHERE id_empleado = $1', [id_empleado]);
                if (CONFIG_NOTI.rowCount > 0) {
                    return res.jsonp(CONFIG_NOTI.rows);
                }
                else {
                    return res.status(404).jsonp({ text: 'Registro no encontrado' });
                }
            }
            else {
                res.status(404).jsonp({ text: 'Sin registros encontrado' });
            }
        });
    }
    ActualizarConfigEmpleado(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti, comida_mail, comida_noti } = req.body;
            const id_empleado = req.params.id;
            yield database_1.default.query('UPDATE config_noti SET vaca_mail = $1, vaca_noti = $2, permiso_mail = $3, ' +
                'permiso_noti = $4, hora_extra_mail = $5, hora_extra_noti = $6, comida_mail = $7, comida_noti = $8 ' +
                'WHERE id_empleado = $9', [vaca_mail, vaca_noti, permiso_mail, permiso_noti, hora_extra_mail, hora_extra_noti,
                comida_mail, comida_noti, id_empleado]);
            res.jsonp({ message: 'Configuración Actualizada' });
        });
    }
}
exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR = new NotificacionTiempoRealControlador();
exports.default = exports.NOTIFICACION_TIEMPO_REAL_CONTROLADOR;
