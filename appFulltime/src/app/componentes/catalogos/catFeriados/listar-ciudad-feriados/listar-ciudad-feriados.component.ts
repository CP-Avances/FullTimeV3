import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { AsignarCiudadComponent } from 'src/app/componentes/catalogos/catFeriados/asignar-ciudad/asignar-ciudad.component';
import { EditarFeriadosComponent } from 'src/app/componentes/catalogos/catFeriados/editar-feriados/editar-feriados.component';
import { EditarCiudadComponent } from 'src/app/componentes/catalogos/catFeriados/editar-ciudad/editar-ciudad.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

@Component({
  selector: 'app-listar-ciudad-feriados',
  templateUrl: './listar-ciudad-feriados.component.html',
  styleUrls: ['./listar-ciudad-feriados.component.css']
})

export class ListarCiudadFeriadosComponent implements OnInit {

  idFeriado: string;
  datosFeriado: any = [];
  datosCiudades: any = [];

  // items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    private rest: FeriadosService,
    private restF: CiudadFeriadosService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idFeriado = aux[2];
  }

  ngOnInit(): void {
    this.BuscarDatosFeriado(this.idFeriado);
    this.ListarCiudadesFeriados(this.idFeriado);
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  BuscarDatosFeriado(idFeriado: any) {
    this.datosFeriado = [];
    this.rest.ConsultarUnFeriado(idFeriado).subscribe(data => {
      this.datosFeriado = data;
      for (let i = this.datosFeriado.length - 1; i >= 0; i--) {
        var cadena1 = this.datosFeriado[i]['fecha'];
        var aux1 = cadena1.split("T");
        this.datosFeriado[i]['fecha'] = aux1[0];
        if (this.datosFeriado[i]['fec_recuperacion'] != null) {
          var cadena2 = this.datosFeriado[i]['fec_recuperacion'];
          var aux2 = cadena2.split("T");
          this.datosFeriado[i]['fec_recuperacion'] = aux2[0];
        }
      }
    })
  }

  ListarCiudadesFeriados(idFeriado: any) {
    this.datosCiudades = [];
    this.restF.BuscarCiudadesFeriado(idFeriado).subscribe(datos => {
      this.datosCiudades = datos;
      console.log(this.datosCiudades)
    })
  }

  AbrirVentanaAsignarCiudad(datosSeleccionados): void {
    this.vistaRegistrarDatos.open(AsignarCiudadComponent, { width: '600px', data: { feriado: datosSeleccionados, actualizar: true } }).afterClosed().subscribe(items => {
      this.BuscarDatosFeriado(this.idFeriado);
      this.ListarCiudadesFeriados(this.idFeriado);
    });
  }

  AbrirVentanaEditarFeriado(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarFeriadosComponent, { width: '400px', data: { datosFeriado: datosSeleccionados, actualizar: true } }).disableClose = true;
    console.log(datosSeleccionados.fecha);
  }

  AbrirVentanaEditarCiudad(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarCiudadComponent,
      { width: '400px', data: datoSeleccionado })
      .afterClosed().subscribe(item => {
        this.ListarCiudadesFeriados(this.idFeriado);
      });
  }

  /** Función para eliminar registro seleccionado */
  Eliminar(id_ciudad_asignada: number) {
    this.restF.EliminarRegistro(id_ciudad_asignada).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ListarCiudadesFeriados(this.idFeriado);
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.idciudad_asignada);
        } else {
          this.router.navigate(['/verFeriados/', datos.idferiado]);
        }
      });
  }

}
