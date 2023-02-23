// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { LoginService } from 'src/app/servicios/login/login.service';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-permisos-multiples',
  templateUrl: './permisos-multiples.component.html',
  styleUrls: ['./permisos-multiples.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})
export class PermisosMultiplesComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  permiso: any = [];

  // USADO PARA IMPRIMIR DATOS
  datoNumPermiso: any = [];
  datosPermiso: any = [];
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
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  legalizarF = new FormControl('', [Validators.required]);
  diaLibreF = new FormControl('');
  estadoF = new FormControl('');
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PermisoForm = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    descripcionForm: this.descripcionF,
    fecCreacionForm: this.fecCreacionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    horaSalidaForm: this.horaSalidaF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
    legalizarForm: this.legalizarF,
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
    public dialogRef: MatDialogRef<PermisosMultiplesComponent>,
    public restPerV: PeriodoVacacionesService,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
  }

  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleado = data;
    })
  }

  // METODO PARA LISTAR TIPO DE PERMISOS DE ACUERDO AL ROL DEL USUARIO
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

  ContarDiasLibres(dateFrom, dateTo) {
    var from = moment(dateFrom, 'DD/MM/YYY'),
      to = moment(dateTo, 'DD/MM/YYY'),
      days = 0,
      libres = 0;
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
      var libre = this.ContarDiasLibres(form.fechaInicioForm, ingreso);
      this.PermisoForm.patchValue({
        diaLibreForm: libre,
      });
    }
  }

  // METODO PARA VALIDAR SI EL PERMISO TIENE RESTRICCIONES POR FECHA
  dSalida: any;
  validarFechaSalida(event, form) {

    // METODO PARA LIMPIAR CAMPOS USADOS POR FECHAS
    this.LimpiarCamposFecha();

    // VALIDACIÓN SELECCIÓN DE UN TIPO DE PERMISO
    if (form.idPermisoForm != '') {

      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var salida = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VALIDAR SI EXISTE RESTRICCIÓN DE FECHAS
      if (this.datosPermiso[0].fecha != '' && this.datosPermiso[0].fecha != null) {
        var fecha_negada = this.datosPermiso[0].fecha.split('T')[0];

        // VALIDAR FECHAS SIMILARES CON LA SOLICITUD
        if (Date.parse(salida) === Date.parse(fecha_negada)) {
          this.toastr.error('En la fecha ingresada no se va a otorgar permisos.', 'VERIFICAR', {
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

  // verificar no esta siendo usado
  dIngreso: any;
  fechas_horario: any = [];
  readonly: boolean = false;
  validarFechaIngreso(event, form) {
    this.readonly = false;
    this.fechas_horario = [];
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {
      this.horasTrabajo = [];
      let datosFechas = {
        id_emple: this.data.id,
        fecha: form.fechaInicioForm
      }
      console.log('datos', datosFechas)
      this.dIngreso = event.value;
      this.restH.BuscarNumeroHoras(datosFechas).subscribe(datos => {
        this.horasTrabajo = datos;
        this.VerificarDiasHoras(form, this.horasTrabajo[0].horas);
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
            const { access, message } = err.error.message;
            if (access === false) {
              this.toastr.error(message)
              this.dialogRef.close();
            }
          })
        }
      }, error => {
        this.toastr.info('Las fechas indicadas no se encuentran dentro de su horario laboral', 'VERIFICAR', {
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
    this.selec1 = false;
    this.selec2 = false;
    this.readonly = false;
    this.datosPermiso = [];
    this.restTipoP.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {
      this.datosPermiso = datos;
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

  // METODO PARA VALIDAR DATOS DE SOLICITUD DE PERMISO
  ValidarPermiso(form) {

    // CONSULTA DE DATOS DE TIPO DE PERMISO
    this.restTipoP.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(tipo => {

      // VALIDAR SI DOCUMENTO ES OBLIGATORIO U OPCIONAL
      if (tipo[0].documento === true) {
        // VALIDAR QUE SE HA SUBIDO OBLIGATORIAMENTE UN DOCUMENTO AL SISTEMA
        if (form.nombreCertificadoForm === '' || form.nombreCertificadoForm === null) {
          this.toastr.info('El permiso seleccionado requiere de un certificado.', 'Es indispensable que suba un documento de respaldo.', {
            timeOut: 6000,
          });
        }
        else {
          this.InsertarPermiso(form, tipo[0].documento);
        }
      }
      else {
        this.InsertarPermiso(form, tipo[0].documento);
      }
    });
  }

  // METODO INGRESO DE DATOS DE PERMISO
  contador: number = 0;
  InsertarPermiso(form, validar) {
    this.contador = 0;
    // LECTURA DE DATOS DE USUARIOS SELECCIONADOS
    this.data.datos.map(obj => {

      // METODO BUSQUEDA DE PERIODO DE VACACIONES
      this.restPerV.BuscarIDPerVacaciones(parseInt(obj.id)).subscribe(res => {

        // METODO BUSQUEDA NÚMERO DE PERMISO
        this.restP.BuscarNumPermiso(obj.id).subscribe(datosn => {

          // CONTABILIZAR NÚMERO DE PERMISO
          this.datoNumPermiso = datosn;
          if (this.datoNumPermiso[0].max === null) {
            this.num = 1;
          }
          else {
            this.num = this.datoNumPermiso[0].max + 1;
          }

          // DATOS DE PERMISO
          let datosPermiso = {
            id_empl: obj.id,
            dia: parseInt(form.diasForm),
            codigo: obj.codigo,
            estado: form.estadoForm,
            dia_libre: form.diaLibreForm,
            fec_final: form.fechaFinalForm,
            fec_inicio: form.fechaInicioForm,
            legalizado: form.legalizarForm,
            hora_salida: form.horaSalidaForm,
            descripcion: form.descripcionForm,
            docu_nombre: form.nombreCertificadoForm,
            hora_numero: form.horasForm,
            num_permiso: this.num,
            hora_ingreso: form.horasIngresoForm,
            fec_creacion: form.fecCreacionForm,
            id_empl_cargo: obj.id_cargo,
            id_tipo_permiso: form.idPermisoForm,
            id_peri_vacacion: res[0].id,
            id_empl_contrato: obj.id_contrato,
            depa_user_loggin: parseInt(localStorage.getItem('departamento')),
          }

          // METODO PARA CAMBIAR VALOR DE DÍAS - HORAS
          this.CambiarValoresDiasHoras(form, datosPermiso);

          // METODO PARA CAMBIAR DÍA LIBRE
          this.CambiarValorDiaLibre(datosPermiso);

          // METODO PARA LEER DATOS DE LA SOLICITUD
          this.GuardarDatos(datosPermiso, form, validar);
        })
      })
    });
  }

  // METODO PARA CAMBIAR FORMATO DE DÍAS LIBRES
  CambiarValorDiaLibre(datos) {
    if (datos.dia_libre === '') {
      datos.dia_libre = 0;
    }
  }

  RevisarIngresoDias(form) {
    if (parseInt(form.diasForm) <= this.Tdias) {
      console.log('revisar', this.dIngreso, this.dSalida)
      const resta = this.dIngreso.diff(this.dSalida, 'days');
      if (resta != form.diasForm) {
        this.toastr.error('Recuerde el día de ingreso no puede superar o ser menor a los días de permiso solicitados.',
          'Día de ingreso incorrecto.', {
          timeOut: 6000,
        });
        this.LimpiarCamposFecha();
      }
      else {
        this.ImprimirDiaLibre(form, this.dIngreso);
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


  // METODO PARA GUARDAR DATOS DE SOLICITUD DE PERMISO
  idPermisoRes: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  GuardarDatos(datos: any, form: any, validar) {

    // VALIDAR SI DOCUMENTO ES OBLIGATORIO U OPCIONAL
    if (validar === true) {
      this.RegistrarPermiso_Documento(datos, form);

    } else {
      // VALIDAR QUE SE HA SUBIDO UN DOCUMENTO AL SISTEMA
      if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
        this.RegistrarPermiso_Documento(datos, form);

      } else {
        this.RegistrarPermiso(datos);
      }

    }
    this.LimpiarCampos();
  }


  RegistrarPermiso(datos) {
    // METODO PARA INGRESAR SOLICITUD DE PERMISO
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {

      this.arrayNivelesDepa = response;
      console.log('response 1.. ', response)

      this.arrayNivelesDepa.forEach(obj => {

        // LECTURA DE DATOS DE NOTIFICACIÓN CORREO
        let datosPermisoCreado = this.LeerDatosMail(obj, datos);

        // METODO PARA ENVÍO DE CORREOS
        this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(res => {
          this.idPermisoRes = res;

          // METODO PARA REGISTRO DE AUTORIZACIÓN
          this.IngresarAutorizacion(this.idPermisoRes.id);

          // LECTURA DE DATOS Y ENVIO DE NOTIFICACIÓN SISTEMA
          this.LeerDatosNotificacion(datos.id_empl);

        });
      }, err => {
        this.ValidarAcceso(err);
      });

      this.contador = this.contador + 1;
      this.MostrarMensaje();

    }, err => {
      this.contador = this.contador + 1;
      this.MostrarMensaje();
      //this.ValidarAcceso(err);
    });
  }

  RegistrarPermiso_Documento(datos: any, form: any) {
    // METODO PARA INGRESAR SOLICITUD DE PERMISO
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(response => {

      this.arrayNivelesDepa = response;
      
      console.log('response 2.. ', response)

      this.arrayNivelesDepa.forEach(obj => {

        // LECTURA DE DATOS DE NOTIFICACIÓN CORREO
        let datosPermisoCreado = this.LeerDatosMail(obj, datos);

        // METODO PARA ENVÍO DE CORREOS
        this.restP.EnviarCorreoWeb(datosPermisoCreado).subscribe(res => {
          this.idPermisoRes = res;

          this.SubirRespaldo(this.idPermisoRes.id, form);

          // METODO PARA REGISTRO DE AUTORIZACIÓN
          this.IngresarAutorizacion(this.idPermisoRes.id);

          // LECTURA DE DATOS Y ENVIO DE NOTIFICACIÓN SISTEMA
          this.LeerDatosNotificacion(datos.id_empl);
        });
      });
      this.contador = this.contador + 1;
      this.MostrarMensaje();
    }, error => {
      this.contador = this.contador + 1;
      this.MostrarMensaje();
    });
  }

  //MENSAJE DE REGISTRO DE SOLICITUD DE PERMISO
  MostrarMensaje() {
    if (this.contador === this.data.datos.length) {
      this.toastr.success('Operación Exitosa', this.contador + ' Permisos registrados', {
        timeOut: 6000,
      });
    }

  }

  // METODO PARA VALIDAR ACCESO A FUNCIONES DE PERMISOS
  ValidarAcceso(info: any) {
    const { access, message } = info.error.message;
    if (access === false) {
      this.toastr.error(message)
      this.dialogRef.close();
    }
  }

  // METODO PARA LEER DATOS DE ENVÍO DE EMAIL
  LeerDatosMail(obj: any, datos: any) {
    let datosPermisoCreado = {
      id: obj.id,
      nivel: obj.nivel,
      cargo: obj.cargo,
      id_dep: obj.id_dep,
      id_suc: obj.id_suc,
      estado: obj.estado,
      nombre: obj.nombre,
      cedula: obj.cedula,
      correo: obj.correo,
      contrato: obj.contrato,
      apellido: obj.apellido,
      sucursal: obj.sucursal,
      empleado: obj.empleado,
      depa_padre: obj.depa_padre,
      fec_creacion: datos.fec_creacion,
      departamento: obj.departamento,
      permiso_mail: obj.permiso_mail,
      permiso_noti: obj.permiso_noti,
      id_tipo_permiso: datos.id_tipo_permiso,
      id_empl_contrato: datos.id_empl_contrato,
    }
    return datosPermisoCreado;
  }

  // METODO PARA LEER DATOS DE NOTIIFCACIÓN SISTEMA 
  LeerDatosNotificacion(id_empl: any) {
    var f = new Date();
    let notificacion = {
      id: null,
      id_send_empl: id_empl,
      id_receives_empl: this.idPermisoRes.id_empleado_autoriza,
      id_receives_depa: this.idPermisoRes.id_departamento_autoriza,
      estado: this.idPermisoRes.estado,
      create_at: `${this.FechaActual}T${f.toLocaleTimeString()}.000Z`,
      id_permiso: this.idPermisoRes.id,
      id_vacaciones: null,
      id_hora_extra: null
    }

    // METODO PARA ENVÍO DE NOTIFICACIONES EN EL SISTEMA
    this.realTime.IngresarNotificacionEmpleado(notificacion).subscribe(resN => {
      this.NotifiRes = resN;
      notificacion.id = this.NotifiRes._id;
      if (this.NotifiRes._id > 0 && this.idPermisoRes.notificacion === true) {
        this.restP.sendNotiRealTime(notificacion);
      }
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

  /* ***************************************
   * SUBIR ARCHIVO DE SOLICITUD DE PERMISO
   * ****************************************/

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {

      // VALIDAR QUE EL DOCUEMNTO SUBIDO CUMPLA CON EL TAMAÑO ESPECIFICADO
      if (this.archivoSubido[0].size <= 2e+6) {
        const name = this.archivoSubido[0].name;
        console.log(this.archivoSubido[0].name);
        this.PermisoForm.patchValue({ nombreCertificadoForm: name });
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
          timeOut: 6000,
        });
      }
    }
  }

  SubirRespaldo(id: number, form: any) {
    let formData = new FormData();
    console.log("tamaño", this.archivoSubido[0].size);
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm).subscribe(res => {
      /*  this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
          timeOut: 6000,
        });*/
      this.archivoForm.reset();
      this.nameFile = '';
    }, err => {
      this.ValidarAcceso(err);
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
        //this.InsertarPermiso(form);
      }
      else {
        this.toastr.error('El total de horas solicitadas no corresponda con el total de horas de salida e ingreso.', 'Verificar la hora de salida e ingreso de permiso.', {
          timeOut: 6000,
        });
      }
    }
    else {
      //this.InsertarPermiso(form);
    }
  }


  // METODO PARA CREAR AUTORIZACIÓN DE SOLICITUD DE PERMISO
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
