import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';

interface TipoDescuentos {
  value: string;
  viewValue: string;
}

interface opcionesPermisos {
  valor: string;
  nombre: string
}

interface opcionesSolicitud {
  valor: number;
  nombre: string
}

interface opcionesDiasHoras {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-tipo-permisos',
  templateUrl: './tipo-permisos.component.html',
  styleUrls: ['./tipo-permisos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class TipoPermisosComponent implements OnInit {

  descuentos: TipoDescuentos[] = [
    { value: '1', viewValue: 'Vacaciones' },
    { value: '2', viewValue: 'Ninguno' },
  ];

  solicitudes: opcionesSolicitud[] = [
    { valor: 1, nombre: 'Si' },
    { valor: 2, nombre: 'No' },
  ];

  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Días', nombre: 'Días' },
    { valor: 'Horas', nombre: 'Horas' },
    { valor: 'Días y Horas', nombre: 'Días y Horas' },
  ];

  validarGuardar: boolean = false;

  // Arreglo de opcionesPermisos existentes
  permisos: opcionesPermisos[] = [
    { valor: 'Seleccionar', nombre: 'Seleccionar' },
    { valor: 'Asuntos Personales', nombre: 'Asuntos Personales' },
    { valor: 'Calamidad Doméstica', nombre: 'Calamidad Doméstica' },
    { valor: 'Cita Médica', nombre: 'Cita Médica' },
    { valor: 'Enfermedad', nombre: 'Enfermedad' },
    { valor: 'Estudios', nombre: 'Estudios' },
    { valor: 'Maternidad', nombre: 'Maternidad' },
    { valor: 'Paternidad', nombre: 'Paternidad' },
    { valor: 'Sufragio', nombre: 'Sufragio' },
    { valor: 'OTRO', nombre: 'OTRO' },
  ];
  seleccionarPermiso: string = this.permisos[0].valor;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  constructor(
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
  ) { }

  HabilitarOtro: boolean = true;
  estiloOtro: any;
  HabilitarJustifica: boolean = true;
  estiloJustifica: any;
  HabilitarDias: boolean = true;
  estiloDias: any;
  HabilitarHoras: boolean = true;
  estiloHoras: any;

  ngOnInit(): void {
    this.primeroFormGroup = this._formBuilder.group({
      descripcionForm: ['', Validators.required],
      nombreForm: [''],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      numDiaIngresoForm: ['', Validators.required],
      acceEmpleadoForm: ['', Validators.required],
      almuIncluirForm: ['', Validators.required],
      diasHorasForm: ['', Validators.required]
    });
    this.segundoFormGroup = this._formBuilder.group({
      vacaAfectaForm: ['', Validators.required],
      anioAcumulaForm: ['', Validators.required],
      legalizarForm: ['', Validators.required],
      fecValidarForm: ['', Validators.required],
      tipoDescuentoForm: ['', Validators.required],
      geneJustificacionForm: ['', Validators.required],
      numDiaJustificaForm: [''],
      fechaForm: [''],
      documentoForm: ['']
    });
  }

  insertarTipoPermiso(form1, form2) {
    var nombrePermiso = form1.descripcionForm;
    var nuevoPermiso = form1.nombreForm;
    let dataTipoPermiso = {
      descripcion: form1.descripcionForm,
      tipo_descuento: form2.tipoDescuentoForm,
      num_dia_maximo: form1.numDiaMaximoForm,
      num_dia_ingreso: form1.numDiaIngresoForm,
      vaca_afecta: form2.vacaAfectaForm,
      anio_acumula: form2.anioAcumulaForm,
      gene_justificacion: form2.geneJustificacionForm,
      fec_validar: form2.fecValidarForm,
      acce_empleado: form1.acceEmpleadoForm,
      legalizar: form2.legalizarForm,
      almu_incluir: form1.almuIncluirForm,
      num_dia_justifica: form2.numDiaJustificaForm,
      num_hora_maximo: form1.numHoraMaximoForm,
      fecha: form2.fechaForm,
      documento: form2.documentoForm
    }
    if (nombrePermiso === 'OTRO') {
      if (nuevoPermiso === '') {
        this.toastr.info('Ingresar nombre del nuevo Tipo de Permiso', 'Información General', {
          timeOut: 6000,
        });
      }
      else {
        dataTipoPermiso.descripcion = nuevoPermiso;
        this.VerificarJustificacion(form1, dataTipoPermiso, form2);
      }
    }
    else if (nombrePermiso === 'Seleccionar') {
      this.toastr.info('Seleccionar o definir una descripción del nuevo tipo de permiso', 'Información General', {
        timeOut: 6000,
      });
    }
    else {
      this.VerificarJustificacion(form1, dataTipoPermiso, form2);
    }
  }

  IngresarDatos(datos) {
    this.validarGuardar = true;
    this.rest.postTipoPermisoRest(datos).subscribe(res => {
      console.log('permisos', res.message)
      if (res.message === 'error') {
        this.toastr.error('Revisarlo en la lista de Tipo de Permisos y actualizar los datos si desea realizar cambios en la configuración del permiso', 'Tipo de Permiso ya esta configurado', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación Exitosa', 'Tipo Permiso guardado', {
          timeOut: 6000,
        });
        window.location.reload();
      }
    }, error => { });
  }

  ActivarDesactivarNombre(form1) {
    var nombreTipoPermiso = form1.descripcionForm;
    if (nombreTipoPermiso === 'OTRO') {
      this.estiloOtro = { 'visibility': 'visible' }; this.HabilitarOtro = false;
      this.toastr.info('Ingresar nombre del nuevo Tipo de Permiso', 'Etiqueta Descripción activa', {
        timeOut: 6000,
      })
    }
    else if (nombreTipoPermiso === 'Seleccionar') {
      this.LimpiarCampoNombre();
      this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      });
    }
    else {
      this.LimpiarCampoNombre();
      this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
    }

  }

  ActivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('si')).value = 'true') {
      this.estiloJustifica = { 'visibility': 'visible' }; this.HabilitarJustifica = false;
      this.toastr.info('Ingresar número de días para presentar justificación', '', {
        timeOut: 6000,
      })
    }
  }

  DesactivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('no')).value = 'false') {
      this.estiloJustifica = { 'visibility': 'hidden' }; this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: '',
      })
    }
  }

  VerificarJustificacion(form1, datos, form2) {
    if (datos.num_dia_justifica === '' && datos.gene_justificacion === 'true') {
      this.toastr.info('Ingresar número de días para presentar justificación', '', {
        timeOut: 6000,
      })
    }
    else if (datos.num_dia_justifica != '' && datos.gene_justificacion === 'true') {
      this.VerificarIngresoFecha(form2, datos, form1);
    }
    else if (datos.num_dia_justifica === '' && datos.gene_justificacion === 'false') {
      datos.num_dia_justifica = 0;
      this.VerificarIngresoFecha(form2, datos, form1);
    }
  }

  ActivarDiasHoras(form) {
    if (form.diasHorasForm === 'Días') {
      this.primeroFormGroup.patchValue({
        numDiaMaximoForm: '',
      });
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloHoras = { 'visibility': 'hidden' }; this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días máximos de permiso', '', {
        timeOut: 6000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({
        numHoraMaximoForm: '',
      });
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
      this.toastr.info('Ingresar número de horas y minutos máximos de permiso', '', {
        timeOut: 6000,
      });
    }
    else {
      this.primeroFormGroup.patchValue({
        numHoraMaximoForm: '',
        numDiaMaximoForm: ''
      });
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.toastr.info('Ingresar número de días máximos y horas permitidas de permiso', '', {
        timeOut: 6000,
      });
    }
  }

  CambiarValoresDiasHoras(form, datos) {
    if (form.diasHorasForm === 'Días') {
      if (datos.num_dia_maximo === '') {
        this.toastr.info('Ingresar número de días máximos de permiso', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.num_hora_maximo = '00:00';
        this.IngresarDatos(datos);
      }
    }
    else if (form.diasHorasForm === 'Horas') {
      if (datos.num_hora_maximo === '') {
        this.toastr.info('Ingresar número de horas y minutos máximos de permiso', '', {
          timeOut: 6000,
        });
      }
      else {
        datos.num_dia_maximo = 0;
        this.IngresarDatos(datos);
      }
    }
    else if (form.diasHorasForm === 'Días y Horas') {
      if (datos.num_hora_maximo === '' || datos.num_dia_maximo === '') {
        this.toastr.info('Ingresar número de días, horas y minutos máximos de permiso', '', {
          timeOut: 6000,
        });
      }
      else {
        this.IngresarDatos(datos);
      }
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
      });
      return false;
    }
  }

  LimpiarCampoNombre() {
    this.primeroFormGroup.patchValue({
      nombreForm: '',
    });
  }

  calendario: boolean = false;
  verCalendario() {
    this.calendario = true;
  }

  ocultarCalendario() {
    this.calendario = false;
    this.segundoFormGroup.patchValue({
      fechaForm: ''
    })
  }

  VerificarFecha(event) {
    var f = moment();
    var FechaActual = f.format('YYYY-MM-DD');
    var leer_fecha = event.value._i;
    var fecha = new Date(String(moment(leer_fecha)));
    var ingreso = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));
    if (Date.parse(ingreso) >= Date.parse(FechaActual)) {
    }
    else {
      this.toastr.info('La fecha ingresada no puede ser anterior a la fecha actual', 'Verificar Fecha', {
        timeOut: 6000,
      });
      this.segundoFormGroup.patchValue({
        fechaForm: ''
      })
    }
  }

  VerificarIngresoFecha(form2, datos, form1) {
    console.log('entra0', form2.fecValidarForm, form2.fechaForm)
    if (form2.fecValidarForm === 'true') {
      console.log('entra1', form2.fecValidarForm, form2.fechaForm)
      if (form2.fechaForm === '') {
        console.log('entra2')
        this.toastr.info('Ingresar fecha en la que no podrá solicitar permisos.', 'Verificar Fecha', {
          timeOut: 6000,
        });
      }
      else {
        this.CambiarValoresDiasHoras(form1, datos);
      }
    }
    else {
      console.log('entra2')
      if (form2.fechaForm === '') {
        datos.fecha = null;
      }
      this.CambiarValoresDiasHoras(form1, datos);
    }

  }

}
