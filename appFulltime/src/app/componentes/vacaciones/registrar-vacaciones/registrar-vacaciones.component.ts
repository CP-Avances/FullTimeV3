import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-registrar-vacaciones',
  templateUrl: './registrar-vacaciones.component.html',
  styleUrls: ['./registrar-vacaciones.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class RegistrarVacacionesComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  empleados: any = [];
  calcular = false;
  FechaActual: any;

  nombreEmpleado = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  fechaIngreso = new FormControl('', Validators.required);
  dialibreF = new FormControl('', [Validators.required]);
  dialaborableF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  legalizadoF = new FormControl('', [Validators.required]);
  calcularF = new FormControl('');
  totalF = new FormControl('');
  diasTF = new FormControl('');

  public VacacionesForm = new FormGroup({
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    nombreEmpleadoForm: this.nombreEmpleado,
    fechaIngresoForm: this.fechaIngreso,
    diaLibreForm: this.dialibreF,
    dialaborableForm: this.dialaborableF,
    estadoForm: this.estadoF,
    legalizadoForm: this.legalizadoF,
    calcularForm: this.calcularF,
    totalForm: this.totalF,
    diasTForm: this.diasTF
  });

  constructor(
    private rest: EmpleadoService,
    private restV: VacacionesService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    public dialogRef: MatDialogRef<RegistrarVacacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    console.log(this.datoEmpleado);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');

    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.VacacionesForm.patchValue({
      estadoForm: 1
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
        let diasF = this.ContarDiasHabiles(fechaF, fechaF);
        console.log('total de fechas', diasF);
        if (diasF != 0) {
          diasFeriado = diasFeriado + 1;
        }
        else {
          diasL = diasL + 1;
        }
      }

      var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);

      var totalH = habil - diasFeriado;
      var totalL = libre - diasL;
      const totalDias = totalH + totalL + totalF;

      this.VacacionesForm.patchValue({
        diaLibreForm: totalL,
        dialaborableForm: totalH,
        totalForm: totalDias,
        diasTForm: totalF
      });

    }, error => {
      var habil = this.ContarDiasHabiles(form.fecInicioForm, form.fecFinalForm);
      var libre = this.ContarDiasLibres(form.fecInicioForm, form.fecFinalForm);
      const totalDias = habil + libre;
      this.VacacionesForm.patchValue({
        diaLibreForm: libre,
        dialaborableForm: habil,
        totalForm: totalDias,
        diasTForm: 0
      });
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

  /** Método para ver la información del empleado */
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.VacacionesForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
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

  responseVacacion: any = [];
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  InsertarVacaciones(form) {
    let datosVacaciones = {
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      fec_ingreso: form.fechaIngresoForm,
      estado: form.estadoForm,
      dia_libre: form.diaLibreForm + form.diasTForm,
      dia_laborable: form.dialaborableForm,
      legalizado: form.legalizadoForm,
      id_peri_vacacion: this.datoEmpleado.idPerVacacion,
      depa_user_loggin: parseInt(localStorage.getItem('departamento')),
      id_empl_cargo: this.datoEmpleado.idCargo,
      codigo: this.empleados[0].codigo
    };
    console.log(datosVacaciones);
    this.restV.RegistrarVacaciones(datosVacaciones).subscribe(response => {
      this.arrayNivelesDepa = response;
      console.log('respuesta', this.arrayNivelesDepa)
      this.arrayNivelesDepa.forEach(obj => {
        let dataVacacionCreada = {
          fec_inicio: datosVacaciones.fec_inicio,
          fec_final: datosVacaciones.fec_final,
          idContrato: this.datoEmpleado.idContrato,
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
          vaca_mail: obj.vaca_mail,
          vaca_noti: obj.vaca_noti
        }

        this.restV.SendMailNoti(dataVacacionCreada).subscribe(res => {
          console.log(response);
          this.responseVacacion = res
          var f = new Date();
          let notificacion = {
            id: null,
            id_send_empl: this.datoEmpleado.idEmpleado,
            id_receives_empl: this.responseVacacion.id_empleado_autoriza,
            id_receives_depa: this.responseVacacion.id_departamento_autoriza,
            estado: this.responseVacacion.estado,
            create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
            id_permiso: null,
            id_vacaciones: this.responseVacacion.id_vacacion,
            id_hora_extra: null,
          }
          this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
            console.log(resN);
            this.NotifiRes = resN;
            notificacion.id = this.NotifiRes._id;
            if (this.NotifiRes._id > 0 && this.responseVacacion.notificacion === true) {
              this.restV.sendNotiRealTime(notificacion);
            }
          });

        })

      });

      this.toastr.success('Operación Exitosa', 'Vacaciones del Empleado registradas', {
        timeOut: 6000,
      })
      this.CerrarVentanaRegistroVacaciones();
    }, error => {
      this.toastr.error('Operación Fallida', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.VacacionesForm.reset();
  }

  CerrarVentanaRegistroVacaciones() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
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

}
