import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';

import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

import { HoraExtraAutorizacionesComponent } from 'src/app/componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

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

  idEmpleado: number;

  // Habilitar o Deshabilitar el icono de autorización individual
  auto_individual: boolean = true;

  // Habilitar listas según los datos
  lista_autorizacion: boolean = false;

  validarMensaje1: boolean = false;
  validarMensaje2: boolean = false;
  validarMensaje3: boolean = false;

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  inicioFor = 0;

  get habilitarHorasE(): boolean { return this.funciones.horasExtras; }

  constructor(
    private restHE: PedHoraExtraService,
    private ventana: MatDialog,
    private validar: ValidacionesService,
    public parametro: ParametrosService,
    private funciones: MainNavService
  ) { 
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    if (this.habilitarHorasE === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Horas Extras. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.BuscarParametro();
      this.calcularHoraPaginacion();
      this.calcularHoraPaginacionObservacion();
    }  
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.obtenerHorasExtras(this.formato_fecha);
        this.obtenerHorasExtrasAutorizadas(this.formato_fecha);
        this.obtenerHorasExtrasObservacion(this.formato_fecha);
      },
      vacio => {
        this.obtenerHorasExtras(this.formato_fecha);
        this.obtenerHorasExtrasAutorizadas(this.formato_fecha);
        this.obtenerHorasExtrasObservacion(this.formato_fecha);
      });
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
  sumaHorasfiltro: any = [];
  horasSumadas: any;
  SumatoriaHoras(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.sumaHoras = res;

      //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.sumaHorasfiltro = this.sumaHoras.filter(o => {
        if(this.idEmpleado !== o.id_usua_solicita){
          return this.sumaHorasfiltro.push(o);
        }
      })

      for (var i = inicio; i < fin; i++) {
        if (i < this.sumaHorasfiltro.length) {
          hora1 = (this.sumaHorasfiltro[i].num_hora).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          // AQUÍ HAGO LA SUMA
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
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  lista_pedidos: boolean = false;
  lista_pedidosFiltradas: any = [];
  obtenerHorasExtras(formato_fecha: string) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtra().subscribe(res => {
      this.horas_extras = res;

      //Filtra la lista de Horas Extras para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.lista_pedidosFiltradas = this.horas_extras.filter(o => {
        if(this.idEmpleado !== o.id_usua_solicita){
          return this.lista_pedidosFiltradas.push(o);
        }
      })

      if (this.lista_pedidosFiltradas.length != 0) {
        this.lista_pedidos = true;
      }
      else {
        this.lista_pedidos = false;
      }

      this.lista_pedidosFiltradas.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-Autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        hora1 = (data.num_hora).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

        // AQUÍ HAGO LA SUMA
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.totalHorasExtras = (moment(tt).format('HH:mm:ss'));

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })

      if (Object.keys(this.lista_pedidosFiltradas).length == 0) {
        this.validarMensaje1 = true;
      }

    }, err => {
      this.validarMensaje1 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.lista_pedidosFiltradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.lista_pedidosFiltradas.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
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

  /** *********************************************************************************************** **
   ** **                              LISTAS DE HORAS EXTRAS AUTORIZADAS                           ** **
   ** *********************************************************************************************** **/

  solicitudes_observacion: any = [];
  lista_observacion: boolean = false;
  total_horas_observacion: any;
  listaHorasExtrasObservaFiltradas: any = [];
  obtenerHorasExtrasObservacion(formato_fecha: string) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.solicitudes_observacion = res;

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.listaHorasExtrasObservaFiltradas = this.solicitudes_observacion.filter(o => {
        if(this.idEmpleado !== o.id_usua_solicita){
          return this.listaHorasExtrasObservaFiltradas.push(o);
        }
      });

      if (this.listaHorasExtrasObservaFiltradas.length != 0) {
        this.lista_observacion = true;
      }
      else {
        this.lista_observacion = false;
      }

      this.listaHorasExtrasObservaFiltradas.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-Autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        hora1 = (data.num_hora).split(":");
        t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
        tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

        // AQUÍ HAGO LA SUMA
        tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
        horaT = (moment(tt).format('HH:mm:ss')).split(':');
        this.total_horas_observacion = (moment(tt).format('HH:mm:ss'));

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);

      });

      if (Object.keys(this.listaHorasExtrasObservaFiltradas).length == 0) {
        this.validarMensaje2 = true;
      }
      
      
    }, err => {
      this.validarMensaje2 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
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
  susmaHoras_observacionFiltada: any = [];
  SumatoriaHorasObservacion(inicio, fin) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraObservacion().subscribe(res => {
      this.sumaHoras_observacion = res;

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.susmaHoras_observacionFiltada = this.sumaHoras_observacion.filter(o => {
        if(this.idEmpleado !== o.id_usua_solicita){
          return this.susmaHoras_observacionFiltada.push(o);
        }
      });


      for (var i = inicio; i < fin; i++) {
        if (i < this.susmaHoras_observacionFiltada.length) {
          hora1 = (this.susmaHoras_observacionFiltada[i].num_hora).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          // AQUÍ HAGO LA SUMA
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
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  selectionUnoObserva = new SelectionModel<HoraExtraElemento>(true, []);
  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelectedObserva() {
    const numSelected = this.selectionUnoObserva.selected.length;
    const numRows = this.listaHorasExtrasObservaFiltradas.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggleObserva() {
    this.isAllSelectedObserva() ?
      this.selectionUnoObserva.clear() :
      this.listaHorasExtrasObservaFiltradas.forEach(row => this.selectionUnoObserva.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
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

  /** ************************************************************************************* **
   ** **                       LISTAS DE HORAS EXTRAS AUTORIZADAS                        ** ** 
   ** ************************************************************************************* **/

  pedido_hora_autoriza: any = [];
  total_horas_autorizadas: any;
  listaHorasExtrasAutorizadasFiltradas: any = [];
  obtenerHorasExtrasAutorizadas(formato_fecha: string) {
    var t1 = new Date();
    var tt = new Date();
    var hora1 = '00:00:00', horaT = '00:00:00'.split(":");
    this.restHE.ListaAllHoraExtraAutorizada().subscribe(res => {
      this.pedido_hora_autoriza = res;

      //Filtra la lista de Horas Extras Autorizadas para descartar las solicitudes del mismo usuario y almacena en una nueva lista
      this.listaHorasExtrasAutorizadasFiltradas = this.pedido_hora_autoriza.filter(o => {
        if(this.idEmpleado !== o.id_usua_solicita){
          return this.listaHorasExtrasAutorizadasFiltradas.push(o);
        }
      });

      if (this.listaHorasExtrasAutorizadasFiltradas.length != 0) {
        this.lista_autorizacion = true;
      }
      else {
        this.lista_autorizacion = false;
      }

      this.listaHorasExtrasAutorizadasFiltradas.forEach(data => {

        if (data.estado === 1) {
          data.estado = 'Pendiente';
        }
        else if (data.estado === 2) {
          data.estado = 'Pre-Autorizado';
        }
        else if (data.estado === 3) {
          data.estado = 'Autorizado';
        }
        else if (data.estado === 4) {
          data.estado = 'Negado';
        }

        if (data.estado === 'Autorizado') {
          hora1 = (data.tiempo_autorizado).split(":");
          t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
          tt.setHours(parseInt(horaT[0]), parseInt(horaT[1]), parseInt(horaT[2]));

          // AQUÍ HAGO LA SUMA
          tt.setHours(tt.getHours() + t1.getHours(), tt.getMinutes() + t1.getMinutes(), tt.getSeconds() + tt.getSeconds());
          horaT = (moment(tt).format('HH:mm:ss')).split(':');
          this.total_horas_autorizadas = (moment(tt).format('HH:mm:ss'));
        }

        console.log("horas totales autorizadas: ",this.total_horas_autorizadas);

        data.fec_inicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);

      })

      if (Object.keys(this.listaHorasExtrasAutorizadasFiltradas).length == 0) {
        this.validarMensaje3 = true;
      }

    }, err => {
      this.validarMensaje3 = true;
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // PAGINACIÓN DE LISTA DE DATOS AUTORIZADOS
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
        return this.validar.RedireccionarHomeAdmin(err.error)
      })
    }
    this.AbrirAutorizaciones(EmpleadosSeleccionados, 'multiple');
  }


  // AUTORIZACIÓN DE HORAS EXTRAS PLANIFICADAS
  AbrirAutorizaciones(datosHoraExtra, forma: string) {
    this.ventana.open(HoraExtraAutorizacionesComponent,
      { width: '300px', data: { datosHora: datosHoraExtra, carga: forma } })
      .afterClosed().subscribe(items => {
        window.location.reload();
      });
  }


}
