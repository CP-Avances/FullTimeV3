import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-registrar-nivel-titulos',
  templateUrl: './registrar-nivel-titulos.component.html',
  styleUrls: ['./registrar-nivel-titulos.component.css']
})

export class RegistrarNivelTitulosComponent implements OnInit {

  nombre = new FormControl('', Validators.required)
  
  public nuevoNivelTituloForm = new FormGroup({
    NivelTituloNombreForm: this.nombre
  });

  constructor(
    private restNivelTitulos: NivelTitulosService,
    public dialogRef: MatDialogRef<RegistrarNivelTitulosComponent>,
    private toastr: ToastrService,
  ) {}
    
  ngOnInit(): void {
  }

  InsertarNivelTitulo(form){
    let dataNivelTitulo = {
      nombre: form.NivelTituloNombreForm,
    };
    this.restNivelTitulos.postNivelTituloRest(dataNivelTitulo).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Nivel del título guardado', {
        timeOut: 6000,
      });
      this.LimpiarCampos();
    }, error => {
    });;
  }

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  LimpiarCampos() {
    this.nuevoNivelTituloForm.reset();
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

  CerrarVentanaRegistroTitulo() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
