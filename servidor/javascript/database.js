"use strict";
//Conexión con la base de datos PostgreSQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_pool_1 = __importDefault(require("pg-pool"));
const pool = new pg_pool_1.default({
<<<<<<< HEAD
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'fulltime4.0',
    password: 'postgres'
=======
    user: 'fulltime',
    host: '192.168.0.156',
    port: 5432,
    database: 'fulltime4.0',
    password: 'fulltime'
>>>>>>> 44872a8 (Actualizacion de rama, 23 del 02 del 2023, actualizacion de framework's y del archivo custom.scss)
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
