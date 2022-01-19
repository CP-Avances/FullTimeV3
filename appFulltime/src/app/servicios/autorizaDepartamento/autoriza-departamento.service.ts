import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class AutorizaDepartamentoService {

  constructor(
    private http: HttpClient,
  ) { }

  //Empleado que autoriza en un departamento

  ConsultarAutorizaDepartamento() {
    return this.http.get(`${environment.url}/autorizaDepartamento`);
  }

  IngresarAutorizaDepartamento(datos: any) {
    return this.http.post(`${environment.url}/autorizaDepartamento`, datos);
  }

  BuscarAutoridadCargo(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/autoriza/${id}`);
  }

  BuscarEmpleadosAutorizan(id: any) {
    return this.http.get(`${environment.url}/autorizaDepartamento/empleadosAutorizan/${id}`);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/autorizaDepartamento`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/autorizaDepartamento/eliminar/${id}`);
  }

}
