import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/empleadoPermisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { EditarPermisoEmpleadoComponent } from '../editar-permiso-empleado/editar-permiso-empleado.component';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { CancelarPermisoComponent } from '../cancelar-permiso/cancelar-permiso.component';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';

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

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url

  constructor(
    public restPermiso: PermisosService,
    public restPerV: PeriodoVacacionesService,
    public ventana: MatDialog,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private informacion: DatosGeneralesService,
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


  /** ******************************************************************************************** **
   ** **                             MÉTODO PARA MOSTRAR DATOS                                  ** **
   ** ******************************************************************************************** **/

  // MÉTODO PARA IMPRIMIR DATOS DEL PERMISO
  permisosTotales: any;
  obtenerPermisos(id_empleado: number) {
    this.permisosTotales = [];
    this.restPermiso.BuscarPermisoEmpleado(id_empleado).subscribe(datos => {
      this.permisosTotales = datos;
    }, err => {
      return this.validar.RedireccionarEstadisticas(err.error)
    });
  }

  // VENTANA PARA REGISTRAR PERMISOS DEL EMPLEADO 
  AbrirVentanaPermiso(): void {
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(actual => {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        this.ventana.open(RegistroEmpleadoPermisoComponent,
          {
            width: '1200px',
            data: {
              idEmpleado: this.idEmpleado, idContrato: actual[0].id_contrato,
              idPerVacacion: this.idPerVacacion[0].id, idCargo: actual[0].id_cargo
            }
          }).afterClosed().subscribe(item => {
            this.obtenerPermisos(parseInt(this.idEmpleado));
          });
      }, error => {
        this.toastr.info('El usuario no tiene registrado Periodo de Vacaciones.', '', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('Revisar que el usuario tenga un contrato y un cargo.', '', {
        timeOut: 6000,
      })
    });
  }

  CancelarPermiso(dataPermiso) {
    this.ventana.open(CancelarPermisoComponent,
      {
        width: '300px',
        data: { info: dataPermiso, id_empleado: parseInt(this.idEmpleado) }
      }).afterClosed().subscribe(items => {
        this.obtenerPermisos(parseInt(this.idEmpleado));
      });
  }

  EditarPermiso(permisos) {
    this.ventana.open(EditarPermisoEmpleadoComponent, {
      width: '1200px',
      data: { dataPermiso: permisos, id_empleado: parseInt(this.idEmpleado) }
    }).afterClosed().subscribe(items => {
      this.obtenerPermisos(parseInt(this.idEmpleado));
    });
  }
}
