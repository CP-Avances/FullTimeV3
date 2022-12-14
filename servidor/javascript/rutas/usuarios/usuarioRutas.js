"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarioControlador_1 = require("../../controlador/usuarios/usuarioControlador");
const verificarToken_1 = require("../../libs/verificarToken");
class UsuarioRutas {
    constructor() {
        this.router = (0, express_1.Router)();
        this.configuracion();
    }
    configuracion() {
        // CREAR REGISTRO DE USUARIOS
        this.router.post('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CrearUsuario);
        // METODO DE BUSQUEDA DE DATOS DE USUARIO
        this.router.get('/datos/:id_empleado', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ObtenerDatosUsuario);
        // METODO PARA ACTUALIZAR DATOS DE USUARIO
        this.router.put('/actualizarDatos', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarUsuario);
        // METODO PARA REGISTRAR ACCESOS AL SISTEMA
        this.router.post('/acceso', usuarioControlador_1.USUARIO_CONTROLADOR.AuditarAcceso);
        // METODO PARA ACTUALIZAR CONTRASEÑA
        this.router.put('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.CambiarPasswordUsuario);
        // ADMINISTRACION MODULO DE ALIMENTACION
        this.router.put('/admin/comida', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.RegistrarAdminComida);
        // METODO PARA REGISTRAR FRASE DE SEGURIDAD
        this.router.put('/frase', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ActualizarFrase);
        this.router.get('/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.list);
        this.router.get('/lista-app-movil/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.usersEmpleados);
        this.router.put('/lista-app-movil/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.updateUsersEmpleados);
        this.router.get('/lista-web/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.usersEmpleadosWebHabilita);
        this.router.put('/lista-web/', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.updateUsersEmpleadosWebHabilita);
        this.router.get('/busqueda/:usuario', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.getIdByUsuario);
        this.router.get('/noEnrolados', verificarToken_1.TokenValidation, usuarioControlador_1.USUARIO_CONTROLADOR.ListarUsuriosNoEnrolados);
        this.router.post('/frase/olvido-frase', usuarioControlador_1.USUARIO_CONTROLADOR.RestablecerFrase);
        this.router.post('/frase/restaurar-frase/nueva', usuarioControlador_1.USUARIO_CONTROLADOR.CambiarFrase);
    }
}
const USUARIO_RUTA = new UsuarioRutas();
exports.default = USUARIO_RUTA.router;
