import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { TiempoAutorizadoComponent } from 'src/app/componentes/horasExtras/tiempo-autorizado/tiempo-autorizado.component';
import { HoraExtraAutorizacionesComponent } from 'src/app/componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { ValidacionesService } from '../../../servicios/validaciones/validaciones.service';

export interface HoraExtraElemento {
  apellido: string;
  descripcion: string;
  estado: string;
  fec_final: string;
  fec_inicio: string;
  fec_solicita: string;
  id: number;
  nombre: string;
  num_hora: string;
  id_empl_cargo: number;
  id_contrato: number;
  id_usua_solicita: number;
}

@Component({
  selector: 'app-lista-pedido-hora-extra',
  templateUrl: './lista-pedido-hora-extra.component.html',
  styleUrls: ['./lista-pedido-hora-extra.component.css']
})

export class ListaPedidoHoraExtraComponent implements OnInit {

  horas_extras: any = [];

  selectionUno = new SelectionModel<HoraExtraElemento>(true, []);

  totalHorasExtras;

  // Habilitar o Deshabilitar el icono de autorización individual
  auto_individual: boolean = true;

  // Habilitar listas según los datos
  lista_autorizacion: boolean = false;

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  inicioFor = 0;

  constructor(
    private restHE: PedHoraExtraService,
    private vistaFlotante: MatDialog,
    private validacionesService: ValidacionesService
  ) { }

  ngOnInit(): void {
    this.obtenerHorasExtras();
    this.obtenerHorasExtrasAutorizadas();
    this.obtenerHorasExtrasObservacion();
    this.calcularHoraPaginacion();
    this.calcularHoraPaginacionObservacion();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
    this.calcularHoraPaginacion();
  }

  calcularHoraPaginacion() {
    if (this.numero_pagina != 1) {
      this.inicioFor = (this.numero_pagina - 1) * this.tamanio_pagina;
      this.SumatoriaHoras(this.inicioFor, ((this.numero_pagina) * this.tamanio_pagina))
    } else {
      this.inicioFor = 0;
      this.SumatoriaHoras(this.inicioFor, ((this.tamanio_pagina) * this.numero_pagina))
    }
  }

  sumaHoras: any = [];
  horasSumadas: any;
  SumatoriaHoras(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.sumaHoras = res;
      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHoras.length) {
          hora1 = (this.sumaHoras[i].num_hora).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          //Aquí hago la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.horasSumadas = (moment(tt).format('HH:mm:ss'));
        }
        else {
          break;
        }
      }
      console.log(res);
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  lista_pedidos: boolean = false;
  obtenerHorasExtras() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.horas_extras = res;
      if (this.horas_extras.length != 0) {
        this.lista_pedidos = true;
      }
      else {
        this.lista_pedidos = false;
      }
      for (var i = 0; i <= this.horas_extras.length - 1; i++) {
        if (this.horas_extras[i].estado === 1) {
          this.horas_extras[i].estado = 'Pendiente';
        }
        else if (this.horas_extras[i].estado === 2) {
          this.horas_extras[i].estado = 'Pre-Autorizado';
        }
        else if (this.horas_extras[i].estado === 3) {
          this.horas_extras[i].estado = 'Autorizado';
        }
        else if (this.horas_extras[i].estado === 4) {
          this.horas_extras[i].estado = 'Negado';
        }

        hora1 = (this.horas_extras[i].num_hora).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

        //Aquí hago la suma
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.totalHorasExtras = (moment(tt).format('HH:mm:ss'));
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.horas_extras.length;
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.horas_extras.forEach(row => this.selectionUno.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabel(row?: HoraExtraElemento): string {
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

  /** **********************************************************************
   *  LISTAS DE HORAS EXTRAS AUTORIZADAS 
   *  **********************************************************************/

  solicitudes_observacion: any = [];
  lista_observacion: boolean = false;
  total_horas_observacion: any;
  obtenerHorasExtrasObservacion() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.solicitudes_observacion = res;
      if (this.solicitudes_observacion.length != 0) {
        this.lista_observacion = true;
      }
      else {
        this.lista_observacion = false;
      }
      for (var i = 0; i <= this.solicitudes_observacion.length - 1; i++) {
        if (this.solicitudes_observacion[i].estado === 1) {
          this.solicitudes_observacion[i].estado = 'Pendiente';
        }
        else if (this.solicitudes_observacion[i].estado === 2) {
          this.solicitudes_observacion[i].estado = 'Pre-Autorizado';
        }
        else if (this.solicitudes_observacion[i].estado === 3) {
          this.solicitudes_observacion[i].estado = 'Autorizado';
        }
        else if (this.solicitudes_observacion[i].estado === 4) {
          this.solicitudes_observacion[i].estado = 'Negado';
        }

        hora1 = (this.solicitudes_observacion[i].num_hora).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

        //Aquí hago la suma
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.total_horas_observacion = (moment(tt).format('HH:mm:ss'));
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  tamanio_pagina_observacion: number = 5;
  numero_pagina_observacion: number = 1;
  pageSizeOptions_observacion = [5, 10, 20, 50];
  ManejarPaginaObservacion(e: PageEvent) {
    this.tamanio_pagina_observacion = e.pageSize;
    this.numero_pagina_observacion = e.pageIndex + 1;
    this.calcularHoraPaginacionObservacion();
  }

  iniciaFor = 0;
  calcularHoraPaginacionObservacion() {
    if (this.numero_pagina_observacion != 1) {
      this.iniciaFor = (this.numero_pagina_observacion - 1) * this.tamanio_pagina_observacion;
      this.SumatoriaHorasObservacion(this.iniciaFor, ((this.numero_pagina_observacion) * this.tamanio_pagina_observacion))
    } else {
      this.iniciaFor = 0;
      this.SumatoriaHorasObservacion(this.iniciaFor, ((this.tamanio_pagina_observacion) * this.numero_pagina_observacion))
    }
  }

  sumaHoras_observacion: any = [];
  horasSumadas_observacion: any;
  SumatoriaHorasObservacion(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.sumaHoras_observacion = res;
      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHoras_observacion.length) {
          hora1 = (this.sumaHoras_observacion[i].num_hora).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          //Aquí hago la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.horasSumadas_observacion = (moment(tt).format('HH:mm:ss'));
          console.log('jcneuhrfu', this.horasSumadas_observacion)
        }
        else {
          break;
        }
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  selectionUnoObserva = new SelectionModel<HoraExtraElemento>(true, []);
  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedObserva() {
    const numSelected = this.selectionUnoObserva.selected.length;
    const numRows = this.solicitudes_observacion.length;
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleObserva() {
    this.isAllSelectedObserva() ?
      this.selectionUnoObserva.clear() :
      this.solicitudes_observacion.forEach(row => this.selectionUnoObserva.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelObserva(row?: HoraExtraElemento): string {
    if (!row) {
      return `${this.isAllSelectedObserva() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUnoObserva.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  btnCheckHabilitarObserva: boolean = false;
  observa_individual: boolean = true;
  HabilitarSeleccionObserva() {
    if (this.btnCheckHabilitarObserva === false) {
      this.btnCheckHabilitarObserva = true;
      this.observa_individual = false;
    } else if (this.btnCheckHabilitarObserva === true) {
      this.btnCheckHabilitarObserva = false;
      this.observa_individual = true;
    }
  }

  /** **********************************************************************
   *  LISTAS DE HORAS EXTRAS AUTORIZADAS 
   *  **********************************************************************/

  pedido_hora_autoriza: any = [];
  total_horas_autorizadas: any;
  obtenerHorasExtrasAutorizadas() {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraAutorizada().subscribe(res => {
      this.pedido_hora_autoriza = res;
      if (this.pedido_hora_autoriza.length != 0) {
        this.lista_autorizacion = true;
      }
      else {
        this.lista_autorizacion = false;
      }
      for (var i = 0; i <= this.pedido_hora_autoriza.length - 1; i++) {
        if (this.pedido_hora_autoriza[i].estado === 1) {
          this.pedido_hora_autoriza[i].estado = 'Pendiente';
        }
        else if (this.pedido_hora_autoriza[i].estado === 2) {
          this.pedido_hora_autoriza[i].estado = 'Pre-Autorizado';
        }
        else if (this.pedido_hora_autoriza[i].estado === 3) {
          this.pedido_hora_autoriza[i].estado = 'Autorizado';
        }
        else if (this.pedido_hora_autoriza[i].estado === 4) {
          this.pedido_hora_autoriza[i].estado = 'Negado';
        }
        if (this.pedido_hora_autoriza[i].estado === 'Autorizado') {
          hora1 = (this.pedido_hora_autoriza[i].tiempo_autorizado).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          //Aquí hago la suma
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.total_horas_autorizadas = (moment(tt).format('HH:mm:ss'));
        }
      }
    }, err => {
      return this.validacionesService.RedireccionarHomeAdmin(err.error) 
    });
  }

  // Paginación de lista de datos autorizados
  tamanio_pagina_auto: number = 5;
  numero_pagina_auto: number = 1;
  pageSizeOptions_auto = [5, 10, 20, 50];
  ManejarPaginaAutorizadas(e: PageEvent) {
    this.tamanio_pagina_auto = e.pageSize;
    this.numero_pagina_auto = e.pageIndex + 1;
  }

  AutorizarHorasExtrasMultiple(lista: string) {
    var dato: any;
    if (lista === 'pedido') {
      dato = this.selectionUno;
    }
    else if (lista === 'observacion') {
      dato = this.selectionUnoObserva;
    }
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = dato.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido,
        num_hora: obj.num_hora,
        id_contrato: obj.id_contrato,
        id_usua_solicita: obj.id_usua_solicita,
        estado: obj.estado,
        id_cargo: obj.id_empl_cargo
      }
    })
    for (var i = 0; i <= EmpleadosSeleccionados.length - 1; i++) {
      let h = {
        hora: EmpleadosSeleccionados[i].num_hora
      }
      this.restHE.AutorizarTiempoHoraExtra(EmpleadosSeleccionados[i].id, h).subscribe(res => {
        console.log(res);
      }, err => {
        return this.validacionesService.RedireccionarHomeAdmin(err.error) 
      })
    }
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }


  // Autorización de horas extras planificadas
  AbrirAutorizaciones(datosHoraExtra, forma: string) {
    this.vistaFlotante.open(HoraExtraAutorizacionesComponent,
      { width: '300px', data: { datosHora: datosHoraExtra, carga: forma } }).afterClosed().subscribe(items => {
        window.location.reload();
      });
  }


}
