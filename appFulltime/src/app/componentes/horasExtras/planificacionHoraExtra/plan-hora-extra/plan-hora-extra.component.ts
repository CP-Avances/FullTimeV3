import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-plan-hora-extra',
  templateUrl: './plan-hora-extra.component.html',
  styleUrls: ['./plan-hora-extra.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class PlanHoraExtraComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  fechaSolicitudF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  fechaFinF = new FormControl('', [Validators.required]);
  horaFinF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);

  public PedirHoraExtraForm = new FormGroup({
    fechaSolicitudForm: this.fechaSolicitudF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaInicioForm: this.horaInicioF,
    fechaFinForm: this.fechaFinF,
    horaFinForm: this.horaFinF,
    horasForm: this.horasF,
  });

  FechaActual: any;
  id_user_loggin: number;
  id_cargo_loggin: number;

  constructor(
    public restEmpleado: EmpleadoService,
    public ventana: MatDialogRef<PlanHoraExtraComponent>,
    public validar: ValidacionesService,
    private restPE: PlanHoraExtraService,
    private toastr: ToastrService,
    private restP: ParametrosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');

    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));

    this.PedirHoraExtraForm.patchValue({
      fechaSolicitudForm: this.FechaActual,
      estadoForm: 1
    });

    this.BuscarParametro();
  }

  // METODO DE VALIDACION DE INGRESO CORRECTO DE FECHAS
  ValidarFechas(form: any) {
    if (Date.parse(form.fechaInicioForm) <= Date.parse(form.fechaFinForm)) {
      this.InsertarPlanificacion(form);
    }
    else {
      this.toastr.info('Las fechas no se encuentran registradas correctamente.', 'VERIFICAR FECHAS', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA VALIDAR NUMERO DE CORREOS
  ValidarProceso(form: any) {
    if (this.data.planifica.length != undefined) {
      this.ContarCorreos(this.data.planifica);
      if (this.cont_correo <= this.correos) {
        this.ValidarFechas(form);
      }
      else {
        this.toastr.warning('Trata de enviar correo de un total de ' + this.cont_correo + ' colaboradores, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // METODO DE PLANIFICACION DE HORAS EXTRAS
  InsertarPlanificacion(form: any) {
    // DATOS DE PLANIFICACIÓN
    let planificacion = {
      id_empl_planifica: this.id_user_loggin,
      horas_totales: form.horasForm,
      fecha_desde: form.fechaInicioForm,
      hora_inicio: form.horaInicioForm,
      descripcion: form.descripcionForm,
      fecha_hasta: form.fechaFinForm,
      hora_fin: form.horaFinForm,
    }

    // INSERCIÓN DE PLANIFICACIÓN
    this.restPE.CrearPlanificacionHoraExtra(planificacion).subscribe(res => {

      if (res.message != 'error') {
        var plan = res.info;

        // LECTURA DE DATOS DE USUARIO
        let usuario = '<tr><th>' + this.data.planifica.nombre +
          '</th><th>' + this.data.planifica.cedula + '</th></tr>';
        let cuenta_correo = this.data.planifica.correo;

        // LECTURA DE DATOS DE LA PLANIFICACIÓN
        let desde = moment.weekdays(moment(plan.fecha_desde).day()).charAt(0).toUpperCase() + moment.weekdays(moment(plan.fecha_desde).day()).slice(1);
        let hasta = moment.weekdays(moment(plan.fecha_hasta).day()).charAt(0).toUpperCase() + moment.weekdays(moment(plan.fecha_hasta).day()).slice(1);
        let h_inicio = moment(plan.hora_inicio, 'HH:mm').format('HH:mm');
        let h_fin = moment(plan.hora_fin, 'HH:mm').format('HH:mm');

        // DATOS DE ASIGNACIÓN DE PLANIFICACIÓN A EMPLEADOS
        let planEmpleado = {
          estado: 1,
          codigo: this.data.planifica.codigo,
          observacion: false,
          id_plan_hora: plan.id,
          id_empl_cargo: this.data.planifica.id_cargo,
          id_empl_realiza: this.data.planifica.id,
          id_empl_contrato: this.data.planifica.id_contrato
        }

        // VALIDAR SI LA PLANIFICACIÓN ES DE VARIOS USUARIOS
        if (this.data.planifica.length != undefined) {
          this.CrearPlanSeleccionados(plan, planEmpleado, desde, hasta, h_inicio, h_fin);
        }
        else {
          this.CrearPlanificacion(plan, planEmpleado, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
        }
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'Proceso no registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    })
  }

  // CREAR PLANIFICACION DE USUARIOS SELECCIONADOS
  CrearPlanSeleccionados(plan: any, planEmpleado: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    var usuario = '';
    var cont = 0;
    var contPlan = 0;
    this.data.planifica.map(obj => {

      // LECTURA DE NOMBRES DE USUARIOS
      usuario = usuario + '<tr><th>' + obj.nombre + '</th><th>' + obj.cedula + '</th></tr>';

      // LECTURA DE DATOS DE TODOS LOS USUARIOS SELECCIONADOS
      planEmpleado.id_empl_contrato = obj.id_contrato;
      planEmpleado.id_empl_realiza = obj.id;
      planEmpleado.id_empl_cargo = obj.id_cargo;
      planEmpleado.id_plan_hora = plan.id;
      planEmpleado.codigo = obj.codigo;

      // INSERTAR PLANIFICACIÓN POR EMPLEADO
      this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

        if (response.message != 'error') {
          // ENVIAR NOTIFICACION DE PLANIFICACION HE
          this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, obj.id)

          // CONTAR DATOS PROCESADOS
          cont = cont + 1;
          contPlan = contPlan + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan);
          }
        } else {
          // CONTAR DATOS PROCESADOS
          cont = cont + 1;

          // SI TODOS LOS DATOS HAN SIDO PROCESADOS ENVIAR CORREO
          if (cont === this.data.planifica.length) {
            this.EnviarCorreo(plan, this.info_correo, usuario, desde, hasta, h_inicio, h_fin);
            this.MostrarMensaje(contPlan);
          }
        }
      });
    });
  }

  // MÉTODO PARA MOSTRAR MENSAJE PARA SELECCION MULTIPLE
  MostrarMensaje(contador: any) {
    this.toastr.success('Se registra planificación a ' + contador + ' colaboradores.', 'Planificación de Horas Extras.', {
      timeOut: 6000,
    });
    this.CerrarVentana();
  }

  // CREAR PLANIFICACIÓN DE UN SOLO USUARIO
  CrearPlanificacion(plan: any, planEmpleado: any, cuenta_correo: any, usuarios: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    this.restPE.CrearPlanHoraExtraEmpleado(planEmpleado).subscribe(response => {

      if (response.message != 'error') {
        this.NotificarPlanificacion(plan, desde, hasta, h_inicio, h_fin, this.data.planifica.id)

        this.EnviarCorreo(plan, cuenta_correo, usuarios, desde, hasta, h_inicio, h_fin);

        this.toastr.success('', 'Planificación de Horas Extras registrada.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'Proceso no registrado.', {
          timeOut: 6000,
        });
        this.CerrarVentana();
      }
    })
  }

  // METODO PARA CALCULAR HORAS SOLICITADAS
  CalcularTiempo(form) {
    // LIMPIAR CAMPO NÚMERO DE HORAS
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })

    // VALIDAR HORAS INGRESDAS
    if (form.horaInicioForm != '' && form.horaFinForm != '') {

      //FORMATO DE HORAS
      var inicio = moment.duration(moment(form.horaInicioForm, 'HH:mm:ss').format('HH:mm:ss'));
      var fin = moment.duration(moment(form.horaFinForm, 'HH:mm:ss').format('HH:mm:ss'));
      // RESTAR HORAS
      var resta = fin.subtract(inicio);
      var horas = String(resta.hours());
      var minutos = String(resta.minutes());

      if (resta.hours() < 10) {
        horas = '0' + resta.hours();
      }
      if (resta.minutes() < 10) {
        minutos = '0' + resta.minutes();
      }
      // COLOCAR FORMATO DE HORAS EN FORMULARIO
      var tiempoTotal: string = horas + ':' + minutos;
      this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
    }
    else {
      this.toastr.info('Debe ingresar la hora de inicio y la hora de fin de actividades.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  // MÉTODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.id_user_loggin,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACIÓN DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras desde ' +
        desde + ' ' + moment(datos.fecha_desde).format('DD/MM/YYYY') + ' hasta ' +
        hasta + ' ' + moment(datos.fecha_hasta).format('DD/MM/YYYY') +
        ' horario de ' + h_inicio + ' a ' + h_fin,
    }
    this.restPE.EnviarNotiPlanificacion(mensaje).subscribe(res => {
    });
  }

  // MÉTODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE HORAS EXTRAS
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'REALIZA',
      id_empl_envia: this.id_user_loggin,
      observacion: datos.descripcion,
      proceso: 'creado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde + ' ' + moment(datos.fecha_desde).format('DD/MM/YYYY'),
      hasta: hasta + ' ' + moment(datos.fecha_hasta).format('DD/MM/YYYY'),
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // MÉTODO ENVIO DE CORREO DE PLANIFICACIÓN DE HE
    this.restPE.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
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

  // METODOS DE VALIDACION DE INGRESO DE LETRAS Y NUMEROS
  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  // METODOS DE LIMIEZA DE FORMULARIOS Y CERRAR COMPONENTE
  LimpiarCampoHoras() {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

  CerrarVentana() {
    this.PedirHoraExtraForm.reset();
    this.ventana.close();
  }

}
