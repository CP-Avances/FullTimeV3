// IMPORTACIÓN DE LIBRERIAS
import { environment } from 'src/environments/environment';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { RelojesComponent } from 'src/app/componentes/catalogos/catRelojes/relojes/relojes.component';
import { EditarRelojComponent } from 'src/app/componentes/catalogos/catRelojes/editar-reloj/editar-reloj.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-relojes',
  templateUrl: './listar-relojes.component.html',
  styleUrls: ['./listar-relojes.component.css']
})

export class ListarRelojesComponent implements OnInit {

  // Almacenamiento de datos y búsqueda
  filtroNombreReloj = '';
  filtroModeloReloj = '';
  filtroIpReloj = '';
  filtroEmpresaReloj = '';
  filtroSucursalReloj = '';
  filtroDepartamentoReloj = '';
  relojes: any = [];

  empleado: any = [];
  idEmpleado: number;

  // Control de campos y validaciones del formulario
  nombreF = new FormControl('', [Validators.minLength(2)]);
  empresaF = new FormControl('', [Validators.minLength(2)]);
  sucursalF = new FormControl('', [Validators.minLength(2)]);
  departamentoF = new FormControl('', [Validators.minLength(2)]);
  ipF = new FormControl('');
  modeloF = new FormControl('', [Validators.minLength(2)]);

  // Asignación de validaciones a inputs del formulario
  public BuscarRelojesForm = new FormGroup({
    nombreForm: this.nombreF,
    ipForm: this.ipF,
    modeloForm: this.modeloF,
    empresaForm: this.empresaF,
    sucursalForm: this.sucursalF,
    departamentoForm: this.departamentoF
  });

  // items de paginacion de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url;

  constructor(
    private rest: RelojesService,
    public restE: EmpleadoService,
    public restEmpre: EmpresaService,
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerReloj();
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // Método para ver la información del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // Método para obtener el logo de la empresa
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

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ObtenerReloj() {
    this.relojes = [];
    this.rest.ConsultarRelojes().subscribe(datos => {
      this.relojes = datos;
    })
  }

  IngresarIp(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  LimpiarCampos() {
    this.BuscarRelojesForm.setValue({
      nombreForm: '',
      ipForm: '',
      modeloForm: '',
      empresaForm: '',
      sucursalForm: '',
      departamentoForm: ''
    });
    this.ObtenerReloj();
  }

  /*************************************************************************************
   * VENTANAS PARA REGISTRAR Y EDITAR DATOS DE UN DISPOSITIVO
   * ***********************************************************************************/

  /* Ventana para editar datos de dispositivo seleccionado */
  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarRelojComponent, {
      width: '1200px',
      data: { datosReloj: datosSeleccionados, actualizar: true }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerReloj();
      });;
  }

  /** Función para eliminar registro seleccionado Planificación*/
  EliminarRelojes(id_reloj: number) {
    this.rest.EliminarRegistro(id_reloj).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerReloj();
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarRelojes(datos.id);
        } else {
          this.router.navigate(['/listarRelojes/']);
        }
      });
  }

  /** Ventana para registrar datos de un nuevo dispositivo */
  AbrirVentanaRegistrarReloj(): void {
    this.vistaRegistrarDatos.open(RelojesComponent, { width: '1200px' })
      .afterClosed().subscribe(item => {
        this.ObtenerReloj();
      });;
  }

  /*************************************************************************************
   * MÉTODOS Y VARIABLES PARA SUBIR PLANTILLAS
   * ***********************************************************************************/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('', Validators.required);

  fileChange(element) {
    this.archivoSubido = element.target.files;
    this.nameFile = this.archivoSubido[0].name;
    let arrayItems = this.nameFile.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    let itemName = arrayItems[0].slice(0, 12);
    if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
      if (itemName.toLowerCase() == 'dispositivos') {
        this.plantilla();
      } else {
        this.toastr.error('Solo se acepta plantilla con nombre Dispositivos.', 'Plantilla seleccionada incorrecta.', {
          timeOut: 6000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      }
    } else {
      this.toastr.error('Error en el formato del documento.', 'Plantilla no aceptada.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }
  }

  plantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.Verificar_Datos_ArchivoExcel(formData).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
          'de la plantilla ingresada, recuerde que los datos no pueden estar duplicados dentro del sistema, ' +
          'es decir el nombre del equipo, código y la dirección IP son datos únicos de cada registro Aseguresa ' +
          'que el nombre de la sucursal y el departamento exitan dentro del sistema.',
          'Verificar los datos ingresados en la plantilla', {
          timeOut: 10000,
        });
        this.archivoForm.reset();
        this.nameFile = '';
      } else {
        this.rest.VerificarArchivoExcel(formData).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Para asegurar el buen funcionamiento del sistema es necesario que verifique los datos ' +
              'de la plantilla ingresada, recuerde que los datos no pueden estar duplicados dentro del sistema ' +
              'es decir el nombre del equipo, código y la dirección IP son datos únicos de cada registro. Aseguresa ' +
              'que el nombre de la sucursal y el departamento exitan dentro del sistema.',
              'Verificar los datos ingresados en la plantilla', {
              timeOut: 10000,
            });
            this.archivoForm.reset();
            this.nameFile = '';
          } else {
            this.rest.subirArchivoExcel(formData).subscribe(datos_reloj => {
              this.toastr.success('Operación Exitosa', 'Plantilla de Relojes importada.', {
                timeOut: 10000,
              });
              this.archivoForm.reset();
              this.nameFile = '';
              window.location.reload();
            });
          }
        });
      }
    });
  }

  /*************************************************************************************
   * GENERACIÓN DE PDFs 
   *************************************************************************************/

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
    sessionStorage.setItem('Dispositivos', this.relojes);
    return {

      // Encabezado de la página
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // Pie de la página
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');

        var h = new Date();
        // Formato de hora actual
        if (h.getMinutes() < 10) {
          var time = h.getHours() + ':0' + h.getMinutes();
        }
        else {
          var time = h.getHours() + ':' + h.getMinutes();
        }
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + time, opacity: 0.3 },
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
        { text: 'Lista de Dispositivos ', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        this.presentarDataPDFRelojes(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTable: { fontSize: 9 },
        itemsTableC: { fontSize: 9, alignment: 'center' }
      }
    };
  }

  presentarDataPDFRelojes() {
    return {
      columns: [
        { width: '*', text: '' },
        {
          width: 'auto',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Id', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'IP', style: 'tableHeader' },
                { text: 'Puerto', style: 'tableHeader' },
                { text: 'Marca', style: 'tableHeader' },
                { text: 'Modelo', style: 'tableHeader' },
                { text: 'Serie', style: 'tableHeader' },
                { text: 'ID Fabricante', style: 'tableHeader' },
                { text: 'Fabricante', style: 'tableHeader' },
                { text: 'Mac', style: 'tableHeader' },
                { text: 'Departamento', style: 'tableHeader' },
                { text: 'Establecimiento', style: 'tableHeader' },
                { text: 'Empresa', style: 'tableHeader' },
                { text: 'Ciudad', style: 'tableHeader' }
              ],
              ...this.relojes.map(obj => {
                return [
                  { text: obj.id, style: 'itemsTableC' },
                  { text: obj.nombre, style: 'itemsTable' },
                  { text: obj.ip, style: 'itemsTableC' },
                  { text: obj.puerto, style: 'itemsTableC' },
                  { text: obj.marca, style: 'itemsTable' },
                  { text: obj.modelo, style: 'itemsTable' },
                  { text: obj.serie, style: 'itemsTable' },
                  { text: obj.id_fabricacion, style: 'itemsTable' },
                  { text: obj.fabricante, style: 'itemsTable' },
                  { text: obj.mac, style: 'itemsTable' },
                  { text: obj.nomdepar, style: 'itemsTable' },
                  { text: obj.nomsucursal, style: 'itemsTable' },
                  { text: obj.nomempresa, style: 'itemsTable' },
                  { text: obj.nomciudad, style: 'itemsTable' }
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

  /*************************************************************************************
   * GENERACIÓN DE EXCEL 
   *************************************************************************************/

  exportToExcel() {
    const wsr: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relojes);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wsr, 'relojes');
    xlsx.writeFile(wb, "RelojesEXCEL" + new Date().getTime() + '.xlsx');
  }

  /****************************************************************************************************** 
   * MÉTODO PARA EXPORTAR A CSV 
   ******************************************************************************************************/

  exportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relojes);
    const csvDataR = xlsx.utils.sheet_to_csv(wse);
    const data: Blob = new Blob([csvDataR], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "DispositivosCSV" + new Date().getTime() + '.csv');
  }

  /* ****************************************************************************************************
   *                                 PARA LA EXPORTACIÓN DE ARCHIVOS XML
   * ****************************************************************************************************/

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloDispositivos = [];
    this.relojes.forEach(obj => {
      objeto = {
        "dispositivo": {
          '@id': obj.id,
          "nombre": obj.nombre,
          "ip": obj.ip,
          "puerto": obj.puerto,
          "marca": obj.marca,
          "modelo": obj.modelo,
          "serie": obj.serie,
          "id_fabricacion": obj.id_fabricacion,
          "fabricante": obj.fabricante,
          "mac": obj.mac,
          "nomdepar": obj.nomdepar,
          "nomsucursal": obj.nomsucursal,
          "nomempresa": obj.nomempresa,
          "nomciudad": obj.nomciudad,
        }
      }
      arregloDispositivos.push(objeto)
    });

    this.rest.DownloadXMLRest(arregloDispositivos).subscribe(res => {
      this.data = res;
      console.log("prueba data", res)
      this.urlxml = `${environment.url}/relojes/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}
