import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-subir-documento',
  templateUrl: './subir-documento.component.html',
  styleUrls: ['./subir-documento.component.css']
})
export class SubirDocumentoComponent implements OnInit {

  // Control de campos y validaciones del formulario
  nombreDocumentoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');

  public GuardarDocumentoForm = new FormGroup({
    nombreDocumentoForm: this.nombreDocumentoF
  });

  nameFile: string;
  archivoSubido: Array<File>;

  constructor(
    private rest: DocumentosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<SubirDocumentoComponent>,
  ) { }

  ngOnInit(): void {
    this.nameFile = '';
  }

  idDoc: any;
  InsertarDocumento(form) {
    let dataDocumento = {
      doc_nombre: form.nombreDocumentoForm
    };
    if (this.archivoSubido[0].size <= 2e+6) {
      this.rest.CrearArchivo(dataDocumento).subscribe(response => {
        this.idDoc = response;
        this.SubirRespaldo(this.idDoc.id);
        this.LimpiarNombreArchivo();
        this.CerrarVentanaEditar();
      }, error => {
        this.toastr.error('Operación Fallida', 'Documento no pudo ser cargado en el sistema', {
          timeOut: 6000,
        })
      })
    }
    else {
      this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
        timeOut: 6000,
      });
    };
  }

  LimpiarNombreArchivo() {
    this.GuardarDocumentoForm.patchValue({
      nombreDocumentoForm: '',
    });
  }

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.GuardarDocumentoForm.patchValue({ nombreDocumentoForm: name });
    }
  }

  SubirRespaldo(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirArchivo(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con éxito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  CerrarVentanaEditar() {
    this.dialogRef.close();
  }

}
