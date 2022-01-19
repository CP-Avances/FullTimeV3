import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';

import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/empleadoPermisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { CancelarPermisoComponent } from './cancelar-permiso/cancelar-permiso.component';
import { EditarPermisoEmpleadoComponent } from './editar-permiso-empleado/editar-permiso-empleado.component';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-solicitar-permisos-empleado',
  templateUrl: './solicitar-permisos-empleado.component.html',
  styleUrls: ['./solicitar-permisos-empleado.component.css']
})
export class SolicitarPermisosEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idContrato: any = [];
  idPerVacacion: any = [];
  idCargo: any = [];
  cont: number;

  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url

  constructor(
    public restEmpleado: EmpleadoService,
    public restPerV: PeriodoVacacionesService,
    public vistaRegistrarDatos: MatDialog,
    public restPermiso: PermisosService,
    public restCargo: EmplCargosService,
    private toastr: ToastrService,
    private validacionesService: ValidacionesService
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.obtenerPermisos(parseInt(this.idEmpleado));
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /* 
   * ***************************************************************************************************
   *                               MÉTODO PARA MOSTRAR DATOS
   * ***************************************************************************************************
  */

  /* Método para imprimir datos del permiso */
  permisosTotales: any;
  obtenerPermisos(id_empleado: number) {
    this.permisosTotales = [];
    this.restEmpleado.getOneEmpleadoRest(id_empleado).subscribe(datos => {
      this.restPermiso.BuscarPermisoCodigo(datos[0].codigo).subscribe(datos => {
        this.permisosTotales = datos;
      }, err => {
        return this.validacionesService.RedireccionarEstadisticas(err.error) 
      })
    });
  }

  /* Ventana para registrar permisos del empleado */
  AbrirVentanaPermiso(): void {
    this.restEmpleado.BuscarIDContrato(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;

      this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idCargo = datos;

        this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
          this.idPerVacacion = datos;

          this.vistaRegistrarDatos.open(RegistroEmpleadoPermisoComponent,
            {
              width: '1200px',
              data: { idEmpleado: this.idEmpleado, idContrato: this.idContrato[this.idContrato.length - 1].id, idPerVacacion: this.idPerVacacion[0].id, idCargo: this.idCargo[0].max }
            }).afterClosed().subscribe(item => {
              this.obtenerPermisos(parseInt(this.idEmpleado));
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

  CancelarPermiso(dataPermiso) {
    this.vistaRegistrarDatos.open(CancelarPermisoComponent, { width: '300px', data: dataPermiso }).afterClosed().subscribe(items => {
      if (items === true) {
        this.obtenerPermisos(parseInt(this.idEmpleado));
      }
    });
  }

  EditarPermiso(permisos) {
    this.vistaRegistrarDatos.open(EditarPermisoEmpleadoComponent, {
      width: '1200px',
      data: { dataPermiso: permisos, id_empleado: parseInt(this.idEmpleado) }
    }).afterClosed().subscribe(items => {
      if (items === true) {
        this.obtenerPermisos(parseInt(this.idEmpleado));
      }
    });
  }
}
