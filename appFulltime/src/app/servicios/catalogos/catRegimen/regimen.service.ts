import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RegimenService {

  constructor(
    private http: HttpClient
  ) { }

  // Invocación del método post para crear nuevo régimen laboral
  CrearNuevoRegimen(datos: any) {
    return this.http.post(`${environment.url}/regimenLaboral`, datos).pipe(
      catchError(datos));
  }

  ConsultarRegimen() {
    return this.http.get(`${environment.url}/regimenLaboral`);
  }

  ConsultarUnRegimen(id: number) {
    return this.http.get(`${environment.url}/regimenLaboral/${id}`);
  }

  ActualizarRegimen(datos: any) {
    return this.http.put(`${environment.url}/regimenLaboral`, datos);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/regimenLaboral/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/regimenLaboral/eliminar/${id}`);
  }

  ConsultarRegimenSucursal(id: number) {
    return this.http.get(`${environment.url}/regimenLaboral/sucursal-regimen/${id}`);
  }
}
