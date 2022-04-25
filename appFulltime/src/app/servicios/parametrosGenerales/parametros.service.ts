import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParametrosService {

  constructor(
    private http: HttpClient
  ) { }

  ListarParametros() {
    return this.http.get<any>(`${environment.url}/parametrizacion`);
  }

  ListarDetalleParametros(id: number) {
    return this.http.get<any>(`${environment.url}/parametrizacion/${id}`);
  }

  ListarUnParametro(id: number) {
    return this.http.get<any>(`${environment.url}/parametrizacion/ver-parametro/${id}`);
  }

  IngresarTipoParametro(data: any) {
    return this.http.post(`${environment.url}/parametrizacion/tipo`, data);
  }

  IngresarDetalleParametro(data: any) {
    return this.http.post(`${environment.url}/parametrizacion/detalle`, data);
  }

  EliminarDetalleParametro(id: number) {
    return this.http.delete<any>(`${environment.url}/parametrizacion/eliminar-detalle/${id}`);
  }

  EliminarTipoParametro(id: number) {
    return this.http.delete<any>(`${environment.url}/parametrizacion/eliminar-tipo/${id}`);
  }

  ActualizarDetalleParametro(datos: any) {
    return this.http.put(`${environment.url}/parametrizacion/actual-detalle`, datos);
  }

  ActualizarTipoParametro(datos: any) {
    return this.http.put(`${environment.url}/parametrizacion/actual-tipo`, datos);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/parametrizacion/xmlDownload`, data);
  }

  ObtenerCoordenadas(data: any) {
    return this.http.post<any>(`${environment.url}/parametrizacion/coordenadas`, data);;
  }

}
