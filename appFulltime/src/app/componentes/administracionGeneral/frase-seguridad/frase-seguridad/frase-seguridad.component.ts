import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-frase-seguridad',
  templateUrl: './frase-seguridad.component.html',
  styleUrls: ['./frase-seguridad.component.css']
})
export class FraseSeguridadComponent implements OnInit {

  usuario: string;
  ActualFrase = new FormControl('', Validators.maxLength(100));

  public fraseForm = new FormGroup({
    aFrase: this.ActualFrase
  });

  constructor(
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public location: Location,
    public dialogRef: MatDialogRef<FraseSeguridadComponent>,
  ) {
    this.usuario = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
  }

  IngresarFrase(form) {
    let data = {
      frase: form.aFrase,
      id_empleado: parseInt(this.usuario)
    }
    console.log('data', data)
    this.restUser.ActualizarFrase(data).subscribe(data => {
      this.toastr.success('Frase ingresada éxitosamente', '', {
        timeOut: 6000,
      });
    });
    this.CerrarRegistro();
  }

  CerrarRegistro() {
    this.dialogRef.close(false);
  }

}
