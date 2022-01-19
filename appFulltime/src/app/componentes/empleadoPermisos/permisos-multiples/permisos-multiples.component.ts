import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

// Invocación a los servicios
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';

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
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
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

  // Usado para imprimir datos
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

  // Total de días según el tipo de permiso
  Tdias = 0;
  // Total de horas según el tipo de permiso
  Thoras;

  // Número del permiso
  num: number;
  tipoPermisoSelec: string;
  // Variable para guardar fecha actual tomada del sistema
  FechaActual: any;
  horasTrabajo: any = [];

  // Variables para ocultar o visibilizar ingreso de datos días, horas, días libres
  HabilitarDias: boolean = true;
  estiloDias: any;
  HabilitarHoras: boolean = true;
  estiloHoras: any;
  HabilitarDiasL: boolean = true;
  estiloDiasL: any;

  // Control de campos y validaciones del formulario
  idPermisoF = new FormControl('', [Validators.required]);
  fecCreacionF = new FormControl('', [Validators.required]);
  descripcionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  solicitarF = new FormControl('', [Validators.required]);
  diasF = new FormControl('');
  horasF = new FormControl('');
  fechaInicioF = new FormControl('', [Validators.required]);
  fechaFinalF = new FormControl('', [Validators.required]);
  diaLibreF = new FormControl('');
  estadoF = new FormControl('');
  legalizarF = new FormControl('', [Validators.required]);
  nombreCertificadoF = new FormControl('');
  archivoForm = new FormControl('');
  horaSalidaF = new FormControl('', Validators.required);
  horaIngresoF = new FormControl('', Validators.required);

  // Asignación de validaciones a inputs del formulario
  public PermisoForm = new FormGroup({
    idPermisoForm: this.idPermisoF,
    fecCreacionForm: this.fecCreacionF,
    descripcionForm: this.descripcionF,
    solicitarForm: this.solicitarF,
    diasForm: this.diasF,
    horasForm: this.horasF,
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    diaLibreForm: this.diaLibreF,
    estadoForm: this.estadoF,
    legalizarForm: this.legalizarF,
    nombreCertificadoForm: this.nombreCertificadoF,
    horaSalidaForm: this.horaSalidaF,
    horasIngresoForm: this.horaIngresoF
  });

  constructor(
    private restTipoP: TipoPermisosService,
    private restP: PermisosService,
    private restH: EmpleadoHorariosService,
    public restE: EmpleadoService,
    private toastr: ToastrService,
    private loginServise: LoginService,
    private realTime: RealTimeService,
    public restPerV: PeriodoVacacionesService,
    public dialogRef: MatDialogRef<PermisosMultiplesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    // Asignación de estado Pendiente en la solicitud de permiso
    this.PermisoForm.patchValue({
      fecCreacionForm: this.FechaActual,
      estadoForm: 1
    });
    this.ObtenerTiposPermiso();
    //this.ImprimirNumeroPermiso();
    this.ObtenerEmpleado(this.data.idEmpleado);
  }

  empleado: any = [];
  // Método para ver la información del empleado 
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
    this.restP.BuscarNumPermiso(this.data.idEmpleado).subscribe(datos => {
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
    this.readonly = false;
    this.fechas_horario = [];
    if (form.fechaInicioForm != '' && form.idPermisoForm != '') {
      this.horasTrabajo = [];
      let datosFechas = {
        id_emple: this.data.idEmpleado,
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
    this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(datos => {
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
  contador: number = 0;
  InsertarPermiso(form) {
    this.contador = 0;
    this.data.datos.map(obj => {
      this.restPerV.BuscarIDPerVacaciones(parseInt(obj.id)).subscribe(res => {
        this.restP.BuscarNumPermiso(obj.id).subscribe(datosn => {
          this.datoNumPermiso = datosn;
          if (this.datoNumPermiso[0].max === null) {
            this.num = 1;
          }
          else {
            this.num = this.datoNumPermiso[0].max + 1;
          }

          console.log('numro', this.num)

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
            id_empl_contrato: obj.id_contrato,
            id_peri_vacacion: res[0].id,
            hora_numero: form.horasForm,
            num_permiso: this.num,
            docu_nombre: form.nombreCertificadoForm,
            depa_user_loggin: parseInt(localStorage.getItem('departamento')),
            id_empl_cargo: obj.id_cargo,
            hora_salida: form.horaSalidaForm,
            hora_ingreso: form.horasIngresoForm,
            codigo: obj.codigo
          }
          console.log(datosPermiso);
          this.CambiarValoresDiasHoras(form, datosPermiso);
          console.log(datosPermiso);
          this.CambiarValorDiaLibre(datosPermiso, form);

          this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(data => {
            if (data[0].documento === true) {
              if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
                if (this.archivoSubido[0].size <= 2e+6) {
                  this.restP.IngresarEmpleadoPermisos(datosPermiso).subscribe(response => {
                    this.contador = this.contador + 1;
                    if (this.contador === this.data.datos.length) {
                      this.dialogRef.close();
                      window.location.reload();
                      this.toastr.success('Operación Exitosa', 'Se registra un total de  ' + this.data.datos.length + ' Registros de horarios.', {
                        timeOut: 6000,
                      })
                    }
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

              }
              else {
                this.toastr.info('El permiso seleccionado requiere de un certificado.', 'Es indispensable que suba un documento de respaldo.', {
                  timeOut: 6000,
                });
              }
            }
            else {
              this.restP.IngresarEmpleadoPermisos(datosPermiso).subscribe(response => {
                this.contador = this.contador + 1;
                if (this.contador === this.data.datos.length) {
                  this.dialogRef.close();
                  window.location.reload();
                  this.toastr.success('Operación Exitosa', 'Se registra un total de  ' + this.data.datos.length + ' Registros de horarios.', {
                    timeOut: 6000,
                  })
                }
              }, err => {
                const { access, message } = err.error.message;
                if (access === false) {
                  this.toastr.error(message)
                  this.dialogRef.close();
                }
              });
            }

          });

        })
      })

    });

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
    if (parseInt(form.diasForm) <= this.Tdias) {
      console.log('revisar', this.dIngreso, this.dSalida)
      const resta = this.dIngreso.diff(this.dSalida, 'days');
      console.log('datos', resta, ' ');
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


  idPermisoRes: any;
  NotifiRes: any;
  arrayNivelesDepa: any = [];
  GuardarDatos(datos, form) {
    this.restTipoP.getOneTipoPermisoRest(form.idPermisoForm).subscribe(data => {
      if (data[0].documento === true) {
        if (form.nombreCertificadoForm != '' && form.nombreCertificadoForm != null) {
          if (this.archivoSubido[0].size <= 2e+6) {
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
                    id_send_empl: this.data.idEmpleado,
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
                });
              });
            });
          }
          else {
            this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
              timeOut: 6000,
            });
          }
        } else {
          this.toastr.info('El permiso seleccionado requiere de un certificado.', 'Es indispensable que suba un documento de respaldo.', {
            timeOut: 6000,
          });
        }
      } else {
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
                id_send_empl: this.data.idEmpleado,
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

}
