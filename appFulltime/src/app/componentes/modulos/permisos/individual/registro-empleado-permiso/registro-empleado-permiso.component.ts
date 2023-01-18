// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// INVOCACION DE SERVICIOS
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { VerEmpleadoComponent } from 'src/app/componentes/empleado/ver-empleado/ver-empleado.component';

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registro-empleado-permiso',
  templateUrl: './registro-empleado-permiso.component.html',
  styleUrls: ['./registro-empleado-permiso.component.css'],

})

export class RegistroEmpleadoPermisoComponent implements OnInit {

  @Input() solicita_permiso: any;

  // VARIABLES DE ALMACENAMIENTO
  datos: any = [];
  permiso: any = [];

  // DATOS DEL EMPLEADO QUE INICIA SESION
  idEmpleadoIngresa: number;
  nota = 'una solicitud';
  user = '';
  codigo: number;

  // USADO PARA IMPRIMIR DATOS
  datosPermiso: any = [];
  numero_permiso: any = [];
  tipoPermisos: any = [];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
  ];

  // TOTAL DE DIAS SEGUN EL TIPO DE PERMISO
  Tdias = 0;
  // TOTAL DE HORAS SEGUN EL TIPO DE PERMISO
  Thoras: any;

  // NUMERO DEL PERMISO
  num: number;
  configuracion_permiso: string;
  // VARIABLE PARA GUARDAR FECHA ACTUAL TOMADA DEL SISTEMA
  FechaActual: any;
  horasTrabajo: any = [];

  // VARIABLES PARA OCULTAR O VISIBILIZAR INGRESO DE DATOS DIAS, HORAS, DIAS LIBRES
  habilitarDias: boolean = false;

  // INFORMACION DEL PERMISO
  informacion1: string = '';
  informacion2: string = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreCertificadoF = new FormControl('');
  descripcionF = new FormControl('');
  fecCreacionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  horaIngresoF = new FormControl('');
  archivoForm = new FormControl('');
  fechaFinalF = new FormControl('', [Validators.required]);
  horaSalidaF = new FormControl('');
  idPermisoF = new FormControl('', [Validators.required]);
  solicitarF = new FormControl('', [Validators.required]);
  diaLaboralF = new FormControl('');
  diaLibreF = new FormControl('');
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
    diaLaboralForm: this.diaLaboralF,
    diaLibreForm: this.diaLibreF,
    horasForm: this.horasF,
    diasForm: this.diasF,
  });

  constructor(
    private loginServise: LoginService,
    private informacion_: DatosGeneralesService,
    private tipoPermiso: TipoPermisosService,
    private realTime: RealTimeService,
    private toastr: ToastrService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    public restE: EmpleadoService,
    public validar: ValidacionesService,
    public restAutoriza: AutorizacionService,
    public parametro: ParametrosService,
    public componente: VerEmpleadoComponent,

  ) {
    this.idEmpleadoIngresa = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.datos = this.solicita_permiso[0];
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.obtenerInformacionEmpleado();
    this.ImprimirNumeroPermiso();
    this.ObtenerTiposPermiso();
    this.ObtenerEmpleado();
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

  // METODO PARA VER LA INFORMACION DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado() {
    this.empleado = [];
    this.restE.BuscarUnEmpleado(parseInt(this.datos.id_empleado)).subscribe(data => {
      this.empleado = data[0];
    })
  }

  // IMPRIMIR DATOS DEL TIPO DE PERMISO SELECCIONADO
  activar_hora: boolean = false;
  informacion: boolean = false;
  legalizado: boolean = false;
  certificado: boolean = false;
  ImprimirDatos(form: any) {
    this.LimpiarFormulario();
    this.datosPermiso = [];
    this.tipoPermiso.BuscarUnTipoPermiso(form.idPermisoForm).subscribe(datos => {
      // VARIABLES GLOBALES SETEADAS EN 0
      this.Tdias = 0;
      this.Thoras = 0;

      // ALMACENAMIENTO DE DATOS DE PERMISO
      this.informacion = true;
      this.datosPermiso = datos[0];

      // PERMISO LEGALIZADO
      this.legalizado = this.datosPermiso.legalizar;

      // DOCUMENTO REQUERIDO
      this.certificado = this.datosPermiso.documento;

      // SOLICITUD POR HORAS
      if (this.datosPermiso.num_dia_maximo === 0) {
        this.informacion2 = '';
        this.informacion1 = `Horas máximas de permiso: ${this.datosPermiso.num_hora_maximo}`;
        this.habilitarDias = false;
        this.activar_hora = true;
        this.PermisoForm.patchValue({
          solicitarForm: 'Horas',
        });
        this.Thoras = this.datosPermiso.num_hora_maximo;
        this.configuracion_permiso = 'Horas';
      }
      // SOLICITUD POR DIAS
      else if (this.datosPermiso.num_hora_maximo === '00:00:00') {
        this.informacion2 = '';
        this.informacion1 = `Días máximos de permiso: ${this.datosPermiso.num_dia_maximo}`;
        this.habilitarDias = true;
        this.activar_hora = false;
        this.PermisoForm.patchValue({
          solicitarForm: 'Dias',
        });
        this.Tdias = this.datosPermiso.num_dia_maximo;
        this.configuracion_permiso = 'Dias';
      }
    })
  }

  // METODO PARA IMPRIMIR NUMERO DE PERMISO
  ImprimirNumeroPermiso() {
    this.numero_permiso = [];
    this.restP.BuscarNumPermiso(this.datos.id_empleado).subscribe(datos => {
      this.numero_permiso = datos[0];
      if (this.numero_permiso.max === null) {
        this.num = 1;
      }
      else {
        this.num = this.numero_permiso.max + 1;
      }
    })
  }

  // ACTIVAR FORMULARIO DE ACUERDO A SELECCION DE TIPO 
  ActivarDiasHoras(form: any) {
    if (form.solicitarForm === 'Dias') {
      this.LimpiarFormulario();
      this.activar_hora = false;
      this.habilitarDias = true;
    }
    else if (form.solicitarForm === 'Horas') {
      this.LimpiarFormulario();
      this.activar_hora = true;
      this.habilitarDias = false;
    }
  }

  // METODO DE VALIDACIONES DE FECHA DE INICIO
  dSalida: any;
  ValidarFechaSalida(event: any, form: any) {

    // LIMPIAR CAMPOS DE FECHAS
    this.LimpiarInformacion();

    // VALIDACION DE SELECCION DE TIPO DE PERMISOS
    if (form.idPermisoForm != '') {

      // LECTURA DE FECHAS
      this.dSalida = event.value;
      var leer_fecha = event.value._i;
      var fecha = new Date(String(moment(leer_fecha)));
      var inicio = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VERIFICACION DE RESTRICCION DE FECHAS
      if (this.datosPermiso.fecha != '' && this.datosPermiso.fecha != null) {
        var fecha_negada = this.datosPermiso.fecha.split('T')[0];

        // VERIFICACION DE FECHA NO VALIDA CON LA SALIDA DE PERMISO
        if (Date.parse(inicio) === Date.parse(fecha_negada)) {
          this.toastr.warning('En la fecha ingresada no es posible otorgar este tipo de permiso.', 'VERIFICAR', {
            timeOut: 4000,
          });
          this.fechaInicioF.setValue('');
        }
      }
    }
    else {
      this.toastr.warning('Ups!!! no ha seleccionado ningún tipo de permiso.', '', {
        timeOut: 4000,
      });
      this.fechaInicioF.setValue('');
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

  // METODO PARA VALIDAR FECHA DE FINALIZACION DE PERMISO
  dIngreso: any;
  fechas_horario: any = [];
  ValidarFechaIngreso(event: any, form: any) {


    this.fechas_horario = [];

    //VALIDAR INGRESO DE FECHA DE SALIDA Y SELECCION DE TIPO DE PERMISO
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {

      // CAPTURAR FECHA Y FORMATEAR A YYYY-MM-DD
      this.dIngreso = event.value;
      var inicio = String(moment(this.dSalida, "YYYY/MM/DD").format("YYYY-MM-DD"));
      var final = String(moment(this.dIngreso, "YYYY/MM/DD").format("YYYY-MM-DD"));

      // VERIFICAR QUE LAS FECHAS INGRESADAS DE FORMA CORRECTA
      if (Date.parse(inicio) > Date.parse(final)) {
        this.toastr.warning('Las fechas no han sido ingresadas de forma correcta.', 'VERIFICAR', {
          timeOut: 6000,
        });
        this.fechaInicioF.setValue('');
        this.fechaFinalF.setValue('');
      }
      // SI FECHAS INGRESADAS CORRECTAMENTE
      else {

        // BUSQUEDA DE PLANIFICACION DEL USUARIO
        let datosFechas = {
          codigo: this.empleado.codigo,
          fecha_inicio: form.fechaInicioForm,
          fecha_final: form.fechaFinalForm,
        }
        this.restH.BuscarNumeroHoras(datosFechas).subscribe(horas => {
          // PERMISO SOLICITADO POR DIAS
          if (form.solicitarForm === 'Dias') {
            // METODO PARA BUSCAR PERMISOS SOLICITADOS POR DIAS
            this.horasTrabajo = [];
            let solicitud = {
              fec_inicio: inicio,
              fec_final: final,
              codigo: parseInt(this.empleado.codigo)
            }
            this.restP.BuscarPermisosSolicitados(solicitud).subscribe(solicitados => {
              // EXISTEN REGISTROS DE PERMISOS POR DIAS
              if (solicitados.length != 0) {
                this.toastr.info('En las fechas ingresadas ya existe un registro de solicitud.', 'VERIFICAR', {
                  timeOut: 6000,
                });
                this.fechaInicioF.setValue('');
                this.LimpiarInformacion();
                // NO EXISTEN PERMISOS SOLICITADOS POR DIAS
              } else {
                this.ValidarConfiguracionDias();
              }
            })
          }

          // PERMISO SOLICITADO POR HORAS
          else {

          }

          // EL USUARIO NO TIENE PLANIFICACION HORARIA
        }, error => {
          this.toastr.warning('No tiene asignada una planificación horaria en las fechas ingresadas.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
          this.fechaInicioF.setValue('');
          this.LimpiarInformacion();
        });
      }
    }
    // MENSAJE NO HA SELECCIONADO TIPO DE PERMISO O NO HA INGRESADO FECHA
    else {
      this.toastr.warning('Seleccione un tipo de permiso e ingrese fecha de inicio de permiso.', 'Ups!!! algo salio mal.', {
        timeOut: 4000,
      });
      this.LimpiarInformacion();
    }
  }

  // METODO PARA VALIDAR QUE SE INGRESE DIAS - HORAS DE SOLICITUD DE PERMISOS
  ValidarConfiguracionDias() {
    if (this.configuracion_permiso === 'Dias') {
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
    else if (this.configuracion_permiso === 'Horas') {
      this.toastr.warning
        (`No puede solicitar días de permiso. 
          Las horas de permiso que puede solicitar deben ser menores o iguales a: ${String(this.Thoras)} horas.`,
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarInformacion();
    }
  }


  /**
   
    VerificarDiasHoras(form: any, horas: any) {
  
      // VALIDAR SOLICITUD DE PERMISO POR DÍAS
      if (form.solicitarForm === 'Dias') {
        if (form.diasForm === '' || form.diasForm == 0) {
          this.toastr.info('Aún no ha ingresado número de días de permiso.', '', {
            timeOut: 6000,
          });
          this.LimpiarInformacion();
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
          this.LimpiarInformacion();
        }
        else {
          this.ValidarConfiguracionHoras(form, hora_empleado);
        }
      }
    }
  
   */




  /**
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
              // METODO DE BUSQUEDA DE HORAS DE TRABAJO
              this.restH.BuscarNumeroHoras(datosFechas).subscribe(datos => {
                this.horasTrabajo = datos;
  
                console.log('ver horas trabajadas', this.horasTrabajo)
                // METODO PARA VALIDAR TIPO DE SOLICITUD DE PERMISO
                
  
                // SOLICITUD DE PERMISO POR DÍAS
                if (form.solicitarForm === 'Dias') {
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
                  }, err => {
                       const { access, message } = err.error.message;
                       if (access === false) {
                         this.toastr.error(message)
                         this.ventana.close();
                       }
                      })
                    }
                  }, error => {
                    this.toastr.info('Las fechas indicadas no se encuentran dentro de su horario laboral', 'VERIFICAR', {
                      timeOut: 6000,
                    });
                    this.LimpiarInformacion();
                  });
                }
              }) 
  
  
  
   */











































  // METODO PARA OBTENER CONFIGURACION DE NOTIFICACIONES
  solInfo: any;
  obtenerInformacionEmpleado() {
    this.informacion_.ObtenerInfoConfiguracion(this.datos.id_empleado).subscribe(
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
        if (this.datos.id_empleado != this.idEmpleadoIngresa) {
          this.nota = 'la solicitud';
          this.user = 'para ' + this.solInfo.fullname;
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

  // METODO PARA CONTAR DÍAS LIBRES Y DÍAS LABORABLES

  ImprimirDiaLibre(form, ingreso) {
    if (form.solicitarForm === 'Dias') {
      var libre = this.ContarDiasLibres(form.fechaInicioForm, ingreso);
      var laboral = this.ContarDiasLaborables(form.fechaInicioForm, ingreso);
      this.PermisoForm.patchValue({
        diaLibreForm: libre,
        diaLaboralForm: laboral,
      });
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
      //this.ValidarConfiguracionHoras(tiempoTotal);
    }
    else {
      this.toastr.info('Debe ingresar hora desde y hora hasta, para realizar el cálculo.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }








  CambiarValoresDiasHoras(form, datos) {
    if (form.solicitarForm === 'Dias') {
      datos.hora_numero = '00:00';
    }
    else if (form.solicitarForm === 'Horas') {
      datos.dia = 0;
    }
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
        this.LimpiarInformacion();
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
      this.LimpiarInformacion();
    }
  }

  RevisarIngresoHoras() {
    const resta = this.dIngreso.diff(this.dSalida, 'days');
    if (resta != 0) {
      this.toastr.error('Recuerde su permiso es por horas, y debe ingresar el mismo día en el que sale.',
        'Día de ingreso incorrecto', {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
  }

  MensajeIngresoHoras(hora_empleado) {
    if (this.configuracion_permiso === 'Dias') {
      this.toastr.info('Usted puede solicitar hasta: ' + String(this.Tdias) +
        ' dias de permiso. Si solicita horas recuerde que deben ser menor a ' + hora_empleado + ' horas.',
        'De acuerdo con la configuración de este tipo de permiso', {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
    else if (this.configuracion_permiso === 'Horas') {
      this.toastr.info('Las horas de permiso que puede solicitar deben ser menores o iguales a: ' + String(this.Thoras) + ' horas',
        'De acuerdo con la configuración de este tipo de permiso', {
        timeOut: 6000,
      });
      this.LimpiarInformacion();
    }
  }



  ValidarConfiguracionHoras(form, hora_empleado) {
    var datoHora = parseInt(hora_empleado.split(":"));
    if (this.configuracion_permiso === 'Dias') {
      if (parseInt(form.horasForm.split(":")) < datoHora) {
        this.RevisarIngresoHoras();
      }
      else {
        this.MensajeIngresoHoras(hora_empleado);
      }
    }
    else if (this.configuracion_permiso === 'Horas') {
      if (form.horasForm <= this.Thoras) {
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
      this.LimpiarInformacion();
    }
    else {
      this.ImprimirDiaLibre(form, this.dIngreso);
    }
  }

  ValidarConfiguracionDiasHoras(form, hora_empleado) {
    var datoHora = hora_empleado.split(":");
    if (this.configuracion_permiso === 'Dias') {
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
        this.LimpiarInformacion();
      }

    }
    else if (this.configuracion_permiso === 'Horas') {
      this.toastr.info
        ('No puede solicitar días de permiso. Las horas de permiso que puede solicitar deben ser menores o iguales a: '
          + String(this.Thoras) + ' horas. Tenga en cuenta que solicita días y adicional horas',
          'Este tipo de permiso esta configurado por horas.', {
          timeOut: 6000,
        })
      this.LimpiarInformacion();

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


  /** ************************************************************************************** **
   ** **                     INFORMACION DE TIPOS DE PERMISOS                             ** ** 
   ** ************************************************************************************** **/

  // BUSQUEDA DE TIPOS DE PERMISOS DE ACUERDO AL ROL DEL USUARIO
  ObtenerTiposPermiso() {
    this.tipoPermisos = [];
    let rol = this.loginServise.getRol();
    if (rol >= 2) {
      this.tipoPermiso.ListarTipoPermisoRol(1).subscribe(res => {
        this.tipoPermisos = res;
      });
    } else {
      this.tipoPermiso.BuscarTipoPermiso().subscribe(datos => {
        this.tipoPermisos = datos;
        console.log('ver tipo permisos 1...', this.tipoPermisos)
      });
    }
  }






  /** ********************************************************************************** **
   ** **                    TRATAMIENTO DE DATOS DE REGISTRO DE PERMISO               ** ** 
   ** ********************************************************************************** **/

  // GUARDAR DATOS DE PERMISO
  InsertarPermiso(form: any) {
    let datosPermiso = {
      id_empl_contrato: this.solicita_permiso.idContrato,
      id_peri_vacacion: this.solicita_permiso.idPerVacacion,
      depa_user_loggin: this.solInfo.id_dep,
      id_tipo_permiso: form.idPermisoForm,
      id_empl_cargo: this.solicita_permiso.idCargo,
      fec_creacion: this.FechaActual,
      hora_ingreso: form.horasIngresoForm,
      descripcion: form.descripcionForm,
      hora_numero: form.horasForm,
      num_permiso: this.num,
      hora_salida: form.horaSalidaForm,
      legalizado: this.legalizado,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      dia_libre: form.diaLibreForm,
      codigo: this.empleado[0].codigo,
      estado: 1,
      dia: parseInt(form.diasForm),
    }
    console.log(datosPermiso);
    this.CambiarValoresDiasHoras(form, datosPermiso);
    console.log(datosPermiso);
    this.CambiarValorDiaLibre(datosPermiso, form);
  }

  // REGISTRO DE PERMISO
  Informacion(datos: any, form: any) {
    this.restP.IngresarEmpleadoPermisos(datos).subscribe(permiso => {
      this.toastr.success('Operación Exitosa.', 'Permiso registrado.', {
        timeOut: 6000,
      });
      permiso.EmpleadosSendNotiEmail.push(this.solInfo);
      this.ImprimirNumeroPermiso();
      this.SubirRespaldo(permiso, form);
      this.EnviarCorreoPermiso(permiso);
      this.IngresarAutorizacion(permiso);
      this.EnviarNotificacion(permiso);
      this.CerrarVentanaPermiso();
    });
  }

  // VALIDACIONES DE DATOS DE SOLICITUD
  GuardarDatos(datos: any, form: any) {
    if (this.datosPermiso.documento === true) {
      if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.Informacion(datos, form);
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido',
            'Tamaño de archivos permitido máximo 2MB', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.toastr.info('El permiso seleccionado requiere de un certificado.',
          'Es indispensable que suba un documento de respaldo.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.restP.IngresarEmpleadoPermisos(datos).subscribe(permiso => {
        this.toastr.success('Operación Exitosa', 'Permiso registrado', {
          timeOut: 6000,
        });
        permiso.EmpleadosSendNotiEmail.push(this.solInfo);
        this.ImprimirNumeroPermiso();
        this.EnviarCorreoPermiso(permiso);
        this.IngresarAutorizacion(permiso);
        this.EnviarNotificacion(permiso);
        this.CerrarVentanaPermiso();
      });
    }
  }

  /** ********************************************************************************** **
   ** **                       SUBIR ARCHIVO DE SOLICITUD DE PERMISO                  ** **
   ** ********************************************************************************** **/

  // SELECCIONAR ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.PermisoForm.patchValue({ nombreCertificadoForm: name });
      this.HabilitarBtn = true;
    }
  }

  // CARGAR DOCUMENTO
  SubirRespaldo(permiso: any, form: any) {
    var id = permiso.id;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restP.SubirArchivoRespaldo(formData, id, form.nombreCertificadoForm).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // LIMPIAR EL NOMBRE DEL ARCHIVO
  LimpiarNombreArchivo() {
    this.PermisoForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  // METODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }


  /** ***************************************************************************************** **
   ** **                   INGRESO DE REGISTRO DE AUTORIZACION DE PERMISO                    ** **
   ** ***************************************************************************************** **/

  IngresarAutorizacion(permiso: any) {
    // ARREGLO DE DATOS PARA INGRESAR UNA AUTORIZACIÓN
    let newAutorizaciones = {
      orden: 1, // ORDEN DE LA AUTORIZACIÓN 
      estado: 1, // ESTADO PENDIENTE
      id_departamento: parseInt(localStorage.getItem('departamento')),
      id_permiso: permiso.id,
      id_vacacion: null,
      id_hora_extra: null,
      id_documento: '',
      id_plan_hora_extra: null,
    }
    this.restAutoriza.postAutorizacionesRest(newAutorizaciones).subscribe(res => {
    })
  }


  /** *************************************************************************************** ** 
   ** **                   METODOS ENVIO DE NOTIFICACIONES DE PERMISOS                     ** ** 
   ** *************************************************************************************** **/

  EnviarCorreoPermiso(permiso: any) {

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
          tipo_solicitud: 'Permiso solicitado por',
          id_empl_contrato: permiso.id_empl_contrato,
          horas_permiso: permiso.hora_numero,
          tipo_permiso: tipo_permiso,
          dias_permiso: permiso.dia,
          observacion: permiso.descripcion,
          solicitud: solicitud,
          desde: desde,
          hasta: hasta,
          h_inicio: this.validar.FormatearHora(permiso.hora_salida, this.formato_hora),
          h_fin: this.validar.FormatearHora(permiso.hora_ingreso, this.formato_hora),
          estado_p: estado_p,
          proceso: 'creado',
          id_dep: e.id_dep,
          id_suc: e.id_suc,
          correo: correo_usuarios,
          asunto: 'SOLICITUD DE PERMISO',
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
      id_receives_empl: '',
      id_receives_depa: '',
      id_vacaciones: null,
      id_hora_extra: null,
      id_send_empl: this.idEmpleadoIngresa,
      id_permiso: permiso.id,
      tipo: 1,
      estado: 'Pendiente',
      mensaje: 'Ha realizado ' + this.nota + ' de permiso ' + this.user + ' desde ' +
        desde + ' ' + h_inicio + ' hasta ' +
        hasta + ' ' + h_fin,
    }

    //Listado para eliminar el usuario duplicado
    var allNotificaciones = [];
    //Ciclo por cada elemento del catalogo
    permiso.EmpleadosSendNotiEmail.forEach(function (elemento, indice, array) {
      // Discriminación de elementos iguales
      if (allNotificaciones.find(p => p.fullname == elemento.fullname) == undefined) {
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

  /** ********************************************************************************* **
   ** **                    LIMPIAR CAMPOS DEL FORMULARIO                            ** **             
   ** ********************************************************************************* **/

  // LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.PermisoForm.reset();
  }

  // LIMPIAR CAMPOS DE FECHAS y HORAS
  LimpiarInformacion() {
    this.PermisoForm.patchValue({
      horasIngresoForm: '',
      fechaFinalForm: '',
      diaLaboralForm: '',
      horaSalidaForm: '',
      diaLibreForm: '',
      horasForm: '',
      diasForm: '',
    });
  }

  // METODO PARA LIMPIAR DATOS DE ESPECIFICOS DE FORMULARIO
  LimpiarFormulario() {
    this.PermisoForm.patchValue({
      horasIngresoForm: '',
      fechaInicioForm: '',
      fechaFinalForm: '',
      diaLaboralForm: '',
      horaSalidaForm: '',
      diaLibreForm: '',
      horasForm: '',
      diasForm: '',
    });
  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentanaPermiso() {
    this.LimpiarCampos();
    this.componente.formulario_permiso = false;
    this.componente.solicitudes_permiso = true;
  }

  // VALIDACIONES INGRESAR SOLO NUMEROS
  IngresarSoloNumeros(evt: any) {
    this.horasF.setValue('');
    return this.validar.IngresarSoloNumeros(evt);
  }
}
