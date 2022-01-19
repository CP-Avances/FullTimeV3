import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { EditarTipoPermisosComponent } from 'src/app/componentes/catalogos/catTipoPermisos/editar-tipo-permisos/editar-tipo-permisos.component';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service'

@Component({
  selector: 'app-ver-tipo-permiso',
  templateUrl: './ver-tipo-permiso.component.html',
  styleUrls: ['./ver-tipo-permiso.component.css']
})

export class VerTipoPermisoComponent implements OnInit {

  idPermiso: string;
  datosPermiso: any = [];
  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: TipoPermisosService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idPermiso = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosPermiso();
  }

  CargarDatosPermiso() {
    this.datosPermiso = [];
    this.rest.getOneTipoPermisoRest(parseInt(this.idPermiso)).subscribe(datos => {
      this.datosPermiso = datos;
    })
  }

  /* Ventana para editar datos de dispositivo seleccionado */
  EditarDatosPermiso(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarTipoPermisosComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosPermiso();
      });
  }

}
