// IMPORTAR LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import * as moment from 'moment';
pdfMake.vfs = pdfFonts.pdfMake.vfs;


// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { EditarEstadoAutorizaccionComponent } from 'src/app/componentes/autorizaciones/editar-estado-autorizaccion/editar-estado-autorizaccion.component';

@Component({
  selector: 'app-ver-empleado-permiso',
  templateUrl: './ver-empleado-permiso.component.html',
  styleUrls: ['./ver-empleado-permiso.component.css']
})

export class VerEmpleadoPermisoComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  autorizacion: any = []; // DATOS AUTORIZACIONES
  InfoPermiso: any = []; // DATOS PERMISOS
  dep: any = []; // DATOS DEPARTAMENTOS

  departamento: string = '';
  estado: string = '';

  HabilitarAutorizacion: boolean = true;

  // VARIABLES DE BÚSQUEDA DE DATOS DE EMPLEADO
  empleado: any = [];
  idEmpleado: number;

  // VARIABLES USADAS PARA BÚSQUEDA DE DATOS DE PERMISO
  id_permiso: string;
  datoSolicitud: any = [];

  fechaActual: any;
  habilitarActualizar: boolean = true;
  hipervinculo: string = environment.url

  constructor(

    private parametro: ParametrosService,
    private validar: ValidacionesService, // VALIDACIONES DE ACCESO
    private router: Router, // VARIABLE DE MANEJO DE RUTAS O NAVEGACIÓN
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES 
    private restP: PermisosService, // SERVICIO DE DATOS DE PERMISO
    public restGeneral: DatosGeneralesService, // SERVICIO DE DATOS GENERALES DE EMPLEADO
    public restEmpre: EmpresaService, // SERVICIO DE DATOS DE EMPRESA
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    this.id_permiso = this.router.url.split('/')[2];
  }

  ngOnInit(): void {
    this.ObtenerLogo();
    this.ObtenerColores();
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // MÉTODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.BuscarDatos(fecha, this.formato_hora);
      },
      vacio => {
        this.BuscarDatos(fecha, this.formato_hora);
      });
  }

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;

  // MÉTODO DE BÚSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarDatos(formato_fecha: string, formato_hora: string) {
    this.InfoPermiso = [];

    // BÚSQUEDA DE DATOS DE PERMISO
    this.restP.obtenerUnPermisoEmpleado(parseInt(this.id_permiso)).subscribe(res => {
      this.InfoPermiso = res;

      this.InfoPermiso.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, formato_fecha, this.validar.dia_completo);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, formato_fecha, this.validar.dia_completo);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, formato_fecha, this.validar.dia_completo);

        p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, formato_hora);
        p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, formato_hora);

      })

      // BÚSQUEDA DE DATOS DE AUTORIZACIÓN
      this.ObtenerAutorizacion(this.InfoPermiso[0].id);

    }, err => {
      return this.validar.RedireccionarMixto(err.error)
    });
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.id_permiso);
  }


  ObtenerAutorizacion(id: number) {
    this.autorizacion = [];
    this.empleado_estado = [];
    this.lectura = 1;
    this.restA.getUnaAutorizacionByPermisoRest(id).subscribe(res1 => {
      this.autorizacion = res1;

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
            estado_auto = 'Preautorización';
          }
          if (estado_auto === '3') {
            estado_auto = 'Autorización';
          }
          if (estado_auto === '4') {
            estado_auto = 'Permiso Negado';
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

    }, error => {
      this.HabilitarAutorizacion = false;
    });
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
        empl.nombre = data[0].fullname;
        empl.cargo = data[0].cargo;
        empl.departamento = data[0].departamento;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].fullname + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' | ' + data[0].fullname + ': ' + empl.estado;
        }
      })
    })
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // MÉTODO PARA VER LA INFORMACIÓN DE LA SOLICITUD 
  ObtenerSolicitud(id: any) {
    var f = moment();
    this.fechaActual = f.format('YYYY-MM-DD');
    this.datoSolicitud = [];
    // BÚSQUEDA DE DATOS DE SOLICITUD PARA MOSTRAR EN PDF
    this.restP.BuscarDatosSolicitud(id).subscribe(data => {
      this.datoSolicitud = data;
      // BÚSQUEDA DE DATOS DE EMPRESA
      this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
        var fecha_inicio = moment(this.datoSolicitud[0].fec_inicio);
        // MÉTODO PARA VER DÍAS DISPONIBLES DE AUTORIZACIÓN
        console.log(fecha_inicio.diff(this.fechaActual, 'days'), ' dias de diferencia');

        console.log('fecha inicio -- ' + fecha_inicio + ' fecha actual ' + this.fechaActual +
          ' fecha dato ' + this.datoSolicitud[0].fec_inicio.split('T')[0])

        if (res[0].cambios === true) {
          if (res[0].cambios === 0) {
            this.habilitarActualizar = false;
          }
          else {
            //var dias = fecha_inicio.diff(this.fechaActual, 'days');
            var dias = moment(this.fechaActual).diff(fecha_inicio, 'days');
            console.log('dias ----- ', dias + ' cambio ' + res[0].dias_cambio);
            if (res[0].dias_cambio >= dias) {
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
    }, err => {
      return this.validar.RedireccionarMixto(err.error)
    })
  }

  AbrirVentanaEditarAutorizacion(autoriza: any): void {
    this.ventana.open(EditarEstadoAutorizaccionComponent,
      { width: '350px', data: { auto: autoriza, permiso: this.InfoPermiso[0] } })
      .afterClosed().subscribe(item => {
        this.BuscarParametro();
      });
  }

  /* **************************************************************************************************** * 
   *                                         MÉTODO PARA EXPORTAR A PDF                                   *
   * **************************************************************************************************** */
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
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        var f = moment();
        fecha = f.format('DD/MM/YYYY');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logo, width: 150, margin: [10, -25, 0, 5] },
        { text: this.datoSolicitud[0].nom_empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, 0, 0, 20] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] },
        this.SeleccionarMetodo(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  SeleccionarMetodo() {
    let fec_creacion_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_creacion.split('T')[0], this.formato_fecha, this.validar.dia_completo)
    let fec_inicio_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_inicio.split('T')[0], this.formato_fecha, this.validar.dia_completo)
    let fec_final_ = this.validar.FormatearFecha(this.datoSolicitud[0].fec_final.split('T')[0], this.formato_fecha, this.validar.dia_completo)

    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA: ' + fec_creacion_, style: 'itemsTableD' }] },
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
              { text: [{ text: 'Sucursal: ' + this.datoSolicitud[0].nom_sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.datoSolicitud[0].num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.datoSolicitud[0].nom_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE INICIO: ' + fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.datoSolicitud[0].descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE FINALIZACIÓN: ' + fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'REVISADO POR: ' + this.cadena_texto, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: this.empleado_estado[this.cont - 1].estado.toUpperCase() + ' POR', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.empleado_estado[this.cont - 1].nombre + '\n' + this.empleado_estado[this.cont - 1].cargo, style: 'itemsTable' },]
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
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.datoSolicitud[0].nombre_emple + ' ' + this.datoSolicitud[0].apellido_emple + '\n' + this.datoSolicitud[0].cargo, style: 'itemsTable' },]
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
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 10; },
        paddingBottom: function (i: any, node: any) { return 10; }
      }
    };
  }

}
