import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-frase-seguridad',
  templateUrl: './frase-seguridad.component.html',
  styleUrls: ['./frase-seguridad.component.css']
})

export class FraseSeguridadComponent implements OnInit {

  usuario: string;
  ActualFrase = new FormControl('', Validators.maxLength(100));

  public formulario = new FormGroup({
    aFrase: this.ActualFrase
  });

  constructor(
    private restUser: UsuarioService,
    private toastr: ToastrService,
    public router: Router,
    public ventana: MatDialogRef<FraseSeguridadComponent>,
    public location: Location,
  ) {
    this.usuario = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
  }

  IngresarFrase(form: any) {
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
    this.ventana.close(false);
  }

}
