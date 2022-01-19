import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';

@Component({
  selector: 'app-editar-vacaciones-empleado',
  templateUrl: './editar-vacaciones-empleado.component.html',
  styleUrls: ['./editar-vacaciones-empleado.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class EditarVacacionesEmpleadoComponent implements OnInit {

  calcular = false;
  habilitarCalculados: boolean = false;

  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  fechaIngreso = new FormControl('', Validators.required);
  dialibreF = new FormControl('', [Validators.required]);
  dialaborableF = new FormControl('', [Validators.required]);
  calcularF = new FormControl('');
  totalF = new FormControl('');
  diasTF = new FormControl('');

  public VacacionesForm = new FormGroup({
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    fechaIngresoForm: this.fechaIngreso,
    diaLibreForm: this.dialibreF,
    dialaborableForm: this.dialaborableF,
    calcularForm: this.calcularF,
    totalForm: this.totalF,
    diasTForm: this.diasTF
  });

  constructor(
    private restV: VacacionesService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarVacacionesEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public dato: any
  ) { }

  ngOnInit(): void {
    console.log(this.dato);
    this.VacacionesForm.patchValue({
      fecInicioForm: this.dato.fec_inicio,
      fecFinalForm: this.dato.fec_final,
      fechaIngresoForm: this.dato.fec_ingreso,
      diaLibreForm: this.dato.dia_libre,
      dialaborableForm: this.dato.dia_laborable,
      calcularForm: true
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
    let datosVacaciones = {
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      fec_ingreso: form.fechaIngresoForm,
      dia_libre: form.diaLibreForm + form.diasTForm,
      dia_laborable: form.dialaborableForm,
    };
    console.log(datosVacaciones);
    this.restV.EditarVacacion(this.dato.id, datosVacaciones).subscribe(response => {
      console.log(response);

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
    this.dialogRef.close(true);
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
