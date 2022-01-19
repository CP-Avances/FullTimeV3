import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';

@Component({
  selector: 'app-editar-documento',
  templateUrl: './editar-documento.component.html',
  styleUrls: ['./editar-documento.component.css']
})
export class EditarDocumentoComponent implements OnInit {

  // Control de campos y validaciones del formulario
  nombreDocumentoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');

  public GuardarDocumentoForm = new FormGroup({
    nombreDocumentoForm: this.nombreDocumentoF
  });

  listaDocumentos: any = [];
  nameFile: string;
  archivoSubido: Array<File>;
  contador: number = 0;

  constructor(
    private rest: DocumentosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarDocumentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ImprimirDatos();
    this.nameFile = '';
  }

  ImprimirDatos() {
    this.listaDocumentos = [];
    this.rest.ListarUnArchivo(this.data.datosDocumento.id).subscribe(datos => {
      this.listaDocumentos = datos;
      this.GuardarDocumentoForm.patchValue({
        nombreDocumentoForm: this.listaDocumentos[0].doc_nombre
      });
    })
  }

  InsertarDocumento(form) {
    let dataDocumento = {
      doc_nombre: form.nombreDocumentoForm
    };
    if (this.contador === 1) {
      if (this.archivoSubido[0].size <= 2e+6) {
        this.rest.EditarArchivo(this.data.datosDocumento.id, dataDocumento).subscribe(response => {
          this.SubirRespaldo(this.data.datosDocumento.id);
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
    else {
      this.CerrarVentanaEditar();
    }
  }

  LimpiarNombreArchivo() {
    this.GuardarDocumentoForm.patchValue({
      nombreDocumentoForm: '',
    });
  }

  fileChange(element) {
    this.contador = 1;
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
      this.toastr.success('Operación Exitosa', 'Documento Actualizado', {
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
