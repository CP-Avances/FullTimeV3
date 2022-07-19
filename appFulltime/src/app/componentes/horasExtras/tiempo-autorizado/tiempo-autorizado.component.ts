import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

@Component({
  selector: 'app-tiempo-autorizado',
  templateUrl: './tiempo-autorizado.component.html',
  styleUrls: ['./tiempo-autorizado.component.css']
})

export class TiempoAutorizadoComponent implements OnInit {

  // VARIABLES PARA MOSTRAR PROCESO
  aprobacion: boolean = false;
  observacion: boolean = false;
  editarHoras: boolean = false;
  guardarHoras: boolean = false;

  // VARIABLES DE LOS FORMULARIOS
  mensaje = new FormControl('', Validators.required);
  timer = new FormControl('', Validators.required);

  // FORMULARIO EDICION DE HORAS EXTRAS
  public TiempoHoraExtraForm = new FormGroup({
    timerForm: this.timer,
  });

  // FORMULARIO DE OBSERVACION
  public MensajeForm = new FormGroup({
    mensajeF: this.mensaje
  });

  idEmpleado: number;

  constructor(
    private informacion: DatosGeneralesService,
    private restPlanH: PlanHoraExtraService,
    private realTime: RealTimeService,
    private restPH: PedHoraExtraService,
    private toastr: ToastrService,
    private restA: AutorizacionService,
    public ventana: MatDialogRef<TiempoAutorizadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    console.log('data de la hora', this.data);
    this.MostrarProceso();
    this.ObtenerDatos();
  }

  // METODO PARA MOSTRAR PROCESO
  MostrarProceso() {
    if (this.data.proceso === 'aprobar') {
      this.aprobacion = true;
    }
    else if (this.data.proceso === 'editar') {
      this.editarHoras = true;
      this.guardarHoras = true;
    }
    else if (this.data.proceso === 'observacion') {
      this.observacion = true;
    }
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.horaExtra.id_usua_solicita).subscribe(datos => {
      this.actuales = datos;
      console.log('ver info usuario ', this.actuales)
    });
  }

  // METODO DE APROBACION DE SOLICITUD
  AprobacionSolicitud(estado: number) {
    this.TiempoAprobado(estado, this.data.horaExtra.num_hora);
  }

  // METODO DE ACTUALIZACION DE HORAS
  ActualizarHoras(estado: number, form: any) {
    this.TiempoAprobado(estado, form.timerForm + ':00')
  }

  // ACTUALIZAR TIEMPO APROBADO EN SOLIICTUD
  TiempoAprobado(estado: number, valor: any) {
    let h = {
      hora: valor
    }
    // GUARDAR HORAS EXTRAS REALIZADAS POR EL USUARIO
    this.restPH.AutorizarTiempoHoraExtra(this.data.horaExtra.id, h).subscribe(res => {
      this.ActualizarEstadoAprobacion(estado, valor);
    })
  }

  // EDITAR ESTADO DE LA AUTORIZACION
  ActualizarEstadoAprobacion(estado: number, valor: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') + '_' + estado + ',',
      estado: estado,
    }
    this.restA.ActualizarAprobacion(this.data.auto.id, aprobacion).subscribe(res => {
      this.EditarEstadoHoraExtra(estado);
      this.NotificarAprobacion(estado, valor);
    })
  }

  // EDITAR ESTADO DE LA SOLICITUD
  EditarEstadoHoraExtra(estado: number) {
    let datosHorasExtras = {
      estado: estado,
    }
    this.restPH.ActualizarEstado(this.data.horaExtra.id, datosHorasExtras).subscribe(horaExtra => {
    })
  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: number, valor: any) {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    var datos = {
      depa_user_loggin: depa_user_loggin,
      objeto: this.data.horaExtra,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_h = 'Preautorizado';
      var estado_c = 'Preautorizada';
      var estado_n = 'preautorizadas';
    }
    else if (estado === 3) {
      var estado_h = 'Autorizado';
      var estado_c = 'Autorizada';
      var estado_n = 'autorizadas';
    }
    else if (estado === 4) {
      var estado_h = 'Negado';
      var estado_c = 'Negada';
      var estado_n = 'negadas';
    }
    this.informacion.BuscarJefes(datos).subscribe(horaExtra => {
      console.log(horaExtra);
      this.EnviarCorreo(horaExtra, estado_h, estado_c, valor, estado_n);
      this.EnviarNotificacion(horaExtra, estado_h, valor, estado_n);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }

  // MÉTODO PARA CAMBIAR DE ESTADO EL CAMPO OBSERVACION DE SOLICITUD DE HORAS EXTRAS Y ENVIAR NOTIFICACIONES
  EnviarMensaje(form: any) {
    var datos = {
      observacion: true
    }
    this.restPH.EditarObservacionPedido(this.data.horaExtra.id, datos).subscribe(res => {
    });
    this.EnviarCorreoJustificacion(this.data.horaExtra, form.mensajeF)
    this.NotificarJustificacion(this.data.horaExtra, this.data.horaExtra.num_hora);
    this.toastr.success('', 'Proceso realizado exitosamente.', {
      timeOut: 6000,
    });
    this.ventana.close(true);
  }

  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreo(horaExtra: any, estado_h: string, estado_c: string, valor: any, estado_n: string) {

    console.log('ver horas extras ....   ', horaExtra)

    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = moment.weekdays(moment(horaExtra.fec_solicita).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_solicita).day()).slice(1);
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      if (e.hora_extra_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === horaExtra.EmpleadosSendNotiEmail.length) {

        let datosHoraExtraCreada = {
          tipo_solicitud: 'Solicitud de Hora Extra ' + estado_c.toLowerCase() + ' por',
          solicitud: solicitud + ' ' + moment(horaExtra.fec_solicita).format('DD/MM/YYYY'),
          desde: desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY'),
          h_inicio: moment(horaExtra.fec_inicio).format('HH:mm'),
          h_final: moment(horaExtra.fec_final).format('HH:mm'),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm') +
            '<br> <b>Num. horas ' + estado_n + ':</b> ' + moment(valor, 'HH:mm').format('HH:mm') + ' <br>',
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: estado_h.toLowerCase(),
          asunto: 'SOLICITUD DE HORAS EXTRAS ' + estado_c.toUpperCase(),
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: this.data.horaExtra.id_contrato,
          solicitado_por: localStorage.getItem('fullname_print')
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.restPH.EnviarCorreo(datosHoraExtraCreada).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de solicitud.', {
                  timeOut: 6000,
                });
              }
            },
            err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            },
            () => { },
          )
        }

      }
    })
  }

  // METODO PARA ENVIAR NOTIIFICACIONES AL SISTEMA
  EnviarNotificacion(horaExtra: any, estado_h: string, valor: any, estado_n: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);
    let h_inicio = moment(horaExtra.fec_inicio).format('HH:mm');
    let h_final = moment(horaExtra.fec_final).format('HH:mm');

    let mensaje = {
      id_empl_envia: this.idEmpleado,
      id_empl_recive: '',
      mensaje: 'Ha ' + estado_h.toLowerCase() + ' su solicitud de horas extras desde ' +
        desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_final +
        ' estado ' + estado_n + ' horas ' + moment(valor, 'HH:mm').format('HH:mm'),
      tipo: 12,  // APROBACIONES DE SOLICITUD DE HORAS EXTRAS
    }

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      mensaje.id_empl_recive = e.empleado;

      if (e.hora_extra_noti) {
        this.realTime.EnviarMensajeGeneral(mensaje).subscribe(
          resp => {
            console.log('ver data de notificacion', resp.respuesta)
            // this.restPH.sendNotiRealTime(resp.respuesta);
          },
          err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          },
          () => { },
        )
      }
    })
  }


  /** ****************************************************************************************************** **
   ** **           NOTIFICACIONES PARA SOLICITAR JUSTIFICACIÓN DE SOLICITUD DE HORA EXTRA                 ** ** 
   ** ****************************************************************************************************** **/

  EnviarCorreoJustificacion(horaExtra: any, mensaje: string) {
    console.log('ver horas extras ....   ', horaExtra)

    var correo_usuarios = this.actuales[0].correo;

    if (this.data.horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización'
    }
    else if (this.data.horaExtra.estado === 2) {
      var estado_h = 'Preautorizada'
    }
    else if (this.data.horaExtra.estado === 3) {
      var estado_h = 'Autorizada'
    }
    else if (this.data.horaExtra.estado === 4) {
      var estado_h = 'Negada'
    }

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = moment.weekdays(moment(horaExtra.fec_solicita).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_solicita).day()).slice(1);
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);

    let datosHoraExtraCreada = {
      tipo_solicitud: 'Solicitud de Justificación de Hora Extra por',
      solicitud: solicitud + ' ' + moment(horaExtra.fec_solicita).format('DD/MM/YYYY'),
      desde: desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY'),
      hasta: hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY'),
      h_inicio: moment(horaExtra.fec_inicio).format('HH:mm'),
      h_final: moment(horaExtra.fec_final).format('HH:mm'),
      num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
      observacion: horaExtra.descripcion,
      estado_h: estado_h + '<br><br> <b>Mensaje:</b> ' + mensaje,
      proceso: 'pedido justificar',
      asunto: 'SUBIR JUSTIFICACION DE SOLICITUD DE HORAS EXTRAS',
      correo: correo_usuarios,
      id: horaExtra.id,
      id_empl_contrato: this.data.horaExtra.id_contrato,
      solicitado_por: localStorage.getItem('fullname_print')
    }
    console.log('ver horas extras ....   ', datosHoraExtraCreada)

    this.restPH.EnviarCorreo(datosHoraExtraCreada).subscribe(
      resp => {
        if (resp.message === 'ok') {
          this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
            timeOut: 6000,
          });
        }
        else {
          this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de solicitud.', {
            timeOut: 6000,
          });
        }
      },
      err => {
        this.toastr.error(err.error.message, '', {
          timeOut: 6000,
        });
      },
      () => { },
    )

  }

  // MÉTODO PARA NOTIFICACION DE COMUNICADO
  NotificarJustificacion(horaExtra: any, valor: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);
    let h_inicio = moment(horaExtra.fec_inicio).format('HH:mm');
    let h_final = moment(horaExtra.fec_final).format('HH:mm');

    let mensaje = {
      id_empl_envia: this.idEmpleado,
      id_empl_recive: parseInt(this.actuales[0].id),
      mensaje: 'Justificar su solicitud de horas extras desde ' +
        desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_final +
        ' horas ' + moment(valor, 'HH:mm').format('HH:mm'),
      tipo: 11,  // JUSTIFICACION DE SOLIICTUD DE HORAS EXTRAS
    }
    this.realTime.EnviarMensajeGeneral(mensaje).subscribe(res => {
    })
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  LimpiarCampoHoras() {
    this.TiempoHoraExtraForm.patchValue({ timerForm: '' })
  }


}
