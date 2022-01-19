import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlantillaReportesService {

  constructor(
    private http: HttpClient,
  ) { }

  // Método para obtener colores y logotipo empresa

  private _imagenBase64: string;
  private _nameEmpresa: string;

  get logoBase64(): string { return this._imagenBase64 }
  setLogoBase64(arg: string) { this._imagenBase64 = arg }

  get nameEmpresa(): string { return this._nameEmpresa }
  setNameEmpresa(arg: string) { this._nameEmpresa = arg }

  private p_color: any;
  private s_color: any;
  private marca: any;

  get color_Primary(): string { return this.p_color }
  setColorPrimary(arg: string) { this.p_color = arg }

  get color_Secundary(): string { return this.s_color }
  setColorSecondary(arg: string) { this.s_color = arg }

  get marca_Agua(): string { return this.marca }
  setMarcaAgua(arg: string) { this.marca = arg }

  ShowColoresLogo(id: string) {
    const logoBase64 = sessionStorage.getItem('logo');
    const name_empresa = localStorage.getItem('name_empresa');

    if (logoBase64 === null || name_empresa === null) {
      localStorage.removeItem('name_empresa');
      this.http.get<any>(`${environment.url}/empresas/logo/codificado/${id}`).subscribe(res => {
        this.setLogoBase64('data:image/jpeg;base64,' + res.imagen);
        this.setNameEmpresa(res.nom_empresa);
        sessionStorage.setItem('logo', 'data:image/jpeg;base64,' + res.imagen)
        localStorage.setItem('name_empresa', res.nom_empresa)
      }, err => {
        sessionStorage.removeItem('logo')
        localStorage.removeItem('name_empresa');
        console.log(err);
      })
    } else {
      this.setLogoBase64(logoBase64);
      this.setNameEmpresa(name_empresa);
    }

    const p = sessionStorage.getItem('p_color');
    const s = sessionStorage.getItem('s_color');

    if (p === null || s === null) {
      this.http.get(`${environment.url}/empresas/buscar/datos/${id}`).subscribe(res => {
        this.setColorPrimary(res[0].color_p);
        this.setColorSecondary(res[0].color_s);
        sessionStorage.setItem('p_color', res[0].color_p)
        sessionStorage.setItem('s_color', res[0].color_s)
      }, err => {
        sessionStorage.removeItem('p_color');
        sessionStorage.removeItem('s_color');
        console.log(err);
      })
    } else {
      this.setColorPrimary(p);
      this.setColorSecondary(s);
    }

    // FRASE DE MARCA DE AGUA EN REPORTES
    sessionStorage.removeItem('marca');
    this.http.get(`${environment.url}/empresas/buscar/datos/${id}`).subscribe(res => {
      this.setMarcaAgua(res[0].marca_agua);
      sessionStorage.setItem('marca', res[0].marca_agua)
    }, err => {
      sessionStorage.removeItem('marca');
      console.log(err);
    })

  }

  headerText() {
    console.log('llego a header text');
    return {
      text: 'Impreso por:  ' + localStorage.getItem('fullname_print'),
      margin: 10,
      fontSize: 9,
      opacity: 0.3,
      alignment: 'right'
    }
  }

  EncabezadoVertical(titulo, fec_inicio, fec_final) {
    console.log('llego a encabezado');

    return [
      { image: this.logoBase64, width: 100, margin: [10, -25, 0, 5] },
      { text: localStorage.getItem('name_empresa'), bold: true, fontSize: 21, alignment: 'center', margin: [0, -30, 0, 10] },
      { text: titulo, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
      { text: 'Periodo del: ' + fec_inicio + " al " + fec_final, bold: true, fontSize: 12, alignment: 'center', margin: [0, 5, 0, 5] },
    ]
  }


}
