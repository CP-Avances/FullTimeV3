import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UpdateEstadoAppComponent } from '../update-estado-app/update-estado-app.component';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

//Reporte de Usuarios App Habilitada o Deshabilitada
import { environment } from 'src/environments/environment';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-lista-app',
  templateUrl: './lista-app.component.html',
  styleUrls: ['./lista-app.component.css']
})

export class ListaAppComponent implements OnInit {

  usersAppMovil_habilitados: any = [];
  usersAppMovil_deshabilitados: any = [];

  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmpDeshab = new SelectionModel<ITableEmpleados>(true, []);


  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';

  filtroCodigodes: number;
  filtroCedulades: '';
  filtroNombredes: '';

  empleado: any = [];
  idEmpleado: number;

  filtronum: boolean;
  filtrolet: boolean;

  ocultar: boolean = false;
  ocultardes: boolean = false;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  codigodes = new FormControl('');
  cedulades = new FormControl('', [Validators.minLength(2)]);
  nombredes = new FormControl('', [Validators.minLength(2)]);

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  tamanio_paginades: number = 5;
  numero_paginades: number = 1;

  pageSizeOptions = [5, 10, 20, 50];

  BooleanAppMap: any = { 'true': 'Si', 'false': 'No' };

  get habilitarMovil(): boolean { return this.funciones.app_movil; }

  constructor(
    public restEmpre: EmpresaService,
    private usuariosService: UsuarioService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private dialog: MatDialog,
    private funciones: MainNavService,
    private rest: RelojesService,
    public restE: EmpleadoService,
  ) {this.idEmpleado = parseInt(localStorage.getItem('empleado'));}

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerColores();
    this.ObtenerLogo();

    if (this.habilitarMovil === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.ObtenerUsuariosAppMovil();
    }
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE LAS TABLAS
  habilitar: boolean = false;
  deshabilitar: boolean = false;
  HabilitarSeleccion_habilitados() {
    if(this.habilitar === false){
      this.habilitar = true;

      if(this.filtroNombre != undefined){
        if(this.filtroNombre.length > 1){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }

      if(this.filtroCodigo != undefined){
        if(this.filtroCodigo > 0){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }

      if(this.filtroCedula != undefined){
        if(this.filtroCedula.length > 1){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }
      
    }else{
      this.habilitar = false;
      this.ocultar = false;
      this.selectionEmp.clear();
    }
  }

  HabilitarSeleccion_deshabilitados() {
    if(this,this.deshabilitar === false){
      this.deshabilitar = true;

      if(this.filtroNombredes != undefined){
        if(this.filtroNombredes.length > 1){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

      if(this.filtroCodigodes != undefined){
        if(this.filtroCodigodes > 0){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

      if(this.filtroCedulades != undefined){
        if(this.filtroCedulades.length > 1){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

    }else{
      this.deshabilitar = false;
      this.ocultardes = false;
      this.selectionEmpDeshab.clear();
    }
  }


  ObtenerUsuariosAppMovil() {
    this.usuariosService.getUsersAppMovil().subscribe(res => {
      let usuariosHabilitados = [];
      let usuariosDeshabilitados = [];
      res.forEach(usuario => {
        if(usuario.app_habilita === true){
          usuariosHabilitados.push(usuario);
        }else{
          usuariosDeshabilitados.push(usuario);
        }
      });

      this.usersAppMovil_habilitados = usuariosHabilitados;
      this.usersAppMovil_deshabilitados = usuariosDeshabilitados;
      
    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })
  }

  openDialogUpdateAppMovilHabilitados() {
    this.selectionEmpDeshab.clear();
    this.deshabilitar = false;
    if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
    this.dialog.open(UpdateEstadoAppComponent, { data: this.selectionEmp.selected }).afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.usuariosService.updateUsersAppMovil(result).subscribe(res => {
          console.log(res);
          this.toastr.success(res.message)
          this.ObtenerUsuariosAppMovil();
          this.selectionEmp.clear();
          this.habilitar = false;
          this.numero_pagina = 1;
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
      }

    })
  }

  openDialogUpdateAppMovilDeshabilitados() {
    this.selectionEmp.clear();
    this.habilitar = false;
    if (this.selectionEmpDeshab.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
    this.dialog.open(UpdateEstadoAppComponent, { data: this.selectionEmpDeshab.selected }).afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.usuariosService.updateUsersAppMovil(result).subscribe(res => {
          console.log(res);
          this.toastr.success(res.message)
          this.ObtenerUsuariosAppMovil();
          this.selectionEmpDeshab.clear();
          this.deshabilitar = false;
          this.numero_paginades = 1;
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
      }

    })
  }


  ManejarPaginaHabilitados(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ManejarPaginaDeshabilitados(a: PageEvent) {
    this.tamanio_paginades = a.pageSize;
    this.numero_paginades = a.pageIndex + 1;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmpHabilitados() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.usersAppMovil_habilitados.length;
  }

  isAllSelectedEmpDeshabilitados() {
    const numSelectedDes = this.selectionEmpDeshab.selected.length;
    return numSelectedDes === this.usersAppMovil_deshabilitados.length;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmphabilitado() {
    this.isAllSelectedEmpHabilitados()?
      this.selectionEmp.clear() :
      this.usersAppMovil_habilitados.forEach(row => this.selectionEmp.select(row));
  }

  masterToggleEmpdeshabilitado() {
    this.isAllSelectedEmpDeshabilitados()?
      this.selectionEmpDeshab.clear() :
      this.usersAppMovil_deshabilitados.forEach(row => this.selectionEmpDeshab.select(row));
  }


  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmphabilitados(row?: ITableEmpleados): string {
    
    if (!row) {
      return `${this.isAllSelectedEmpHabilitados() ? 'select' : 'deselect'} all`;
    }
    
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkboxLabelEmpdeshabilitados(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmpDeshabilitados() ? 'select' : 'deselect'} all`;
    }
    
    return `${this.selectionEmpDeshab.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  IngresarSoloNumeros(evt) {
    this.ocultar = true;
    this.ocultardes = true;
    return this.validar.IngresarSoloNumeros(evt);
  }

  IngresarSoloLetras(e) {
    this.ocultar = true;
    this.ocultardes = true;
    return this.validar.IngresarSoloLetras(e);
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

   /** ********************************************************************************* **
   ** **                        GENERACION DE PDFs                                   ** **
   ** ********************************************************************************* **/

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
    sessionStorage.setItem('App_Habilitada', this.usersAppMovil_habilitados);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
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
        { text: 'Lista de usuarios app movil habilitados ', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFHabilitados(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFHabilitados() {
    let count = 1;
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'N#', style: 'tableHeader' },
                { text: 'Codigo', style: 'tableHeader' },
                { text: 'Empleado', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Usuario', style: 'tableHeader' },
                { text: 'App Movil', style: 'tableHeader' },
              ],
              ...this.usersAppMovil_habilitados.map(obj => {
                const app_habilita = "Activo";
                return [
                  { text: count++, style: 'itemsTableC' },
                  { text: obj.codigo, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTableC' },
                  { text: obj.usuario, style: 'itemsTable' },
                  { text: app_habilita, style: 'itemsTable' },
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

  /** ********************************************************************************* **
   ** **                              GENERACION DE EXCEL                            ** **
   ** ********************************************************************************* **/

  exportToExcel() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Activo";
    var ListadoUsuahabilitados = [];
    this.usersAppMovil_habilitados.forEach(obj => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "USUARIO": obj.usuario,
        "APP HABILITADA": app_habilita,
      }
      ListadoUsuahabilitados.push(objeto);
    });
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListadoUsuahabilitados);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'App_Habilitada');
    xlsx.writeFile(wb, "AppHabilitadaEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ********************************************************************************************** ** 
   ** **                              METODO PARA EXPORTAR A CSV                                  ** **
   ** ********************************************************************************************** **/

  exportToCVS() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Activo";
    var ListadoUsuahabilitados = [];
    this.usersAppMovil_habilitados.forEach(obj => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "USUARIO": obj.usuario,
        "APP HABILITADA": app_habilita,
      }
      ListadoUsuahabilitados.push(objeto);
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListadoUsuahabilitados);
    const csvDataR = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataR], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "AppHabilitadaCSV" + new Date().getTime() + '.csv');
  }

  /** ********************************************************************************************** **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ********************************************************************************************** **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Activo";
    var ListadoUsuaHabilitados = [];
    this.usersAppMovil_habilitados.forEach(obj => {
      objeto = {
        "App_movil": {
          '@id': cont++,
          "codigo": obj.codigo,
          "nombre": obj.nombre,
          "cedula": obj.cedula,
          "usuario": obj.usuario,
          "app_movil": app_habilita,
        }
      }
      ListadoUsuaHabilitados.push(objeto)
    });

    this.rest.CrearXML(ListadoUsuaHabilitados).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/relojes/xmlDownload/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  //Listado de Usuarios Deshabilitados
  /** ********************************************************************************* **
   ** **                        GENERACION DE PDFs                                   ** **
   ** ********************************************************************************* **/

   generarPdfDeshabilitados(action = 'open') {
    const documentDefinition = this.getDocumentDefinicionDeshabilitados();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }

  getDocumentDefinicionDeshabilitados() {
    sessionStorage.setItem('App_Deshabilitada', this.usersAppMovil_deshabilitados);
    return {

      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE LA PAGINA
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
        { text: 'Lista de usuarios app movil deshabilitados ', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFDeshabilitados(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFDeshabilitados() {
    let count = 1;
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'N#', style: 'tableHeader' },
                { text: 'Codigo', style: 'tableHeader' },
                { text: 'Empleado', style: 'tableHeader' },
                { text: 'Cedula', style: 'tableHeader' },
                { text: 'Usuario', style: 'tableHeader' },
                { text: 'App Movil', style: 'tableHeader' },
              ],
              ...this.usersAppMovil_deshabilitados.map(obj => {
                const app_habilita = "Inactivo";
                return [
                  { text: count++, style: 'itemsTableC' },
                  { text: obj.codigo, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.cedula, style: 'itemsTableC' },
                  { text: obj.usuario, style: 'itemsTable' },
                  { text: app_habilita, style: 'itemsTable' },
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

  /** ********************************************************************************* **
   ** **                              GENERACION DE EXCEL                            ** **
   ** ********************************************************************************* **/
  exportToExcelDeshabilitados() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Inactivo";
    var ListadoUsuaDeshabilitados = [];
    this.usersAppMovil_deshabilitados.forEach(obj => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "USUARIO": obj.usuario,
        "APP HABILITADA": app_habilita,
      }
      ListadoUsuaDeshabilitados.push(objeto);
    });
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListadoUsuaDeshabilitados);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'App_Deshabilitada');
    xlsx.writeFile(wb, "AppDeshabilitadaEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ********************************************************************************************** ** 
   ** **                              METODO PARA EXPORTAR A CSV                                  ** **
   ** ********************************************************************************************** **/

  exportToCVSDeshabilitados() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Inactivo";
    var ListadoUsuaDeshabilitados = [];
    this.usersAppMovil_deshabilitados.forEach(obj => {
      objeto = {
        'N#': cont++,
        "CODIGO": obj.codigo,
        "NOMBRE": obj.nombre,
        "CEDULA": obj.cedula,
        "USUARIO": obj.usuario,
        "APP HABILITADA": app_habilita,
      }
      ListadoUsuaDeshabilitados.push(objeto);
    });
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(ListadoUsuaDeshabilitados);
    const csvDataR = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataR], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "AppDeshabilitadaCSV" + new Date().getTime() + '.csv');
  }

  /** ********************************************************************************************** **
   ** **                          PARA LA EXPORTACION DE ARCHIVOS XML                             ** **
   ** ********************************************************************************************** **/

  urlxmlDes: string;
  dataDes: any = [];
  exportToXMLDeshabilitados() {
    var objeto: any;
    var cont: number = 1;
    const app_habilita = "Inactivo";
    var ListadoUsuaDeshabilitados = [];
    this.usersAppMovil_deshabilitados.forEach(obj => {
      objeto = {
        "App_movil": {
          '@id': cont++,
          "codigo": obj.codigo,
          "nombre": obj.nombre,
          "cedula": obj.cedula,
          "usuario": obj.usuario,
          "app_movil": app_habilita,
        }
      }
      ListadoUsuaDeshabilitados.push(objeto)
    });

    this.rest.CrearXMLIdDispositivos(ListadoUsuaDeshabilitados).subscribe(res => {
      this.dataDes = res;
      this.urlxmlDes = `${environment.url}/relojes/xmlDownload/` + this.dataDes.name;
      window.open(this.urlxmlDes, "_blank");
    });
  }

}