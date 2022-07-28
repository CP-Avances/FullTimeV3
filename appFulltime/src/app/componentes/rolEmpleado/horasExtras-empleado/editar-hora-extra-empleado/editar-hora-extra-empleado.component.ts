import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-hora-extra-empleado',
  templateUrl: './editar-hora-extra-empleado.component.html',
  styleUrls: ['./editar-hora-extra-empleado.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarHoraExtraEmpleadoComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  FechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  public PedirHoraExtraForm = new FormGroup({
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    FechaFinForm: this.FechaFinF,
    horaFinForm: this.horaFinF,
    estadoForm: this.estadoF,
    horasForm: this.horasF,
  });

  id_user_loggin: number;
  id_cargo_loggin: number;
  id_contrato_loggin: number;

  constructor(
    private realTime: RealTimeService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarHoraExtraEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) {
    // VARIABLES DEL EMPLEADO QUE SOLICITA
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));
    this.id_contrato_loggin = parseInt(localStorage.getItem("ultimoContrato"));
  }

  ngOnInit(): void {
    console.log(this.datos);

    this.estados.forEach(obj => {
      if (this.datos.estado === obj.nombre) {
        this.PedirHoraExtraForm.patchValue({ estadoForm: obj.id });
      }
    });
    this.PedirHoraExtraForm.patchValue({
      descripcionForm: this.datos.descripcion,
      fechaInicioForm: this.datos.fec_inicio,
      horaInicioForm: this.datos.fec_inicio.split("T")[1].split(".")[0],
      FechaFinForm: this.datos.fec_final,
      horaFinForm: this.datos.fec_final.split("T")[1].split(".")[0],
      horasForm: this.datos.num_hora.split(":")[0] + ":" + this.datos.num_hora.split(":")[1],
    });
  }

  InsertarHoraExtra(form1) {
    let dataPedirHoraExtra = {
      depa_user_loggin: localStorage.getItem('departamento'),
      tipo_funcion: 0,
      descripcion: form1.descripcionForm,
      fec_inicio: null,
      fec_final: null,
      num_hora: form1.horasForm + ":00",
      estado: form1.estadoForm,
    }

    dataPedirHoraExtra.fec_inicio = this.ValidarFechas(form1.fechaInicioForm, form1.horaInicioForm);
    dataPedirHoraExtra.fec_final = this.ValidarFechas(form1.FechaFinForm, form1.horaFinForm);

    this.restHE.EditarHoraExtra(parseInt(this.datos.id), dataPedirHoraExtra).subscribe(horaExtra => {
      console.log('ver horaE ---- ', horaExtra)
      this.toastr.success('Operación Exitosa', 'Hora extra solicitada', {
        timeOut: 6000,
      });
      this.EnviarCorreo(horaExtra);
      this.EnviarNotificacion(horaExtra);
      this.ventana.close(true);

    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
      }
    });

  }

  ValidarFechas(fecha, hora) {
    if (hora.split(":").length < 3) {
      hora = hora + ":00";
    }

    if (fecha._i != undefined) {
      fecha._i.month = fecha._i.month + 1;
      if (fecha._i.month < 10 && fecha._i.date < 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month < 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date < 10) {
        return fecha._i.year + "-" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      }
    } else {
      return fecha.split("T")[0] + "T" + hora + '.000Z'
    }

  }


  CalcularTiempo(form) {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
    if (form.horaInicioForm != '' && form.horaFinForm != '') {
      console.log('revisando horas', form.horaInicioForm, form.horaFinForm)
      var hora1 = (String(form.horaInicioForm) + ':00').split(":"),
        hora2 = (String(form.horaFinForm) + ':00').split(":"),
        t1 = new Date(),
        t2 = new Date();
      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));
      //Aquí hago la resta
      t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
      if (t1.getHours() < 10 && t1.getMinutes() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getHours() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getMinutes() < 10) {
        var tiempoTotal: string = t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
    }
    else {
      this.toastr.info('Debe ingresar la hora de inicio y la hora de fin de actividades.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE HORAS EXTRAS                      ** **
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
          tipo_solicitud: 'Realización de Horas Extras solicitadas por',
          solicitud: solicitud + ' ' + moment(horaExtra.fec_solicita).format('DD/MM/YYYY'),
          desde: desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY'),
          h_inicio: moment(horaExtra.fec_inicio).format('HH:mm'),
          h_final: moment(horaExtra.fec_final).format('HH:mm'),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          observacion: horaExtra.descripcion,
          estado_h: estado_h,
          proceso: 'actualizado',
          asunto: 'ACTUALIZACION DE SOLICITUD DE REALIZACION DE HORAS EXTRAS',
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
      mensaje: 'Ha actualizado su solicitud de horas extras desde ' +
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

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
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
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

}
