// IMPORTAR LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';

// IMPORTAR COMPONENTES
import { TiempoAutorizadoComponent } from '../tiempo-autorizado/tiempo-autorizado.component';

// IMPORTAR SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { HoraExtraAutorizacionesComponent } from 'src/app/componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { EditarEstadoHoraExtraAutorizacionComponent } from 'src/app/componentes/autorizaciones/editar-estado-hora-extra-autorizacion/editar-estado-hora-extra-autorizacion.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-ver-pedido-hora-extra',
  templateUrl: './ver-pedido-hora-extra.component.html',
  styleUrls: ['./ver-pedido-hora-extra.component.css']
})

export class VerPedidoHoraExtraComponent implements OnInit {

  // VARIABLES DE BÚSQUEDA DE DATOS DE SOLICITUDES DE HORAS EXTRAS
  dataParams: any;
  hora_extra: any = [];

  // BÚSQUEDA DE DATOS QUE SE MUESTRAN EN PDF
  fechaActual: any;
  datoSolicitud: any = [];
  habilitarActualizar: boolean = true;

  // VARIABLES DE BÚSQUEDA DE DATOS DE AUTORIZACIONES
  autorizacion: any = [];
  HabilitarTiempo: boolean = false;
  HabilitarAutorizacion: boolean = false;

  // DATOS DE EMPLEADO LOGUEADO
  empleado: any = [];
  idEmpleado: number;

  constructor(
    private validacionesService: ValidacionesService, // VARIABLE DE VALIDACIONES DE ACCESO
    private parametro: ParametrosService,
    private ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private router: Router, // VARIABLE DE MANEJO DE RUTAS
    private restHE: PedHoraExtraService, // SERVICIO DE DATOS DE SOLICITUD DE HORA EXTRA
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES
    private restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    public restEmpre: EmpresaService, // SERVICIOS DE DATOS EMPRESA
    public restGeneral: DatosGeneralesService, // SERVICIO DATOS GENERALES DE EMPLEADO
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    this.dataParams = this.router.routerState.snapshot.root.children[0].params;
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
        this.BuscarInfo(fecha, this.formato_hora);
      },
      vacio => {
        this.BuscarInfo(fecha, this.formato_hora);
      });
  }

  // VARIABLE DE ALMACENMAIENRO ID DE EMPLEADO QUE SOLICITA
  id_usua_solicita: number;
  // VARIABE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;

  // MÉTODO DE BÚSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarInfo(f_fecha: string, f_hora: string) {
    this.hora_extra = [];

    // BÚSQUEDA DE DATOS DE HORAS EXTRAS
    this.restHE.ObtenerUnHoraExtra(this.dataParams.id).subscribe(res => {
      this.hora_extra = res;
      if (this.hora_extra[0].tiempo_autorizado === null) {
        this.HabilitarTiempo = true;
      }
      this.id_usua_solicita = this.hora_extra[0].id_usua_solicita;

      this.hora_extra.forEach(h => {

        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        h.fec_inicio = moment(h.fec_inicio).format('YYYY-MM-DD') + ' ' + moment(h.fec_inicio).format('HH:mm:ss')
        h.fec_final = moment(h.fec_final).format('YYYY-MM-DD') + ' ' + moment(h.fec_final).format('HH:mm:ss')


        h.fecha_inicio = moment.weekdays(moment(h.fec_inicio.split(' ')[0]).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_inicio.split(' ')[0]).day()).slice(1) +
          ' ' + moment(h.fec_inicio).format(f_fecha);

        h.hora_inicio = moment(moment(h.fec_inicio).format('HH:mm:ss'), 'HH:mm').format(f_hora);

        h.fecha_fin = moment.weekdays(moment(h.fec_final.split(' ')[0]).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_final.split(' ')[0]).day()).slice(1) +
          ' ' + moment(h.fec_final).format(f_fecha);

        h.hora_fin = moment(moment(h.fec_final).format('HH:mm:ss'), 'HH:mm').format(f_hora);

        h.fec_solicita = moment.weekdays(moment(h.fec_solicita).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_solicita).day()).slice(1) +
          ' ' + moment(h.fec_solicita).format(f_fecha);
      })

      console.log('data horas .. ', this.hora_extra)

      this.ObtenerAprobacion();
    }, err => {
      return this.validacionesService.RedireccionarMixto(err.error)
    });
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.dataParams.id);
  }

  ObtenerAprobacion() {
    this.autorizacion = [];
    this.empleado_estado = [];
    this.lectura = 1;
    // BÚSQUEDA DE DATOS DE AUTORIZACIÓN
    this.restA.getUnaAutorizacionByHoraExtraRest(this.dataParams.id).subscribe(res1 => {
      this.autorizacion = res1;

      // MÉTODO PARA OBTENER EMPLEADOS Y ESTADOS
      var autorizaciones = this.autorizacion[0].id_documento.split(',');
      autorizaciones.map((obj: string) => {
        this.lectura = this.lectura + 1;
        if (obj != '') {
          let empleado_id = obj.split('_')[0];
          var estado_auto = obj.split('_')[1];
          // CAMBIAR DATO ESTADO INT A VARCHAR
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
      this.HabilitarAutorizacion = true;
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
    this.restHE.BuscarDatosSolicitud(id).subscribe(data => {
      this.datoSolicitud = data;
      // BÚSQUEDA DE DATOS DE EMPRESA
      this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
        var fecha_inicio = moment(this.datoSolicitud[0].fec_inicio);
        // MÉTODO PARA VER DÍAS DISPONIBLES DE AUTORIZACIÓN
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
    }, err => {
      return this.validacionesService.RedireccionarMixto(err.error)
    })
  }

  // MÉTODO PARA ABRIR VENTANAS
  AbrirAutorizaciones(datosHoraExtra, nombre) {
    this.ventana.open(HoraExtraAutorizacionesComponent, {
      width: '300px',
      data: { pedido_hora: datosHoraExtra, carga: nombre }
    }).afterClosed().subscribe(items => {
      this.BuscarParametro();
      this.HabilitarAutorizacion = true;
    });
  }

  // VENTANA QUE MUESTRA METODO DE APROBACION SELECCIONADO
  AbrirAprobacion(datos: any, proceso: string, aprobar: any) {
    this.ventana.open(TiempoAutorizadoComponent, {
      width: '400px',
      data: { horaExtra: datos, proceso: proceso, auto: aprobar }
    }).afterClosed().subscribe(items => {
      this.BuscarParametro();
    });
  }

  AbrirVentanaEditarAutorizacion(AutoHoraExtra) {
    this.ventana.open(EditarEstadoHoraExtraAutorizacionComponent,
      { width: '300px', data: { autorizacion: [AutoHoraExtra], empl: this.id_usua_solicita } })
      .afterClosed().subscribe(items => {
        this.BuscarParametro();
      })
  }

  ObtenerFecha() {
    var fecha
    var f = moment();
    fecha = f.format('YYYY-MM-DD');
    return fecha;
  }

  /** ******************************************************************************************************* * 
   **                                 MÉTODO PARA EXPORTAR A PDF ----HORAS EXTRAS                             *
   ** ******************************************************************************************************* */
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
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleado[0].nombre + ' ' + this.empleado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
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
        { text: 'SOLICITUD DE HORAS EXTRAS', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 10] },
        this.SeleccionarMetodo(this.ObtenerFecha()),
      ],
      styles: {
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
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
              { text: [{ text: 'CARGO: ' + this.datoSolicitud[0].cargo, style: 'itemsTableD' }] },
            ]
          }],
          [{ text: 'HORAS EXTRAS', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'DESCRIPCIÓN: ' + this.datoSolicitud[0].descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DE INICIO: ' + this.datoSolicitud[0].fec_inicio.split('T')[0], style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'TOTAL HORAS EXTRAS: ' + this.datoSolicitud[0].num_hora + ' horas', style: 'itemsTableD' }] },
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
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
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
