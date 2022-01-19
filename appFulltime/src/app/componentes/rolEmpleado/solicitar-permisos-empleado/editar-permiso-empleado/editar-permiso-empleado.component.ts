/** IMPORTACIÓN LIBRERIAS */
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
/** IMPORTACIÓN DE SERVICIOS */
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { LoginService } from 'src/app/servicios/login/login.service';

/** CREACIÓN DE LISTA DE OPCIONES DE SOLICITUD DE PERMISO */
interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-permiso-empleado',
  templateUrl: './editar-permiso-empleado.component.html',
  styleUrls: ['./editar-permiso-empleado.component.css'],
  /** FORMATO DE FECHA DIA - MES - AÑO / ESPAÑOL */
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class EditarPermisoEmpleadoComponent implements OnInit {

  datoNumPermiso: any = []; // ARREGLOS PARA GUARDAR ÚLTIMO NÚMERO DE PERMISOS REGISTRADO POR EMPLEADO
  tipoPermisos: any = []; // ARREGLOS PARA SELECCIONAR EL TIPO DE PERMISO DE ACUERDO AL PEDIDO EMPLEADO / ADMINISTRADOR
  datosPermiso: any = []; // ARREGLOS PARA GUARDAR DATOS DEL PERMISO SELECCIONADO
  permiso: any = []; // ARREGLO PARA GUARDAR LISTA DE PERMISOS REGISTRADOS

  // OPCIONES DE SOLICITUD DE PERMISOS
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Días', nombre: 'Días' },
    { valor: 'Horas', nombre: 'Horas' },
    { valor: 'Días y Horas', nombre: 'Días y Horas' },
  ];

  Tdias = 0; // VARIABLE QUE ALMACENA EL TOTAL DE DÍAS DE PERMISO
  Thoras; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS DE PERMISO
  num: number; // VARIABLE QUEALMACENA EL NÚMERO DE PERMISO SOLICITADO
  tipoPermisoSelec: string; // VARIABLE QUE INDICA QUE TIPO DE PERMISOS SELECCIONÓ EL EMEPLEADO
  horasTrabajo: any = []; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS QUE TRABAJA EL EMPLEADO
  isChecked: boolean = false; // VARIABLE QUE INDICA SI SE VA A ACTUALIZAR EL ARCHIVO 
  FechaActual: any; // VARIABLE QUE INIDCA LA FECHA ACTUAL EN LA QUE SE REGISTRA O PIDE EL PERMISO

  // EVENTOS PARA ACTIVAR O DESACTIVAR INGRESO DE DIAS- HORAS - DIAS/HORAS SEGUN SELECCIÓN DEL USUARIO
  HabilitarDias: boolean = true;
  estiloDias: any;
  HabilitarHoras: boolean = true;
  estiloHoras: any;
  HabilitarDiasL: boolean = true;
  estiloDiasL: any;

  // CONTROL DE CAMPOS Y VALIDACIONES DE FORMULARIO
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  fechaInicioF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('', Validators.required);
  horaSalidaF = new FormControl('', Validators.required);
  nombreCertificadoF = new FormControl('');
  archivoForm = new FormControl('');
  diaLibreF = new FormControl('');
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACIÓN DE CAMPOS A UN GRUPO
  public PermisoForm = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    horaSalidaForm: this.horaSalidaF,
    fechaFinalForm: this.fechaFinalF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
    diaLibreForm: this.diaLibreF,
    horasForm: this.horasF,
    diasForm: this.diasF,
  });

  constructor(
    public dialogRef: MatDialogRef<EditarPermisoEmpleadoComponent>,
    private restTipoP: TipoPermisosService,
    private restH: EmpleadoHorariosService,
    private loginServise: LoginService,
    private restP: PermisosService,
    private toastr: ToastrService,
    private restE: EmpleadoService,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) { }

  ngOnInit(): void {

    this.CargarInformacion(this.info.dataPermiso.id_tipo_permiso);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log(this.info.dataPermiso);
    this.num = this.info.dataPermiso.num_permiso
    this.ObtenerTiposPermiso();
    this.MostrarDatos();
    this.ComparacionSolicitud();
    this.ObtenerEmpleado(this.info.id_empleado);
  }

  /** MÉTODO PARA OBTENER DATOS DEL EMPLEADO */
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  /** MÉTODO PARA COMPARAR QUE TIPO DE SOLIICTUD REALIZÓ PERMISOS POR DIAS - HORAS - DIAS/HORAS */
  ComparacionSolicitud() {
    if (this.info.dataPermiso.dia > 0 && this.info.dataPermiso.hora_numero === '00:00:00') {
      this.PermisoForm.patchValue({ solicitarForm: 'Días' });
    }
    else if (this.info.dataPermiso.dia > 0 && this.info.dataPermiso.hora_numero != '00:00:00') {
      this.PermisoForm.patchValue({ solicitarForm: 'Días y Horas' });
    }
    else if (this.info.dataPermiso.dia === 0 && this.info.dataPermiso.hora_numero != '00:00:00') {
      this.PermisoForm.patchValue({ solicitarForm: 'Horas' });
    }
  }

  /** MÉTODO PARA IMPRIMIR EN EL FORMULARIO LA INFORMACIÓN DEL PERMISO SOLICITADO */
  MostrarDatos() {
    this.PermisoForm.patchValue({
      fechaInicioForm: String(moment(this.info.dataPermiso.fec_inicio).format('YYYY-MM-DD')),
      horaSalidaForm: String(moment(this.info.dataPermiso.hora_salida).format('YYYY-MM-DD')),
      nombreCertificadoForm: this.info.dataPermiso.docu_nombre,
      horasIngresoForm: this.info.dataPermiso.hora_ingreso,
      idPermisoForm: this.info.dataPermiso.id_tipo_permiso,
      descripcionForm: this.info.dataPermiso.descripcion,
      fechaFinalForm: this.info.dataPermiso.fec_final,
      diaLibreForm: this.info.dataPermiso.dia_libre,
      horasForm: this.info.dataPermiso.hora_numero,
      diasForm: this.info.dataPermiso.dia,
    });
    if (this.info.dataPermiso.dia === 0) {
      this.estiloHoras = { 'visibility': 'visible' };
      this.HabilitarHoras = false;
      this.estiloDias = { 'visibility': 'hidden' };
      this.HabilitarDias = true;
      this.estiloDiasL = { 'visibility': 'hidden' };
      this.HabilitarDiasL = true;
      this.tipoPermisoSelec = 'Horas';
      this.PermisoForm.patchValue({
        solicitarForm: 'Horas',
      });
    }
    else if (this.info.dataPermiso.hora_numero === '00:00:00') {
      this.estiloDias = { 'visibility': 'visible' };
      this.HabilitarDias = false;
      this.estiloDiasL = { 'visibility': 'visible' };
      this.HabilitarDiasL = false;
      this.estiloHoras = { 'visibility': 'hidden' };
      this.HabilitarHoras = true;
      this.tipoPermisoSelec = 'Días';
      this.PermisoForm.patchValue({
        solicitarForm: 'Días',
      });
      this.readonly = true;
    }
    else {
      this.estiloDias = { 'visibility': 'visible' };
      this.HabilitarDias = false;
      this.estiloDiasL = { 'visibility': 'visible' };
      this.HabilitarDiasL = false;
      this.estiloHoras = { 'visibility': 'visible' };
      this.HabilitarHoras = false;
      this.tipoPermisoSelec = 'Días y Horas';
      this.PermisoForm.patchValue({
        solicitarForm: 'Días y Horas',
      });
    }
    // if (this.datos.legalizado === true) {
    //   this.selec1 = true;
    // }
    // else if (this.datos.legalizado === false) {
    //   this.selec2 = true;
    // }
    this.dSalida = String(moment(this.info.dataPermiso.fec_inicio).format('YYYY-MM-DD'));
    this.dIngreso = String(moment(this.info.dataPermiso.fec_final).format('YYYY-MM-DD'));
    console.log('cargar datos', this.dSalida, this.dIngreso)
  }

  /** MÉTODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL */
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

  /** MÉTODO PARA CALCULAR DÍAS LIBRES */
  ContarDiasLibres(dateFrom, dateTo) {

    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),

      days = 0,
      libres = 0;

    console.log('verificar ingreso', '1' + dateFrom, '2' + dateTo, '3' + from, '4' + to)
    while (!from.isAfter(to)) {
      // Si no es sábado ni domingo
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

  ImprimirDiaLibre(form, ingreso) {
    if (form.solicitarForm === 'Días' || form.solicitarForm === 'Días y Horas') {
      console.log('entra mmlkfkv')

      var libre = this.ContarDiasLibres(form.fechaInicioForm, ingreso);
      this.PermisoForm.patchValue({
        diaLibreForm: libre,
      });
    }
  }

  dSalida: any;
  validarFechaSalida(event, form) {
    this.LimpiarCamposFecha();
    if (form.idPermisoForm != '') {
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var salida = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));
      if (this.datosPermiso[0].fecha != '' && this.datosPermiso[0].fecha != null) {
        var fecha_negada = this.datosPermiso[0].fecha.split('T')[0];
        console.log('salida', salida, fecha_negada);
        if (Date.parse(salida) === Date.parse(fecha_negada)) {
          this.toastr.error('En la fecha ingresada no se va a otorgar permisos. Ingresar otra fecha', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaInicioForm: '',
          });
        }
        else if (Date.parse(salida) >= Date.parse(this.FechaActual)) {
        }
        else {
          this.toastr.error('La fecha de solicitud de permiso no puede ser anterior a la fecha vigente.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaInicioForm: '',
          });
        }
      }
      else {
        if (Date.parse(salida) >= Date.parse(this.FechaActual)) {
        }
        else {
          this.toastr.error('La fecha de solicitud de permiso no puede ser anterior a la fecha vigente.', 'VERIFICAR', {
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

  dIngreso: any;
  fechas_horario: any = [];
  readonly: boolean = false;
  validarFechaIngreso(event, form) {
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {
      this.horasTrabajo = [];
      let datosFechas = {
        id_emple: this.info.id_empleado,
        fecha: moment(form.fechaInicioForm, "YYYY/MM/DD").format("YYYY-MM-DD")
      }
      console.log('fechas', datosFechas)
      this.dIngreso = event.value;
      this.restH.BuscarNumeroHoras(datosFechas).subscribe(datos => {
        this.horasTrabajo = datos;
        console.log("horas", this.horasTrabajo[0].horas, datos);
        this.VerificarDiasHoras(form, this.horasTrabajo[0].horas);

      }, error => {
        this.toastr.info('Las fechas indicadas no se encuentran dentro de su horario laboral.', 'VERIFICAR', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      });
    }
    else {
      this.toastr.error('Aún no selecciona un Tipo de Permiso o aún no ingresa fecha de salida.', 'VERIFICAR', {
        timeOut: 6000,
      });
      this.LimpiarCamposFecha();
    }
  }

  ImprimirDatos(form) {
    this.LimpiarCamposFecha();
    this.readonly = false;
    this.datosPermiso = [];
    this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(datos => {
      this.datosPermiso = datos;
      console.log(this.datosPermiso);
      if (this.datosPermiso[0].num_dia_maximo === 0) {
        this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
        this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
        this.estiloDiasL = { 'visibility': 'hidden' }; this.HabilitarDiasL = true;
        this.PermisoForm.patchValue({
          solicitarForm: 'Horas',
          horasForm: this.datosPermiso[0].num_hora_maximo,
          diasForm: '',
        });
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        console.log('horas_thoras', this.Thoras)
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
      this.PermisoForm.patchValue({
        fechaInicioForm: '',
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

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  InsertarPermiso(form) {
    let datosPermiso = {
      descripcion: form.descripcionForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      dia: parseInt(form.diasForm),
      dia_libre: form.diaLibreForm,
      id_tipo_permiso: form.idPermisoForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      anterior_doc: this.info.dataPermiso.documento,
      docu_nombre: form.nombreCertificadoForm,
      hora_salida: form.horaSalidaForm,
      hora_ingreso: form.horasIngresoForm,
    }
    if (this.isChecked === false) {
      datosPermiso.anterior_doc = null,
        datosPermiso.docu_nombre = null
    }
    console.log(datosPermiso);
    this.CambiarValoresDiasHoras(form, datosPermiso);
    console.log(datosPermiso);
    this.CambiarValorDiaLibre(datosPermiso);
  }

  CambiarValorDiaLibre(datos) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
      this.ActualizarDatos(datos);
    }
    else {
      this.ActualizarDatos(datos);
    }
  }

  RegistrarPermiso(form) {
    this.InsertarPermiso(form);
  }

  RevisarIngresoDias(form) {
    if (parseInt(form.diasForm) <= this.Tdias) {
      const resta = this.dIngreso.diff(this.dSalida, 'days');
      console.log('datos_resta', resta);
      if (resta != form.diasForm) {
        console.log('entra lllll')
        this.toastr.error('Recuerde el día de ingreso no puede superar o ser menor a los días de permiso solicitados.',
          'Día de ingreso incorrecto.', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        console.log('entra lllll', this.dIngreso)
        this.ImprimirDiaLibre(form, moment(this.dIngreso));
      }
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
      console.log('horas_nnn', form.horasForm, this.Thoras)
      if (form.horasForm <= this.Thoras) {
        this.RevisarIngresoHoras();
      }
      else {
        this.MensajeIngresoHoras(hora_empleado);
      }
    }
    else if (this.tipoPermisoSelec === 'Días y Horas') {
      //console.log("comparar horas", parseInt(datoHora));
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
    if (resta != contarDias) {
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
        console.log('verificar dias y horas', contarDias);
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

  VerificarDiasHoras(form, hora_empleado) {
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

  NotifiRes: any;
  ActualizarDatos(datos) {
    if (this.isChecked === true) {
      this.LimpiarNombreArchivo();
      if (this.archivoSubido != undefined) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.restP.EditarPermiso(this.info.dataPermiso.id, datos).subscribe(response => {
            this.toastr.success('Operación Exitosa', 'Permiso Editado', {
              timeOut: 6000,
            });
            this.LimpiarCampos();
            console.log(response);
            this.SubirRespaldo(this.info.dataPermiso.id)
          }, err => {
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.dialogRef.close();
            }
          });
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
            timeOut: 6000,
          });
        }
      } else {
        this.toastr.info('Falta que suba un archivo', 'Seleccione un archivo', {
          timeOut: 6000,
        });
      }

    } else {
      console.log(datos);
      this.restP.EditarPermiso(this.info.dataPermiso.id, datos).subscribe(response => {
        this.toastr.success('Operación Exitosa', 'Permiso Editado', {
          timeOut: 6000,
        });
        this.LimpiarCampos();
        this.dialogRef.close(true)
        console.log(response);
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.dialogRef.close();
        }
      });
    }
  }

  LimpiarCampos() {
    this.PermisoForm.reset();
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
    this.dialogRef.close(false);
  }


  /** *******************************************************************
   *  SUBIR ARCHIVO
   *  *******************************************************************
   */

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
      this.dialogRef.close(true);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });
  }

  /** ********************************************************************************
   *  MENSAJES QUE INDICAN ERRORES AL INGRESAR DATOS
   *  ********************************************************************************
   */
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

  /** Validar Ingreso de Hora de Salida y Hora de Retorno */
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
      if (tiempoTotal === total) {
        this.RegistrarPermiso(form);
      }
      else if (tiempoTotal + ':00' === total) {
        this.RegistrarPermiso(form);
      }
      else {
        this.toastr.error('El total de horas solicitadas no corresponda con el total de horas de salida e ingreso.', 'Verificar la horas de salida e ingreso de permiso.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.RegistrarPermiso(form);
    }
  }

  CargarInformacion(id) {
    this.LimpiarCamposFecha();
    this.datosPermiso = [];
    this.restTipoP.getOneTipoPermisoRest(id).subscribe(datos => {
      this.datosPermiso = datos;
      console.log(this.datosPermiso);
      if (this.datosPermiso[0].num_dia_maximo === 0) {
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        console.log('horas_thoras', this.Thoras)
        this.tipoPermisoSelec = 'Horas';
      }
      else if (this.datosPermiso[0].num_hora_maximo === '00:00:00') {
        this.Tdias = this.datosPermiso[0].num_dia_maximo;
        this.tipoPermisoSelec = 'Días';
      }
      else {
        this.Tdias = this.datosPermiso[0].num_dia_maximo;
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        this.tipoPermisoSelec = 'Días y Horas';
      }
    })
  }


}
