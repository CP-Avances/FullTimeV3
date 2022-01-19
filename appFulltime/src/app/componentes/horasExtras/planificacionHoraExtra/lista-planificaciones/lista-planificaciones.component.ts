import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';

import { EditarPlanHoraExtraComponent } from 'src/app/componentes/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-lista-planificaciones',
  templateUrl: './lista-planificaciones.component.html',
  styleUrls: ['./lista-planificaciones.component.css']
})

export class ListaPlanificacionesComponent implements OnInit {

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Arreglo de planificaciones
  listaPlan: any = [];

  constructor(
    public restP: PlanHoraExtraService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
    private validacionesService: ValidacionesService
  ) { }

  fecha: any;
  ngOnInit(): void {
    var f = moment();
    this.fecha = f.format('YYYY-MM-DD');
    this.listarPlanificaciones();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  listarPlanificaciones() {
    this.listaPlan = [];
    this.restP.ConsultarPlanificaciones().subscribe(response => {
      this.listaPlan = response;
    }, err => {
      this.toastr.info('No se ha encontrado registro de Planificación de Hora Extra', '', {
        timeOut: 10000,
      })
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  EditarPlanificacion(datosSeleccionado: any) {
    this.vistaRegistrarDatos.open(EditarPlanHoraExtraComponent, { width: '800px', data: { planifica: datosSeleccionado, actualizar: false } })
      .afterClosed().subscribe(item => {
        this.listarPlanificaciones();
      });
  }

}
