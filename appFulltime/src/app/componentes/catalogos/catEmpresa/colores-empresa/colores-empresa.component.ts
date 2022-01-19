import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import * as moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'app-colores-empresa',
  templateUrl: './colores-empresa.component.html',
  styleUrls: ['./colores-empresa.component.css']
})
export class ColoresEmpresaComponent implements OnInit {

  selec1 = false;
  selec2 = false;
  selec3 = false;
  selec4 = false;
  ingresarOtro = false;
  verOtro: any;

  fraseReporte = new FormControl('');
  nuevaF = new FormControl('');

  public fraseForm = new FormGroup({
    fraseReporteF: this.fraseReporte,
    nuevaForm: this.nuevaF
  });

  principal = new FormControl('');
  secundario = new FormControl('');

  public coloresForm = new FormGroup({
    color_p: this.principal,
    color_s: this.secundario
  });

  idEmpleado: number;
  empleado: any = [];
  p_color: any;
  s_color: any;
  frase: any;

  verColores: boolean = false;
  verFrase: boolean = false;

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private rest: EmpresaService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
    public dialogRef: MatDialogRef<ColoresEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.VerFormularios();
    this.obtenerColores();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerLogo();
  }

  VerFormularios() {
    if (this.data.ventana === 'colores') {
      this.verColores = true;
    } else {
      this.verFrase = true;
      this.ImprimirFrase();
    }
  }

  // Método para ver la información del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // Método para obtener el logo de la empresa
  logo: any = String;
  ObtenerLogo() {
    this.rest.LogoEmpresaImagenBase64(localStorage.getItem('empresa')).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  CambiarColores() {
    this.habilitarprogress = true;
    let datos = {
      color_p: this.p_color,
      color_s: this.s_color,
      id: this.data.datos.id
    }
    this.rest.ActualizarColores(datos).subscribe(data => {
      this.toastr.success('Nuevos colores registrados exitosamente', '', {
        timeOut: 6000,
      });
      this.obtenerColores();
      this.dialogRef.close({ actualizar: true });
      this.habilitarprogress = false;
    })
  }

  empresas: any = [];
  obtenerColores() {
    this.empresas = [];
    this.rest.ConsultarDatosEmpresa(this.data.datos.id).subscribe(res => {
      this.empresas = res;
      this.p_color = this.empresas[0].color_p;
      this.s_color = this.empresas[0].color_s;
      this.frase = this.empresas[0].marca_agua;
    });
  }

  ImprimirFrase() {
    if (this.data.datos.marca_agua === 'FullTime') {
      this.selec1 = true;
      this.fraseForm.patchValue({ fraseReporteF: 'Fulltime' });
    }
    else if (this.data.datos.marca_agua === 'Confidencial') {
      this.selec2 = true;
      this.fraseForm.patchValue({ fraseReporteF: 'Confidencial' });
    }
    else if (this.data.datos.marca_agua === '') {
      this.selec3 = true;
      this.fraseForm.patchValue({ fraseReporteF: '' });
    }
    else {
      this.selec4 = true;
      this.fraseForm.patchValue({ fraseReporteF: 'Otro' });
    }
  }

  IngresarFrase() {
    this.verOtro = { 'visibility': 'visible' }; this.ingresarOtro = true;
  }

  CambiarFrase(ob: MatRadioChange) {
    this.verOtro = { 'visibility': 'hidden' }; this.ingresarOtro = false;
    this.fraseForm.patchValue({
      nuevaForm: ''
    })
    this.frase = ob.value
  }

  VerArchivo(form) {
    if (form.fraseReporteF === 'Otro') {
      if (form.nuevaForm != '') {
        this.frase = form.nuevaForm;
        this.generarPdf('open');
      }
      else {
        this.toastr.info('Por favor ingrese una frase o seleccione otra de las opciones listadas.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.generarPdf('open');
    }
  }

  ActualizarFrase() {
    this.habilitarprogress = true;
    let datos = {
      marca_agua: this.frase,
      id: this.data.datos.id
    }
    this.rest.ActualizarMarcaAgua(datos).subscribe(data => {
      this.toastr.success('Nueva frase registrada exitosamente', '', {
        timeOut: 6000,
      });
      this.obtenerColores();
      this.dialogRef.close({ actualizar: true });
      this.habilitarprogress = false;
    })
  }

  GuardarFrase(form) {
    if (form.fraseReporteF === 'Otro') {
      if (form.nuevaForm != '') {
        this.frase = form.nuevaForm;
        this.ActualizarFrase();
      }
      else {
        this.toastr.info('Por favor ingrese una frase o seleccione otra de las opciones listadas.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ActualizarFrase();
    }
  }

  /****************************************************************************************************** 
  *                                         MÉTODO PARA EXPORTAR A PDF
  ******************************************************************************************************/
  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  getDocumentDefinicion() {
    sessionStorage.setItem('Empresas', this.empresas);

    return {

      // Encabezado de la página
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 5, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // Pie de página
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var h = new Date();
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        // Formato de hora actual
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + time, ,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue', opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Prueba de Colores', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFEmpresas(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        tableHeaderS: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.s_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' },
      }
    };
  }

  presentarDataPDFEmpresas() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', '*', '*', 'auto', 'auto', '*', '*'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'RUC', style: 'tableHeader' },
                { text: 'Dirección', style: 'tableHeader' },
                { text: 'Teléfono', style: 'tableHeader' },
                { text: 'Correo', style: 'tableHeader' },
                { text: 'Tipo de Empresa', style: 'tableHeader' },
                { text: 'Representante', style: 'tableHeader' },
                { text: 'Resumen', style: 'tableHeaderS' }
              ],
              ...this.empresas.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.ruc, style: 'itemsTableC' },
                  { text: obj.direccion, style: 'itemsTable' },
                  { text: obj.telefono, style: 'itemsTableC' },
                  { text: obj.correo, style: 'itemsTable' },
                  { text: obj.tipo_empresa, style: 'itemsTable' },
                  { text: obj.representante, style: 'itemsTable' },
                  { text: 'Generalidades', style: 'itemsTable' },
                ];
              })
            ]
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  cerrarVentana() {
    this.dialogRef.close({ actualizar: false });
  }

}
