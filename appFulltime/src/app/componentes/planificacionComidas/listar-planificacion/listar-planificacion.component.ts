// LLAMADO DE LIBRERIAS
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A COMPONENTES
import { MetodosComponent } from '../../metodoEliminar/metodos.component';

// LLAMADO A SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ToastrService } from 'ngx-toastr';
import { EditarPlanComidasComponent } from '../editar-plan-comidas/editar-plan-comidas.component';

// EXPORTACIÓN DE DATOS A SER LEIDOS EN COMPONENTE DE EMPLEADOS PLANIFICACIÓN
export interface SolicitudElemento {
  nombre_servicio: string;
  nombre_plato: string;
  hora_inicio: string;
  id_empleado: number;
  nombre_menu: string;
  fec_inicio: string;
  fec_final: string;
  fecha: string;
  apellido: string;
  hora_fin: string;
  nombre: string;
  codigo: number;
  id: number;
  extra: boolean;
  id_detalle: number;
  id_menu: number;
  id_servicio: number;
  observa_menu: string;
  observacion: string;
  valor: string
}

@Component({
  selector: 'app-listar-planificacion',
  templateUrl: './listar-planificacion.component.html',
  styleUrls: ['./listar-planificacion.component.css']
})

export class ListarPlanificacionComponent implements OnInit {

  // VARIABLE PARA GUARDAR DATOS DE LISTA DE PLANIFICACIONES
  planificaciones: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE PLANIFICACIONES
  selectionUno = new SelectionModel<SolicitudElemento>(true, []);

  // VARIABLES PARA MOSTRAR U OCULTAR LISTAS DE PLANIFICACIONES
  lista_planificaciones: boolean = false; // LISTA DE SOLICITUDES PENDIENTES
  lista_empleados: boolean = false; // LISTA DE SOLICITUDES EXPIRADAS

  // VARIABLE PARA MOSTRAR U OCULTAR ÍCONO DE EDICIÓN O ELIMINACIÓN DE PLANIFICACIÓN
  ver_icono: boolean = true; // ÍCONO ELIMINAR - EDITAR LISTA PLANIFICACIONES
  ver_editar: boolean = true; // ÍCONO EDITAR LISTA PLANIFICACIONES EMPLEADO
  ver_eliminar: boolean = true; // ÍCONO ELIMINAR LISTA PLANIFICACIONES EMPLEADO

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LISTA DE PLANIFICACIONES DE SERVICIO DE ALIMENTACIÓN
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LA LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA
  pageSizeOptions_empleado = [5, 10, 20, 50];
  tamanio_pagina_empleado: number = 5;
  numero_pagina_empleado: number = 1;

  idEmpleadoLogueado: number; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESIÓN

  constructor(
    public restEmpleado: EmpleadoService, // SERVICIO DATOS EMPLEADO
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    public toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    private vistaFlotante: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
    public router: Router,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerPlanificaciones(); // LISTA DE PLANIFCACIONES DE SERVICIOS DE ALIMENTACIÓN
  }

  /** ********************************************************************************************* */
  /**            MÉTODOS USADOS PARA MANEJO DE DATOS DE PLANIFICACIONES DE COMIDAS                  */
  /** ********************************************************************************************* */

  // MÉTODO PARA MOSTRAR UN DETERMINADO NÚMERO DE FILAS EN LA TABLA DE SOLICITUDES PENDIENTES
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE SOLICITUDES PENDIENTES
  ObtenerPlanificaciones() {
    this.restC.ObtenerPlanComidas().subscribe(res => {
      this.planificaciones = res;
      if (this.planificaciones.length != 0) {
        this.lista_planificaciones = true;
      }
    });
  }

  // MÉTODO PARA VER LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA CON ÍCONO EDITAR ACTIVO
  tipo_accion: string = '';
  HabilitarTablaEditar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '1', true, false, true, false);
  }

  // MÉTODO PARA VER LISTA DE EMPLEADOS CON PLANIIFCACIÓN SELECCIONADA CON ÍCONO ELIMINAR ACTIVO
  HabilitarTablaEliminar(id: any) {
    this.ObtenerEmpleadosPlanificacion(id, '2', true, false, false, true);
  }

  // MÉTODO PARA CERRAR TABLA DE LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA
  CerrarTabla() {
    this.lista_empleados = false;
    this.ver_icono = true;
    this.ver_editar = false;
    this.ver_eliminar = false;
    this.botonSeleccion = false;
    this.botonEditar = false;
    this.botonEliminar = false;
    this.ObtenerPlanificaciones();
    this.selectionUno.clear();
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS
  AbrirEditarPlanComidas(datoSeleccionado: any, modo: any): void {
    console.log(datoSeleccionado);
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datoSeleccionado.id,
      id_empleado: datoSeleccionado.id_empleado
    }
    this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('No es posible actualizar la planificación de alimentación de ' + datoSeleccionado.nombre + ' ' + datoSeleccionado.apellido + ' ya que presenta registros de servicio de alimentación consumidos.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VentanaEditarPlanComida(datoSeleccionado, EditarPlanComidasComponent, modo);
    });

  }

  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.vistaFlotante.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        if (forma === 'multiple') {
          var id = datoSeleccionado[0].id;
        }
        else {
          id = datoSeleccionado.id
        }
        this.VerificarPlanificacion(id, '1', true, false);
        this.botonSeleccion = false;
        this.botonEditar = false;
        this.botonEliminar = false;
        this.selectionUno.clear();
      });
  }


  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {
    this.restC.EliminarPlanComida(id_plan, id_empleado).subscribe(res => {
      this.EnviarNotificaciones(datos.fec_inicio, datos.fec_final, datos.hora_inicio, datos.hora_fin, this.idEmpleadoLogueado, datos.id_empleado)
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.VerificarPlanificacion(id_plan, '2', false, true);
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.selectionUno.clear();
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlanComidas(datos: any) {
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('No es posible eliminar la planificación de alimentación de ' + datos.nombre + ' ' + datos.apellido + ' ya que presenta registros de servicio de alimentación consumidos.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.vistaFlotante.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          }
        });
    });
  }

  // ENVIO DE NOTIFICACIONES AL CORREO INDICADO QUE SE ELIMINO EL REGISTRO
  envios: any = [];
  EnviarNotificaciones(fecha_plan_inicio: any, fecha_plan_fin: any, h_inicio: any, h_fin: any, empleado_envia: any, empleado_recibe: any) {
    let datosCorreo = {
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      fecha_fin: moment(fecha_plan_fin).format('DD-MM-YYYY'),
      hora_inicio: h_inicio,
      hora_fin: h_fin
    }
    this.restC.EnviarCorreoEliminaPlan(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe);
      }
    });
  }

  // ENVIO DE NOTIFICACIONES AL SISTEMA INDICADO QUE SE ELIMINO EL REGISTRO
  NotificarPlanificacion(empleado_envia: any, empleado_recive: any) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: 'Planificación de Alimentación Eliminada.'
    }
    this.restC.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }


  /** ********************************************************************************************* */
  /**      MÉTODOS USADOS PARA MANEJO DE DATOS EMPLEADOS CON PLANIFICACIÓN SELECCIONADA             */
  /** ********************************************************************************************* */

  // MÉTODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE EMPLEADOS CON PLANIFICACIÓN
  ManejarPaginaEmpleados(e: PageEvent) {
    this.tamanio_pagina_empleado = e.pageSize;
    this.numero_pagina_empleado = e.pageIndex + 1;
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE EMPLEADOS CON PLANIFICACIÓN
  planEmpleados: any = []; // VARIABLE PARA GUARDAR DATOS DE EMPLEADOS CON PLANIFICACIÓN
  ObtenerEmpleadosPlanificacion(id: any, accion: any, lista_empleados: any, icono: any, editar: any, eliminar: any) {
    this.restC.ObtenerPlanComidaPorIdPlan(id).subscribe(res => {
      this.planEmpleados = res;
      this.tipo_accion = accion;
      this.lista_empleados = lista_empleados;
      this.ver_icono = icono;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;
    }, error => {
      this.restC.EliminarRegistro(id).subscribe(res => {
        this.toastr.error('Planificación no ha sido asignada a ningún colaborador.', 'Registro Eliminado.', {
          timeOut: 6000,
        })
        window.location.reload();
      });
    });
  }

  // MÉTODO PARA HABILITAR O DESHABILITAR EL BOTÓN EDITAR O ELIMINAR
  botonSeleccion: boolean = false;
  botonEditar: boolean = false;
  botonEliminar: boolean = false;
  HabilitarSeleccion() {
    if (this.botonSeleccion === false && this.tipo_accion === '1') {
      this.botonSeleccion = true;
      this.botonEditar = true;
      this.botonEliminar = false;
      this.ver_editar = false;
    }
    else if (this.botonSeleccion === false && this.tipo_accion === '2') {
      this.botonSeleccion = true;
      this.botonEliminar = true;
      this.botonEditar = false;
      this.ver_eliminar = false;
    }
    else if (this.botonSeleccion === true && this.tipo_accion === '1') {
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.ver_editar = true;
    }
    else if (this.botonSeleccion === true && this.tipo_accion === '2') {
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.ver_eliminar = true;
    }
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS. 
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.planEmpleados.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.planEmpleados.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabel(row?: SolicitudElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // MÉTODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y EDITAR
  EditarRegistrosMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        nombre: obj.nombre,
        apellido: obj.apellido,
        id_empleado: obj.id_empleado,
        hora_inicio: obj.hora_inicio,
        hora_fin: obj.hora_fin,
        fec_inicio: obj.fec_inicio,
        fec_final: obj.fec_final,
        codigo: obj.codigo,
        id: obj.id,
        extra: obj.extra,
        fecha: obj.fecha,
        id_detalle: obj.id_detalle,
        id_menu: obj.id_menu,
        id_servicio: obj.id_servicio,
        observacion: obj.observacion
      }
    })
    if (EmpleadosSeleccionados.length === 1) {
      this.AbrirEditarPlanComidas(EmpleadosSeleccionados[0], 'individual');
    } else if (EmpleadosSeleccionados.length > 1) {
      this.AbrirEditarPlanComidas(EmpleadosSeleccionados, 'multiple');
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }

  // MÉTODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y ELIMINAR
  EliminarRegistrosMultiple() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        nombre: obj.nombre,
        apellido: obj.apellido,
        id_empleado: obj.id_empleado,
        id: obj.id,
      }
    })
    if (EmpleadosSeleccionados.length === 1) {
      this.ConfirmarDeletePlanComidas(EmpleadosSeleccionados[0]);
    } else if (EmpleadosSeleccionados.length > 1) {
      this.ConfirmarDeletePlanComidasMultiple(EmpleadosSeleccionados)
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }


  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  id_plan: any;
  EliminarPlanComidasMultiple(datos: any) {
    datos.map(del => {
      this.id_plan = del.id;
      this.restC.EliminarPlanComida(del.id, del.id_empleado).subscribe(res => {
        this.contar_eliminados = this.contar_eliminados + 1;
        this.EnviarNotificaciones(del.fec_inicio, del.fec_final, del.hora_inicio, del.hora_fin, this.idEmpleadoLogueado, del.id_empleado)
        if (this.contar_eliminados === datos.length) {
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', 'Registros Eliminados Exitosamente.', {
            timeOut: 6000,
          });
          this.VerificarPlanificacion(this.id_plan, '2', false, true);
          this.botonSeleccion = false;
          this.botonEditar = false;
          this.botonEliminar = false;
          this.selectionUno.clear();
        }
      });
    })
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  empleado_conConsumo: any = [];
  empleado_sinConsumo: any = [];
  contar: number = 0;
  contar_eliminados: number = 0;
  nota_nombres: string = '';
  ConfirmarDeletePlanComidasMultiple(datos: any) {
    this.empleado_conConsumo = [];
    this.empleado_sinConsumo = [];
    this.contar = 0;
    this.contar_eliminados = 0;
    datos.map(obj => {
      // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
      let datosConsumido = {
        id_plan_comida: obj.id,
        id_empleado: obj.id_empleado
      }
      this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
        this.contar = this.contar + 1;
        this.empleado_conConsumo = this.empleado_conConsumo.concat(obj);
        this.nota_nombres = this.nota_nombres + ' - ' + obj.nombre + ' ' + obj.apellido;
        if (this.contar === datos.length) {
          this.MostrarMensajeEliminado(this.empleado_conConsumo, datos, this.nota_nombres);
          this.nota_nombres = '';
          this.MetodoEliminar(this.empleado_sinConsumo);
        }
      }, error => {
        this.contar = this.contar + 1;
        this.empleado_sinConsumo = this.empleado_sinConsumo.concat(obj);
        if (this.contar === datos.length) {
          this.MostrarMensajeEliminado(this.empleado_conConsumo, datos, this.nota_nombres);
          this.nota_nombres = '';
          this.MetodoEliminar(this.empleado_sinConsumo);
        }
      });
    })
  }

  // MÉTODO PARA MOSTRAR MENSAJES SEGÚN LECTURA DE DATOS
  MostrarMensajeEliminado(consumidos: any, datos_seleccion: any, nota: any) {
    if (consumidos.length === datos_seleccion.length) {
      this.toastr.error('No se puede eliminar planifación de ningún empleado.', 'Los empleados seleccionados presentan registros de planiifcación seleccionada con estado consumido.', {
        timeOut: 6000,
      });
    } else if (consumidos.length > 0) {
      this.toastr.error(nota + '. \nLos empleados indicados presentan registros de planificación seleccionada con estado consumido.', 'No es posible eliminar planificación de: ', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA ABRIR VENTA DE SELECCIÓN ELIMINAR DATOS
  MetodoEliminar(datos_eliminar: any) {
    if (datos_eliminar.length > 0) {
      this.vistaFlotante.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidasMultiple(datos_eliminar);
          }
        });
    }
  }

  // VERIFICAR SI LA PLANIFICACIÓN TIENE DATOS DE EMPLEADOS
  VerificarPlanificacion(id, accion, editar, eliminar) {
    this.restC.ObtenerPlanComidaPorIdPlan(id).subscribe(res => {
      this.planEmpleados = res;
      this.tipo_accion = accion;
      this.lista_empleados = true;
      this.ver_icono = false;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;
    }, res => {
      this.restC.EliminarRegistro(id).subscribe(res => {
        this.tipo_accion = accion;
        this.lista_empleados = false;
        this.ver_icono = true;
        this.ver_editar = false;
        this.ver_eliminar = false;
        window.location.reload();
      });
    });
  }

}
