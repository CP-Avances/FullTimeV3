import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-correo-empresa',
  templateUrl: './correo-empresa.component.html',
  styleUrls: ['./correo-empresa.component.css']
})
export class CorreoEmpresaComponent implements OnInit {

  hide1 = true;
  hide = true;

  emailF = new FormControl({value: '', disabled: true}, [Validators.required, Validators.email])
  passwordF = new FormControl('', Validators.required)
  password_confirmF = new FormControl('', [Validators.requiredTrue])

  contrasenia: string = '';
  confirmar_contrasenia: string = '';

  btnDisableGuardar: boolean = true;
  dis_correo: boolean = false;

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  public ConfiguracionCorreoForm = new FormGroup({
    email: this.emailF,
    passwordF: this.passwordF,
    password_confirmF: this.password_confirmF
  })

  constructor(
    private restE: EmpresaService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<CorreoEmpresaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.emailF.patchValue(this.data.correo);
  }

  GuardarConfiguracion(form) {
    this.habilitarprogress = true;
    // console.log(form);
    let data = {
      correo: form.email || this.data.correo, 
      password_correo: form.passwordF
    }
    console.log(data);
    this.restE.EditarCredenciales(this.data.id, data).subscribe(res => {
      this.habilitarprogress = false;
      this.toastr.success(res.message)
      this.dialogRef.close({actualizar: true})
    })
  }

  ValidacionContrasenia(e) {

    let especiales = [9, 13, 16, 17, 18, 19, 20, 27, 33, 32, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46];
    let tecla_especial = false;

    for (var i in especiales) {
      if (e.keyCode == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }

    if (tecla_especial) return false;

    if (e.keyCode === 8) { this.contrasenia = this.contrasenia.slice(0,-1) }
    if (e.keyCode != 8) {
      this.contrasenia = this.contrasenia + e.key;
    }
    // console.log(e.key,'>>>>',this.contrasenia);
    if (this.confirmar_contrasenia !== '') {
      this.CompararContrasenia();
    }
  }

  ValidacionConfirmarContrasenia(e) {
    let especiales = [9, 13, 16, 17, 18, 19, 20, 27, 33, 32, 34, 35, 36, 37, 38, 39, 40, 44, 45, 46];
    let tecla_especial = false

    for (var i in especiales) {
      if (e.keyCode == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }

    if (tecla_especial) return false;

    if (e.keyCode === 8) { this.confirmar_contrasenia = this.confirmar_contrasenia.slice(0,-1) }

    if (e.keyCode != 8) {
      this.confirmar_contrasenia = this.confirmar_contrasenia + e.key;
    }

    // console.log(e.key,'>>>>',this.contrasenia,' === ',this.confirmar_contrasenia);
    this.CompararContrasenia();
  }

  CompararContrasenia() {
    if (this.contrasenia === this.confirmar_contrasenia) {
      this.toastr.success('Contraseñas iguales')
      this.btnDisableGuardar = false;
    } else {
      this.btnDisableGuardar = true;
      this.password_confirmF.setValidators(Validators.requiredTrue)
    }
  }

  ObtenerErrorPasswordConfirm() {
    if (this.contrasenia != this.confirmar_contrasenia) {
      return 'Las contraseña no son iguales';
    }

    this.password_confirmF.setValidators(Validators.required)

    return '';
  }

  changeEstado() {
    this.emailF.enabled ? this.emailF.disable() : this.emailF.enable()
  }

}
