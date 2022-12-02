import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DiscapacidadService {

  constructor(
    private http: HttpClient,

  ) { }

  // METODO PARA BUSCAR DATOS DE UN USUARIO
  BuscarDiscapacidadUsuario(id: number) {
    return this.http.get(`${environment.url}/discapacidad/${id}`);
  }

  // METODO PARA REGISTRAR DISCAPACIDAD
  RegistroDiscapacidad(data: any) {
    return this.http.post(`${environment.url}/discapacidad`, data);
  }

  // METODO PARA ACTUALIZACION DE REGISTRO
  ActualizarDiscapacidad(id: number, data: any) {
    return this.http.put(`${environment.url}/discapacidad/${id}`, data);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarDiscapacidad(id: number) {
    return this.http.delete(`${environment.url}/discapacidad/eliminar/${id}`);
  }


  /** *************************************************************************************** **
   ** **                METODO PARA MANEJO DE DATOS DE TIPO DISCAPACIDAD                   ** ** 
   ** *************************************************************************************** **/

  // METODO PARA REGISTRAR TIPO DE DISCAPACIDAD
  RegistrarTipo(data: any) {
    return this.http.post<any>(`${environment.url}/discapacidad/buscarTipo`, data);
  }

  // BUSCAR TIPO DE DISCAPACIDAD
  ListarTipoDiscapacidad() {
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/tipo`);
  }
















  // TIPO DE DISCAPACIDAD



  BuscarTipoD(id: number) {
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/tipo/${id}`);
  }



  ActualizarTipoD(id: number, data: any) {
    return this.http.put(`${environment.url}/discapacidad/buscarTipo/${id}`, data);
  }



}
