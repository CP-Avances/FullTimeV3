// LLAMADO A LAS LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// LLAMADO A LOS SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';

@Component({
  selector: 'app-editar-plan-comidas',
  templateUrl: './editar-plan-comidas.component.html',
  styleUrls: ['./editar-plan-comidas.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})
export class EditarPlanComidasComponent implements OnInit {

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaInicioF = new FormControl('', Validators.required);
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  fechaFinF = new FormControl('', Validators.required);
  fechaF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', Validators.required);
  extraF = new FormControl('', [Validators.required]);
  platosF = new FormControl('', Validators.required);
  tipoF = new FormControl('', Validators.required);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public PlanificacionComidasForm = new FormGroup({
    observacionForm: this.observacionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    fechaFinForm: this.fechaFinF,
    idComidaForm: this.idComidaF,
    horaFinForm: this.horaFinF,
    platosForm: this.platosF,
    extraForm: this.extraF,
    fechaForm: this.fechaF,
    tipoForm: this.tipoF,
  });

  idEmpleadoLogueado: any; // VARIABLE PARA ALMACENAR ID DE EMPLEADO QUE INICIA SESIÓN
  tipoComidas: any = []; // VARIABLE PARA ALMACENAR DATOS DE TIPOS DE COMIDAS
  empleados: any = []; // VARIABLE PARA ALMACENAR DATOS DE EMPLEADO
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  constructor(
    public dialogRef: MatDialogRef<EditarPlanComidasComponent>, // VENTANA EN FORMATO DIALOGO
    @Inject(MAT_DIALOG_DATA) public data: any, // PASAR DATOS DE LA VENTANA ANTERIOR
    private restH: EmpleadoHorariosService, // SERVICIO DATOS HORARIO DE EMPLEADOS
    public restPlan: PlanComidasService, // SERVICIO DATOS PLAN COMIDAS
    private rest: TipoComidasService, // SERVICIO DATOS TIPOS DE COMIDAS
    private toastr: ToastrService, // VARIABLE PARA MOSTRAR NOTIFICACIONES
    public restE: EmpleadoService, // SERVICIO DE DATOS DE EMPLEADOS
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    console.log('datos', this.data)
    this.ObtenerServicios();
    this.CargarDatos();
  }

  // MÉTODO PARA CARGAR LA INFORMACIÓN DE LA PLANIFICACIÓN SELECCIONADA EN EL FORMULARIO
  leer_dato: any;
  CargarDatos() {
    if (this.data.modo === 'individual') {
      this.leer_dato = this.data.solicitud;
    } else {
      this.leer_dato = this.data.solicitud[0];
    }
    this.PlanificacionComidasForm.patchValue({
      observacionForm: this.leer_dato.observacion,
      horaInicioForm: this.leer_dato.hora_inicio,
      fechaInicioForm: this.leer_dato.fec_inicio,
      fechaFinForm: this.leer_dato.fec_final,
      platosForm: this.leer_dato.id_detalle,
      idComidaForm: this.leer_dato.id_menu,
      horaFinForm: this.leer_dato.hora_fin,
      tipoForm: this.leer_dato.id_servicio,
    })
    if (this.leer_dato.extra === true) {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'true'
      })
    }
    else {
      this.PlanificacionComidasForm.patchValue({
        extraForm: 'false'
      })
    }
    this.ObtenerDatosComidas(this.leer_dato);
  }

  // MÉTODO PARA MOSTRAR DATOS DE SERVICIOS Y DETALLES DE MENÚ
  empleado_recibe: number; // ID DE EMPLEADO QUE RECIBE UNA NOTIFICACIÓN
  empleado_envia: number; // ID DE EMPLEADO QUE ENVIA UNA NOTIFICACIÓN
  ObtenerDatosComidas(lectura: any) {
    this.rest.ConsultarUnServicio(lectura.id_servicio).subscribe(datos => {
      this.tipoComidas = datos;
    })
    this.rest.ConsultarUnDetalleMenu(lectura.id_menu).subscribe(datos => {
      this.detalle = datos;
    });
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.PlanificacionComidasForm.patchValue({
      fechaForm: this.FechaActual
    })
    if (this.data.modo === 'individual') {
      this.ObtenerEmpleados(this.data.solicitud.id_empleado);
      this.empleado_envia = this.idEmpleadoLogueado;
      this.empleado_recibe = this.data.solicitud.id_empleado;
    }
    else {
      this.empleado_envia = this.idEmpleadoLogueado;
    }
  }

  // MÉTODO PARA CONSULTAR DATOS DE SERVICIOS DE COMIDAS
  servicios: any = []; // VARIABLE PARA GUARDAR DATOS DE SERVICIOS
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
    this.tipoComidas = [];
    this.platosF.reset();
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para este tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  // MÉTODO PARA BÚSQUEDA DE DETALLE DE MENÚS
  detalle: any = []; // VARIABLE PARA GUARDAR DATOS DE DETALLES DE MENÚ
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

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
    })
  }

  // MÉTODO PARA REGISTRAR PLANIFICACIÓN
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  contador: number = 0;
  contadorFechas: number = 0;
  InsertarPlanificacion(form) {
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinForm)) {
      if (this.data.modo === "multiple") {
        this.InsertarPlanificacionMultiple(form);
      }
      else {
        this.InsertarPlanificacionIndividual(form);
      }
    }
    else {
      this.toastr.info('La fecha final de planificación debe ser posterior a la fecha de inicio de planificación.', '', {
        timeOut: 6000,
      })
    }
  }

  /** *************************************************************************************************** *
   *     MÉTODOS PARA REALIZAR ACTUALIZACIÓN DE UNA PLANIFICACIÓN DE FORMA INDIVIDUAL - FICHA EMPLEADO    *
   ** *************************************************************************************************** *
   */
  // MÉTODO PARA TOMAR LOS DATOS INGRESADOS EN EL FORMULARIO 
  InsertarPlanificacionIndividual(form) {
    let datosPlanComida = {
      observacion: form.observacionForm,
      fec_comida: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      fecha: form.fechaForm,
      extra: form.extraForm,
    };
    this.VerificarDuplicidadIndividual(form, datosPlanComida);
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO YA TIENE UNA PLANIFICACIÓN REGISTRADA EN ESAS FECHAS
  VerificarDuplicidadIndividual(form, datosPlanComida) {
    let datosDuplicados = {
      id_plan_comida: this.data.solicitud.id,
      id: this.data.solicitud.id_empleado,
      fecha_inicio: form.fechaInicioForm,
      fecha_fin: form.fechaFinForm,
    }
    this.restPlan.BuscarDuplicadosFechasActualizar(datosDuplicados).subscribe(plan => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en las fechas ingresadas.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarHorarioEmpleado(form, datosPlanComida);
    });
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO TIENE REGISTRADO UN HORARIO EN LAS FECHAS INGRESADAS
  VerificarHorarioEmpleado(form, datosPlanComida) {
    let datosHorario = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinForm
    }
    this.restH.BuscarHorarioFechas(parseInt(this.empleados[0].codigo), datosHorario).subscribe(plan => {
      this.PlanificacionIndividual(form, datosPlanComida);
    }, error => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' no tiene registro de horario laboral en las fechas indicadas.', '', {
        timeOut: 6000,
      })
    });
  }

  // MÉTODO PARA ACTUALIZAR UN PLANIFICACIÓN, ELIMINAR LA ANTERIOR Y CREAR UNA NUEVA
  PlanificacionIndividual(form, datosPlanComida) {
    // MÉTODO PARA ELIMINAR PLANIFICACIÓN ANTERIOR
    this.restPlan.EliminarPlanComida(this.data.solicitud.id, this.data.solicitud.id_empleado).subscribe(plan => {
      // CREACIÓN DE LA PLANIFICACIÓN PARA UN EMPLEADO
      this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(plan => {
        // CONSULTAMOS EL ID DE LA ÚLTIMA PLANIFICACIÓN CREADA
        this.restPlan.ObtenerUltimaPlanificacion().subscribe(res => {
          // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
          this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
          this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
          this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
          // INICIALIZAR DATOS DE FECHA
          var start = new Date(this.inicioDate);
          var end = new Date(this.finDate);
          // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
          while (start <= end) {
            this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
            var newDate = start.setDate(start.getDate() + 1);
            start = new Date(newDate);
          }
          this.contadorFechas = 0;
          this.fechasHorario.map(obj => {
            let datosPlanEmpleado = {
              id_empleado: this.data.solicitud.id_empleado,
              hora_inicio: form.horaInicioForm,
              codigo: this.empleados[0].codigo,
              id_plan_comida: res[0].ultimo,
              hora_fin: form.horaFinForm,
              consumido: false,
              fecha: obj,
            }
            this.restPlan.CrearPlanComidasEmpleado(datosPlanEmpleado).subscribe(res => {
              this.contadorFechas = this.contadorFechas + 1;
              if (this.contadorFechas === this.fechasHorario.length) {
                this.EnviarNotificaciones(form.fechaInicioForm, form.fechaFinForm, form.horaInicioForm, form.horaFinForm, this.empleado_envia, this.empleado_recibe);
                this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Registrado.', {
                  timeOut: 6000,
                })
                this.CerrarRegistroPlanificacion();
              }
            });
          })
        });
      });
    });
  }

  /** *************************************************************************************************** *
   *     MÉTODOS PARA REALIZAR ACTUALIZACIÓN DE UNA PLANIFICACIÓN DE FORMA  MULTIPLE                      *
   ** *************************************************************************************************** *
   */

  // MÉTODO PARA TOMAR LOS DATOS INGRESADOS EN EL FORMULARIO 
  InsertarPlanificacionMultiple(form) {
    let datosPlanComida = {
      observacion: form.observacionForm,
      fec_comida: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
      id_comida: form.platosForm,
      hora_fin: form.horaFinForm,
      fecha: form.fechaForm,
      extra: form.extraForm,
    };
    this.VerificarDuplicidadMultiple(form, datosPlanComida);
  }

  // MÉTODO PARA VERIFICAR SI LOS EMPLEADOS TIENEN YA REGISTRADA UNA PLANIFICACIÓN
  empleados_conPlanificacion: any = [];
  empleados_sinPlanificacion: any = [];
  VerificarDuplicidadMultiple(form, datosPlanComida) {
    this.empleados_conPlanificacion = [];
    this.empleados_sinPlanificacion = [];
    var contar_seleccionados = 0;
    this.data.solicitud.map(obj => {
      let datosDuplicados = {
        fecha_inicio: form.fechaInicioForm,
        fecha_fin: form.fechaFinForm,
        id_plan_comida: obj.id,
        id: obj.id_empleado,
      }
      this.restPlan.BuscarDuplicadosFechasActualizar(datosDuplicados).subscribe(plan => {
        contar_seleccionados = contar_seleccionados + 1;
        this.empleados_conPlanificacion = this.empleados_conPlanificacion.concat(obj);
        if (contar_seleccionados === this.data.solicitud.length) {
          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      }, error => {
        contar_seleccionados = contar_seleccionados + 1;
        this.empleados_sinPlanificacion = this.empleados_sinPlanificacion.concat(obj);
        if (contar_seleccionados === this.data.solicitud.length) {
          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      });
    })
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO TIENE FECHA DE HORARIO REGISTRADA
  empleados_conHorario: any = [];
  empleados_sinHorario: any = [];
  VerificarHorariosEmpleadosMultiples(form, datosPlanComida, sin_planificacion, con_planificacion) {
    var contar_horario = 0;
    sin_planificacion.map(obj => {
      let datosHorario = {
        fechaInicio: form.fechaInicioForm,
        fechaFinal: form.fechaFinForm
      }
      this.restH.BuscarHorarioFechas(obj.codigo, datosHorario).subscribe(plan => {
        contar_horario = contar_horario + 1;
        this.empleados_conHorario = this.empleados_conHorario.concat(obj);
        if (contar_horario === sin_planificacion.length) {
          this.EliminarPlanificacion(form, datosPlanComida, this.empleados_conHorario);
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      }, error => {
        contar_horario = contar_horario + 1;
        this.empleados_sinHorario = this.empleados_sinHorario.concat(obj);
        if (contar_horario === sin_planificacion.length) {
          this.EliminarPlanificacion(form, datosPlanComida, this.empleados_conHorario);
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      });
    })
  }

  // MÉTODO PARA MOSTRAR MENSAJES CUANDO NO SE REALIZAR PLANIFICACIÓN 
  IndicarMensajePlanificados(array_datos: any) {
    if (array_datos.length != 0) {
      if (array_datos.length === this.data.solicitud.length) {
        this.toastr.info('No se ha registrado la planificación para ninguno de los empleado seleccionados.', 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
        this.dialogRef.close();
      }
      else {
        var nombres_empleados = '';
        array_datos.map(obj => {
          nombres_empleados = nombres_empleados + ' - ' + obj.nombre + ' ' + obj.apellido
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
      }
    }
  }

  // MÉTODO PARA MOSTRAR MENSAJES CUANDO NO TIENEN HORARIOS
  IndicarMensajeHorarios(array_datos: any, sin_planificacion) {
    if (array_datos.length != 0) {
      if (array_datos.length === sin_planificacion.length) {
        this.toastr.info('No se ha registrado la planificación para ninguno de los empleado seleccionados.', 'Empleados no tienen registrado un horario laboral en las fechas indicadas.', {
          timeOut: 12000,
        })
        this.dialogRef.close();
      }
      else {
        var nombres_empleados = '';
        array_datos.map(obj => {
          nombres_empleados = nombres_empleados + ' - ' + obj.nombre + ' ' + obj.apellido
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados no tienen registrado un horario laboral en las fechas indicadas.', {
          timeOut: 12000,
        })
      }
    }
  }

  // MÉTODO PARA ELIMINAR TODAS LAS PLANIFICACIONES
  contar_eliminar: number = 0;
  EliminarPlanificacion(form, datosPlanComida, empleados_planificados: any) {
    if (empleados_planificados.length != 0) {
      this.contar_eliminar = 0;
      empleados_planificados.map(obj => {
        this.restPlan.EliminarPlanComida(obj.id, obj.id_empleado).subscribe(plan => {
          this.contar_eliminar = this.contar_eliminar + 1;
          if (this.contar_eliminar === empleados_planificados.length) {
            this.PlanificarMultiple(form, datosPlanComida, empleados_planificados);
          }
        })
      })
    }
  }

  // MÉTODO PARA PLANIFICAR MULTIPLES EMPLEADOS
  PlanificarMultiple(form, datosPlanComida, empleados_planificados: any) {
    this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
    this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
    // CREACIÓN DE LA PLANIFICACIÓN PARA VARIOS EMPLEADOS
    this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(plan => {
      // CONSULTAMOS EL ID DE LA ÚLTIMA PLANIFICACIÓN CREADA
      this.restPlan.ObtenerUltimaPlanificacion().subscribe(res => {
        // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
        this.contador = 0;
        empleados_planificados.map(obj => {
          this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO
          // INICIALIZAR DATOS DE FECHA
          var start = new Date(this.inicioDate);
          var end = new Date(this.finDate);
          // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
          while (start <= end) {
            this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
            var newDate = start.setDate(start.getDate() + 1);
            start = new Date(newDate);
          }
          this.contadorFechas = 0;
          this.fechasHorario.map(fec => {
            let datosPlanEmpleado = {
              hora_inicio: form.horaInicioForm,
              id_plan_comida: res[0].ultimo,
              id_empleado: obj.id_empleado,
              hora_fin: form.horaFinForm,
              codigo: obj.codigo,
              consumido: false,
              fecha: fec,
            }
            this.restPlan.CrearPlanComidasEmpleado(datosPlanEmpleado).subscribe(res => {
              this.contadorFechas = this.contadorFechas + 1;
              if (this.contadorFechas === this.fechasHorario.length) {
                this.EnviarNotificaciones(form.fechaInicioForm, form.fechaFinForm, form.horaInicioForm, form.horaFinForm, this.empleado_envia, obj.id);
              }
            });
          })
          this.contador = this.contador + 1;
          if (this.contador === empleados_planificados.length) {
            this.dialogRef.close();
            this.toastr.success('Operación Exitosa', 'Se registra un total de  ' + empleados_planificados.length + ' Servicios de Alimetación Planificados.', {
              timeOut: 8000,
            })
          }
        })
      });
    });
  }

  // MÉTODO PARA ENVIAR CORREOS
  envios: any = [];
  EnviarNotificaciones(fecha_plan_inicio, fecha_plan_fin, h_inicio, h_fin, empleado_envia, empleado_recibe) {
    let datosCorreo = {
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      fecha_fin: moment(fecha_plan_fin).format('DD-MM-YYYY'),
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      hora_inicio: h_inicio,
      hora_fin: h_fin
    }
    this.restPlan.EnviarCorreoPlan(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe, fecha_plan_inicio, fecha_plan_fin);
      }
    });
  }

  // MÉTODO PARA ENVIAR NOTIFICACIONES
  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, fecha_inicio, fecha_fin) {
    let mensaje = {
      mensaje: 'Alimentación Planificada desde el ' + moment(fecha_inicio).format('YYYY-MM-DD') + ' al ' + moment(fecha_fin).format('YYYY-MM-DD'),
      id_empl_recive: empleado_recive,
      id_empl_envia: empleado_envia,
    }
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // MÉTODO DE CONTROL DE ERRORES
  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  // MÉTODO PARA SALIR DE LA VENTANA
  CerrarRegistroPlanificacion() {
    this.dialogRef.close();
  }

  // MÉTODO PARA INGRESAR SOLO LETRAS EN EL CAMPO DEL FORMULARIO
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
