import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})

export class EmpresaService {

  constructor(
    private http: HttpClient,
  ) { }

  //Empresas

  ConsultarEmpresas() {
    return this.http.get(`${environment.url}/empresas`);
  }

  IngresarEmpresas(datos: any) {
    return this.http.post(`${environment.url}/empresas`, datos);
  }

  ActualizarEmpresa(datos: any) {
    return this.http.put(`${environment.url}/empresas`, datos);
  }

  ConsultarUnaEmpresa(nombre: string) {
    return this.http.get(`${environment.url}/empresas/buscar/${nombre}`);
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/empresas/xmlDownload`, data);
  }

  EliminarRegistro(id: number) {
    return this.http.delete(`${environment.url}/empresas/eliminar/${id}`);
  }

  ConsultarDatosEmpresa(id: number) {
    return this.http.get(`${environment.url}/empresas/buscar/datos/${id}`);
  }

  ActualizarColores(formData) {
    return this.http.put<any>(`${environment.url}/empresas/colores`, formData);
  }

  ActualizarSeguridad(formData) {
    return this.http.put<any>(`${environment.url}/empresas/doble/seguridad`, formData);
  }

  ActualizarMarcaAgua(formData) {
    return this.http.put<any>(`${environment.url}/empresas/reporte/marca`, formData);
  }

  ActualizarAccionesTimbres(formData) {
    return this.http.put<any>(`${environment.url}/empresas/acciones-timbre`, formData);
  }

  /**
   * Método para llamar al logotipo de la empresa, este llega codificado en base64
   * @param id_empresa ID de la empresa
   */

  LogoEmpresaImagenBase64(id_empresa: string) {
    return this.http.get<any>(`${environment.url}/empresas/logo/codificado/${parseInt(id_empresa)}`)
  }

  EditarLogoEmpresa(id_empresa: number, formData) {
    return this.http.put<any>(`${environment.url}/empresas/logo/${id_empresa}/uploadImage`, formData);
  }

  EditarCredenciales(id_empresa: number, data: any) {
    return this.http.put<any>(`${environment.url}/empresas/credenciales/${id_empresa}`, data);
  }

  ConsultarEmpresaCadena() {
    return this.http.get(`${environment.url}/empresas/navegar`);
  }

}
