import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class CiudadFeriadosService {

  constructor(
    private http: HttpClient,
  ) { }

  // Asignar Ciudad Feriado

  CrearCiudadFeriado(datos: any){ 
    return this.http.post(`${environment.url}/ciudadFeriados/insertar`, datos);
  }

  BuscarIdCiudad(datos: any){ 
    return this.http.post(`${environment.url}/ciudadFeriados/buscar`, datos);
  }

  BuscarCiudadProvincia(nombre: string){
    return this.http.get(`${environment.url}/ciudadFeriados/${nombre}`);
  }

  BuscarCiudadesFeriado(id: number){
    return this.http.get(`${environment.url}/ciudadFeriados/nombresCiudades/${id}`);
  }

  ActualizarDatos(data: any) {
    return this.http.put(`${environment.url}/ciudadFeriados`, data);
  }

  EliminarRegistro(id: number){
    return this.http.delete(`${environment.url}/ciudadFeriados/eliminar/${id}`);
  }

  BuscarFeriados(id_ciudad: number){
    return this.http.get(`${environment.url}/ciudadFeriados/ciudad/${id_ciudad}`);
  }
  
}
