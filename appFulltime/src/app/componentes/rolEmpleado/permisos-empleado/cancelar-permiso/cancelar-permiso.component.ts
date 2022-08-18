import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

@Component({
  selector: 'app-cancelar-permiso',
  templateUrl: './cancelar-permiso.component.html',
  styleUrls: ['./cancelar-permiso.component.css']
})

export class CancelarPermisoComponent implements OnInit {

  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

  constructor(
    private restP: PermisosService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private restTipoP: TipoPermisosService,
    public ventana: MatDialogRef<CancelarPermisoComponent>,
    public informacion: DatosGeneralesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    console.log(this.data);
    this.ObtenerTiposPermiso();
    this.obtenerInformacionEmpleado();
  }

  // MÉTODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL 
  tipoPermisos: any = [];
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    this.restTipoP.getTipoPermisoRest().subscribe(datos => {
      this.tipoPermisos = datos;
    });
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
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
          id_contrato: res.id_contrato,
        }

        if (this.data.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  aceptarAdvertencia() {
    this.restP.EliminarPermiso(this.data.info.id, this.data.info.documento).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: parseInt(this.solInfo.id_dep),
        objeto: res,
      }
      this.informacion.BuscarJefes(datos).subscribe(permiso => {
        console.log(permiso);
        permiso.EmpleadosSendNotiEmail.push(this.solInfo);
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

          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
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
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: permiso.id,
      id_vacaciones: null,
      id_hora_extra: null,
      tipo: 3,
      mensaje: 'Ha eliminado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
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
