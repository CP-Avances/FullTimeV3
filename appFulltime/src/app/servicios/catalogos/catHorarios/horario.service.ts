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

  // REGISTRAR HORARIO
  RegistrarHorario(data: any) {
    return this.http.post<any>(`${environment.url}/horario`, data);
  }

  // BUSCAR HORARIO POR EL NOMBRE
  BuscarHorarioNombre(nombre: string) {
    const params = new HttpParams()
      .set('nombre', nombre)
    return this.http.get(`${environment.url}/horario/buscar-horario/nombre`, { params });
  }

  // CARGAR ARCHIVO DE RESPALDO
  SubirArchivo(formData: any, id: number, nombre: string) {
    return this.http.put(`${environment.url}/horario/${id}/documento/${nombre}`, formData)
  }

  // ACTUALIZACION DE HORARIO
  ActualizarHorario(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/editar/${id}`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO
  EliminarArchivo(datos: any) {
    return this.http.put(`${environment.url}/horario/eliminar_horario/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${environment.url}/horario/eliminar_horario/servidor`, datos)
  }










  // Catálogo de Horarios
  getHorariosRest() {
    return this.http.get(`${environment.url}/horario`);
  }

  getOneHorarioRest(id: number) {
    return this.http.get(`${environment.url}/horario/${id}`);
  }





  updateHorasTrabajaByDetalleHorario(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/update-horas-trabaja/${id}`, data);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/horario/xmlDownload`, data);
  }



  EditarDocumento(id: number, data: any) {
    return this.http.put(`${environment.url}/horario/editar/editarDocumento/${id}`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/horario/eliminar/${id}`);
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
