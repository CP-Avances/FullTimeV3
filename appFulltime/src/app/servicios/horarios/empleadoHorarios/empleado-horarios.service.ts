import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class EmpleadoHorariosService {

  constructor(
    private http: HttpClient,
  ) { }

  //Horarios Empleado

  ConsultarEmpleadoHorarios() {
    return this.http.get(`${environment.url}/empleadoHorario`);
  }

  IngresarEmpleadoHorarios(datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario`, datos);
  }

  BuscarHorarioCargo(id: any) {
    return this.http.get(`${environment.url}/empleadoHorario/horarioCargo/${id}`);
  }

  CargaMultiple(formData) {
    return this.http.post(`${environment.url}/empleadoHorario/cargaMultiple`, formData)
  }

  BuscarNumeroHoras(datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/horas`, datos);
  }

  ActualizarDatos(datos: any) {
    return this.http.put(`${environment.url}/empleadoHorario`, datos);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/empleadoHorario/eliminar/${id}`);
  }

  ObtenerHorariosFechasEmpleado(id_empleado: number, data: any) {
    return this.http.post(`${environment.url}/empleadoHorario/fechas_horario/${id_empleado}`, data)
  }

  VerificarDuplicidadHorarios(id_empl: number, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/validarFechas/${id_empl}`, datos);
  }

  VerificarDuplicidadHorariosEdicion(id: number, codigo: number, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/validarFechas/horarioEmpleado/${id}/empleado/${codigo}`, datos);
  }

  // MÉTODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS
  VerificarHorariosExistentes(id_empl: number, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/horarios-existentes/${id_empl}`, datos);
  }

    // MÉTODO PARA BUSCAR HORARIOS DE EMPLEADO EN UN RANGO DE FECHAS
    VerificarHorariosExistentesEdicion(id_empl: number, datos: any) {
      return this.http.post(`${environment.url}/empleadoHorario/horarios-existentes-edicion/${id_empl}`, datos);
    }

  // Verificar datos de la plantilla de horario fijo
  VerificarDatos_EmpleadoHorario(formData: any, id: number) {
    console.log('entra')
    return this.http.post<any>(`${environment.url}/empleadoHorario/revisarData/${id}`, formData)
  }
  VerificarPlantilla_EmpleadoHorario(formData: any) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/verificarPlantilla/upload`, formData)
  }
  CreaPlanificacion(formData: any, id: number, codigo: number) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/plan_general/upload/${id}/${codigo}`, formData)
  }
  SubirArchivoExcel(formData: any, id: number, codigo: number) {
    return this.http.post<any>(`${environment.url}/empleadoHorario/upload/${id}/${codigo}`, formData)
  }

  BuscarHorarioFechas(codigo: any, datos: any) {
    return this.http.post(`${environment.url}/empleadoHorario/busqueda-horarios/${codigo}`, datos);
  }
}
