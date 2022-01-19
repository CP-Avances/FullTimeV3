import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EmplCargosService {

  constructor(private http: HttpClient) { }

  getEmpleadoCargosRest() {
    return this.http.get(`${environment.url}/empleadoCargos`);
  }

  getListaEmpleadoCargosRest() {
    return this.http.get(`${environment.url}/empleadoCargos/lista-empleados`);
  }

  getUnCargoRest(id: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/${id}`);
  }

  getInfoCargoEmpleadoRest(id_empl_contrato: number) {
    return this.http.get<any>(`${environment.url}/empleadoCargos/cargoInfo/${id_empl_contrato}`);
  }

  postEmpleadoCargosRest(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos`, data);
  }

  BuscarIDCargo(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/${id}`);
  }

  BuscarIDCargoActual(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargoActual/${id}`);
  }

  ActualizarContratoEmpleado(id: number, id_empl_contrato: number, data: any) {
    return this.http.put(`${environment.url}/empleadoCargos/${id_empl_contrato}/${id}/actualizar/`, data);
  }

  ListarEmpleadosAutorizacion(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/empleadosAutorizan/${id}`);
  }

  // SERVICIOS TIPO CARGO
  ObtenerTipoCargos() {
    return this.http.get(`${environment.url}/empleadoCargos/listar/tiposCargo`);
  }

  CrearTipoCargo(data: any) {
    return this.http.post(`${environment.url}/empleadoCargos/tipo_cargo`, data);
  }

  ObtenerUltimoTipoCargos() {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/ultimoTipo/cargo`);
  }

  ObtenerUnTipoCargo(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/ultimoTipo/nombreCargo/${id}`);
  }

  ObtenerCargoDepartamento(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-departamento/${id}`);
  }

  ObtenerCargoSucursal(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-sucursal/${id}`);
  }

  ObtenerCargoRegimen(id: number) {
    return this.http.get(`${environment.url}/empleadoCargos/buscar/cargo-regimen/${id}`);
  }

}
