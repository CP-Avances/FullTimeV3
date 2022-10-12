import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-subir-documento',
  templateUrl: './subir-documento.component.html',
  styleUrls: ['./subir-documento.component.css']
})

export class SubirDocumentoComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  documentoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');

  public GuardarDocumentoForm = new FormGroup({
    documentoForm: this.documentoF
  });

  nameFile: string;
  archivoSubido: Array<File>;

  constructor(
    private toastr: ToastrService,
    private rest: DocumentosService,
    public ventana: MatDialogRef<SubirDocumentoComponent>,
  ) { }

  ngOnInit(): void {
    this.nameFile = '';
  }

  // GUARDAR DOCUMENTO EN SERVIDOR
  InsertarDocumento(form: any) {
    this.SubirRespaldo(form);
    this.LimpiarNombreArchivo();
    this.CerrarVentana();
  }

  // LIMPIAR EL NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.GuardarDocumentoForm.patchValue({
      documentoForm: '',
    });
  }


  /** *********************************************************************************** **
   ** **                               MANEJO DE ARCHIVOS                              ** ** 
   ** *********************************************************************************** **/

  // SELECCIONAR UN ARCHIVO
  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      if (this.archivoSubido[0].size <= 2e+6) {
        this.GuardarDocumentoForm.patchValue({ documentoForm: name });
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      };
    }
  }

  // CREAR REGISTRO DE DOCUMENTO
  SubirRespaldo(form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.CrearArchivo(formData, form.documentoForm).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento cargado exitosamente.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });

  }

  // CERRAR VENTANA DE REGISTRO
  CerrarVentana() {
    this.ventana.close();
  }

}
