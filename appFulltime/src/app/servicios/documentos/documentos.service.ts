import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class DocumentosService {

  constructor(
    private http: HttpClient,
  ) { }

  ListarCarpeta() {
    return this.http.get<any>(`${environment.url}/archivosCargados/carpetas`)
  }

  ListarArchivosDeCarpeta(nom_carpeta) {
    return this.http.get<any>(`${environment.url}/archivosCargados/lista-carpetas/${nom_carpeta}`)
  }

  DownloadFile(nom_carpeta: string, filename: string) {
    return this.http.get<any>(`${environment.url}/archivosCargados/download/files/${nom_carpeta}/${filename}`)
  }

  ListarArchivos() {
    return this.http.get(`${environment.url}/archivosCargados`);
  }

  ListarUnArchivo(id: number) {
    return this.http.get(`${environment.url}/archivosCargados/${id}`);
  }

  CrearArchivo(data: any) {
    return this.http.post(`${environment.url}/archivosCargados`, data);
  }

  EditarArchivo(id: number, data: any) {
    return this.http.put(`${environment.url}/archivosCargados/editar/${id}`, data);
  }

  SubirArchivo(formData, id: number) {
    return this.http.put(`${environment.url}/archivosCargados/${id}/documento`, formData)
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/archivosCargados/eliminar/${id}`);
  }

}
