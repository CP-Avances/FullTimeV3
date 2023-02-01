// IMPORTACION DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from "file-saver";
import * as moment from "moment";
import * as xlsx from "xlsx";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { VacacionAutorizacionesComponent } from 'src/app/componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { EditarVacacionesEmpleadoComponent } from 'src/app/componentes/rolEmpleado/vacacion-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

export interface VacacionesElemento {
  apellido: string;
  dia_laborable: number;
  dia_libre: number;
  estado: string;
  fec_final: string;
  fec_ingreso: string;
  fec_inicio: string;
  id: number;
  id_peri_vacacion: number;
  id_empl_solicita: number;
  nombre: string,
  id_empl_cargo: number,
  legalizado: boolean
}

@Component({
  selector: 'app-listar-vacaciones',
  templateUrl: './listar-vacaciones.component.html',
  styleUrls: ['./listar-vacaciones.component.css']
})

export class ListarVacacionesComponent implements OnInit {

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  vacaciones: any = [];
  idEmpleado: number;
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  // HABILITAR LISTAS SEGUN LOS DATOS
  lista_vacaciones: boolean = false;
  lista_autoriza: boolean = false;

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;

  // HABILITAR ICONOS DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACION DE LISTA AUTORIZADOS
  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];

  vacaciones_autorizadas: any = [];

  get habilitarVacaciones(): boolean { return this.funciones.vacaciones; }

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string {return this.plantilla.color_Secundary;}
  get p_color(): string {return this.plantilla.color_Primary;}
  get logoE(): string {return this.plantilla.logoBase64;}
  get frase(): string {return this.plantilla.marca_Agua;}

  // Variable oculta el boton de autorizar
  ocultar: boolean = false;

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private restV: VacacionesService,
    private ventana: MatDialog,
    private funciones: MainNavService,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    if (this.habilitarVacaciones === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Vacaciones. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.BuscarParametro();
      this.ObtenerEmpleados(this.idEmpleado);
    }
  }

  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe((data) => {
      this.empleado = data;
    });
  }
  

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.ObtenerListaVacaciones(this.formato_fecha);
        this.ObtenerListaVacacionesAutorizadas(this.formato_fecha);
      },
      vacio => {
        this.ObtenerListaVacaciones(this.formato_fecha);
        this.ObtenerListaVacacionesAutorizadas(this.formato_fecha);
      });
  }

  listaVacacionesFiltrada: any = [];
  ObtenerListaVacaciones(formato_fecha: string) {
    this.restV.ObtenerListaVacaciones().subscribe(res => {
      this.vacaciones = res;

      //Filtra la lista de Vacaciones para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.listaVacacionesFiltrada = this.vacaciones.filter(o => {
        if(this.idEmpleado !== o.id_empl_solicita){
          return this.listaVacacionesFiltrada.push(o);
        }
      })

      this.listaVacacionesFiltrada.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
      })

      if (Object.keys(this.listaVacacionesFiltrada).length == 0) {
        this.validarMensaje1 = true;
      }

      if (this.listaVacacionesFiltrada.length != 0) {
        this.lista_vacaciones = true;
      } else {
        this.lista_vacaciones = false;
      }
      console.log(res);

    },err => {
      this.validarMensaje1 = true;
    });
  }

  listaVacacionesFiltradaAutorizada: any = [];
  ObtenerListaVacacionesAutorizadas(formato_fecha: string) {
    this.restV.ObtenerListaVacacionesAutorizadas().subscribe(res => {
      this.vacaciones_autorizadas = res;

      //Filtra la lista de Vacaciones para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.listaVacacionesFiltradaAutorizada = this.vacaciones_autorizadas.filter(o => {
        if(this.idEmpleado !== o.id_empl_solicita){
          return this.listaVacacionesFiltradaAutorizada.push(o);
        }
      })

      this.listaVacacionesFiltradaAutorizada.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);

      })

      if (Object.keys(this.listaVacacionesFiltradaAutorizada).length == 0) {
        this.validarMensaje2 = true;
      }


      if (this.listaVacacionesFiltradaAutorizada.length != 0) {
        this.lista_autoriza = true;
      } else {
        this.lista_autoriza = false;
      }
      console.log(res);

    },err => {
      this.validarMensaje2 = true;

    });
  }

  // EVENTO PAGINACIÓN LISTA VACACIONES
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  selectionUno = new SelectionModel<VacacionesElemento>(true, []);
  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.listaVacacionesFiltrada.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.listaVacacionesFiltrada.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabel(row?: VacacionesElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  AutorizarVacacionesMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido,
        id_emple_solicita: obj.id_empl_solicita,
        id_cargo: obj.id_empl_cargo,
        estado: obj.estado,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // AUTORIZACIÓN DE VACACIONES
  AbrirAutorizaciones(datos_vacacion, forma: string) {
    this.ventana.open(VacacionAutorizacionesComponent,
      { width: '600px', data: { datosVacacion: datos_vacacion, carga: forma } })
      .afterClosed().subscribe(items => {
        this.BuscarParametro();
        this.auto_individual = true;
        this.selectionUno.clear();
      });
  }

  // Evento paginación lista vacaciones_autorizadas
  ManejarPaginaAutorizadas(e: PageEvent) {
    this.tamanio_pagina_auto = e.pageSize;
    this.numero_pagina_auto = e.pageIndex + 1;
  }

  vacaciones_lista: any = [];
  EditarVacaciones(id) {
    this.restV.ListarUnaVacacion(id).subscribe(res => {
      this.vacaciones_lista = res;
      console.log('ver vacaciones ', res)
      this.ventana.open(EditarVacacionesEmpleadoComponent,
        {
          width: '900px',
          data: {
            info: this.vacaciones_lista[0], id_empleado: this.vacaciones_lista[0].id_empleado,
            id_contrato: this.vacaciones_lista[0].id_contrato
          }
        }).afterClosed().subscribe(items => {
          this.BuscarParametro();
        });
    });
  }

    /** ************************************************************************************************* **
   ** **                            PARA LA EXPORTACIÓN DE ARCHIVOS PDF                              ** **
   ** ************************************************************************************************* **/

  // METODO PARA CREAR ARCHIVO PDF
  generarPdf(action = "open", opcion: string) {
    const documentDefinition = this.getDocumentDefinicion(opcion);
    switch (action) {
      case "open":
        pdfMake.createPdf(documentDefinition).open();
        break;
      case "print":
        pdfMake.createPdf(documentDefinition).print();
        break;
      case "download":
        pdfMake.createPdf(documentDefinition).download();
        break;
      default:
        pdfMake.createPdf(documentDefinition).open();
        break;
    }
  }

  getDocumentDefinicion(opcion: string) {
    if (opcion == "Vacaciones solicitadas") {
      sessionStorage.setItem(
        "VacacionesSolicitadas",
        this.listaVacacionesFiltrada
      );
    } else if (opcion == "Vacaciones autorizadas") {
      sessionStorage.setItem(
        "VacacionesAutorizadas",
        this.listaVacacionesFiltradaAutorizada
      );
    }

    return {
      // ENCABEZADO DE LA PÁGINA
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por: " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE LA PÁGINA
      footer: function (
        currentPage: any,
        pageCount: any,
        fecha: any,
        hora: any
      ) {
        var f = moment();
        fecha = f.format("YYYY-MM-DD");
        hora = f.format("HH:mm:ss");
        return {
          margin: 10,
          columns: [
            { text: "Fecha: " + fecha + " Hora: " + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: "© Pag " + currentPage.toString() + " of " + pageCount,
                  alignment: "right",
                  opacity: 0.3,
                },
              ],
            },
          ],
          fontSize: 10,
        };
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        {
          text: opcion,
          bold: true,
          fontSize: 16,
          alignment: "center",
          margin: [0, -10, 0, 10],
        },
        this.PresentarDataPDFVacaciones(opcion),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10, alignment: "center" },
      },
    };
  }

  // ESTRUCTURA DEL ARCHIVO PDF
  PresentarDataPDFVacaciones(opcion: string) {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto", "auto", "auto", "auto"],
            body: [
              [
                { text: "Empleado", style: "tableHeader" },
                { text: "Estado", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha Final", style: "tableHeader" },
                { text: "Fecha Ingreso", style: "tableHeader" },
              ],
              ...this.mostrarDatosPermisos(opcion),
            ],
          },
          // ESTILO DE COLORES FORMATO ZEBRA
          layout: {
            fillColor: function (i: any) {
              return i % 2 === 0 ? "#CCD1D1" : null;
            },
          },
        },
        { width: "*", text: "" },
      ],
    };
  }

  //Metodo seleccionar que lista de permisos mostrar (solicitados o autorizados)
  mostrarDatosPermisos(opcion: string) {
      return (opcion == "Vacaciones solicitadas"?this.listaVacacionesFiltrada:this.listaVacacionesFiltradaAutorizada).map((obj) => {
        return [
          { text: obj.nombre +' '+ obj.apellido, style: "itemsTable" },
          { text: obj.estado, style: "itemsTable" },
          { text: obj.fec_inicio_, style: "itemsTable" },
          { text: obj.fec_final_, style: "itemsTable" },
          { text: obj.fec_ingreso_, style: "itemsTable" },
        ];
      });
  }

   /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

   exportToExcel(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Vacaciones solicitadas"?this.listaVacacionesFiltrada:this.listaVacacionesFiltradaAutorizada).map(obj => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: obj.estado,
        Fecha_Inicio: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,
        Fecha_ingreso: obj.fec_ingreso_,
      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaVacacionesFiltrada[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA VACACIONES');
    xlsx.writeFile(wb, `${opcion}EXCEL` + new Date().getTime() + '.xlsx');
  }

   /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

   exportToCVS(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Vacaciones solicitadas"?this.listaVacacionesFiltrada:this.listaVacacionesFiltradaAutorizada).map(obj => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: obj.estado,
        Fecha_Inicio: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,
        Fecha_ingreso: obj.fec_ingreso_,
      }
    }));
    const csvDataC = xlsx.utils.sheet_to_csv(wsr);
    const data: Blob = new Blob([csvDataC], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, `${opcion}CSV` + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML(opcion: String) {
    var objeto: any;
    var arregloVacaciones = [];
    (opcion == "Vacaciones solicitadas"?this.listaVacacionesFiltrada:this.listaVacacionesFiltradaAutorizada).forEach(obj => {
      objeto = {
        "lista_permisos": {
        '@id': obj.id,
        "nombre": obj.nombre +' '+ obj.apellido,
        "estado": obj.estado,
        "fecha_inicio": obj.fec_inicio_,
        "fecha_final": obj.fec_final_,
        "fecha_ingreso": obj.fec_ingreso_,
        }
      }
      arregloVacaciones.push(objeto)
    });
    this.restV.CrearXML(arregloVacaciones).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/vacaciones/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
