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

  // REGISTRAR NUEVO REGIMEN LABORAL
  CrearNuevoRegimen(datos: any) {
    return this.http.post(`${environment.url}/regimenLaboral`, datos).pipe(
      catchError(datos));
  }

  // LISTAR REGISTROS DE REGIMEN LABORAL
  ConsultarRegimen() {
    return this.http.get(`${environment.url}/regimenLaboral`);
  }

  // ACTUALIZAR REGISTRO DE REGIMEN LABORAL
  ActualizarRegimen(datos: any) {
    return this.http.put(`${environment.url}/regimenLaboral`, datos);
  }




  
  ConsultarUnRegimen(id: number) {
    return this.http.get(`${environment.url}/regimenLaboral/${id}`);
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
