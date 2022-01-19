import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DepartamentosService {

  constructor(
    private http: HttpClient,
  ) { }

  // catalogo de departamentos

  ConsultarDepartamentos() {
    return this.http.get(`${environment.url}/departamento`);
  }

  ConsultarDepartamentoPorContrato(id_cargo: number) {
    return this.http.get(`${environment.url}/departamento/busqueda-cargo/${id_cargo}`);
  }

  ConsultarNombreDepartamentos() {
    return this.http.get(`${environment.url}/departamento/nombreDepartamento`);
  }

  ConsultarIdNombreDepartamentos(nombreDepartamento: string) {
    return this.http.get(`${environment.url}/departamento/idDepartamento/${nombreDepartamento}`);
  }

  postDepartamentoRest(data: any) {
    return this.http.post(`${environment.url}/departamento`, data).pipe(
      catchError(data)
    );
  }

  getIdDepartamentoPadre(departamentoPadre: string) {
    return this.http.get(`${environment.url}/departamento/busqueda/${departamentoPadre}`);
  }

  updateDepartamento(idDepartamento: number, data: any) {
    return this.http.put(`${environment.url}/departamento/${idDepartamento}`, data).pipe(
      catchError(data)
    );
  }

  EncontrarUnDepartamento(id: number) {
    return this.http.get(`${environment.url}/departamento/${id}`);
  }

  BuscarDepartamentoSucursal(id: number) {
    return this.http.get(`${environment.url}/departamento/buscarDepa/${id}`);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/departamento/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/departamento/eliminar/${id}`);
  }

  BuscarDepaSucursal(id_sucursal: number) {
    return this.http.get(`${environment.url}/departamento/buscar/datosDepartamento/${id_sucursal}`);
  }

  BuscarDepartamentoRegimen(id: number) {
    return this.http.get(`${environment.url}/departamento/buscar/regimen-departamento/${id}`);
  }

}
