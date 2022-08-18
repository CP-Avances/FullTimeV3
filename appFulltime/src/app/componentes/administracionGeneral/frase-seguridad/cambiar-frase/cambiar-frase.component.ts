// IMPORTACIÓN DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTACIÓN DE SERVICIOS
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { LoginService } from 'src/app/servicios/login/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cambiar-frase',
  templateUrl: './cambiar-frase.component.html',
  styleUrls: ['./cambiar-frase.component.css']
})

export class CambiarFraseComponent implements OnInit {

  usuario: string; // VARIABLE DE ALMACENAMIENTO DE ID DE USUARIO
  datosUser: any = []; // VARIABLE DE ALMACENAMIENTO DE DATOS DE USUARIO

  // CAMPOS DEL FORMULARIO
  ActualFrase = new FormControl('', Validators.maxLength(100));
  NuevaFrase = new FormControl('', Validators.maxLength(100));

  // CAMPOS DEL FORMULARIO EN UN GRUPO
  public fraseForm = new FormGroup({
    nFrase: this.NuevaFrase,
    aFrase: this.ActualFrase
  });

  constructor(
    public dialogRef: MatDialogRef<CambiarFraseComponent>,
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public loginService: LoginService,
    public router: Router,
  ) {
    this.usuario = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
  }

  // MÉTODO PARA COMPARAR FRASE ACTUAL CON LA INGRESADA POR EL USUARIO
  CompararFrase(form) {
    this.datosUser = [];
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      this.datosUser = data;
      if (form.aFrase === this.datosUser[0].frase) {
        this.IngresarFrase(form);
      }
      else {
        this.toastr.error('Incorrecto', 'Frase actual no es la correcta', {
          timeOut: 6000,
        });
      }
    }, error => { });
  }

  // MÉTODO PARA CERRAR REGISTRO
  CerrarRegistro() {
    this.dialogRef.close();
  }

  // MÉTODO PARA GUARDAR NUEVA FRASE
  IngresarFrase(form) {
    let data = {
      frase: form.nFrase,
      id_empleado: parseInt(this.usuario)
    }
    this.restUser.ActualizarFrase(data).subscribe(data => {
      this.toastr.success('Frase ingresada éxitosamente', '', {
        timeOut: 6000,
      });
    });
    this.CerrarRegistro();
  }

  RecuperarFrase() {
    this.loginService.logout();
    this.dialogRef.close();
    this.router.navigate(['/frase-olvidar']);
  }

}
