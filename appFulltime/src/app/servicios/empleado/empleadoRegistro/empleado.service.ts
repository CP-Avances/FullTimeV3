import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoService {

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  constructor(
    private http: HttpClient
  ) { }

  // BUSCAR UN REGISTRO DE USUARIO
  BuscarUnEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/empleado/${id}`);
  }

  // BUSCAR LISTA DE EMPLEADOS
  BuscarListaEmpleados() {
    return this.http.get<any>(`${environment.url}/empleado/buscador/empleado`);
  }






  // Empleados  
  getEmpleadosRest() {
    return this.http.get(`${environment.url}/empleado`);
  }

  // BÚSQUEDA DE EMPLEADOS INGRESANDO NOMBRE Y APELLIDO 
  BuscarEmpleadoNombre(data: any) {
    return this.http.post(`${environment.url}/empleado/buscar/informacion`, data);
  }





  postEmpleadoRest(data: any) {
    return this.http.post(`${environment.url}/empleado`, data).pipe(
      catchError(data));
  }

  putEmpleadoRest(data: any, id: number) {
    return this.http.put(`${environment.url}/empleado/${id}/usuario`, data).pipe(
      catchError(data));
  }

  /** Verificar datos de la plantilla de datos con código generado de forma automática */
  verificarArchivoExcel_Automatico(formData) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/automatico/plantillaExcel/`, formData);
  }

  verificarArchivoExcel_DatosAutomatico(formData) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/datos/automatico/plantillaExcel/`, formData);
  }

  subirArchivoExcel_Automatico(formData) {
    return this.http.post<any>(`${environment.url}/empleado/cargar_automatico/plantillaExcel/`, formData);
  }

  /** Verifcar datos de la plantilla de datos con código generado de forma automática */
  verificarArchivoExcel_Manual(formData) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/manual/plantillaExcel/`, formData);
  }

  verificarArchivoExcel_DatosManual(formData) {
    return this.http.post<any>(`${environment.url}/empleado/verificar/datos/manual/plantillaExcel/`, formData);
  }

  subirArchivoExcel_Manual(formData) {
    return this.http.post<any>(`${environment.url}/empleado/cargar_manual/plantillaExcel/`, formData);
  }

  // Servicio para insertar el empleado con sus respectivos titulos
  postEmpleadoTitulos(data: any) {
    return this.http.post(`${environment.url}/empleado/emplTitulos`, data);
  }

  getEmpleadoTituloRest(id: number) {
    return this.http.get(`${environment.url}/empleado/emplTitulos/${id}`);
  }

  putEmpleadoTituloRest(id: number, data: any) {
    return this.http.put(`${environment.url}/empleado/${id}/titulo`, data);
  }

  deleteEmpleadoTituloRest(id: number) {
    return this.http.delete(`${environment.url}/empleado/eliminar/titulo/${id}`);
  }


  /** ***************************************************************************************** ** 
   ** **                        MANEJO DE DATOS DE CONTRATOS                                 ** ** 
   ** ***************************************************************************************** **/

  // REGISTRO DE DATOS DE CONTRATO
  CrearContratoEmpleado(datos: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado`, datos);
  }

  // CARGAR DOCUMENTO CONTRATO
  SubirContrato(formData: any, id: number, nombre: string) {
    return this.http.put(`${environment.url}/contratoEmpleado/${id}/documento/${nombre}`, formData)
  }

  // BUSCAR CONTRATOS POR ID DE EMPLEADO
  BuscarContratosEmpleado(id: number) {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/contrato-empleado/${id}`);
  }

  // EDITAR DATOS DE CONTRATO
  ActualizarContratoEmpleado(id: number, data: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/${id}/actualizar/`, data);
  }

  // ELIMINAR DOCUMENTO DE CONTRATO
  EliminarArchivo(datos: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/eliminar_contrato/base_servidor`, datos)
  }

  // ELIMINAR DOCUMENTO DE CONTRATO DEL SERVIDOR
  EliminarArchivoServidor(datos: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/eliminar_contrato/servidor`, datos)
  }

  // VISUALIZAR DOCUMENTO CONTRATO
  ObtenerUnContrato(id: number) {
    return this.http.get(`${environment.url}/contratoEmpleado/${id}/get`);
  }


  


  BuscarIDContrato(id: number) {
    return this.http.get(`${environment.url}/contratoEmpleado/${id}`);
  }

  BuscarIDContratoActual(id: number) {
    return this.http.get(`${environment.url}/contratoEmpleado/contratoActual/${id}`);
  }

  BuscarDatosContrato(id: number) {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/contrato/${id}`);
  }





  EditarDocumento(id: number, data: any) {
    return this.http.put(`${environment.url}/contratoEmpleado/editar/editarDocumento/${id}`, data);
  }

  BuscarFechaContrato(datos: any) {
    return this.http.post(`${environment.url}/contratoEmpleado/buscarFecha`, datos);
  }

  BuscarFechaIdContrato(datos: any) {
    return this.http.post(`${environment.url}/contratoEmpleado/buscarFecha/contrato`, datos);
  }

  ObtenerContratos() {
    return this.http.get<any>(`${environment.url}/contratoEmpleado`);
  }


  
  /** **************************************************************************************** **
   ** **  SERVICIOS PARA SER USADOS PARA REGISTRAR MODALIDAD DE TRABAJO O TIPO DE CONTRATOS ** **
   ** **************************************************************************************** **/

  // REGISTRAR MODALIDAD DE TRABAJO
  CrearTiposContrato(datos: any) {
    return this.http.post<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo`, datos);
  }

  // BUSCAR LISTA MODALIDAD DE TRABAJO
  BuscarTiposContratos() {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo`);
  }





  BuscarUltimoTiposContratos() {
    return this.http.get<any>(`${environment.url}/contratoEmpleado/modalidad/trabajo/ultimo`);
  }




  // GUARDAR CÓDIGO

  CrearCodigo(datos: any) {
    return this.http.post(`${environment.url}/empleado/crearCodigo`, datos);
  }

  ObtenerCodigo() {
    return this.http.get(`${environment.url}/empleado/encontrarDato/codigo`);
  }

  ActualizarCodigo(datos: any) {
    return this.http.put(`${environment.url}/empleado/cambiarCodigo`, datos);
  }

  ActualizarCodigoTotal(datos: any) {
    return this.http.put(`${environment.url}/empleado/cambiarValores`, datos);
  }

  ObtenerCodigoMAX() {
    return this.http.get(`${environment.url}/empleado/encontrarDato/codigo/empleado`);
  }


  // Servicio para obtener la lista de las nacionalidades
  getListaNacionalidades() {
    return this.http.get<any>(`${environment.url}/nacionalidades`)
  }

  // Servicios para subir las imagenes
  subirImagen(formData, idEmpleado: number) {
    return this.http.put(`${environment.url}/empleado/${idEmpleado}/uploadImage`, formData)
  }

  DownloadXMLRest(data: any) {
    return this.http.post(`${environment.url}/empleado/xmlDownload`, data);
  }
  // verXML(name: string){
  //   return this.http.get<any>(`${environment.url}/empleado/download/${name}`)
  // }

  BuscarDepartamentoEmpleado(datos: any) {
    return this.http.post(`${environment.url}/empleado/buscarDepartamento`, datos);
  }

  // Desactivar varios empleados seleccionados
  DesactivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${environment.url}/empleado/desactivar/masivo`, data)
  }

  ActivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${environment.url}/empleado/activar/masivo`, data)
  }

  ReActivarVariosUsuarios(data: any[]) {
    return this.http.put<any>(`${environment.url}/empleado/re-activar/masivo`, data)
  }

  ListaEmpleadosDesactivados() {
    return this.http.get<any>(`${environment.url}/empleado/desactivados/empleados`);
  }




  /** *********************************************************************** **
   ** **         CONTROL DE GEOLOCALIZACIÓN EN EL SISTEMA                     **
   ** *********************************************************************** **/

  putGeolocalizacion(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/empleado/geolocalizacion/${id}`, data)
  }

  InsertarUbicacion(id: number, codigo: number, data: any) {
    return this.http.post<any>(`${environment.url}/empleado/geolocalizacion-domicilio/${id}/${codigo}`, data)
  }

  ActualizarUbicacionTrabajo(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/empleado/geolocalizacion-trabajo/${id}`, data)
  }

  ActualizarUbicacionDomicilio(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/empleado/geolocalizacion-nuevo-domicilio/${id}`, data)
  }

  BuscarUbicacion(id: number) {
    return this.http.get<any>(`${environment.url}/empleado/ubicacion/${id}`);
  }

  ActualizarUbicacion(id: number, data: any) {
    return this.http.put<any>(`${environment.url}/empleado/actualizar-geolocalizacion/${id}`, data);
  }

}
