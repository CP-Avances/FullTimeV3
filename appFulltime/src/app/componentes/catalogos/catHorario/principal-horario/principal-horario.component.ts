// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// IMPORTAR COMPONENTES
import { DetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle-cat-horario/detalle-cat-horario.component';
import { RegistroHorarioComponent } from 'src/app/componentes/catalogos/catHorario/registro-horario/registro-horario.component';
import { EditarHorarioComponent } from '../editar-horario/editar-horario.component';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-principal-horario',
  templateUrl: './principal-horario.component.html',
  styleUrls: ['./principal-horario.component.css']
})

export class PrincipalHorarioComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS Y BÚSQUEDA
  horarios: any = [];

  // FILTROS
  filtroNombreHorario = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreHorarioF = new FormControl('', Validators.minLength(2));
  archivo1Form = new FormControl('');
  archivo2Form = new FormControl('');
  archivo3Form = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public buscarHorarioForm = new FormGroup({
    nombreHorarioForm: this.nombreHorarioF,
  });

  // VARIABLES USADAS EN SELECCIÓN DE ARCHIVOS
  nameFile: string;
  archivoSubido: Array<File>;

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE USUARIO DE INICIO SESIÓN
  empleado: any = [];
  idEmpleado: number;

  // VARIABLE DE NAVEGABILIDAD
  hipervinculo: string = environment.url;

  constructor(
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    public validar: ValidacionesService, // VARIABLE USADA PARA CONTROL DE VALIDACIONES
    public ventana: MatDialog, // VARIABLES MANEJO DE VENTANAS
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
    public restE: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    private restD: DetalleCatHorariosService, // SERVICIO DE DATOS DE DETALLES DE HORARIOS
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.nameFile = '';
    this.ObtenerLogo();
    this.ObtenerColores();
    this.ObtenerHorarios();
    this.ObtenerEmpleados();
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(this.idEmpleado).subscribe(data => {
      this.empleado = data;
    })
  }

  // MÉTODO PARA OBTENER EL LOGO DE LA EMPRESA
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

  // MÉTODO PARA MANEJAR PÁGINAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA OBTENER HORARIOS
  ObtenerHorarios() {
    this.horarios = [];
    this.rest.getHorariosRest().subscribe(datos => {
      this.horarios = datos;
    })
  }

  // MÉTODO PARA ABRIR VENTANA REGISTRAR HORARIO
  AbrirVentanaRegistrarHorario(): void {
    this.ventana.open(RegistroHorarioComponent, { width: '1200px' }).afterClosed().subscribe(items => {
      this.ObtenerHorarios();
    });
  }

  // MÉTODO PARA ABRIR VENTANA REGISTRAR DETALLE DE HORARIO
  AbrirRegistraDetalle(datosSeleccionados: any): void {
    this.ventana.open(DetalleCatHorarioComponent,
      { width: '600px', data: { datosHorario: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(items => {
        this.ObtenerHorarios();
      });
  }

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.buscarHorarioForm.setValue({
      nombreHorarioForm: '',
    });
    this.ObtenerHorarios();
  }

  // MÉTODO PARA ABRIR VENTANA EDITAR HORARIO
  AbrirVentanaEditarHorario(datosSeleccionados: any): void {
    this.ventana.open(EditarHorarioComponent, { width: '900px', data: { horario: datosSeleccionados, actualizar: false } }).afterClosed().subscribe(items => {
      this.ObtenerHorarios();
    });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_horario: any) {
    this.rest.EliminarRegistro(id_horario.id).subscribe(res => {
      // MÉTODO PARA AUDITAR CATÁLOGO HORARIOS
      this.validar.Auditar('app-web', 'cg_horarios', id_horario, '', 'DELETE');
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerHorarios();
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos);
        } else {
          this.router.navigate(['/horario/']);
        }
      });
  }


  /** ************************************************************************************************* ** 
   ** **                              PLANTILLA CARGAR SOLO HORARIOS                                 ** **
   ** ************************************************************************************************* **/

  fileChangeCatalogoHorario(element: any) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 17);
    console.log("funcion horario", itemName.toLowerCase());
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'catalogo horarios') {
        this.plantillaHorario();
      } else {
        this.toastr.error('Solo se acepta', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.archivo1Form.reset();
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.archivo1Form.reset();
      this.nameFile = '';
    }
  }

  plantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.VerificarDatosHorario(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
          'Son datos obligatorios: nombre de horario, horas de trabajo y tipo de horario, además el nombre ' +
          'de horario debe ser único en cada registro.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.archivo1Form.reset();
        this.nameFile = '';
      }
      else {
        this.rest.VerificarPlantillaHorario(formData).subscribe(res => {
          if (res.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
              'Son datos obligatorios: nombre de horario, horas de trabajo y tipo de horario, además el nombre ' +
              'de horario debe ser único en cada registro.', 'Operación Fallida', {
              timeOut: 6000,
            });
            this.archivo1Form.reset();
            this.nameFile = '';
          }
          else {
            this.rest.CargarHorariosMultiples(formData).subscribe(res => {
              this.toastr.success('Operación Exitosa', 'Plantilla de Horario importada.', {
                timeOut: 6000,
              });
              this.archivo1Form.reset();
              this.nameFile = '';
              window.location.reload();
            });
          }
        });
      }
    });
  }

  /* ***************************************************************************************************** 
   * PLANTILLA CARGAR SOLO DETALLES
   * *****************************************************************************************************/
  nameFileDetalle: string;
  archivoSubidoDetalle: Array<File>;
  fileChangeDetalle(element) {
    this.archivoSubidoDetalle = element.target.files;
    this.nameFileDetalle = this.archivoSubidoDetalle[0].name;
    let arrayItems = this.nameFileDetalle.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 17);
    console.log(itemName.toLowerCase());
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'detalles horarios') {
        this.plantillaDetalle();
      } else {
        this.toastr.error('Solo se acepta', 'Plantilla seleccionada incorrecta', {
          timeOut: 6000,
        });
        this.archivo2Form.reset();
        this.nameFileDetalle = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
        timeOut: 6000,
      });
      this.archivo2Form.reset();
      this.nameFileDetalle = '';
    }
  }

  plantillaDetalle() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoDetalle.length; i++) {
      formData.append("uploads[]", this.archivoSubidoDetalle[i], this.archivoSubidoDetalle[i].name);
    }
    this.restD.VerificarDatosDetalles(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verifique los datos de su plantilla. ' +
          'Son datos obligatorios: nombre de horario, orden, hora y tipo de accion, además el nombre ' +
          'de horario debe existir dentro del sistema.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.archivo2Form.reset();
        this.nameFileDetalle = '';
      }
      else {
        this.restD.CargarPlantillaDetalles(formData).subscribe(res => {
          this.toastr.success('Operación Exitosa', 'Plantilla de Detalle de Horario importada.', {
            timeOut: 6000,
          });
          this.archivo2Form.reset();
          this.nameFileDetalle = '';
        });
      }
    });
  }










  /** ************************************************************************************************* ** 
   ** **                                MÉTODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************* **/

  // GENERAR ARCHIVO PDF
  GenerarPDF(action = 'open') {
    const documentDefinition = this.EstructurarPDF();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  // DEFINICION DEL DOCUMENTO PDF
  EstructurarPDF() {
    sessionStorage.setItem('Empleados', this.horarios);
    return {
      // ENCABEZADO DE PÁGINA
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
        { text: 'Lista de Horarios', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.PresentarDataPDFEmpleados(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  // METODO PARA PRESENTAR DATOS DEL DOCUMENTO PDF
  PresentarDataPDFEmpleados() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'Minutos de almuerzo', style: 'tableHeader' },
                { text: 'Horas de trabajo', style: 'tableHeader' },
                { text: 'Horario Flexibe', style: 'tableHeader' },
                { text: 'Horario por horas', style: 'tableHeader' },
                { text: 'Documento', style: 'tableHeader' },
              ],
              ...this.horarios.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.min_almuerzo, style: 'itemsTableC' },
                  { text: obj.hora_trabajo, style: 'itemsTableC' },
                  { text: obj.flexible, style: 'itemsTableC' },
                  { text: obj.por_horas, style: 'itemsTableC' },
                  { text: obj.doc_nombre, style: 'itemsTableC' },
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


  /** ************************************************************************************************* ** 
   ** **                                 MÉTODO PARA EXPORTAR A EXCEL                                ** **
   ** ************************************************************************************************* **/

  ExportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'horarios');
    xlsx.writeFile(wb, "CatHorariosEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************* ** 
   ** **                               MÉTODO PARA EXPORTAR A CSV                                    ** **
   ** ************************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.horarios);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "CatHorarioCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                           PARA LA EXPORTACIÓN DE ARCHIVOS XML                               ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloHorarios = [];
    this.horarios.forEach(obj => {
      objeto = {
        "horario": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "min_almuerzo": obj.min_almuerzo,
          "hora_trabajo": obj.hora_trabajo,
          "flexible": obj.flexible,
          "por_horas": obj.por_horas,
          "doc_nombre": obj.doc_nombre,
          "documento": obj.documento,
        }
      }
      arregloHorarios.push(objeto)
    });

    this.rest.DownloadXMLRest(arregloHorarios).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/horario/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
