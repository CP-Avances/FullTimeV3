import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainNavService {

  private consultarFuncionalidad: any;

  constructor(
    private http: HttpClient,
  ) { }

  LogicaFunciones() {
    this.consultarFuncionalidad = sessionStorage.getItem('queryFuncionalidad');
    
    if (this.consultarFuncionalidad === null) {
      this.http.get<any>(`${environment.url}/administracion/funcionalidad`).subscribe((res: any) => {
        const [ result ] = res
        sessionStorage.setItem('queryFuncionalidad', JSON.stringify(result))
        this.ValueFuncionalidad(result);
      }, error => {
        console.log(error);
        this.DefaultFuncionalidad();
      })
      
    } else {
      const result = JSON.parse(this.consultarFuncionalidad)
      this.ValueFuncionalidad(result);
    }

  }

  private _AccionesPersonal: boolean = false;
  private _HoraExtra: boolean = false;
  private _Alimentacion: boolean = false;
  private _Permisos: boolean = false;
  private _Reportes: boolean = false;

  get accionesPersonal() { return this._AccionesPersonal; }
  setAccionesPersonal(arg: boolean) { this._AccionesPersonal = arg }
  
  get horasExtras() { return this._HoraExtra; }
  setHoraExtra(arg: boolean) { this._HoraExtra = arg }

  get alimentacion() { return this._Alimentacion; }
  setAlimentacion(arg: boolean) { this._Alimentacion = arg }

  get permisos() { return this._Permisos; }
  setPermisos(arg: boolean) { this._Permisos = arg }

  get reportes() { return this._Reportes; }
  setReportes(arg: boolean) { this._Reportes = arg }

  private DefaultFuncionalidad(value = false) {
    this.setAccionesPersonal(value);
    this.setHoraExtra(value);
    this.setAlimentacion(value);
    this.setPermisos(value);
    this.setReportes(value);
  }

  public ValueFuncionalidad(value: any) {
    const { accion_personal, alimentacion, hora_extra, permisos, reportes } = value
    
    this.setAccionesPersonal(accion_personal);
    this.setHoraExtra(hora_extra);
    this.setAlimentacion(alimentacion);
    this.setPermisos(permisos);
    this.setReportes(reportes);
  }

}
