import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

import { EditarVacacionesEmpleadoComponent } from '../editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { RegistrarVacacionesComponent } from 'src/app/componentes/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { CancelarVacacionesComponent } from '../cancelar-vacaciones/cancelar-vacaciones.component';

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

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public restVacaciones: VacacionesService,
    public restEmpleado: EmpleadoService,
    public restCargo: EmplCargosService,
    public restPerV: PeriodoVacacionesService,
    public ventana: MatDialog,
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

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO  
  empleadoUno: any = [];
  verEmpleado(idemploy: any) {
    this.empleadoUno = [];
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoUno = data;
      this.obtenerPeriodoVacaciones();
    })
  }

  /** ************************************************************************************************ **
   ** **                              MÉTODO PARA MOSTRAR DATOS                                     ** **
   ** ************************************************************************************************ **/

  vacaciones: any = [];
  obtenerVacaciones(id_empleado: number) {
    this.vacaciones = [];
    this.restPerV.BuscarIDPerVacaciones(id_empleado).subscribe(datos => {
      this.idPerVacacion = datos;
      console.log('datos', datos)
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
        console.log('datos', this.vacaciones)
      });
    });
  }

  // MÉTODO PARA IMPRIMIR DATOS DEL PERIODO DE VACACIONES 
  peridoVacaciones: any;
  obtenerPeriodoVacaciones() {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;
    })
  }

  /** ********************************************************************************************** **
   ** **                              ABRIR VENTANAS DE SOLICITUDES                               ** **
   ** ********************************************************************************************** **/

  // VENTANA PARA REGISTRAR VACACIONES DEL EMPLEADO 
  AbrirVentanaVacaciones(): void {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      console.log("idContrato ", this.idContrato[0].max)
      this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idCargo = datos;
        this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
          this.idPerVacacion = datos;
          this.ventana.open(RegistrarVacacionesComponent,
            { width: '900px', data: { idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion[0].id, idContrato: this.idPerVacacion[0].idcontrato, idCargo: this.idCargo[0].max, idContratoActual: this.idContrato[0].max } })
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
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

  CancelarVacaciones(v) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(contrato => {
      this.ventana.open(CancelarVacacionesComponent,
        {
          width: '300px',
          data: { id: v.id, id_empleado: parseInt(this.idEmpleado), id_contrato: contrato[0].max }
        })
        .afterClosed().subscribe(items => {
          this.obtenerVacaciones(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

  EditarVacaciones(v) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(contrato => {
      this.ventana.open(EditarVacacionesEmpleadoComponent,
        {
          width: '900px',
          data: { info: v, id_empleado: parseInt(this.idEmpleado), id_contrato: contrato[0].max }
        })
        .afterClosed().subscribe(items => {
          this.obtenerVacaciones(parseInt(this.idEmpleado));
          this.verEmpleado(parseInt(this.idEmpleado))
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

}
