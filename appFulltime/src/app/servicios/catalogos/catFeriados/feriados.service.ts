import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FeriadosService {

  constructor(
    private http: HttpClient
  ) { }

  // Invocación del método post para crear nuevo feriado
  CrearNuevoFeriado(datos: any) {
    return this.http.post(`${environment.url}/feriados`, datos)
      .pipe(
        catchError(datos)
      );
  }

  ConsultarFeriado() {
    return this.http.get(`${environment.url}/feriados`);
  }

  ConsultarFeriadoActualiza(id: number) {
    return this.http.get(`${environment.url}/feriados/listar/${id}`);
  }

  ConsultarUnFeriado(id: number) {
    return this.http.get(`${environment.url}/feriados/${id}`);
  }

  ActualizarUnFeriado(datos: any) {
    return this.http.put(`${environment.url}/feriados`, datos).pipe(
      catchError(datos));
  }

  ConsultarUltimoId() {
    return this.http.get(`${environment.url}/feriados/ultimoId`);
  }

  subirArchivoExcel(formData) {
    return this.http.post<any>(environment.url + '/feriados/upload', formData);
  }

  RevisarFormato(formData) {
    return this.http.post<any>(environment.url + '/feriados/upload/revision', formData);
  }

  RevisarDuplicidad(formData) {
    return this.http.post<any>(environment.url + '/feriados/upload/revision_data', formData);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/feriados/xmlDownload`, data);
  }

  EliminarFeriado(id: number) {
    return this.http.delete(`${environment.url}/feriados/delete/${id}`);
  }
}
