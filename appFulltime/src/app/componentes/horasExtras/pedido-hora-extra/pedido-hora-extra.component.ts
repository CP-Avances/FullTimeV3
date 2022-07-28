import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

// INTERFACE QUE PERMITE DEFINIR LOS DATOS DE ESTADO DE LA SOLICITU DE HORAS EXTRAS
interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-pedido-hora-extra',
  templateUrl: './pedido-hora-extra.component.html',
  styleUrls: ['./pedido-hora-extra.component.css'],
})

export class PedidoHoraExtraComponent implements OnInit {

  // TIPOS DE ESTADOS QUE TIENE UNA SOLICITUD DE HORAS EXTRAS
  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaSolicitudF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  FechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  // VARIABLES DEL FORMULARIO DONDE SE REGISTRA LOS DATOS INGRESADOS
  public PedirHoraExtraForm = new FormGroup({
    fechaSolicitudForm: this.fechaSolicitudF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    FechaFinForm: this.FechaFinF,
    horaFinForm: this.horaFinF,
    estadoForm: this.estadoF,
    horasForm: this.horasF,
  });

  // DATOS DEL EMPLEADO
  FechaActual: any;
  id_user_loggin: number;
  id_cargo_loggin: number;
  id_contrato_loggin: number;

  constructor(
    private realTime: RealTimeService,
    private validar: ValidacionesService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    private restE: EmpleadoService,
    public restAutoriza: AutorizacionService,
    public ventana: MatDialogRef<PedidoHoraExtraComponent>,
  ) {
    // VARIABLES DEL EMPLEADO QUE SOLICITA
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));
    this.id_contrato_loggin = parseInt(localStorage.getItem("ultimoContrato"));
  }

  ngOnInit(): void {
    // OBTENER LA FECHA ACTUAL
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.PedirHoraExtraForm.patchValue({
      fechaSolicitudForm: this.FechaActual,
      estadoForm: 1
    });

    // OBTENER EL HORARIO DEL EMPLEADO
    this.HorarioEmpleadoSemanal(this.id_cargo_loggin);
    // OBTENER LOS DATOS GENERALES DEL EMPLEADO
    this.ObtenerEmpleados(this.id_user_loggin);
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  empleados: any = [];
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
    })
  }

  // MÉTODO PARA OBTENER EL HORARIO DEL EMPLEADO 
  Horario: any
  HorarioEmpleadoSemanal(id_cargo: number) {
    this.restHE.HorarioEmpleadoSemanal(id_cargo).subscribe(res => {
      this.Horario = res;
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
      }
    });
  }

  // MÉTODO PARA VALIDAR LA FECHA DE LA SOLICITUD CON EL HORARIO DEL EMPLEADO 
  ValidarFechas(formFechas) {
    var fi = new Date(formFechas.fechaInicioForm);
    var ff = new Date(formFechas.FechaFinForm)

    console.log(fi.toJSON()); console.log(ff.toJSON());
    if (fi > ff) {
      this.toastr.error('Fecha inicial no puede ser mayor a fecha final', '', {
        timeOut: 6000,
      })
      this.fechaInicioF.reset();
      this.FechaFinF.reset()
    }
    //false ===> significa que ese dia labora || true ===> significa que ese dia tiene libre
    let valor1 = this.Horario.filter(fil => {
      return fil.fecha === fi.toJSON().split('T')[0];
    }).map(result => {
      return result.estado
    })
    let valor2 = this.Horario.filter(fil => {
      return fil.fecha === ff.toJSON().split('T')[0];
    }).map(result => {
      return result.estado
    })

    console.log(valor1[0]); console.log(valor2[0]);
    if (valor1[0] === undefined || valor2[0] === undefined) {
      this.toastr.error('Fechas seleccionadas no corresponden a la semana laboral actual', '', {
        timeOut: 6000,
      });
      this.fechaInicioF.reset();
      this.FechaFinF.reset()
    }

    if (valor1[0] === true) {
      this.toastr.info('Fecha de inicio tiene dia libre', '', {
        timeOut: 6000,
      })
      this.fechaInicioF.reset();
    }
    if (valor2[0] === true) {
      this.toastr.info('Fecha de fin tiene dia libre', '', {
        timeOut: 6000,
      })
      this.FechaFinF.reset()
    }
    console.log(valor1, '===', valor2);
  }

  // MÉTODO PARA REGISTRAR LOS DATOS DEL PEDIDO DE HORA EXTRA 
  HoraExtraResponse: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  insertarTipoPermiso(form1) {
    console.log(form1.fechaInicioForm, form1.horaInicioForm);
    console.log(form1.FechaFinForm, form1.horaFinForm);

    let horaI = form1.fechaInicioForm._i.year + "-" + form1.fechaInicioForm._i.month + "-" + form1.fechaInicioForm._i.date + "T" + form1.horaInicioForm + ":00"
    let horaF = form1.FechaFinForm._i.year + "-" + form1.FechaFinForm._i.month + "-" + form1.FechaFinForm._i.date + "T" + form1.horaFinForm + ":00"
    let dataPedirHoraExtra = {
      id_empl_cargo: this.id_cargo_loggin,
      id_usua_solicita: this.id_user_loggin,
      fec_inicio: horaI,
      fec_final: horaF,
      fec_solicita: form1.fechaSolicitudForm,
      num_hora: form1.horasForm + ":00",
      descripcion: form1.descripcionForm,
      estado: form1.estadoForm,
      observacion: false,
      tipo_funcion: 0,
      depa_user_loggin: parseInt(localStorage.getItem('departamento')),
      codigo: this.empleados[0].codigo
    }
    this.restHE.GuardarHoraExtra(dataPedirHoraExtra).subscribe(horaExtra => {
      this.IngresarAutorizacion(horaExtra);
      this.EnviarNotificacion(horaExtra);
      this.EnviarCorreo(horaExtra);
      this.toastr.success('Operación Exitosa', 'Hora extra solicitada', {
        timeOut: 6000,
      });
      this.ventana.close();
    }, err => {
      const { access, message } = err.error.message;
      if (message) return this.toastr.error(message)
      if (access === false) {
        this.ventana.close();
      }
    });
  }

  // MÉTODO PARA VALIDAR EL INGRESO DE LETRAS 
  IngresarSoloLetras(e) {
    return this.validar.IngresarSoloLetras(e)
  }

  // MÉTODO PARA VALIDAR EL INGRESO DE NÚMEROS
  IngresarSoloNumeros(evt) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  // MÉTODO PARA CALCULAR EL NÚMERO DE HORAS SOLICITADAS  
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
      // AQUÍ HAGO LA RESTA
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

  // MÉTODO PARA LIMPIAR LOS CAMPOS DEL FORMULARIO 
  LimpiarCampoHoras() {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

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
          id_empl_contrato: this.id_contrato_loggin,
          tipo_solicitud: 'Realización de Horas Extras solicitadas por',
          observacion: horaExtra.descripcion,
          solicitud: solicitud + ' ' + moment(horaExtra.fec_solicita).format('DD/MM/YYYY'),
          num_horas: moment(horaExtra.num_hora, 'HH:mm').format('HH:mm'),
          estado_h: estado_h,
          h_inicio: moment(horaExtra.fec_inicio).format('HH:mm'),
          h_final: moment(horaExtra.fec_final).format('HH:mm'),
          proceso: 'creado',
          asunto: 'SOLICITUD DE REALIZACION DE HORAS EXTRAS',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          desde: desde + ' ' + moment(horaExtra.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(horaExtra.fec_final).format('DD/MM/YYYY'),
          id: horaExtra.id,
          solicitado_por: this.empleados[0].nombre + ' ' + this.empleados[0].apellido
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

    var f = new Date();
    let notificacion = {
      id_send_empl: this.id_user_loggin,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
      id_permiso: null,
      id_vacaciones: null,
      id_hora_extra: horaExtra.id,
      mensaje: 'Ha realizado una solicitud de horas extras desde ' +
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

  IngresarAutorizacion(horaExtra: any) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACIÓN
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACIÓN 
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento')),
      id_permiso: null,
      id_vacacion: null,
      id_hora_extra: horaExtra.id,
      id_documento: '',
      id_plan_hora_extra: null,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    }, error => { })
  }

}
