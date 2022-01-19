import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Md5 } from 'ts-md5';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrls: ['./cambiar-contrasena.component.css']
})

export class CambiarContrasenaComponent implements OnInit {

  hide1 = true;
  hide2 = true;
  hide3 = true;
  usuario: string;
  ActualContrasena = new FormControl('', Validators.maxLength(12));
  NuevaContrasenia = new FormControl('', Validators.maxLength(12));
  ConfirmarContrasenia = new FormControl('', Validators.maxLength(12));
  datosUser: any = [];

  public cambiarContraseniaForm = new FormGroup({
    nPass: this.NuevaContrasenia,
    cPass: this.ConfirmarContrasenia,
    aPass: this.ActualContrasena
  });

  constructor(
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
    public dialogRef: MatDialogRef<CambiarContrasenaComponent>,
  ) {
    this.usuario = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
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
        if (form.nPass != form.cPass) {
          this.toastr.error('Incorrecto', 'Las contrasenias no coinciden', {
            timeOut: 6000,
          });
        }
        else {
          this.EnviarContraseniaConfirmacion(form);
        }
      }
      else {
        this.toastr.error('Incorrecto', 'La contraseña actual no es la correcta', {
          timeOut: 6000,
        });
      }
    }, error => { });
  }

  EnviarContraseniaConfirmacion(form) {
    /* Cifrado de contraseña */
    const md5 = new Md5();
    let clave = md5.appendStr(form.cPass).end();
    let datos = {
      id_empleado: parseInt(this.usuario),
      contrasena: clave
    }
    this.restUser.ActualizarPassword(datos).subscribe(data => {
      this.toastr.success('Operación Exitosa', 'Contraseña ha sido modificada', {
        timeOut: 6000,
      });
      this.CerrarRegistro();
    }, error => { });
  }

  CerrarRegistro() {
    this.dialogRef.close();
  }

}
