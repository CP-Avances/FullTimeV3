import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from 'src/app/servicios/catalogos/catNotificaciones/notificaciones.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-suc-lista-noti',
  templateUrl: './suc-lista-noti.component.html',
  styleUrls: ['./suc-lista-noti.component.css']
})
export class SucListaNotiComponent implements OnInit {

  datos: any = [];

  // items de paginacion de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private restN: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.restN.ObtenerInformacionRest().subscribe(res => {
      this.datos = res;
      console.log(res);
    })
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

}
