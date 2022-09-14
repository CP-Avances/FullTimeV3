import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';

@Component({
  selector: 'app-discapacidad',
  templateUrl: './discapacidad.component.html',
  styleUrls: ['./discapacidad.component.css']
})

export class DiscapacidadComponent implements OnInit {

  idEmploy: string;
  editar: string;

  userDiscapacidad: any = [];
  tipoDiscapacidad: any = [];
  ultimoId: any = [];
  unTipo: any = [];

  HabilitarDescrip: boolean = true;
  estilo: any;

  porcentaje = new FormControl('', [Validators.required, Validators.maxLength(6)]);
  nombreF = new FormControl('', [Validators.minLength(5)])
  carnet = new FormControl('', [Validators.required, Validators.maxLength(8)]);
  tipo = new FormControl('', [Validators.maxLength(10)])

  public nuevoCarnetForm = new FormGroup({
    porcentajeForm: this.porcentaje,
    carnetForm: this.carnet,
    nombreForm: this.nombreF,
    tipoForm: this.tipo,
  });

  constructor(
    private rest: DiscapacidadService,
    private toastr: ToastrService,
    private ventana: MatDialogRef<DiscapacidadComponent>,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.editar = this.datos.metodo;
    this.idEmploy = this.datos.idEmpleado;
    console.log(this.datos)
    this.LimpiarCampos();
    this.EditarFormulario();
    this.ObtenerTiposDiscapacidad();
    this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
  }

  texto: string = 'REGISTRAR'
  EditarFormulario() {
    if (this.editar == 'editar') {
      this.rest.getDiscapacidadUsuarioRest(parseInt(this.idEmploy)).subscribe(data => {
        this.userDiscapacidad = data;
        this.carnet.setValue(this.userDiscapacidad[0].carn_conadis);
        this.porcentaje.setValue(this.userDiscapacidad[0].porcentaje);
        this.tipo.setValue(this.userDiscapacidad[0].tipo);
        this.texto = 'MODIFICAR'
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
        this.toastr.info('Ingresar nombre del nuevo Tipo de Discapacidad', '', {
          timeOut: 6000,
        })
      }
    }
    else {
      if (form1.tipoForm === null) {
        console.log('probando2', form1.tipoForm)
        this.toastr.info('Se le indica que debe seleccionar un tipo de discapacidad', '', {
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
        this.toastr.info('Ingresar nombre del nuevo Tipo de Discapacidad', '', {
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
      this.LimpiarCampos();
      this.texto = 'REGISTRAR';
      this.cerrarRegistro();
    });
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
    });
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
    });
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

  obtenerMensajeErrorCarnet() {
    if (this.carnet.hasError('required')) {
      return 'Debe ingresar N° de carnet';
    }
    return this.carnet.hasError('maxLength') ? 'ingresar hasta 7 caracteres' : '';
  }

  formatLabel(value: number) {
    return value + '%';
  }


  LimpiarCampos() {
    this.nuevoCarnetForm.reset();
  }

  cerrarRegistro() {
    this.ventana.close();
  }


  // TIPO DE DESCAPACIDAD 
  seleccionarTipo;
  ObtenerTiposDiscapacidad() {
    this.rest.ListarTiposD().subscribe(data => {
      this.tipoDiscapacidad = data;
      this.tipoDiscapacidad[this.tipoDiscapacidad.length] = { nombre: "OTRO" };
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
