import { Component, OnInit } from '@angular/core';
import { TimbresService } from '../../../servicios/timbres/timbres.service';
import * as moment from 'moment';

@Component({
  selector: 'app-button-avisos',
  templateUrl: './button-avisos.component.html',
  styleUrls: ['../main-nav.component.css']
})
export class ButtonAvisosComponent implements OnInit {

  estadoTimbres: boolean = true;
  num_timbre_false: number = 0;
  avisos: any = [];
  id_empleado_logueado: number;

  constructor(
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

  LlamarNotificacionesAvisos(id: number) {
    this.timbresNoti.BuscarAvisosGenerales(id).subscribe(res => {
      this.avisos = res;
      if (!this.avisos.message) {
        if (this.avisos.length > 0) {
          this.avisos.forEach(obj => {
            obj.create_at = moment(obj.create_at).format('DD/MM/YYYY') + ' ' + moment(obj.create_at).format('HH:mm:ss')

            if (obj.descripcion.split('para')[0] != undefined && obj.descripcion.split('para')[1] != undefined) {
              obj.aviso = obj.descripcion.split('para')[0];;
              obj.usuario = 'del usuario ' + obj.descripcion.split('para')[1].split('desde')[0];
            }
            else {
              obj.aviso = obj.descripcion.split('desde')[0];
              obj.usuario = '';
            }

            if (obj.visto === false) {
              this.num_timbre_false = this.num_timbre_false + 1;
              this.estadoTimbres = false;
            }
          });
        }
      }
    });
  }


  ActualizarVista(id_realtime: number) {
    this.timbresNoti.PutVistaTimbre(id_realtime).subscribe(res => {
      this.LlamarNotificacionesAvisos(this.id_empleado_logueado);
    });
  }

}
