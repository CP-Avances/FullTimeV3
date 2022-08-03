import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../../servicios/login/login.service';
import { MatDialog } from '@angular/material/dialog';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { RealTimeService } from '../../../servicios/notificaciones/real-time.service';

import { SettingsComponent } from "src/app/componentes/settings/settings.component";

@Component({
  selector: 'app-button-notificacion',
  templateUrl: './button-notificacion.component.html',
  styleUrls: ['../main-nav.component.css']
})

export class ButtonNotificacionComponent implements OnInit {

  estado: boolean = true;

  num_noti_false: number = 0;
  noti_real_time: any = [];
  idEmpleadoIngresa: number;

  constructor(
    public loginService: LoginService,
    public ventana: MatDialog,
    private realTime: RealTimeService,
    private toaster: ToastrService,
    private socket: Socket,
    private router: Router,
  ) {
    loginService.getEstado()
    if (this.loginService.loggedIn()) {
      this.socket.on('enviar_notification', (data) => {
        if (parseInt(data.id_receives_empl) === this.idEmpleadoIngresa) {
          this.realTime.ObtenerUnaNotificaciones(data.id).subscribe(res => {
            this.estadoNotificacion = false;
            if (this.avisos.length < 10) {
              this.avisos.unshift(res[0]);
            } else if (this.avisos.length >= 10) {
              this.avisos.unshift(res[0]);
              this.avisos.pop();
            }
            this.num_noti_false = this.num_noti_false + 1;
          })
        }
      });
    }
  }

  ngOnInit(): void {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado'));
    this.LlamarNotificaciones(this.idEmpleadoIngresa);
    this.VerificarConfiguracion(this.idEmpleadoIngresa);

  }

  estadoNotificacion: boolean = true;
  numeroNotificacion() {
    if (this.num_noti_false > 0) {
      this.num_noti_false = 0;
      this.estadoNotificacion = !this.estadoNotificacion;
    }
  }

  // METODO DE BUSQUEDA DE NOTIFICACIONES
  avisos: any = [];
  nota: string = '';
  LlamarNotificaciones(id: number) {
    this.realTime.ObtenerNotasUsuario(id).subscribe(res => {
      this.avisos = res;
      if (!this.avisos.text) {
        if (this.avisos.length > 0) {
          this.avisos.forEach(obj => {
            obj.create_at = moment(obj.create_at).format('DD/MM/YYYY') + ' ' + moment(obj.create_at).format('HH:mm:ss')
            if (obj.visto === false) {
              this.num_noti_false = this.num_noti_false + 1;
              this.estadoNotificacion = false
            }
            if (obj.mensaje.split('para')[0] != undefined && obj.mensaje.split('para')[1] != undefined) {
              obj.aviso = obj.mensaje.split('para')[0];;
              obj.usuario = 'del usuario ' + obj.mensaje.split('para')[1].split('desde')[0];
            }
            else {
              obj.aviso = obj.mensaje.split('desde')[0];
              obj.usuario = '';
            }
          });
        }
      }
      console.log('notas .. ', this.avisos);
    });
  }

  // METODO DE VERIFICACION DE CONFIGURACIONES DEL USUARIO
  VerificarConfiguracion(id: number) {
    this.realTime.ObtenerConfiguracionEmpleado(id).subscribe(res => {
      if (!res.text) {
        if (res[0].vaca_noti === false || res[0].permiso_noti === false || res[0].hora_extra_noti === false) {
          this.num_noti_false = 0;
          this.estadoNotificacion = true
        }
      }
    }, error => {
      this.router.url
      if (this.router.url !== '/login') {
        this.toaster.info('Configure si desea que le lleguen notficaciones y avisos al correo electrónico',
          'Falta Ajustes del Sistema').onTap.subscribe(items => {
            this.AbrirSettings();
          });
      }
    });
  }

  CambiarVistaNotificacion(id_realtime: number) {
    this.realTime.PutVistaNotificacion(id_realtime).subscribe(res => {
      this.LlamarNotificaciones(this.idEmpleadoIngresa);
    });
  }

  AbrirSettings() {
    const id_empleado = parseInt(localStorage.getItem('empleado'));
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }
}
