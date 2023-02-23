import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

const OPTIONS_HORARIOS = [
  { orden: 1, accion: 'E', view_option: 'Entrada' },
  { orden: 2, accion: 'S/A', view_option: 'Inicio alimentación' },
  { orden: 3, accion: 'E/A', view_option: 'Fin alimentación' },
  { orden: 4, accion: 'S', view_option: 'Salida' }
]

@Component({
  selector: 'app-detalle-cat-horario',
  templateUrl: './detalle-cat-horario.component.html',
  styleUrls: ['./detalle-cat-horario.component.css']
})

export class DetalleCatHorarioComponent implements OnInit {

  minEsperaF = new FormControl('');
  accionF = new FormControl('', [Validators.required]);
  ordenF = new FormControl(null, [Validators.required]);
  horaF = new FormControl('', [Validators.required]);

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    minEsperaForm: this.minEsperaF,
    accionForm: this.accionF,
    ordenForm: this.ordenF,
    horaForm: this.horaF,
  });

  options = OPTIONS_HORARIOS;
  espera: boolean = false;

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  value = 10;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';

  constructor(
    public rest: DetalleCatHorariosService,
    public restH: HorarioService,
    private toastr: ToastrService,
    private router: Router,
    public ventana: MatDialogRef<DetalleCatHorarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ListarDetalles(this.data.datosHorario.id);
    this.BuscarDatosHorario(this.data.datosHorario.id);
  }

  // METODO PARA BUSCAR DATOS DE HORARIO
  datosHorario: any = [];
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.restH.BuscarUnHorario(id_horario).subscribe(data => {
      this.datosHorario = data;
    })
  }

  // METODO DE SELECCION DE TIPOS DE ACCION
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

  // METODO PARA VALIDAR INGRESO DE MINUTOS DE ESPERA
  ValidarMinEspera(form: any, datos: any) {
    if (form.minEsperaForm === '') {
      datos.minu_espera = 0;
    }
  }

  // METODO PARA REGISTRAR DETALLE
  InsertarDetalleHorario(form: any) {
    let detalle = {
      orden: form.ordenForm,
      hora: form.horaForm,
      minu_espera: form.minEsperaForm,
      id_horario: this.data.datosHorario.id,
      tipo_accion: form.accionForm,
    };
    this.ValidarMinEspera(form, detalle);
    if (this.datosHorario[0].min_almuerzo === 0) {
      this.ValidarDetallesSinAlimentacion(detalle);
    }
    else {
      this.ValidarDetallesConAlimentacion(detalle);
    }
  }

  // METODO PARA LISTAR DETALLES
  datosDetalle: any = [];
  ListarDetalles(id_horario: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // METODO PARA VALIDAR DETALLES DE CON ALIMENTACION
  ValidarDetallesConAlimentacion(datos: any) {
    var contador: number = 0, orden1: number = 0, orden2: number = 0, orden3: number = 0,
      orden4: number = 0;
    var entrada: number = 0, salida: number = 0, e_comida1: number = 0, e_comida2: number = 0,
      e_comida3: number = 0, s_comida1: number = 0, s_comida2: number = 0, s_comida3: number = 0;

    // VERIFICAR SI EXISTEN REGISTROS DE DETALLES
    if (this.datosDetalle.length != 0) {

      this.datosDetalle.map(obj => {

        // VALIDAR ORDEN DE DETALLES
        contador = contador + 1;
        if (obj.orden === datos.orden && obj.orden === 1) {
          orden1 = orden1 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 2) {
          orden2 = orden2 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 3) {
          orden3 = orden3 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 4) {
          orden4 = orden4 + 1;
        }

        if (datos.orden === 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 2 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida1 = s_comida1 + 1;
        }
        if (datos.orden === 2 && obj.orden === 3 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida2 = s_comida2 + 1;
        }
        if (datos.orden === 2 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          s_comida3 = s_comida3 + 1;
        }
        if (datos.orden === 3 && obj.orden === 1 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida1 = e_comida1 + 1;
        }
        if (datos.orden === 3 && obj.orden === 2 && (datos.hora + ':00') <= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida2 = e_comida2 + 1;
        }
        if (datos.orden === 3 && obj.orden === 4 && (datos.hora + ':00') >= obj.hora &&
          this.datosHorario[0].nocturno === false) {
          e_comida3 = e_comida3 + 1;
        }
        if (datos.orden === 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        if (contador === this.datosDetalle.length) {
          // VALIDANDO OPCION DE ENTRADA
          if (orden1 != 0) return this.toastr.warning(
            'Detalle Entrada ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION INICIO ALIMENTACION
          if (orden2 != 0) return this.toastr.warning(
            'Detalle Inicio alimentación ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION FIN ALIMENTACION
          if (orden3 != 0) return this.toastr.warning(
            'Detalle Fin alimentación ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });
          // VALIDANDO OPCION SALIDA
          if (orden4 != 0) return this.toastr.warning(
            'Detalle Salida ya se encuentra registrado.',
            'Verificar detalles registrados.', {
            timeOut: 6000
          });

          // VALIDANDO INGRESO DE HORAS DE DETALLES
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

    // SIN EXISTENCIAS SE GUARDA REGISTROS
    else {
      this.GuardarRegistro(datos);
    }
  }

  // METODO PARA VALIDAR REGISTRO DE DETALLES SIN ALIMENTACION
  ValidarDetallesSinAlimentacion(datos: any) {
    var contador: number = 0, orden1: number = 0, orden4: number = 0;
    var entrada: number = 0, salida: number = 0, comida: number = 0;

    // VALIDAR EXISTENCIA DE DETALLES
    if (this.datosDetalle.length != 0) {

      // VALIDAR ORDEN DE DETALLES
      this.datosDetalle.map(obj => {
        contador = contador + 1;
        if (obj.orden === datos.orden && obj.orden === 1) {
          orden1 = orden1 + 1;
        }
        else if (obj.orden === datos.orden && obj.orden === 4) {
          orden4 = orden4 + 1;
        }
        if (datos.orden === 2 || datos.orden === 3) {
          comida = comida + 1;
        }
        if (datos.orden === 1 && (datos.hora + ':00') > obj.hora && this.datosHorario[0].nocturno === false) {
          entrada = entrada + 1;
        }
        if (datos.orden === 4 && (datos.hora + ':00') <= obj.hora && this.datosHorario[0].nocturno === false) {
          salida = salida + 1;
        }

        // VALIDAR HORAS DE DETALLES
        if (contador === this.datosDetalle.length) {
          if (orden1 != 0) return this.toastr.warning(
            'Detalle Entrada ya se encuentra registrado.', 'Verificar detalles registrados.', {
            timeOut: 6000
          });
          if (orden4 != 0) return this.toastr.warning(
            'Detalle Salida ya se encuentra registrado.', 'Verificar detalles registrados.', {
            timeOut: 6000
          });
          if (comida != 0) return this.toastr.warning(
            'No es posible registrar detalle de alimentación.',
            'Horario no tiene configurado minutos de alimentación.', {
            timeOut: 6000
          });
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
          this.GuardarRegistro(datos);
        }
      })
    }
    // SIN EXISTENCIA DE DETALLES
    else {
      this.GuardarRegistro(datos);
    }
  }

  // METODO PARA REGISTRAR DETALLES DE HORARIO
  GuardarRegistro(datos: any) {
    this.habilitarprogress = true;
    this.rest.IngresarDetalleHorarios(datos).subscribe(response => {
      this.toastr.success('Operación Exitosa.', 'Registro guardado.', {
        timeOut: 6000,
      })
      this.habilitarprogress = false;
      this.LimpiarCampos();
      if (this.data.actualizar === true) {
        this.LimpiarCampos();
      }
      else {
        this.ventana.close();
        this.router.navigate(['/verHorario/', this.data.datosHorario.id]);
      }
    });
  }

  // METODO PARA VALIDAR SOLO INGRESO DE NUMEROS
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
