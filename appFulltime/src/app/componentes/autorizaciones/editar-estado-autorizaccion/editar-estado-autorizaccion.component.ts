import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

import { AutorizacionService } from "src/app/servicios/autorizacion/autorizacion.service";
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-estado-autorizaccion',
  templateUrl: './editar-estado-autorizaccion.component.html',
  styleUrls: ['./editar-estado-autorizaccion.component.css']
})
export class EditarEstadoAutorizaccionComponent implements OnInit {

  estados: Estado[] = [
    // { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' }
  ];

  estado = new FormControl('', Validators.required);

  public estadoAutorizacionesForm = new FormGroup({
    estadoF: this.estado
  });

  NotifiRes: any;
  id_empleado_loggin: number;
  FechaActual: any;

  constructor(
    private restA: AutorizacionService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private realTime: RealTimeService,
    public dialogRef: MatDialogRef<EditarEstadoAutorizaccionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    console.log(this.data.auto.id_documento);
    console.log(this.data.empl[0].id_empleado);
    console.log(this.data.empl[0].estado);
    if (this.data.empl[0].estado === 1) {
      this.toastr.info('La autorización esta en pendiente. Pre-autoriza o Autoriza el permiso.','', {
        timeOut: 6000,
      })
    } else {
      this.estadoAutorizacionesForm.patchValue({
        estadoF: this.data.auto.estado
      });
    }
    this.id_empleado_loggin = parseInt(localStorage.getItem('empleado'));
    this.tiempo();
  }

  tiempo() {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log('fecha Actual', this.FechaActual);
  }

  resAutorizacion: any = [];
  idNoti: any = [];
  ActualizarEstadoAutorizacion(form) {
    let newAutorizaciones = {
      id_documento: this.data.auto.id_documento + localStorage.getItem('empleado') + '_' + form.estadoF + ',',
      estado: form.estadoF,
      id_permiso: this.data.auto.id_permiso,
      id_departamento: this.data.auto.id_departamento,
      id_empleado: this.data.empl[0].id_empleado
    }
    console.log(newAutorizaciones);

    this.restA.PutEstadoAutoPermiso(this.data.auto.id, newAutorizaciones).subscribe(res => {
      this.resAutorizacion = [res];
      console.log(this.resAutorizacion);
      this.toastr.success('Operación exitosa', 'Estado Actualizado', {
        timeOut: 6000,
      });
      this.EditarEstadoPermiso(this.data.auto.id_permiso, this.data.auto.id_departamento, form, this.data.empl[0].id_empleado, form.estadoF);
    })
  }

  resEstado: any = [];
  EditarEstadoPermiso(id_permiso, id_departamento, form, id_empleado, estado_permiso) {
    let datosPermiso = {
      estado: estado_permiso,
      id_permiso: id_permiso,
      id_departamento: id_departamento,
      id_empleado: id_empleado
    }
    // Actualizar estado del permiso
    this.restP.ActualizarEstado(id_permiso, datosPermiso).subscribe(respo => {
      this.resEstado = [respo];
      var f = new Date();
      let notificacion = {
        id: null,
        id_send_empl: this.id_empleado_loggin,
        id_receives_empl: id_empleado,
        id_receives_depa: id_departamento,
        estado: form.estadoF,
        create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
        id_permiso: id_permiso,
        id_vacaciones: null
      }
      // Enviar la respectiva notificación de cambio de estado del permiso
      this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(res => {
        this.NotifiRes = res;
        notificacion.id = this.NotifiRes._id;
        if (this.NotifiRes._id > 0 && this.resEstado[0].notificacion === true) {
          this.restP.sendNotiRealTime(notificacion);
        }
      });
      this.dialogRef.close();
      //window.location.reload();
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
  }



}
