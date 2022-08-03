//LLAMADO A LAS LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A LOS COMPONENTES
import { EditarSolicitudComidaComponent } from '../../../planificacionComidas/editar-solicitud-comida/editar-solicitud-comida.component';
import { SolicitaComidaComponent } from '../../../planificacionComidas/solicita-comida/solicita-comida.component';

// LLAMADO A LOS SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { CancelarComidaComponent } from '../cancelar-comida/cancelar-comida.component';

@Component({
  selector: 'app-planificacion-comidas-empleado',
  templateUrl: './planificacion-comidas-empleado.component.html',
  styleUrls: ['./planificacion-comidas-empleado.component.css']
})

export class PlanificacionComidasEmpleadoComponent implements OnInit {

  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN
  idEmpleado: string; // VARIABLE QUE ALMACENA ID DEL EMPLEADO QUE INICIA SESIÓN
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public restP: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS
    public ventana: MatDialog, // VARIABLE DE VENTANA DE DIÁLOGO
    public router: Router, // VARIABLE PARA NAVEGAR ENTRE PÁGINAS
    private informacion: DatosGeneralesService,

  ) {
    this.idEmpleado = localStorage.getItem('empleado');
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerListaComidas(parseInt(this.idEmpleado));
    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(datos => {
      this.actuales = datos;
    });
  }

  // MÉTODO PARA MOSTRAR DETERMINADO NÚMERO DE FILAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN 
  planComidas: any; // VARIABLE PARA ALMACENAR DATOS DE PLAN COMIDAS
  ObtenerListaComidas(id_empleado: number) {
    this.planComidas = [];
    this.restP.ObtenerPlanComidaPorIdEmpleado(id_empleado).subscribe(res => {
      this.planComidas = res;
      this.restP.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol => {
        this.planComidas = this.planComidas.concat(sol);

        console.log('ver lista de comidas ', this.planComidas)
      });
    }, error => {
      this.restP.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol2 => {
        this.planComidas = sol2;
        console.log('ver lista de comidas ', this.planComidas)
      });
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminar(datos: any) {
    console.log('datos comida ...', datos);
    this.ventana.open(CancelarComidaComponent, { width: '450px', data: datos }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.ObtenerListaComidas(parseInt(this.idEmpleado));
        } else {
          this.router.navigate(['/almuerzosEmpleado/']);
        }
      });
  }

  // VENTANA PARA INGRESAR SOLICITUD DE COMIDAS 
  AbrirVentanaSolicitar(): void {
    console.log(this.idEmpleado);
    this.ventana.open(SolicitaComidaComponent, {
      width: '1200px',
      data: { idEmpleado: this.idEmpleado, modo: 'solicitud' }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerListaComidas(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirVentanaEditar(datoSeleccionado): void {
    console.log(datoSeleccionado);
    this.VentanaEditar(datoSeleccionado, EditarSolicitudComidaComponent)
  }

  // VENTANA PARA ABRIR LA VENTANA DE SOLICITUD DE COMIDAS
  VentanaEditar(datoSeleccionado: any, componente: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerListaComidas(parseInt(this.idEmpleado));
      });
  }


}
