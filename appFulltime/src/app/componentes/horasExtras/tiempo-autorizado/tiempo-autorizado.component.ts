import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';

@Component({
  selector: 'app-tiempo-autorizado',
  templateUrl: './tiempo-autorizado.component.html',
  styleUrls: ['./tiempo-autorizado.component.css']
})
export class TiempoAutorizadoComponent implements OnInit {

  Observacion: boolean = true;
  Horas: boolean = false;

  timer = new FormControl('', Validators.required);
  mensaje = new FormControl('', Validators.required);

  public TiempoHoraExtraForm = new FormGroup({
    timerForm: this.timer,
  });

  public MensajeForm = new FormGroup({
    mensajeF: this.mensaje
  });

  idEmpleado: number;

  constructor(
    private restPH: PedHoraExtraService,
    private restPlanH: PlanHoraExtraService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<TiempoAutorizadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log('data de la hora', this.data);
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  GuardarTiempoAutorizado(form) {
    let h = {
      hora: form.timerForm + ':00'
    }
    // Guardar horas que el empleador considere de la planificación de horas extras
    if (this.data.pagina === 'plan_hora_extra') {
      this.restPlanH.AutorizarTiempoHoraExtra(this.data.horas_calculadas.id, h).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        });
        this.dialogRef.close(true)
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      })
    }
    else {
      // Guardar horas que el empleador considere de la solicitud de horas extras
      this.restPH.AutorizarTiempoHoraExtra(this.data.horas_calculadas.id_hora, h).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        });
        this.dialogRef.close(true)
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      })
    }
  }

  TiempoAceptado() {
    let h = {
      hora: this.data.horas_calculadas.hora
    }
    // Guardar horas extras realizadas de la planificación de horas extras
    if (this.data.pagina === 'plan_hora_extra') {
      this.restPlanH.AutorizarTiempoHoraExtra(this.data.horas_calculadas.id, h).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        });
        this.dialogRef.close(true)
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      })
    }
    else {
      // Guardar horas extras realizadas de la solicitud de horas extras
      this.restPH.AutorizarTiempoHoraExtra(this.data.horas_calculadas.id_hora, h).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        });
        this.dialogRef.close(true)
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      })
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

  LimpiarCampoHoras() {
    this.TiempoHoraExtraForm.patchValue({ timerForm: '' })
  }

  MostrarObservacion() {
    this.Observacion = false;
    this.Horas = true;
  }

  MostrarHoras() {
    this.Observacion = true;
    this.Horas = false;
  }

  // Método para cambiar de estado el campo observacion de planificacion de horas extras
  EnviarMensaje(form) {
    var datos = {
      observacion: true
    }
    // Si el empleador emite una observacion entonces actualizamos el estado de la observacion de false a true
    if (this.data.pagina === 'plan_hora_extra') {
      this.restPlanH.EditarObservacion(this.data.horas_calculadas.id, datos).subscribe(res => {
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      });
      this.NotificarObservacion(form);
    }
    else {
      this.restPH.EditarObservacionPedido(this.data.horas_calculadas.id_hora, datos).subscribe(res => {
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close(false);
        }
      });
      this.NotificarObservacion(form);
    }
  }

  NotificarObservacion(form) {
    let mensaje = {
      id_empl_envia: this.idEmpleado,
      id_empl_recive: this.data.horas_calculadas.id_empl_solicita,
      mensaje: form.mensajeF
    }
    console.log(mensaje);
    this.restPlanH.EnviarMensajeJustificacion(mensaje).subscribe(res => {
      console.log(res.message);
      this.toastr.success(res.message,'', {
        timeOut: 6000,
      });
      this.dialogRef.close(false);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close(false);
      }
    })
  }
}
