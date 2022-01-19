// IMPORTAR LIBRERIAS
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

// IMPORTAR SERVICIOS
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-registro-empresa',
  templateUrl: './registro-empresa.component.html',
  styleUrls: ['./registro-empresa.component.css']
})
export class RegistroEmpresaComponent implements OnInit {

  valor = '';

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  representanteF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  direccionF = new FormControl('', [Validators.required, Validators.minLength(6)]);
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  correoF = new FormControl('', [Validators.required, Validators.email]);
  establecimientoF = new FormControl('', Validators.required);
  telefonoF = new FormControl('', Validators.required);
  otroF = new FormControl('', Validators.minLength(3));
  otroE = new FormControl('', Validators.minLength(3));
  tipoF = new FormControl('', Validators.required);
  rucF = new FormControl('', Validators.required);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public RegistroEmpresaForm = new FormGroup({
    establecimientoForm: this.establecimientoF,
    representanteForm: this.representanteF,
    direccionForm: this.direccionF,
    telefonoForm: this.telefonoF,
    correoForm: this.correoF,
    nombreForm: this.nombreF,
    otroEForm: this.otroE,
    tipoForm: this.tipoF,
    otroForm: this.otroF,
    rucForm: this.rucF,
  });


  //VARIABLES PROGRESS SPINNER
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private rest: EmpresaService, // VARIABLE DE SERVICIOS DE DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE USADA PARA NOTIFICACIONES
    public validar: ValidacionesService, // VARIABLE USADA PARA REALIZAR VALIDACIONES DE LETRAS Y NÚMEROS
    public ventana: MatDialogRef<RegistroEmpresaComponent>, // VARIABLE PARA MOSTRAR VENTANAS
  ) { }

  // VARAIBLES PARA MOSTRAR U OCULTAR OPCIONES
  HabilitarRepre: boolean = true;
  estiloRepre: any;
  HabilitarOtroE: boolean = true;
  estiloOtroE: any;
  HabilitarOtro: boolean = true;
  estiloOtro: any;

  ngOnInit(): void {
  }

  ObtenerMensajeErrorNombreRequerido() {
    if (this.nombreF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorDireccionRequerido() {
    if (this.direccionF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorRucRequerido() {
    if (this.rucF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorTelefonoRequerido() {
    if (this.telefonoF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorCorreoRequerido() {
    if (this.correoF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorRepre() {
    if (this.representanteF.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.representanteF.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  LimpiarCampos() {
    this.RegistroEmpresaForm.reset();
  }

  InsertarEmpresa(form) {
    this.habilitarprogress = true;
    let datosEmpresa = {
      establecimiento: form.establecimientoForm,
      representante: form.representanteForm,
      correo_empresa: form.correoForm,
      direccion: form.direccionForm,
      tipo_empresa: form.tipoForm,
      telefono: form.telefonoForm,
      nombre: form.nombreForm,
      ruc: form.rucForm,
      color_p: '#6495ED',
      color_s: '#00FF00'
    };
    this.VerificarOtroTipo(form, datosEmpresa);
  }

  GuardarDatos(datos) {
    this.habilitarprogress = true;
    this.rest.IngresarEmpresas(datos).subscribe(response => {
      this.LimpiarCampos();
      this.toastr.success('Operación Exitosa', 'Datos de Empresa registrados', {
        timeOut: 6000,
      })
      this.habilitarprogress = false
    }, error => {
    });
  }

  VerificarOtroTipo(form, datos) {
    this.habilitarprogress = true;
    if (form.tipoForm === 'Otro') {
      if (form.otroForm != '') {
        datos.tipo_empresa = form.otroForm;
        this.VerificarEstablecimiento(form, datos);
      }
      else {
        this.habilitarprogress = false;
        this.toastr.info('Ingrese el nombre del tipo de empresa.', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.VerificarEstablecimiento(form, datos);
    }
  }

  VerificarEstablecimiento(form, datos) {
    this.habilitarprogress = true;
    if (form.establecimientoForm === 'Otro') {
      if (form.otroEForm != '') {
        datos.establecimiento = form.otroEForm;
        this.GuardarDatos(datos);
      }
      else {
        this.toastr.info('Ingrese el nombre del establecimiento.', '', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      }
    }
    else {
      this.GuardarDatos(datos);
    }
  }

  CambiarNombrePublica() {
    this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
    this.estiloRepre = { 'visibility': 'visible' }; this.HabilitarRepre = false;
    this.valor = 'Máxima Autoridad'
    this.RegistroEmpresaForm.patchValue({
      otroForm: ''
    })
  }

  CambiarNombrePrivada() {
    this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
    this.estiloRepre = { 'visibility': 'visible' }; this.HabilitarRepre = false;
    this.valor = 'Representante Legal'
    this.RegistroEmpresaForm.patchValue({
      otroForm: ''
    })
  }

  CambiarNombreOng() {
    this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
    this.estiloRepre = { 'visibility': 'visible' }; this.HabilitarRepre = false;
    this.valor = 'Representante Legal'
    this.RegistroEmpresaForm.patchValue({
      otroForm: ''
    })
  }

  CambiarNombreNatural() {
    this.estiloOtro = { 'visibility': 'hidden' }; this.HabilitarOtro = true;
    this.estiloRepre = { 'visibility': 'visible' }; this.HabilitarRepre = false;
    this.valor = 'Representante Legal'
    this.RegistroEmpresaForm.patchValue({
      otroForm: ''
    })
  }

  CambiarNombreOtro() {
    this.estiloOtro = { 'visibility': 'visible' }; this.HabilitarOtro = false;
    this.estiloRepre = { 'visibility': 'visible' }; this.HabilitarRepre = false;
    this.toastr.info('Ingresar el nombre del tipo de empresa.', '', {
      timeOut: 6000,
    })
    this.valor = 'Representante Legal'
    this.RegistroEmpresaForm.patchValue({
      otroForm: ''
    })
  }

  CambiarSucursalesAgencias() {
    this.estiloOtroE = { 'visibility': 'hidden' }; this.HabilitarOtroE = true;
    this.RegistroEmpresaForm.patchValue({
      otroEForm: ''
    })
  }

  CambiarEstablecimiento() {
    this.estiloOtroE = { 'visibility': 'visible' }; this.HabilitarOtroE = false;
    this.toastr.info('Ingresar el nombre del establecimiento que tiene la empresa.', '', {
      timeOut: 6000,
    })
    this.RegistroEmpresaForm.patchValue({
      otroEForm: ''
    })
  }

  CerrarVentanaRegistroEmpresa() {
    this.LimpiarCampos();
    this.ventana.close();
    window.location.reload();
    this.valor = '';
  }

}
