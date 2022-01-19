// IMPORTACIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { EditarHorasExtrasComponent } from 'src/app/componentes/catalogos/catHorasExtras/editar-horas-extras/editar-horas-extras.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lista-horas-extras',
  templateUrl: './lista-horas-extras.component.html',
  styleUrls: ['./lista-horas-extras.component.css']
})

export class ListaHorasExtrasComponent implements OnInit {

  horasExtras: any = [];
  filtroDescripcion = '';

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // Control de campos y validaciones del formulario
  nombreF = new FormControl('', [Validators.minLength(2)]);

  // Asignación de validaciones a inputs del formulario
  public BuscarHoraExtraForm = new FormGroup({
    nombreForm: this.nombreF,
  });

  constructor(
    private rest: HorasExtrasService,
    public restE: EmpleadoService,
    public restEmpre: EmpresaService,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
    private router: Router,
    private validacionesService: ValidacionesService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerHorasExtras();
    this.ObtenerEmpleados(this.idEmpleado);
       this.ObtenerLogo();
    this.ObtenerColores();
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
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa')).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // MÉTODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA 
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ObtenerHorasExtras() {
    this.rest.ListarHorasExtras().subscribe(datos => {
      this.horasExtras = datos;
      for (var i = 0; i <= this.horasExtras.length - 1; i++) {
        if (this.horasExtras[i].tipo_descuento === 1) {
          this.horasExtras[i].tipo_descuento = 'Horas Extras';
        }
        else {
          this.horasExtras[i].tipo_descuento = 'Recargo Nocturno';
        }
        if (this.horasExtras[i].hora_jornada === 1) {
          this.horasExtras[i].hora_jornada = 'Diurna';
        }
        else if (this.horasExtras[i].hora_jornada === 2) {
          this.horasExtras[i].hora_jornada = 'Nocturna';
        }
        if (this.horasExtras[i].tipo_dia === 1) {
          this.horasExtras[i].tipo_dia = 'Libre';
        }
        else if (this.horasExtras[i].tipo_dia === 2) {
          this.horasExtras[i].tipo_dia = 'Feriado';
        }
        else {
          this.horasExtras[i].tipo_dia = 'Normal';
        }
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  LimpiarCampos() {
    this.BuscarHoraExtraForm.setValue({
      nombreForm: '',
    });
    this.ObtenerHorasExtras();
  }

  /* Ventana para editar datos de hora extra seleccionado */
  EditarDatos(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarHorasExtrasComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.ObtenerHorasExtras();
      });
  }

  /** Función para eliminar registro seleccionado */
  Eliminar(id_permiso: number) {
    //console.log("probando id", id_prov)
    this.rest.EliminarRegistro(id_permiso).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ObtenerHorasExtras();
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listaHorasExtras']);
        }
      });
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
    sessionStorage.setItem('HorasExtras', this.horasExtras);
    return {

      // Encabezado de la página
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // Pie de página
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');

        var h = new Date();
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
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Lista de Horas Extras Configuradas', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFHorasExtras(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
      }
    };
  }

  Almuerzo: any = ['Si', 'No'];
  presentarDataPDFHorasExtras() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Tipo Recargo', style: 'tableHeader' },
                { text: 'Recargo Porcentual', style: 'tableHeader' },
                { text: 'Hora Inicio', style: 'tableHeader' },
                { text: 'Hora Final', style: 'tableHeader' },
                { text: 'Jornada', style: 'tableHeader' },
                { text: 'Tipo Día', style: 'tableHeader' },
                { text: 'Incluir Almuerzo', style: 'tableHeader' },
              ],
              ...this.horasExtras.map(obj => {
                var incluirAlmuerzo = this.Almuerzo[obj.incl_almuerzo - 1];
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.tipo_descuento, style: 'itemsTable' },
                  { text: obj.reca_porcentaje, style: 'itemsTable' },
                  { text: obj.hora_inicio, style: 'itemsTable' },
                  { text: obj.hora_final, style: 'itemsTable' },
                  { text: obj.hora_jornada, style: 'itemsTable' },
                  { text: obj.tipo_dia, style: 'itemsTable' },
                  { text: incluirAlmuerzo, style: 'itemsTable' },
                ];
              })
            ]
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return (i % 2 === 0) ? '#CCD1D1' : null;
            }
          }
        },
        { width: '*', text: '' },
      ]
    };
  }

  /****************************************************************************************************** 
   *                                       MÉTODO PARA EXPORTAR A EXCEL
   ******************************************************************************************************/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horasExtras);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'HorasExtras');
    xlsx.writeFile(wb, "HorasExtras" + new Date().getTime() + '.xlsx');
  }

  /****************************************************************************************************** 
   *                                        MÉTODO PARA EXPORTAR A CSV 
   ******************************************************************************************************/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horasExtras);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "HorasExtrasCSV" + new Date().getTime() + '.csv');
  }

  /* ****************************************************************************************************
   *                                 PARA LA EXPORTACIÓN DE ARCHIVOS XML
   * ****************************************************************************************************/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arreglohorasExtras = [];
    this.horasExtras.forEach(obj => {
      var incluirAlmuerzo = this.Almuerzo[obj.incl_almuerzo - 1];
      objeto = {
        "horas_extras": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "tipo_descuento": obj.tipo_descuento,
          "reca_porcentaje": obj.reca_porcentaje,
          "hora_inicio": obj.hora_inicio,
          "hora_final": obj.hora_final,
          "hora_jornada": obj.hora_jornada,
          "tipo_dia": obj.tipo_dia,
          "incl_almuerzo": incluirAlmuerzo,
        }
      }
      arreglohorasExtras.push(objeto)
    });

    this.rest.DownloadXMLRest(arreglohorasExtras).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/horasExtras/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

}
