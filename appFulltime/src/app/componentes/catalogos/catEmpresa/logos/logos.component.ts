import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KardexService } from 'src/app/servicios/reportes/kardex.service';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.css']
})
export class LogosComponent implements OnInit {

  logo: string;
  textoBoton: string = 'Editar';
  constructor(
    private restK: KardexService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<LogosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.restK.LogoEmpresaImagenBase64(this.data).subscribe(res => {
      if (res.imagen === 0) { this.textoBoton = 'Añadir'};
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    })
  }

  archivoSubido: Array<File>;
  archivoForm = new FormControl('');

  fileChange(element) {
    this.archivoSubido = element.target.files;
    this.ActualizarLogo();
  }

  ActualizarLogo() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      // console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      // console.log("image", formData);
    }
    this.restK.EditarLogoEmpresa(this.data, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar'};
      this.toastr.success('Operación Exitosa', 'Logotipo Actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.dialogRef.close({actualizar: false})
    });
  }

}
