// LLAMADO A LAS LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// LLAMADO A LOS SERVICIOS
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-editar-solicitud-comida',
  templateUrl: './editar-solicitud-comida.component.html',
  styleUrls: ['./editar-solicitud-comida.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarSolicitudComidaComponent implements OnInit {

  // VALIDACIONES DE LOS CAMPOS DEL FORMULARIO
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaPlanificacionF = new FormControl('', Validators.required);
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', Validators.required);
  extraF = new FormControl('', [Validators.required]);
  platosF = new FormControl('', Validators.required);
  tipoF = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO DE UN GRUPO
  public PlanificacionComidasForm = new FormGroup({
    fechaPlanificacionForm: this.fechaPlanificacionF,
    observacionForm: this.observacionF,
    horaInicioForm: this.horaInicioF,
    idComidaForm: this.idComidaF,
    horaFinForm: this.horaFinF,
    platosForm: this.platosF,
    extraForm: this.extraF,
    fechaForm: this.fechaF,
    tipoForm: this.tipoF,
  });

  tipoComidas: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE TIPO DE COMIDAS
  empleados: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  FechaActual: any; // VARIABLE DE ALAMCENAMIENTO DE FECHA DEL DÍA DE HOY
  idEmpleadoLogueado: any; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIO SESIÓN
  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN

  constructor(
    public dialogRef: MatDialogRef<EditarSolicitudComidaComponent>, // VARIABLE VENTANA DE DIÁLOGO
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE CON DATOS PASADOS DE LA VENTANA ANTERIOR
    public restH: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS DE EMPLEADO
    public restPlan: PlanComidasService, // SERVICIO DE DATOS DE PLAN COMIDAS
    public restUsuario: UsuarioService, // SERVICIO DE DATOS DE USUARIO
    private rest: TipoComidasService, // SERVICIO DE DATOS DE TIPO DE COMIDAS
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.data.solicitud.id_empleado);
    this.ObtenerServicios();
    this.CargarDatos();
  }

  // MÉTODO PARA MOSTRAR LA INFORMCIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      this.PlanificacionComidasForm.patchValue({
        fechaForm: this.FechaActual,
        extraForm: 'false'
      })
    })
  }

  // MÉTODO PARA CARGAR LA INFORMACIÓN DE LA PLANIFICACIÓN SELECCIONADA EN EL FORMULARIO
  CargarDatos() {
    this.rest.ConsultarUnServicio(this.data.solicitud.id_servicio).subscribe(datos => {
      this.tipoComidas = datos;
    })
    this.rest.ConsultarUnDetalleMenu(this.data.solicitud.id_menu).subscribe(datos => {
      this.detalle = datos;
    });
    this.PlanificacionComidasForm.patchValue({
      fechaPlanificacionForm: this.data.solicitud.fec_comida,
      observacionForm: this.data.solicitud.observacion,
      horaInicioForm: this.data.solicitud.hora_inicio,
      platosForm: this.data.solicitud.id_detalle,
      idComidaForm: this.data.solicitud.id_menu,
      horaFinForm: this.data.solicitud.hora_fin,
      tipoForm: this.data.solicitud.id_servicio,
    })
    if (this.data.solicitud.extra === true) {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'true'
      })
    }
    else {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'false'
      })
    }
  }

  // MÉTODO PARA BUSCAR SERVICIO DE ALIMENTACIÓN
  servicios: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE SERVICIOS
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
    })
  }

  // AL SELECCIONAR UN TIPO DE SERVICIO SE MUESTRA LA LISTA DE MENÚS REGISTRADOS
  ObtenerPlatosComidas(form) {
    this.horaInicioF.reset();
    this.idComidaF.reset();
    this.horaFinF.reset();
    this.platosF.reset();
    this.tipoComidas = [];
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para esta tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  // MÉTODO DE BÚSQUEDA DE DETALLES DE MENÚS
  detalle: any = [];
  ObtenerDetalleMenu(form) {
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.platosF.reset();
    this.detalle = [];
    this.rest.ConsultarUnDetalleMenu(form.idComidaForm).subscribe(datos => {
      this.detalle = datos;
      this.PlanificacionComidasForm.patchValue({
        horaInicioForm: this.detalle[0].hora_inicio,
        horaFinForm: this.detalle[0].hora_fin
      })
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registros de Alimentación para este Menú.', {
        timeOut: 6000,
      })
    })
  }

  InsertarPlanificacion(form) {
    let datosDuplicados = {
      id_sol_comida: this.data.solicitud.id,
      id: this.data.solicitud.id_empleado,
      fecha_inicio: form.fechaInicioForm,
      fecha_fin: form.fechaFinForm,
    }
    this.restPlan.BuscarDuplicadosSolFechasActualizar(datosDuplicados).subscribe(plan => {
      console.log('datos fechas', plan)
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en la fecha solicitada.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarSolicitudEmpleado(form);
    });
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO TIENE SOLICITADO UN SERVICIO DE ALIMENTACIÓN
  VerificarSolicitudEmpleado(form) {
    // SUMA DE UN MINUTO A LA HORA INICIO DE SERVICIO DE ALIMENTACIÓN
    var inicio_hora = moment(form.horaInicioForm, 'HH:mm:ss').add(moment.duration("00:01:00")).format('HH:mm:ss');
    // RESTA DE UN MINUTO A LA HORA FINAL DE SERVICIO DE ALIMENTACIÓN
    var fin_hora = moment(form.horaFinForm, "HH:mm:ss").subtract(moment.duration("00:01:00")).format("HH:mm:ss");
    let datosSolicitud = {
      id_empleado: this.data.solicitud.id_empleado,
      fecha: form.fechaPlanificacionForm,
      id: this.data.solicitud.id,
      hora_inicio: inicio_hora,
      hora_fin: fin_hora,
    }
    this.restPlan.BuscarDuplicadosSolicitudFechas(datosSolicitud).subscribe(plan => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene realizada una solicitud de servicio de alimentación en la fecha indicada.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarHorarioEmpleado(form);
    });
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO TIENE REGISTRADO UN HORARIO EN LAS FECHAS INGRESADAS
  VerificarHorarioEmpleado(form) {
    let datosHorario = {
      fechaInicio: form.fechaPlanificacionForm,
      fechaFinal: form.fechaPlanificacionForm
    }
    this.restH.BuscarHorarioFechas(parseInt(this.empleados[0].codigo), datosHorario).subscribe(plan => {
      this.ActualizarSolicitud(form);
    }, error => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' no tiene registro de horario laboral en las fechas indicadas.', '', {
        timeOut: 6000,
      })
    });
  }

  // MÉTODO PARA ACTUALIZAR LA SOLICITUD SELECCIONADA
  ActualizarSolicitud(form) {
    let datosPlanComida = {
      id_empleado: this.data.solicitud.id_empleado,
      fec_comida: form.fechaPlanificacionForm,
      observacion: form.observacionForm,
      hora_inicio: form.horaInicioForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      id: this.data.solicitud.id,
      fecha: form.fechaForm,
      extra: form.extraForm,
    };
    this.restPlan.ActualizarSolicitudComida(datosPlanComida).subscribe(response => {
      if (this.data.modo === 'administrador') {
        this.EnviarNotificacionesSolicitud(form.fechaPlanificacionForm, form.horaInicioForm, form.horaFinForm, this.idEmpleadoLogueado, this.data.solicitud.id_empleado);
      }
      else {
        this.EnviarNotificaciones(form.fechaPlanificacionForm, form.horaInicioForm, form.horaFinForm);
      }
      this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Actualizado.', {
        timeOut: 6000,
      })
      this.CerrarRegistroPlanificacion();
    });
  }

  // MÉTODO PARA INDICAR ERROR EN EL INGRESO DE OBSERVACIONES
  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  // MÉTODO PARA CERRAR VENTANA DE DIÁLOGO
  CerrarRegistroPlanificacion() {
    this.dialogRef.close();
  }

  // MÉTODO PARA ENVIAR A TODOS LOS JEFES CAMBIOS EN LA SOLICITUD ENVIADA
  envios: any = []; // VARIABLE PARA ALMACENAR DATOS DE ENVIOS DE NOTIFICACIONES
  jefes: any = []; // VARIABLE PARA ALMACENAR DATOS DE JEFES INMEDIATOS
  EnviarNotificaciones(fecha: any, h_inicio: any, h_fin: any) {
    var nota = 'Solicitó Alimentación ' + ' para ' + moment(fecha).format('YYYY-MM-DD')
    this.restPlan.obtenerJefes(this.departamento).subscribe(data => {
      this.jefes = [];
      this.jefes = data;
      this.jefes.map(obj => {
        let datosCorreo = {
          id_usua_solicita: this.data.solicitud.id_empleado,
          fecha: moment(fecha).format('YYYY-MM-DD'),
          comida_mail: obj.comida_mail,
          comida_noti: obj.comida_noti,
          hora_inicio: h_inicio,
          correo: obj.correo,
          hora_fin: h_fin
        }
        this.restPlan.EnviarCorreo(datosCorreo).subscribe(envio => {
          this.envios = [];
          this.envios = envio;
          if (this.envios.notificacion === true) {
            this.NotificarPlanificacion(this.data.solicitud.id_empleado, obj.empleado, nota);
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
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // MÉTODO PARA ENVIAR CORREO AL EMPLEADO INDICANDO QUE SE ACTUALIZÓ LOS DATOS DE SU SOLICITUD
  EnviarNotificacionesSolicitud(fecha_plan_inicio: any, h_inicio: any, h_fin: any, empleado_envia: any, empleado_recibe: any) {
    var nota = 'Actualizó su Solicitud de Alimentación.';
    let datosCorreo = {
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      hora_inicio: h_inicio,
      hora_fin: h_fin
    }
    this.restPlan.EnviarCorreoSolicitudActualizada(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe, nota);
      }
    });
  }

  // MÉTODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

}
