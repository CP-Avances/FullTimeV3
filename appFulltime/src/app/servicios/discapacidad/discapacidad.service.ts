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

  // Catalogo de discapacidad
  postDiscapacidadRest(data: any){
    return this.http.post(`${environment.url}/discapacidad`, data);
  }

  getDiscapacidadUsuarioRest(id: number){
    return this.http.get(`${environment.url}/discapacidad/${id}`);
  }

  putDiscapacidadUsuarioRest(id: number, data: any){
    return this.http.put(`${environment.url}/discapacidad/${id}`, data);
  }

  deleteDiscapacidadUsuarioRest(id: number){
    return this.http.delete(`${environment.url}/discapacidad/eliminar/${id}`);
  }

  // TIPO DE DISCAPACIDAD

  InsertarTipoD(data: any){
    return this.http.post(`${environment.url}/discapacidad/buscarTipo`, data);
  }

  BuscarTipoD(id: number){
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/tipo/${id}`);
  }

  ListarTiposD(){
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/tipo`);
  }

  ActualizarTipoD(id: number, data: any){
    return this.http.put(`${environment.url}/discapacidad/buscarTipo/${id}`, data);
  }

  ConsultarUltimoIdTD(){
    return this.http.get(`${environment.url}/discapacidad/buscarTipo/ultimoId`);
  }

}
