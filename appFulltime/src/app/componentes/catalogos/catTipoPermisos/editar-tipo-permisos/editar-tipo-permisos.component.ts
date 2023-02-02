import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  selector: 'app-editar-tipo-permisos',
  templateUrl: './editar-tipo-permisos.component.html',
  styleUrls: ['./editar-tipo-permisos.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class EditarTipoPermisosComponent implements OnInit {

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
  seleccionarPermiso: string = this.permisos[this.permisos.length - 1].valor;
  selectDiasHoras: string = this.diasHoras[0].valor;
  selectAccess: number = this.solicitudes[0].valor;
  selectTipoDescuento: string = this.descuentos[0].value;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  estiloJustifica: any;
  HabilitarJustifica: boolean = true;

  constructor(
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarTipoPermisosComponent>,
    @Inject(MAT_DIALOG_DATA) public tipoPermiso: any
  ) { }

  ngOnInit(): void {
    console.log(this.tipoPermiso);
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
      tipoDescuentoForm: ['', Validators.required],
      legalizarForm: ['', Validators.required],
      fecValidarForm: ['', Validators.required],
      geneJustificacionForm: ['', Validators.required],
      numDiaJustificaForm: [''],
      fechaForm: [''],
      documentoForm: ['']
    });
    this.SetDatos();
  }

  selec1: boolean = false;
  selec2: boolean = false;
  SetDatos() {
    let i = 0;
    this.permisos.forEach(obj => {
      if (this.tipoPermiso.descripcion === obj.valor) {
        console.log(obj.valor);
        this.seleccionarPermiso = this.permisos[i].valor;
      }
      i++;
    })
    this.ActivarDesactivarNombreSet(this.seleccionarPermiso);
    this.ActivarDiasHorasSet();

    if (this.tipoPermiso.acce_empleado === 2) {
      this.selectAccess = this.solicitudes[1].valor;
    }

    this.primeroFormGroup.patchValue({
      descripcionForm: this.tipoPermiso.descripcion,
      nombreForm: this.tipoPermiso.descripcion,
      numDiaIngresoForm: this.tipoPermiso.num_dia_ingreso,
      numDiaMaximoForm: this.tipoPermiso.num_dia_maximo,
      numHoraMaximoForm: this.tipoPermiso.num_hora_maximo,
      almuIncluirForm: this.tipoPermiso.almu_incluir,
    });
    this.segundoFormGroup.patchValue({
      vacaAfectaForm: this.tipoPermiso.vaca_afecta,
      anioAcumulaForm: this.tipoPermiso.anio_acumula,
      tipoDescuentoForm: this.tipoPermiso.tipo_descuento,
      legalizarForm: this.tipoPermiso.legalizar,
      fecValidarForm: this.tipoPermiso.fec_validar,
      geneJustificacionForm: this.tipoPermiso.gene_justificacion,
      numDiaJustificaForm: this.tipoPermiso.num_dia_justifica,
      documentoForm: this.tipoPermiso.documento
    });

    let j = 0;
    this.descuentos.forEach(obj => {
      console.log(this.tipoPermiso.tipo_descuento);
      console.log(obj);
      if (this.tipoPermiso.tipo_descuento === obj.value) {
        this.selectTipoDescuento = this.descuentos[j].value;
      }
      j++;
    });

    this.ActivarJustificacionSet(this.tipoPermiso.gene_justificacion);

    if (this.tipoPermiso.fecha != '' && this.tipoPermiso.fecha != null) {
      this.calendario = true;
      this.selec1 = true;
      this.selec2 = false;
      this.segundoFormGroup.patchValue({
        fechaForm: moment(this.tipoPermiso.fecha, "YYYY/MM/DD").format("YYYY-MM-DD")
      });
    } else {
      this.calendario = false;
      this.selec2 = true;
      this.selec1 = false;
    }
  }

  HabilitarDescrip: boolean = false;
  estilo: any;
  ActivarDesactivarNombre(form1) {
    var nombreTipoPermiso = form1.descripcionForm;
    if (nombreTipoPermiso === 'OTRO') {
      this.primeroFormGroup.patchValue({ nombreForm: this.tipoPermiso.descripcion });
      this.estilo = { 'visibility': 'visible' }; this.HabilitarDescrip = false;
    }
    else {
      this.primeroFormGroup.patchValue({ nombreForm: '' });
      this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
    }
  }

  ActivarDesactivarNombreSet(nombreTipoPermiso) {
    if (nombreTipoPermiso === 'OTRO') {
      this.estilo = { 'visibility': 'visible' }
      this.HabilitarDescrip = false;
    } else {
      this.estilo = { 'visibility': 'hidden' }
      this.HabilitarDescrip = true;
    }
  }

  ActivarDiasHoras(form) {
    if (form.diasHorasForm === 'Días') {
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: this.tipoPermiso.num_dia_maximo });
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: '00:00' });
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloHoras = { 'visibility': 'hidden' }; this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días máximos de permiso', '', {
        timeOut: 6000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.tipoPermiso.num_hora_maximo });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0 });
      this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de horas y minutos máximos de permiso', '', {
        timeOut: 6000,
      });
    }
    else if (form.diasHorasForm === 'Días y Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.tipoPermiso.num_hora_maximo, numDiaMaximoForm: this.tipoPermiso.num_dia_maximo });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0, numHoraMaximoForm: '00:00' });
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de días , horas y minutos máximos de permiso', '', {
        timeOut: 6000,
      });
    }
  }

  HabilitarDias: boolean = false;
  HabilitarHoras: boolean = false;
  estiloDias: any;
  estiloHoras: any;
  ActivarDiasHorasSet() {
    if (this.tipoPermiso.num_dia_maximo === 0) {
      this.selectDiasHoras = this.diasHoras[1].valor;
      this.estiloDias = { 'visibility': 'hidden' }; this.HabilitarDias = true;
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
    } else if (this.tipoPermiso.num_hora_maximo === '00:00:00') {
      this.selectDiasHoras = this.diasHoras[0].valor;
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloHoras = { 'visibility': 'hidden' }; this.HabilitarHoras = true;
    } else {
      this.selectDiasHoras = this.diasHoras[2].valor;
      this.estiloDias = { 'visibility': 'visible' }; this.HabilitarDias = false;
      this.estiloHoras = { 'visibility': 'visible' }; this.HabilitarHoras = false;
    }
  }


  estiloJustificacion: any;
  ActivarJustificacionSet(generarJustificacion: boolean) {
    if (generarJustificacion === true) {
      this.estiloJustificacion = { 'visibility': 'visible' }; this.HabilitarJustifica = false;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: this.tipoPermiso.num_dia_justifica
      });
    } else if (generarJustificacion === false) {
      this.estiloJustificacion = { 'visibility': 'hidden' }; this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: 0
      });
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


  ModificarTipoPermiso(form1, form2) {
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
    console.log(dataTipoPermiso);

    if (form1.descripcionForm === 'OTRO') {
      if (form1.nombreForm === '') {
        this.toastr.info('Ingresar nombre del nuevo Tipo de Permiso', 'Información General', {
          timeOut: 6000,
        });
      } else {
        dataTipoPermiso.descripcion = form1.nombreForm;
        this.VerificarIngresoFecha(form2, dataTipoPermiso);
      }
    } else {
      this.VerificarIngresoFecha(form2, dataTipoPermiso);
    }
  }

  Actualizar(id, datos) {
    this.rest.putTipoPermisoRest(id, datos).subscribe(res => {
      console.log(res);
      this.toastr.success('Operación Exitosa', 'Tipo Permiso guardado', {
        timeOut: 6000,
      });
      this.dialogRef.close();
    }, error => {
    });
  }

  CerrarVentanaEditarTipoPermiso() {
    this.dialogRef.close();
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

  VerificarIngresoFecha(form2, datos) {
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
        this.Actualizar(this.tipoPermiso.id, datos);
      }
    }
    else {
      console.log('entra2')
      if (form2.fechaForm === '') {
        datos.fecha = null;
      }
      this.Actualizar(this.tipoPermiso.id, datos);
    }

  }
}
