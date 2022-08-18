import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';

import { EditarHoraExtraEmpleadoComponent } from '../editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { CancelarHoraExtraComponent } from '../cancelar-hora-extra/cancelar-hora-extra.component';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PedidoHoraExtraComponent } from 'src/app/componentes/modulos/horasExtras/pedido-hora-extra/pedido-hora-extra.component';

@Component({
  selector: 'app-hora-extra-empleado',
  templateUrl: './hora-extra-empleado.component.html',
  styleUrls: ['./hora-extra-empleado.component.css']
})

export class HoraExtraEmpleadoComponent implements OnInit {

  id_user_loggin: number;
  // ITEMS DE PAGINACIÓN DE LA TABLA 
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private restHE: PedHoraExtraService,
    private ventana: MatDialog,
    private validar: ValidacionesService
  ) {
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
  }

  ngOnInit(): void {
    this.ObtenerlistaHorasExtrasEmpleado();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  hora_extra: any = [];
  ObtenerlistaHorasExtrasEmpleado() {
    this.hora_extra = [];
    this.restHE.ObtenerListaEmpleado(this.id_user_loggin).subscribe(res => {
      console.log('estado -------------', res);
      this.hora_extra = res;

      this.hora_extra.forEach(h => {

        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        h.fec_inicio = moment(h.fec_inicio).format('YYYY-MM-DD') + ' ' + moment(h.fec_inicio).format('HH:mm:ss')
        h.fec_final = moment(h.fec_final).format('YYYY-MM-DD') + ' ' + moment(h.fec_final).format('HH:mm:ss')


        h.fecha_inicio = moment.weekdays(moment(h.fec_inicio.split(' ')[0]).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_inicio.split(' ')[0]).day()).slice(1) +
          ' ' + moment(h.fec_inicio).format('DD/MM/YYYY');

        h.hora_inicio = h.fec_inicio.split(' ')[1];

        h.fecha_fin = moment.weekdays(moment(h.fec_final.split(' ')[0]).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_final.split(' ')[0]).day()).slice(1) +
          ' ' + moment(h.fec_final).format('DD/MM/YYYY');

        h.hora_fin = h.fec_final.split(' ')[1];

        h.fec_solicita = moment.weekdays(moment(h.fec_solicita).day()).charAt(0).toUpperCase() +
          moment.weekdays(moment(h.fec_solicita).day()).slice(1) +
          ' ' + moment(h.fec_solicita).format('DD/MM/YYYY');
      })

    }, err => {
      console.log(err.error);
      return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  AbrirVentanaHoraExtra() {
    this.ventana.open(PedidoHoraExtraComponent,
      { width: '900px' }).afterClosed().subscribe(items => {
        this.ObtenerlistaHorasExtrasEmpleado();
      });
  }

  CancelarHoraExtra(h) {
    this.ventana.open(CancelarHoraExtraComponent,
      { width: '450px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        if (items === true) {
          this.ObtenerlistaHorasExtrasEmpleado();
        }
      });
  }

  EditarHoraExtra(h) {
    this.ventana.open(EditarHoraExtraEmpleadoComponent,
      { width: '900px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        if (items === true) {
          this.ObtenerlistaHorasExtrasEmpleado();
        }
      });
  }

}
