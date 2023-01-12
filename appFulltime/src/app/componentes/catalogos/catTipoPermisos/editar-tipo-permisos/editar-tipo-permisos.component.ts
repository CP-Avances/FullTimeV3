import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

interface TipoDescuentos {
  value: string;
  viewValue: string;
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
})

export class EditarTipoPermisosComponent implements OnInit {

  // TIPOS DE DESCUENTO
  descuentos: TipoDescuentos[] = [
    { value: '1', viewValue: 'Vacaciones' },
    { value: '2', viewValue: 'Ninguno' },
  ];

  // ACCESO EMPLEADOS
  solicitudes: opcionesSolicitud[] = [
    { valor: 1, nombre: 'Si' },
    { valor: 2, nombre: 'No' },
  ];

  // TIPO DE SOLICITUD
  diasHoras: opcionesDiasHoras[] = [
    { valor: 'Dias', nombre: 'Dias' },
    { valor: 'Horas', nombre: 'Horas' },
    { valor: 'Dias y Horas', nombre: 'Dias y Horas' },
  ];

  validarGuardar: boolean = false;

  // DEFINIR VALORES DE TIPO DE PERMISO
  selectDiasHoras: string = this.diasHoras[0].valor;
  selectAccess: number = this.solicitudes[0].valor;
  selectTipoDescuento: string = this.descuentos[0].value;

  // FORMULARIO
  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;

  // VARIABLES DE CONTROL
  HabilitarJustifica: boolean = true;
  idPermiso: string;

  constructor(
    private rest: TipoPermisosService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    public router: Router,
    public validar: ValidacionesService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idPermiso = aux[2];
  }

  ngOnInit(): void {
    this.ValidarFormulario();
    this.CargarDatosPermiso();
    this.ObtenerTipoPermiso();
  }

  // METODO PARA VALIDAR FORMULARIOS
  ValidarFormulario() {
    this.primeroFormGroup = this._formBuilder.group({
      diasHorasForm: ['', Validators.required],
      descripcionForm: ['', Validators.required],
      acceEmpleadoForm: ['', Validators.required],
      numDiaMaximoForm: [''],
      numHoraMaximoForm: [''],
      numDiaIngresoForm: ['', Validators.required],
      tipoDescuentoForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      fechaForm: [''],
      documentoForm: [''],
      legalizarForm: ['', Validators.required],
      fecValidarForm: ['', Validators.required],
      almuIncluirForm: ['', Validators.required],
      numDiaJustificaForm: [''],
      geneJustificacionForm: ['', Validators.required],
    });
  }

  // METODO DE BUSQUEDA DE TIPOS DE PERMISOS
  permisos: any = [];
  ObtenerTipoPermiso() {
    this.permisos = [];
    this.rest.BuscarTipoPermiso().subscribe(datos => {
      this.permisos = datos;
    });
  }

  // METODO PARA LISTAR DATOS DE PERMISO
  tipoPermiso: any = [];
  CargarDatosPermiso() {
    this.tipoPermiso = [];
    this.rest.BuscarUnTipoPermiso(parseInt(this.idPermiso)).subscribe(datos => {
      this.tipoPermiso = datos[0];
      this.ImprimirDatos();
    })
  }


  // METODO PARA IMPRIMIR DATOS EN FORMULARIO
  selec1: boolean = false;
  selec2: boolean = false;
  ImprimirDatos() {
    // TIPO PERMISO HORAS - DIAS
    this.ActivarDiasHorasSet();
    if (this.tipoPermiso.acce_empleado === 2) {
      this.selectAccess = this.solicitudes[1].valor;
    }
    // PRIMER FORMULARIO
    this.primeroFormGroup.patchValue({
      descripcionForm: this.tipoPermiso.descripcion,
      numDiaIngresoForm: this.tipoPermiso.num_dia_ingreso,
      numDiaMaximoForm: this.tipoPermiso.num_dia_maximo,
      numHoraMaximoForm: this.tipoPermiso.num_hora_maximo,
      tipoDescuentoForm: this.tipoPermiso.tipo_descuento,
    });
    // SEGUNDO FORMULARIO
    this.segundoFormGroup.patchValue({
      almuIncluirForm: this.tipoPermiso.almu_incluir,
      legalizarForm: this.tipoPermiso.legalizar,
      fecValidarForm: this.tipoPermiso.fec_validar,
      geneJustificacionForm: this.tipoPermiso.gene_justificacion,
      numDiaJustificaForm: this.tipoPermiso.num_dia_justifica,
      documentoForm: this.tipoPermiso.documento
    });
    // DESCUENTO DE PERMISO
    let j = 0;
    this.descuentos.forEach(obj => {
      if (this.tipoPermiso.tipo_descuento === obj.value) {
        this.selectTipoDescuento = this.descuentos[j].value;
      }
      j++;
    });
    // JUSTIFICACION D EPERMISO
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

  // METODO PARA CONTROLAR DIAS - HORAS
  ActivarDiasHoras(form: any) {
    if (form.diasHorasForm === 'Dias') {
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: this.tipoPermiso.num_dia_maximo });
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: '00:00' });
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
      this.toastr.info('Ingresar número de días máximos de permiso.', '', {
        timeOut: 4000,
      });
    }
    else if (form.diasHorasForm === 'Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.tipoPermiso.num_hora_maximo });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0 });
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de horas y minutos máximos de permiso.', '', {
        timeOut: 4000,
      });
    }
    else if (form.diasHorasForm === 'Dias y Horas') {
      this.primeroFormGroup.patchValue({ numHoraMaximoForm: this.tipoPermiso.num_hora_maximo, numDiaMaximoForm: this.tipoPermiso.num_dia_maximo });
      this.primeroFormGroup.patchValue({ numDiaMaximoForm: 0, numHoraMaximoForm: '00:00' });
      this.HabilitarDias = false;
      this.HabilitarHoras = false;
      this.toastr.info('Ingresar número de días, horas y minutos máximos de permiso.', '', {
        timeOut: 6000,
      });
    }
  }

  // METODO PARA IMPRIMIR DATOS DE HORAS - DIAS DE PERMISO
  HabilitarDias: boolean = false;
  HabilitarHoras: boolean = false;
  ActivarDiasHorasSet() {
    if (this.tipoPermiso.num_dia_maximo === 0) {
      this.selectDiasHoras = this.diasHoras[1].valor;
      this.HabilitarDias = true;
      this.HabilitarHoras = false;
    } else if (this.tipoPermiso.num_hora_maximo === '00:00:00') {
      this.selectDiasHoras = this.diasHoras[0].valor;
      this.HabilitarDias = false;
      this.HabilitarHoras = true;
    } else {
      this.selectDiasHoras = this.diasHoras[2].valor;
      this.HabilitarDias = false;
      this.HabilitarHoras = false;
    }
  }

  // METODO PARA IMPRIMIR DATOS DE JUSTIFICACION
  ActivarJustificacionSet(generarJustificacion: boolean) {
    if (generarJustificacion === true) {
      this.HabilitarJustifica = false;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: this.tipoPermiso.num_dia_justifica
      });
    } else if (generarJustificacion === false) {
      this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: 0
      });
    }
  }

  // METODO PARA CONTROLAR INGRESO DE DIAS DE JUSTIFICACION
  ActivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('si')).value = 'true') {
      this.HabilitarJustifica = false;
      this.toastr.info('Ingresar número de días para presentar justificación', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA OCULTAR INGRESO DE DIAS DE JUSTIFICACION
  DesactivarJustificacion() {
    if ((<HTMLInputElement>document.getElementById('no')).value = 'false') {
      this.HabilitarJustifica = true;
      this.segundoFormGroup.patchValue({
        numDiaJustificaForm: '',
      })
    }
  }

  // METODO PARA ACTIVAR INGRESO DE FECHA
  calendario: boolean = false;
  VerCalendario() {
    this.calendario = true;
  }

  // METODO PARA OCULTAR INGRESO DE FECHA
  OcultarCalendario() {
    this.calendario = false;
    this.segundoFormGroup.patchValue({
      fechaForm: ''
    })
  }

  // METODO PARA VERIFICAR INGRESO DE FECHA
  VerificarFecha(event) {
    var f = moment();
    var FechaActual = f.format('YYYY-MM-DD');
    var leer_fecha = event.value._i;
    var fecha = new Date(String(moment(leer_fecha)));
    var ingreso = String(moment(fecha, "YYYY/MM/DD").format("YYYY-MM-DD"));
    if (Date.parse(ingreso) >= Date.parse(FechaActual)) {
    }
    else {
      this.toastr.info('La fecha ingresada no puede ser anterior a la fecha actual.', 'Verificar Fecha.', {
        timeOut: 6000,
      });
      this.segundoFormGroup.patchValue({
        fechaForm: ''
      })
    }
  }

  // METODO PARA VERIFICAR QUE NO ESTE VACIO EL CAMPO FECHA
  VerificarIngresoFecha(form2: any, datos: any) {
    if (form2.fecValidarForm === 'true') {
      if (form2.fechaForm === '') {
        this.toastr.info('Ingresar fecha en la que no podrá solicitar permisos.', 'Verificar Fecha.', {
          timeOut: 6000,
        });
      }
      else {
        this.Actualizar(this.tipoPermiso.id, datos);
      }
    }
    else {
      if (form2.fechaForm === '') {
        datos.fecha = null;
      }
      this.Actualizar(this.tipoPermiso.id, datos);
    }
  }

  // METODO PARA CAPTURAR DATOS DE FORMULARIO
  contador: number = 0;
  ModificarTipoPermiso(form1: any, form2: any) {
    this.contador = 0;
    let permiso = {
      // FORMULARIO UNO
      descripcion: form1.descripcionForm,
      acce_empleado: form1.acceEmpleadoForm,
      num_dia_maximo: form1.numDiaMaximoForm,
      tipo_descuento: form1.tipoDescuentoForm,
      num_dia_ingreso: form1.numDiaIngresoForm,
      num_hora_maximo: form1.numHoraMaximoForm,

      // FORMULARIO DOS
      fecha: form2.fechaForm,
      documento: form2.documentoForm,
      legalizar: form2.legalizarForm,
      fec_validar: form2.fecValidarForm,
      almu_incluir: form2.almuIncluirForm,
      num_dia_justifica: form2.numDiaJustificaForm,
      gene_justificacion: form2.geneJustificacionForm,
    }

    if (this.tipoPermiso.descripcion.toUpperCase() === permiso.descripcion.toUpperCase()) {
      this.VerificarIngresoFecha(form2, permiso);
    }
    else {
      this.permisos.forEach(obj => {
        if (obj.descripcion.toUpperCase() === permiso.descripcion.toUpperCase()) {
          this.contador = 1;
        }
      })
      if (this.contador === 0) {
        this.VerificarIngresoFecha(form2, permiso);
      }
      else {
        this.toastr.warning('Tipo de permiso ya se encuentra registrado.', 'Ups!!! algo salio mal.', {
          timeOut: 6000,
        });
      }
    }
  }

  // METODO PARA ACTUALIZAR REGISTRO
  Actualizar(id: number, datos: any) {
    this.rest.ActualizarTipoPermiso(id, datos).subscribe(res => {
      this.toastr.success('Operación exitosa.', 'Registro actualizado.', {
        timeOut: 6000,
      });
      this.router.navigate(['/vistaPermiso/', this.idPermiso]);
    });
  }

  IngresarSoloLetras(e: any) {
    return this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt: any) {
    return this.validar.IngresarSoloNumeros(evt);
  }

}
