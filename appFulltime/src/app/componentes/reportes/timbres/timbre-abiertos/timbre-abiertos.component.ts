// IMPORTAR LIBRERIAS
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from 'moment';

// IMPORTAR SERVICIOS Y MODELOS
import { ReportesAsistenciasService } from '../../../../servicios/reportes/reportes-asistencias.service';
import { PlantillaReportesService } from '../../plantilla-reportes.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { EmpleadoService } from '../../../../servicios/empleado/empleadoRegistro/empleado.service';
import { ReportesService } from '../../../../servicios/reportes/reportes.service';
import { ITableEmpleados } from '../../../../model/reportes.model';

@Component({
  selector: 'app-timbre-abiertos',
  templateUrl: './timbre-abiertos.component.html',
  styleUrls: ['./timbre-abiertos.component.css']
})

export class TimbreAbiertosComponent implements OnInit {

  empleados: any = [];

  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  get rangoFechas() { return this.reporteService.rangoFechas; }

  filtroApellido: '';
  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // GETTERS DE COLORES, NOMBRE EMPRESA Y LOGO PARA COLOCAR EN REPORTE 
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  // get urlImagen() : string { return this.plantillaPDF.logoBase64 }
  // get nombreEmpresa(): string { return this.plantillaPDF.nameEmpresa}
  data_pdf: any = [];

  constructor(
    private validacionesService: ValidacionesService,
    private metodosAsistencia: ReportesAsistenciasService,
    private reporteService: ReportesService,
    private empeadoService: EmpleadoService,
    private plantillaPDF: PlantillaReportesService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.obtenerEmpleados();
  }

  ngOnDestroy(): void {
    this.empleados = [];
    this.data_pdf = [];
  }

  obtenerEmpleados() {
    this.empeadoService.getEmpleadosRest().subscribe(obj => {
      // console.log(obj);
      this.empleados = obj
    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })
  }

  validacionReporte(action) {

    if (this.rangoFechas.fec_inico === '' || this.rangoFechas.fec_final === '') return this.toastr.error('Primero valide fechas de busqueda')
    // console.log(this.selectionEmp.selected);
    const arrayIds = this.selectionEmp.selected.map(o => {
      return { id: o.id, codigo: o.codigo, fullname: o.nombre + ' ' + o.apellido, cedula: o.cedula }
    })
    this.metodosAsistencia.ReporteTimbresAbiertos(arrayIds, this.rangoFechas.fec_inico, this.rangoFechas.fec_final).subscribe(res => {
      console.log(res);
      this.data_pdf = res;
      console.log('ver data timbres', this.data_pdf)
      switch (action) {
        case 'excel':
          // aqui poner metodo de generar excel
          break;
        default:
          this.generarPdf(action)
          break;
      }

    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })

  }

  generarPdf(action) {
    const documentDefinition = this.getDocumentDefinicion();
    var f = new Date()
    let doc_name = "Reporte timbre abiertos" + f.toLocaleString() + ".pdf";
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(doc_name); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicion() {
    return {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [30, 60, 30, 40],
      watermark: { text: 'Confidencial', color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: this.plantillaPDF.headerText(),

      footer: function (currentPage, pageCount, fecha) {
        const h = new Date();
        const f = moment();
        fecha = f.format('YYYY-MM-DD');
        h.setUTCHours(h.getHours());
        const time = h.toJSON().split("T")[1].split(".")[0];

        return {
          margin: [10, 2, 0, -2],
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ],
          fontSize: 10
        }
      },
      content: [
        ...this.plantillaPDF.EncabezadoVertical('Reporte - Timbres Horario Abierto', this.rangoFechas.fec_inico, this.rangoFechas.fec_final),
        ...this.impresionDatosPDF(this.data_pdf).map(obj => {
          return obj
        })
      ],
      styles: {
        itemsTableInfoBlanco: { fontSize: 10, margin: [0, 3, 0, 3] },
        tableMarginCabecera: { margin: [0, 10, 0, 0] },
        itemsTableCentrado: { fontSize: 10, alignment: 'center' },
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        tableMargin: { margin: [0, 0, 0, 10] },
        itemsTable: { fontSize: 8 },
        quote: { margin: [5, -2, 0, -2], italics: true },
        small: { fontSize: 8, color: 'blue', opacity: 0.5 }
      }
    };
  }

  impresionDatosPDF(dataPFD) {

    let n = [];
    let c = 0;

    dataPFD.forEach(obj => {

      n.push({
        style: 'tableMarginCabecera',
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              {
                border: [true, true, false, false],
                text: 'EMPLEADO: ' + obj.fullname,
                style: 'itemsTableInfoBlanco'
              },
              {
                border: [false, true, false, false],
                text: 'C.C.: ' + obj.cedula,
                style: 'itemsTableInfoBlanco'
              },
              {
                border: [false, true, true, false],
                text: 'COD: ' + obj.codigo,
                style: 'itemsTableInfoBlanco'
              }
            ]
          ]
        }
      });

      n.push({
        style: 'tableMargin',
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 60, 60, '*'],
          body: [
            [
              { rowSpan: 2, text: 'N°', style: 'tableHeader', margin: [0, 7, 0, 0] },
              { colSpan: 2, text: 'Timbre', style: 'tableHeader', margin: [0, 7, 0, 0] },
              '',
              { colSpan: 2, text: 'Timbre Servidor', style: 'tableHeader', margin: [0, 7, 0, 0] },
              '',
              { rowSpan: 2, text: 'Observación', style: 'tableHeader', margin: [0, 7, 0, 0] },
              { rowSpan: 2, text: 'Acción', style: 'tableHeader', margin: [0, 7, 0, 0] },
              { rowSpan: 2, text: 'Latitud', style: 'tableHeader', margin: [0, 7, 0, 0] },
              { rowSpan: 2, text: 'Longitud', style: 'tableHeader', margin: [0, 7, 0, 0] },
              { rowSpan: 2, text: 'Dispositivo', style: 'tableHeader', margin: [0, 7, 0, 0] }
            ],
            [
              '',
              { text: 'Fecha', style: 'tableHeader', fontSize: 7 },
              { text: 'Hora', style: 'tableHeader', fontSize: 7 },
              { text: 'Fecha', style: 'tableHeader', fontSize: 7 },
              { text: 'Hora', style: 'tableHeader', fontSize: 7 },
              '', '', '', '', ''
            ],
            ...obj.timbres.map(obj3 => {
              c = c + 1
              return [
                { style: 'itemsTableCentrado', text: c },
                { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[0] },
                { style: 'itemsTable', text: obj3.fec_hora_timbre.split(' ')[1] },
                { style: 'itemsTable', text: obj3.fec_hora_timbre_servidor.split(' ')[0] },
                { style: 'itemsTable', text: (obj3.fec_hora_timbre_servidor.split(' ')[1]).split('.')[0] },
                { style: 'itemsTable', text: obj3.observacion },
                { style: 'itemsTableCentrado', text: obj3.accion },
                { style: 'itemsTable', text: obj3.latitud },
                { style: 'itemsTable', text: obj3.longitud },
                { style: 'itemsTable', text: obj3.dispositivo_timbre }
              ]
            })
          ]
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex % 2 === 0) ? '#E5E7E9' : null;
          }
        }
      })
    });

    return n
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt)
  }

  IngresarSoloLetras(e) {
    return this.validacionesService.IngresarSoloLetras(e);
  }

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }

}
