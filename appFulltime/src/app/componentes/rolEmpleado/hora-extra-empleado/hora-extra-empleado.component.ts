import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { PedidoHoraExtraComponent } from '../../horasExtras/pedido-hora-extra/pedido-hora-extra.component';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { CancelarHoraExtraComponent } from './cancelar-hora-extra/cancelar-hora-extra.component';
import { EditarHoraExtraEmpleadoComponent } from './editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-hora-extra-empleado',
  templateUrl: './hora-extra-empleado.component.html',
  styleUrls: ['./hora-extra-empleado.component.css']
})
export class HoraExtraEmpleadoComponent implements OnInit {

  id_user_loggin: number;
  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private restHE: PedHoraExtraService,
    private vistaRegistrarDatos: MatDialog,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
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
      console.log('estado', res);
      this.hora_extra = res;
      for (var i = 0; i <= this.hora_extra.length - 1; i++) {
        if (this.hora_extra[i].estado === 1) {
          this.hora_extra[i].estado = 'Pendiente';
        }
        else if (this.hora_extra[i].estado === 2) {
          this.hora_extra[i].estado = 'Pre-autorizado';
        }
        else if (this.hora_extra[i].estado === 3) {
          this.hora_extra[i].estado = 'Autorizado';
        }
        else if (this.hora_extra[i].estado === 4) {
          this.hora_extra[i].estado = 'Negado';
        }
      }

    }, err => {
      console.log(err.error);
      return this.validacionesService.RedireccionarEstadisticas(err.error);
    });
  }

  AbrirVentanaHoraExtra() {
    this.vistaRegistrarDatos.open(PedidoHoraExtraComponent, { width: '900px' }).afterClosed().subscribe(items => {
      this.ObtenerlistaHorasExtrasEmpleado();
    });
  }

  CancelarHoraExtra(h) {
    this.vistaRegistrarDatos.open(CancelarHoraExtraComponent, {width: '300px', data: h.id}).afterClosed().subscribe(items => {
      console.log(items);
      if (items === true) {
        this.ObtenerlistaHorasExtrasEmpleado();
      }
    });
  }
  
  EditarHoraExtra(h) {
    this.vistaRegistrarDatos.open(EditarHoraExtraEmpleadoComponent, {width: '900px', data: h}).afterClosed().subscribe(items => {
      console.log(items);
      if (items === true) {
        this.ObtenerlistaHorasExtrasEmpleado();
      }
    });
  }

}
