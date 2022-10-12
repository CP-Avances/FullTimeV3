// LLAMADO DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// LLAMADO A COMPONENTES
import { EditarPlanComidasComponent } from '../editar-plan-comidas/editar-plan-comidas.component';

// LLAMADO A SERVICIOS
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

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
    public validar: ValidacionesService,
    public toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public router: Router,
    public aviso: RealTimeService,
    public restC: PlanComidasService, // SERVICIO DATOS SERVICIO DE COMIDA
    private ventana: MatDialog, // VARIABLE PARA LLAMADO A COMPONENTES
    private parametro: ParametrosService,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.BuscarParametro();
    this.BuscarFecha();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // MÉTODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarFecha() {
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
        // LISTA DE PLANIFCACIONES DE SERVICIOS DE ALIMENTACIÓN
        this.ObtenerPlanificaciones(fecha, this.formato_hora);
      },
      vacio => {
        this.ObtenerPlanificaciones(fecha, this.formato_hora);
      });
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
  ObtenerPlanificaciones(formato_fecha: string, formato_hora: string) {
    this.planificaciones = [];
    this.restC.ObtenerPlanComidas().subscribe(res => {
      this.planificaciones = res;
      if (this.planificaciones.length != 0) {
        this.lista_planificaciones = true;
      }
      this.FormatearDatos(this.planificaciones, formato_fecha, formato_hora);
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
    this.BuscarFecha();
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
        this.BuscarFecha();
      });
  }


  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fec_final, this.formato_fecha, this.validar.dia_completo);
    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

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

  FormatearDatos(lista: any, formato_fecha: string, formato_hora: string) {
    lista.forEach(data => {
      data.fecInicio = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
      data.fecFinal = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      data.horaInicio = this.validar.FormatearHora(data.hora_inicio, formato_hora);
      data.horaFin = this.validar.FormatearHora(data.hora_fin, formato_hora);
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
      this.FormatearDatos(this.planEmpleados, this.formato_fecha, this.formato_hora);
      this.tipo_accion = accion;
      this.lista_empleados = lista_empleados;
      this.ver_icono = icono;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;
    }, error => {
      this.restC.EliminarRegistro(id).subscribe(res => {
        this.toastr.warning('Planificación no ha sido asignada a ningún colaborador.', 'Registro Eliminado.', {
          timeOut: 6000,
        })
        // window.location.reload();
        this.BuscarFecha();
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
        alimentacion: obj
      }
    })

    console.log('ver data de empleados ... ', EmpleadosSeleccionados[0].alimentacion)
    if (EmpleadosSeleccionados.length === 1) {
      this.ConfirmarDeletePlanComidas(EmpleadosSeleccionados[0].alimentacion);
    } else if (EmpleadosSeleccionados.length > 1) {

      this.ContarCorreos(EmpleadosSeleccionados);
      if (this.cont_correo <= this.correos) {
        this.ConfirmarDeletePlanComidasMultiple(EmpleadosSeleccionados)
      }
      else {
        this.toastr.warning('Trata de enviar correo de un total de ' + this.cont_correo + ' colaboradores, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }

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

    var usuario = '';

    datos.map(obj => {

      console.log('ver eliminar 56666 ', plan)
      var plan = obj.alimentacion
      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      let desde = this.validar.FormatearFecha(plan.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      let hasta = this.validar.FormatearFecha(plan.fec_final, this.formato_fecha, this.validar.dia_completo);
      let h_inicio = this.validar.FormatearHora(plan.hora_inicio, this.formato_hora);
      let h_fin = this.validar.FormatearHora(plan.hora_fin, this.formato_hora);

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + plan.nombre + '</th><th>' + plan.cedula + '</th></tr>';

      this.restC.EliminarPlanComida(plan.id, plan.id_empleado).subscribe(res => {
        this.contar_eliminados = this.contar_eliminados + 1;
        this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, plan.id_empleado);

        if (this.contar_eliminados === datos.length) {
          this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', '', {
            timeOut: 6000,
          });
          this.VerificarPlanificacion(plan.id, '2', false, true);
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
        id_plan_comida: obj.alimentacion.id,
        id_empleado: obj.alimentacion.id_empleado
      }
      this.restC.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
        this.contar = this.contar + 1;
        this.empleado_conConsumo = this.empleado_conConsumo.concat(obj);
        this.nota_nombres = this.nota_nombres + ' - ' + obj.alimentacion.nombre;
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
      this.toastr.error(nota + '. \nLos usuarios indicados presentan tienen planificación con estado consumido.', 'No es posible eliminar planificación de: ', {
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
      this.FormatearDatos(this.planEmpleados, this.formato_fecha, this.formato_hora);
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
        this.BuscarFecha();
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
      desde: desde,
      hasta: hasta,
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
        desde + ' hasta ' + hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
    }
    this.restC.EnviarMensajePlanComida(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    })
  }

  // MÉTODO PARA BUSCAR PARÁMETRO DE CORREOS
  correos: number;
  BuscarParametro() {
    // id_tipo_parametro LIMITE DE CORREOS = 24
    let datos = [];
    this.parametro.ListarDetalleParametros(24).subscribe(
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
    console.log('ver data correo.... ', data)
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      console.log('ver obj correo.... ', obj.alimentacion.correo)
      this.cont_correo = this.cont_correo + 1;
      if (this.info_correo === '') {
        this.info_correo = obj.alimentacion.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.alimentacion.correo;
      }
      console.log('ver info correo...', this.info_correo)
    })
  }


}
