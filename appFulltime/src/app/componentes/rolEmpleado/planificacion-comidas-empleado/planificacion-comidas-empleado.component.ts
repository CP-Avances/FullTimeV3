//LLAMADO A LAS LIBRERIAS
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A LOS COMPONENTES
import { EditarSolicitudComidaComponent } from '../../planificacionComidas/editar-solicitud-comida/editar-solicitud-comida.component';
import { SolicitaComidaComponent } from '../../planificacionComidas/solicita-comida/solicita-comida.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

// LLAMADO A LOS SERVICIOS
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-planificacion-comidas-empleado',
  templateUrl: './planificacion-comidas-empleado.component.html',
  styleUrls: ['./planificacion-comidas-empleado.component.css']
})

export class PlanificacionComidasEmpleadoComponent implements OnInit {

  idEmpleado: string; // VARIABLE QUE ALMACENA ID DEL EMPLEADO QUE INICIA SESIÓN
  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public restPlanComidas: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS
    public vistaRegistrarDatos: MatDialog, // VARIABLE DE VENTANA DE DIÁLOGO
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public router: Router, // VARIABLE PARA NAVEGAR ENTRE PÁGINAS
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
  }

  // MÉTODO PARA MOSTRAR DETERMINADO NÚMERO DE FILAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN 
  planComidas: any; // VARIABLE PARA ALMACENAR DATOS DE PLAN COMIDAS
  obtenerPlanComidasEmpleado(id_empleado: number) {
    this.planComidas = [];
    this.restPlanComidas.ObtenerPlanComidaPorIdEmpleado(id_empleado).subscribe(res => {
      this.planComidas = res;
      this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol => {
        this.planComidas = this.planComidas.concat(sol);
      });
    }, error => {
      this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol2 => {
        this.planComidas = sol2;
      });
    });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirEditarPlanComidas(datoSeleccionado): void {
    console.log(datoSeleccionado);
    this.VentanaEditarPlanComida(datoSeleccionado, EditarSolicitudComidaComponent, 'empleado')
  }

  // VENTANA PARA ABRIR LA VENTANA DE SOLICITUD DE COMIDAS
  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.vistaRegistrarDatos.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, fecha: any, h_inicio: any, h_fin: any) {
    this.restPlanComidas.EliminarSolicitud(id_plan).subscribe(res => {
      this.EnviarNotificaciones(fecha, h_inicio, h_fin);
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlanComidas(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanComidas(datos.id, datos.fec_comida, datos.hora_inicio, datos.hora_fin);
        } else {
          this.router.navigate(['/almuerzosEmpleado/', this.idEmpleado]);
        }
      });
  }

  // VENTANA PARA INGRESAR SOLICITUD DE COMIDAS 
  AbrirVentanaPlanificacion(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(SolicitaComidaComponent, {
      width: '1200px',
      data: { idEmpleado: this.idEmpleado, modo: 'solicitud' }
    })
      .afterClosed().subscribe(item => {
        this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
      });
  }

  // MÉTODO PARA ENVIAR A TODOS LOS JEFES NOTIFICACIÓN DE ELIMINACIÓN DE SOLICITUD
  envios: any = []; // VARIABLE PARA ALMACENAR DATOS DE ENVIOS DE NOTIFICACIONES
  jefes: any = []; // VARIABLE PARA ALMACENAR DATOS DE JEFES INMEDIATOS
  EnviarNotificaciones(fecha: any, h_inicio: any, h_fin: any) {
    var nota = 'Eliminó Solicitud Servicio de Alimentación.'
    this.restPlanComidas.obtenerJefes(this.departamento).subscribe(data => {
      this.jefes = [];
      this.jefes = data;
      this.jefes.map(obj => {
        let datosCorreo = {
          id_usua_solicita: parseInt(this.idEmpleado),
          fecha: moment(fecha).format('YYYY-MM-DD'),
          comida_mail: obj.comida_mail,
          comida_noti: obj.comida_noti,
          hora_inicio: h_inicio,
          correo: obj.correo,
          hora_fin: h_fin
        }
        this.restPlanComidas.EnviarCorreoEliminarSol(datosCorreo).subscribe(envio => {
          this.envios = [];
          this.envios = envio;
          if (this.envios.notificacion === true) {
            this.NotificarPlanificacion(parseInt(this.idEmpleado), obj.empleado, nota);
          }
        });
      })
    });
  }

  // MÉTODO PARA ENVIAR NOTIFICACIÓN AL SISTEMA DE LA ACTUALIZACIÓN DE DATOS DE SOLICITUD
  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, nota: any) {
    let mensaje = {
      id_empl_recive: empleado_recive,
      id_empl_envia: empleado_envia,
      mensaje: nota
    }
    this.restPlanComidas.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

}
