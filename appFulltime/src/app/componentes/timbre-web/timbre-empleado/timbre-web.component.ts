// IMPORTAR LIBRERIAS
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

// IMPORTAR COMPONENTES
import { RegistrarTimbreComponent } from '../registrar-timbre/registrar-timbre.component';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-timbre-web',
  templateUrl: './timbre-web.component.html',
  styleUrls: ['./timbre-web.component.css']
})

export class TimbreWebComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  timbres: any = [];
  cuenta: any = [];
  info: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE TABLAS
  dataSource: any;
  filtroFechaTimbre = '';
  idEmpleado: number;

  constructor(
    private validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private restTimbres: TimbresService, // SERVICIOS DATOS TIMBRES
    private toastr: ToastrService, // VARIABLE USADA PARA NOTIFICACIONES
    private ventana: MatDialog, // VARIABLE USADA PARA NAVEGACIÓN ENTRE VENTANAS
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerListaTimbres();
  }

  // MÉTODO DE MANEJO DE PÁGINAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA MOSTRAR DATOS DE TIMBRES
  ObtenerListaTimbres() {
    this.restTimbres.ObtenerTimbres().subscribe(res => {
      this.dataSource = new MatTableDataSource(res.timbres);
      this.timbres = this.dataSource.data;
      this.cuenta = res.cuenta;
      this.info = res.info;
    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // MÉTODO PARA REGISTRAR TIMBRES
  AbrirRegistrarTimbre() {
    this.ventana.open(RegistrarTimbreComponent, { width: '500px' }).afterClosed().subscribe(data => {
      if (data !== undefined) {
        if (!data.close) {
          this.restTimbres.PostTimbreWeb(data).subscribe(res => {
            // MÉTODO PARA AUDITAR TIMBRES
            data.id_empleado = this.idEmpleado;
            this.validar.Auditar('app-web', 'timbres', '', data, 'INSERT');
            this.ObtenerListaTimbres();
            this.toastr.success(res.message)
          }, err => {
            this.toastr.error(err.message)
          })
        }
      }
    })
  }

  // MÉTODO PARA REALIZAR FILTROS DE BÚSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroFechaTimbre = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // MÉTODO PARA ABRIR PÁGINA GOOGLE MAPAS
  abrirMapa(latitud, longitud) {
    if (!latitud || !longitud) return this.toastr.warning('Timbre seleccionado no posee registro de coordenadas de ubicación.')
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }
}
