import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-autoriza-solicitud',
  templateUrl: './autoriza-solicitud.component.html',
  styleUrls: ['./autoriza-solicitud.component.css']
})

export class AutorizaSolicitudComponent implements OnInit {

  constructor(
    public restPlan: PlanComidasService,
    public ventana: MatDialogRef<AutorizaSolicitudComponent>,
    private informacion: DatosGeneralesService,
    private toastr: ToastrService,
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

    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.datosMultiple.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  ActualizarEstado(estado: boolean) {
    var datos = this.data.datosMultiple;
    let datosEstado = {
      verificar: 'Si',
      aprobada: estado,
      id: datos.id
    }
    this.restPlan.AprobarComida(datosEstado).subscribe(alimentacion => {
       if (estado === true) {
         this.AprobarComida(alimentacion, estado);
       } else {
         if (this.data.datosMultiple.aprobada === null) {
           this.AprobarComida(alimentacion, estado);
         }
         else {
           this.restPlan.EliminarComidaAprobada(datos.id, datos.fec_comida.split('T')[0], datos.id_empleado)
             .subscribe(res => {
               this.AprobarComida(alimentacion, estado);
             })
         }
       }
    })
  }



  // METODO DE APROBACIÓN DE SOLICITUDES DE ALIMENTACIÓN
  AprobarComida(alimentacion: any, estado: boolean) {
    let datosPlanEmpleado = {
      id_sol_comida: this.data.datosMultiple.id,
      id_empleado: this.data.datosMultiple.id_empleado,
      hora_inicio: this.data.datosMultiple.hora_inicio,
      consumido: false,
      hora_fin: this.data.datosMultiple.hora_fin,
      codigo: this.data.datosMultiple.codigo,
      fecha: this.data.datosMultiple.fec_comida,
    }
    this.restPlan.CrearComidaAprobada(datosPlanEmpleado).subscribe(res => {
      this.NotificarAprobacion(estado, alimentacion);
    });
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
      this.restPlan.AprobarComida(datosEstado).subscribe(alimentacion => {
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
          this.restPlan.CrearComidaAprobada(datosPlanEmpleado).subscribe(res => {
            contador_plan = contador_plan + 1;
            // this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
            if (contador_plan === this.data.datosMultiple.length) {
              this.toastr.success('Operación Exitosa', 'Se notifica que ' + this.data.datosMultiple.length + ' Servicios de Alimentación han sido APROBADOS.', {
                timeOut: 6000,
              })
              this.Cerrar();
            }

          });
        } else {
          nombre_estado = 'NEGADO';
          //this.EnviarNotificaciones(obj.fecha, obj.hora_inicio, obj.hora_fin, this.idEmpleadoLogueado, obj.id_empleado, nombre_estado);
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




  // METODO DE ENVIO DE NOTIFICACIONES RESPECTO A LA APROBACION
  NotificarAprobacion(estado: boolean, datos_a: any) {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    var datos = {
      depa_user_loggin: depa_user_loggin,
      objeto: datos_a,
    }

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (estado === true) {
      var estado_a = 'Autorizado';
      var estado_c = 'Autorizada';
    }
    else {
      var estado_a = 'Negado';
      var estado_c = 'Negada';
    }
    this.informacion.BuscarJefes(datos).subscribe(alimentacion => {
      console.log(alimentacion);
      this.EnviarCorreo(alimentacion, estado_a, estado_c);
      this.NotificarEvento(alimentacion, estado_a);
      this.toastr.success('', 'Proceso realizado exitosamente.', {
        timeOut: 6000,
      });
      this.Cerrar();
    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any, estado_a: string, estado_c: string) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE ALIMENTACIÓN
      if (e.comida_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === alimentacion.EmpleadosSendNotiEmail.length) {
        let comida = {
          id_usua_solicita: alimentacion.id_empleado,
          tipo_solicitud: 'Servicio de alimentación ' + estado_a.toLowerCase() + ' por',
          fec_solicitud: solicitud + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY'),
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: estado_a.toLowerCase(),
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE SERVICIO DE ALIMENTACION ' + estado_c.toUpperCase(),
          inicio: moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm'),
          final: moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm'),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restPlan.EnviarCorreo(comida).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de solicitud.', {
                  timeOut: 6000,
                });
              }
            },
            err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarEvento(alimentacion: any, estado_a: string) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);
    let inicio = moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm');
    let final = moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm');

    let mensaje = {
      id_empl_envia: this.data.datosMultiple.id_empleado,
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha ' + estado_a.toLowerCase() + ' su solicitud de alimentación desde ' +
        desde + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY') +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
        })
      }
    })

  }
















  Cerrar() {
    this.ventana.close();
  }

}
