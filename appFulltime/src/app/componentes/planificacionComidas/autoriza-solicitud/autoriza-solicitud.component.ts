import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';

import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-autoriza-solicitud',
  templateUrl: './autoriza-solicitud.component.html',
  styleUrls: ['./autoriza-solicitud.component.css']
})
export class AutorizaSolicitudComponent implements OnInit {

  constructor(
    public restPlan: PlanComidasService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AutorizaSolicitudComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  multiple: boolean = false;
  individual: boolean = false;
  idEmpleadoLogueado: any;
  boton_autorizar: boolean = true;
  boton_negar: boolean = true;
  ngOnInit(): void {
    console.log('datos', this.data)
    if (this.data.carga === 'multiple') {
      this.multiple = true;
    }
    else {
      this.individual = true;
      if (this.data.datosMultiple.aprobada === 'AUTORIZADO') {
        this.boton_autorizar = false;
        this.boton_negar = true;
      }
      else if (this.data.datosMultiple.aprobada === 'NEGADO') {
        this.boton_autorizar = true;
        this.boton_negar = false;
      }
      else {
        this.boton_autorizar = true;
        this.boton_negar = true;
      }
    }
  }

  ActualizarEstado(estado: boolean) {
    var nombre_estado = '';
    let datosEstado = {
      aprobada: estado,
      verificar: 'Si',
      id: this.data.datosMultiple.id
    }
    this.restPlan.ActualizarEstadoSolicitudComida(datosEstado).subscribe(res => {
      if (estado === true) {
        nombre_estado = 'APROBADO';
        let datosPlanEmpleado = {
          codigo: this.data.datosMultiple.codigo,
          id_empleado: this.data.datosMultiple.id_empleado,
          id_sol_comida: this.data.datosMultiple.id,
          fecha: this.data.datosMultiple.fec_comida,
          hora_inicio: this.data.datosMultiple.hora_inicio,
          hora_fin: this.data.datosMultiple.hora_fin,
          consumido: false
        }
        this.restPlan.CrearSolComidasEmpleado(datosPlanEmpleado).subscribe(res => {
          this.EnviarNotificaciones(this.data.datosMultiple.fec_comida, this.data.datosMultiple.hora_inicio, this.data.datosMultiple.hora_fin, this.idEmpleadoLogueado, this.data.datosMultiple.id_empleado, nombre_estado);
          this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Aprobado.', {
            timeOut: 6000,
          })
          this.Cerrar();
        });
      } else {
        nombre_estado = 'NEGADO';
        if (this.data.datosMultiple.aprobada === null) {
          this.EnviarNotificaciones(this.data.datosMultiple.fec_comida, this.data.datosMultiple.hora_inicio, this.data.datosMultiple.hora_fin, this.idEmpleadoLogueado, this.data.datosMultiple.id_empleado, nombre_estado);
          this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Negado.', {
            timeOut: 6000,
          })
          this.Cerrar();
        }
        else {
          this.restPlan.EliminarSolComida(this.data.datosMultiple.id, this.data.datosMultiple.fec_comida.split('T')[0], this.data.datosMultiple.id_empleado).subscribe(res => {
            this.EnviarNotificaciones(this.data.datosMultiple.fec_comida, this.data.datosMultiple.hora_inicio, this.data.datosMultiple.hora_fin, this.idEmpleadoLogueado, this.data.datosMultiple.id_empleado, nombre_estado);
            this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Negado.', {
              timeOut: 6000,
            })
            this.Cerrar();
          })
        }
      }
    })
  }

  ActualizarEstadoMultiple(estado: boolean) {
    var nombre_estado = '';
    var contador = 0;
    var contador_plan = 0;
    this.data.datosMultiple.map(obj => {
      let datosEstado = {
        aprobada: estado,
        verificar: 'Si',
        id: obj.id
      }
      this.restPlan.ActualizarEstadoSolicitudComida(datosEstado).subscribe(res => {
        contador = contador + 1;
        if (estado === true) {
          nombre_estado = 'APROBADO';
          let datosPlanEmpleado = {
            codigo: obj.codigo,
            id_empleado: obj.id_empleado,
            id_sol_comida: obj.id,
            fecha: obj.fecha,
            hora_inicio: obj.hora_inicio,
            hora_fin: obj.hora_fin,
            consumido: false
          }
          this.restPlan.CrearSolComidasEmpleado(datosPlanEmpleado).subscribe(res => {
            contador_plan = contador_plan + 1;
            this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
            if (contador_plan === this.data.datosMultiple.length) {
              this.toastr.success('Operación Exitosa', 'Se notifica que ' + this.data.datosMultiple.length + ' Servicios de Alimentación han sido APROBADOS.', {
                timeOut: 6000,
              })
              this.Cerrar();
            }

          });
        } else {
          nombre_estado = 'NEGADO';
          this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
          if (contador === this.data.datosMultiple.length) {
            this.toastr.success('Operación Exitosa', 'Se notifica que ' + this.data.datosMultiple.length + ' Servicios de Alimentación han sido NEGADOS.', {
              timeOut: 6000,
            })
            this.Cerrar();
          }
        }
      })
    })



  }

  envios: any = [];
  EnviarNotificaciones(fecha_plan_inicio, h_inicio, h_fin, empleado_envia, empleado_recibe, estado) {
    let datosCorreo = {
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      hora_inicio: h_inicio,
      hora_fin: h_fin,
      estado: estado
    }
    this.restPlan.EnviarCorreoEstadoSolicitud(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      console.log('datos envio', this.envios.notificacion);
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe, estado);
      }
    });
  }

  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, estado) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: 'Solicitud Alimentación ' + estado
    }
    console.log(mensaje);
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
      console.log(res.message);
    })
  }

  Cerrar() {
    this.dialogRef.close();
  }

}
