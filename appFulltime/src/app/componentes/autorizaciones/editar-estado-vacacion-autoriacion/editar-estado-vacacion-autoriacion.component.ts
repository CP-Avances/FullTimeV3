import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import * as moment from 'moment';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-vacacion-autoriacion',
  templateUrl: './editar-estado-vacacion-autoriacion.component.html',
  styleUrls: ['./editar-estado-vacacion-autoriacion.component.css']
})
export class EditarEstadoVacacionAutoriacionComponent implements OnInit {

  estados: Estado[] = [
    // { id: 1, nombre: 'Pendiente'},
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  constructor(
    private informacion: DatosGeneralesService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restA: AutorizacionService,
    private restV: VacacionesService,
    public ventana: MatDialogRef<EditarEstadoVacacionAutoriacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'datakjdjddjdndn');
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado'));
    this.ObtenerTiempo();
    if (this.data.auto.estado === 1) {
      this.toastr.info('Solicitud pendiente de aprobación.', '', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: this.data.auto.estado
      });
    }
    this.ObtenerDatos();
  }

  ObtenerTiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log('fecha Actual', this.FechaActual);
  }

  // METODO DE APROBACION DE SOLICITUD DE PERMISO
  ActualizarEstadoAprobacion(form: any) {
    let aprobacion = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') + '_' + form.estadoF + ',',
      estado: form.estadoF,
    }
    this.restA.ActualizarAprobacion(this.data.auto.id, aprobacion).subscribe(res => {
      this.EditarEstadoVacacion(this.data.auto.id_vacacion, form.estadoF);
      this.NotificarAprobacion(form.estadoF);
    })
  }

  // METODO DE ACTUALIZACION DE ESTADO DE VACACIONES
  EditarEstadoVacacion(id_vacacion: number, estado_vacacion: any) {
    let datosVacacion = {
      estado: estado_vacacion,
    }
    this.restV.ActualizarEstado(id_vacacion, datosVacacion).subscribe(respon => {
    });
  }

  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: number) {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    var datos = {
      depa_user_loggin: depa_user_loggin,
      objeto: this.data.vacacion,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === 2) {
      var estado_v = 'Preautorizado';
    }
    else if (estado === 3) {
      var estado_v = 'Autorizado';
    }
    else if (estado === 4) {
      var estado_v = 'Negado';
    }
    this.informacion.BuscarJefes(datos).subscribe(vacacion => {
      console.log(vacacion);
      this.EnviarCorreoEmpleados(vacacion, estado_v);
      this.EnviarNotificacion(vacacion, estado_v);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.ventana.close(true);
    });
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.vacacion.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  // METODO PARA ENVIO DE NOTIFICACIONES DE VACACIONES
  EnviarCorreoEmpleados(vacacion: any, estado_v: string) {

    console.log('ver vacaciones..   ', vacacion)

    var cont = 0;
    var correo_usuarios = '';

    vacacion.EmpleadosSendNotiEmail.forEach(e => {
      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE VACACIÓN
      let desde = moment.weekdays(moment(vacacion.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_inicio).day()).slice(1);
      let hasta = moment.weekdays(moment(vacacion.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacacion.fec_final).day()).slice(1);

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
          tipo_solicitud: 'Vacaciones ' + estado_v.toLowerCase() + ' por',
          idContrato: vacacion.id_contrato,
          estado_v: estado_v,
          proceso: estado_v.toLowerCase(),
          desde: desde + ' ' + moment(vacacion.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(vacacion.fec_final).format('DD/MM/YYYY'),
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'APROBACIÓN DE SOLICITUD DE VACACIONES',
          id: vacacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        console.log('ver correos..   ', correo_usuarios)
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

  // METODO PARA ENVIAR NOTIFICACIONES
  EnviarNotificacion(vacaciones: any, estado_v: string) {

    let desde = moment.weekdays(moment(vacaciones.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(vacaciones.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(vacaciones.fec_final).day()).slice(1);

    let notificacion = {
      id_receives_empl: '',
      id_receives_depa: '',
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      id_send_empl: vacaciones.id_empleado,
      id_permiso: null,
      estado: estado_v,
      mensaje: 'Ha ' + estado_v.toLowerCase() + ' su solicitud de vacaciones desde ' +
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
