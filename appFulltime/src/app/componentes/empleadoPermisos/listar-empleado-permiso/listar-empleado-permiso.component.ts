import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { AutorizacionesComponent } from 'src/app/componentes/autorizaciones/autorizaciones/autorizaciones.component';
import { EditarPermisoEmpleadoComponent } from '../../rolEmpleado/solicitar-permisos-empleado/editar-permiso-empleado/editar-permiso-empleado.component';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';

export interface PermisosElemento {
  apellido: string;
  cedula: string;
  descripcion: string;
  docu_nombre: string;
  documento: string;
  estado: number;
  fec_creacion: string;
  fec_final: string;
  fec_inicio: string;
  id: number;
  id_contrato: number;
  id_emple_solicita: number;
  nom_permiso: string;
  nombre: string,
  id_empl_cargo: number,
}

@Component({
  selector: 'app-listar-empleado-permiso',
  templateUrl: './listar-empleado-permiso.component.html',
  styleUrls: ['./listar-empleado-permiso.component.css']
})

export class ListarEmpleadoPermisoComponent implements OnInit {

  permisos: any = [];

  selectionUno = new SelectionModel<PermisosElemento>(true, []);

  // Visibilizar lista de permisos autorizados
  lista_autorizados: boolean = false;
  lista_permisos: boolean = false;

  // Habilitar o Deshabilitar el icono de autorización individual
  auto_individual: boolean = true;

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Items de paginación de la tabla autorizados
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;
  pageSizeOptions_autorizado = [5, 10, 20, 50];

  constructor(
    private restP: PermisosService,
    public restEmpleado: EmpleadoService,
    private vistaFlotante: MatDialog,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.obtenerPermisos();
    this.ObtenerPermisosAutorizados();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  obtenerPermisos() {
    this.restP.obtenerAllPermisos().subscribe(res => {
      this.permisos = res;
      console.log('permisos', this.permisos)
      for (var i = 0; i <= this.permisos.length - 1; i++) {
        if (this.permisos[i].estado === 1) {
          this.permisos[i].estado = 'Pendiente';
        }
        else if (this.permisos[i].estado === 2) {
          this.permisos[i].estado = 'Pre-autorizado';
        }
      }
      if (this.permisos.length != 0) {
        this.lista_permisos = true;
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }
  permisosTotales: any;
  EditarPermiso(id, id_empl) {
    /* Método para imprimir datos del permiso */
    this.permisosTotales = [];
    this.restP.ObtenerUnPermisoEditar(id).subscribe(datos => {
      this.permisosTotales = datos;
      this.vistaFlotante.open(EditarPermisoEmpleadoComponent, {
        width: '1200px',
        data: { dataPermiso: this.permisosTotales[0], id_empleado: parseInt(id_empl) }
      }).afterClosed().subscribe(items => {
        this.obtenerPermisos();
        this.ObtenerPermisosAutorizados();
      });
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    })

  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.permisos.length;
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.permisos.forEach(row => this.selectionUno.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabel(row?: PermisosElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  AutorizarPermisosMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido,
        id_contrato: obj.id_contrato,
        id_emple_solicita: obj.id_emple_solicita,
        id_cargo: obj.id_empl_cargo,
        estado: obj.estado,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // Autorización de permisos
  AbrirAutorizaciones(datos_permiso, forma: string) {
    this.vistaFlotante.open(AutorizacionesComponent,
      { width: '600px', data: { datosPermiso: datos_permiso, carga: forma } }).afterClosed().subscribe(items => {
        window.location.reload();
        this.obtenerPermisos();
        this.ObtenerPermisosAutorizados();
      });
  }

  // Lista de permisos que han sido autorizados o negados

  ManejarPaginaAutorizados(e: PageEvent) {
    this.tamanio_pagina_autorizado = e.pageSize;
    this.numero_pagina_autorizado = e.pageIndex + 1;
  }

  permisosAutorizados: any = [];
  ObtenerPermisosAutorizados() {
    this.restP.BuscarPermisosAutorizados().subscribe(res => {
      this.permisosAutorizados = res;
      for (var i = 0; i <= this.permisosAutorizados.length - 1; i++) {
        if (this.permisosAutorizados[i].estado === 3) {
          this.permisosAutorizados[i].estado = 'Autorizado';
        }
        else if (this.permisosAutorizados[i].estado === 4) {
          this.permisosAutorizados[i].estado = 'Negado';
        }
      }
      if (this.permisosAutorizados.length != 0) {
        this.lista_autorizados = true;
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

}
