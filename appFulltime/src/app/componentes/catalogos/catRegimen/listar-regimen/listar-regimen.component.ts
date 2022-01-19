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
import { EditarRegimenComponent } from 'src/app/componentes/catalogos/catRegimen/editar-regimen/editar-regimen.component';
import { RegimenComponent } from 'src/app/componentes/catalogos/catRegimen/regimen/regimen.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

// IMPORTAR SERVICIOS
import { PlantillaReportesService } from 'src/app/componentes/reportes/plantilla-reportes.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-listar-regimen',
  templateUrl: './listar-regimen.component.html',
  styleUrls: ['./listar-regimen.component.css']
})

export class ListarRegimenComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public BuscarRegimenForm = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  // ALMACENAMIENTO DE DATOS CONSULTADOS  
  empleado: any = [];
  regimen: any = [];

  filtroRegimenLaboral = ''; // VARIABLE DE FILTRO DE BÚSQUEDA
  idEmpleado: number; // VARIABLE QUE ALMACENA EL ID DEL EMPELADO QUE INICIA SESIÓN

  // ITEMS DE PAGINACION DE LA TABLA
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // MÉTODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase(): string { return this.plantillaPDF.marca_Agua }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public vistaRegistrarDatos: MatDialog, // VARIABLE MANEJO DE VENTANAS
    private restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE DE USO DE MENSAJES DE NOTIFICACIONES
    private rest: RegimenService, // SERVICIO DE DATOS DE REGIMEN
    public router: Router, // VARIABLE DE NAVEGACIÓN DE PÁGINAS CON URL
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerRegimen();
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // EVENTO PARA MANEJAR VISTA DE FILAS DETERMINADAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // LECTURA DE DATOS
  ObtenerRegimen() {
    this.regimen = [];
    this.rest.ConsultarRegimen().subscribe(datos => {
      this.regimen = datos;
    })
  }

  // ORDENAR LOS DATOS SEGÚN EL ID 
  OrdenarDatos(array: any) {
    function compare(a: any, b: any) {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    }
    array.sort(compare);
  }

  LimpiarCampos() {
    this.BuscarRegimenForm.setValue({
      descripcionForm: '',
    });
    this.ObtenerRegimen();
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  ObtenerMensajeNombreValido() {
    if (this.descripcionF.hasError('pattern')) {
      return 'Indispensable ingresar dos letras';
    }
  }

  /*************************************************************************************
   *           VENTANAS PARA REGISTRAR Y EDITAR DATOS DE UN RÉGIMEN LABORAL
   ***********************************************************************************/

  // VENTANA PARA EDITAR DATOS DEL RÉGIMEN LABORAL SELECCIONADO 
  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarRegimenComponent, { width: '900px', data: { datosRegimen: datosSeleccionados, actualizar: true } }).disableClose = true;
  }

  // VENTANA PARA REGISTRAR DATOS DE UN NUEVO RÉGIMEN LABORAL
  AbrirVentanaRegistrarRegimen(): void {
    this.vistaRegistrarDatos.open(RegimenComponent, { width: '900px' }).disableClose = true;
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_regimen: number) {
    this.rest.EliminarRegistro(id_regimen).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerRegimen();
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarRegimen']);
        }
      });
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
   * ****************************************************************************************************/

  GenerarPdf(action = 'open') {
    this.OrdenarDatos(this.regimen);
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
    this.ObtenerRegimen();
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('Regimen', this.regimen);
    return {
      // ENCABEZADO DE LA PÁGINA
      pageOrientation: 'landscape',
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
        { text: 'Regímenes Laborales', bold: true, fontSize: 20, alignment: 'center', margin: [0, -20, 0, 10] },
        this.PresentarDataPDF(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', },
      }
    };
  }

  PresentarDataPDF() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Meses Periodo', style: 'tableHeader' },
                { text: 'Vacaciones por año', style: 'tableHeader' },
                { text: 'Vacaciones por mes', style: 'tableHeader' },
                { text: 'Años para antiguedad', style: 'tableHeader' },
                { text: 'Días de incremento', style: 'tableHeader' },
                { text: 'Días máximos acumulables', style: 'tableHeader' },
                { text: 'Días Libres', style: 'tableHeader' },
              ],
              ...this.regimen.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.meses_periodo, style: 'itemsTable' },
                  { text: obj.dia_anio_vacacion, style: 'itemsTable' },
                  { text: obj.dia_mes_vacacion, style: 'itemsTable' },
                  { text: obj.anio_antiguedad, style: 'itemsTable' },
                  { text: obj.dia_incr_antiguedad, style: 'itemsTable' },
                  { text: obj.max_dia_acumulacion, style: 'itemsTable' },
                  { text: obj.dia_libr_anio_vacacion, style: 'itemsTable' },
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

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL
   * ****************************************************************************************************/

  ExportToExcel() {
    this.OrdenarDatos(this.regimen);
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.regimen.map(obj => {
      return {
        CODIGO: obj.id,
        DESCRIPCION: obj.descripcion,
        MESES_PERIODO: obj.meses_periodo,
        DIA_ANIO_VACACION: obj.dia_anio_vacacion,
        DIA_MES_VACACION: obj.dia_mes_vacacion,
        ANIO_ANTIGUEDAD: obj.anio_antiguedad,
        DIA_INCR_ANTIGUEDAD: obj.dia_incr_antiguedad,
        MAX_DIA_ACUMULACION: obj.max_dia_acumulacion,
        DIA_LIBR_ANIO_VACACION: obj.dia_libr_anio_vacacion
      }
    }));
    // MÉTODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.regimen[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTAR REGIMEN');
    xlsx.writeFile(wb, "RegimenEXCEL" + new Date().getTime() + '.xlsx');
    this.ObtenerRegimen();
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS XML
   * ****************************************************************************************************/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    this.OrdenarDatos(this.regimen);
    var objeto: any;
    var arregloRegimen = [];
    this.regimen.forEach(obj => {
      objeto = {
        "regimen_laboral": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "meses_periodo": obj.meses_periodo,
          "dia_anio_vacacion": obj.dia_anio_vacacion,
          "dia_mes_vacacion": obj.dia_mes_vacacion,
          "anio_antiguedad": obj.anio_antiguedad,
          "dia_incr_antiguedad": obj.dia_incr_antiguedad,
          "max_dia_acumulacion": obj.max_dia_acumulacion,
          "dia_libr_anio_vacacion": obj.dia_libr_anio_vacacion
        }
      }
      arregloRegimen.push(objeto)
    });
    this.rest.DownloadXMLRest(arregloRegimen).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/regimenLaboral/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
    this.ObtenerRegimen();
  }

  /* ***************************************************************************************************** 
   *                                    MÉTODO PARA EXPORTAR A CSV 
   * *****************************************************************************************************/

  ExportToCVS() {
    this.OrdenarDatos(this.regimen);
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.regimen);
    const csvDataC = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "RegimenCSV" + new Date().getTime() + '.csv');
    this.ObtenerRegimen();
  }
}
