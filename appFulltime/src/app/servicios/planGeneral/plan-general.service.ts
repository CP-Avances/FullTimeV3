import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class PlanGeneralService {

  constructor(
    private http: HttpClient,
  ) { }

  CrearPlanGeneral(datos: any) {
    return this.http.post(`${environment.url}/planificacion_general/`, datos);
  }

  EliminarRegistro(id: number,) {
    return this.http.delete(`${environment.url}/planificacion_general/eliminar/${id}`);
  }

  BuscarFechas(datos: any) {
    return this.http.post(`${environment.url}/planificacion_general/buscar_fechas`, datos);
  }

  BuscarFecha(datos: any) {
    return this.http.post(`${environment.url}/planificacion_general/buscar_fecha/plan`, datos);
  }

  
  // DATO NO USADO
  /*BuscarPlanificacionEmpleado(empleado_id: any, datos: any) {
    return this.http.post(`${environment.url}/planificacion_general/buscar_plan/${empleado_id}`, datos);
  }*/

}
