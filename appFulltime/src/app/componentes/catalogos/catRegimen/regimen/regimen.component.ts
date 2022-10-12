import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';

@Component({
  selector: 'app-regimen',
  templateUrl: './regimen.component.html',
  styleUrls: ['./regimen.component.css'],
})

export class RegimenComponent implements OnInit {

  HabilitarDescrip: boolean = true;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreF = new FormControl('');
  mesesF = new FormControl('', [Validators.required]);
  totalMesF = new FormControl('', [Validators.required]);
  totalPeriodoF = new FormControl('', [Validators.required]);
  diasAcumulacionF = new FormControl('', [Validators.required]);
  aniosAntiguedadF = new FormControl('', [Validators.required]);
  diasAdicionalesF = new FormControl('', [Validators.required]);
  diasLaborablesF = new FormControl('', [Validators.required]);
  diasLibresF = new FormControl('', [Validators.required]);
  diasCalendarioF = new FormControl('', [Validators.required]);
  diasMesLaborableF = new FormControl('', [Validators.required]);
  diasMesCalendarioF = new FormControl('', [Validators.required]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreForm: this.nombreF,
    mesesForm: this.mesesF,
    totalMesForm: this.totalMesF,
    totalPeriodoForm: this.totalPeriodoF,
    diasAcumulacionForm: this.diasAcumulacionF,
    aniosAntiguedadForm: this.aniosAntiguedadF,
    diasAdicionalesForm: this.diasAdicionalesF,
    diasLaborablesForm: this.diasLaborablesF,
    diasLibresForm: this.diasLibresF,
    diasCalendarioForm: this.diasCalendarioF,
    diasMesLaborableForm: this.diasMesLaborableF,
    diasMesCalendarioForm: this.diasMesCalendarioF,
  });

  constructor(
    private rest: RegimenService,
    private toastr: ToastrService,
    public router: Router,
  ) { }

  ngOnInit(): void {
  }

  InsertarRegimen(form: any) {
    let datosRegimen = {
      descripcion: form.nombreForm,
      meses_periodo: form.mesesForm,
      dias_per_vacacion_laboral: form.diasLaborablesForm,
      dias_per_vacacion_calendario: form.diasCalendarioForm,
      dias_mes_vacacion_laboral: form.diasMesLaborableForm,
      dias_mes_vacacion_calendario: form.diasMesCalendarioForm,
      dias_libre_vacacion: form.diasLibresForm,
      anio_antiguedad: form.aniosAntiguedadForm,
      dia_incr_antiguedad: form.diasAdicionalesForm,
      max_dia_acumulacion: form.diasAcumulacionForm,
      dias_totales_mes: form.totalPeriodoForm,
      dias_totales_anio: form.totalMesForm,
    };

    this.VerificarValoresMenores(datosRegimen);


  }

  ImprimirValores() {
    this.formulario.patchValue({

    })
  }

  VerificarValoresMenores(datos) {
    var diasAnio = datos.dia_anio_vacacion;
    var diasLibres = datos.dia_libr_anio_vacacion;
    var diasIncremento = datos.dia_incr_antiguedad;
    var diasAcumulados = datos.max_dia_acumulacion;
    var meses = datos.meses_periodo;
    if (parseInt(diasAnio) > parseInt(diasAcumulados)) {
      this.toastr.info('Días máximos acumulados deben ser mayores a los días de vacación por año', '', {
        timeOut: 6000,
      })
    }
    else if (parseInt(diasLibres) > parseInt(diasAnio)) {
      this.toastr.info('Días libres de vacaciones deben ser menores a los días de vacación por año', '', {
        timeOut: 6000,
      })
    }
    else if (parseInt(diasIncremento) > parseInt(diasAnio)) {
      this.toastr.info('Días de incremento por antiguedad deben ser menores a los días de vacación por año', '', {
        timeOut: 6000,
      })
    }
    else if (parseInt(meses) > 0 && parseInt(meses) <= 12) {
      this.FuncionInsertarDatos(datos);
    }
    else {
      this.toastr.info('Meses de duración del período debe ser mayor a 0 y menor o igual a 12 meses.', '', {
        timeOut: 6000,
      })
    }
  }

  CalcularDiasMeses(form: any) {
    var diasAnio = form.diaAnioVacacionForm;
    if (diasAnio === '') {
      this.toastr.info('No ha ingresado días por año', '', {
        timeOut: 6000,
      });
      (<HTMLInputElement>document.getElementById('activo')).checked = false;
    }
    else {
      var diasMes = (parseInt(diasAnio) / 12).toFixed(6);
      this.formulario.patchValue({
        diaMesVacacionForm: diasMes,
      });
    }

  }

  FuncionInsertarDatos(datos) {
    this.rest.CrearNuevoRegimen(datos).subscribe(response => {
      if (response.message === 'error') {
        this.toastr.error('Revisarlo en la lista y actualizar los datos si desea realizar cambios en la configuración del Régimen Laboral', 'Régimen Laboral ya esta configurado', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación Exitosa', 'Régimen Laboral guardado', {
          timeOut: 6000,
        });
        this.LimpiarCampos();
      }
    }, error => {
      this.toastr.error('Operación Fallida', 'Régimen Laboral no se guardó', {
        timeOut: 6000,
      })
    });
  }


  LimpiarCampos() {
    this.formulario.reset();
  }



  LimpiarDiasMeses() {
    this.formulario.patchValue({
      diaMesVacacionForm: '',
      descripcionForm: '',
    });
  }

  LimpiarMeses() {
    this.formulario.patchValue({
      diaMesVacacionForm: '',
    });
  }


  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    //this.LimpiarCampos();
    //this.ventana.close();
    this.router.navigate(['/listarRegimen']);
  }

}
