import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-solicita-comida',
  templateUrl: './solicita-comida.component.html',
  styleUrls: ['./solicita-comida.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class SolicitaComidaComponent implements OnInit {

  fechaPlanificacionF = new FormControl('', Validators.required);
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  idEmpleadoF = new FormControl('');
  horaInicioF = new FormControl('', Validators.required);
  idComidaF = new FormControl('', Validators.required);
  horaFinF = new FormControl('', Validators.required);
  platosF = new FormControl('', Validators.required);;
  fechaF = new FormControl('', [Validators.required]);
  extraF = new FormControl('', [Validators.required]);
  tipoF = new FormControl('', Validators.required);;

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public PlanificacionComidasForm = new FormGroup({
    fechaPlanificacionForm: this.fechaPlanificacionF,
    observacionForm: this.observacionF,
    horaInicioForm: this.horaInicioF,
    idComidaForm: this.idComidaF,
    horaFinForm: this.horaFinF,
    platosForm: this.platosF,
    fechaForm: this.fechaF,
    extraForm: this.extraF,
    tipoForm: this.tipoF,
  });

  tipoComidas: any = [];
  empleados: any = [];

  departamento: any;
  FechaActual: any;

  constructor(
    private toastr: ToastrService,
    private rest: TipoComidasService,
    public restE: EmpleadoService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<SolicitaComidaComponent>,
    public restPlan: PlanComidasService,
    public restUsuario: UsuarioService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    console.log('datos', this.data, this.data.servicios, 'departamento', this.departamento)
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerServicios();
    this.ObtenerEmpleados(this.data.idEmpleado);

  }

  // METODO PARA OBTENER LISTA DE SERVICIOS DE ALIMENTACION
  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
    })
  }

  // AL SELECCIONAR UN TIPO DE SERVICIO SE MUESTRA LA LISTA DE MENÚS REGISTRADOS
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

  // METODO DE BUSQUEDA DE DETALLES DE ALIMENTACION
  detalle: any = [];
  ObtenerDetalleMenu(form) {
    this.platosF.reset();
    this.horaInicioF.reset();
    this.horaFinF.reset();
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      this.PlanificacionComidasForm.patchValue({
        fechaForm: this.FechaActual,
        extraForm: 'false'
      })
    })
  }

  // METODO PARA REGISTRAR SOLICITUD DE ALIMENTACION
  contador: number = 0;
  InsertarPlanificacion(form) {
    // DATOS DE PLANIFICACION
    let datosPlanComida = {
      id_departamento: parseInt(localStorage.getItem('departamento')),
      id_empleado: this.data.idEmpleado,
      observacion: form.observacionForm,
      hora_inicio: form.horaInicioForm,
      fec_comida: form.fechaPlanificacionForm,
      id_comida: form.platosForm,
      verificar: 'NO',
      hora_fin: form.horaFinForm,
      fecha: form.fechaForm,
      extra: form.extraForm,
    };
    // VERIFICAR SI EXISTE UNA SOLICITUD O PLANIFICACION REGISTRADA
    let datosDuplicados = {
      id: this.data.idEmpleado,
      fecha_fin: form.fechaPlanificacionForm,
      fecha_inicio: form.fechaPlanificacionForm,
    }
    // METODO PARA BUSCAR DATOS DUPLICADOS
    this.restPlan.BuscarDuplicadosFechas(datosDuplicados).subscribe(plan => {
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en la fecha solicitada.', '', {
        timeOut: 6000,
      })
    }, error => {
      // METODO PARA CREAR SOLICITUD DE ALIMENTACION
      this.restPlan.CrearSolicitudComida(datosPlanComida).subscribe(alimentacion => {
        this.SendEmailsEmpleados(alimentacion);
        this.NotificarPlanificacion(alimentacion);
        this.toastr.success('Operación Exitosa', 'Solicitud registrada.', {
          timeOut: 6000,
        });
        this.CerrarRegistroPlanificacion();
      });
    });
  }

  // METODO PARA ENVIO DE NOTIFICACION
  NotificarPlanificacion(alimentacion: any) {

    // MÉTODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE ALIMENTACIÓN
    let desde = moment.weekdays(moment(alimentacion.fec_comida).day()).charAt(0).toUpperCase() + moment.weekdays(moment(alimentacion.fec_comida).day()).slice(1);
    let inicio = moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm');
    let final = moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm');

    let mensaje = {
      id_empl_envia: this.data.idEmpleado,
      id_empl_recive: '',
      tipo: 1, // SOLICITUD SERVICIO DE ALIMENTACIÓN
      mensaje: 'Ha solicitado un servicio de alimentación desde ' +
        desde + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY') +
        ' horario de ' + inicio + ' a ' + final,
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

  // METODO PARA ENVIO DE CORREO
  SendEmailsEmpleados(alimentacion: any) {
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
        let datosServicioCreado = {
          fec_solicitud: solicitud + ' ' + moment(alimentacion.fec_comida).format('DD/MM/YYYY'),
          inicio: moment(alimentacion.hora_inicio, 'HH:mm').format('HH:mm'),
          final: moment(alimentacion.hora_fin, 'HH:mm').format('HH:mm'),
          id_comida: alimentacion.id_comida,
          observacion: alimentacion.observacion,
          id_usua_solicita: alimentacion.id_empleado,
          extra: alimentacion.extra,
          correo: correo_usuarios,
          id: alimentacion.id,
          solicitado_por: this.empleados[0].nombre + ' ' + this.empleados[0].apellido
        }
        if (correo_usuarios != '') {
          this.restPlan.EnviarCorreo(datosServicioCreado).subscribe(
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


  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  CerrarRegistroPlanificacion() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  LimpiarCampos() {
    this.PlanificacionComidasForm.reset();
    this.ObtenerServicios();
  }

}
