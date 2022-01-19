import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, ThemePalette } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-editar-feriados',
  templateUrl: './editar-feriados.component.html',
  styleUrls: ['./editar-feriados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class EditarFeriadosComponent implements OnInit {

  idFeriado: number;
  // Control de campos y validaciones del formulario
  fechaF = new FormControl('', Validators.required);
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaRecuperacionF = new FormControl('');

  // Asignación de validaciones a inputs del formulario
  public EditarFeriadosForm = new FormGroup({
    fechaForm: this.fechaF,
    descripcionForm: this.descripcionF,
    fechaRecuperacionForm: this.fechaRecuperacionF
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;
  
  constructor(
    private rest: FeriadosService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<EditarFeriadosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {

    this.ImprimirDatos();
  }

  feriados: any = [];
  contador: number = 0;
  ActualizarFeriados(form) {
    this.habilitarprogress = true;
    this.feriados = [];
    this.contador = 0;
    let datosFeriado = {
      id: this.data.datosFeriado.id,
      fecha: form.fechaForm,
      descripcion: form.descripcionForm,
      fec_recuperacion: form.fechaRecuperacionForm
    };
    if (datosFeriado.fec_recuperacion === '' || datosFeriado.fec_recuperacion === null) {
      datosFeriado.fec_recuperacion = null;
      this.rest.ConsultarFeriadoActualiza(this.data.datosFeriado.id).subscribe(response => {
        this.feriados = response;
        this.habilitarprogress = false;
        this.feriados.forEach(obj => {
          if (moment(obj.fec_recuperacion).format('YYYY-MM-DD') === moment(datosFeriado.fecha).format('YYYY-MM-DD')) {
            this.contador = this.contador + 1;
          }
        })
        if (this.contador === 0) {
          this.RegistrarFeriado(datosFeriado);
        }
        else {
          this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación.', 'Verificar fecha de recuperación', {
            timeOut: 6000,
          })
        }
      })
    }
    else {
      this.rest.ConsultarFeriadoActualiza(this.data.datosFeriado.id).subscribe(response => {
        this.habilitarprogress = false;
        this.feriados = response;
        this.feriados.forEach(obj => {
          if (obj.fecha.split('T')[0] === moment(datosFeriado.fec_recuperacion).format('YYYY-MM-DD') ||
            moment(obj.fec_recuperacion).format('YYYY-MM-DD') === moment(datosFeriado.fecha).format('YYYY-MM-DD')) {
            this.contador = this.contador + 1;
          }
        })
        if (this.contador === 0) {
          if (Date.parse(form.fechaForm) < Date.parse(datosFeriado.fec_recuperacion)) {
            this.RegistrarFeriado(datosFeriado);
          }
          else {
            this.toastr.error('La fecha de recuperación debe ser posterior a la fecha del feriado registrado.', 'Fecha de recuperación incorrecta', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.toastr.error('La fecha de recuperación se encuentra registrada como un feriado.', 'Verificar fecha de recuperación', {
            timeOut: 6000,
          })
        }
      })
    }
  }

  RegistrarFeriado(datos) {
    this.habilitarprogress = true;
    this.rest.ActualizarUnFeriado(datos).subscribe(response => {
      if (response.message === 'error') {
        this.toastr.error('La fecha del feriado o la fecha de recuperación se encuentran dentro de otro registro.', 'Verificar las fechas', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success('Operación Exitosa', 'Feriado Actualizado', {
          timeOut: 6000,
        })
        this.LimpiarCampos();
        this.dialogRef.close();
        this.habilitarprogress = false;
        if (this.data.actualizar === true) {
          window.location.reload();
        } else {
          this.router.navigate(['/verFeriados/', datos.id]);
        }
      }
    });
  }

  ObtenerMensajeErrorNombreRequerido() {
    if (this.descripcionF.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.descripcionF.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  LimpiarCampos() {
    this.EditarFeriadosForm.reset();
  }

  CerrarVentanaEditarFeriado() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  ImprimirDatos() {
    if (this.data.datosFeriado.fec_recuperacion === null || this.data.datosFeriado.fec_recuperacion === '') {
      this.EditarFeriadosForm.patchValue({
        fechaRecuperacionForm: null
      })
    }
    this.EditarFeriadosForm.setValue({
      descripcionForm: this.data.datosFeriado.descripcion,
      fechaForm: this.data.datosFeriado.fecha,
      fechaRecuperacionForm: this.data.datosFeriado.fec_recuperacion
    })
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
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

}
