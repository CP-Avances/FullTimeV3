// IMPORTAR LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-olvidar-frase',
  templateUrl: './olvidar-frase.component.html',
  styleUrls: ['./olvidar-frase.component.css']
})

export class OlvidarFraseComponent implements OnInit {

  cadena: string;
  correo = new FormControl('', [Validators.required, Validators.email]);

  public olvidarFrase = new FormGroup({
    usuarioF: this.correo,
  });

  constructor(
    private toastr: ToastrService,
    public restE: EmpresaService,
    public rest: UsuarioService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.VerRuta();
  }

  ObtenerMensajeCampoUsuarioError() {
    if (this.correo.hasError('required')) {
      return 'Ingresar correo de usuario';
    }
    if (this.correo.hasError('email')) {
      return 'No es un correo electrónico';
    }
  }
  respuesta: any = [];

  EnviarCorreoConfirmacion(form) {
    let dataPass = {
      correo: form.usuarioF,
      url_page: this.cadena
    }
    
    this.rest.RecuperarFraseSeguridad(dataPass).subscribe(res => {
      this.respuesta = res;
      if (this.respuesta.mail === 'si') {
        this.toastr.success('Solicitud Enviada.', 'Por favor revisar su correo electrónico', {
          timeOut: 6000,
        });
        this.router.navigate(['/login']);
      }
    }, error => {
      console.log(error);
      this.toastr.error('Operación Incorrecta', 'El correo no consta en los registros.', {
        timeOut: 6000,
      });
      this.correo.reset();
    })
  }

  Cancelar() {
    this.router.navigate(['/login']);
  }

  VerRuta() {
    this.restE.ConsultarEmpresaCadena().subscribe(res => {
      this.cadena = res[0].cadena
    })
  }

}
