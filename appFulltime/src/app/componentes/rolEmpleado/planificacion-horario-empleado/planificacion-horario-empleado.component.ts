import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';

import { RegistroPlanHorarioComponent } from 'src/app/componentes/planHorarios/registro-plan-horario/registro-plan-horario.component';
import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/detallePlanHorarios/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { EditarPlanificacionComponent } from 'src/app/componentes/planHorarios/editar-planificacion/editar-planificacion.component';


@Component({
  selector: 'app-planificacion-horario-empleado',
  templateUrl: './planificacion-horario-empleado.component.html',
  styleUrls: ['./planificacion-horario-empleado.component.css']
})

export class PlanificacionHorarioEmpleadoComponent implements OnInit {


  idEmpleado: string;
  empleadoUno: any = [];
  idCargo: any = [];
  cont: number;

  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restEmpleado: EmpleadoService,
    public restCargo: EmplCargosService,
    public restPlanH: PlanHorarioService,
    public vistaRegistrarDatos: MatDialog,
    public restPlanHoraDetalle: DetallePlanHorarioService,
    private toastr: ToastrService,
    public router: Router,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.verEmpleado(this.idEmpleado);
    this.obtenerPlanHorarios(parseInt(this.idEmpleado));
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  verEmpleado(idemploy: any) {
    this.empleadoUno = [];
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoUno = data;
    })
  }

  /** Método para imprimir datos de la planificación de horarios */
  planHorario: any;
  planHorarioTotales: any;
  obtenerPlanHorarios(id_empleado: number) {
    this.planHorario = [];
    this.planHorarioTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      //console.log("idCargo Procesos", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restPlanH.ObtenerPlanHorarioPorIdCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.planHorario = datos;
          if (this.planHorario.length != 0) {
            if (this.cont === 0) {
              this.planHorarioTotales = datos
              this.cont++;
            }
            else {
              this.planHorarioTotales = this.planHorarioTotales.concat(datos);
              console.log("Datos plan horario" + i + '', this.planHorarioTotales)
            }
          }
        })
      }
    });
  }

  /* Ventana para registrar planificación de horarios del empleado */
  AbrirVentanaPlanHorario(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistroPlanHorarioComponent,
        { width: '300px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } })
        .afterClosed().subscribe(item => {
          this.obtenerPlanHorarios(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  /* Ventana para registrar detalle de horario del empleado*/
  AbrirVentanaDetallePlanHorario(datos: any): void {
    this.vistaRegistrarDatos.open(RegistroDetallePlanHorarioComponent,
      { width: '350px', data: { idEmpleado: this.idEmpleado, planHorario: datos, actualizarPage: false, direccionarE: true } }).disableClose = true;
  }

  /** Función para eliminar registro seleccionado Planificación*/
  EliminarPlanificacion(id_plan: number) {
    this.restPlanH.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.obtenerPlanHorarios(parseInt(this.idEmpleado));
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDeletePlanificacion(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanificacion(datos.id);
        } else {
          this.router.navigate(['/planificacionHorario']);
        }
      });
  }

  /* Ventana para registrar horario */
  AbrirEditarPlanificacion(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarPlanificacionComponent,
      { width: '300px', data: { idEmpleado: this.idEmpleado, datosPlan: datoSeleccionado } }).afterClosed().subscribe(item => {
        this.obtenerPlanHorarios(parseInt(this.idEmpleado));
      });
  }

}
