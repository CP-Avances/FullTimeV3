import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

const OPTIONS_HORARIOS = [
  { orden: 1, accion: 'E', view_option: 'Entrada' },
  { orden: 2, accion: 'S/A', view_option: 'Inicio Alimentación' },
  { orden: 3, accion: 'E/A', view_option: 'Fin Alimentación' },
  { orden: 4, accion: 'S', view_option: 'Salida' }
]

@Component({
  selector: 'app-editar-detalle-cat-horario',
  templateUrl: './editar-detalle-cat-horario.component.html',
  styleUrls: ['./editar-detalle-cat-horario.component.css']
})
export class EditarDetalleCatHorarioComponent implements OnInit {

  ordenF = new FormControl('', [Validators.required]);
  accionF = new FormControl('', [Validators.required]);
  horaF = new FormControl('', [Validators.required]);
  minEsperaF = new FormControl('');

  // Asignación de validaciones a inputs del formulario
  public DetalleHorarioForm = new FormGroup({
    ordenForm: this.ordenF,
    accionForm: this.accionF,
    horaForm: this.horaF,
    minEsperaForm: this.minEsperaF,
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  options = OPTIONS_HORARIOS;

  espera: boolean = false;

  constructor(
    public rest: DetalleCatHorariosService,
    public restH: HorarioService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarDetalleCatHorarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.CargarDatos();
    this.ListarDetalles(this.data.detalle.id_horario);
    this.BuscarDatosHorario(this.data.detalle.id_horario);
  }

  AutoSelectOrden(orden: number) {
    this.DetalleHorarioForm.patchValue({
      ordenForm: orden
    })
    if (orden === 1) {
      this.espera = true;
    }
    else {
      this.espera = false;
    }
  }

  ValidarMinEspera(form, datos) {
    if (form.minEsperaForm === '') {
      datos.minu_espera = 0;
    }
  }

  InsertarDetalleHorario(form) {
    let datosDetalleH = {
      orden: form.ordenForm,
      hora: form.horaForm,
      minu_espera: form.minEsperaForm,
      id_horario: this.data.detalle.id_horario,
      tipo_accion: form.accionForm,
      id: this.data.detalle.id
    };
    console.log(datosDetalleH);
    this.ValidarMinEspera(form, datosDetalleH);
    console.log(datosDetalleH);
    if (this.datosHorario[0].min_almuerzo === 0) {
      this.ValidarDetallesSinAlimentacion(datosDetalleH);
    }
    else {
      this.ValidarDetallesConAlimentacion(datosDetalleH);
    }
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

  LimpiarCampos() {
    this.DetalleHorarioForm.reset();
  }

  CerrarVentanaDetalleHorario() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  CargarDatos() {

    const [obj] = this.options.filter(o => {
      return o.orden === this.data.detalle.orden
    })
    // console.log('Datos',obj);
    this.DetalleHorarioForm.patchValue({
      ordenForm: obj.orden,
      accionForm: obj.accion,
      horaForm: this.data.detalle.hora,
      minEsperaForm: this.data.detalle.minu_espera,
    })
    if (obj.orden === 1) {
      this.espera = true;
    }
  }

  EditarHorario() {
    let horasT = this.data.horario.hora_trabajo.split(':')[0] + ':' + this.data.horario.hora_trabajo.split(':')[1];
    this.restH.updateHorasTrabajaByDetalleHorario(this.data.horario.id, { hora_trabajo: horasT }).subscribe(res => {
    }, err => {
      console.log(err);
      this.toastr.error(err.message)
    })
  }

  ValidarDetallesConAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, e_comida1: number = 0, e_comida2: number = 0, e_comida3: number = 0, s_comida1: number = 0, s_comida2: number = 0, s_comida3: number = 0;;
    if (this.datosDetalle.length != 0) {
      this.datosDetalle.map(obj => {
        contador = contador + 1;
        if (datos.orden === 1 && obj.orden != 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida1 = s_comida1 + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 3 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida2 = s_comida2 + 1;
        }
        if (datos.orden === 2 && obj.orden != 2 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida3 = s_comida3 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida1 = e_comida1 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 2 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida2 = e_comida2 + 1;
        }
        if (datos.orden === 3 && obj.orden != 3 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida3 = e_comida3 + 1;
        }
        if (datos.orden === 4 && obj.orden != 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        console.log('datos contador', contador, ' datos array ', this.datosDetalle.length)
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning('Hora en detalle de Entrada no puede ser superior a las horas ya registradas.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida1 != 0) return this.toastr.warning('Hora en detalle de Inicio Alimentación no puede ser menor a la hora configurada como Entrada.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida2 != 0) return this.toastr.warning('Hora en detalle de Inicio Alimentación no puede ser superior a la hora configurada como Fin de Alimentación.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida3 != 0) return this.toastr.warning('Hora en detalle de Inicio Alimentación no puede ser superior a la hora configurada como Salida.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida1 != 0) return this.toastr.warning('Hora en detalle de Fin Alimentación no puede ser menor a la hora configurada como Entrada.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida2 != 0) return this.toastr.warning('Hora en detalle de Fin Alimentación no puede ser menor a la hora configurada como Inicio Alimentación.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida3 != 0) return this.toastr.warning('Hora en detalle de Fin Alimentación no puede ser superior a la hora configurada como Salida.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning('Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    else {
      this.GuardarRegistro(datos);
    }
  }


  ValidarDetallesSinAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, comida: number = 0;
    if (this.datosDetalle.length != 0) {
      this.datosDetalle.map(obj => {
        contador = contador + 1;
        if (datos.orden === 1 && obj.orden != 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 4 && obj.orden != 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }
        if (datos.orden === 2 || datos.orden === 3) {
          comida = comida + 1;
        }
        console.log('datos contador', contador, ' datos array ', this.datosDetalle.length)
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning('Hora en detalle de Entrada no puede ser superior a las horas ya registradas.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning('Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.', 'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (comida != 0) return this.toastr.warning('No es posible registrar detalle de alimentación.', 'Horario no tiene configurado minutos de alimentación.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    else {
      this.GuardarRegistro(datos);
    }
  }

  datosDetalle: any = [];
  ListarDetalles(id_horario: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  datosHorario: any = [];
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.restH.getOneHorarioRest(id_horario).subscribe(data => {
      this.datosHorario = data;
    })
  }

  GuardarRegistro(datos) {
    this.habilitarprogress = true;
    this.rest.ActualizarRegistro(datos).subscribe(response => {
      this.habilitarprogress = false;
      this.toastr.success('Operación Exitosa', 'Detalle de Horario registrado', {
        timeOut: 6000,
      })
      this.EditarHorario();
      this.CerrarVentanaDetalleHorario();
    }, error => {
    });
  }


}
