import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-tipo-seguridad',
  templateUrl: './tipo-seguridad.component.html',
  styleUrls: ['./tipo-seguridad.component.css']
})

export class TipoSeguridadComponent implements OnInit {

  selec1: boolean = false;
  selec2: boolean = false;
  selec3: boolean = false;

  // Control de campos y validaciones del formulario
  tipoF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public seguridadForm = new FormGroup({
    tipoForm: this.tipoF
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private toastr: ToastrService,
    private rest: EmpresaService,
    public dialogRef: MatDialogRef<TipoSeguridadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit(): void {
    console.log('datos', this.data)
    this.ImprimirDatos();
  }

  LimpiarCampos() {
    this.seguridadForm.reset();
  }

  InsertarEmpresa(form) {
    this.habilitarprogress = true;
    let datosEmpresa = {
      seg_contrasena: false,
      seg_frase: false,
      seg_ninguna: false,
      id: parseInt(localStorage.getItem('empresa'))
    };
    if (form.tipoForm === 'contrasena') {
      datosEmpresa.seg_contrasena = true;
    }
    else if (form.tipoForm === 'frase') {
      datosEmpresa.seg_frase = true;
    }
    else if (form.tipoForm === 'ninguna') {
      datosEmpresa.seg_ninguna = true;
    }
    console.log('empresa', datosEmpresa, form.tipoForm)
    this.GuardarDatos(datosEmpresa);
    this.CerrarVentanaRegistroEmpresa();
  }

  GuardarDatos(datos) {
    this.habilitarprogress = true;
    this.rest.ActualizarSeguridad(datos).subscribe(response => {
      this.LimpiarCampos();
      this.toastr.success('Operación Exitosa', 'Datos de Empresa registrados', {
        timeOut: 6000,
      })
      this.habilitarprogress = false
    });
  }

  CerrarVentanaRegistroEmpresa() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  ImprimirDatos() {
    if (this.data.seg_contrasena === null || this.data.seg_contrasena === '' || this.data.seg_contrasena === false) {
      this.selec1 = false;
    }
    else {
      this.selec1 = true;
     this.seguridadForm.patchValue({ tipoForm: 'contrasena'});
    }
    if (this.data.seg_frase === null || this.data.seg_frase === '' || this.data.seg_frase === false) {
      this.selec2 = false;
    }
    else {
      this.selec2 = true;
      this.seguridadForm.patchValue({ tipoForm: 'frase'});
    }
    if (this.data.seg_ninguna === null || this.data.seg_ninguna === '' || this.data.seg_ninguna === false) {
      this.selec3 = false;
    }
    else {
      this.seguridadForm.patchValue({ tipoForm: 'ninguna'});
    }
  }

}
