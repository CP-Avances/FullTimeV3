import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private http: HttpClient) { }

  // Roles

  getRoles() {
    return this.http.get<any>(`${environment.url}/rol`);
  }

  getOneRol(id: number) {
    return this.http.get<any>(`${environment.url}/rol/${id}`);
  }

  ListarRolesActualiza(id: number) {
    return this.http.get<any>(`${environment.url}/rol/actualiza/${id}`);
  }

  postRoles(data: any) {
    console.log(data);
    return this.http.post(`${environment.url}/rol`, data);
  }

  ActualizarRol(data: any) {
    return this.http.put(`${environment.url}/rol`, data);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/rol/xmlDownload`, data);
  }

  EliminarRoles(id: number) {
    return this.http.delete(`${environment.url}/rol/eliminar/${id}`);
  }

}
