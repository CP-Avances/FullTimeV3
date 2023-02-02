// IMPORTACION LIBRERIAS 
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
// IMPORTACION DE SERVICIOS 
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// CREACIÓN DE LISTA DE OPCIONES DE SOLICITUD DE PERMISO 
interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-permiso-empleado',
  templateUrl: './editar-permiso-empleado.component.html',
  styleUrls: ['./editar-permiso-empleado.component.css'],
  // FORMATO DE FECHA DIA - MES - AÑO / ESPAÑOL 
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarPermisoEmpleadoComponent implements OnInit {

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'su solicitud';
  user = '';

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

  num: number; // VARIABLE QUEALMACENA EL NÚMERO DE PERMISO SOLICITADO
  Tdias = 0; // VARIABLE QUE ALMACENA EL TOTAL DE DÍAS DE PERMISO
  Thoras; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS DE PERMISO
  isChecked: boolean = false; // VARIABLE QUE INDICA SI SE VA A ACTUALIZAR EL ARCHIVO 

  tipoPermisoSelec: string; // VARIABLE QUE INDICA QUE TIPO DE PERMISOS SELECCIONÓ EL EMEPLEADO
  horasTrabajo: any = []; // VARIABLE QUE ALMACENA EL TOTAL DE HORAS QUE TRABAJA EL EMPLEADO
  FechaActual: any; // VARIABLE QUE INIDCA LA FECHA ACTUAL EN LA QUE SE REGISTRA O PIDE EL PERMISO

  // EVENTOS PARA ACTIVAR O DESACTIVAR INGRESO DE DIAS- HORAS - DIAS/HORAS SEGUN SELECCIÓN DEL USUARIO
  HabilitarDias: boolean = true;
  estiloDias: any;
  HabilitarHoras: boolean = true;
  estiloHoras: any;
  HabilitarDiasL: boolean = true;
  estiloDiasL: any;

  // CONTROL DE CAMPOS Y VALIDACIONES DE FORMULARIO
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('', Validators.required);
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
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
    public ventana: MatDialogRef<EditarPermisoEmpleadoComponent>,
    private restH: EmpleadoHorariosService,
    private restP: PermisosService,
    private restE: EmpleadoService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private restTipoP: TipoPermisosService,
    private informacion: DatosGeneralesService,
    private loginServise: LoginService,
    public parametro: ParametrosService,
    public validar: ValidacionesService,
    @Inject(MAT_DIALOG_DATA) public info: any
  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {

    this.CargarInformacion(this.info.dataPermiso.id_tipo_permiso);
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    console.log(this.info);
    this.num = this.info.dataPermiso.num_permiso
    this.obtenerInformacionEmpleado();
    this.ComparacionSolicitud();
    this.ObtenerTiposPermiso();
    this.ObtenerEmpleado(this.info.id_empleado);
    this.ObtenerDatos();
    this.MostrarDatos();
    this.BuscarParametro();
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
      });
  }

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
      });
  }

  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    this.informacion.ObtenerInfoConfiguracion(this.info.id_empleado).subscribe(
      res => {
        if (res.estado === 1) {
          var estado = true;
        }
        this.solInfo = [];
        this.solInfo = {
          permiso_mail: res.permiso_mail,
          permiso_noti: res.permiso_noti,
          empleado: res.id_empleado,
          id_dep: res.id_departamento,
          id_suc: res.id_sucursal,
          estado: estado,
          correo: res.correo,
          fullname: res.fullname,
        }
        if (this.info.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
        }
      })
  }

  // METODO PARA OBTENER DATOS DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA OBTENER DATOS DEL USUARIO
  actuales: any = [];
  ObtenerDatos() {
    this.actuales = [];
    this.informacion.ObtenerDatosActuales(this.info.id_empleado).subscribe(datos => {
      this.actuales = datos;
    });
  }

  // METODO PARA COMPARAR QUE TIPO DE SOLIICTUD REALIZÓ PERMISOS POR DIAS - HORAS - DIAS/HORAS 
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

  // METODO PARA IMPRIMIR EN EL FORMULARIO LA INFORMACIÓN DEL PERMISO SOLICITADO 
  MostrarDatos() {
    this.PermisoForm.patchValue({
      nombreCertificadoForm: this.info.dataPermiso.docu_nombre,
      horasIngresoForm: this.info.dataPermiso.hora_ingreso,
      fechaInicioForm: String(moment(this.info.dataPermiso.fec_inicio).format('YYYY-MM-DD')),
      descripcionForm: this.info.dataPermiso.descripcion,
      horaSalidaForm: this.info.dataPermiso.hora_salida,
      fechaFinalForm: String(moment(this.info.dataPermiso.fec_final).format('YYYY-MM-DD')),
      idPermisoForm: this.info.dataPermiso.id_tipo_permiso,
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
    this.dSalida = String(moment(this.info.dataPermiso.fec_inicio).format('YYYY-MM-DD'));
    this.dIngreso = String(moment(this.info.dataPermiso.fec_final).format('YYYY-MM-DD'));
    console.log('cargar datos', this.dSalida, this.dIngreso)
  }

  // METODO PARA MOSTRAR LISTA DE PERMISOS DE ACUERDO AL ROL 
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    let rol = this.loginServise.getRol();
    if (rol >= 2) {
      this.restTipoP.ListarTipoPermisoRol(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.restTipoP.BuscarTipoPermiso().subscribe(datos => {
        this.tipoPermisos = datos;
      });
    }
  }

  // METODO PARA CALCULAR DÍAS LIBRES 
  ContarDiasLibres(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      libres = 0;
    //console.log('verificar ingreso', '1' + dateFrom, '2' + dateTo, '3' + from, '4' + to)
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

  // METODO PARA MOSTRAR CALCULO DE DIAS LIBRES
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

      this.dIngreso = event.value;
      var inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
      var final = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));

      if (Date.parse(inicio) > Date.parse(final)) {
        this.toastr.error('Las fechas no han sido ingresadas de forma correcta.', 'VERIFICAR', {
          timeOut: 6000,
        });
        this.PermisoForm.patchValue({
          fechaInicioForm: '',
          fechaFinalForm: ''
        });
      }
      else {
        this.horasTrabajo = [];
        let datosFechas = {
          id_emple: this.info.id_empleado,
          fecha: moment(form.fechaInicioForm, "YYYY/MM/DD").format("YYYY-MM-DD")
        }
        console.log('fechas', datosFechas)
        this.dIngreso = event.value;
        this.restH.BuscarHorarioDias(datosFechas).subscribe(datos => {
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
    this.restTipoP.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {
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

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
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

  InsertarPermiso(form: any) {
    var depa_user_loggin = parseInt(this.actuales[0].id_departamento);
    let datosPermiso = {
      depa_user_loggin: depa_user_loggin,
      id_tipo_permiso: form.idPermisoForm,
      anterior_doc: this.info.dataPermiso.documento,
      hora_ingreso: form.horasIngresoForm,
      descripcion: form.descripcionForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      docu_nombre: form.nombreCertificadoForm,
      hora_salida: form.horaSalidaForm,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      dia_libre: form.diaLibreForm,
      dia: parseInt(form.diasForm),
    }
    if (this.isChecked === false) {
      datosPermiso.anterior_doc = null;
      datosPermiso.docu_nombre = null;
    }
    console.log(datosPermiso);
    this.CambiarValoresDiasHoras(form, datosPermiso);
    console.log(datosPermiso);
    this.CambiarValorDiaLibre(datosPermiso, form);
  }

  CambiarValorDiaLibre(datos: any, form: any) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
      this.ActualizarDatos(datos, form);
    }
    else {
      this.ActualizarDatos(datos, form);
    }
  }

  RegistrarPermiso(form) {
    this.InsertarPermiso(form);
  }

  /*RevisarIngresoDias(form) {
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
  }*/


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
  ActualizarDatos(datos: any, form: any) {
    if (this.isChecked === true) {
      this.LimpiarNombreArchivo();
      if (this.archivoSubido != undefined) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.restP.EditarPermiso(this.info.dataPermiso.id, datos).subscribe(permiso => {
            this.toastr.success('Operación Exitosa', 'Permiso Editado', {
              timeOut: 6000,
            });
            this.SubirRespaldo(this.info.dataPermiso.id, form);
            permiso.EmpleadosSendNotiEmail.push(this.solInfo);
            this.EnviarCorreo(permiso);
            this.EnviarNotificacion(permiso);
            this.CerrarVentanaPermiso();
            console.log('ver informacion de permiso ', permiso);
          }, err => {
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.ventana.close();
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
      this.restP.EditarPermiso(this.info.dataPermiso.id, datos).subscribe(permiso => {
        this.toastr.success('Operación Exitosa', 'Permiso Editado', {
          timeOut: 6000,
        });
        permiso.EmpleadosSendNotiEmail.push(this.solInfo);
        this.EnviarCorreo(permiso);
        this.EnviarNotificacion(permiso);
        this.CerrarVentanaPermiso();
        console.log('ver informacion de permiso ', permiso);
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
          this.ventana.close();
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
    this.ventana.close(false);
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

  SubirRespaldo(id: number, form: any) {
    let formData = new FormData();
    console.log("tamaño", this.archivoSubido[0].size);
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
      this.ventana.close(true);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.ventana.close();
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
    this.restTipoP.BuscarUnTipoPermiso(id).subscribe(datos => {
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


  /** ******************************************************************************************* **
   ** **                   METODO DE ENVIO DE NOTIFICACIONES DE PERMISOS                       ** **
   ** ******************************************************************************************* **/

  EnviarCorreo(permiso: any) {

    console.log('entra correo')
    var cont = 0;
    var correo_usuarios = '';

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let solicitud = this.validar.FormatearFecha(permiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    // CAPTURANDO ESTADO DE LA SOLICITUD DE PERMISO
    if (permiso.estado === 1) {
      var estado_p = 'Pendiente de autorización';
    }
    else if (permiso.estado === 2) {
      var estado_p = 'Preautorizada';
    }
    else if (permiso.estado === 3) {
      var estado_p = 'Autorizada';
    }
    else if (permiso.estado === 1) {
      var estado_p = 'Negada';
    }

    // LEYENDO DATOS DE TIPO DE PERMISO
    var tipo_permiso = '';
    this.tipoPermisos.filter(o => {
      if (o.id === permiso.id_tipo_permiso) {
        tipo_permiso = o.descripcion
      }
      return tipo_permiso;
    })

    // VERIFICACIÓN QUE TODOS LOS DATOS HAYAN SIDO LEIDOS PARA ENVIAR CORREO
    permiso.EmpleadosSendNotiEmail.forEach(e => {

      console.log('for each', e)

      // LECTURA DE DATOS LEIDOS
      cont = cont + 1;

      // SI EL USUARIO SE ENCUENTRA ACTIVO Y TIENEN CONFIGURACIÓN RECIBIRA CORREO DE SOLICITUD DE VACACIÓN
      if (e.permiso_mail) {
        if (e.estado === true) {
          if (correo_usuarios === '') {
            correo_usuarios = e.correo;
          }
          else {
            correo_usuarios = correo_usuarios + ', ' + e.correo
          }
        }
      }

      console.log('contadores', permiso.EmpleadosSendNotiEmail.length + ' cont ' + cont)

      if (cont === permiso.EmpleadosSendNotiEmail.length) {

        console.log('data entra correo usuarios', correo_usuarios)

        let datosPermisoCreado = {
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          id_empl_contrato: permiso.id_empl_contrato,
          tipo_solicitud: 'Permiso actualizado por',
          horas_permiso: permiso.hora_numero,
          observacion: permiso.descripcion,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          estado_p: estado_p,
          proceso: 'actualizado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'ACTUALIZACION DE SOLICITUD DE PERMISO',
          id: permiso.id,
          solicitado_por: localStorage.getItem('fullname_print'),
        }
        if (correo_usuarios != '') {
          console.log('data entra enviar correo')

          this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(
            resp => {
              console.log('data entra enviar correo', resp)
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

  EnviarNotificacion(permiso: any) {

    // METODO PARA OBTENER NOMBRE DEL DÍA EN EL CUAL SE REALIZA LA SOLICITUD DE PERMISO
    let desde = this.validar.FormatearFecha(permiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(permiso.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(permiso.hora_salida, this.formato_hora);
    let h_fin = this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora);

    if (h_inicio === '00:00') {
      h_inicio = '';
    }

    if (h_fin === '00:00') {
      h_fin = '';
    }

    let notificacion = {
      id_send_empl: this.idEmpleadoIngresa,
      id_receives_empl: '',
      id_receives_depa: '',
      estado: 'Pendiente',
      id_permiso: permiso.id,
      id_vacaciones: null,
      id_hora_extra: null,
      tipo: 1,
      mensaje: 'Ha actualizado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
        desde + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + h_fin,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del catalogo
    permiso.EmpleadosSendNotiEmail.forEach(function(elemento, indice, array) {
      // Discriminación de elementos iguales
      if(allNotificaciones.find(p=>p.fullname == elemento.fullname) == undefined)
      {
        // Nueva lista de empleados que reciben la notificacion
        allNotificaciones.push(elemento);
      }
    });

    //ForEach para enviar la notificacion a cada usuario dentro de la nueva lista filtrada
    allNotificaciones.forEach(e => {
      notificacion.id_receives_depa = e.id_dep;
      notificacion.id_receives_empl = e.empleado;
      if (e.permiso_noti) {
        this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(
          resp => {
            this.restP.sendNotiRealTime(resp.respuesta);
          },
          err => {
            this.toastr.error(err.error.message, '', {
              timeOut: 6000,
            });
          },
          () => { },
        )
      }

    })

  }


}
