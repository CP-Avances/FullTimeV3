import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { VacacionAutorizacionesComponent } from 'src/app/componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { EditarVacacionesEmpleadoComponent } from 'src/app/componentes/rolEmpleado/vacacion-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

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

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  vacaciones: any = [];

  // HABILITAR LISTAS SEGÚN LOS DATOS
  lista_vacaciones: boolean = false;
  lista_autoriza: boolean = false;

  // HABILITAR ICONOS DE AUTORIZACION INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACIÓN DE LISTA AUTORIZADOS
  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];

  vacaciones_autorizadas: any = [];

  constructor(
    private restV: VacacionesService,
    private ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) { }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // MÉTODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.ObtenerListaVacaciones(this.formato_fecha);
        this.ObtenerListaVacacionesAutorizadas(this.formato_fecha);
      },
      vacio => {
        this.ObtenerListaVacaciones(this.formato_fecha);
        this.ObtenerListaVacacionesAutorizadas(this.formato_fecha);
      });
  }

  ObtenerListaVacaciones(formato_fecha: string) {
    this.restV.ObtenerListaVacaciones().subscribe(res => {
      this.vacaciones = res;

      this.vacaciones.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);

      })

      if (this.vacaciones.length != 0) {
        this.lista_vacaciones = true;
      } else {
        this.lista_vacaciones = false;
      }
      console.log(res);
    });
  }

  ObtenerListaVacacionesAutorizadas(formato_fecha: string) {
    this.restV.ObtenerListaVacacionesAutorizadas().subscribe(res => {
      this.vacaciones_autorizadas = res;

      this.vacaciones_autorizadas.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);

      })

      if (this.vacaciones_autorizadas.length != 0) {
        this.lista_autoriza = true;
      } else {
        this.lista_autoriza = false;
      }
      console.log(res);
    });
  }

  // EVENTO PAGINACIÓN LISTA VACACIONES
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  selectionUno = new SelectionModel<VacacionesElemento>(true, []);
  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.vacaciones.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.vacaciones.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
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

  // AUTORIZACIÓN DE VACACIONES
  AbrirAutorizaciones(datos_vacacion, forma: string) {
    this.ventana.open(VacacionAutorizacionesComponent,
      { width: '600px', data: { datosVacacion: datos_vacacion, carga: forma } })
      .afterClosed().subscribe(items => {
        this.BuscarParametro();
        this.auto_individual = true;
        this.selectionUno.clear();
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
      console.log('ver vacaciones ', res)
      this.ventana.open(EditarVacacionesEmpleadoComponent,
        {
          width: '900px',
          data: {
            info: this.vacaciones_lista[0], id_empleado: this.vacaciones_lista[0].id_empleado,
            id_contrato: this.vacaciones_lista[0].id_contrato
          }
        }).afterClosed().subscribe(items => {
          this.BuscarParametro();
        });
    });
  }

}
