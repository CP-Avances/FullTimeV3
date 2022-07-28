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
  id_empleado_logueado: number;

  constructor(
    public loginService: LoginService,
    public ventana: MatDialog,
    private realTime: RealTimeService,
    private toaster: ToastrService,
    private socket: Socket,
    private router: Router,
  ) {
    this.noti_real_time.forEach(obj => {
      obj.create_at = moment(obj.create_at).format('DD/MM/YYYY') + ' ' + moment(obj.create_at).format('HH:mm:ss')
    });
    if (this.loginService.loggedIn()) {

      this.socket.on('enviar_notification', (data) => {
        if (parseInt(data.id_receives_empl) === this.id_empleado_logueado) {
          console.log('data_notificacion **** ', data);
          this.realTime.ObtenerUnaNotificaciones(data.id).subscribe(res => {
            console.log('res_notificacion **** ', res);
            this.estadoNotificacion = false;
            if (this.noti_real_time.length < 12) {
              this.noti_real_time.unshift(res[0]);
            } else if (this.noti_real_time.length >= 15) {
              this.noti_real_time.unshift(res[0]);
              this.noti_real_time.pop();
            }
            this.num_noti_false = this.num_noti_false + 1;
          }, err => {
            console.log(err);
          })
        }
      });

    }
  }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado'));
    this.LlamarNotificaciones(this.id_empleado_logueado);

  }

  estadoNotificacion: boolean = true;
  numeroNotificacion() {
    if (this.num_noti_false > 0) {
      this.num_noti_false = 0;
      this.estadoNotificacion = !this.estadoNotificacion;
    }
  }

  confRes: any = [];
  LlamarNotificaciones(id: number) {
    this.realTime.ObtenerNotificacionesReceives(id).subscribe(res => {

      this.noti_real_time = res;
      this.noti_real_time.forEach(obj => {
        obj.create_at = moment(obj.create_at).format('DD/MM/YYYY') + ' ' + moment(obj.create_at).format('HH:mm:ss')
      });
      console.log('res_notificacion **** ', this.noti_real_time);
      // console.log(this.noti_real_time);
      if (!this.noti_real_time.text) {
        if (this.noti_real_time.length > 0) {
          this.noti_real_time.forEach(obj => {
            //obj.create_at = moment(obj.create_at).format('DD/MM/YYYY') + ' ' + moment(obj.create_at).format('HH:mm:ss')
            if (obj.visto === false) {
              this.num_noti_false = this.num_noti_false + 1;
              this.estadoNotificacion = false
            }
          });
        }
      }
    }, err => {
      console.log(err);
    });
    this.realTime.ObtenerConfigNotiEmpleado(id).subscribe(res => {
      console.log(res);
      this.confRes = res;
      if (!this.confRes.text) {
        if (res[0].vaca_noti === false || res[0].permiso_noti === false || res[0].hora_extra_noti === false) {
          this.num_noti_false = 0;
          this.estadoNotificacion = true
        }
      }
    }, error => {
      console.log(error);
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
      // console.log(res);
    }, err => {
      console.log(err);
    });
  }

  AbrirSettings() {
    const id_empleado = parseInt(localStorage.getItem('empleado'));
    this.ventana.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }
}
