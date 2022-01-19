import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';

import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { MatDialog } from '@angular/material/dialog';
import { VacacionAutorizacionesComponent } from '../../autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { EditarVacacionesEmpleadoComponent } from '../../rolEmpleado/vacaciones-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';

export interface VacacionesElemento {
  apellido: string;
  dia_laborable: number;
  dia_libre: number;
  estado: string;
  fec_final: string;
  fec_ingreso: string;
  fec_inicio: string;
  id: number;
  id_peri_vacacion: number;
  id_empl_solicita: number;
  nombre: string,
  id_empl_cargo: number,
  legalizado: boolean
}

@Component({
  selector: 'app-listar-vacaciones',
  templateUrl: './listar-vacaciones.component.html',
  styleUrls: ['./listar-vacaciones.component.css']
})
export class ListarVacacionesComponent implements OnInit {

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  vacaciones: any = [];

  // Habilitar listas según los datos
  lista_vacaciones: boolean = false;
  lista_autoriza: boolean = false;

  // Habilitar iconos de autorizacion individual
  auto_individual: boolean = true;

  // Items de paginación de lista autorizados
  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];

  vacaciones_autorizadas: any = [];

  constructor(
    private restV: VacacionesService,
    private vistaFlotante: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ObtenerListaVacaciones();
    this.ObtenerListaVacacionesAutorizadas();
  }

  ObtenerListaVacaciones() {
    this.restV.ObtenerListaVacaciones().subscribe(res => {
      this.vacaciones = res;
      for (var i = 0; i <= this.vacaciones.length - 1; i++) {
        if (this.vacaciones[i].estado === 1) {
          this.vacaciones[i].estado = 'Pendiente';
        }
        else if (this.vacaciones[i].estado === 2) {
          this.vacaciones[i].estado = 'Pre-autorizado';
        }
        else if (this.vacaciones[i].estado === 3) {
          this.vacaciones[i].estado = 'Autorizado';
        }
        else if (this.vacaciones[i].estado === 4) {
          this.vacaciones[i].estado = 'Negado';
        }
      }
      if (this.vacaciones.length != 0) {
        this.lista_vacaciones = true;
      } else {
        this.lista_vacaciones = false;
      }
      console.log(res);
    });
  }

  ObtenerListaVacacionesAutorizadas() {
    this.restV.ObtenerListaVacacionesAutorizadas().subscribe(res => {
      this.vacaciones_autorizadas = res;
      for (var i = 0; i <= this.vacaciones_autorizadas.length - 1; i++) {
        if (this.vacaciones_autorizadas[i].estado === 1) {
          this.vacaciones_autorizadas[i].estado = 'Pendiente';
        }
        else if (this.vacaciones_autorizadas[i].estado === 2) {
          this.vacaciones_autorizadas[i].estado = 'Pre-autorizado';
        }
        else if (this.vacaciones_autorizadas[i].estado === 3) {
          this.vacaciones_autorizadas[i].estado = 'Autorizado';
        }
        else if (this.vacaciones_autorizadas[i].estado === 4) {
          this.vacaciones_autorizadas[i].estado = 'Negado';
        }
      }
      if (this.vacaciones_autorizadas.length != 0) {
        this.lista_autoriza = true;
      } else {
        this.lista_autoriza = false;
      }
      console.log(res);
    });
  }

  // Evento paginación lista vacaciones
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  selectionUno = new SelectionModel<VacacionesElemento>(true, []);
  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.vacaciones.length;
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.vacaciones.forEach(row => this.selectionUno.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabel(row?: VacacionesElemento): string {
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

  AutorizarVacacionesMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido,
        id_emple_solicita: obj.id_empl_solicita,
        id_cargo: obj.id_empl_cargo,
        estado: obj.estado,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // Autorización de vacaciones
  AbrirAutorizaciones(datos_vacacion, forma: string) {
    this.vistaFlotante.open(VacacionAutorizacionesComponent,
      { width: '600px', data: { datosVacacion: datos_vacacion, carga: forma } }).afterClosed().subscribe(items => {
        window.location.reload();
      });
  }

  // Evento paginación lista vacaciones_autorizadas
  ManejarPaginaAutorizadas(e: PageEvent) {
    this.tamanio_pagina_auto = e.pageSize;
    this.numero_pagina_auto = e.pageIndex + 1;
  }

  vacaciones_lista: any = [];
  EditarVacaciones(id) {
    this.restV.ListarUnaVacacion(id).subscribe(res => {
      this.vacaciones_lista = res;
      this.vistaFlotante.open(EditarVacacionesEmpleadoComponent,
        { width: '900px', data: this.vacaciones_lista[0] }).afterClosed().subscribe(items => {
          this.ObtenerListaVacaciones();
          this.ObtenerListaVacacionesAutorizadas();
        });
    });
  }

}
