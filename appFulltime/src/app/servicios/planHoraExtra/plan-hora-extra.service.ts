import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanHoraExtraService {

  constructor(
    private http: HttpClient,
  ) { }

  ConsultarPlanificaciones() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/planificaciones`);
  }

  CrearPlanificacionHoraExtra(data: any) {
    return this.http.post(`${environment.url}/planificacionHoraExtra`, data);
  }

  ActualizarPlanHoraExtra(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/planificacion/${id}`, datos);
  }

  AutorizarTiempoHoraExtra(id: number, hora: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/tiempo-autorizado/${id}`, hora);
  }

  ConsultarPlanHoraExtra() {
    return this.http.get(`${environment.url}/planificacionHoraExtra`);
  }

  ConsultarUltimoPlanHora() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/id_plan_hora`);
  }

  ConsultarPlanHoraExtraObservacion() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/justificar`);
  }

  ConsultarPlanHoraExtraAutorizada() {
    return this.http.get(`${environment.url}/planificacionHoraExtra/autorizacion`);
  }

  EditarObservacion(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/observacion/${id}`, datos);
  }

  EditarEstado(id: number, datos: any) {
    return this.http.put<any>(`${environment.url}/planificacionHoraExtra/estado/${id}`, datos);
  }

  EnviarMensajeJustificacion(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra/send/aviso/`, data);
  }

  EnviarMensajePlanificacion(data: any) {
    return this.http.post<any>(`${environment.url}/planificacionHoraExtra/send/planifica/`, data);
  }

  BuscarDatosAutorizacion(id_hora_extra: number) {
    return this.http.get(`${environment.url}/planificacionHoraExtra/datosAutorizacion/${id_hora_extra}`);
  }

  // TABLA plan_hora_extra_empleado
  CrearPlanHoraExtraEmpleado(data: any) {
    return this.http.post(`${environment.url}/planificacionHoraExtra/hora_extra_empleado`, data);
  }

  BuscarPlanEmpleados(id_plan_hora: number) {
    return this.http.get(`${environment.url}/planificacionHoraExtra/plan_empleado/${id_plan_hora}`);
  }
}
