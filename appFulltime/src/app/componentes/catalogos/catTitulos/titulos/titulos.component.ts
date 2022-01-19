import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-titulos',
  templateUrl: './titulos.component.html',
  styleUrls: ['./titulos.component.css'],
})
export class TitulosComponent implements OnInit {

  // Control de los campos del formulario
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivel = new FormControl('');
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))

  // asignar los campos en un formulario en grupo
  public nuevoTituloForm = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivel,
    nombreNivelForm: this.nombreNivel
  });

  // Arreglo de niveles existentes
  niveles: any = [];

  HabilitarDescrip: boolean = true;
  estilo: any;

  seleccionarNivel;

  constructor(
    private rest: TituloService,
    private restNivelTitulo: NivelTitulosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<TitulosComponent>,
  ) {
  }

  ngOnInit(): void {
    this.obtenerNivelesTitulo();
    this.niveles[this.niveles.length] = { nombre: "OTRO" };
  }

  obtenerNivelesTitulo() {
    this.niveles = [];
    this.restNivelTitulo.getNivelesTituloRest().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
      this.seleccionarNivel = this.niveles[this.niveles.length - 1].nombre;
    });
  }

  ActivarDesactivarNombre(form1) {
    console.log('nivel', form1.tituloNivelForm);
    if (form1.tituloNivelForm === undefined) {
      this.nuevoTituloForm.patchValue({ nombreNivelForm: '' });
      this.estilo = { 'visibility': 'visible' }; this.HabilitarDescrip = false;
      this.toastr.info('Ingresar nombre de nivel de titulación','', {
        timeOut: 6000,
      });
    }
    else {
      this.nuevoTituloForm.patchValue({ nombreNivelForm: '' });
      this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
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

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  ObtenerMensajeErrorNivel() {
    if (this.nombreNivel.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
  }

  InsertarTitulo(form) {
    if (form.tituloNivelForm === undefined || form.tituloNivelForm === 'OTRO') {
      if (form.nombreNivelForm != '') {
        this.GuardarNivel(form);

      }
      else {
        this.toastr.info('Ingrese un nombre de nivel o seleccione uno de la lista de niveles','', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarTitulo(form, form.tituloNivelForm);
    }
  }

  GuardarNivel(form) {
    let dataNivelTitulo = {
      nombre: form.nombreNivelForm,
    };
    this.restNivelTitulo.postNivelTituloRest(dataNivelTitulo).subscribe(response => {
      this.restNivelTitulo.BuscarNivelID().subscribe(datos => {
        var idNivel = datos[0].max;
        console.log('id_nivel', datos[0].max)
        this.GuardarTitulo(form, idNivel);
      })
    });
  }

  GuardarTitulo(form, idNivel) {
    let dataTitulo = {
      nombre: form.tituloNombreForm,
      id_nivel: idNivel,
    };
    this.rest.postTituloRest(dataTitulo).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Título guardado', {
        timeOut: 6000,
      });
      this.LimpiarCampos();
    }, error => {
    });
  }

  LimpiarCampos() {
    this.nuevoTituloForm.reset();
    this.obtenerNivelesTitulo();
    this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
  }

  CerrarVentanaRegistroTitulo() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
