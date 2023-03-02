"use strict";
//Conexión con la base de datos PostgreSQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_pool_1 = __importDefault(require("pg-pool"));
const pool = new pg_pool_1.default({
<<<<<<< HEAD
    user: 'fulltime',
    host: '192.168.0.156',
    port: 5432,
    database: 'fulltime_prueba',
    password: 'fulltime'
=======
<<<<<<< HEAD
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'fulltime4.0',
<<<<<<< HEAD
    password: 'Ec170150@'
=======
    password: 'postgres'
=======
    user: 'fulltime',
    host: '192.168.0.156',
    port: 5432,
    database: 'fulltime4.0',
    password: 'fulltime'
>>>>>>> 44872a8 (Actualizacion de rama, 23 del 02 del 2023, actualizacion de framework's y del archivo custom.scss)
>>>>>>> 08dc0fc (Actualizacion SistemaWeb Fulltime4,0 01 de marzo del 2023)
>>>>>>> 0e7df10 (Actualikzacion sistemaweb Fulltime 4.0 02 de marzo del 2023)
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log("Error durante la conexión", err);
    }
    else {
        console.log("Conexión exitosa");
    }
});
exports.default = pool;
