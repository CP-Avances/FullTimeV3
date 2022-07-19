import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

@Component({
  selector: 'app-cancelar-hora-extra',
  templateUrl: './cancelar-hora-extra.component.html',
  styleUrls: ['./cancelar-hora-extra.component.css']
})

export class CancelarHoraExtraComponent implements OnInit {

  id_user_loggin: number;
  id_cargo_loggin: number;
  id_contrato_loggin: number;

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<CancelarHoraExtraComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // VARIABLES DEL EMPLEADO QUE SOLICITA
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));
    this.id_contrato_loggin = parseInt(localStorage.getItem("ultimoContrato"));
  }

  ngOnInit(): void {
    console.log(this.data);
  }

  aceptarAdvertencia() {
    this.restHE.EliminarHoraExtra(this.data).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: localStorage.getItem('departamento'),
        objeto: res,
      }
      this.informacion.BuscarJefes(datos).subscribe(horaExtra => {
        console.log(horaExtra);
        this.EnviarCorreo(horaExtra);
        this.EnviarNotificacion(horaExtra);
        this.toastr.error('Solicitud de Horas Extras eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close(false);
      }
    });
  }

  /** ******************************************************************************************* **
   ** **                METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
   ** ******************************************************************************************* **/

  // METODO PARA ENVIAR NOTIFICACIONES DE CORREO
  EnviarCorreo(horaExtra: any) {

    console.log('ver horas extras ....   ', horaExtra)

    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let solicitud = moment.weekdays(moment(horaExtra.fec_solicita).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_solicita).day()).slice(1);
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE HORA EXTRA
    if (horaExtra.estado === 1) {
      var estado_h = 'Pendiente de autorización';
    }

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
          tipo_solicitud: 'Eliminación de solicitud de Horas Extras por',
          solicitud: solicitud + ' ' + moment(horaExtra.fec_solicita).format('DD/MM/YYYY'),
          desde: desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY'),
          h_inicio: moment(horaExtra.fec_inicio).format('HH:mm'),
          h_final: moment(horaExtra.fec_final).format('HH:mm'),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: 'eliminado',
          asunto: 'ELIMINACION DE SOLICITUD DE HORAS EXTRAS',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          id: horaExtra.id,
          id_empl_contrato: this.id_contrato_loggin,
          solicitado_por: localStorage.getItem('fullname_print')
        }
        console.log('ver horas extras ....   ', datosHoraExtraCreada)
        if (correo_usuarios != '') {
          this.restHE.EnviarCorreo(datosHoraExtraCreada).subscribe(
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
  EnviarNotificacion(horaExtra: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE HORA EXTRA
    let desde = moment.weekdays(moment(horaExtra.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(horaExtra.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(horaExtra.fec_final).day()).slice(1);
    let h_inicio = moment(horaExtra.fec_inicio).format('HH:mm');
    let h_final = moment(horaExtra.fec_final).format('HH:mm');

    let notificacion = {
      id_send_empl: this.id_user_loggin,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: null,
      id_hora_extra: horaExtra.id,
      mensaje: 'Ha eliminado su solicitud de horas extras desde ' +
        desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_final,
    }

    horaExtra.EmpleadosSendNotiEmail.forEach(e => {

      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;

      if (e.hora_extra_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            console.log('ver data de notificacion', resp.respuesta)
            this.restHE.sendNotiRealTime(resp.respuesta);
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
}
