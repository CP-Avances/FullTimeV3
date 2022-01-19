import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { EditarRegimenComponent } from 'src/app/componentes/catalogos/catRegimen/editar-regimen/editar-regimen.component';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service'

@Component({
  selector: 'app-ver-regimen',
  templateUrl: './ver-regimen.component.html',
  styleUrls: ['./ver-regimen.component.css']
})
export class VerRegimenComponent implements OnInit {

  idRegimen: string;
  datosRegimen: any = [];
  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: RegimenService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idRegimen = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosRegimen();
  }

  CargarDatosRegimen() {
    this.datosRegimen = [];
    this.rest.ConsultarUnRegimen(parseInt(this.idRegimen)).subscribe(datos => {
      this.datosRegimen = datos;
    })
  }

  /* Ventana para editar datos de régimen seleccionado */
  EditarDatosRegimen(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarRegimenComponent, { width: '900px', data: { datosRegimen: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(item => {
        this.CargarDatosRegimen();
      });
  }

}
