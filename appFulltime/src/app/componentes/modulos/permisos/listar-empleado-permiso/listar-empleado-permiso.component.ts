import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { EditarPermisoEmpleadoComponent } from 'src/app/componentes/rolEmpleado/permisos-empleado/editar-permiso-empleado/editar-permiso-empleado.component';
import { AutorizacionesComponent } from 'src/app/componentes/autorizaciones/autorizaciones/autorizaciones.component';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

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

  // VISIBILIZAR LISTA DE PERMISOS AUTORIZADOS
  lista_autorizados: boolean = false;
  lista_permisos: boolean = false;

  // HABILITAR O DESHABILITAR EL ICONO DE AUTORIZACIÓN INDIVIDUAL
  auto_individual: boolean = true;

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACIÓN DE LA TABLA AUTORIZADOS
  tamanio_pagina_autorizado: number = 5;
  numero_pagina_autorizado: number = 1;
  pageSizeOptions_autorizado = [5, 10, 20, 50];

  get habilitarPermiso(): boolean { return this.funciones.permisos; }

  constructor(
    private validar: ValidacionesService,
    private ventana: MatDialog,
    private restP: PermisosService,
    private funciones: MainNavService,
    public parametro: ParametrosService,
    public restEmpleado: EmpleadoService,
  ) { }

  ngOnInit(): void {
    if (this.habilitarPermiso === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Permisos. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.BuscarParametro();
    }
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
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
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.obtenerPermisos(fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(fecha, this.formato_hora);
      },
      vacio => {
        this.obtenerPermisos(fecha, this.formato_hora);
        this.ObtenerPermisosAutorizados(fecha, this.formato_hora);
      });
  }

  obtenerPermisos(fecha: string, hora: string) {

    this.restP.obtenerAllPermisos().subscribe(res => {
      this.permisos = res;

      this.permisos.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, fecha, this.validar.dia_abreviado);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, fecha, this.validar.dia_abreviado);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, fecha, this.validar.dia_abreviado);

        if (p.estado === 1) {
          p.estado = 'Pendiente';
        }
        else if (p.estado === 2) {
          p.estado = 'Pre-autorizado';
        }
      })
      console.log('permisos', this.permisos)
      if (this.permisos.length != 0) {
        this.lista_permisos = true;
      }
    }, err => {
      console.log('permisos ALL ', err.error)
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  permisosTotales: any;
  EditarPermiso(id, id_empl) {
    // METODO PARA IMPRIMIR DATOS DEL PERMISO 
    this.permisosTotales = [];
    this.restP.ObtenerUnPermisoEditar(id).subscribe(datos => {
      this.permisosTotales = datos;
      this.ventana.open(EditarPermisoEmpleadoComponent, {
        width: '1200px',
        data: { dataPermiso: this.permisosTotales[0], id_empleado: parseInt(id_empl) }
      }).afterClosed().subscribe(items => {
        this.BuscarParametro();
      });
    }, err => {
      console.log('permisos uno ', err.error)
      return this.validar.RedireccionarHomeAdmin(err.error)
    })

  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.permisos.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.permisos.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
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

  // AUTORIZACIÓN DE PERMISOS
  AbrirAutorizaciones(datos_permiso, forma: string) {
    this.ventana.open(AutorizacionesComponent,
      { width: '600px', data: { datosPermiso: datos_permiso, carga: forma } })
      .afterClosed().subscribe(items => {
        this.BuscarParametro();
        this.auto_individual = true;
        this.selectionUno.clear();
      });
  }

  // LISTA DE PERMISOS QUE HAN SIDO AUTORIZADOS O NEGADOS

  ManejarPaginaAutorizados(e: PageEvent) {
    this.tamanio_pagina_autorizado = e.pageSize;
    this.numero_pagina_autorizado = e.pageIndex + 1;
  }

  permisosAutorizados: any = [];
  ObtenerPermisosAutorizados(fecha: string, hora: string) {
    this.restP.BuscarPermisosAutorizados().subscribe(res => {
      this.permisosAutorizados = res;

      this.permisosAutorizados.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS EN FORMATO DD/MM/YYYYY
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, fecha, this.validar.dia_abreviado);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, fecha, this.validar.dia_abreviado);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, fecha, this.validar.dia_abreviado);

        if (p.estado === 3) {
          p.estado = 'Autorizado';
        }
        else if (p.estado === 4) {
          p.estado = 'Negado';
        }
      })

      if (this.permisosAutorizados.length != 0) {
        this.lista_autorizados = true;
      }
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

}
