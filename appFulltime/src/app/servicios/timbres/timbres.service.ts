import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TimbresService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * METODO PARA TRAER LAS NOTIFICACIONES DE ATRASOS O SALIDAS ANTES SOLO VIENEN 5 NOTIFICACIONES
   * @param id_empleado Id DEL EMPLEADO QUE INICIA SESION
   */

  // METODO DE CONSULTA DE AVISOS GENERALES
  BuscarAvisosGenerales(id_empleado: number) {
    return this.http.get(`${environment.url}/timbres/avisos-generales/${id_empleado}`);
  }

  PutVistaTimbre(id_noti_timbre: number) {
    let data = { visto: true };
    return this.http.put(`${environment.url}/timbres/noti-timbres/vista/${id_noti_timbre}`, data);
  }

  AvisosTimbresRealtime(id_empleado: number) {
    return this.http.get(`${environment.url}/timbres/noti-timbres/avisos/${id_empleado}`);
  }

  EliminarAvisos(Seleccionados: any[]) {
    return this.http.put<any>(`${environment.url}/timbres/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }

  PostTimbreWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/timbres/`, datos);
  }

  PostTimbreWebAdmin(datos: any) {
    return this.http.post<any>(`${environment.url}/timbres/admin/`, datos);
  }

  ObtenerTimbres() {
    return this.http.get<any>(`${environment.url}/timbres/`);
  }

  ObtenerTimbresEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/timbres/ver/timbres/${id}`);
  }

  UltimoTimbreEmpleado() {
    return this.http.get<any>(`${environment.url}/timbres/ultimo-timbre`);
  }

}
