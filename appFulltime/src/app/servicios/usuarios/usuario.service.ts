import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // REGISTRAR USUARIO
  RegistrarUsuario(data: any) {
    return this.http.post(`${environment.url}/usuarios`, data)
      .pipe(
        catchError(data)
      );
  }

  // METODO DE BUSQUEDA DE DATOS DE USUARIO
  BuscarDatosUser(id: number) {
    return this.http.get(`${environment.url}/usuarios/datos/${id}`);
  }

  // METODO PARA ACTUALIZAR REGISTRO DE USUARIO
  ActualizarDatos(data: any) {
    return this.http.put(`${environment.url}/usuarios/actualizarDatos`, data).pipe(
      catchError(data));
  }

  // METODO PARA REGISTRAR ACCESOS AL SISTEMA
  CrearAccesosSistema(data: any) {
    return this.http.post(`${environment.url}/usuarios/acceso`, data);
  }

  // METODO PARA CAMBIAR PASSWORD
  ActualizarPassword(data: any) {
    return this.http.put(`${environment.url}/usuarios`, data);
  }

  // ADMINISTRACION MODULO DE ALIMENTACION
  RegistrarAdminComida(data: any) {
    return this.http.put(`${environment.url}/usuarios/admin/comida`, data);
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  ActualizarFrase(data: any) {
    return this.http.put(`${environment.url}/usuarios/frase`, data);
  }










  // catalogo de usuarios

  getUsuariosRest() {
    return this.http.get(`${environment.url}/usuarios`);
  }

  getUsersAppMovil() {
    return this.http.get<any>(`${environment.url}/usuarios/lista-app-movil/`);
  }

  updateUsersAppMovil(data: any) {
    return this.http.put<any>(`${environment.url}/usuarios/lista-app-movil/`, data);
  }

  BuscarUsersNoEnrolados() {
    return this.http.get(`${environment.url}/usuarios/noEnrolados`);
  }

  getIdByUsuarioRest(usuario: string) {
    return this.http.get(`${environment.url}/usuarios/busqueda/${usuario}`);
  }













  RecuperarFraseSeguridad(data: any) {
    return this.http.post(`${environment.url}/usuarios/frase/olvido-frase`, data)
  }

  CambiarFrase(data: any) {
    return this.http.post(`${environment.url}/usuarios/frase/restaurar-frase/nueva`, data)
  }

}
