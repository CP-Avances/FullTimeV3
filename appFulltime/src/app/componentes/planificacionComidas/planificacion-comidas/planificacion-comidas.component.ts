import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';

@Component({
  selector: 'app-planificacion-comidas',
  templateUrl: './planificacion-comidas.component.html',
  styleUrls: ['./planificacion-comidas.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class PlanificacionComidasComponent implements OnInit {

  idComidaF = new FormControl('', Validators.required);
  idEmpleadoF = new FormControl('');
  fechaF = new FormControl('', [Validators.required]);
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinF = new FormControl('', Validators.required);
  horaInicioF = new FormControl('', Validators.required);
  horaFinF = new FormControl('', Validators.required);
  tipoF = new FormControl('', Validators.required);;
  platosF = new FormControl('', Validators.required);;
  extraF = new FormControl('', [Validators.required]);

  // asignar los campos en un formulario en grupo
  public PlanificacionComidasForm = new FormGroup({
    idComidaForm: this.idComidaF,
    idEmpleadoForm: this.idEmpleadoF,
    fechaForm: this.fechaF,
    observacionForm: this.observacionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinForm: this.fechaFinF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF,
    tipoForm: this.tipoF,
    platosForm: this.platosF,
    extraForm: this.extraF
  });

  tipoComidas: any = [];
  empleados: any = [];
  FechaActual: any;
  idEmpleadoLogueado: any;

  constructor(
    private toastr: ToastrService,
    private rest: TipoComidasService,
    public restE: EmpleadoService,
    public restH: EmpleadoHorariosService,
    public restPlan: PlanComidasService,
    public restUsuario: UsuarioService,
    public dialogRef: MatDialogRef<PlanificacionComidasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    console.log('datos', this.data, this.data.servicios)
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.MostrarDatos();
    this.ObtenerServicios();
  }

  verNombre: boolean = false;
  descripcion: string;
  empleado_recibe: number;
  empleado_envia: number;
  MostrarDatos() {
    this.PlanificacionComidasForm.patchValue({
      fechaForm: this.FechaActual,
      extraForm: 'false'
    });
    this.restUsuario.BuscarDatosUser(parseInt(this.idEmpleadoLogueado)).subscribe(data => {
      if (this.data.modo === 'individual') {
        this.ObtenerEmpleados(this.data.idEmpleado);
        this.empleado_envia = this.idEmpleadoLogueado;
        this.empleado_recibe = this.data.idEmpleado;
      }
      else {
        this.empleado_envia = this.idEmpleadoLogueado;
      }
    });
  }

  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
    })
  }

  // Al seleccionar un tipo de servicio se muestra la lista de menús registrados
  ObtenerPlatosComidas(form) {
    this.idComidaF.reset();
    this.platosF.reset();
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.tipoComidas = [];
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para esta tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  detalle: any = [];
  ObtenerDetalleMenu(form) {
    this.platosF.reset();
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.detalle = [];
    this.rest.ConsultarUnDetalleMenu(form.idComidaForm).subscribe(datos => {
      this.detalle = datos;
      console.log('servicio', this.detalle)
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

  // MÉTODO PARA OBTENER LA INFORMACIÓN DEL EMPLEADO
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
    })
  }

  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  contador: number = 0;
  contadorFechas: number = 0;
  InsertarPlanificacion(form) {
    let datosPlanComida = {
      fecha: form.fechaForm,
      id_comida: form.platosForm,
      observacion: form.observacionForm,
      fec_comida: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm,
      extra: form.extraForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinForm,
    };
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinForm)) {
      if (this.data.modo === "multiple") {
        //this.PlanificarMultiple(form, datosPlanComida);
        this.VerificarDuplicidadMultiple(form, datosPlanComida);

      }
      else {
        this.VerificarDuplicidadIndividual(form, datosPlanComida);
      }
    }
    else {
      this.toastr.info('La fecha de final de la planificación debe ser posterior a la fecha de inicio de la planificación.', '', {
        timeOut: 6000,
      })
    }
  }

  VerificarDuplicidadIndividual(form, datosPlanComida) {
    let datosDuplicados = {
      id: this.data.idEmpleado,
      fecha_inicio: form.fechaInicioForm,
      fecha_fin: form.fechaFinForm
    }
    this.restPlan.BuscarDuplicadosFechas(datosDuplicados).subscribe(plan => {
      console.log('datos fechas', plan)
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en las fechas ingresadas.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.VerificarHorarioEmpleado(form, datosPlanComida);
      console.log('datos fechas entra',)
    });
  }

  VerificarHorarioEmpleado(form, datosPlanComida) {
    let datosHorario = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinForm
    }
    this.restH.BuscarHorarioFechas(parseInt(this.empleados[0].codigo), datosHorario).subscribe(plan => {
      console.log('datos fechas', plan)
      this.PlanificacionIndividual(form, datosPlanComida);
    }, error => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' no tiene registro de horario laboral en las fechas indicadas.', '', {
        timeOut: 6000,
      })
      console.log('datos fechas entra',)
    });
  }


  PlanificacionIndividual(form, datosPlanComida) {
    // CREACIÓN DE LA PLANIFICACIÓN PARA UN EMPLEADO
    this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(plan => {
      // CONSULTAMOS EL ID DE LA ÚLTIMA PLANIFICACIÓN CREADA
      this.restPlan.ObtenerUltimaPlanificacion().subscribe(res => {
        console.log('ultima planificacion', res[0].ultimo);
        // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
        this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
        this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
        this.fechasHorario = []; // Array que contiene todas las fechas del mes indicado
        // Inicializar datos de fecha
        var start = new Date(this.inicioDate);
        var end = new Date(this.finDate);
        // Lógica para obtener el nombre de cada uno de los día del periodo indicado
        while (start <= end) {
          /* console.log(moment(start).format('dddd DD/MM/YYYY'), form.lunesForm)
           if (moment(start).format('dddd') === 'lunes' && form.lunesForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'martes' && form.martesForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'miércoles' && form.miercolesForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'jueves' && form.juevesForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'viernes' && form.viernesForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'sábado' && form.sabadoForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }
           if (moment(start).format('dddd') === 'domingo' && form.domingoForm === false) {
             this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
           }*/
          this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
          var newDate = start.setDate(start.getDate() + 1);
          start = new Date(newDate);
        }
        this.contadorFechas = 0;
        console.log('fechas', this.fechasHorario);
        this.fechasHorario.map(obj => {
          let datosPlanEmpleado = {
            codigo: this.empleados[0].codigo,
            id_empleado: this.data.idEmpleado,
            id_plan_comida: res[0].ultimo,
            fecha: obj,
            hora_inicio: form.horaInicioForm,
            hora_fin: form.horaFinForm,
            consumido: false
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
  }

  empleados_conPlanificacion: any = [];
  empleados_sinPlanificacion: any = [];
  VerificarDuplicidadMultiple(form, datosPlanComida) {
    this.empleados_conPlanificacion = [];
    this.empleados_sinPlanificacion = [];
    var contar_seleccionados = 0;
    this.data.servicios.map(obj => {
      let datosDuplicados = {
        id: obj.id,
        fecha_inicio: form.fechaInicioForm,
        fecha_fin: form.fechaFinForm
      }
      this.restPlan.BuscarDuplicadosFechas(datosDuplicados).subscribe(plan => {
        contar_seleccionados = contar_seleccionados + 1;
        this.empleados_conPlanificacion = this.empleados_conPlanificacion.concat(obj);
        console.log('contador ', contar_seleccionados, ' ' + this.data.servicios.length)
        if (contar_seleccionados === this.data.servicios.length) {
          console.log('datos fechas m', this.empleados_conPlanificacion)
          console.log('datos fechas entra m', this.empleados_sinPlanificacion)

          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      }, error => {
        contar_seleccionados = contar_seleccionados + 1;
        console.log('contador ', contar_seleccionados, ' ' + this.data.servicios.length)
        this.empleados_sinPlanificacion = this.empleados_sinPlanificacion.concat(obj);
        if (contar_seleccionados === this.data.servicios.length) {
          console.log('datos fechas m', this.empleados_conPlanificacion)
          console.log('datos fechas entra m', this.empleados_sinPlanificacion)



          /** MÉTODO PARA PLANIFICAR */
          this.VerificarHorariosEmpleadosMultiples(form, datosPlanComida, this.empleados_sinPlanificacion, this.empleados_conPlanificacion);
        }
      });
    })
  }

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
          console.log('entaaaaaaaa')
          /** MÉTODO PARA PLANIFICAR */
          this.PlanificarMultiple(form, datosPlanComida, this.empleados_conHorario);

          /** MÉTODO PARA INDICAR EMPLEADOS NO PLANIFICADOS */
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      }, error => {
        contar_horario = contar_horario + 1;
        this.empleados_sinHorario = this.empleados_sinHorario.concat(obj);
        if (contar_horario === sin_planificacion.length) {
          console.log('mmmmmkdfr')
          /** MÉTODO PARA PLANIFICAR */
          this.PlanificarMultiple(form, datosPlanComida, this.empleados_conHorario);

          /** MÉTODO PARA INDICAR EMPLEADOS NO PLANIFICADOS */
          this.IndicarMensajePlanificados(con_planificacion);
          this.IndicarMensajeHorarios(this.empleados_sinHorario, sin_planificacion);
        }
      });

    })

  }

  IndicarMensajePlanificados(array_datos: any) {
    if (array_datos.length != 0) {
      if (array_datos.length === this.data.servicios.length) {
        this.toastr.info('No se ha registrado la planificación para ninguno de los empleado seleccionados.', 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
        this.dialogRef.close();
      }
      else {
        var nombres_empleados = '';
        array_datos.map(obj => {
          nombres_empleados = nombres_empleados + ' - ' + obj.empleado
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados ya cuenta con una planificación registrada en las fechas indicas.', {
          timeOut: 12000,
        })
      }
    }
  }

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
          nombres_empleados = nombres_empleados + ' - ' + obj.empleado
        })
        this.toastr.info('No se ha registrado la planificación de los empleados ' + nombres_empleados, 'Empleados no tienen registrado un horario laboral en las fechas indicadas.', {
          timeOut: 12000,
        })
      }
    }
  }

  PlanificarMultiple(form, datosPlanComida, empleados_planificados: any) {
    if (empleados_planificados.length != 0) {
      this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
      this.finDate = moment(form.fechaFinForm).format('MM-DD-YYYY');
      // CREACIÓN DE LA PLANIFICACIÓN PARA VARIOS EMPLEADOS
      this.restPlan.CrearPlanComidas(datosPlanComida).subscribe(plan => {
        // CONSULTAMOS EL ID DE LA ÚLTIMA PLANIFICACIÓN CREADA
        this.restPlan.ObtenerUltimaPlanificacion().subscribe(res => {
          console.log('ultima planificacion', res[0].ultimo);
          // INDICAMOS A QUE EMPLEADO SE LE REALIZA UNA PLANIFICACIÓN
          this.contador = 0;
          empleados_planificados.map(obj => {
            this.fechasHorario = []; // Array que contiene todas las fechas del mes indicado
            // Inicializar datos de fecha
            var start = new Date(this.inicioDate);
            var end = new Date(this.finDate);
            // Lógica para obtener el nombre de cada uno de los día del periodo indicado
            while (start <= end) {
              /* console.log(moment(start).format('dddd DD/MM/YYYY'), form.lunesForm)
               if (moment(start).format('dddd') === 'lunes' && form.lunesForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'martes' && form.martesForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'miércoles' && form.miercolesForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'jueves' && form.juevesForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'viernes' && form.viernesForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'sábado' && form.sabadoForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }
               if (moment(start).format('dddd') === 'domingo' && form.domingoForm === false) {
                 this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
               }*/
              this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
              var newDate = start.setDate(start.getDate() + 1);
              start = new Date(newDate);
            }
            this.contadorFechas = 0;
            this.fechasHorario.map(fec => {
              let datosPlanEmpleado = {
                codigo: obj.codigo,
                id_empleado: obj.id,
                id_plan_comida: res[0].ultimo,
                fecha: fec,
                hora_inicio: form.horaInicioForm,
                hora_fin: form.horaFinForm,
                consumido: false
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
              //window.location.reload();
              this.toastr.success('Operación Exitosa', 'Se registra un total de  ' + empleados_planificados.length + ' Servicios de Alimetación Planificados.', {
                timeOut: 8000,
              })
            }
          })
        });
      });
    }
  }

  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  CerrarRegistroPlanificacion() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  LimpiarCampos() {
    this.PlanificacionComidasForm.reset();
    this.ObtenerServicios();
  }

  envios: any = [];
  EnviarNotificaciones(fecha_plan_inicio, fecha_plan_fin, h_inicio, h_fin, empleado_envia, empleado_recibe) {
    let datosCorreo = {
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      fecha_fin: moment(fecha_plan_fin).format('DD-MM-YYYY'),
      hora_inicio: h_inicio,
      hora_fin: h_fin
    }
    this.restPlan.EnviarCorreoPlan(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      console.log('datos envio', this.envios.notificacion);
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe, fecha_plan_inicio, fecha_plan_fin);
      }
    });
  }

  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, fecha_inicio, fecha_fin) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: 'Alimentación Planificada desde el ' + moment(fecha_inicio).format('YYYY-MM-DD') + ' al ' + moment(fecha_fin).format('YYYY-MM-DD')
    }
    console.log(mensaje);
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
      console.log(res.message);
    })
  }


  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
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
