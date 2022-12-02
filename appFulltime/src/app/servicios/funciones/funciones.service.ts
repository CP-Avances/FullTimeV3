import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  constructor(
    private http: HttpClient,
  ) { }

  
  // METODO PARA LISTAR FUNCIONES ACTIVAS DEL SISTEMA
  ListarFunciones() {
    return this.http.get<any>(`${environment.url}/administracion/funcionalidad`)
  }






  CrearFunciones(data: any) {
    return this.http.post(`${environment.url}/administracion`, data);
  }

  EditarFunciones(id: number, data: any) {
    return this.http.put(`${environment.url}/administracion/funcion/${id}`, data);
  }


}
