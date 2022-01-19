import { Component, OnInit } from '@angular/core';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {

  // items de paginacion de la tabla
  tamanio_pagina: number = 10;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  notificaciones: any = [];

  constructor(
    private realtime: RealTimeService
  ) { }

  ngOnInit(): void {
    let id_empleado = localStorage.getItem("empleado");
    this.realtime.ObtenerNotificacionesAllReceives(parseInt(id_empleado)).subscribe(res => {
      console.log('notificaciones', res);
      this.notificaciones = res;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  CambiarVistaNotificacion(id_realtime: number) {
    this.realtime.PutVistaNotificacion(id_realtime).subscribe(res => {
      console.log(res);
    });
  }

}
