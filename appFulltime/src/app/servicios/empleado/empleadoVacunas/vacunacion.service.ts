import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class VacunacionService {

  constructor(
    private http: HttpClient,

  ) { }

  // SERVICIO REGISTROS DE VACUNACIÓN
  CrearRegistroVacunacion(data: any) {
    return this.http.post(`${environment.url}/vacunas`, data);
  }

  ObtenerVacunaEmpleado(id_empleado: number) {
    return this.http.get(`${environment.url}/vacunas/${id_empleado}`);
  }

  ActualizarRegistroVacuna(id: number, data: any) {
    return this.http.put(`${environment.url}/vacunas/${id}`, data);
  }

  EliminarRegistroVacuna(id: number) {
    return this.http.delete(`${environment.url}/vacunas/eliminar/${id}`);
  }

  SubirDocumento(formData, id: number) {
    return this.http.put(`${environment.url}/vacunas/${id}/documento`, formData)
  }

  ConsultarUltimaVacuna() {
    return this.http.get(`${environment.url}/vacunas/buscar/ultimo`);
  }


  // SERVICIOS DE REGISTROS DE TIPO DE VACUNACIÓN
  CrearTipoVacuna(data: any) {
    return this.http.post<any>(`${environment.url}/vacunas/tipo_vacuna`, data);
  }

  ListarTiposVacuna() {
    return this.http.get(`${environment.url}/vacunas/lista/tipo_vacuna`);
  }
}
