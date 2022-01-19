// IMPORTAR LIBRERIAS
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { Router } from '@angular/router';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';

// IMPORTAR COMPONENTES
import { EditarEstadoHoraExtraAutorizacionComponent } from '../../autorizaciones/editar-estado-hora-extra-autorizacion/editar-estado-hora-extra-autorizacion.component';
import { HoraExtraAutorizacionesComponent } from '../../autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { TiempoAutorizadoComponent } from '../tiempo-autorizado/tiempo-autorizado.component';

// IMPORTAR SERVICIOS
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// VARIABLE MANEJO DE ESTADO
interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-ver-pedido-hora-extra',
  templateUrl: './ver-pedido-hora-extra.component.html',
  styleUrls: ['./ver-pedido-hora-extra.component.css']
})

export class VerPedidoHoraExtraComponent implements OnInit {

  // OPCIONES DE ESTADO
  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // VARIABLES DE BÚSQUEDA DE DATOS DE SOLICITUDES DE HORAS EXTRAS
  dep: any = [];
  dataParams: any;
  hora_extra: any = [];
  departamento: string = '';

  // BÚSQUEDA DE DATOS QUE SE MUESTRAN EN PDF
  fechaActual: any;
  datoSolicitud: any = [];
  habilitarActualizar: boolean = true;

  // VARIABLES DE BÚSQUEDA DE DATOS DE AUTORIZACIONES
  autorizacion: any = [];
  HabilitarTiempo: boolean = true;
  HabilitarAutorizacion: boolean = true;

  // DATOS DE EMPLEADO LOGUEADO
  empleado: any = [];
  idEmpleado: number;

  constructor(
    private validacionesService: ValidacionesService, // VARIABLE DE VALIDACIONES DE ACCESO
    public restGeneral: DatosGeneralesService, // SERVICIO DATOS GENERALES DE EMPLEADO
    private restHE: PedHoraExtraService, // SERVICIO DE DATOS DE SOLICITUD DE HORA EXTRA
    private restD: DepartamentosService, // SERVICIO DE DATOS DE DEPARTAMENTOS
    private restA: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES
    public restEmpre: EmpresaService, // SERVICIOS DE DATOS EMPRESA
    private restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    private ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS
    private router: Router, // VARIABLE DE MANEJO DE RUTAS
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    this.dataParams = this.router.routerState.snapshot.root.children[0].params;
  }

  ngOnInit(): void {
    this.BuscarInfo();
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // VARIABLE DE ALMACENMAIENRO ID DE EMPLEADO QUE SOLICITA
  id_usua_solicita: number;
  // VARIABE DE ALMACENAMIENTO DE DATOS DE COLABORADORES QUE REVISARON SOLICITUD
  empleado_estado: any = [];
  // CONTADOR DE REVISIONES DE SOLICITUD
  lectura: number = 1;
  cont: number;

  // MÉTODO DE BÚSQUEDA DE DATOS DE SOLICITUD Y AUTORIZACIÓN
  BuscarInfo() {
    this.dep = [];

    // BÚSQUEDA DE DATOS DE HORAS EXTRAS
    this.restHE.ObtenerUnHoraExtra(this.dataParams.id).subscribe(res => {
      this.hora_extra = res;
      if (this.hora_extra[0].tiempo_autorizado === null) {
        this.HabilitarTiempo = false;
      }
      this.id_usua_solicita = this.hora_extra[0].id_usua_solicita;

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
    }, err => {
      return this.validacionesService.RedireccionarMixto(err.error)
    });
    this.ObtenerEmpleados(this.idEmpleado);
    this.ObtenerSolicitud(this.dataParams.id);
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
          this.cadena_texto = data[0].e_nombre + ' ' + data[0].e_apellido + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' | ' + data[0].e_nombre + ' ' + data[0].e_apellido + ': ' + empl.estado;
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
      this.BuscarInfo();
      this.HabilitarAutorizacion = true;
    });
  }

  AbrirTiempoAutorizacion(num_hora, id_hora, id_usua_solicita, datos) {
    let h = {
      id_hora: id_hora,
      hora: num_hora,
      id_empl_solicita: id_usua_solicita
    }
    this.ventana.open(TiempoAutorizadoComponent, {
      width: '300px',
      data: { horas_calculadas: h, pagina: 'solicitud_hora_extra' }
    }).afterClosed().subscribe(items => {
      if (items === true) {
        this.AbrirAutorizaciones(datos, 'individual');
      } else {
        window.location.reload();
      }
    });
  }

  AbrirVentanaEditarAutorizacion(AutoHoraExtra) {
    this.ventana.open(EditarEstadoHoraExtraAutorizacionComponent, { width: '300px', data: { autorizacion: [AutoHoraExtra], empl: this.id_usua_solicita } }).afterClosed().subscribe(items => {
      this.BuscarInfo();
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
