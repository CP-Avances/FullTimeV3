import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { RegistrarEmpleProcesoComponent } from 'src/app/componentes/empleadoProcesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { EditarEmpleadoProcesoComponent } from 'src/app/componentes/empleadoProcesos/editar-empleado-proceso/editar-empleado-proceso.component';

@Component({
  selector: 'app-procesos-empleado',
  templateUrl: './procesos-empleado.component.html',
  styleUrls: ['./procesos-empleado.component.css']
})
export class ProcesosEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idCargo: any = [];
  cont: number = 0;
  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService,
    public restCargo: EmplCargosService,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
    public router: Router,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** Método para mostrar datos de los procesos del empleado */
  buscarProcesos: any = [];
  empleadoProcesos: any = [];
  obtenerEmpleadoProcesos(id_empleado: number) {
    this.buscarProcesos = [];
    this.empleadoProcesos = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo Procesos", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restEmpleadoProcesos.ObtenerProcesoPorIdCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.buscarProcesos = datos;
          if (this.buscarProcesos.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.empleadoProcesos = datos
              this.cont++;
            }
            else {
              this.empleadoProcesos = this.empleadoProcesos.concat(datos);
              console.log("Datos procesos" + i + '', this.empleadoProcesos)
            }
          }
        })
      }
    });
  }

  /* Ventana para ingresar procesos del empleado */
  AbrirVentanaProcesos(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistrarEmpleProcesoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } }).afterClosed().subscribe(item => {
          this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }


  /** Función para eliminar registro seleccionado Planificación*/
  EliminarProceso(id_plan: number) {
    this.restEmpleadoProcesos.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDeleteProceso(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarProceso(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /* Ventana para editar procesos del empleado */
  AbrirVentanaEditarProceso(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarEmpleadoProcesoComponent,
      { width: '400px', data: { idEmpleado: this.idEmpleado, datosProcesos: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
      });
  }

}
