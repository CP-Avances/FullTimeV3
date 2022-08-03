import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {

  constructor(
    private http: HttpClient,
    // private socket: Socket
  ) { }

  ObtenerTodasNotificaciones() {
    return this.http.get(`${environment.url}/noti-real-time/`);
  }

  ObtenerUnaNotificaciones(id: number) {
    return this.http.get(`${environment.url}/noti-real-time/one/${id}`);
  }

  ObtenerNotificacionesSend(id_empleado: number) {
    return this.http.get(`${environment.url}/noti-real-time/send/${id_empleado}`);
  }



  ObtenerNotificacionesAllReceives(id_empleado: number) {
    return this.http.get(`${environment.url}/noti-real-time/all-receives/${id_empleado}`);
  }

  IngresarNotificacionEmpleado(datos: any) {
    return this.http.post<any>(`${environment.url}/noti-real-time`, datos);
  }

  PutVistaNotificacion(id_realtime: number) {
    let data = { visto: true };
    return this.http.put(`${environment.url}/noti-real-time/vista/${id_realtime}`, data);
  }

  EliminarNotificaciones(Seleccionados: any[]) {
    return this.http.put<any>(`${environment.url}/noti-real-time/eliminar-multiples/avisos`, Seleccionados); //Eliminacion de datos seleccionados.
  }


  /** ************************************************************************************ **
   ** **                        MÉTODOS PARA CONFIG_NOTI                                ** ** 
   ** ************************************************************************************ **/

  // METODO DE BUSQUEDA DE CONFIGURACION DE RECEPCION DE NOTIFICACIONES
  ObtenerConfiguracionEmpleado(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/noti-real-time/config/${id_empleado}`);
  }

  IngresarConfigNotiEmpleado(datos: any) {
    return this.http.post(`${environment.url}/noti-real-time/config`, datos);
  }

  ActualizarConfigNotiEmpl(id_empleado: number, datos: any) {
    return this.http.put(`${environment.url}/noti-real-time/config/noti-put/${id_empleado}`, datos);
  }

  // METODO PARA BUSCAR NOTIFICACIONES RECIBIDAS POR UN USUARIO
  ObtenerNotasUsuario(id_empleado: number) {
    return this.http.get(`${environment.url}/noti-real-time/receives/${id_empleado}`);
  }

  /** ************************************************************************************ **
   ** **                 MÉTODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** ** 
   ** ************************************************************************************ **/

  EnviarCorreoComunicado(datos: any) {
    return this.http.post<any>(`${environment.url}/noti-real-time/mail-comunicado`, datos);
  }

  /** ************************************************************************************ **
   ** **                 MÉTODOS DE CONSULTA DE DATOS DE COMUNICADOS                    ** ** 
   ** ************************************************************************************ **/

  EnviarMensajeGeneral(data: any) {
    return this.http.post<any>(`${environment.url}/noti-real-time/noti-comunicado/`, data);
  }

}
