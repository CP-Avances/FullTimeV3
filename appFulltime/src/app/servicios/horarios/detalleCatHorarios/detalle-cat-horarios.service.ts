import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DetalleCatHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  // Detalle Horario 

  ConsultarDetalleHorario() {
    return this.http.get(`${environment.url}/detalleHorario`);
  }

  IngresarDetalleHorarios(datos: any) {
    return this.http.post(`${environment.url}/detalleHorario`, datos);
  }

  ConsultarUnDetalleHorario(id: number) {
    return this.http.get(`${environment.url}/detalleHorario/${id}`);
  }

  ActualizarRegistro(data: any) {
    return this.http.put(`${environment.url}/detalleHorario`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/detalleHorario/eliminar/${id}`);
  }

  // Verificar datos de la plantilla de detalles de horraio y cargarlos al sistema
  CargarPlantillaDetalles(formData) {
    return this.http.post<any>(environment.url + '/detalleHorario/upload', formData)
  }
  VerificarDatosDetalles(formData) {
    return this.http.post<any>(environment.url + '/detalleHorario/verificarDatos/upload', formData)
  }
}
