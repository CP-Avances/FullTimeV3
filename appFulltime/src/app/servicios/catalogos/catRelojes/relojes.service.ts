import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class RelojesService {

  constructor(
    private http: HttpClient
  ) { }

  // Invocación del método post para crear nuevo reloj
  CrearNuevoReloj(datos: any) {
    return this.http.post<any>(`${environment.url}/relojes`, datos);
  }

  ConsultarRelojes() {
    return this.http.get(`${environment.url}/relojes`);
  }

  ConsultarUnReloj(id: number) {
    return this.http.get(`${environment.url}/relojes/${id}`);
  }

  ActualizarDispositivo(datos: any) {
    return this.http.put<any>(`${environment.url}/relojes`, datos);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/relojes/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/relojes/eliminar/${id}`);
  }

  ConsultarDatosId(id: number) {
    return this.http.get(`${environment.url}/relojes/datosReloj/${id}`);
  }

  // Métodos para verificar datos de plantilla antes de registralos en el sistema
  subirArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/plantillaExcel/`, formData);
  }

  Verificar_Datos_ArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/verificar_datos/plantillaExcel/`, formData);
  }

  VerificarArchivoExcel(formData) {
    return this.http.post<any>(`${environment.url}/relojes/verificar_plantilla/plantillaExcel/`, formData);
  }
}
