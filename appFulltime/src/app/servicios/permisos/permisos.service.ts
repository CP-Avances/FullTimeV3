import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  constructor(
    private http: HttpClient,
    private socket: Socket
  ) { }

  // realtime
  sendNotiRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  // Permisos Empleado

  obtenerAllPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista`);
  }

  BuscarPermisosAutorizados() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista-autorizados`);
  }

  obtenerUnPermisoEmleado(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/un-permiso/${id_permiso}`);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/estado`, datos);
  }

  EditarPermiso(id: number, datos: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/permiso-solicitado`, datos);
  }

  ConsultarEmpleadoPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso`);
  }

  IngresarEmpleadoPermisos(datos: any) {
    return this.http.post(`${environment.url}/empleadoPermiso`, datos);
  }

  ObtenerUnPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/${id}`)
  }

  ObtenerUnPermisoEditar(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso/editar/${id}`)
  }

  SubirArchivoRespaldo(formData, id: number) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/documento`, formData)
  }

  BuscarNumPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/numPermiso/${id}`);
  }

  BuscarPermisoContrato(id: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permisoContrato/${id}`);
  }

  BuscarDatosSolicitud(id_emple_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosSolicitud/${id_emple_permiso}`);
  }

  BuscarDatosAutorizacion(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/datosAutorizacion/${id_permiso}`);
  }

  EliminarPermiso(id_permiso: number, doc: string) {
    return this.http.delete(`${environment.url}/empleadoPermiso/eliminar/${id_permiso}/${doc}`);
  }

  SendMailNoti(datos: any) {
    return this.http.post(`${environment.url}/empleadoPermiso/mail-noti`, datos);
  }

  BuscarPermisoCodigo(codigo: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permisoCodigo/${codigo}`);
  }

  BuscarFechasPermiso(datos: any, codigo: number) {
    return this.http.post(`${environment.url}/empleadoPermiso/fechas_permiso/${codigo}`, datos);
  }
}
