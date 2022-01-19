import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { EditarHorasExtrasComponent } from 'src/app/componentes/catalogos/catHorasExtras/editar-horas-extras/editar-horas-extras.component';
import { HorasExtrasService } from 'src/app/servicios/catalogos/catHorasExtras/horas-extras.service'
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-ver-horas-extras',
  templateUrl: './ver-horas-extras.component.html',
  styleUrls: ['./ver-horas-extras.component.css']
})
export class VerHorasExtrasComponent implements OnInit {

  idHora: string;
  datosHoraExtra: any = [];
  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: HorasExtrasService,
    private validacionesService: ValidacionesService
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idHora = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosHoraExtra();
  }

  CargarDatosHoraExtra() {
    this.datosHoraExtra = [];
    this.rest.ObtenerUnaHoraExtra(parseInt(this.idHora)).subscribe(datos => {
      this.datosHoraExtra = datos;
      if (this.datosHoraExtra[0].tipo_descuento === 1) {
        this.datosHoraExtra[0].tipo_descuento = 'Horas Extras';
      }
      else {
        this.datosHoraExtra[0].tipo_descuento = 'Recargo Nocturno';
      }
      if (this.datosHoraExtra[0].hora_jornada === 1) {
        this.datosHoraExtra[0].hora_jornada = 'Matutina';
      }
      else if (this.datosHoraExtra[0].hora_jornada === 2) {
        this.datosHoraExtra[0].hora_jornada = 'Vespertina';
      }
      else if (this.datosHoraExtra[0].hora_jornada === 3){
        this.datosHoraExtra[0].hora_jornada = 'Nocturna';
      }
      if (this.datosHoraExtra[0].tipo_dia === 1) {
        this.datosHoraExtra[0].tipo_dia = 'Libre';
      }
      else if (this.datosHoraExtra[0].tipo_dia === 2) {
        this.datosHoraExtra[0].tipo_dia = 'Feriado';
      }
      else {
        this.datosHoraExtra[0].tipo_dia = 'Normal';
      }
      console.log(this.datosHoraExtra)
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    })
  }

  /* Ventana para editar datos de hora extra seleccionado */
  EditarDatos(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarHorasExtrasComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosHoraExtra();
      });
  }


}
