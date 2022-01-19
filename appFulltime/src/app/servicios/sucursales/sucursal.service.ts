import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class SucursalService {

  constructor(
    private http: HttpClient,
  ) { }

  // Catálogo de Horarios
  getSucursalesRest() {
    return this.http.get(`${environment.url}/sucursales`);
  }

  VerSucursalesRegistro() {
    return this.http.get(`${environment.url}/sucursales/registro`);
  }

  VerSucursalActualizar(id: number) {
    return this.http.get(`${environment.url}/sucursales/actualizar/${id}`);
  }

  EncontrarUltimoId() {
    return this.http.get(`${environment.url}/sucursales/ultimoId`);
  }

  getOneSucursalRest(id: number) {
    return this.http.get(`${environment.url}/sucursales/unaSucursal/${id}`);
  }

  postSucursalRest(data: any) {
    return this.http.post(`${environment.url}/sucursales`, data);
  }

  BuscarSucEmpresa(id_empresa: number) {
    return this.http.get(`${environment.url}/sucursales/buscar/nombreSuc/${id_empresa}`);
  }

  ActualizarSucursal(datos: any) {
    return this.http.put(`${environment.url}/sucursales`, datos);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/sucursales/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/sucursales/eliminar/${id}`);
  }

}
