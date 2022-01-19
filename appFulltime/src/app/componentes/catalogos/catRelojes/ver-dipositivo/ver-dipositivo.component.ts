import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { EditarRelojComponent } from 'src/app/componentes/catalogos/catRelojes/editar-reloj/editar-reloj.component';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service'

@Component({
  selector: 'app-ver-dipositivo',
  templateUrl: './ver-dipositivo.component.html',
  styleUrls: ['./ver-dipositivo.component.css']
})
export class VerDipositivoComponent implements OnInit {

  idReloj: string;
  datosReloj: any = [];
  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: RelojesService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idReloj = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosReloj();
  }

  CargarDatosReloj() {
    this.datosReloj = [];
    this.rest.ConsultarDatosId(parseInt(this.idReloj)).subscribe(datos => {
      this.datosReloj = datos;
    })
  }

  /* Ventana para editar datos de dispositivo seleccionado */
  EditarDatosReloj(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarRelojComponent, { width: '1200px', data: { datosReloj: datosSeleccionados, actualizar: false } })
      .afterClosed().subscribe(item => {
        this.CargarDatosReloj();
      });
  }

}
