// LLAMADO A LAS LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// LLAMADO A LOS SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';

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
  fechaPlanificacionF = new FormControl('', Validators.required);
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  horaFinF = new FormControl('', Validators.required);
  platosF = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  extraF = new FormControl('', [Validators.required]);
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

  idEmpleadoLogueado: any; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIO SESIÓN
  departamento: any; // VARIABLE DE ALMACENAMIENTO DE ID DE DEPARTAMENTO DE EMPLEADO QUE INICIO SESIÓN
  FechaActual: any; // VARIABLE DE ALAMCENAMIENTO DE FECHA DEL DÍA DE HOY
  tipoComidas: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE TIPO DE COMIDAS
  empleados: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO

  constructor(
    public restUsuario: UsuarioService, // SERVICIO DE DATOS DE USUARIO
    public restPlan: PlanComidasService, // SERVICIO DE DATOS DE PLAN COMIDAS
    public ventana: MatDialogRef<EditarSolicitudComidaComponent>, // VARIABLE VENTANA DE DIÁLOGO
    public restH: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS DE EMPLEADO
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADO
    private informacion: DatosGeneralesService,
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    private rest: TipoComidasService, // SERVICIO DE DATOS DE TIPO DE COMIDAS
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE CON DATOS PASADOS DE LA VENTANA ANTERIOR
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    console.log('ver data de actualizacion ', this.data)
    this.ObtenerEmpleados(this.data.solicitud.id_empleado);
    this.ObtenerServicios();
    this.CargarDatos();
    this.ObtenerDatos();
  }

  // MÉTODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.data.solicitud.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
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
      idComidaForm: this.data.solicitud.id_menu,
      horaFinForm: this.data.solicitud.hora_fin,
      platosForm: this.data.solicitud.id_detalle,
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
      hora_inicio: inicio_hora,
      hora_fin: fin_hora,
      fecha: form.fechaPlanificacionForm,
      id: this.data.solicitud.id,
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
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
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
      id_departamento: depa_user_loggin,
    };
    this.restPlan.ActualizarSolicitudComida(datosPlanComida).subscribe(alimentacion => {

      console.log('ver data actualizada ', alimentacion)

      this.EnviarCorreo(alimentacion);
      this.NotificarPlanificacion(alimentacion);

      this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Actualizado.', {
        timeOut: 6000,
      })
      this.CerrarRegistroPlanificacion();
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
          tipo_solicitud: 'Servicio de alimentación actualizado por',
          fec_solicitud: solicitud + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY'),
          observacion: alimentacion.observacion,
          id_comida: alimentacion.id_comida,
          proceso: 'actualizado',
          estadoc: 'Pendiente de autorización',
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE SERVICIO DE ALIMENTACION',
          inicio: moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm'),
          final: moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm'),
          extra: alimentacion.extra,
          id: alimentacion.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          this.restPlan.EnviarCorreo(comida).subscribe(
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
  NotificarPlanificacion(alimentacion: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);
    let inicio = moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm');
    let final = moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm');

    let mensaje = {
      id_empl_envia: this.data.solicitud.id_empleado,
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha actualizado su solicitud de alimentación desde ' +
        desde + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY') +
        ' horario de ' + inicio + ' a ' + final + ' servicio ',
      id_comida: alimentacion.id_comida
    }

    alimentacion.EmpleadosSendNotiEmail.forEach(e => {
      mensaje.id_empl_recive = e.empleado;
      if (e.comida_noti) {
        this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
          console.log(res.message);
        })
      }
    })

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

  // MÉTODO PARA INDICAR ERROR EN EL INGRESO DE OBSERVACIONES
  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  // MÉTODO PARA CERRAR VENTANA DE DIÁLOGO
  CerrarRegistroPlanificacion() {
    this.ventana.close();
  }


}
