import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class TipoPermisosService {

  constructor(
    private http: HttpClient
  ) { }

  // catalogo de TIPO PERMISOS

  getTipoPermisoRest() {
    return this.http.get(`${environment.url}/tipoPermisos`);
  }

  getListAccesoTipoPermisoRest(access: number) {
    return this.http.get(`${environment.url}/tipoPermisos/acceso/${access}`);
  }

  getOneTipoPermisoRest(id: number) {
    return this.http.get(`${environment.url}/tipoPermisos/${id}`);
  }

  postTipoPermisoRest(data: any) {
    return this.http.post(`${environment.url}/tipoPermisos`, data).pipe(
      catchError(data));
  }

  putTipoPermisoRest(id: number, data: any) {
    return this.http.put(`${environment.url}/tipoPermisos/editar/${id}`, data);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/tipoPermisos/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/tipoPermisos/eliminar/${id}`);
  }
}
