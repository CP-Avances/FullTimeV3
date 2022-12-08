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


  // METODO PARA LISTAR MARCACIONES
  ObtenerTimbres() {
    return this.http.get<any>(`${environment.url}/timbres/`);
  }

  // METODO PARA REGISTRAR TIMBRE PERSONAL
  RegistrarTimbreWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/timbres/`, datos);
  }









  /**
   * METODO PARA TRAER LAS NOTIFICACIONES DE ATRASOS O SALIDAS ANTES SOLO VIENEN 5 NOTIFICACIONES
   * @param id_empleado Id DEL EMPLEADO QUE INICIA SESION
   */

  // METODO DE CONSULTA DE AVISOS GENERALES
  BuscarAvisosGenerales(id_empleado: number) {
    return this.http.get(`${environment.url}/timbres/avisos-generales/${id_empleado}`);
  }

  // METODO DE CONSULTA DE AVISOS ESPECIFICOS
  ObtenerUnAviso(id: number) {
    return this.http.get<any>(`${environment.url}/timbres/aviso-individual/${id}`);
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



  PostTimbreWebAdmin(datos: any) {
    return this.http.post<any>(`${environment.url}/timbres/admin/`, datos);
  }


  ObtenerTimbresEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/timbres/ver/timbres/${id}`);
  }

  UltimoTimbreEmpleado() {
    return this.http.get<any>(`${environment.url}/timbres/ultimo-timbre`);
  }

}
