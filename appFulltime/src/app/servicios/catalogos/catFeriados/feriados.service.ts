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

  // METODO PARA BUSCAR LISTA DE FERIADOS
  ConsultarFeriado() {
    return this.http.get(`${environment.url}/feriados`);
  }

  // METODO PARA ELIMINAR REGISTRO
  EliminarFeriado(id: number) {
    return this.http.delete(`${environment.url}/feriados/delete/${id}`);
  }

  // METODO PARA CREAR ARCHIVO XML
  CrearXML(data: any) {
    return this.http.post(`${environment.url}/feriados/xmlDownload`, data);
  }

  // METODO PARA CREAR NUEVO REGISTRO DE FERIADO
  CrearNuevoFeriado(datos: any) {
    return this.http.post<any>(`${environment.url}/feriados`, datos)
      .pipe(
        catchError(datos)
      );
  }

  // METODO PARA BUSCAR FERIADOS EXCEPTO REGISTRO EDITADO
  ConsultarFeriadoActualiza(id: number) {
    return this.http.get(`${environment.url}/feriados/listar/${id}`);
  }

  // METODO PARA ACTUALIZAR REGISTRO
  ActualizarUnFeriado(datos: any) {
    return this.http.put(`${environment.url}/feriados`, datos).pipe(
      catchError(datos));
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO ESPECIFICO
  ConsultarUnFeriado(id: number) {
    return this.http.get(`${environment.url}/feriados/${id}`);
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




}
