import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

@Component({
  selector: 'app-cancelar-vacaciones',
  templateUrl: './cancelar-vacaciones.component.html',
  styleUrls: ['./cancelar-vacaciones.component.css']
})

export class CancelarVacacionesComponent implements OnInit {

  constructor(

    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restV: VacacionesService,
    public ventana: MatDialogRef<CancelarVacacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  aceptarAdvertencia() {
    console.log('id vaca ---- ', this.data.id);
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    this.restV.EliminarVacacion(this.data.id).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: depa_user_loggin,
        objeto: res,
      }
      console.log(datos);
      this.informacion.BuscarJefes(datos).subscribe(vacacion => {
        console.log(vacacion);
        this.EnviarNotificacion(vacacion);
        this.EnviarCorreoEmpleados(vacacion);
        this.toastr.error('Solicitud de vacaciones eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    });
  }

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoEmpleados(vacacion: any) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = moment.weekdays(moment(vacacion.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_inicio).day()).slice(1);
      let hasta = moment.weekdays(moment(vacacion.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_final).day()).slice(1);

      // CAPTURANDO ESTADO DE LA SOLICITUD DE VACACIÓN
      if (vacacion.estado === 1) {
        var estado_v = 'Pendiente';
      }

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.vaca_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('ver contadores..   ', cont + '   ' + vacacion.EmpleadosSendNotiEmail.length)
      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Solicitud de vacaciones eliminada por',
          idContrato: this.data.id_contrato,
          estado_v: estado_v,
          proceso: 'eliminado',
          desde: desde + ' ' + moment(vacacion.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(vacacion.fec_final).format('DD/MM/YYYY'),
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE VACACIONES',
          id: vacacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restV.EnviarCorreoVacaciones(datosVacacionCreada).subscribe(
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

  EnviarNotificacion(vacaciones: any) {

    let desde = moment.weekdays(moment(vacaciones.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(vacaciones.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_final).day()).slice(1);

    let notificacion = {
      id_send_empl: this.data.id_empleado,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      mensaje: 'Ha eliminado su solicitud de vacaciones desde ' +
        desde + ' ' + moment(vacaciones.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(vacaciones.fec_final).format('DD/MM/YYYY'),
    }

    vacaciones.EmpleadosSendNotiEmail.forEach(e => {

      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;

      if (e.vaca_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            console.log('ver data de notificacion', resp.respuesta)
            this.restV.sendNotiRealTime(resp.respuesta);
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
