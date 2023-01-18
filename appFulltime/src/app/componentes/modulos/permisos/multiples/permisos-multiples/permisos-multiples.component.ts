// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

import { PermisosMultiplesEmpleadosComponent } from '../permisos-multiples-empleados/permisos-multiples-empleados.component';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-permisos-multiples',
  templateUrl: './permisos-multiples.component.html',
  styleUrls: ['./permisos-multiples.component.css'],
})

export class PermisosMultiplesComponent implements OnInit {

  @Input() data: any;

  permiso: any = [];

  // USADO PARA IMPRIMIR DATOS
  datoNumPermiso: any = [];
  datosPermiso: any = [];
  tipoPermisos: any = [];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Días', nombre: 'Días' },
    { valor: 'Horas', nombre: 'Horas' },
  ];


  // TOTAL DE DIAS SEGUN EL TIPO DE PERMISO
  Tdias = 0;
  // TOTAL DE HORAS SEGUN EL TIPO DE PERMISO
  Thoras: any;

  // NUMERO DEL PERMISO
  num: number;
  seleccion_tipo: string;

  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DIAS, HORAS, DIAS LIBRES
  HabilitarDias: boolean = false;
  ver_hora: boolean = false;

  // VARIABLES PARA VER INFORMACION DEL PERMISO
  informacion1: string = '';
  informacion2: string = '';
  ver_informacion: boolean = false;
  certificado: boolean = false;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('');
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('');
  archivoForm = new FormControl('');
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  horasF = new FormControl('');
  diasF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public PermisoForm = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horasIngresoForm: this.horaIngresoF,
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    horaSalidaForm: this.horaSalidaF,
    idPermisoForm: this.idPermisoF,
    solicitarForm: this.solicitarF,
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
    public restPerV: PeriodoVacacionesService,
    public validar: ValidacionesService,
    public restE: EmpleadoService,
    public componente: PermisosMultiplesEmpleadosComponent,
  ) { }

  ngOnInit(): void {
    console.log('ver data ', this.data)
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.ObtenerTiposPermiso();
  }

  // METODO PARA VER LA INFORMACION DEL EMPLEADO
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
      this.restTipoP.ListarTipoPermisoRol(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.restTipoP.BuscarTipoPermiso().subscribe(datos => {
        this.tipoPermisos = datos;
      });
    }
  }

  // METODO PARA MOSTRAR INFORMACION DEL TIPO DE PERMISO 
  legalizar: boolean = false;
  ImprimirDatos(form: any) {
    this.LimpiarInformacion();
    this.datosPermiso = [];
    this.restTipoP.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {
      this.datosPermiso = datos;
      console.log('ver datos ', this.datosPermiso)
      this.PermisoForm.patchValue({
        fechaInicioForm: '',
      });
      this.ver_informacion = true;

      // PERMISO LEGALIZADO
      this.legalizar = this.datosPermiso[0].legalizar;

      // DOCUMENTO REQUERIDO
      this.certificado = this.datosPermiso[0].documento;

      // PERMISO POR HORAS
      if (this.datosPermiso[0].num_dia_maximo === 0) {
        this.informacion2 = '';
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso[0].num_hora_maximo}`;
        this.ver_hora = true;
        this.HabilitarDias = false;
        this.PermisoForm.patchValue({
          solicitarForm: 'Horas',
        });
        this.Thoras = this.datosPermiso[0].num_hora_maximo;
        this.seleccion_tipo = 'Horas';
      }
      // PERMISO POR DIAS
      else if (this.datosPermiso[0].num_hora_maximo === '00:00:00') {
        this.informacion2 = '';
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso[0].num_dia_maximo}`;
        this.ver_hora = false;
        this.HabilitarDias = true;
        this.PermisoForm.patchValue({
          solicitarForm: 'Días',
        });
        this.Tdias = this.datosPermiso[0].num_dia_maximo;
        this.seleccion_tipo = 'Días';
      }
    })
  }

  // METODO PARA LIMPIAR CAMPOS FORMULARIO
  LimpiarInformacion() {
    this.PermisoForm.patchValue({
      horasIngresoForm: '',
      horaSalidaForm: '',
      fechaFinalForm: '',
      horasForm: '',
      diasForm: '',
    });
  }

  // METODO PARA VALIDAR TIPO DE SOLICITUD
  ActivarDiasHoras(form: any) {
    if (form.solicitarForm === 'Días') {
      this.LimpiarInformacion();
      this.ver_hora = false;
      this.HabilitarDias = true;
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarInformacion();
      this.ver_hora = true;
      this.HabilitarDias = false;
    }
  }

  // METODO PARA VALIDAR SI EL PERMISO TIENE RESTRICCIONES POR FECHA
  dSalida: any;
  ValidarFechaSalida(event: any, form: any) {

    // METODO PARA LIMPIAR CAMPOS USADOS POR FECHAS
    this.LimpiarInformacion();

    // VALIDACION SELECCION DE UN TIPO DE PERMISO
    if (form.idPermisoForm != '') {

      // CAPTURAR FECHA INGRESADA
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var salida = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VALIDAR SI EXISTE RESTRICCION DE FECHAS
      if (this.datosPermiso[0].fecha != '' && this.datosPermiso[0].fecha != null) {
        var fecha_negada = this.datosPermiso[0].fecha.split('T')[0];

        // VALIDAR FECHAS SIMILARES CON LA SOLICITUD
        if (Date.parse(salida) === Date.parse(fecha_negada)) {
          this.toastr.info('En la fecha ingresada no se va a otorgar permisos.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaInicioForm: '',
          });
        }
        else {
          this.ImprimirFecha(form);
        }
      }
      else {
        this.ImprimirFecha(form);
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 6000,
      });
      this.PermisoForm.patchValue({
        fechaInicioForm: '',
      });
    }
  }

  // IMPRIMIR FECHA TIPO SOLICITUD HORAS
  ImprimirFecha(form: any) {
    if (form.solicitarForm === 'Horas') {
      this.PermisoForm.patchValue({
        fechaFinalForm: form.fechaInicioForm,
      });
    }
  }

  // METODO PARA VERIFICAR FECHA DE INGRESO
  dIngreso: any;
  ValidarFechaIngreso(event: any, form: any) {
    this.horasF.setValue('');

    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {

      this.dIngreso = event.value;

      // SI EL PERMISO ES POR HORAS SE IMPRIME FECHA DESDE = HASTA
      if (form.solicitarForm === 'Horas') {
        this.ImprimirFecha(form);
      }
      else {
        // CAPTURAR FECHA INGRESADA
        var fecha = new Date(String(moment(event.value._i)));
        var inicio = String(moment(form.fechaInicioForm, "YYYY/MM/DD").format("YYYY-MM-DD"));
        var fin = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

        // VERIFICAR QUE LA FECHA INGRESADA SEA CORRECTA
        if (Date.parse(inicio) <= Date.parse(fin)) {
          this.ValidarConfiguracionDias();
        }
        else {
          this.toastr.warning('Las fechas ingresadas no son correctas.', 'VERIFICAR', {
            timeOut: 6000,
          });
          this.PermisoForm.patchValue({
            fechaFinalForm: '',
          });
        }
      }
    }
    else {
      this.toastr.warning('Aún no selecciona un tipo de permiso o aún no ingresa fecha hasta.', 'VERIFICAR', {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
  }

  // METODO PARA VERIFICAR INGRESO DE DIAS DE ACUERDO A LA CONFIGURACION DEL PERMISO
  ValidarConfiguracionDias() {
    if (this.seleccion_tipo === 'Días') {
      const resta = this.dIngreso.diff(this.dSalida, 'days');
      this.diasF.setValue(resta + 1);
      if ((resta + 1) > this.Tdias) {
        this.toastr.warning(
          `Sin embargo los dias máximos de permiso son ${this.Tdias}.`,
          `Ha solicitado ${resta + 1} días de permiso.`, {
          timeOut: 6000,
        });
        this.LimpiarInformacion();
      }
    }
    else if (this.seleccion_tipo === 'Horas') {
      this.toastr.warning
        (`No puede solicitar días de permiso. 
          Las horas de permiso que puede solicitar deben ser menores o iguales a: ${String(this.Thoras)} horas.`,
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarInformacion();
    }
  }

  // METODO PARA CALCULAR HORAS DE PERMISO
  CalcularHoras(form: any) {
    this.horasF.setValue('');
    // VALIDAR HORAS INGRESDAS
    if (form.horaSalidaForm != '' && form.horasIngresoForm != '') {
      //FORMATO DE HORAS
      var inicio = moment.duration(moment(form.horaSalidaForm, 'HH:mm:ss').format('HH:mm:ss'));
      var fin = moment.duration(moment(form.horasIngresoForm, 'HH:mm:ss').format('HH:mm:ss'));
      // RESTAR HORAS
      var resta = fin.subtract(inicio);

      // COLOCAR FORMATO DE HORAS EN FORMULARIO
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

      this.horasF.setValue(tiempoTotal);

      // VALIDAR NUMERO DE HORAS SOLICITADAS
      this.ValidarConfiguracionHoras(tiempoTotal);
    }
    else {
      this.toastr.info('Debe ingresar hora desde y hora hasta, para realizar el cálculo.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA VERIFICAR INGRESO DE HORAS DE ACUERDO A LA CONFIGURACION DEL PERMISO
  ValidarConfiguracionHoras(valor: any) {
    if (valor === '00:00') {
      this.toastr.warning(
        `Ha solicitado ${valor} horas de permiso.`,
        `Ups!!! algo salio mal.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
    else {
      if (this.seleccion_tipo === 'Días') {
        if (valor > '07:00') {
          this.MensajeIngresoHoras(8, valor);
        }
      }
      else if (this.seleccion_tipo === 'Horas') {
        if (valor.split(":") > this.Thoras) {
          this.MensajeIngresoHoras(8, valor);
        }
      }
    }
  }

  // MENSAJES DE ERRORES EN INGRESO DE HORAS
  MensajeIngresoHoras(hora_empleado: any, valor: any) {
    if (this.seleccion_tipo === 'Días') {
      this.toastr.warning(
        `Si solicita un permiso por horas recuerde que estás deben ser menor a ${hora_empleado} horas.
          Podría solicitar el permiso por días, máximo hasta ${String(this.Tdias)} dias de permiso.`,
        `Ha solicitado ${valor} horas de permiso.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
    else if (this.seleccion_tipo === 'Horas') {
      this.toastr.warning(
        `Las horas de permiso que puede solicitar deben ser menores o iguales a ${String(this.Thoras)} horas.`,
        `Ha solicitado ${valor} horas de permiso.`, {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
  }

  // METODO PARA LIMPIAR CALCULO DE HORAS
  LimpiarHoras() {
    this.horasF.setValue('');
  }









































  CambiarValoresDiasHoras(form, datos) {
    if (form.solicitarForm === 'Días') {
      datos.hora_numero = '00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
    }
  }

  // METODO PARA VALIDAR DATOS DE SOLICITUD DE PERMISO
  ValidarPermiso(form) {

    this.InsertarPermiso(form);


  }

  // METODO INGRESO DE DATOS DE PERMISO
  contador: number = 0;
  InsertarPermiso(form) {
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
            estado: 1,
            dia_libre: 0,
            fec_final: form.fechaFinalForm,
            fec_inicio: form.fechaInicioForm,
            legalizado: this.datosPermiso[0].legalizar,
            hora_salida: form.horaSalidaForm,
            descripcion: form.descripcionForm,
            docu_nombre: form.nombreCertificadoForm,
            hora_numero: form.horasForm,
            num_permiso: this.num,
            hora_ingreso: form.horasIngresoForm,
            fec_creacion: this.FechaActual,
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
          this.GuardarDatos(datosPermiso, form);
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















  // METODO PARA GUARDAR DATOS DE SOLICITUD DE PERMISO
  idPermisoRes: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  GuardarDatos(datos: any, form: any) {


    // VALIDAR QUE SE HA SUBIDO UN DOCUMENTO AL SISTEMA
    if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
      this.RegistrarPermiso_Documento(datos, form);

    } else {
      this.RegistrarPermiso(datos);
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
        // this.ValidarAcceso(err);
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






  // METODO PARA CREAR AUTORIZACION DE SOLICITUD DE PERMISO
  IngresarAutorizacion(id_permiso: number) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACION
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACION 
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento')),
      id_permiso: id_permiso,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    })
  }


  /** *************************************************************************************************** **
   ** **                              SUBIR ARCHIVO DE SOLICITUD DE PERMISO                            ** **
   ** *************************************************************************************************** **/

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.nombreCertificadoF.patchValue('');
  }

  // METODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      // VALIDAR QUE EL DOCUEMNTO SUBIDO CUMPLA CON EL TAMAÑO ESPECIFICADO
      if (this.archivoSubido[0].size <= 2e+6) {
        const name = this.archivoSubido[0].name;
        this.PermisoForm.patchValue({ nombreCertificadoForm: name });
        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA REGISTRAR ARCHIVO DE PERMISO
  SubirRespaldo(id: number, form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm).subscribe(res => {
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // METODO PARA LIMPIAR FORMULARIO DEL ARCHIVO
  LimpiarNombreArchivo() {
    this.PermisoForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumeros(evt: any) {
    this.LimpiarHoras();
    return this.validar.IngresarSoloNumeros(evt);
  }

  // METODO PARA LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.PermisoForm.reset();
    this.HabilitarBtn = false;
  }

  // METODO PARA CERRAR FORMULARIO DE PERMISOS
  CerrarVentana() {
    this.LimpiarCampos();
    this.componente.activar_busqueda = true;
    this.componente.activar_permisos = false;
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





}
