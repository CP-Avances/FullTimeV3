import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MatDialogRef } from '@angular/material/dialog';
// import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
// import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';

// Interface que permite definir los datos de estado de la solicitu de horas extras
interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-pedido-hora-extra',
  templateUrl: './pedido-hora-extra.component.html',
  styleUrls: ['./pedido-hora-extra.component.css'],
  // providers: [
  //   { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  //   { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  //   { provide: MAT_DATE_LOCALE, useValue: 'es' },
  //   { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  // ]
})

export class PedidoHoraExtraComponent implements OnInit {

  // Tipos de estados que tiene una solicitud de horas extras
  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // Control de campos y validaciones del formulario
  fechaSolicitudF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  FechaFinF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  horaFinF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  funcionF = new FormControl('', [Validators.required]);

  // Variables del formulario donde se registra los datos ingresados
  public PedirHoraExtraForm = new FormGroup({
    fechaSolicitudForm: this.fechaSolicitudF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    FechaFinForm: this.FechaFinF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF,
    horasForm: this.horasF,
    estadoForm: this.estadoF,
    funcionForm: this.funcionF
  });

  // Datos del empleado
  FechaActual: any;
  id_user_loggin: number;
  id_cargo_loggin: number;

  constructor(
    private rest: TipoPermisosService,
    private restE: EmpleadoService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private validacionesService: ValidacionesService,
    public dialogRef: MatDialogRef<PedidoHoraExtraComponent>,
  ) { }

  ngOnInit(): void {
    // Obtener la fecha actual
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.PedirHoraExtraForm.patchValue({
      fechaSolicitudForm: this.FechaActual,
      estadoForm: 1
    });
    // Variables del empleado que solicita
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));
    // Obtner el horario del empleado
    this.HorarioEmpleadoSemanal(this.id_cargo_loggin);
    // Obtener los datos generales del empleado
    this.ObtenerEmpleados(this.id_user_loggin);
  }

  /** Método para ver la información del empleado */
  empleados: any = [];
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
    })
  }

  /** Método para obtener el horario del empleado */
  Horario: any
  HorarioEmpleadoSemanal(id_cargo: number) {
    this.restHE.HorarioEmpleadoSemanal(id_cargo).subscribe(res => {
      this.Horario = res;
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
  }

  /** Método para validar la fecha de la solicitud con el horario del empleado */
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

  /** Método para registrar los datos del pedido de hora extra */
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
      tipo_funcion: form1.funcionForm,
      depa_user_loggin: parseInt(localStorage.getItem('departamento')),
      codigo: this.empleados[0].codigo
    }
    this.restHE.GuardarHoraExtra(dataPedirHoraExtra).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Hora extra solicitada', {
        timeOut: 6000,
      });
      this.dialogRef.close()
      this.arrayNivelesDepa = response;
      console.log(this.arrayNivelesDepa);
      this.arrayNivelesDepa.forEach(obj => {

        let datosHoraExtraCreada = {
          id_empl_cargo: dataPedirHoraExtra.id_empl_cargo,
          id_usua_solicita: dataPedirHoraExtra.id_usua_solicita,
          fec_inicio: dataPedirHoraExtra.fec_inicio,
          fec_final: dataPedirHoraExtra.fec_final,
          fec_solicita: dataPedirHoraExtra.fec_solicita,
          id: obj.id,
          estado: obj.estado,
          id_dep: obj.id_dep,
          depa_padre: obj.depa_padre,
          nivel: obj.nivel,
          id_suc: obj.id_suc,
          departamento: obj.departamento,
          sucursal: obj.sucursal,
          cargo: obj.cargo,
          contrato: obj.contrato,
          empleado: obj.empleado,
          nombre: obj.nombre,
          apellido: obj.apellido,
          cedula: obj.cedula,
          correo: obj.correo,
          hora_extra_mail: obj.hora_extra_mail,
          hora_extra_noti: obj.hora_extra_noti
        }
        this.restHE.SendMailNoti(datosHoraExtraCreada).subscribe(res => {
          this.HoraExtraResponse = res;
          console.log(this.HoraExtraResponse);
          var f = new Date();
          let notificacion = {
            id: null,
            id_send_empl: this.id_user_loggin,
            id_receives_empl: this.HoraExtraResponse.id_empleado_autoriza,
            id_receives_depa: this.HoraExtraResponse.id_departamento_autoriza,
            estado: this.HoraExtraResponse.estado,
            create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
            id_permiso: null,
            id_vacaciones: null,
            id_hora_extra: this.HoraExtraResponse.id
          }
          this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
            console.log(resN);
            this.NotifiRes = resN;
            notificacion.id = this.NotifiRes._id;
            if (this.NotifiRes._id > 0 && this.HoraExtraResponse.notificacion === true) {
              this.restHE.sendNotiRealTime(notificacion);
            }
          });
        }, err => {
          const { access, message } = err.error.message;
          if (message) return this.toastr.error(message)
          if (access === false) {
            this.dialogRef.close();
          }
        })
      });
    }, err => {
      const { access, message } = err.error.message;
      if (message) return this.toastr.error(message)
      if (access === false) {
        this.dialogRef.close();
      }
    });
  }

  /** Método para validar el ingreso de letras */
  IngresarSoloLetras(e) {
    return this.validacionesService.IngresarSoloLetras(e)
  }

  /** Método para validar el ingreso de números */
  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt)
  }

  /** Método para calcular el número de horas solicitadas  */
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

  /** Método para limpiar los campos del formulario */
  LimpiarCampoHoras() {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

}
