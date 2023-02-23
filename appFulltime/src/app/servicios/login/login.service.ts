import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router) { }


  // VALIDACIONES DE INGRESO AL SISTEMA 
  ValidarCredenciales(data: any) {
    return this.http.post<any>(`${environment.url}/login`, data);
  }

  // METODO PARA CAMBIAR CONTRASEÑA
  EnviarCorreoContrasena(data: any) {
    return this.http.post(`${environment.url}/login/recuperar-contrasenia/`, data)
  }

  // METODO PARA CAMBIAR CONTRASEÑA
  ActualizarContrasenia(data: any) {
    return this.http.post(`${environment.url}/login/cambiar-contrasenia`, data)
  }












  loggedIn() {
    return !!localStorage.getItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRol() {
    return parseInt(localStorage.getItem('rol'));//Empleado
  }

  getEstado() {
    let estado = localStorage.getItem('autoriza');
    if (estado == 'true') {
      return true;
    }
    return false;
  }

  loggedRol() {
    return !!localStorage.getItem('rol');
  }

  getRolMenu() {
    let rol = parseInt(localStorage.getItem('rol'));
    if (rol === 1) {
      return true;//Admin
    }
    return false;//Empleado
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/'], { relativeTo: this.route, skipLocationChange: false });
  }





  // AUDITAR
  Auditar(data: any) {
    return this.http.post(`${environment.url}/login/auditar`, data)
  }
}
