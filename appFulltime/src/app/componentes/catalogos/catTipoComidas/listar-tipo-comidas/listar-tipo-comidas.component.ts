// IMPORTACIÓN DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';

// IMPORTAR COMPONENTES
import { EditarTipoComidasComponent } from 'src/app/componentes/catalogos/catTipoComidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { TipoComidasComponent } from 'src/app/componentes/catalogos/catTipoComidas/tipo-comidas/tipo-comidas.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { DetalleMenuComponent } from '../detalle-menu/detalle-menu.component';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-listar-tipo-comidas',
  templateUrl: './listar-tipo-comidas.component.html',
  styleUrls: ['./listar-tipo-comidas.component.css']
})

export class ListarTipoComidasComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('', [Validators.minLength(2)]);
  tipoF = new FormControl('', [Validators.minLength(1)]);
  archivoForm = new FormControl('', Validators.required);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarTipoComidaForm = new FormGroup({
    nombreForm: this.nombreF,
    tipoForm: this.tipoF
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS  
  tipoComidas: any = [];
  empleado: any = [];

  idEmpleado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  filtroNombre = ''; // VARIABLE DE BÚSQUEDA FILTRO DE DATOS
  filtroTipo = ''; // VARIABLE DE BÚSQUEDA DE FILTRO DE DATOS TIPO SERVICIO

  // ITEMS DE PAGINACIÓN DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // VARIABLE DE NAVEGACION ENTRE RUTAS
  hipervinculo: string = environment.url

  // MÉTODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public vistaRegistrarDatos: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private rest: TipoComidasService, // SERVICIO DATOS DE TIPOS DE SERVICIOS DE COMIDAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    public router: Router, // VARIABLE DE MANEJO DE RUTAS URL
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerTipoComidas();
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // EVENTO QUE MUESTRA FILAS DETERMINADAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LECTURA DE DATOS
  ObtenerTipoComidas() {
    this.tipoComidas = [];
    this.rest.ConsultarTipoComida().subscribe(datos => {
      this.tipoComidas = datos;
      console.log('tipo_comidas', this.tipoComidas)
    })
  }

  AbrirVentanaRegistrarTipoComidas(): void {
    this.vistaRegistrarDatos.open(TipoComidasComponent, { width: '350px' }).afterClosed().subscribe(items => {
      this.ObtenerTipoComidas();
    });
  }

  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarTipoComidasComponent, { width: '350px', data: datosSeleccionados }).afterClosed().subscribe(items => {
      this.ObtenerTipoComidas();
    });
  }

  AbrirVentanaDetalles(datosSeleccionados): void {
    this.vistaRegistrarDatos.open(DetalleMenuComponent,
      { width: '350px', data: { menu: datosSeleccionados, vista: 'lista' } })
      .afterClosed().subscribe(item => {
      });
  }

  LimpiarCampos() {
    this.BuscarTipoComidaForm.setValue({
      nombreForm: '',
      tipoForm: ''
    });
    this.ObtenerTipoComidas();
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_tipo: number) {
    this.rest.EliminarRegistro(id_tipo).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerTipoComidas();
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarTipoComidas']);
        }
      });
  }


  /****************************************************************************************************** 
   *                                         MÉTODO PARA EXPORTAR A PDF
   ******************************************************************************************************/
  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Comidas', this.tipoComidas);
    return {
      // ENCABEZADO DE LA PÁGINA
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PÁGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
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
        { text: 'Lista Servicios de Alimentación', bold: true, fontSize: 20, alignment: 'center', margin: [0, -5, 0, 10] },
        this.PresentarDataPDFAlmuerzos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableD: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  PresentarDataPDFAlmuerzos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Servicio', style: 'tableHeader' },
                { text: 'Menú', style: 'tableHeader' },
                { text: 'Hora Inicia', style: 'tableHeader' },
                { text: 'Hora Finaliza', style: 'tableHeader' },
              ],
              ...this.tipoComidas.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableD' },
                  { text: obj.tipo, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.hora_inicio, style: 'itemsTable' },
                  { text: obj.hora_fin, style: 'itemsTable' },
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
  ExportToExcel() {
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoComidas.map(obj => {
      return {
        CODIGO: obj.id,
        SERVICIO: obj.tipo,
        MENU: obj.nombre,
        HORA_INICIA: obj.hora_inicio,
        HORA_FINALIZA: obj.hora_fin
      }
    }));
    // MÉTODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.tipoComidas[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsc["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsc, 'SERVICIOS COMIDAS');
    xlsx.writeFile(wb, "Comidas" + new Date().getTime() + '.xlsx');
  }

  /****************************************************************************************************** 
   *                                        MÉTODO PARA EXPORTAR A CSV 
   ******************************************************************************************************/
  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tipoComidas);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "TipoComidasCSV" + new Date().getTime() + '.csv');
  }

  /* ****************************************************************************************************
   *                                 PARA LA EXPORTACIÓN DE ARCHIVOS XML
   * ****************************************************************************************************/
  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto;
    var arregloComidas = [];
    this.tipoComidas.forEach(obj => {
      objeto = {
        "tipo_comida": {
          '@id': obj.id,
          "servicio": obj.tipo,
          "menu": obj.nombre,
          "hora_inicia": obj.hora_inicio,
          "hora_finaliza": obj.hora_fin
        }
      }
      arregloComidas.push(objeto)
    });
    this.rest.DownloadXMLRest(arregloComidas).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/tipoComidas/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
