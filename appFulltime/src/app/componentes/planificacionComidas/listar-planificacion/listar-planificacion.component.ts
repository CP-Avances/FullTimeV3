// LLAMADO DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A COMPONENTES
import { MetodosComponent } from '../../metodoEliminar/metodos.component';

// LLAMADO A SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { EditarPlanComidasComponent } from '../editar-plan-comidas/editar-plan-comidas.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

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
  valor: string;
  correo: string;
  cedula: string;
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
    public toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public router: Router,
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    private ventana: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
    private restP: ParametrosService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerPlanificaciones(); // LISTA DE PLANIFCACIONES DE SERVICIOS DE ALIMENTACIÓN
    this.BuscarParametro();
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
    this.planificaciones = [];
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
      this.toastr.info('Proceso inválido. ' + datoSeleccionado.nombre + ' ' + datoSeleccionado.apellido + ' ya tiene un registro de servicio de alimentación consumido.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VentanaEditarPlanComida(datoSeleccionado, EditarPlanComidasComponent, modo);
    });

  }

  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.ventana.open(componente, {
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

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = moment.weekdays(moment(datos.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(datos.fec_inicio).day()).slice(1);
    let hasta = moment.weekdays(moment(datos.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(datos.fec_final).day()).slice(1);
    let h_inicio = moment(datos.hora_inicio, 'HH:mm').format('HH:mm');
    let h_fin = moment(datos.hora_fin, 'HH:mm').format('HH:mm');


    this.restC.EliminarPlanComida(id_plan, id_empleado).subscribe(res => {
      this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
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
    console.log('ver data seleccionada... ', datos)
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('Proceso no permitido. Usuario ' + datos.nombre + ' ' + datos.apellido + ' tiene un registro de alimentación consumido.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          }
        });
    });
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
        cedula: obj.cedula,
        correo: obj.correo,
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
      console.log('ver data obj... ', obj)
      return {
        nombre: obj.nombre,
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
      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      /*    let desde = moment.weekdays(moment(del.fec_inicio).day()).charAt(0).toUpperCase() + moment.weekdays(moment(plan.fec_inicio).day()).slice(1);
          let hasta = moment.weekdays(moment(plan.fec_final).day()).charAt(0).toUpperCase() + moment.weekdays(moment(plan.fec_final).day()).slice(1);
          let h_inicio = moment(plan.hora_inicio, 'HH:mm').format('HH:mm');
          let h_fin = moment(plan.hora_fin, 'HH:mm').format('HH:mm');
   
   
          */
      this.restC.EliminarPlanComida(del.id, del.id_empleado).subscribe(res => {
        this.contar_eliminados = this.contar_eliminados + 1;
        //this.EnviarNotificaciones(del.fec_inicio, del.fec_final, del.hora_inicio, del.hora_fin, this.idEmpleadoLogueado, del.id_empleado)

        if (this.contar_eliminados === datos.length) {
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', '', {
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
    console.log('ver datos seleccionados', datos)
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
        this.nota_nombres = this.nota_nombres + ' - ' + obj.nombre;
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
      this.toastr.error('Proceso no permitido.', 'Los usuarios seleccionados ya tienen registro de planificación consumida.', {
        timeOut: 6000,
      });
    } else if (consumidos.length > 0) {
      this.toastr.error(nota + '. \nLos usuarios indicados presentan registros de planificación con estado consumido.', 'No es posible eliminar planificación de: ', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA ABRIR VENTA DE SELECCIÓN ELIMINAR DATOS
  MetodoEliminar(datos_eliminar: any) {
    if (datos_eliminar.length > 0) {
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
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
      this.lista_empleados = true;
      this.planEmpleados = res;
      this.ver_eliminar = eliminar;
      this.tipo_accion = accion;
      this.ver_editar = editar;
      this.ver_icono = false;
    }, res => {
      this.restC.EliminarRegistro(id).subscribe(res => {
        this.tipo_accion = accion;
        this.lista_empleados = false;
        this.ver_icono = true;
        this.ver_editar = false;
        this.ver_eliminar = false;
        // window.location.reload();
        this.ObtenerPlanificaciones();
      });
    });
  }


  /** ***************************************************************************************************** **
   ** **               METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/

  // MÉTODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACION
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      observacion: datos.observacion,
      id_comida: datos.id_detalle,
      id_envia: this.idEmpleadoLogueado,
      nombres: usuario,
      proceso: 'eliminado',
      asunto: 'ELIMINACION DE PLANIFICACION DE ALIMENTACION',
      correo: cuenta_correo,
      inicio: h_inicio,
      extra: datos.extra,
      desde: desde + ' ' + moment(datos.fec_inicio).format('DD/MM/YYYY'),
      hasta: hasta + ' ' + moment(datos.fec_final).format('DD/MM/YYYY'),
      final: h_fin,
    }

    console.log('DATOS A ENVIARSE POR CORREO', DataCorreo);
    // MÉTODO ENVIO DE CORREO DE PLANIFICACIÓN DE ALIMENTACION
    this.restC.EnviarCorreoPlan(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
      console.log(res.message);

    })
  }


  // MÉTODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE SERVICIO DE ALIMENTACION
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, id_empleado_recibe: number) {
    let mensaje = {
      id_comida: datos.id_detalle,
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: id_empleado_recibe,
      tipo: 20, // PLANIFICACIÓN DE ALIMENTACION
      mensaje: 'Planificación de alimentación eliminada desde ' +
        desde + ' ' + moment(datos.fec_inicio).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(datos.fec_final).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
    }
    this.restC.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // MÉTODO PARA BUSCAR PARÁMETRO DE CORREOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREOS = 24
    let datos = [];
    this.restP.ListarDetalleParametros(24).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

  // MÉTODO PARA CONTAR CORREOS A ENVIARSE
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      this.cont_correo = this.cont_correo + 1;
      if (this.info_correo === '') {
        this.info_correo = obj.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.correo;
      }
    })
  }


}
