import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { RegistrarVacacionesComponent } from 'src/app/componentes/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { CancelarVacacionesComponent } from './cancelar-vacaciones/cancelar-vacaciones.component';
import { EditarVacacionesEmpleadoComponent } from './editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';

@Component({
  selector: 'app-vacaciones-empleado',
  templateUrl: './vacaciones-empleado.component.html',
  styleUrls: ['./vacaciones-empleado.component.css']
})
export class VacacionesEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idContrato: any = [];
  idCargo: any = [];
  idPerVacacion: any = [];
  cont: number;

  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restEmpleado: EmpleadoService,
    public restPerV: PeriodoVacacionesService,
    public restCargo: EmplCargosService,
    public vistaRegistrarDatos: MatDialog,
    public restVacaciones: VacacionesService,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.obtenerVacaciones(parseInt(this.idEmpleado));
    this.verEmpleado(parseInt(this.idEmpleado));
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** Método para ver la información del empleado */
  empleadoUno: any = [];
  verEmpleado(idemploy: any) {
    this.empleadoUno = [];
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoUno = data;
      this.obtenerPeriodoVacaciones();
    })
  }

  /* 
     * ***************************************************************************************************
     *                               MÉTODO PARA MOSTRAR DATOS
     * ***************************************************************************************************
    */

  vacaciones: any = [];
  obtenerVacaciones(id_empleado: number) {
    this.restPerV.BuscarIDPerVacaciones(id_empleado).subscribe(datos => {
      this.idPerVacacion = datos;
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
        console.log('datos', this.vacaciones)
      });
    });
  }

  /* Método para imprimir datos del periodo de vacaciones */
  peridoVacaciones: any;
  obtenerPeriodoVacaciones() {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;
    })
  }

  /* 
  ****************************************************************************************************
  *                               ABRIR VENTANAS DE SOLICITUDES
  ****************************************************************************************************
  */

  /* Ventana para registrar vacaciones del empleado */
  AbrirVentanaVacaciones(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        this.vistaRegistrarDatos.open(RegistrarVacacionesComponent,
          { width: '900px', data: { idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion[0].id, idContrato: this.idPerVacacion[0].idcontrato, idCargo: this.idCargo[0].max } })
          .afterClosed().subscribe(item => {
            this.obtenerVacaciones(parseInt(this.idEmpleado));
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones', 'Primero Registrar Periodo de Vacaciones', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  CancelarVacaciones(v) {
    this.vistaRegistrarDatos.open(CancelarVacacionesComponent, { width: '300px', data: v.id }).afterClosed().subscribe(items => {
      this.obtenerVacaciones(parseInt(this.idEmpleado));
    });
  }

  EditarVacaciones(v) {
    this.vistaRegistrarDatos.open(EditarVacacionesEmpleadoComponent, { width: '900px', data: v }).afterClosed().subscribe(items => {
      this.obtenerVacaciones(parseInt(this.idEmpleado));
    });
  }

}
