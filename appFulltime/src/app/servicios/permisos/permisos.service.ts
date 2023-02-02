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

  // ENVIO DE NOTIFICACIONES DE PERMISOS EN TIEMPO REAL
  sendNotiRealTime(data: any) {
    this.socket.emit('nueva_notificacion', data);
  }

  // METODO DE BUSQUEDA DEL NUMERO DE PERMISO
  BuscarNumPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/numPermiso/${id}`);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS 
  BuscarPermisosSolicitadosTotales(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-totales`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosDias(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados`, datos);
  }

  // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
  BuscarPermisosSolicitadosHoras(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/permisos-solicitados-horas`, datos);
  }







  // Permisos Empleado

  obtenerAllPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista`);
  }

  BuscarPermisosAutorizados() {
    return this.http.get(`${environment.url}/empleadoPermiso/lista-autorizados`);
  }

  obtenerUnPermisoEmpleado(id_permiso: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/un-permiso/${id_permiso}`);
  }

  ActualizarEstado(id: number, datos: any) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/estado`, datos);
  }

  ConsultarEmpleadoPermisos() {
    return this.http.get(`${environment.url}/empleadoPermiso`);
  }

  IngresarEmpleadoPermisos(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso`, datos);
  }

  ObtenerUnPermiso(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/${id}`)
  }

  ObtenerUnPermisoEditar(id: number) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso/editar/${id}`)
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



  BuscarFechasPermiso(datos: any, codigo: number) {
    return this.http.post(`${environment.url}/empleadoPermiso/fechas_permiso/${codigo}`, datos);
  }


  // METODO USADO PAR EDITAR DATOS DE PERMISO
  EditarPermiso(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/empleadoPermiso/${id}/permiso-solicitado`, datos);
  }

  // METODO DE BUSQUEDA DE PERMISOS POR ID DE EMPLEADO
  BuscarPermisoEmpleado(id_empleado: any) {
    return this.http.get(`${environment.url}/empleadoPermiso/permiso-usuario/${id_empleado}`);
  }

  // METODO PARA ELIMINAR PERMISOS
  EliminarPermiso(id_permiso: number, doc: string) {
    return this.http.delete(`${environment.url}/empleadoPermiso/eliminar/${id_permiso}/${doc}`);
  }

  // METODO PARA ENVIAR NOTIFICACION DE PERMISOS
  EnviarCorreoWeb(datos: any) {
    return this.http.post<any>(`${environment.url}/empleadoPermiso/mail-noti`, datos);
  }

  // SUBIR RESPALDOS DE PERMISOS
  SubirArchivoRespaldo(formData, id: number, documento: string) {
    return this.http.put(`${environment.url}/empleadoPermiso/${id}/documento/${documento}`, formData)
  }

}
