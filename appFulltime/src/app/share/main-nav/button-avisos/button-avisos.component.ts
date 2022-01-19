import { Component, OnInit } from '@angular/core';
import { TimbresService } from '../../../servicios/timbres/timbres.service';
import { LoginService } from '../../../servicios/login/login.service';

@Component({
  selector: 'app-button-avisos',
  templateUrl: './button-avisos.component.html',
  styleUrls: ['../main-nav.component.css']
})
export class ButtonAvisosComponent implements OnInit {
  
  estadoTimbres: boolean = true;
  num_timbre_false: number = 0;
  timbres_noti: any = [];
  id_empleado_logueado: number;

  constructor(
    public loginService: LoginService,
    private timbresNoti: TimbresService,
  ) { }

  ngOnInit(): void {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado'));
    this.LlamarNotificacionesAvisos(this.id_empleado_logueado);
  }

  numeroTimbres() {
    if (this.num_timbre_false > 0) {
      this.num_timbre_false = 0;
      this.estadoTimbres = !this.estadoTimbres;
    }
  }

  mensaje_inicio: string = '';
  mensaje_fin: string = '';
  LlamarNotificacionesAvisos(id: number) {
    this.timbresNoti.NotiTimbresRealTime(id).subscribe(res => {
      this.timbres_noti = res;
      // console.log(this.timbres_noti, ' verificando vista de timbres ' + this.timbres_noti.message);
      if (!this.timbres_noti.message) {
        if (this.timbres_noti.length > 0) {
          this.timbres_noti.forEach(obj => {
            if (obj.visto === false) {
              this.num_timbre_false = this.num_timbre_false + 1;
              this.estadoTimbres = false;
            }
            if (obj.descripcion.split(' ')[0] === 'Alimentación') {
              // console.log('verificando espacios', obj.descripcion.split(' '))
              this.mensaje_inicio = obj.descripcion.split(' ')[0] + ' ' + obj.descripcion.split(' ')[1] + ' ' + obj.descripcion.split(' ')[2] + ' ' + obj.descripcion.split(' ')[3];
              this.mensaje_fin = obj.descripcion.split(' ')[4] + ' ' + obj.descripcion.split(' ')[5] + ' ' + obj.descripcion.split(' ')[6];
            }
          });
        }
      }
    }, err => {
      console.log(err);
    });
  }

  CambiarVistaTimbres(id_realtime: number) {
    this.timbresNoti.PutVistaTimbre(id_realtime).subscribe(res => {
      console.log(res);
    }, err => {
      console.log(err);
    });
  }

}
