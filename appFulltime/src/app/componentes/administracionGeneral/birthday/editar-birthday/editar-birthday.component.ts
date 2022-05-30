import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { BirthdayService } from 'src/app/servicios/birthday/birthday.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-birthday',
  templateUrl: './editar-birthday.component.html',
  styleUrls: ['./editar-birthday.component.css']
})
export class EditarBirthdayComponent implements OnInit {

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
    public dialogRef: MatDialogRef<EditarBirthdayComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.setData();
  }

  setData(){
    this.birthdayForm.patchValue({
      tituloForm: this.data.titulo,
      mensajeForm: this.data.mensaje,
      linkForm: this.data.url
    })
  }

  ModificarMensajeBirthday(form) {
    let dataMensaje = {
      titulo: form.tituloForm, 
      mensaje: form.mensajeForm,
      link: form.linkForm
    } 
    console.log(dataMensaje);
    this.restB.EditarBirthday(this.data.id, dataMensaje).subscribe(res => {
      console.log(res);
      this.toastr.success('Operación exitosa', 'Mensaje Actualizados', {
        timeOut: 6000,
      });
      this.dialogRef.close(true);
      this.SubirRespaldo(this.data.id)
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
