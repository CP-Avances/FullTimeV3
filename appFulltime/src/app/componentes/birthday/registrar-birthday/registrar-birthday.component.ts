import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { BirthdayService } from 'src/app/servicios/birthday/birthday.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registrar-birthday',
  templateUrl: './registrar-birthday.component.html',
  styleUrls: ['./registrar-birthday.component.css']
})
export class RegistrarBirthdayComponent implements OnInit {

  tituloF = new FormControl('', [Validators.required]);
  linkF = new FormControl('');
  mensajeF = new FormControl('', [Validators.required]);
  nombreCertificadoF = new FormControl('', Validators.required);
  archivoForm = new FormControl('');

  public birthdayForm = new FormGroup({
    tituloForm: this.tituloF,
    linkForm: this.linkF,
    mensajeForm: this.mensajeF,
    nombreCertificadoForm: this.nombreCertificadoF
  })

  id_empresa: number = parseInt(localStorage.getItem("empresa"));

  constructor(
    private restB: BirthdayService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistrarBirthdayComponent>
  ) { }

  ngOnInit(): void {

  }

  InsertarMensajeBirthday(form) {
    let dataMensaje = {
      id_empresa: this.id_empresa, 
      titulo: form.tituloForm, 
      link: form.linkForm, 
      mensaje: form.mensajeForm 
    } 
    console.log(dataMensaje);
    
    this.restB.CrearBirthday(dataMensaje).subscribe(res => {
      console.log(res);
      this.dialogRef.close(true);
      this.SubirRespaldo(res[0].id)
    })
    
  }

  cerrarVentana() {
    this.dialogRef.close(false);
  }

  LimpiarNombreArchivo() {
    this.birthdayForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.birthdayForm.patchValue({ nombreCertificadoForm: name });
    }
  }

  SubirRespaldo(id: number) {
    let formData = new FormData();
    console.log("tamaño", this.archivoSubido[0].size);
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restB.SubirImagenBirthday(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

}
