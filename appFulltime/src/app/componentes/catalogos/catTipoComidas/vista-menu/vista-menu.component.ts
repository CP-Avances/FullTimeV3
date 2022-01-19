import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EditarTipoComidasComponent } from '../editar-tipo-comidas/editar-tipo-comidas.component';
import { DetalleMenuComponent } from '../detalle-menu/detalle-menu.component';
import { EditarDetalleMenuComponent } from '../editar-detalle-menu/editar-detalle-menu.component';

@Component({
  selector: 'app-vista-menu',
  templateUrl: './vista-menu.component.html',
  styleUrls: ['./vista-menu.component.css']
})

export class VistaMenuComponent implements OnInit {

  idMenu: string;
  datosMenu: any = [];
  datosDetalle: any = [];

  // items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    private rest: TipoComidasService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idMenu = aux[2];
  }

  ngOnInit(): void {
    this.BuscarDatosMenu(this.idMenu);
    this.ListarDetalles(this.idMenu);
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  BuscarDatosMenu(id_menu: any) {
    this.datosMenu = [];
    this.rest.ConsultarUnMenu(id_menu).subscribe(data => {
      this.datosMenu = data;
      console.log('menu', this.datosMenu)
    })
  }

  ListarDetalles(id_menu: any) {
    this.datosDetalle = [];
    this.rest.ConsultarUnDetalleMenu(id_menu).subscribe(datos => {
      this.datosDetalle = datos;
      console.log('detalles', this.datosDetalle)
    })
  }

  AbrirVentanaDetalles(datosSeleccionados): void {
    this.vistaRegistrarDatos.open(DetalleMenuComponent,
      { width: '350px', data: { menu: datosSeleccionados } })
      .afterClosed().subscribe(item => {
        this.BuscarDatosMenu(this.idMenu);
        this.ListarDetalles(this.idMenu);
      });
  }

  AbrirVentanaEditar(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarTipoComidasComponent, { width: '350px', data: datosSeleccionados })
      .afterClosed().subscribe(items => {
        this.BuscarDatosMenu(this.idMenu);
        this.ListarDetalles(this.idMenu);
      });
  }

  AbrirVentanaEditarDetalle(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarDetalleMenuComponent,
      { width: '350px', data: datosSeleccionados }).afterClosed().subscribe(item => {
        this.BuscarDatosMenu(this.idMenu);
        this.ListarDetalles(this.idMenu);
      });
  }

  /** Función para eliminar registro seleccionado Planificación*/
  EliminarDetalle(id_detalle: number) {
    this.rest.EliminarDetalleMenu(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.BuscarDatosMenu(this.idMenu);
      this.ListarDetalles(this.idMenu);
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id_detalle);
        } else {
          this.router.navigate(['/verHorario/', this.idMenu]);
        }
      });
  }

}
