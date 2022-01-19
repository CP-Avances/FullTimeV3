import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';

@Component({
  selector: 'app-editar-regimen',
  templateUrl: './editar-regimen.component.html',
  styleUrls: ['./editar-regimen.component.css']
})
export class EditarRegimenComponent implements OnInit {

  // Control de campos y validaciones del formulario
  descripcionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  diaAnioVacacionF = new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]);
  diaIncrAntiguedadF = new FormControl('', [Validators.required]);
  anioAntiguedadF = new FormControl('', [Validators.required]);
  diaMesVacacionF = new FormControl('', [Validators.required]);
  maxDiasAcumulacionF = new FormControl('', [Validators.required]);
  diaLibreAnioVacacionF = new FormControl('');
  mesesF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public RegimenForm = new FormGroup({
    diaMesVacacionForm: this.diaMesVacacionF,
    descripcionForm: this.descripcionF,
    diaAnioVacacionForm: this.diaAnioVacacionF,
    diaIncrAntiguedadForm: this.diaIncrAntiguedadF,
    anioAntiguedadForm: this.anioAntiguedadF,
    maxDiasAcumulacionForm: this.maxDiasAcumulacionF,
    diaLibreAnioVacacionForm: this.diaLibreAnioVacacionF,
    mesesForm: this.mesesF
  });

  constructor(
    private rest: RegimenService,
    private toastr: ToastrService,
    public router: Router,
    public dialogRef: MatDialogRef<EditarRegimenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  ImprimirDatos() {
    this.RegimenForm.patchValue({
      diaMesVacacionForm: this.data.datosRegimen.dia_mes_vacacion,
      descripcionForm: this.data.datosRegimen.descripcion,
      diaAnioVacacionForm: this.data.datosRegimen.dia_anio_vacacion,
      diaIncrAntiguedadForm: this.data.datosRegimen.dia_incr_antiguedad,
      anioAntiguedadForm: this.data.datosRegimen.anio_antiguedad,
      maxDiasAcumulacionForm: this.data.datosRegimen.max_dia_acumulacion,
      diaLibreAnioVacacionForm: this.data.datosRegimen.dia_libr_anio_vacacion,
      mesesForm: this.data.datosRegimen.meses_periodo
    });
    (<HTMLInputElement>document.getElementById('activo')).checked = true;
  }

  InsertarRegimen(form) {
    var escribirRegimen = form.descripcionForm;
    let datosRegimen = {
      id: this.data.datosRegimen.id,
      descripcion: escribirRegimen,
      dia_anio_vacacion: form.diaAnioVacacionForm,
      dia_incr_antiguedad: form.diaIncrAntiguedadForm,
      anio_antiguedad: form.anioAntiguedadForm,
      dia_mes_vacacion: form.diaMesVacacionForm,
      max_dia_acumulacion: form.maxDiasAcumulacionForm,
      dia_libr_anio_vacacion: form.diaLibreAnioVacacionForm,
      meses_periodo: form.mesesForm
    };
    if (escribirRegimen === '') {
      this.toastr.info('Ingresar nombre del Régimen Laboral', 'Campo Obligatorio', {
        timeOut: 6000,
      });
    }
    else {
      datosRegimen.descripcion = escribirRegimen;
      this.CambiarValores(datosRegimen);
      this.VerificarValoresMenores(datosRegimen);
    }
  }

  CambiarValores(datos) {
    if (datos.dia_libr_anio_vacacion === '') {
      datos.dia_libr_anio_vacacion = 0;
    }
  }

  VerificarValoresMenores(datos) {
    var diasAnio = datos.dia_anio_vacacion;
    var diasLibres = datos.dia_libr_anio_vacacion;
    var diasIncremento = datos.dia_incr_antiguedad;
    var diasAcumulados = datos.max_dia_acumulacion;
    var meses = datos.meses_periodo;
    if (parseInt(diasAnio) > parseInt(diasAcumulados)) {
      this.toastr.info('Días máximos acumulados deben ser mayores a los días de vacación por año','', {
        timeOut: 6000,
      })
    }
    else if (parseInt(diasLibres) > parseInt(diasAnio)) {
      this.toastr.info('Días libres de vacaciones deben ser menores a los días de vacación por año','', {
        timeOut: 6000,
      })
    }
    else if (parseInt(diasIncremento) > parseInt(diasAnio)) {
      this.toastr.info('Días de incremento por antiguedad deben ser menores a los días de vacación por año','', {
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

  CalcularDiasMeses(form) {
    if ((<HTMLInputElement>document.getElementById('activo')).checked) {
      var diasAnio = form.diaAnioVacacionForm;
      if (diasAnio === '') {
        this.toastr.info('No ha ingresado días por año','', {
          timeOut: 6000,
        });
        (<HTMLInputElement>document.getElementById('activo')).checked = false;
      }
      else {
        var diasMes = (parseInt(diasAnio) / 12).toFixed(6);
        this.RegimenForm.patchValue({
          diaMesVacacionForm: diasMes,
        });
      }
    }
    else {
      this.LimpiarMeses();
    }
  }

  FuncionInsertarDatos(datos) {
    this.rest.ActualizarRegimen(datos).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Régimen Laboral guardado', {
        timeOut: 6000,
      })
      this.CerrarVentanaRegistroRegimen();
      if (this.data.actualizar === true) {
        window.location.reload();
      } else {
        this.router.navigate(['/verRegimen/', this.data.datosRegimen.id]);
      }
    }, error => {
      this.toastr.error('Operación Fallida', 'Régimen Laboral no se guardó', {
        timeOut: 6000,
      })
    });
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

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6];
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

  ObtenerMensajeErrorNombreRequerido() {
    if (this.descripcionF.hasError('pattern')) {
      return 'Ingresar un nombre válido';
    }
  }

  ObtenerMensajeErrorCamposNumericosRequeridos() {
    if (this.diaAnioVacacionF.hasError('required')) {
      return 'Campo obligatorio ingrese un valor';
    }
  }

  ObtenerMensajeErrorDiasAcumulablesRequerido() {
    if (this.maxDiasAcumulacionF.hasError('required')) {
      return 'Campo obligatorio ingrese un valor';
    }
  }

  ObtenerMensajeErrorAnioAntiguedadRequerido() {
    if (this.anioAntiguedadF.hasError('required')) {
      return 'Campo obligatorio ingrese un valor';
    }
  }

  ObtenerMensajeErrorIncreAntiguedadRequerido() {
    if (this.diaIncrAntiguedadF.hasError('required')) {
      return 'Campo obligatorio ingrese un valor';
    }
  }

  ObtenerMensajeErrorMeses() {
    if (this.mesesF.hasError('required')) {
      return 'Campo obligatorio ingrese un valor';
    }
  }

  LimpiarCampos() {
    this.RegimenForm.reset();
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
  }

  CerrarVentanaRegistroRegimen() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

  LimpiarDiasMeses() {
    this.RegimenForm.patchValue({
      diaMesVacacionForm: '',
      descripcionForm: '',
    });
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
  }

  LimpiarMeses() {
    this.RegimenForm.patchValue({
      diaMesVacacionForm: '',
    });
    (<HTMLInputElement>document.getElementById('activo')).checked = false;
  }

}
