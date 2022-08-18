import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

@Component({
  selector: 'app-cancelar-comida',
  templateUrl: './cancelar-comida.component.html',
  styleUrls: ['./cancelar-comida.component.css']
})

export class CancelarComidaComponent implements OnInit {

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  constructor(
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public aviso: RealTimeService,
    public restP: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS
    public ventana: MatDialogRef<CancelarComidaComponent>,
    public informacion: DatosGeneralesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    console.log('datos comida ... ', this.data)
    this.obtenerInformacionEmpleado();
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    this.informacion.ObtenerInfoConfiguracion(this.data.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          comida_mail: res.comida_mail,
          comida_noti: res.comida_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
        if (this.data.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO -- SOLICITUD DE ALIMENTACIÓN
  EliminarSolicitaComida() {
    this.restP.EliminarSolicitud(this.data.id).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: this.solInfo.id_dep,
        objeto: res,
      }
      console.log(datos);
      this.informacion.BuscarJefes(datos).subscribe(alimentacion => {
        console.log(alimentacion);
        alimentacion.EmpleadosSendNotiEmail.push(this.solInfo);
        this.NotificarEvento(alimentacion);
        this.EnviarCorreo(alimentacion);
        this.toastr.error('Solicitud de alimentación eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any) {
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
          tipo_solicitud: 'Servicio de alimentación eliminado por',
          fec_solicitud: solicitud + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY'),
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'eliminado',
          correo: correo_usuarios,
          estadoc: 'Pendiente de autorización',
          asunto: 'ELIMINACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm'),
          final: moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm'),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restP.EnviarCorreo(comida).subscribe(
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
  NotificarEvento(alimentacion: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);
    let inicio = moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm');
    let final = moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm');

    let mensaje = {
      id_empl_envia: this.idEmpleadoIngresa,
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha eliminado ' + this.nota + ' de alimentación ' + this.user + ' desde ' +
        desde + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY') +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.restP.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
          this.aviso.RecibirNuevosAvisos(res.respuesta);
        })
      }
    })

  }

}
