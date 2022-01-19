import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanComidasService {

  constructor(
    private http: HttpClient,
  ) { }

  /** SOLICITUD DE COMIDAS */
  CrearSolicitudComida(datos: any) {
    return this.http.post(`${environment.url}/planComidas/solicitud`, datos);
  }

  ActualizarSolicitudComida(datos: any) {
    return this.http.put(`${environment.url}/planComidas/solicitud`, datos);
  }

  ActualizarEstadoSolicitudComida(datos: any) {
    return this.http.put(`${environment.url}/planComidas/solicitud/estado`, datos);
  }

  ObtenerSolComidaPorIdEmpleado(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/planComidas/infoComida/${id_empleado}`)
  }

  ObtenerSolComidaAprobado() {
    return this.http.get<any>(`${environment.url}/planComidas/infoComida/estado/aprobado`)
  }

  ObtenerSolComidaNegado() {
    return this.http.get<any>(`${environment.url}/planComidas/infoComida/estado/negado`)
  }

  ObtenerSolComidaExpirada() {
    return this.http.get<any>(`${environment.url}/planComidas/infoComida/estado/expirada`)
  }

  /** BUSCAR JEFES */
  obtenerJefes(id_departamento: number) {
    return this.http.get<any>(`${environment.url}/planComidas/enviar/notificacion/${id_departamento}`)
  }

  /** ENVIAR CORREO A CADA JEFE */
  EnviarCorreo(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-noti`, datos);
  }

  EnviarCorreoEliminarSol(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-noti/eliminar-sol`, datos);
  }

  /** PLANIFICACIÓN DE COMIDAS */
  CrearPlanComidas(datos: any) {
    return this.http.post(`${environment.url}/planComidas/`, datos);
  }

  ObtenerUltimaPlanificacion() {
    return this.http.get<any>(`${environment.url}/planComidas/fin_registro`)
  }

  ObtenerPlanComidaPorIdEmpleado(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/planComidas/infoComida/plan/${id_empleado}`)
  }

  ObtenerPlanComidaPorIdPlan(id: number) {
    return this.http.get<any>(`${environment.url}/planComidas/comida-empleado/plan/${id}`)
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/planComidas/eliminar/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/planComidas`, datos);
  }

  /** REGISTRO DE LA PLANIFICACIÓN DE ALIMENTACIÓN AL EMPLEADO */
  CrearPlanComidasEmpleado(datos: any) {
    return this.http.post(`${environment.url}/planComidas/empleado/plan`, datos);
  }

  CrearSolComidasEmpleado(datos: any) {
    return this.http.post(`${environment.url}/planComidas/empleado/solicitud`, datos);
  }

  EncontrarPlanComidaEmpleadoConsumido(datos: any) {
    return this.http.post(`${environment.url}/planComidas/empleado/plan/consumido`, datos);
  }

  BuscarDuplicadosFechas(datos: any) {
    return this.http.post(`${environment.url}/planComidas/duplicidad/plan`, datos);
  }

  BuscarDuplicadosSolicitudFechas(datos: any) {
    return this.http.post(`${environment.url}/planComidas/duplicidad/solicitud`, datos);
  }

  BuscarDuplicadosFechasActualizar(datos: any) {
    return this.http.post(`${environment.url}/planComidas/duplicidad/actualizar/plan`, datos);
  }

  BuscarDuplicadosSolFechasActualizar(datos: any) {
    return this.http.post(`${environment.url}/planComidas/duplicidad/actualizar/sol`, datos);
  }

  EnviarCorreoPlan(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-plan`, datos);
  }

  EnviarCorreoEliminaPlan(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-plan/eliminar-plan`, datos);
  }

  EnviarCorreoSolicitudActualizada(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-solicitud/actualizacion`, datos);
  }

  EnviarCorreoEstadoSolicitud(datos: any) {
    return this.http.post(`${environment.url}/planComidas/mail-solicita`, datos);
  }

  EliminarSolComida(id: number, fecha: any, id_empleado: number) {
    return this.http.delete(`${environment.url}/planComidas/eliminar/plan-solicitud/${id}/${fecha}/${id_empleado}`);
  }

  EliminarSolicitud(id: number) {
    return this.http.delete(`${environment.url}/planComidas/eliminar/sol-comida/${id}`);
  }

  EliminarPlanComida(id: number, id_empleado: number) {
    return this.http.delete(`${environment.url}/planComidas/eliminar/plan-comida/${id}/${id_empleado}`);
  }

  /** Servicio para obtener datos de la tabla tipo_comida */
  CrearTipoComidas(datos: any) {
    return this.http.post(`${environment.url}/planComidas/tipo_comida`, datos);
  }

  ObtenerTipoComidas() {
    return this.http.get<any>(`${environment.url}/planComidas/tipo_comida`)
  }

  ObtenerUltimoTipoComidas() {
    return this.http.get<any>(`${environment.url}/planComidas/tipo_comida/ultimo`)
  }

  /** ALERTAS DE NOTIFICACIÓN DE SOLICITUD Y PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN*/
  EnviarMensajePlanComida(data: any) {
    return this.http.post<any>(`${environment.url}/planComidas/send/planifica/`, data);
  }

  ObtenerPlanComidas() {
    return this.http.get<any>(`${environment.url}/planComidas`)
  }

}
