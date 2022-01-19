import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class NivelTitulosService {

  constructor(
    private http: HttpClient
  ) { }

  // Niveles de titulos
  getOneNivelTituloRest(id: number) {
    return this.http.get<any>(`${environment.url}/nivel-titulo/${id}`);
  }

  getNivelesTituloRest() {
    return this.http.get<any>(`${environment.url}/nivel-titulo/`);
  }

  postNivelTituloRest(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/nivel-titulo`, data);
  }

  deleteNivelTituloRest(id: number) {
    return this.http.delete(`${environment.url}/nivel-titulo/eliminar/${id}`);
  }

  BuscarNivelNombre(nombre: string) {
    return this.http.get<any>(`${environment.url}/nivel-titulo/buscar/${nombre}`);
  }

  ActualizarNivelTitulo(datos: any) {
    return this.http.put(`${environment.url}/nivel-titulo`, datos);
  }

  BuscarNivelID() {
    return this.http.get<any>(`${environment.url}/nivel-titulo/nivel/datos/`);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/nivel-titulo/xmlDownload`, data);
  }

}
