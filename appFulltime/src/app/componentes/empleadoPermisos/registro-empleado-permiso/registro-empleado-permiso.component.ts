// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// INVOCACIÓN A LOS SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-registro-empleado-permiso',
  templateUrl: './registro-empleado-permiso.component.html',
  styleUrls: ['./registro-empleado-permiso.component.css'],
  // FORMATO DE INGRESO DE LA FECHA DD/MM/YYYY
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistroEmpleadoPermisoComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  permiso: any = [];

  // USADO PARA IMPRIMIR DATOS
  datosPermiso: any = [];
  datoNumPermiso: any = [];
  tipoPermisos: any = [];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Días', nombre: 'Días' },
    { valor: 'Horas', nombre: 'Horas' },
    { valor: 'Días y Horas', nombre: 'Días y Horas' },
  ];

  selec1 = false;
  selec2 = false;

  // TOTAL DE DÍAS SEGÚN EL TIPO DE PERMISO
  Tdias = 0;
  // TOTAL DE HORAS SEGÚN EL TIPO DE PERMISO
  Thoras;

  // NÚMERO DEL PERMISO
  num: number;
  tipoPermisoSelec: string;
  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DÍAS, HORAS, DÍAS LIBRES
  HabilitarDias: boolean = true;
  estiloDias: any;
  HabilitarHoras: boolean = true;
  estiloHoras: any;
  HabilitarDiasL: boolean = true;
  estiloDiasL: any;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  fecCreacionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('', Validators.required);
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  legalizarF = new FormControl('', [Validators.required]);
  diaLaboralF = new FormControl('');
  diaLibreF = new FormControl('');
  estadoF = new FormControl('');
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PermisoForm = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    fecCreacionForm: this.fecCreacionF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    horaSalidaForm: this.horaSalidaF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
    legalizarForm: this.legalizarF,
    diaLaboralForm: this.diaLaboralF,
    diaLibreForm: this.diaLibreF,
    estadoForm: this.estadoF,
    horasForm: this.horasF,
    diasForm: this.diasF,
  });

  constructor(
    private loginServise: LoginService,
    private restTipoP: TipoPermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    public restAutoriza: AutorizacionService,
    public dialogRef: MatDialogRef<RegistroEmpleadoPermisoComponent>,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) { }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    // ASIGNACIÓN DE ESTADO PENDIENTE EN LA SOLICITUD DE PERMISO
    this.PermisoForm.patchValue({
      fecCreacionForm: this.FechaActual,
      estadoForm: 1
    });
    this.ObtenerTiposPermiso();
    this.ImprimirNumeroPermiso();
    this.ObtenerEmpleado(this.datoEmpleado.idEmpleado);
  }

  empleado: any = [];
  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    let rol = this.loginServise.getRol();
    if (rol >= 2) {
      this.restTipoP.getListAccesoTipoPermisoRest(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.restTipoP.getTipoPermisoRest().subscribe(datos => {
        this.tipoPermisos = datos;
      });
    }
  }

  ImprimirNumeroPermiso() {
    this.datoNumPermiso = [];
    this.restP.BuscarNumPermiso(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.datoNumPermiso = datos;
      if (this.datoNumPermiso[0].max === null) {
        this.num = 1;
      }
      else {
        this.num = this.datoNumPermiso[0].max + 1;
      }
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    })
  }

  ContarDiasLibres(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      libres = 0;
    console.log('revisar ------', '1 ' + dateFrom, '2 ' + dateTo, '3' + from, '4 ' + to)
    while (!from.isAfter(to)) {
      // SI NO ES SÁBADO NI DOMINGO
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;
      }
      else {
        libres++
      }
      from.add(1, 'days');
    }
    return libres;
  }

  ContarDiasLaborables(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      libres = 0;
    console.log('revisar ------', '1 ' + dateFrom, '2 ' + dateTo, '3' + from, '4 ' + to)
    while (!from.isAfter(to)) {
      // SI NO ES SÁBADO NI DOMINGO
      if (from.isoWeekday() !== 6 && from.isoWeekday() !== 7) {
        days++;
      }
      else {
        libres++
      }
      from.add(1, 'days');
    }
    return days;
  }

  // MÉTODO PARA CONTAR DÍAS LIBRES Y DÍAS LABORABLES

  ImprimirDiaLibre(form, ingreso) {
    if (form.solicitarForm === 'Días' || form.solicitarForm === 'Días y Horas') {
      var libre = this.ContarDiasLibres(form.fechaInicioForm, ingreso);
      var laboral = this.ContarDiasLaborables(form.fechaInicioForm, ingreso);
      this.PermisoForm.patchValue({
        diaLibreForm: libre,
        diaLaboralForm: laboral,
      });
    }
  }




  // MÉTODO DE VALIDACIONES DE FECHA DE SALIDA
  dSalida: any;
  validarFechaSalida(event, form) {

    // LIMPIAR CAMPOS DE FECHAS
    this.LimpiarCamposFecha();

    // VALIDACIÓN DE SELECCIÓN DE TIPO DE PERMISOS
    if (form.idPermisoForm != '') {

      // LECTURA DE FECHAS
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var salida = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VERIFICACIÓN DE RESTRICCIÓN DE FECHAS
      if (this.datosPermiso[0].fecha != '' && this.datosPermiso[0].fecha != null) {
        var fecha_negada = this.datosPermiso[0].fecha.split('T')[0];
        console.log('salida', salida, fecha_negada);

        // VERIFICACIÓN DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
        if (Date.parse(salida) === Date.parse(fecha_negada)) {
          this.toastr.error('En la fecha ingresada no es posible otorgar permisos. Ingresar otra fecha', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaInicioForm: '',
          });
        }
      }

    }
    else {
      this.toastr.error('Aún no selecciona un Tipo de Permiso', 'VERIFICAR', {
        timeOut: 6000,
      });
      this.PermisoForm.patchValue({
        fechaInicioForm: '',
      });
    }
  }


  // MÈTODO PARA VALIDAR FECHA DE INGRESO DE PERMISO
  dIngreso: any;
  fechas_horario: any = [];
  readonly: boolean = false;
  validarFechaIngreso(event, form) {
    this.readonly = false;
    this.fechas_horario = [];

    //VALIDAR INGRESO DE FECHA DE SALIDA Y SELECCIÓN DE TIPO DE PERMISO
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {

      this.horasTrabajo = [];
      let datosFechas = {
        id_emple: this.datoEmpleado.idEmpleado,
        fecha: form.fechaInicioForm
      }
      console.log('datos', datosFechas)
      this.dIngreso = event.value;

      let solicitud = {
        fec_inicio: String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD")),
        fec_final: String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD")),
        codigo: parseInt(this.empleado[0].codigo)
      }

      this.restP.BuscarPermisosSolicitados(solicitud).subscribe(solicitados => {
        if (solicitados.length != 0) {
          console.log('ver permiso fechas', solicitados)
          this.toastr.info('En las fechas ingresadas ya existe un registro de solicitud.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaInicioForm: '',
            fechaFinalForm: ''
          });
        } else {
          // MÉTODO DE BÚSQUEDA DE HORAS DE TRABAJO
          this.restH.BuscarNumeroHoras(datosFechas).subscribe(datos => {
            this.horasTrabajo = datos;

            console.log('ver horas trabajadas', this.horasTrabajo)
            // MÉTODO PARA VALIDAR TIPO DE SOLICITUD DE PERMISO
            this.VerificarDiasHoras(form, this.horasTrabajo[0].horas);

            // SOLICITUD DE PERMISO POR DÍAS
            if (form.solicitarForm === 'Días') {
              let datos = {
                fec_inicio: form.fechaInicioForm,
                fec_final: form.fechaFinalForm
              }
              this.restP.BuscarFechasPermiso(datos, parseInt(this.empleado[0].codigo)).subscribe(response => {
                console.log('fechas_permiso', response);
                this.fechas_horario = response;
                this.fechas_horario.map(obj => {
                  if (obj.fecha.split('T')[0] === moment(this.dSalida).format('YYYY-MM-DD') && obj.tipo_entr_salida === 'E') {
                    this.PermisoForm.patchValue({
                      horaSalidaForm: obj.hora
                    })
                  }
                  if (obj.fecha.split('T')[0] === moment(this.dIngreso).format('YYYY-MM-DD') && obj.tipo_entr_salida === 'E') {
                    this.PermisoForm.patchValue({
                      horasIngresoForm: obj.hora
                    })
                  }
                })
                this.readonly = true;
              }, err => {
                /*   const { access, message } = err.error.message;
                   if (access === false) {
                     this.toastr.error(message)
                     this.dialogRef.close();
                   }*/
              })
            }
          }, error => {
            this.toastr.info('Las fechas indicadas no se encuentran dentro de su horario laboral', 'VERIFICAR', {
              timeOut: 6000,
            });
            this.LimpiarCamposFecha();
          });
        }

      })
    }
    else {
      this.toastr.error('Aún no selecciona un Tipo de Permiso o aún no ingresa fecha de salida.', 'VERIFICAR', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
  }



  informacion: boolean = false;
  ImprimirDatos(form) {
    this.LimpiarCamposFecha();
    this.selec1 = false;
    this.selec2 = false;
    this.readonly = false;
    this.datosPermiso = [];
    this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(datos => {
      // INFORMACION PERMISO
      this.Tdias = 0;
      this.Thoras = 0;

      this.informacion = true;
      this.datosPermiso = datos;

      console.log('datos permiso', this.datosPermiso)
      if (this.datosPermiso[0].num_dia_maximo === 0) {
        this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
        this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
        this.estiloDiasL = { 'visibility': 'hidden' }; this.HabilitarDiasL = true;
        this.PermisoForm.patchValue({
          solicitarForm: 'Horas',
          horasForm: this.datosPermiso[0].num_hora_maximo,
          diasForm: '',
        });
        //this.Thoras = this.datosPermiso[0].num_hora_maximo != '' ? this.datosPermiso[0].num_hora_maximo : 0;
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        this.tipoPermisoSelec = 'Horas';
      }
      else if (this.datosPermiso[0].num_hora_maximo === '00:00:00') {
        this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
        this.estiloDiasL = { 'visibility': 'visible' }; this.HabilitarDiasL = false;
        this.estiloHoras = { 'visibility': 'hidden' }; this.HabilitarHoras = true;
        this.PermisoForm.patchValue({
          solicitarForm: 'Días',
          diasForm: this.datosPermiso[0].num_dia_maximo,
          horasForm: '',
          diaLibreForm: '',
        });
        this.Tdias = this.datosPermiso[0].num_dia_maximo;
        this.tipoPermisoSelec = 'Días';
      }
      else {
        this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
        this.estiloDiasL = { 'visibility': 'visible' }; this.HabilitarDiasL = false;
        this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
        this.PermisoForm.patchValue({
          solicitarForm: 'Días y Horas',
          diasForm: this.datosPermiso[0].num_dia_maximo,
          horasForm: this.datosPermiso[0].num_hora_maximo,
          diaLibreForm: this.datoNumPermiso[0].dia_libre,
        });
        this.Tdias = this.datosPermiso[0].num_dia_maximo;
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        this.tipoPermisoSelec = 'Días y Horas';
      }
      if (this.datosPermiso[0].legalizar === true) {
        this.selec1 = true;
      }
      else if (this.datosPermiso[0].legalizar === false) {
        this.selec2 = true;
      }
      this.PermisoForm.patchValue({
        legalizarForm: this.datosPermiso[0].legalizar,
        fechaInicioForm: ''
      });
    })
  }

  ActivarDiasHoras(form) {
    if (form.solicitarForm === 'Días') {
      this.LimpiarCamposFecha();
      this.PermisoForm.patchValue({
        diasForm: '',
      });
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloDiasL = { 'visibility': 'visible' }; this.HabilitarDiasL = false;
      this.estiloHoras = { 'visibility': 'hidden' }; this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días de permiso', '', {
        timeOut: 6000,
      });
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarCamposFecha();
      this.PermisoForm.patchValue({
        horasForm: '',
        diaLibreForm: '',
      });
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
      this.estiloDiasL = { 'visibility': 'hidden' }; this.HabilitarDiasL = true;
      this.toastr.info('Ingresar número de horas y minutos de permiso', '', {
        timeOut: 6000,
      });
    }
    else {
      this.LimpiarCamposFecha();
      this.PermisoForm.patchValue({
        diasForm: '',
        horasForm: '',
        diaLibreForm: '',
      });
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloDiasL = { 'visibility': 'visible' }; this.HabilitarDiasL = false;
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de días máximos y horas permitidas de permiso', '', {
        timeOut: 6000,
      });
    }
  }

  CambiarValoresDiasHoras(form, datos) {
    if (form.solicitarForm === 'Días') {
      datos.hora_numero = '00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
    }
  }

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  InsertarPermiso(form) {
    let datosPermiso = {
      fec_creacion: form.fecCreacionForm,
      descripcion: form.descripcionForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      dia: parseInt(form.diasForm),
      legalizado: form.legalizarForm,
      estado: form.estadoForm,
      dia_libre: form.diaLibreForm,
      id_tipo_permiso: form.idPermisoForm,
      id_empl_contrato: this.datoEmpleado.idContrato,
      id_peri_vacacion: this.datoEmpleado.idPerVacacion,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      docu_nombre: form.nombreCertificadoForm,
      depa_user_loggin: parseInt(localStorage.getItem('departamento')),
      id_empl_cargo: this.datoEmpleado.idCargo,
      hora_salida: form.horaSalidaForm,
      hora_ingreso: form.horasIngresoForm,
      codigo: this.empleado[0].codigo
    }
    console.log(datosPermiso);
    this.CambiarValoresDiasHoras(form, datosPermiso);
    console.log(datosPermiso);
    this.CambiarValorDiaLibre(datosPermiso, form);
  }

  CambiarValorDiaLibre(datos, form) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
      this.GuardarDatos(datos, form);
    }
    else {
      this.GuardarDatos(datos, form);
    }
  }

  RevisarIngresoDias(form) {
    const resta = this.dIngreso.diff(this.dSalida, 'days');
    console.log('datos', resta, ' ');
    this.ImprimirDiaLibre(form, this.dIngreso);
    this.PermisoForm.patchValue({
      diasForm: resta + 1
    })
    console.log('ver dato dias *****************', form.diasForm + ' ********** ', this.Tdias)
    if (parseInt(resta + 1) <= this.Tdias) {
      console.log('revisar', this.dIngreso, this.dSalida)

      /*if (resta != form.diasForm) {
        this.toastr.error('Recuerde el día de ingreso no puede superar o ser menor a los días de permiso solicitados.',
          'Día de ingreso incorrecto.', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        this.ImprimirDiaLibre(form, this.dIngreso);
      }*/
    }
    else {
      this.toastr.info('Los días de permiso que puede solicitar deben ser menores o iguales a: ' + String(this.Tdias) + ' días.',
        'De acuerdo con la configuración de este tipo de permiso.', {
        timeOut: 6000,
      })
      this.LimpiarCamposFecha();
    }
  }

  RevisarIngresoHoras() {
    const resta = this.dIngreso.diff(this.dSalida, 'days');
    if (resta != 0) {
      this.toastr.error('Recuerde su permiso es por horas, y debe ingresar el mismo día en el que sale.',
        'Día de ingreso incorrecto', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
  }

  MensajeIngresoHoras(hora_empleado) {
    if (this.tipoPermisoSelec === 'Días' || this.tipoPermisoSelec === 'Días y Horas') {
      this.toastr.info('Usted puede solicitar hasta: ' + String(this.Tdias) +
        ' dias de permiso. Si solicita horas recuerde que deben ser menor a ' + hora_empleado + ' horas.',
        'De acuerdo con la configuración de este tipo de permiso', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
    else if (this.tipoPermisoSelec === 'Horas') {
      this.toastr.info('Las horas de permiso que puede solicitar deben ser menores o iguales a: ' + String(this.Thoras) + ' horas',
        'De acuerdo con la configuración de este tipo de permiso', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
  }

  ValidarConfiguracionDias(form) {
    if (this.tipoPermisoSelec === 'Días') {
      this.RevisarIngresoDias(form);
    }
    else if (this.tipoPermisoSelec === 'Horas') {
      this.toastr.info
        ('No puede solicitar días de permiso. Las horas de permiso que puede solicitar deben ser menores o iguales a: ' + String(this.Thoras) + ' horas.',
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarCamposFecha();
    }
    else if (this.tipoPermisoSelec === 'Días y Horas') {
      this.RevisarIngresoDias(form);
    }
  }

  ValidarConfiguracionHoras(form, hora_empleado) {
    var datoHora = parseInt(hora_empleado.split(":"));
    if (this.tipoPermisoSelec === 'Días') {
      if (parseInt(form.horasForm.split(":")) < datoHora) {
        this.RevisarIngresoHoras();
      }
      else {
        this.MensajeIngresoHoras(hora_empleado);
      }
    }
    else if (this.tipoPermisoSelec === 'Horas') {
      if (form.horasForm <= this.Thoras) {
        this.RevisarIngresoHoras();
      }
      else {
        this.MensajeIngresoHoras(hora_empleado);
      }
    }
    else if (this.tipoPermisoSelec === 'Días y Horas') {
      if (parseInt(form.horasForm.split(":")) < datoHora) {
        this.RevisarIngresoHoras();
      }
      else {
        this.MensajeIngresoHoras(hora_empleado);
      }
    }
  }

  RevisarIngresoDiasHoras(contarDias, form) {
    const resta = this.dIngreso.diff(this.dSalida, 'days');
    if ((resta + 1) != contarDias) {
      this.toastr.error('Recuerde el día de ingreso no puede superar o ser menor a los días de permiso solicitados',
        'Día de ingreso incorrecto', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
    else {
      this.ImprimirDiaLibre(form, this.dIngreso);
    }
  }

  ValidarConfiguracionDiasHoras(form, hora_empleado) {
    var datoHora = hora_empleado.split(":");
    if (this.tipoPermisoSelec === 'Días') {
      var contarDias = parseInt(form.diasForm) + 1;
      if (contarDias <= this.Tdias && parseInt(form.horasForm.split(":")) < parseInt(datoHora)) {
        this.RevisarIngresoDiasHoras(contarDias, form);
      }
      else {
        this.toastr.info('Los días de permiso que puede solicitar deben ser menores a : '
          + String(this.Tdias) + ' días y las horas deben ser menores a ' + datoHora + ' horas. Tenga en cuenta que solicita días y adicional horas.',
          'De acuerdo con la configuración de este tipo de permiso.', {
          timeOut: 6000,
        })
        this.LimpiarCamposFecha();
      }

    }
    else if (this.tipoPermisoSelec === 'Horas') {
      this.toastr.info
        ('No puede solicitar días de permiso. Las horas de permiso que puede solicitar deben ser menores o iguales a: '
          + String(this.Thoras) + ' horas. Tenga en cuenta que solicita días y adicional horas',
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarCamposFecha();

    }
    else if (this.tipoPermisoSelec === 'Días y Horas') {
      var contarDias = parseInt(form.diasForm) + 1

      if (parseInt(form.diasForm) === this.Tdias && form.horasForm <= this.Thoras) {
        this.RevisarIngresoDiasHoras(contarDias, form);
      }
      else if (parseInt(form.diasForm) < this.Tdias && parseInt(form.horasForm.split(":")) < parseInt(datoHora)) {
        this.RevisarIngresoDiasHoras(contarDias, form);
      }
      else {
        this.toastr.info
          ('Los días de permiso que puede solicitar deben ser menores o iguales a: ' + String(this.Tdias) +
            ' día y las horas deben ser menores o iguales a: ' + String(this.Thoras) + ' horas',
            'De acuerdo con la configuración de este tipo de permiso.', {
            timeOut: 6000,
          });
        this.LimpiarCamposFecha();
      }
    }

  }

  // MÉTODO PARA VALIDAR QUE SE INGRESE DÍAS - HORAS DE SOLICITUD DE PERMISOS
  VerificarDiasHoras(form, hora_empleado) {

    // VALIDAR SOLICITUD DE PERMISO POR DÍAS
    if (form.solicitarForm === 'Días') {
      if (form.diasForm === '' || form.diasForm == 0) {
        this.toastr.info('Aún no ha ingresado número de días de permiso.', '', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        this.ValidarConfiguracionDias(form);
      }
    }

    // VALIDAR SOLICITUD DE PERMISO POR HORAS
    else if (form.solicitarForm === 'Horas') {
      if (form.horasForm === '' || form.horasForm === '00:00') {
        this.toastr.info('Aún no ha ingresado número de horas y minutos de permiso.', '', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        this.ValidarConfiguracionHoras(form, hora_empleado);
      }
    }

    // VALIDAR SOLICITUD DE PERMISOS POR DÍAS Y HORAS
    else if (form.solicitarForm === 'Días y Horas') {
      if ((form.diasForm === '' && form.horasForm === '' || form.horasForm === '00:00') ||
        (form.diasForm == 0 && form.horasForm == '' || form.horasForm == '00:00') ||
        (form.diasForm != 0 && form.horasForm == '' || form.horasForm == '00:00') ||
        (form.horasForm != '' && form.diasForm == 0 || form.diasForm === '')) {
        this.toastr.info('Aún no ha ingresado número de días u horas y minutos de permiso.', 'VERIFICAR', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        this.ValidarConfiguracionDiasHoras(form, hora_empleado);
      }
    }
  }


  idPermisoRes: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  GuardarDatos(datos, form) {
    this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(data => {
      if (data[0].documento === true) {
        if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
          if (this.archivoSubido[0].size <= 2e+6) {
            this.Informacion(datos);
          }
          else {
            this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
              timeOut: 6000,
            });
          }
        }
        else {
          this.toastr.info('El permiso seleccionado requiere de un certificado.', 'Es indispensable que suba un documento de respaldo.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {
          this.toastr.success('Operación Exitosa', 'Permiso registrado', {
            timeOut: 6000,
          });
          this.arrayNivelesDepa = response;
          this.LimpiarCampos();
          this.arrayNivelesDepa.forEach(obj => {
            let datosPermisoCreado = {
              fec_creacion: datos.fec_creacion,
              id_tipo_permiso: datos.id_tipo_permiso,
              id_empl_contrato: datos.id_empl_contrato,
              id: obj.id,
              estado: obj.estado,
              id_dep: obj.id_dep,
              depa_padre: obj.depa_padre,
              nivel: obj.nivel,
              id_suc: obj.id_suc,
              departamento: obj.departamento,
              sucursal: obj.sucursal,
              cargo: obj.cargo,
              contrato: obj.contrato,
              empleado: obj.empleado,
              nombre: obj.nombre,
              apellido: obj.apellido,
              cedula: obj.cedula,
              correo: obj.correo,
              permiso_mail: obj.permiso_mail,
              permiso_noti: obj.permiso_noti
            }
            this.restP.SendMailNoti(datosPermisoCreado).subscribe(res => {
              this.idPermisoRes = res;
              console.log(this.idPermisoRes);
              this.ImprimirNumeroPermiso();
              var f = new Date();
              let notificacion = {
                id: null,
                id_send_empl: this.datoEmpleado.idEmpleado,
                id_receives_empl: this.idPermisoRes.id_empleado_autoriza,
                id_receives_depa: this.idPermisoRes.id_departamento_autoriza,
                estado: this.idPermisoRes.estado,
                create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
                id_permiso: this.idPermisoRes.id,
                id_vacaciones: null,
                id_hora_extra: null
              }
              this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
                console.log(resN);
                this.NotifiRes = resN;
                notificacion.id = this.NotifiRes._id;
                if (this.NotifiRes._id > 0 && this.idPermisoRes.notificacion === true) {
                  this.restP.sendNotiRealTime(notificacion);
                }
              });

              this.IngresarAutorizacion(this.idPermisoRes.id);
            });
          }, err => {
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.dialogRef.close();
            }
          });
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
            this.dialogRef.close();
          }
        });
      }
    });
  }

  Informacion(datos) {
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Permiso registrado', {
        timeOut: 6000,
      });
      this.arrayNivelesDepa = response;
      this.LimpiarCampos();
      this.arrayNivelesDepa.forEach(obj => {
        let datosPermisoCreado = {
          fec_creacion: datos.fec_creacion,
          id_tipo_permiso: datos.id_tipo_permiso,
          id_empl_contrato: datos.id_empl_contrato,
          id: obj.id,
          estado: obj.estado,
          id_dep: obj.id_dep,
          depa_padre: obj.depa_padre,
          nivel: obj.nivel,
          id_suc: obj.id_suc,
          departamento: obj.departamento,
          sucursal: obj.sucursal,
          cargo: obj.cargo,
          contrato: obj.contrato,
          empleado: obj.empleado,
          nombre: obj.nombre,
          apellido: obj.apellido,
          cedula: obj.cedula,
          correo: obj.correo,
          permiso_mail: obj.permiso_mail,
          permiso_noti: obj.permiso_noti
        }
        this.restP.SendMailNoti(datosPermisoCreado).subscribe(res => {
          this.idPermisoRes = res;
          console.log(this.idPermisoRes);
          this.SubirRespaldo(this.idPermisoRes.id)
          this.ImprimirNumeroPermiso();
          var f = new Date();
          let notificacion = {
            id: null,
            id_send_empl: this.datoEmpleado.idEmpleado,
            id_receives_empl: this.idPermisoRes.id_empleado_autoriza,
            id_receives_depa: this.idPermisoRes.id_departamento_autoriza,
            estado: this.idPermisoRes.estado,
            create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
            id_permiso: this.idPermisoRes.id,
            id_vacaciones: null,
            id_hora_extra: null
          }
          this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
            console.log(resN);
            this.NotifiRes = resN;
            notificacion.id = this.NotifiRes._id;
            if (this.NotifiRes._id > 0 && this.idPermisoRes.notificacion === true) {
              this.restP.sendNotiRealTime(notificacion);
            }
          });
          this.IngresarAutorizacion(this.idPermisoRes.id);
        });
      });
    });
  }

  LimpiarCampos() {
    this.PermisoForm.reset();
    this.PermisoForm.patchValue({
      fecCreacionForm: this.FechaActual,
      estadoForm: 1
    });
  }

  LimpiarCamposFecha() {
    this.PermisoForm.patchValue({
      fechaFinalForm: '',
      diaLibreForm: '',
      horaSalidaForm: '',
      horasIngresoForm: ''
    });
  }

  LimpiarNombreArchivo() {
    this.PermisoForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  CerrarVentanaPermiso() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  /* ********************************************************************************** *
     *                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                    *
   * ********************************************************************************** */

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.PermisoForm.patchValue({ nombreCertificadoForm: name });
    }
  }

  SubirRespaldo(id: number) {
    let formData = new FormData();
    console.log("tamaño", this.archivoSubido[0].size);
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
  }


  /* *********************************************************************************
   *  MENSAJES QUE INDICAN ERRORES AL INGRESAR DATOS
   *  ********************************************************************************/

  ObtenerMensajeErrorDescripcion() {
    if (this.descripcionF.hasError('pattern')) {
      return 'Ingresar una descripción válida';
    }
    return this.descripcionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  ObtenerMensajeFecha() {
    if (this.fechaFinalF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  // VALIDAR INGRESO DE HORA DE SALIDA Y HORA DE RETORNO 
  ValidarHora_Salida_Entrada(form) {
    if (form.solicitarForm === 'Horas') {
      var total = form.horasForm;
      var hora1 = (String(form.horaSalidaForm) + ':00').split(":"),
        hora2 = (String(form.horasIngresoForm) + ':00').split(":"),
        t1 = new Date(),
        t2 = new Date();
      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));
      //Aquí hago la resta
      t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
      if (t1.getHours() < 10 && t1.getMinutes() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + '0' + t1.getMinutes();
      }
      else if (t1.getHours() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + t1.getMinutes();
      }
      else if (t1.getMinutes() < 10) {
        var tiempoTotal: string = t1.getHours() + ':' + '0' + t1.getMinutes();
      }
      console.log('horas', tiempoTotal, total)
      if (tiempoTotal + ':00' === total + ':00') {
        this.InsertarPermiso(form);
      }
      else {
        this.toastr.error('El total de horas solicitadas no corresponda con el total de horas de salida e ingreso.', 'Verificar la horas de salida e ingreso de permiso.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.InsertarPermiso(form);
    }
  }

  IngresarAutorizacion(id_permiso: number) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACIÓN
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACIÓN 
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento')),
      id_permiso: id_permiso,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    }, error => { })
  }
}
