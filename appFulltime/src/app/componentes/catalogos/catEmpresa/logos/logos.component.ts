// SECCIÓN DE LIBRERIAS
import { FormControl } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// SECCIÓN DE SERVICIOS
import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-logos',
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.css']
})

export class LogosComponent implements OnInit {

  logo: string;
  textoBoton: string = 'Editar';

  constructor(
    private toastr: ToastrService,
    public restE: EmpresaService,
    public dialogRef: MatDialogRef<LogosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {

    console.log('ver data --------------', this.data)
    this.MostrarImagen();
  }

  MostrarImagen() {
    if (this.data.pagina === 'empresa') {
      this.VerLogoEmpresa();
    } else if (this.data.pagina === 'header') {
      this.VerCabeceraCorreo();
    } else if (this.data.pagina === 'footer') {
      this.VerPieCorreo();
    }
  }

  archivoSubido: Array<File>;
  archivoForm = new FormControl('');

  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.data.pagina === 'empresa') {
      this.ActualizarLogoEmpresa();
    } else if (this.data.pagina === 'header') {
      this.ActualizarCabeceraCorreo();
    } else if (this.data.pagina === 'footer') {
      this.ActualizarPieCorreo();
    }
  }

  /** ************************************************************************************** **
   ** **              MÉTODOS PARA CONSULTAR Y ACTUALIZAR LOGO DE EMPRESA                 ** **
   ** ************************************************************************************** **/

  ActualizarLogoEmpresa() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      // console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      // console.log("image", formData);
    }
    this.restE.EditarLogoEmpresa(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación Exitosa', 'Logotipo Actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.dialogRef.close({ actualizar: false })
    });
  }

  VerLogoEmpresa() {
    this.restE.LogoEmpresaImagenBase64(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) { this.textoBoton = 'Añadir' };
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  /** ************************************************************************************** **
   ** **             MÉTODOS PARA CONSULTAR Y ACTUALIZAR CABECERA DE CORREO               ** **
   ** ************************************************************************************** **/

  ActualizarCabeceraCorreo() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      // console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      // console.log("image", formData);
    }
    this.restE.EditarCabeceraCorreo(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación Exitosa', 'Logotipo Actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.dialogRef.close({ actualizar: false })
    });
  }

  VerCabeceraCorreo() {
    this.restE.ObtenerCabeceraCorreo(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) { this.textoBoton = 'Añadir' };
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  /** ************************************************************************************** **
   ** **             MÉTODOS PARA CONSULTAR Y ACTUALIZAR PIE DE CORREO                    ** **
   ** ************************************************************************************** **/

  ActualizarPieCorreo() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      // console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      // console.log("image", formData);
    }
    this.restE.EditarPieCorreo(this.data.empresa, formData).subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      if (res.imagen != 0) { this.textoBoton = 'Editar' };
      this.toastr.success('Operación Exitosa', 'Logotipo Actualizado.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.dialogRef.close({ actualizar: false })
    });
  }

  VerPieCorreo() {
    this.restE.ObtenerPieCorreo(this.data.empresa).subscribe(res => {
      if (res.imagen === 0) { this.textoBoton = 'Añadir' };
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

}
