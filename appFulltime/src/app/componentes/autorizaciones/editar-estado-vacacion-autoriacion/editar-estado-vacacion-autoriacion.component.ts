import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import * as moment from 'moment';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-vacacion-autoriacion',
  templateUrl: './editar-estado-vacacion-autoriacion.component.html',
  styleUrls: ['./editar-estado-vacacion-autoriacion.component.css']
})
export class EditarEstadoVacacionAutoriacionComponent implements OnInit {

  estados: Estado[] = [
    // { id: 1, nombre: 'Pendiente'},
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  id_empleado_loggin: number;
  FechaActual: any;
  NotifiRes: any;

  constructor(
    private restA: AutorizacionService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private restV: VacacionesService,
    public dialogRef: MatDialogRef<EditarEstadoVacacionAutoriacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data, 'datakjdjddjdndn');
    console.log(this.data.datosSeleccionados);
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado'));
    this.tiempo();
    if (this.data.datosSeleccionados.estado === 1) {
      this.toastr.info('La autorización esta en pendiente. Pre-autoriza o Autoriza el permiso.','', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: this.data.datosSeleccionados.estado
      });
    }
  }

  tiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log('fecha Actual', this.FechaActual);
  }

  autorizacion: any = [];
  idNoti: any = [];
  ActualizarEstadoAutorizacion(form) {
    let newAutorizaciones = {
      estado: form.estadoF,
      id_documento: this.data.datosSeleccionados.id_documento + localStorage.getItem('empleado') + '_' + form.estadoF + ',',
      id_vacacion: this.data.datosSeleccionados.id_vacacion,
      id_departamento: this.data.datosSeleccionados.id_departamento,
      id_empleado: this.data.id_rece_emp
    }

    this.restA.PutEstadoAutoVacacion(newAutorizaciones).subscribe(res => {
      this.autorizacion = [res];
      this.toastr.success('Operación Exitosa', 'Estado Actualizado', {
        timeOut: 6000,
      });
      this.EditarEstadoVacacion(form, this.data.datosSeleccionados.id_vacacion, this.data.id_rece_emp, this.data.datosSeleccionados.id_departamento);
      this.dialogRef.close();
    })
  }

  resVacacion: any = [];
  EditarEstadoVacacion(form, id_vacacion, id_empleado, id_departamento) {
    let datosVacacion = {
      estado: form.estadoF,
      id_vacacion: id_vacacion,
      id_rece_emp: id_empleado,
      id_depa_send: id_departamento
    }
    this.restV.ActualizarEstado(id_vacacion, datosVacacion).subscribe(respon => {
      this.resVacacion = respon
      console.log(this.resVacacion);
      var f = new Date();
      var estado_letras: string = '';
      if (form.estadoF === 1) {
        estado_letras = 'Pendiente';
      }
      else if (form.estadoF === 2) {
        estado_letras = 'Pre-autorizado';
      }
      else if (form.estadoF === 3) {
        estado_letras = 'Autorizado';
      }
      else if (form.estadoF === 4) {
        estado_letras = 'Negado';
      }
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: estado_letras,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_vacaciones: id_vacacion,
        id_permiso: null
      }
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        console.log(this.NotifiRes);
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resVacacion.notificacion === true) {
          this.restV.sendNotiRealTime(notificacion);
        }
      });
    });
  }
}
