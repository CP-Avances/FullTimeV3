import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AutorizacionService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // realtime
  sendNotiRealTimeEstado(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  // catalogo de notificaciones
  getAutorizacionesRest() {
    return this.http.get<any>(`${environment.url}/autorizaciones`);
  }

  getUnaAutorizacionByPermisoRest(id_permiso: number) {
    return this.http.get<any>(`${environment.url}/autorizaciones/by-permiso/${id_permiso}`);
  }

  getUnaAutorizacionByVacacionRest(id_vacacion: number) {
    return this.http.get<any>(`${environment.url}/autorizaciones/by-vacacion/${id_vacacion}`);
  }

  getUnaAutorizacionByHoraExtraRest(id_hora_extra: number) {
    return this.http.get<any>(`${environment.url}/autorizaciones/by-hora-extra/${id_hora_extra}`);
  }

  postAutorizacionesRest(data: any) {
    return this.http.post(`${environment.url}/autorizaciones`, data);
  }

  PutEstadoAutoPermiso(id: number, datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/${id}/estado-permiso`, datos);
  }

  PutEstadoAutoPermisoMultiple(datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/estado-permiso/multiple`, datos);
  }

  PutEstadoAutoVacacion(datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/estado-vacacion`, datos);
  }

  PutEstadoAutoHoraExtra(id: number, datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/${id}/estado-hora-extra`, datos);
  }

  PutEstadoAutoPlanHoraExtra(id: number, datos: any) {
    return this.http.put(`${environment.url}/autorizaciones/${id}/estado-plan-hora-extra`, datos);
  }
}
