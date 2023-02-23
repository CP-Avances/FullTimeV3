import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

const OPTIONS_HORARIOS = [
  { orden: 1, accion: 'E', view_option: 'Entrada' },
  { orden: 2, accion: 'S/A', view_option: 'Inicio alimentación' },
  { orden: 3, accion: 'E/A', view_option: 'Fin alimentación' },
  { orden: 4, accion: 'S', view_option: 'Salida' }
]

@Component({
  selector: 'app-editar-detalle-cat-horario',
  templateUrl: './editar-detalle-cat-horario.component.html',
  styleUrls: ['./editar-detalle-cat-horario.component.css']
})

export class EditarDetalleCatHorarioComponent implements OnInit {

  minEsperaF = new FormControl('');
  accionF = new FormControl('', [Validators.required]);
  ordenF = new FormControl(null, [Validators.required]);
  horaF = new FormControl('', [Validators.required]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    minEsperaForm: this.minEsperaF,
    accionForm: this.accionF,
    ordenForm: this.ordenF,
    horaForm: this.horaF,
  });

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  options = OPTIONS_HORARIOS;
  espera: boolean = false;

  constructor(
    public rest: DetalleCatHorariosService,
    public restH: HorarioService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarDetalleCatHorarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.CargarDatos();
    this.ListarDetalles(this.data.detalle.id_horario);
    this.BuscarDatosHorario(this.data.detalle.id_horario);
  }

  // METODO PARA MOSTRAR DATOS EN FORMULARIO
  CargarDatos() {
    const [obj] = this.options.filter(o => {
      return o.orden === this.data.detalle.orden
    })
    this.formulario.patchValue({
      ordenForm: obj.orden,
      accionForm: obj.accion,
      horaForm: this.data.detalle.hora,
      minEsperaForm: this.data.detalle.minu_espera,
    })
    if (obj.orden === 1) {
      this.espera = true;
    }
  }

  // METODO PARA VALIDAR TIPO DE ACCIONES
  AutoSelectOrden(orden: number) {
    this.formulario.patchValue({
      ordenForm: orden
    })
    if (orden === 1) {
      this.espera = true;
    }
    else {
      this.espera = false;
    }
  }

  // VALIDAR INGRESO DE MINUTOS DE ESPERA
  ValidarMinEspera(form: any, datos: any) {
    if (form.minEsperaForm === '') {
      datos.minu_espera = 0;
    }
  }

  // METODO PARA REALIZAR REGISTRO DE DETALLES DE HORARIO
  InsertarDetalleHorario(form: any) {
    let detalle = {
      minu_espera: form.minEsperaForm,
      tipo_accion: form.accionForm,
      id_horario: this.data.detalle.id_horario,
      orden: form.ordenForm,
      hora: form.horaForm,
      id: this.data.detalle.id
    };
    this.ValidarMinEspera(form, detalle);
    if (this.datosHorario[0].min_almuerzo === 0) {
      this.ValidarDetallesSinAlimentacion(detalle);
    }
    else {
      this.ValidarDetallesConAlimentacion(detalle);
    }
  }

  // METODO PARA ACTUALIZAR HORARIO
  EditarHorario() {
    let horasT = this.data.horario.hora_trabajo.split(':')[0] + ':' + this.data.horario.hora_trabajo.split(':')[1];
    this.restH.ActualizarHorasTrabaja(this.data.horario.id, { hora_trabajo: horasT }).subscribe(res => {
    }, err => {
      this.toastr.error(err.message)
    })
  }

  // VALIDAR DETALLES CON ALIMENTACION
  ValidarDetallesConAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, e_comida1: number = 0, e_comida2: number = 0,
      e_comida3: number = 0, s_comida1: number = 0, s_comida2: number = 0, s_comida3: number = 0;
    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map(obj => {
        // VALIDAR ORDEN DE LOS DETALLES
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

        // VALIDAR INGRESO DE HORAS DE DETALLES
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning(
            'Hora en detalle de Entrada no puede ser superior a las horas ya registradas.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida1 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser menor a la hora configurada como Entrada.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida2 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser superior a la hora configurada como Fin de alimentación.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (s_comida3 != 0) return this.toastr.warning(
            'Hora en detalle de Inicio alimentación no puede ser superior a la hora configurada como Salida.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida1 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser menor a la hora configurada como Entrada.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida2 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser menor a la hora configurada como Inicio alimentación.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (e_comida3 != 0) return this.toastr.warning(
            'Hora en detalle de Fin alimentación no puede ser superior a la hora configurada como Salida.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning(
            'Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    // NO EXISTEN REGISTROS DE DETALLES
    else {
      this.GuardarRegistro(datos);
    }
  }

  // VALIDAR DETALLES SIN ALIMENTACION
  ValidarDetallesSinAlimentacion(datos: any) {
    var contador: number = 0;
    var entrada: number = 0, salida: number = 0, comida: number = 0;
    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map(obj => {
        // VALIDAR INGRESO DE HORAS DE DETALLES
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
        if (contador === this.datosDetalle.length) {
          if (entrada != 0) return this.toastr.warning(
            'Hora en detalle de Entrada no puede ser superior a las horas ya registradas.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (salida != 0) return this.toastr.warning(
            'Hora en detalle de Salida no puede ser menor a las horas ya registradas en el detalle.',
            'Verificar datos de horario.', {
            timeOut: 6000
          });
          if (comida != 0) return this.toastr.warning(
            'No es posible registrar detalle de alimentación.',
            'Horario no tiene configurado minutos de alimentación.', {
            timeOut: 6000
          });
          this.GuardarRegistro(datos);
        }
      })
    }
    // NO EXISTEN REGISTROS
    else {
      this.GuardarRegistro(datos);
    }
  }

  // CONSULTAR DETALLES DE HORRAIO
  datosDetalle: any = [];
  ListarDetalles(id_horario: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // METODO PARA BUSCAR DATOS DE HORARIO
  datosHorario: any = [];
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.restH.BuscarUnHorario(id_horario).subscribe(data => {
      this.datosHorario = data;
    })
  }

  // METODO PARA ACTUALIZAR REGISTRO
  GuardarRegistro(datos: any) {
    this.habilitarprogress = true;
    this.rest.ActualizarRegistro(datos).subscribe(response => {
      this.habilitarprogress = false;
      this.toastr.success('Operación Exitosa', 'Detalle de Horario registrado', {
        timeOut: 6000,
      })
      this.EditarHorario();
      this.CerrarVentana();
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

  // METODO PARA LIMPIAR FORMULARIO   
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
