import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class DatosGeneralesService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerDatosActuales(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/datos-actuales/${id_empleado}`);
  }

  BuscarJefes(datos: any) {
    return this.http.post<any>(`${environment.url}/generalidades/buscar-jefes`, datos);
  }

  // METODO DE ACCESO A INFORMACION DE CONFIGURACION DE NOTIFICACIONES
  ObtenerInfoConfiguracion(id_empleado: number) {
    return this.http.get<any>(`${environment.url}/generalidades/info-configuracion/${id_empleado}`);
  }

  AutorizaEmpleado(id_empleado: number) {
    return this.http.get(`${environment.url}/generalidades/empleadoAutoriza/${id_empleado}`);
  }

  ListarInformacionActual() {
    return this.http.get(`${environment.url}/generalidades/info_actual`);
  }

  // CONSULTA DE INFORMACIÓN GENERAL DEL COLABORADOR
  ObtenerInformacion() {
    const estado = 1; // 1 = activo 
    return this.http.get<any>(`${environment.url}/generalidades/informacion-general/${estado}`);
  }


  /** INICIO CONSULTAS PARA FILTRAR INFORMACIÓN */
  VerDatosSucursal(id_sucursal: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/${id_sucursal}`);
  }

  VerDatosSucuDepa(id_sucursal: number, id_departamento: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/departamento/${id_sucursal}/${id_departamento}`);
  }

  VerDatosSucuDepaRegimen(id_sucursal: number, id_departamento: number, id_regimen: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/departamento-regimen/${id_sucursal}/${id_departamento}/${id_regimen}`);
  }

  VerDatosSucuDepaCargo(id_sucursal: number, id_departamento: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/departamento-cargo/${id_sucursal}/${id_departamento}/${id_cargo}`);
  }

  VerDatosSucuCargo(id_sucursal: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/cargo/${id_sucursal}/${id_cargo}`);
  }

  VerDatosSucuRegimen(id_sucursal: number, id_regimen: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/regimen/${id_sucursal}/${id_regimen}`);
  }

  VerDatosSucuRegimenCargo(id_sucursal: number, id_regimen: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/regimen-cargo/${id_sucursal}/${id_regimen}/${id_cargo}`);
  }

  VerDatosSucuRegimenDepartamentoCargo(id_sucursal: number, id_departamento: number, id_regimen: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/sucursal/departamento-regimen-cargo/${id_sucursal}/${id_departamento}/${id_regimen}/${id_cargo}`);
  }

  VerDatosDepartamento(id_departamento: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/departamento/${id_departamento}`);
  }

  VerDatosDepaCargo(id_departamento: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/departamento/cargo/${id_departamento}/${id_cargo}`);
  }

  VerDatosDepaRegimen(id_departamento: number, id_regimen: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/departamento/regimen/${id_departamento}/${id_regimen}`);
  }

  VerDatosDepaRegimenCargo(id_departamento: number, id_regimen: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/departamento/regimen-cargo/${id_departamento}/${id_regimen}/${id_cargo}`);
  }

  VerDatosRegimen(id_regimen: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/regimen/${id_regimen}`);
  }

  VerDatosRegimenCargo(id_regimen: number, id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/regimen-cargo/${id_regimen}/${id_cargo}`);
  }

  VerDatosCargo(id_cargo: number) {
    return this.http.get(`${environment.url}/generalidades/filtros/cargo/${id_cargo}`);
  }
}
