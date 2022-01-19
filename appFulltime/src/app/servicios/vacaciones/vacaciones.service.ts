import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // realtime
  sendNotiRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${environment.url}/vacaciones/${id}/estado`, datos);
  }

  ObtenerListaVacaciones() {
    return this.http.get(`${environment.url}/vacaciones`);
  }

  ObtenerListaVacacionesAutorizadas() {
    return this.http.get(`${environment.url}/vacaciones/estado-solicitud`);
  }

  ObtenerUnaVacacion(id: number) {
    return this.http.get(`${environment.url}/vacaciones/one/${id}`);
  }

  ListarUnaVacacion(id: number) {
    return this.http.get(`${environment.url}/vacaciones/listar/vacacion/${id}`);
  }

  RegistrarVacaciones(datos: any) {
    return this.http.post(`${environment.url}/vacaciones`, datos);
  }

  ObtenerVacacionesPorIdPeriodo(id_peri_perido: number) {
    return this.http.get<any>(`${environment.url}/vacaciones/${id_peri_perido}`)
  }

  BuscarFechasFeriado(datos: any) {
    return this.http.post(`${environment.url}/vacaciones/fechasFeriado`, datos);
  }

  BuscarDatosSolicitud(id_emple_vacacion: number) {
    return this.http.get(`${environment.url}/vacaciones/datosSolicitud/${id_emple_vacacion}`);
  }

  BuscarDatosAutorizacion(id_vacaciones: number) {
    return this.http.get(`${environment.url}/vacaciones/datosAutorizacion/${id_vacaciones}`);
  }

  SendMailNoti(datos: any) {
    return this.http.post(`${environment.url}/vacaciones/mail-noti`, datos);
  }

  EliminarVacacion(id_vacacion: number) {
    return this.http.delete(`${environment.url}/vacaciones/eliminar/${id_vacacion}`);
  }

  EditarVacacion(id: number, datos: any) {
    return this.http.put(`${environment.url}/vacaciones/${id}/vacacion-solicitada`, datos);
  }

  // REPORTE DE VACACIONES DE FORMA MÚLTIPLE
  BuscarSolicitudVacacion(datos: any, desde: string, hasta: string) {
    return this.http.put(`${environment.url}/empleado-vacaciones-solicitudes/vacaciones-solicitudes/${desde}/${hasta}`, datos);
  }
}
