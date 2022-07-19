import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-editar-vacaciones-empleado',
  templateUrl: './editar-vacaciones-empleado.component.html',
  styleUrls: ['./editar-vacaciones-empleado.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarVacacionesEmpleadoComponent implements OnInit {

  calcular = false;
  habilitarCalculados: boolean = false;

  dialaborableF = new FormControl('', [Validators.required]);
  fechaIngreso = new FormControl('', Validators.required);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  dialibreF = new FormControl('', [Validators.required]);
  calcularF = new FormControl('');
  totalF = new FormControl('');
  diasTF = new FormControl('');

  public VacacionesForm = new FormGroup({
    fechaIngresoForm: this.fechaIngreso,
    dialaborableForm: this.dialaborableF,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    diaLibreForm: this.dialibreF,
    calcularForm: this.calcularF,
    totalForm: this.totalF,
    diasTForm: this.diasTF
  });

  constructor(
    private restV: VacacionesService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private informacion: DatosGeneralesService,
    public ventana: MatDialogRef<EditarVacacionesEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public dato: any
  ) { }

  ngOnInit(): void {
    console.log('vacacion', this.dato);
    this.VacacionesForm.patchValue({
      fecInicioForm: this.dato.info.fec_inicio,
      fecFinalForm: this.dato.info.fec_final,
      fechaIngresoForm: this.dato.info.fec_ingreso,
      diaLibreForm: this.dato.info.dia_libre,
      dialaborableForm: this.dato.info.dia_laborable,
      calcularForm: true
    });
    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.dato.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  fechasTotales: any = [];
  VerificarFeriado(form): any {
    var diasFeriado = 0;
    var diasL = 0;
    let dataFechas = {
      fechaSalida: form.fecInicioForm,
      fechaIngreso: form.fecFinalForm
    }
    this.restV.BuscarFechasFeriado(dataFechas).subscribe(data => {
      this.fechasTotales = [];
      this.fechasTotales = data;
      console.log('fechas feriados', this.fechasTotales);
      var totalF = this.fechasTotales.length;
      console.log('total de fechas', totalF);

      for (let i = 0; i <= this.fechasTotales.length - 1; i++) {
        let fechaF = this.fechasTotales[i].fecha.split('T')[0];
        //let diasF = this.ContarDiasHabiles(fechaF, fechaF);
        let diasF = 5;
        console.log('total de fechas', diasF);
        if (diasF != 0) {
          diasFeriado = diasFeriado + 1;
        }
        else {
          diasL = diasL + 1;
        }
      }

      //var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      // var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      var habil = 5;
      var libre = 2;

      var totalH = habil - diasFeriado;
      var totalL = libre - diasL;
      const totalDias = totalH + totalL + totalF;

      this.VacacionesForm.patchValue({
        diaLibreForm: totalL,
        dialaborableForm: totalH,
        totalForm: totalDias,
        diasTForm: totalF
      });
      this.habilitarCalculados = true;

    }, error => {
      // var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      // var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      var habil = 5;
      var libre = 2;
      const totalDias = habil + libre;
      this.VacacionesForm.patchValue({
        diaLibreForm: libre,
        dialaborableForm: habil,
        totalForm: totalDias,
        diasTForm: 0
      });
      this.habilitarCalculados = true;
    })
  }

  ContarDiasHabiles(dateFrom, dateTo): any {
    var from = moment(dateFrom),
      to = moment(dateTo),
      days = 0;
    console.log('visualizar', from);
    while (!from.isAfter(to)) {
      /** Si no es sabado ni domingo */
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;;
      }
      from.add(1, 'days');
    }
    return days;
  }

  ContarDiasLibres(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      sa = 0;
    while (!from.isAfter(to)) {
      /** Si no es sabado ni domingo */
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;
      }
      else {
        sa++
      }
      from.add(1, 'days');
    }
    return sa;
  }

  ImprimirCalculos(form) {
    console.log(form.calcularForm);
    if (form.fecInicioForm === '' || form.fecFinalForm === '') {
      this.toastr.info('Aún no ha ingresado fecha de inicio o fin de vacaciones', '', {
        timeOut: 6000,
      })
      this.LimpiarCalculo();
    }
    else {
      if ((<HTMLInputElement>document.getElementById('activo')).checked) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm) && Date.parse(form.fecInicioForm) < Date.parse(form.fechaIngresoForm)) {
          this.VerificarFeriado(form);
        }
        else {
          this.toastr.info('La fecha de ingreso a trabajar y de finalización de vacaciones deben ser mayores a la fecha de salida a vacaciones', '', {
            timeOut: 6000,
          });
          (<HTMLInputElement>document.getElementById('activo')).checked = false;
        }
      } else {
        this.VacacionesForm.patchValue({
          diaLibreForm: '',
          dialaborableForm: '',
          totalForm: ''
        });
      }
    }
  }

  LimpiarCalculo() {
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
    this.VacacionesForm.patchValue({
      diaLibreForm: '',
      dialaborableForm: '',
      totalForm: ''
    });
  }

  ValidarDatosVacacion(form) {
    if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm) && Date.parse(form.fecInicioForm) < Date.parse(form.fechaIngresoForm)) {
      const ingreso = moment(form.fechaIngresoForm).diff(moment(form.fecFinalForm), 'days');
      console.log(ingreso);
      if (ingreso <= 1) {
        this.InsertarVacaciones(form);
      }
      else {
        this.toastr.info('La fecha de ingreso a laborar no es la adecuada', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.toastr.info('La fecha de ingreso a trabajar y de finalización de vacaciones deben ser mayores a la fecha de salida a vacaciones', '', {
        timeOut: 6000,
      });
    }
  }

  InsertarVacaciones(form) {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    let datosVacaciones = {
      depa_user_loggin: depa_user_loggin,
      dia_laborable: form.dialaborableForm,
      fec_ingreso: form.fechaIngresoForm,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      dia_libre: form.diaLibreForm + form.diasTForm,
    };
    console.log(datosVacaciones);
    this.restV.EditarVacacion(this.dato.info.id, datosVacaciones).subscribe(vacaciones => {
      this.toastr.success('Operación Exitosa', 'Vacaciones del Empleado registradas', {
        timeOut: 6000,
      })
      this.EnviarCorreoEmpleados(vacaciones);
      this.EnviarNotificacion(vacaciones);
      this.CerrarVentanaRegistroVacaciones();
    }, error => {
      this.toastr.error('Operación Fallida', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE VACACIONES                     ** **
   ** ******************************************************************************************* **/

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
        var estado_v = 'Pendiente de autorización';
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

      // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
      if (cont === vacacion.EmpleadosSendNotiEmail.length) {
        let datosVacacionCreada = {
          tipo_solicitud: 'Solicitud de vacaciones actualizada por',
          idContrato: this.dato.id_contrato,
          estado_v: estado_v,
          proceso: 'actualizado',
          desde: desde + ' ' + moment(vacacion.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(vacacion.fec_final).format('DD/MM/YYYY'),
          id_dep: e.id_dep, // VERIFICAR
          id_suc: e.id_suc, // VERIFICAR
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE VACACIONES',
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
      id_send_empl: this.dato.id_empleado,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: null,
      id_vacaciones: vacaciones.id,
      id_hora_extra: null,
      mensaje: 'Ha actualizado su solicitud de vacaciones desde ' +
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

  // METODO DE VALIDACION DE INGRESO DE NUMEROS
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

  LimpiarCampos() {
    this.VacacionesForm.reset();
  }

  CerrarVentanaRegistroVacaciones() {
    this.LimpiarCampos();
    this.ventana.close(true);
  }

}
