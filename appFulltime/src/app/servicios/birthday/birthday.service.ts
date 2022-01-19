import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {

  constructor(
    private http: HttpClient,
  ) { }

  ObtenerBirthdayEmpresa(id_empresa: number){
    return this.http.get(`${environment.url}/birthday/${id_empresa}`);
  }

  CrearBirthday(data: any){ 
    return this.http.post(`${environment.url}/birthday`, data);
  }

  EditarBirthday(id_birthday: number, data: any) {
    return this.http.put(`${environment.url}/birthday/editar/${id_birthday}`, data)
  }

  SubirImagenBirthday(formData, id_empresa: number) {
    return this.http.put(`${environment.url}/birthday/${id_empresa}/uploadImage`, formData)
  }

}
