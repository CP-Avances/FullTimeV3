// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';

@Component({
  selector: 'app-registrar-feriados',
  templateUrl: './registrar-feriados.component.html',
  styleUrls: ['./registrar-feriados.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistrarFeriadosComponent implements OnInit {

  // VARIABLE DE ALMACENAMIENTO DE REGISTROS
  idUltimoFeriado: any = [];
  salir: boolean = false;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaF = new FormControl('', Validators.required);
  fechaRecuperacionF = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public FeriadosForm = new FormGroup({
    fechaRecuperacionForm: this.fechaRecuperacionF,
    descripcionForm: this.descripcionF,
    fechaForm: this.fechaF,
  });

  // VARIABLES PROGRESS SPINNER
  mode: ProgressSpinnerMode = 'indeterminate';
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public ventana: MatDialogRef<RegistrarFeriadosComponent>,
    private rest: FeriadosService,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  feriados: any = [];
  contador: number = 0;
  InsertarFeriado(form) {
    this.habilitarprogress = true;
    this.feriados = [];
    this.contador = 0;
    let datosFeriado = {
      fecha: form.fechaForm,
      descripcion: form.descripcionForm,
      fec_recuperacion: form.fechaRecuperacionForm
    };
    if (datosFeriado.fec_recuperacion === '' || datosFeriado.fec_recuperacion === null) {
      datosFeriado.fec_recuperacion = null;
      this.rest.ConsultarFeriado().subscribe(response => {
        this.habilitarprogress = false;
        this.feriados = response;
        this.feriados.forEach(obj => {
          if (moment(obj.fec_recuperacion).format('YYYY-MM-DD') === moment(datosFeriado.fecha).format('YYYY-MM-DD')) {
            this.contador = this.contador + 1;
          }
        })
        if (this.contador === 0) {
          this.CrearFeriado(datosFeriado);
        }
        else {
          this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación.', 'Verificar fecha de recuperación', {
            timeOut: 6000,
          })
        }
      }, vacio => {
        this.CrearFeriado(datosFeriado);
      })
    }
    else {
      this.rest.ConsultarFeriado().subscribe(response => {
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
            this.CrearFeriado(datosFeriado);
          }
          else {
            this.toastr.error('La fecha de recuperación debe ser posterior a la fecha del feriado registrado.', 'Fecha de recuperación incorrecta', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.toastr.error('La fecha asignada para feriado ya se encuentra registrada como una fecha de recuperación o la fecha de recuperación ya se encuentra registrada como un feriado', 'Verificar fecha de recuperación', {
            timeOut: 6000,
          })
        }
      }, vacio => {
        this.CrearFeriado(datosFeriado);
      })
    }
  }

  CrearFeriado(datos) {
    this.habilitarprogress = true;
    this.rest.CrearNuevoFeriado(datos).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('La fecha del feriado o la fecha de recuperación se encuentran dentro de otro registro.', 'Verificar las fechas', {
          timeOut: 6000,
        })
      }
      else {
        this.toastr.success('Operación Exitosa', 'Feriado registrado', {
          timeOut: 6000,
        })
        this.habilitarprogress = true;
        this.rest.ConsultarUltimoId().subscribe(response => {
          this.habilitarprogress = false;
          this.idUltimoFeriado = response;
          this.LimpiarCampos();
          this.salir = true;
          this.ventana.close(this.salir)
          this.router.navigate(['/verFeriados/', this.idUltimoFeriado[0].max]);
        });
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
    this.FeriadosForm.reset();
  }

  CerrarVentanaRegistroFeriado() {
    this.LimpiarCampos();
    this.ventana.close(this.salir);
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
