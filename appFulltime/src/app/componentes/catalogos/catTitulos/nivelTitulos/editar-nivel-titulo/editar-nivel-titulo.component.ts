import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-editar-nivel-titulo',
  templateUrl: './editar-nivel-titulo.component.html',
  styleUrls: ['./editar-nivel-titulo.component.css']
})
export class EditarNivelTituloComponent implements OnInit {

  nombre = new FormControl('', Validators.required)

  public nuevoNivelTituloForm = new FormGroup({
    NivelTituloNombreForm: this.nombre
  });

  constructor(
    private restNivelTitulos: NivelTitulosService,
    public dialogRef: MatDialogRef<EditarNivelTituloComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
  }

  InsertarNivelTitulo(form) {
    let dataNivelTitulo = {
      id: this.data.id,
      nombre: form.NivelTituloNombreForm,
    };
    this.restNivelTitulos.ActualizarNivelTitulo(dataNivelTitulo).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Nivel del título actualizado', {
        timeOut: 6000,
      });
      this.CerrarVentanaRegistroTitulo();
    }, error => {
    });
  }

  ImprimirDatos() {
    this.nuevoNivelTituloForm.setValue({
      NivelTituloNombreForm: this.data.nombre
    })
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
    window.location.reload();
  }

  Salir() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }
  
}
