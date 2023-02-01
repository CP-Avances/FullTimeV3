// IMPORTACION DE LIBRERIAS
import { Component, OnInit } from "@angular/core";
import { SelectionModel } from "@angular/cdk/collections";
import { environment } from 'src/environments/environment';
import { PageEvent } from "@angular/material/paginator";
import { MatDialog } from "@angular/material/dialog";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import * as xlsx from "xlsx";
import pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from "pdfmake/build/pdfmake";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTACION DE COMPONENTES
import { EditarPermisoEmpleadoComponent } from "src/app/componentes/rolEmpleado/permisos-empleado/editar-permiso-empleado/editar-permiso-empleado.component";
import { AutorizacionesComponent } from "src/app/componentes/autorizaciones/autorizaciones/autorizaciones.component";

// IMPORTACION DE SERVICIOS
import { PlantillaReportesService } from "src/app/componentes/reportes/plantilla-reportes.service";
import { ValidacionesService } from "src/app/servicios/validaciones/validaciones.service";
import { ParametrosService } from "src/app/servicios/parametrosGenerales/parametros.service";
import { PermisosService } from "src/app/servicios/permisos/permisos.service";
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { MainNavService } from "src/app/componentes/administracionGeneral/main-nav/main-nav.service";

export interface PermisosElemento {
  apellido: string;
  cedula: string;
  descripcion: string;
  docu_nombre: string;
  documento: string;
  estado: number;
  fec_creacion: string;
  fec_final: string;
  fec_inicio: string;
  id: number;
  id_contrato: number;
  id_emple_solicita: number;
  nom_permiso: string;
  nombre: string;
  id_empl_cargo: number;
}

@Component({
  selector: "app-listar-empleado-permiso",
  templateUrl: "./listar-empleado-permiso.component.html",
  styleUrls: ["./listar-empleado-permiso.component.css"],
})
export class ListarEmpleadoPermisoComponent implements OnInit {
  permisos: any = [];

  selectionUno = new SelectionModel<PermisosElemento>(true, []);

  // VISIBILIZAR LISTA DE PERMISOS AUTORIZADOS
  lista_autorizados: boolean = false;
  lista_permisos: boolean = false;

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACIÓN INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACIÓN DE LA TABLA AUTORIZADOS
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;
  pageSizeOptions_autorizado = [5, 10, 20, 50];

  idEmpleado: number;
  empleado: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  get habilitarPermiso(): boolean {return this.funciones.permisos;}

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string {return this.plantilla.color_Secundary;}
  get p_color(): string {return this.plantilla.color_Primary;}
  get logoE(): string {return this.plantilla.logoBase64;}
  get frase(): string {return this.plantilla.marca_Agua;}

  constructor(
    private plantilla: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private validar: ValidacionesService,
    private ventana: MatDialog,
    private restP: PermisosService,
    private funciones: MainNavService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService
  ) {
    this.idEmpleado = parseInt(localStorage.getItem("empleado"));
  }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos. \n`,
        message: "¿Te gustaría activarlo? Comunícate con nosotros.",
        url: "www.casapazmino.com.ec",
      };
      return this.validar.RedireccionarHomeAdmin(mensaje);
    } else {
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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** **
   ** **************************************************************************************** **/

  formato_fecha: string = "DD/MM/YYYY";
  formato_hora: string = "HH:mm:ss";

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      (res) => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha);
      },
      (vacio) => {
        this.BuscarHora(this.formato_fecha);
      }
    );
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      (res) => {
        this.formato_hora = res[0].descripcion;
        this.obtenerPermisos(fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(fecha, this.formato_hora);
      },
      (vacio) => {
        this.obtenerPermisos(fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(fecha, this.formato_hora);
      }
    );
  }

  public listaPermisosFiltradas: any = [];
  obtenerPermisos(fecha: string, hora: string) {
    this.restP.obtenerAllPermisos().subscribe(
      (res) => {
        this.permisos = res;

        //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
        this.listaPermisosFiltradas = this.permisos.filter((o) => {
          if (this.idEmpleado !== o.id_emple_solicita) {
            return this.listaPermisosFiltradas.push(o);
          }
        });

        this.listaPermisosFiltradas.forEach((p) => {
          // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
          p.fec_creacion_ = this.validar.FormatearFecha(
            p.fec_creacion,
            fecha,
            this.validar.dia_abreviado
          );
          p.fec_inicio_ = this.validar.FormatearFecha(
            p.fec_inicio,
            fecha,
            this.validar.dia_abreviado
          );
          p.fec_final_ = this.validar.FormatearFecha(
            p.fec_final,
            fecha,
            this.validar.dia_abreviado
          );

          if (p.estado === 1) {
            p.estado = "Pendiente";
          } else if (p.estado === 2) {
            p.estado = "Pre-autorizado";
          }
        });

        if (Object.keys(this.listaPermisosFiltradas).length == 0) {
          this.validarMensaje1 = true;
        }

        if (this.listaPermisosFiltradas.length != 0) {
          this.lista_permisos = true;
        }
      },
      (err) => {
        console.log("permisos ALL ", err.error);
        this.validarMensaje1 = true;
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );
  }

  permisosTotales: any;
  EditarPermiso(id, id_empl) {
    // METODO PARA IMPRIMIR DATOS DEL PERMISO
    this.permisosTotales = [];
    this.restP.ObtenerUnPermisoEditar(id).subscribe(
      (datos) => {
        this.permisosTotales = datos;
        this.ventana
          .open(EditarPermisoEmpleadoComponent, {
            width: "1200px",
            data: {
              dataPermiso: this.permisosTotales[0],
              id_empleado: parseInt(id_empl),
            },
          })
          .afterClosed()
          .subscribe((items) => {
            this.BuscarParametro();
          });
      },
      (err) => {
        console.log("permisos uno ", err.error);
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.listaPermisosFiltradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA.
  masterToggle() {
    this.isAllSelected()
      ? this.selectionUno.clear()
      : this.listaPermisosFiltradas.forEach((row) =>
          this.selectionUno.select(row)
        );
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabel(row?: PermisosElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? "select" : "deselect"} all`;
    }
    return `${this.selectionUno.isSelected(row) ? "deselect" : "select"} row ${
      row.id + 1
    }`;
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

  AutorizarPermisosMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map((obj) => {
      return {
        id: obj.id,
        empleado: obj.nombre + " " + obj.apellido,
        id_contrato: obj.id_contrato,
        id_emple_solicita: obj.id_emple_solicita,
        id_cargo: obj.id_empl_cargo,
        estado: obj.estado,
      };
    });
    this.AbrirAutorizaciones(EmpleadosSeleccionados, "multiple");
  }

  // AUTORIZACIÓN DE PERMISOS
  AbrirAutorizaciones(datos_permiso, forma: string) {
    this.ventana
      .open(AutorizacionesComponent, {
        width: "600px",
        data: { datosPermiso: datos_permiso, carga: forma },
      })
      .afterClosed()
      .subscribe((items) => {
        this.BuscarParametro();
        this.auto_individual = true;
        this.selectionUno.clear();
      });
  }

  // LISTA DE PERMISOS QUE HAN SIDO AUTORIZADOS O NEGADOS
  ManejarPaginaAutorizados(e: PageEvent) {
    this.tamanio_pagina_autorizado = e.pageSize;
    this.numero_pagina_autorizado = e.pageIndex + 1;
  }

  permisosAutorizados: any = [];
  public listaPermisosAutorizadosFiltrados: any = [];
  ObtenerPermisosAutorizados(fecha: string, hora: string) {
    this.restP.BuscarPermisosAutorizados().subscribe(
      (res) => {
        this.permisosAutorizados = res;

        //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
        this.listaPermisosAutorizadosFiltrados =
          this.permisosAutorizados.filter((o) => {
            if (this.idEmpleado !== o.id_emple_solicita) {
              return this.listaPermisosAutorizadosFiltrados.push(o);
            }
          });

        this.listaPermisosAutorizadosFiltrados.forEach((p) => {
          // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
          p.fec_creacion_ = this.validar.FormatearFecha(
            p.fec_creacion,
            fecha,
            this.validar.dia_abreviado
          );
          p.fec_inicio_ = this.validar.FormatearFecha(
            p.fec_inicio,
            fecha,
            this.validar.dia_abreviado
          );
          p.fec_final_ = this.validar.FormatearFecha(
            p.fec_final,
            fecha,
            this.validar.dia_abreviado
          );

          if (p.estado === 3) {
            p.estado = "Autorizado";
          } else if (p.estado === 4) {
            p.estado = "Negado";
          }
        });

        if (Object.keys(this.listaPermisosAutorizadosFiltrados).length == 0) {
          this.validarMensaje2 = true;
        }

        if (this.listaPermisosAutorizadosFiltrados.length != 0) {
          this.lista_autorizados = true;
        }
      },
      (err) => {
        this.validarMensaje2 = true;
        return this.validar.RedireccionarHomeAdmin(err.error);
      }
    );
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
    if (opcion == "Permisos solicitados") {
      sessionStorage.setItem(
        "PermisosSolicitados",
        this.listaPermisosFiltradas
      );
    } else if (opcion == "Permisos autorizados") {
      sessionStorage.setItem(
        "PermisosAutorizados",
        this.listaPermisosAutorizadosFiltrados
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
        this.PresentarDataPDFPermisos(opcion),
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
  PresentarDataPDFPermisos(opcion: string) {
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
                { text: "Tipo permiso", style: "tableHeader" },
                { text: "Fecha inicio", style: "tableHeader" },
                { text: "Fecha Final", style: "tableHeader" },
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
      return (opcion == "Permisos solicitados"?this.listaPermisosFiltradas:this.listaPermisosAutorizadosFiltrados).map((obj) => {
        return [
          { text: obj.nombre +' '+ obj.apellido, style: "itemsTable" },
          { text: obj.estado, style: "itemsTable" },
          { text: obj.nom_permiso, style: "itemsTable" },
          { text: obj.fec_inicio_, style: "itemsTable" },
          { text: obj.fec_final_, style: "itemsTable" },
        ];
      });
  }

   /** ************************************************************************************************* **
   ** **                             PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL                           ** **
   ** ************************************************************************************************* **/

   exportToExcel(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Permisos solicitados"?this.listaPermisosFiltradas:this.listaPermisosAutorizadosFiltrados).map(obj => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: obj.estado,
        Tipo_Permiso: obj.nom_permiso,
        Fecha_Inicial: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,

      }
    }));
    // METODO PARA DEFINIR TAMAÑO DE LAS COLUMNAS DEL REPORTE
    const header = Object.keys(this.listaPermisosFiltradas[0]); // NOMBRE DE CABECERAS DE COLUMNAS
    var wscols = [];
    for (var i = 0; i < header.length; i++) {  // CABECERAS AÑADIDAS CON ESPACIOS
      wscols.push({ wpx: 100 })
    }
    wsr["!cols"] = wscols;
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'LISTA PERMISOS');
    xlsx.writeFile(wb, `${opcion}EXCEL` + new Date().getTime() + '.xlsx');
  }

   /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

   exportToCVS(opcion: string) {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet((opcion == "Permisos solicitados"?this.listaPermisosFiltradas:this.listaPermisosAutorizadosFiltrados).map(obj => {
      return {
        Nombre: obj.nombre +' '+ obj.apellido,
        Estado: obj.estado,
        Tipo_Permiso: obj.nom_permiso,
        Fecha_Inicial: obj.fec_inicio_,
        Fecha_final: obj.fec_final_,

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
    var arregloPermisos = [];
    (opcion == "Permisos solicitados"?this.listaPermisosFiltradas:this.listaPermisosAutorizadosFiltrados).forEach(obj => {
      objeto = {
        "lista_permisos": {
        '@id': obj.id,
        "nombre": obj.nombre +' '+ obj.apellido,
        "estado": obj.estado,
        "tipo_permiso": obj.nom_permiso,
        "fecha_inicial": obj.fec_inicio_,
        "fecha_final": obj.fec_final_,
        }
      }
      arregloPermisos.push(objeto)
    });
    this.restP.CrearXML(arregloPermisos).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/empleadoPermiso/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }
}
