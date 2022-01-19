import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  constructor(
    private http: HttpClient,
  ) { }

  // Catálogo de Provincias

  getProvinciasRest(){
    return this.http.get(`${environment.url}/provincia`);
  }

  BuscarUnaProvincia(id_pais: number){
    return this.http.get(`${environment.url}/provincia/${id_pais}`);
  }

  BuscarUnaProvinciaId(id: number){
    return this.http.get(`${environment.url}/provincia/buscar/${id}`);
  }

  BuscarPaisId(id: number){
    return this.http.get(`${environment.url}/provincia/buscar/pais/${id}`);
  }
  
  postProvinciaRest(data: any){
    return this.http.post(`${environment.url}/provincia`, data);
  }

  getIdProvinciaRest(nombre: string){
    return this.http.get(`${environment.url}/provincia/nombreProvincia/${nombre}`);
  }

  BuscarContinente(){
    return this.http.get(`${environment.url}/provincia/continentes`);
  }

  BuscarPais(continente: string){
    return this.http.get(`${environment.url}/provincia/pais/${continente}`);
  }

  BuscarTodosPaises(){
    return this.http.get(`${environment.url}/provincia/paises`);
  }

  EliminarProvincia(id: number){
    return this.http.delete(`${environment.url}/provincia/eliminar/${id}`);
  }

}

