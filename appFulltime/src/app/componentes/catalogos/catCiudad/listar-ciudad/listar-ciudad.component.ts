import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { RegistrarCiudadComponent } from 'src/app/componentes/catalogos/catCiudad/registrar-ciudad/registrar-ciudad.component'
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-ciudad',
  templateUrl: './listar-ciudad.component.html',
  styleUrls: ['./listar-ciudad.component.css'],
})

export class ListarCiudadComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS
  datosCiudades: any = [];
  filtroCiudad = '';
  filtroProvincia = '';
  empleado: any = [];
  idEmpleado: number;


  // ITEMS DE PAGINACION DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  ciudadF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    ciudadForm: this.ciudadF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    public ventana: MatDialog,
    public rest: CiudadService,
    private router: Router,
    private toastr: ToastrService,
    public restEmpre: EmpresaService,
    public restE: EmpleadoService,
  ) { 
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ListarCiudades();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerLogo();
  }

   // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
   ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER EL LOGO DE LA EMPRESA
  logo: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa')).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA 
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

  // METODO QUE MANEJA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR CIUDADES
  ListarCiudades() {
    this.datosCiudades = [];
    this.rest.ListarNombreCiudadProvincia().subscribe(datos => {
      this.datosCiudades = datos;
    })
  }

  // METODO PARA REGISTRAR CIUDAD
  AbrirVentanaRegistrarCiudad() {
    this.ventana.open(RegistrarCiudadComponent, { width: '600px' }).afterClosed().subscribe(item => {
      this.ListarCiudades();
    });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_ciu: number) {
    this.rest.EliminarCiudad(id_ciu).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarCiudades();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarCiudades']);
        }
      });
  }

  // METODO PARA VALIDAR INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      ciudadForm: '',
      provinciaForm: ''
    });
    this.ListarCiudades;
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A PDF                              ** **
   ** ************************************************************************************************** **/
   generarPdf(action = "open") {
    const documentDefinition = this.getDocumentDefinicion();

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

  getDocumentDefinicion() {
    sessionStorage.setItem("Ciudades", this.datosCiudades);
    return {
      // ENCABEZADO DE LA PÁGINA
      pageOrientation: "landscape",
      watermark: {
        text: this.frase,
        color: "blue",
        opacity: 0.1,
        bold: true,
        italics: false,
      },
      header: {
        text:
          "Impreso por:  " +
          this.empleado[0].nombre +
          " " +
          this.empleado[0].apellido,
        margin: 10,
        fontSize: 9,
        opacity: 0.3,
        alignment: "right",
      },
      // PIE DE PÁGINA
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
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        {
          text: "Lista de Ciudades",
          bold: true,
          fontSize: 20,
          alignment: "center",
          margin: [0, -30, 0, 10],
        },
        this.presentarDataPDFCiudades(),
      ],
      styles: {
        tableHeader: {
          fontSize: 12,
          bold: true,
          alignment: "center",
          fillColor: this.p_color,
        },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: "center" },
      },
    };
  }

  presentarDataPDFCiudades() {
    return {
      columns: [
        { width: "*", text: "" },
        {
          width: "auto",
          table: {
            widths: ["auto", "auto"],
            body: [
              [
                { text: "Ciudad", style: "tableHeader" },
                { text: "Provincia", style: "tableHeader" },
              ],
              ...this.datosCiudades.map((obj) => {
                return [
                  { text: obj.nombre, style: "itemsTableC" },
                  { text: obj.provincia, style: "itemsTableC" },
                ];
              }),
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

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A EXCEL                            ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.datosCiudades);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, "Ciudades");
    xlsx.writeFile(wb, "Ciudades" + new Date().getTime() + ".xlsx");
  }

  /** ************************************************************************************************** **
   ** **                                      METODO PARA EXPORTAR A CSV                              ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.datosCiudades);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], {
      type: "text/csv;charset=utf-8;",
    });
    FileSaver.saveAs(
      data,
      "CiudadesCSV" + new Date().getTime() + ".csv"
    );
  }

  /** ************************************************************************************************* **
   ** **                                PARA LA EXPORTACION DE ARCHIVOS XML                          ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloCiudades = [];
    this.datosCiudades.forEach((obj) => {
      objeto = {
        ciudad: {
          "@id": obj.id,
          nombre: obj.nombre,
          provincia: obj.provincia
        },
      };
      arregloCiudades.push(objeto);
    });


    this.rest.CrearXML(arregloCiudades).subscribe((res) => {
      this.data = res;
      console.log("prueba data", res);
      this.urlxml = `${environment.url}/ciudades/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }


}
