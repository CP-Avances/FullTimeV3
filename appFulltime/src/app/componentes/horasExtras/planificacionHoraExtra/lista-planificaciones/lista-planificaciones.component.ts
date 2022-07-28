import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';

import { EditarPlanHoraExtraComponent } from 'src/app/componentes/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

// EXPORTACIÓN DE DATOS A SER LEIDOS EN COMPONENTE DE EMPLEADOS PLANIFICACIÓN
export interface PlanificacionHE {
  descripcion: string;
  hora_inicio: string;
  id_empleado: number;
  fecha_desde: string;
  fecha_hasta: string;
  horas_totales: string;
  hora_fin: string;
  nombre: string;
  codigo: number;
  id: number;
  correo: string;
  cedula: string;
}

@Component({
  selector: 'app-lista-planificaciones',
  templateUrl: './lista-planificaciones.component.html',
  styleUrls: ['./lista-planificaciones.component.css']
})

export class ListaPlanificacionesComponent implements OnInit {

  // ITEMS DE PAGINACIÓN DE LA LISTA DE PLANIFICACIONES
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACIÓN DE LA TABLA DE LA LISTA DE EMPLEADOS CON PLANIFICACIÓN SELECCIONADA
  pageSizeOptions_empleado = [5, 10, 20, 50];
  tamanio_pagina_empleado: number = 5;
  numero_pagina_empleado: number = 1;

  // ALMACENAMIENTO DE DATOS DE PLANIFICACIÓN
  listaPlan: any = [];

  // VARIABLE PARA GURDAR DATOS SELECCIONADOS DE LISTA DE PLANIFICACIONES
  selectionUno = new SelectionModel<PlanificacionHE>(true, []);

  // VARIABLE PARA MOSTRAR U OCULTAR ÍCONO DE EDICIÓN O ELIMINACIÓN DE PLANIFICACIÓN
  ver_icono: boolean = true; // ÍCONO ELIMINAR - EDITAR LISTA PLANIFICACIONES
  ver_editar: boolean = true; // ÍCONO EDITAR LISTA PLANIFICACIONES EMPLEADO
  ver_eliminar: boolean = true; // ÍCONO ELIMINAR LISTA PLANIFICACIONES EMPLEADO

  idEmpleadoLogueado: number; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESIÓN

  constructor(
    public restPlan: PlanHoraExtraService,
    public ventana: MatDialog,
    private restP: ParametrosService,
    private toastr: ToastrService,
    private validar: ValidacionesService
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  fecha: any;
  ngOnInit(): void {
    var f = moment();
    this.fecha = f.format('YYYY-MM-DD');
    this.ListarPlanificaciones();
    this.BuscarParametro();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA MOSTRAR FILAS DETERMINADAS EN TABLA DE EMPLEADOS CON PLANIFICACIÓN
  ManejarPaginaEmpleados(e: PageEvent) {
    this.tamanio_pagina_empleado = e.pageSize;
    this.numero_pagina_empleado = e.pageIndex + 1;
  }

  lista_plan: boolean = false;
  ListarPlanificaciones() {
    this.listaPlan = [];
    this.restPlan.ConsultarPlanificaciones().subscribe(response => {
      this.listaPlan = response;
      if (this.listaPlan.length != 0) {
        this.lista_plan = true;
      }
    }, err => {
      return this.validar.RedireccionarHomeAdmin(err.error)
    });
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE EMPLEADOS CON PLANIFICACIÓN
  planEmpleados: any = []; // VARIABLE PARA GUARDAR DATOS DE EMPLEADOS CON PLANIFICACIÓN
  lista_empleados: boolean = false; // LISTA DE USUARIOS
  ObtenerEmpleadosPlanificacion(id: any, accion: any, lista_empleados: any, icono: any, editar: any, eliminar: any) {
    this.restPlan.BuscarPlanEmpleados(id).subscribe(res => {
      this.planEmpleados = res;
      this.tipo_accion = accion;
      this.lista_empleados = lista_empleados;
      this.ver_icono = icono;
      this.ver_editar = editar;
      this.ver_eliminar = eliminar;
    }, error => {
      this.restPlan.EliminarRegistro(id).subscribe(res => {
        this.toastr.warning('Planificación no ha sido asignada a ningún colaborador.', 'Registro Eliminado.', {
          timeOut: 6000,
        })
        this.ListarPlanificaciones();
      });
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

  AbrirEditarPlan(datoSeleccionado: any, forma: any) {

    this.ventana.open(EditarPlanHoraExtraComponent, {
      width: '600px',
      data: { planifica: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        if (forma === 'multiple') {
          var id = datoSeleccionado[0].id_plan;
        }
        else {
          id = datoSeleccionado.id_plan;
        }
        this.VerificarPlanificacion(id, '1', true, false);
        this.botonSeleccion = false;
        this.botonEditar = false;
        this.botonEliminar = false;
        //this.ver_editar = true;
        this.selectionUno.clear();
      });
  }

  // MÉTODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y EDITAR
  EditarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected;
    if (EmpleadosSeleccionados.length === 1) {
      this.AbrirEditarPlan(EmpleadosSeleccionados[0], 'individual');
    } else if (EmpleadosSeleccionados.length > 1) {
      this.AbrirEditarPlan(EmpleadosSeleccionados, 'multiple');
    }
    else {
      this.toastr.info('No ha seleccionado ningún registro.', 'Seleccionar registros.', {
        timeOut: 6000,
      })
    }
  }

  // VERIFICAR SI LA PLANIFICACIÓN TIENE DATOS DE EMPLEADOS
  VerificarPlanificacion(id: number, accion: any, editar: any, eliminar: any) {
    this.restPlan.BuscarPlanEmpleados(id).subscribe(res => {
      this.lista_empleados = true;
      this.planEmpleados = res;
      this.ver_eliminar = eliminar;
      this.tipo_accion = accion;
      this.ver_editar = editar;
      this.ver_icono = false;
    }, res => {
      this.restPlan.EliminarRegistro(id).subscribe(res => {
        this.tipo_accion = accion;
        this.lista_empleados = false;
        this.ver_icono = true;
        this.ver_editar = false;
        this.ver_eliminar = false;
        this.ListarPlanificaciones();
      });
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlan(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanEmpleado(datos.id_plan, datos.id_empleado, datos);
        }
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanEmpleado(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = moment.weekdays(moment(datos.fecha_desde).day()).charAt(0).toUpperCase() + moment.weekdays(moment(datos.fecha_desde).day()).slice(1);
    let hasta = moment.weekdays(moment(datos.fecha_hasta).day()).charAt(0).toUpperCase() + moment.weekdays(moment(datos.fecha_hasta).day()).slice(1);
    let h_inicio = moment(datos.hora_inicio, 'HH:mm').format('HH:mm');
    let h_fin = moment(datos.hora_fin, 'HH:mm').format('HH:mm');

    this.restPlan.EliminarPlanEmpleado(id_plan, id_empleado).subscribe(res => {
      this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.botonSeleccion = false;
      this.botonEditar = false;
      this.botonEliminar = false;
      this.selectionUno.clear();
      this.VerificarPlanificacion(id_plan, '2', false, true);
    });
  }

  // MÉTODO PARA LEER TODOS LOS DATOS SELECCIONADOS Y ELIMINAR
  EliminarRegistrosMultiple() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected;

    if (EmpleadosSeleccionados.length === 1) {
      this.ConfirmarDeletePlan(EmpleadosSeleccionados[0]);

    } else if (EmpleadosSeleccionados.length > 1) {
      this.ContarCorreos(EmpleadosSeleccionados);

      if (this.cont_correo <= this.correos) {
        this.ConfirmarDeletePlanMultiple(EmpleadosSeleccionados)
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

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  contar: number = 0;
  contar_eliminados: number = 0;
  ConfirmarDeletePlanMultiple(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanMultiple(datos, datos[0].id_plan);
        }
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanMultiple(datos: any, id_plan: number) {
    var usuario = '';

    this.contar_eliminados = 0;

    datos.map(obj => {

      console.log('ver datos seleccionados', obj)

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + obj.nombre + '</th><th>' + obj.cedula + '</th></tr>';

      // LECTURA DE DATOS DE LA PLANIFICACIÓN
      let desde = moment.weekdays(moment(obj.fecha_desde).day()).charAt(0).toUpperCase() + moment.weekdays(moment(obj.fecha_desde).day()).slice(1);
      let hasta = moment.weekdays(moment(obj.fecha_hasta).day()).charAt(0).toUpperCase() + moment.weekdays(moment(obj.fecha_hasta).day()).slice(1);
      let h_inicio = moment(obj.hora_inicio, 'HH:mm').format('HH:mm');
      let h_fin = moment(obj.hora_fin, 'HH:mm').format('HH:mm');


      this.restPlan.EliminarPlanEmpleado(obj.id_plan, obj.id_empleado).subscribe(res => {
        // CONTAR DATOS PROCESADOS
        this.contar_eliminados = this.contar_eliminados + 1;
        this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, obj.id_empleado);

        // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
        if (this.contar_eliminados === datos.length) {
          this.EnviarCorreo(datos[0], this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
          this.toastr.error('Se ha eliminado un total de ' + datos.length + ' registros.', '', {
            timeOut: 6000,
          });
          this.VerificarPlanificacion(id_plan, '2', false, true);
          this.botonSeleccion = false;
          this.botonEditar = false;
          this.botonEliminar = false;
          this.selectionUno.clear();
        }
      });
    })
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
  checkboxLabel(row?: PlanificacionHE): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
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
    this.ListarPlanificaciones();
    this.selectionUno.clear();
  }

  // MÉTODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACIÓN DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras eliminada desde ' +
        desde + ' ' + moment(datos.fecha_desde).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(datos.fecha_hasta).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_fin,
    }
    this.restPlan.EnviarNotiPlanificacion(mensaje).subscribe(res => {
    });
  }

  // MÉTODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE HORAS EXTRAS
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      id_empl_envia: this.idEmpleadoLogueado,
      observacion: datos.descripcion,
      proceso: 'eliminado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'ELIMINACION DE PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde + ' ' + moment(datos.fecha_desde).format('DD/MM/YYYY'),
      hasta: hasta + ' ' + moment(datos.fecha_hasta).format('DD/MM/YYYY'),
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // MÉTODO ENVIO DE CORREO DE PLANIFICACIÓN DE HE
    this.restPlan.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
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
    })
  }

  // METODO DE BUSQUEDA DE NUMERO PERMITIDO DE CORREOS
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

  // METODO PARA CONTAR NUMERO DE CORREOS A ENVIAR
  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      this.cont_correo = this.cont_correo + 1
      if (this.info_correo === '') {
        this.info_correo = obj.correo;
      }
      else {
        this.info_correo = this.info_correo + ', ' + obj.correo;
      }
    })
  }

}
