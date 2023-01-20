// SECCIÓN DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { EditarParametroComponent } from '../editar-parametro/editar-parametro.component';
import { CrearParametroComponent } from '../crear-parametro/crear-parametro.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

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
  public formulario = new FormGroup({
    descripcionForm: this.descripcionF,
  });

  constructor(
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
    private restP: ParametrosService,
    private toastr: ToastrService,
    private router: Router,

  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerParametros();
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

  // EVENTO PARA MANEJAR PAGINACIÓN EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA LISTAR PARÁMETROS
  parametros: any = [];
  ObtenerParametros() {
    this.parametros = [];
    this.restP.ListarParametros().subscribe(datos => {
      this.parametros = datos;
    });
  }

  // METODO PARA LIMPIAR CAMPO DE BUSQUEDA
  LimpiarCampos() {
    this.formulario.setValue({
      descripcionForm: '',
    });
    this.ObtenerParametros();
  }

  // METODO PARA ABRIR VENTANA CREACIÓN DE REGISTRO
  CrearParametro(): void {
    this.ventana.open(CrearParametroComponent,
      { width: '400px' }).afterClosed().subscribe(item => {
        this.ObtenerParametros();
      });
  }

  // METODO PARA ABRIR VENTANA EDICIÓN DE REGISTRO
  AbrirEditar(datos: any): void {
    this.ventana.open(EditarParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: false } }).afterClosed().subscribe(item => {
        this.ObtenerParametros();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id: number) {
    this.restP.EliminarTipoParametro(id).subscribe(res => {
      if (res.message === 'false') {
        this.toastr.error('No es posible eliminar registro.', 'Verificar dependencias.', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Registro eliminado.', '', {
          timeOut: 6000,
        });
        this.ObtenerParametros();
      }
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
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


  // revisar
  /** ************************************************************************************************** ** 
   ** **                                 METODO PARA EXPORTAR A PDF                                   ** **
   ** ************************************************************************************************** **/
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
      pageOrientation: 'portrait',
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

  presentarDataPDFTipoPermisos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Código', style: 'tableHeader' },
                { text: 'Descripción', style: 'tableHeader' },
                { text: 'Detalle', style: 'tableHeader' },
              ],
              ...this.parametros.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTable' },
                  { text: obj.descripcion, style: 'itemsTable' },
                  { text: obj.detalle, style: 'itemsTable' },
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
   *                                       METODO PARA EXPORTAR A EXCEL
   ******************************************************************************************************/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.parametros);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'ParametrosGenerales');
    xlsx.writeFile(wb, "ParametrosGeneralesEXCEL" + new Date().getTime() + '.xlsx');
  }

  /****************************************************************************************************** 
   *                                        METODO PARA EXPORTAR A CSV 
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
    var arregloParametrosGenerales = [];
    this.parametros.forEach(obj => {
      objeto = {
        "tipo_parametro": {
          '@id': obj.id,
          "descripcion": obj.descripcion,
          "detalle": obj.detalle,
        }
      }
      arregloParametrosGenerales.push(objeto)
    });

    this.restP.CrearXML(arregloParametrosGenerales).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/parametrizacion/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
