// IMPORTAR LIBRERIIAS
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { Router } from '@angular/router';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';

// IMPORTAR COMPONNETES
import { EditarEstadoVacacionAutoriacionComponent } from '../../autorizaciones/editar-estado-vacacion-autoriacion/editar-estado-vacacion-autoriacion.component';
import { VacacionAutorizacionesComponent } from '../../autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';

// IMPORTAR SERVICIOS
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';

// VARIABLE DE MANEJO DE ESTADOS
interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-ver-vacacion',
  templateUrl: './ver-vacacion.component.html',
  styleUrls: ['./ver-vacacion.component.css']
})

export class VerVacacionComponent implements OnInit {

  // VARIABLE DE BÚSQUEDA DE DATOS DE VACACIONES
  dep: any = [];
  vacacion: any = [];
  departamento: string = '';

  // VARIABLE DE BÚSQUEDA DE DATOS DE AUTORIZACIONES
  autorizacion: any = [];
  HabilitarAutorizacion: boolean = true;

  // OPCIONES DE ESTADOS
  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE EMPLEADO QUE INICIA SESIÓN
  empleado: any = [];
  idEmpleado: number;

  // VARIABLE DE ALMACENAMIENTO DE DATOS QUE SE MUESTRAN EN EL PDF
  fechaActual: any;
  id_vacacion: string;
  datoSolicitud: any = [];
  datosAutorizacion: any = [];
  habilitarActualizar: boolean = true;

  constructor(
    public restGeneral: DatosGeneralesService, // SERVICIO DE DATOS GENERALES DE EMPLEADO
    private restD: DepartamentosService, // SERVICIO DE DATOS DE DEPARTAMENTOS
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIÓN
    public restEmpre: EmpresaService, // SERVICIO DE DATOS DE EMPRESA
    private restV: VacacionesService, // SERVICIO DE DATOS DE SOLICITUD DE VACACIONES
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private router: Router, // VARIABLE DE MANEJO DE RUTAS
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    this.id_vacacion = this.router.url.split('/')[2];
  }

  ngOnInit(): void {
    this.BuscarDatos();
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // VARIABE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;

  // MÉTODO DE BÚSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarDatos() {
    this.autorizacion = [];
    this.vacacion = [];
    this.dep = [];

    // BÚSQUEDA DE DATOS DE VACACIONES
    this.restV.ObtenerUnaVacacion(parseInt(this.id_vacacion)).subscribe(res => {
      this.vacacion = res;

      // BÚSQUEDA DE DATOS DE AUTORIZACIÓN
      this.restA.getUnaAutorizacionByVacacionRest(this.vacacion[0].id).subscribe(res1 => {
        this.autorizacion = res1;
        console.log(this.autorizacion);

        // MÉTODO PARA OBTENER EMPLEADOS Y ESTADOS
        var autorizaciones = this.autorizacion[0].id_documento.split(',');
        autorizaciones.map((obj: string) => {
          this.lectura = this.lectura + 1;
          if (obj != '') {
            let empleado_id = obj.split('_')[0];
            var estado_auto = obj.split('_')[1];
            // CAMBIAR DATO ESTADO INT A VARCHAR
            if (estado_auto === '1') {
              estado_auto = 'Pendiente';
            }
            if (estado_auto === '2') {
              estado_auto = 'Pre-autorizado';
            }
            if (estado_auto === '3') {
              estado_auto = 'Autorizado';
            }
            if (estado_auto === '4') {
              estado_auto = 'Negado';
            }
            // CREAR ARRAY DE DATOS DE COLABORADORES
            var data = {
              id_empleado: empleado_id,
              estado: estado_auto
            }
            this.empleado_estado = this.empleado_estado.concat(data);
            // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR MÉTODO DE INFORMACIÓN DE AUTORIZACIÓN
            if (this.lectura === autorizaciones.length) {
              this.VerInformacionAutoriza(this.empleado_estado);
            }
          }
        })
        // TOMAR TAMAÑO DE ARREGLO DE COLABORADORES QUE REVIZARÓN SOLICITUD
        this.cont = autorizaciones.length - 1;

        // MÉTODO DE BÚSQUEDA DE DEPARTAMENTO
        this.restD.EncontrarUnDepartamento(this.autorizacion[0].id_departamento).subscribe(res2 => {
          this.dep.push(res2);
          this.dep.forEach(obj => {
            this.departamento = obj.nombre;
          });
        });
      }, error => {
        this.HabilitarAutorizacion = false;
      });
    });
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.id_vacacion);
  }

  // MÉTODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
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

  // MÉTODO PARA INGRESAR NOMBRE Y CARGO DEL USUARIO QUE REVISÓ LA SOLICITUD 
  cadena_texto: string = ''; // VARIABLE PARA ALMACENAR TODOS LOS USUARIOS
  VerInformacionAutoriza(array: any) {
    array.map(empl => {
      this.restGeneral.AutorizaEmpleado(parseInt(empl.id_empleado)).subscribe(data => {
        empl.nombre = data[0].e_nombre + ' ' + data[0].e_apellido;
        empl.cargo = data[0].cargo;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].e_nombre + ' ' + data[0].e_apellido + ' : ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' | ' + data[0].e_nombre + ' ' + data[0].e_apellido + ' : ' + empl.estado;
        }
      })
    })
  }

  // MÉTODO PARA VER LA INFORMACIÓN DE LA SOLICITUD 
  ObtenerSolicitud(id: any) {
    var f = moment();
    this.fechaActual = f.format('YYYY-MM-DD');
    this.datoSolicitud = [];
    // BÚSQUEDA DE DATOS DE SOLICITUD PARA MOSTRAR EN PDF
    this.restV.BuscarDatosSolicitud(id).subscribe(data => {
      this.datoSolicitud = data;
      // BÚSQUEDA DE DATOS DE EMPRESA
      this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
        var fecha_inicio = moment(this.datoSolicitud[0].fec_inicio);
        // MÉTODO PARA VER DÍAS DISPONIBLES DE AUTORIZACIÓN
        console.log(fecha_inicio.diff(this.fechaActual, 'days'), ' dias de diferencia');
        if (res[0].cambios === true) {
          if (res[0].cambios === 0) {
            this.habilitarActualizar = false;
          }
          else {
            var dias = fecha_inicio.diff(this.fechaActual, 'days');
            if (dias >= res[0].dias_cambio) {
              this.habilitarActualizar = false;
            }
            else {
              this.habilitarActualizar = true;
            }
          }
        } else {
          this.habilitarActualizar = true;
        }
      });
    })
  }

  // ABRIR VENTANAS DE NAVEGACIÓN
  AbrirVentanaEditarAutorizacion(datosSeleccionados: any): void {
    this.ventana.open(EditarEstadoVacacionAutoriacionComponent, { width: '350px', data: { datosSeleccionados, id_rece_emp: this.vacacion[0].id_empleado } })
      .afterClosed().subscribe(item => {
        this.BuscarDatos();
      });
  }

  AbrirAutorizaciones(datosSeleccionados: any): void {
    this.ventana.open(VacacionAutorizacionesComponent, { width: '350px', data: datosSeleccionados }).afterClosed().subscribe(item => {
      this.BuscarDatos();
      this.HabilitarAutorizacion = true;
    });
  }

  ObtenerFecha() {
    var fecha
    var f = moment();
    fecha = f.format('YYYY-MM-DD');
    return fecha;
  }

  /** **************************************************************************************************** * 
   *                                         MÉTODO PARA EXPORTAR A PDF                                    *
   ** **************************************************************************************************** */
  GenerarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  getDocumentDefinicion() {
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
        { text: this.datoSolicitud[0].nom_empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        { text: 'SOLICITUD DE VACACIONES', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 10] },
        this.SeleccionarMetodo(this.ObtenerFecha()),
      ],
      styles: {
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0] },
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color },
        itemsTableC: { fontSize: 10, alignment: 'center', margin: [50, 5, 5, 5] },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  SeleccionarMetodo(f) {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA: ' + f, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.datoSolicitud[0].nom_ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.datoSolicitud[0].apellido_emple, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.datoSolicitud[0].nombre_emple, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.datoSolicitud[0].cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.datoSolicitud[0].nom_regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'SUCURSAL: ' + this.datoSolicitud[0].nom_sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'DÍAS DE VACACIONES: ' + this.datoSolicitud[0].dia_laborable, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'VACACIONES', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.datoSolicitud[0].descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE INICIO: ' + this.datoSolicitud[0].fec_inicio.split('T')[0], style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'FECHA INGRESO: ' + this.datoSolicitud[0].fec_ingreso.split('T')[0], style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE FINALIZACIÓN: ' + this.datoSolicitud[0].fec_final.split('T')[0], style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'REVISADO POR: ' + this.cadena_texto, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [{
              columns: [
                { width: '*', text: '' },
                {
                  width: 'auto',
                  layout: 'lightHorizontalLines',
                  table: {
                    widths: ['auto'],
                    body: [
                      [{ text: this.empleado_estado[this.cont - 1].estado.toUpperCase() + ' POR', style: 'tableHeaderA' }],
                      [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                      [{ text: this.empleado_estado[this.cont - 1].nombre + '\n' + this.empleado_estado[this.cont - 1].cargo, style: 'itemsTable' }]
                    ]
                  }
                },
                { width: '*', text: '' },
              ]
            },
            {
              columns: [
                { width: '*', text: '' },
                {
                  width: 'auto',
                  layout: 'lightHorizontalLines',
                  table: {
                    widths: ['auto'],
                    body: [
                      [{ text: 'EMPLEADO', style: 'tableHeaderA' }],
                      [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] }],
                      [{ text: this.datoSolicitud[0].nombre_emple + ' ' + this.datoSolicitud[0].apellido_emple + '\n' + this.datoSolicitud[0].cargo, style: 'itemsTable' }]
                    ]
                  }
                },
                { width: '*', text: '' },
              ]
            }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i, node) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i, node) { return 40; },
        paddingRight: function (i, node) { return 40; },
        paddingTop: function (i, node) { return 10; },
        paddingBottom: function (i, node) { return 10; }
      }
    };
  }

}
