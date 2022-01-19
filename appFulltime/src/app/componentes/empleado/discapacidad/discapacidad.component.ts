import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { VerEmpleadoComponent } from '../ver-empleado/ver-empleado.component';

@Component({
  selector: 'app-discapacidad',
  templateUrl: './discapacidad.component.html',
  styleUrls: ['./discapacidad.component.css']
})
export class DiscapacidadComponent implements OnInit {

  @Input() idEmploy: string;
  @Input() editar: string;

  userDiscapacidad: any = [];
  tipoDiscapacidad: any = [];
  unTipo: any = [];
  ultimoId: any = [];

  HabilitarDescrip: boolean = true;
  estilo: any;

  carnet = new FormControl('', [Validators.required, Validators.maxLength(8)]);
  porcentaje = new FormControl('', [Validators.required, Validators.maxLength(6)]);
  tipo = new FormControl('', [Validators.maxLength(10)])
  nombreF = new FormControl('', [Validators.minLength(5)])

  public nuevoCarnetForm = new FormGroup({
    carnetForm: this.carnet,
    porcentajeForm: this.porcentaje,
    tipoForm: this.tipo,
    nombreForm: this.nombreF
  });

  constructor(
    private rest: DiscapacidadService,
    private toastr: ToastrService,
    private router: Router,
    private metodo: VerEmpleadoComponent
  ) { }

  ngOnInit(): void {
    this.limpiarCampos();
    this.editarFormulario();
    this.ObtenerTiposDiscapacidad();
    this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
  }

  texto: string = 'Anadir'
  editarFormulario() {
    if (this.editar == 'editar') {
      this.rest.getDiscapacidadUsuarioRest(parseInt(this.idEmploy)).subscribe(data => {
        this.userDiscapacidad = data;
        this.carnet.setValue(this.userDiscapacidad[0].carn_conadis);
        this.porcentaje.setValue(this.userDiscapacidad[0].porcentaje);
        this.tipo.setValue(this.userDiscapacidad[0].tipo);
        this.texto = 'Modificar'
      });
    }
  }

  insertarCarnet(form) {
    if (this.editar != 'editar') {
      this.GuardarDiscapacidad(form);
    }
    else {
      this.CambiarDiscapacidad(form);
    }
  }

  GuardarDiscapacidad(form1) {
    if (form1.tipoForm === undefined) {
      if (form1.nombreForm != '') {
        this.GuardarTipoRegistro(form1);
      }
      else {
        this.toastr.info('Ingresar nombre del nuevo Tipo de Discapacidad','', {
          timeOut: 6000,
        })
      }
    }
    else {
      if (form1.tipoForm === null) {
        console.log('probando2', form1.tipoForm)
        this.toastr.info('Se le indica que debe seleccionar un tipo de discapacidad','', {
          timeOut: 6000,
        })
      }
      else {
        this.RegistarDatos(form1, form1.tipoForm);
      }

    }
  }

  CambiarDiscapacidad(form1) {
    if (form1.tipoForm === undefined) {
      if (form1.nombreForm != '') {
        this.GuardarTipoActualizacion(form1);
      }
      else {
        this.toastr.info('Ingresar nombre del nuevo Tipo de Discapacidad','', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.ActualizarDatos(form1, form1.tipoForm);
    }
  }

  RegistarDatos(form, idTipoD) {
    let dataCarnet = {
      id_empleado: parseInt(this.idEmploy),
      carn_conadis: form.carnetForm,
      porcentaje: form.porcentajeForm,
      tipo: idTipoD,
    }
    this.rest.postDiscapacidadRest(dataCarnet).subscribe(response => {
      this.toastr.success('Operacion Exitosa', 'Discapacidad guardada', {
        timeOut: 6000,
      });
      this.limpiarCampos();
      this.metodo.obtenerDiscapacidadEmpleado(this.idEmploy);
      this.texto = 'Añadir';
    }, error => { });
  }

  ActualizarDatos(form, idTipoD) {
    let dataUpdate = {
      carn_conadis: form.carnetForm,
      porcentaje: form.porcentajeForm,
      tipo: idTipoD,
    }
    this.rest.putDiscapacidadUsuarioRest(parseInt(this.idEmploy), dataUpdate).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Discapacidad Actualiza', {
        timeOut: 6000,
      });
      this.metodo.obtenerDiscapacidadEmpleado(this.idEmploy);
      this.cerrarRegistro();
    });
  }

  GuardarTipoActualizacion(form) {
    let datosTD = {
      nombre: form.nombreForm,
    }
    this.rest.InsertarTipoD(datosTD).subscribe(response => {
      console.log(response)
      this.rest.ConsultarUltimoIdTD().subscribe(data => {
        this.ultimoId = data;
        this.ultimoId[0].max;
        this.ActualizarDatos(form, this.ultimoId[0].max);
      });
    }, error => { });
  }

  GuardarTipoRegistro(form) {
    let datosTD = {
      nombre: form.nombreForm,
    }
    this.rest.InsertarTipoD(datosTD).subscribe(response => {
      console.log(response)
      this.rest.ConsultarUltimoIdTD().subscribe(data => {
        this.ultimoId = data;
        this.ultimoId[0].max;
        this.RegistarDatos(form, this.ultimoId[0].max);
      });
    }, error => { });
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

  obtenerMensajeErrorCarnet() {
    if (this.carnet.hasError('required')) {
      return 'Debe ingresar N° de carnet';
    }
    return this.carnet.hasError('maxLength') ? 'ingresar hasta 7 caracteres' : '';
  }

  formatLabel(value: number) {
    return value + '%';
  }


  limpiarCampos() {
    this.nuevoCarnetForm.reset();
  }

  cerrarRegistro() {
    this.metodo.mostrarDis();
    //window.location.reload();
  }


  /* TIPO DE DESCAPACIDAD */
  seleccionarTipo;
  ObtenerTiposDiscapacidad() {
    this.rest.ListarTiposD().subscribe(data => {
      this.tipoDiscapacidad = data;
      this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
      //this.seleccionarTipo = this.tipoDiscapacidad[this.tipoDiscapacidad.length - 1].nombre;

    });
  }

  ActivarDesactivarNombre(form1) {
    console.log('probando', form1.tipoForm)
    if (form1.tipoForm === undefined) {
      this.nuevoCarnetForm.patchValue({
        nombreForm: '',
      });
      this.estilo = { 'visibility': 'visible' }; this.HabilitarDescrip = false;
      this.toastr.info('Ingresar nombre del nuevo Tipo de Discapacidad', 'Etiqueta Nuevo Tipo activa', {
        timeOut: 6000,
      })
    }
    else {
      this.nuevoCarnetForm.patchValue({
        nombreForm: '',
      });
      this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
    }
  }

}
