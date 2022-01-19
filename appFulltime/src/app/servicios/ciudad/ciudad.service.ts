import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class CiudadService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de departamentos

  ConsultarNombreCiudades(){
    return this.http.get(`${environment.url}/ciudades`);
  }

  getUnaCiudadRest(id: number){
    return this.http.get(`${environment.url}/ciudades/${id}`);
  }

  ConsultarCiudades(){
    return this.http.get(`${environment.url}/ciudades/listaCiudad`);
  }

  postCiudades(data: any){ 
    return this.http.post(`${environment.url}/ciudades`, data);
  }

  EliminarCiudad(id: number){
    return this.http.delete(`${environment.url}/ciudades/eliminar/${id}`);
  }

}
