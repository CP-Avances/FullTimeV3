// LLAMADO DE LIBRERIAS
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';

// LLAMADO A COMPONENTES
import { AutorizaSolicitudComponent } from '../autoriza-solicitud/autoriza-solicitud.component';

// LLAMADO A SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { EditarSolicitudComidaComponent } from '../editar-solicitud-comida/editar-solicitud-comida.component';

// EXPORTACIÓN DE DATOS A SER LEIDOS EN COMPONENTE DE AUTORIZACIÓN
export interface SolicitudElemento {
  nombre_servicio: string;
  nombre_plato: string;
  hora_inicio: string;
  id_empleado: number;
  nombre_menu: string;
  fec_comida: string;
  aprobada: boolean;
  apellido: string;
  hora_fin: string;
  nombre: string;
  cedula: string;
  codigo: number;
  id: number;
}

@Component({
  selector: 'app-listar-solicitud',
  templateUrl: './listar-solicitud.component.html',
  styleUrls: ['./listar-solicitud.component.css']
})

export class ListarSolicitudComponent implements OnInit {
  // VARIABLE PARA GUARDAR DATOS DE SOLICITUDES PENDIENTES
  solicitudes: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE SOLICITUDES PENDIENTES
  selectionUno = new SelectionModel<SolicitudElemento>(true, []);

  // VARIABLES PARA MOSTRAR U OCULTAR LISTAS DE SOLIICTUDES
  lista_autorizados: boolean = false; // LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  lista_solicitados: boolean = false; // LISTA DE SOLICITUDES PENDIENTES
  lista_expirados: boolean = false; // LISTA DE SOLICITUDES EXPIRADAS

  // VARIABLE PARA MOSTRAR U OCULTAR ÍCONO DE AUTORIZACIÓN INDIVIDUAL
  auto_individual: boolean = true; // ÍCONO LISTA DE SOLICITUDES PENDIENTES

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LISTA DE SOLICITUDES PENDIENTES
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LA LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  pageSizeOptions_autorizado = [5, 10, 20, 50];
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LA LISTA DE SOLICITUDES EXPIRADAS
  pageSizeOptions_expirada = [5, 10, 20, 50];
  tamanio_pagina_expirada: number = 5;
  numero_pagina_expirada: number = 1;

  constructor(
    public restEmpleado: EmpleadoService, // SERVICIO DATOS EMPLEADO
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    private vistaFlotante: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
  ) { }

  ngOnInit(): void {
    this.ObtenerSolicitudesAutorizados(); // LISTA DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
    this.ObtenerSolicitudesExpiradas(); // LISTA DE DATOS DE SOLIICTUDES EXPIRADAS
    this.ObtenerSolicitudes(); // LISTA DE SOLICITUDES PENDIENTES
  }

  /** ********************************************************************************************* */
  /**                MÉTODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES PENDIENTES                  */
  /** ********************************************************************************************* */

  // MÉTODO PARA MOSTRAR UN DETERMINADO NÚMERO DE FILAS EN LA TABLA DE SOLICITUDES PENDIENTES
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE SOLICITUDES PENDIENTES
  ObtenerSolicitudes() {
    this.restC.ObtenerSolComidaNegado().subscribe(res => {
      this.solicitudes = res;
      if (this.solicitudes.length != 0) {
        this.lista_solicitados = true;
      }
    });
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.solicitudes.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.solicitudes.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabel(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // MÉTODO PARA HABILITAR O DESHABILITAR EL BOTÓN AUTORIZAR MULTIPLE Y BOTÓN AUTORIZAR INDIVIDUAL RESPECTIVAMENTE
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

  // MÉTODO PARA LEER TODOS LOS DATOS SELECCIONADOS
  AutorizarSolicitudMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        empleado: obj.nombre + ' ' + obj.apellido,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        aprobada: obj.aprobada,
        fecha: obj.fec_comida,
        codigo: obj.codigo,
        id: obj.id,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  // MÉTODO PARA ABRIR VENTA DE AUTORIZACIÓN DE SOLICITUDES CON TODOS LOS DATOS SELECCIONADOS
  AbrirAutorizaciones(datos_solicitud, forma: string) {
    this.vistaFlotante.open(AutorizaSolicitudComponent,
      { width: '400px', data: { datosMultiple: datos_solicitud, carga: forma } })
      .afterClosed().subscribe(items => {
        this.ObtenerSolicitudesAutorizados();
        this.ObtenerSolicitudesExpiradas();
        this.ObtenerSolicitudes();
        this.btnCheckHabilitar_Estado = false;
        this.selectionUnoEstado.clear();
        this.btnCheckHabilitar = false;
        this.selectionUno.clear();
      });
  }

  // MÉTODO PARA ABRIR VENTANA DE EDICIÓN DE SOLICITUD
  VentanaEditarPlanComida(datoSeleccionado: any) {
    this.vistaFlotante.open(EditarSolicitudComidaComponent, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: 'administrador' }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerSolicitudesAutorizados();
        this.ObtenerSolicitudes();
      });
  }

  /** ********************************************************************************************* */
  /**      MÉTODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS                 */
  /** ********************************************************************************************* */

  // MÉTODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE SOLICITUDES AUTORIZADAS O NEGADAS
  ManejarPaginaAutorizados(e: PageEvent) {
    this.numero_pagina_autorizado = e.pageIndex + 1;
    this.tamanio_pagina_autorizado = e.pageSize;
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
  solicitudesAutorizados: any = []; // VARIABLE PARA GUARDAR DATOS DE SOLICITUDES AUTORIZADAS O NEGADAS
  ObtenerSolicitudesAutorizados() {
    this.restC.ObtenerSolComidaAprobado().subscribe(res => {
      this.solicitudesAutorizados = res;
      for (var i = 0; i <= this.solicitudesAutorizados.length - 1; i++) {
        if (this.solicitudesAutorizados[i].aprobada === true) {
          this.solicitudesAutorizados[i].aprobada = 'AUTORIZADO';
        }
        else if (this.solicitudesAutorizados[i].aprobada === false) {
          this.solicitudesAutorizados[i].aprobada = 'NEGADO';
        }
      }
      if (this.solicitudesAutorizados.length != 0) {
        this.lista_autorizados = true;
      }
    });
  }

  // VARIABLE PARA ALMACENAR DATOS SELECCIONADOS DE TABLA DE LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  selectionUnoEstado = new SelectionModel<SolicitudElemento>(true, []);

  //SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelectedEstado() {
    const numSelected = this.selectionUnoEstado.selected.length;
    const numRows = this.solicitudes.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggleEstado() {
    this.isAllSelectedEstado() ?
      this.selectionUnoEstado.clear() :
      this.solicitudes.forEach(row => this.selectionUnoEstado.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA.
  checkboxLabelEstado(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelectedEstado() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUnoEstado.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // MÉTODO PARA HABILITAR O DESHABILITAR EL ÍCONO DE AUTORIZACIÓN INDIVIDUAL SOLICITUDES APROBADAS O NEGADAS
  btnCheckHabilitar_Estado: boolean = false; // VARIABLE PARA MOSTRAR U OCULTAR BOTÓN DE AUTORIZACIÓN MÚLTIPLE
  auto_individual_estado: boolean = true; // VARIABLE PARA MOSTRAR U OCULTAR BOTÓN DE AUTORIZACIÓN INDIVIDUAL
  HabilitarSeleccionEstado() {
    if (this.btnCheckHabilitar_Estado === false) {
      this.btnCheckHabilitar_Estado = true;
      this.auto_individual_estado = false;
    } else if (this.btnCheckHabilitar_Estado === true) {
      this.btnCheckHabilitar_Estado = false;
      this.auto_individual_estado = true;
    }
  }

  // MÉTODO PARA LEER LOS DATOS TOMADOS DE LA LISTA DE SOLICITUDES AUTORIZADAS O NEGADAS
  AutorizarSolicitudMultipleEstado() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUnoEstado.selected.map(obj => {
      return {
        empleado: obj.nombre + ' ' + obj.apellido,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        aprobada: obj.aprobada,
        fecha: obj.fec_comida,
        codigo: obj.codigo,
        id: obj.id,
      }
    })
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }

  /** ********************************************************************************************* */
  /**                MÉTODOS USADOS PARA MANEJO DE DATOS DE SOLICITUDES EXPIRADAS                   */
  /** ********************************************************************************************* */

  // MÉTODO PARA MOSTRAR FILAS DETERMINADAS EN LA TABLA DE SOLICITUDES EXPIRADAS
  ManejarPaginaExpiradas(e: PageEvent) {
    this.numero_pagina_expirada = e.pageIndex + 1;
    this.tamanio_pagina_expirada = e.pageSize;
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE SOLICITUDES EXPIRADAS
  solicitudesExpiradas: any = []; // VARIABLE PARA ALMACENAR DATOS DE SOLIICTUDES EXPIRADAS
  ObtenerSolicitudesExpiradas() {
    this.restC.ObtenerSolComidaExpirada().subscribe(res => {
      this.solicitudesExpiradas = res;
      for (var i = 0; i <= this.solicitudesExpiradas.length - 1; i++) {
        if (this.solicitudesExpiradas[i].aprobada === true) {
          this.solicitudesExpiradas[i].aprobada = 'AUTORIZADO';
        }
        else if (this.solicitudesExpiradas[i].aprobada === false) {
          this.solicitudesExpiradas[i].aprobada = 'NEGADO';
        }
        else {
          this.solicitudesExpiradas[i].aprobada = 'PENDIENTE';
        }
      }
      if (this.solicitudesExpiradas.length != 0) {
        this.lista_expirados = true;
      }
    });
  }
}
