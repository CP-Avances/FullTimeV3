// IMPORTACION DE LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ScriptService } from 'src/app/servicios/empleado/script.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import * as xlsx from 'xlsx';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { RegistroDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-principal-departamento',
  templateUrl: './principal-departamento.component.html',
  styleUrls: ['./principal-departamento.component.css']
})

export class PrincipalDepartamentoComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS CONSULTADOS Y FILTROS DE BUSQUEDA
  filtroNombre = '';
  filtroNombreSuc = '';
  filtroEmpresaSuc = '';
  filtroDeparPadre = '';
  departamentos: any = [];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  departamentoPadreF = new FormControl('');
  departamentoF = new FormControl('');
  buscarNombre = new FormControl('', [Validators.minLength(2)]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    departamentoPadreForm: this.departamentoPadreF,
    departamentoForm: this.departamentoF,
    buscarNombreForm: this.buscarNombre,
  });

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  empleado: any = [];
  idEmpleado: number;

  constructor(
    private scriptService: ScriptService,
    private toastr: ToastrService,
    private router: Router,
    private rest: DepartamentosService,
    public restE: EmpleadoService,
    public ventana: MatDialog,
    public restEmpre: EmpresaService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    this.ListaDepartamentos();
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

  // CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR DEPARTAMENTOS
  ListaDepartamentos() {
    this.departamentos = []
    this.rest.ConsultarDepartamentos().subscribe(datos => {
      this.departamentos = datos;
      this.OrdenarDatos(this.departamentos);
    })
  }

  // METODO PARA ABRIR VENTANA DE REGISTRO DE DEPARTAMENTO
  AbrirVentanaRegistrarDepartamento(): void {
    this.ventana.open(RegistroDepartamentoComponent,
      { width: '600px' }).afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // METODO PARA ABRIR VENTANA DE EDICION DE DEPARTAMENTO
  AbrirVentanaEditarDepartamento(departamento: any): void {
    this.ventana.open(EditarDepartamentoComponent,
      { width: '600px', data: departamento }).afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  // METODO PARA LIMPIRA FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      departamentoForm: '',
      departamentoPadreForm: '',
      buscarNombreForm: '',
      buscarEmpresaForm: ''
    });
    this.ListaDepartamentos();
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_dep: number) {
    this.rest.EliminarRegistro(id_dep).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListaDepartamentos();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/departamento']);
        }
      });
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



  /** ************************************************************************************************** ** 
   ** **                                       METODO PARA EXPORTAR A PDF                             ** **
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
    sessionStorage.setItem('Departamentos', this.departamentos);
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
        { text: 'Lista de Departamentos', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFDepartamentos(),
      ],
      styles: {
        tableHeader: { fontSize: 12, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 10 },
        itemsTableC: { fontSize: 10, alignment: 'center' }
      }
    };
  }

  presentarDataPDFDepartamentos() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: [30, 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Nivel', style: 'tableHeader' },
                { text: 'Departamento Superior', style: 'tableHeader' }
              ],
              ...this.departamentos.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nomsucursal, style: 'itemsTable' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.nivel, style: 'itemsTableC' },
                  { text: obj.departamento_padre, style: 'itemsTableC' }
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

  /** ************************************************************************************************** ** 
   ** **                                 METODO PARA EXPORTAR A EXCEL                                 ** **
   ** ************************************************************************************************** **/
  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.departamentos);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'Departamentos');
    xlsx.writeFile(wb, "Departamentos" + new Date().getTime() + '.xlsx');
  }

  /** ************************************************************************************************** ** 
   ** **                                     METODO PARA EXPORTAR A CSV                               ** **
   ** ************************************************************************************************** **/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.departamentos);
    const csvDataH = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataH], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DepartamentosCSV" + new Date().getTime() + '.csv');
  }

  /** ************************************************************************************************* **
   ** **                               PARA LA EXPORTACION DE ARCHIVOS XML                           ** **
   ** ************************************************************************************************* **/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloDepartamentos = [];
    this.departamentos.forEach(obj => {
      objeto = {
        "departamento": {
          '@id': obj.id,
          "empresa": obj.nomempresa,
          "establecimiento": obj.nomsucursal,
          "departamento": obj.nombre,
          "nivel": obj.nivel,
          "departamento_superior": obj.departamento_padre,
        }
      }
      arregloDepartamentos.push(objeto)
    });

    this.rest.CrearXML(arregloDepartamentos).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/departamento/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}


