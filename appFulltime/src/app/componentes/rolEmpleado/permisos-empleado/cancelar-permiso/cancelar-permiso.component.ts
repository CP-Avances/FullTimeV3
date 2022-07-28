import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import * as moment from 'moment';

import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { ToastrService } from 'ngx-toastr';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-cancelar-permiso',
  templateUrl: './cancelar-permiso.component.html',
  styleUrls: ['./cancelar-permiso.component.css']
})

export class CancelarPermisoComponent implements OnInit {

  constructor(
    private restP: PermisosService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private restTipoP: TipoPermisosService,
    public ventana: MatDialogRef<CancelarPermisoComponent>,
    public informacion: DatosGeneralesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.ObtenerTiposPermiso();
    this.ObtenerDatos();
  }

  // MÉTODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL 
  tipoPermisos: any = [];
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    this.restTipoP.getTipoPermisoRest().subscribe(datos => {
      this.tipoPermisos = datos;
    });
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  aceptarAdvertencia() {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    this.restP.EliminarPermiso(this.data.info.id, this.data.info.documento).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: depa_user_loggin,
        objeto: res,
      }
      this.informacion.BuscarJefes(datos).subscribe(permiso => {
        console.log(permiso);
        this.EnviarCorreo(permiso);
        this.EnviarNotificacion(permiso);
        this.toastr.error('Solicitud de permiso eliminada.', '', {
          timeOut: 6000,
        });
        this.ventana.close(true);
      });
    });
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE PERMISOS                       ** **
   ** ******************************************************************************************* **/

  EnviarCorreo(permiso: any) {

    console.log('entra correo')
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = moment.weekdays(moment(permiso.fec_creacion).day()).charAt(0).toUpperCase() + moment.weekdays(moment(permiso.fec_creacion).day()).slice(1);
    let desde = moment.weekdays(moment(permiso.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(permiso.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(permiso.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(permiso.fec_final).day()).slice(1);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter(o => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach(e => {

      console.log('for each', e)

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.permiso_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud + ' ' + moment(permiso.fec_creacion).format('DD/MM/YYYY'),
          desde: desde + ' ' + moment(permiso.fec_inicio).format('DD/MM/YYYY'),
          hasta: hasta + ' ' + moment(permiso.fec_final).format('DD/MM/YYYY'),
          h_inicio: moment(permiso.hora_salida, 'HH:mm').format('HH:mm'),
          h_fin: moment(permiso.hora_ingreso, 'HH:mm').format('HH:mm'),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso eliminado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'eliminado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.restP.SendMailNoti(datosPermisoCreado).subscribe(
            resp => {
              console.log('data entra enviar correo', resp)
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

  EnviarNotificacion(permiso: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = moment.weekdays(moment(permiso.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(permiso.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(permiso.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(permiso.fec_final).day()).slice(1);
    let h_inicio = moment(permiso.hora_salida, 'HH:mm').format('HH:mm');
    let h_fin = moment(permiso.hora_ingreso, 'HH:mm').format('HH:mm');

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    let notificacion = {
      id_send_empl: this.data.id_empleado,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: permiso.id,
      id_vacaciones: null,
      id_hora_extra: null,
      mensaje: 'Ha eliminado su solicitud de permiso desde ' +
        desde + ' ' + moment(permiso.fec_inicio).format('DD/MM/YYYY') + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + moment(permiso.fec_final).format('DD/MM/YYYY') + ' ' + h_fin,
    }

    permiso.EmpleadosSendNotiEmail.forEach(e => {

      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;

      if (e.permiso_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            console.log('ver data de notificacion', resp.respuesta)
            this.restP.sendNotiRealTime(resp.respuesta);
          },
          err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          },
          () => { },
        )
      }
    })
  }


}
