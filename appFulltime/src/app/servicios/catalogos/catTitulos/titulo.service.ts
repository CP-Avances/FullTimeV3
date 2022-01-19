import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TituloService {

  constructor(
    private http: HttpClient
  ) { }

  // Catálogo de títulos

  getOneTituloRest(id: number) {
    return this.http.get(`${environment.url}/titulo/${id}`);
  }

  getTituloRest() {
    return this.http.get(`${environment.url}/titulo/`);
  }

  postTituloRest(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/titulo`, data);
  }

  ActualizarUnTitulo(datos: any) {
    return this.http.put(`${environment.url}/titulo`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/titulo/eliminar/${id}`);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/titulo/xmlDownload`, data);
  }

}
