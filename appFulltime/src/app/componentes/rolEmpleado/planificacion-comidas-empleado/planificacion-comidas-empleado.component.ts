//LLAMADO A LAS LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';

// LLAMADO A LOS COMPONENTES
import { EditarSolicitudComidaComponent } from '../../planificacionComidas/editar-solicitud-comida/editar-solicitud-comida.component';
import { SolicitaComidaComponent } from '../../planificacionComidas/solicita-comida/solicita-comida.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

// LLAMADO A LOS SERVICIOS
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-planificacion-comidas-empleado',
  templateUrl: './planificacion-comidas-empleado.component.html',
  styleUrls: ['./planificacion-comidas-empleado.component.css']
})

export class PlanificacionComidasEmpleadoComponent implements OnInit {

  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN
  idEmpleado: string; // VARIABLE QUE ALMACENA ID DEL EMPLEADO QUE INICIA SESIÓN
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;

  constructor(
    public restP: PlanComidasService, // SERVICIO DE DATOS PLAN COMIDAS
    public ventana: MatDialog, // VARIABLE DE VENTANA DE DIÁLOGO
    public router: Router, // VARIABLE PARA NAVEGAR ENTRE PÁGINAS
    private informacion: DatosGeneralesService,
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerListaComidas(parseInt(this.idEmpleado));
    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(datos => {
      this.actuales = datos;
    });
  }

  // MÉTODO PARA MOSTRAR DETERMINADO NÚMERO DE FILAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACIÓN 
  planComidas: any; // VARIABLE PARA ALMACENAR DATOS DE PLAN COMIDAS
  ObtenerListaComidas(id_empleado: number) {
    this.planComidas = [];
    this.restP.ObtenerPlanComidaPorIdEmpleado(id_empleado).subscribe(res => {
      this.planComidas = res;
      this.restP.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol => {
        this.planComidas = this.planComidas.concat(sol);

        console.log('ver lista de comidas ', this.planComidas)
      });
    }, error => {
      this.restP.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol2 => {
        this.planComidas = sol2;
        console.log('ver lista de comidas ', this.planComidas)
      });
    });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO -- SOLICITUD DE ALIMENTACIÓN
  EliminarSolicitaComida(id_solicitud: number) {
    console.log('id solicitud ---- ', id_solicitud);
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    this.restP.EliminarSolicitud(id_solicitud).subscribe(res => {
      console.log(res);
      var datos = {
        depa_user_loggin: depa_user_loggin,
        objeto: res,
      }
      console.log(datos);
      this.informacion.BuscarJefes(datos).subscribe(alimentacion => {
        console.log(alimentacion);
        this.NotificarEvento(alimentacion);
        this.EnviarCorreo(alimentacion);
        this.toastr.error('Solicitud de alimentación eliminada.', '', {
          timeOut: 6000,
        });
      });
      this.ObtenerListaComidas(parseInt(this.idEmpleado));
    });
  }

  // METODO PARA ENVIO DE CORREO
  EnviarCorreo(alimentacion: any) {
    var cont = 0;
    var correo_usuarios = '';

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let solicitud = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE ALIMENTACIÓN
      if (e.comida_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      if (cont === alimentacion.EmpleadosSendNotiEmail.length) {
        let comida = {
          id_usua_solicita: alimentacion.id_empleado,
          tipo_solicitud: 'Servicio de alimentación eliminado por',
          fec_solicitud: solicitud + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY'),
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'eliminado',
          correo: correo_usuarios,
          asunto: 'ELIMINACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm'),
          final: moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm'),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restP.EnviarCorreo(comida).subscribe(
            resp => {
              if (resp.message === 'ok') {
                this.toastr.success('Correo de solicitud enviado exitosamente.', '', {
                  timeOut: 6000,
                });
              }
              else {
                this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de solicitud.', {
                  timeOut: 6000,
                });
              }
            },
            err => {
              this.toastr.error(err.error.message, '', {
                timeOut: 6000,
              });
            },
            () => { },
          )
        }
      }
    })
  }

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarEvento(alimentacion: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);
    let inicio = moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm');
    let final = moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm');

    let mensaje = {
      id_empl_envia: parseInt(this.idEmpleado),
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha eliminado su solicitud de alimentación desde ' +
        desde + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY') +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.restP.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
        })
      }
    })

  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminar(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarSolicitaComida(datos.id);
        } else {
          this.router.navigate(['/almuerzosEmpleado/', this.idEmpleado]);
        }
      });
  }

  // VENTANA PARA INGRESAR SOLICITUD DE COMIDAS 
  AbrirVentanaSolicitar(): void {
    console.log(this.idEmpleado);
    this.ventana.open(SolicitaComidaComponent, {
      width: '1200px',
      data: { idEmpleado: this.idEmpleado, modo: 'solicitud' }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerListaComidas(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirVentanaEditar(datoSeleccionado): void {
    console.log(datoSeleccionado);
    this.VentanaEditar(datoSeleccionado, EditarSolicitudComidaComponent)
  }

  // VENTANA PARA ABRIR LA VENTANA DE SOLICITUD DE COMIDAS
  VentanaEditar(datoSeleccionado: any, componente: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerListaComidas(parseInt(this.idEmpleado));
      });
  }


}
