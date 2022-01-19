import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Md5 } from 'ts-md5';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { LoginService } from 'src/app/servicios/login/login.service';

@Component({
  selector: 'app-seguridad',
  templateUrl: './seguridad.component.html',
  styleUrls: ['./seguridad.component.css']
})

export class SeguridadComponent implements OnInit {

  // ver página según configuración
  contrasena: boolean = false;
  frase: boolean = false;

  hide1 = true;
  hide2 = true;
  hide3 = true;
  usuario: string;
  ActualContrasena = new FormControl('', Validators.maxLength(12));
  datosUser: any = [];

  intentos: number = 0;

  ActualFrase = new FormControl('', Validators.maxLength(100));

  public seguridadForm = new FormGroup({
    aPass: this.ActualContrasena
  });

  public fraseForm = new FormGroup({
    aFrase: this.ActualFrase
  });

  constructor(
    private restUser: UsuarioService,
    private restEmpr: EmpresaService,
    private toastr: ToastrService,
    public loginService: LoginService,
    public router: Router,
    public location: Location,
    public dialogRef: MatDialogRef<SeguridadComponent>,
  ) {
    this.usuario = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.VerEmpresa();
    this.intentos = 0;
  }

  empresa: any = [];
  VerEmpresa() {
    this.empresa = [];
    this.restEmpr.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].seg_contrasena === true) {
        this.contrasena = true;
      }
      else {
        this.frase = true;
      }
    });
  }

  CompararContrasenia(form) {
    /* Cifrado de contraseña */
    const md5 = new Md5();
    let pass = md5.appendStr(form.aPass).end();
    this.datosUser = [];
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      this.datosUser = data;
      console.log(pass);
      if (pass === this.datosUser[0].contrasena) {
        this.dialogRef.close('true');
      }
      else {
        this.intentos = this.intentos + 1;
        if (this.intentos === 4) {
          this.loginService.logout();
          this.toastr.error('Intente más tarde', 'Ha exedido el número de intentos', {
            timeOut: 3000,
          });
          this.dialogRef.close('false');
        }
        else {
          this.toastr.error('Incorrecto', 'La contraseña actual no es la correcta', {
            timeOut: 3000,
          });
        }
      }
    });
  }

  CompararFrase(form) {
    this.restUser.BuscarDatosUser(parseInt(this.usuario)).subscribe(data => {
      if (form.aFrase === data[0].frase) {
        this.dialogRef.close('true');
      }
      else {
        this.intentos = this.intentos + 1;
        if (this.intentos === 4) {
          this.loginService.logout();
          this.toastr.error('Intente más tarde', 'Ha exedido el número de intentos', {
            timeOut: 3000,
          });
          this.dialogRef.close('false');
        }
        else {
          this.toastr.error('La Frase ingresada no es la correcta.', 'Incorrecto', {
            timeOut: 3000,
          });
        }
      }
    });
  }

  CerrarRegistro() {
    this.dialogRef.close('false');
  }

  RecuperarFrase() {
    this.loginService.logout();
    this.dialogRef.close('olvidar');
  }
}
