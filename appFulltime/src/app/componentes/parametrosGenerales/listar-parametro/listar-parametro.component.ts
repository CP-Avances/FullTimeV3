// SECCIÓN DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { CrearParametroComponent } from '../crear-parametro/crear-parametro.component';
import { EditarParametroComponent } from '../editar-parametro/editar-parametro.component';

@Component({
  selector: 'app-listar-parametro',
  templateUrl: './listar-parametro.component.html',
  styleUrls: ['./listar-parametro.component.css']
})

export class ListarParametroComponent implements OnInit {

  tipoPermiso: any = [];
  filtroDescripcion = '';

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public ParametrosForm = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  constructor(
    private rest: TipoPermisosService,

    public restE: EmpleadoService,
    public restEmpre: EmpresaService,
    public ventana: MatDialog,
    private restP: ParametrosService,
    private toastr: ToastrService,
    private router: Router,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerParametros();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA LISTAR PARÁMETROS
  parametros: any = [];
  ObtenerParametros() {
    this.parametros = [];
    this.restP.ListarParametros().subscribe(datos => {
      this.parametros = datos;
    }, error => { });
  }

  // MÉTODO PARA LIMPIAR CAMPO DE BÚSQUEDA
  LimpiarCampos() {
    this.ParametrosForm.setValue({
      descripcionForm: '',
    });
    this.ObtenerParametros();
  }

  // MÉTODO PARA ABRIR VENTANA CREACIÓN DE REGISTRO
  CrearParametro(): void {
    this.ventana.open(CrearParametroComponent,
      { width: '400px' }).afterClosed().subscribe(item => {
        this.ObtenerParametros();
      });
  }

  // MÉTODO PARA ABRIR VENTANA EDICIÓN DE REGISTRO
  AbrirEditar(datos: any): void {
    this.ventana.open(EditarParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: false } }).afterClosed().subscribe(item => {
        this.ObtenerParametros();
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id: number) {
    this.restP.EliminarTipoParametro(id).subscribe(res => {
      if (res.message === 'false') {
        this.toastr.error('No es posible eliminar registro.', 'Verificar dependencias.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Registro eliminado', '', {
          timeOut: 6000,
        });
        this.ObtenerParametros();
      }
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);          
        } else {
          this.router.navigate(['/parametros']);
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
    sessionStorage.setItem('Parametros', this.parametros);
    return {

      // Encabezado de la página
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // Pie de página
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
        { text: 'Lista de Tipos de Permisos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFTipoPermisos(),
      ],
      styles: {
        tableHeader: { fontSize: 9, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 8, alignment: 'center', }
      }
    };
  }

  DescuentoSelect: any = ['Vacaciones', 'Ninguno'];
  AccesoEmpleadoSelect: any = ['Si', 'No'];
  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Permiso', style: 'tableHeader' },
                { text: 'Días de permiso', style: 'tableHeader' },
                { text: 'Horas de permiso', style: 'tableHeader' },
                { text: 'Solicita Empleado', style: 'tableHeader' },
                { text: 'Días para solicitar', style: 'tableHeader' },
                { text: 'Incluye almuerzo', style: 'tableHeader' },
                { text: 'Afecta Vacaciones', style: 'tableHeader' },
                { text: 'Acumular', style: 'tableHeader' },
                { text: 'Notificar por correo', style: 'tableHeader' },
                { text: 'Descuento', style: 'tableHeader' },
                { text: 'Actualizar', style: 'tableHeader' },
                { text: 'Eliminar', style: 'tableHeader' },
                { text: 'Preautorizar', style: 'tableHeader' },
                { text: 'Autorizar', style: 'tableHeader' },
                { text: 'Legalizar', style: 'tableHeader' },
                { text: 'Días para Justificar', style: 'tableHeader' }
              ],
              ...this.parametros.map(obj => {
                var descuento = this.DescuentoSelect[obj.tipo_descuento - 1];
                var acceso = this.AccesoEmpleadoSelect[obj.acce_empleado - 1];
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.num_dia_maximo, style: 'itemsTable' },
                  { text: obj.num_hora_maximo, style: 'itemsTable' },
                  { text: acceso, style: 'itemsTable' },
                  { text: obj.num_dia_ingreso, style: 'itemsTable' },
                  { text: obj.almu_incluir, style: 'itemsTable' },
                  { text: obj.vaca_afecta, style: 'itemsTable' },
                  { text: obj.anio_acumula, style: 'itemsTable' },
                  { text: obj.correo, style: 'itemsTable' },
                  { text: descuento, style: 'itemsTable' },
                  { text: obj.actualizar, style: 'itemsTable' },
                  { text: obj.eliminar, style: 'itemsTable' },
                  { text: obj.preautorizar, style: 'itemsTable' },
                  { text: obj.autorizar, style: 'itemsTable' },
                  { text: obj.legalizar, style: 'itemsTable' },
                  { text: obj.gene_justificacion, style: 'itemsTable' },
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
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.parametros);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'ParametrosGenerales');
    xlsx.writeFile(wb, "ParametrosGenerales" + new Date().getTime() + '.xlsx');
  }

  /****************************************************************************************************** 
   *                                        MÉTODO PARA EXPORTAR A CSV 
   ******************************************************************************************************/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.parametros);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "ParametrosGeneralesCSV" + new Date().getTime() + '.csv');
  }

  /* ****************************************************************************************************
   *                                 PARA LA EXPORTACIÓN DE ARCHIVOS XML
   * ****************************************************************************************************/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloTipoPermisos = [];
    this.parametros.forEach(obj => {
      var descuento = this.DescuentoSelect[obj.tipo_descuento - 1];
      var acceso = this.AccesoEmpleadoSelect[obj.acce_empleado - 1];
      objeto = {
        "tipo_permiso": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "num_dia_maximo": obj.num_dia_maximo,
          "num_hora_maximo": obj.num_hora_maximo,
          "acce_empleado": acceso,
          "num_dia_ingreso": obj.num_dia_ingreso,
          "almu_incluir": obj.almu_incluir,
          "vaca_afecta": obj.vaca_afecta,
          "anio_acumula": obj.anio_acumula,
          "correo": obj.correo,
          "tipo_descuento": descuento,
          "actualizar": obj.actualizar,
          "eliminar": obj.eliminar,
          "preautorizar": obj.preautorizar,
          "autorizar": obj.autorizar,
          "legalizar": obj.legalizar,
          "fec_validar": obj.fec_validar,
          "gene_justificacion": obj.gene_justificacion,
        }
      }
      arregloTipoPermisos.push(objeto)
    });

    this.rest.DownloadXMLRest(arregloTipoPermisos).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
