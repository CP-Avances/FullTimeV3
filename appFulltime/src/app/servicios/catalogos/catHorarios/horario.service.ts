import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class HorarioService {

  constructor(
    private http: HttpClient,
  ) { }

  // Catálogo de Horarios
  getHorariosRest() {
    return this.http.get(`${environment.url}/horario`);
  }

  getOneHorarioRest(id: number) {
    return this.http.get(`${environment.url}/horario/${id}`);
  }

  postHorarioRest(data: any) {
    return this.http.post<any>(`${environment.url}/horario`, data);
  }

  putHorarioRest(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/editar/${id}`, data);
  }

  updateHorasTrabajaByDetalleHorario(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/update-horas-trabaja/${id}`, data);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/horario/xmlDownload`, data);
  }

  SubirArchivoRespaldo(formData, id: number) {
    return this.http.put(`${environment.url}/horario/${id}/documento`, formData)
  }

  EditarDocumento(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/editar/editarDocumento/${id}`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/horario/eliminar/${id}`);
  }

  VerificarDuplicados(nombre: string) {
    const params = new HttpParams()
      .set('nombre', nombre)
    return this.http.get(`${environment.url}/horario/verificarDuplicados/registro`, { params });
  }

  VerificarDuplicadosEdicion(id: number, nombre: string) {
    const params = new HttpParams()
      .set('id', id.toString())
      .set('nombre', nombre)
    return this.http.get<any>(`${environment.url}/horario/verificarDuplicados/edicion`, { params });
  }

  // Verificar datos de la plantilla de catálogo horario y cargar al sistema
  VerificarDatosHorario(formData) {
    return this.http.post<any>(`${environment.url}/horario/cargarHorario/verificarDatos/upload`, formData);
  }
  VerificarPlantillaHorario(formData) {
    return this.http.post<any>(`${environment.url}/horario/cargarHorario/verificarPlantilla/upload`, formData);
  }
  CargarHorariosMultiples(formData) {
    return this.http.post<any>(`${environment.url}/horario/cargarHorario/upload`, formData);
  }

}
