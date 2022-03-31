// SECCIÓN DE LIBRERIAS
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';

// SECCIÓN SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-crear-parametro',
  templateUrl: './crear-parametro.component.html',
  styleUrls: ['./crear-parametro.component.css']
})

export class CrearParametroComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public ParametrosForm = new FormGroup({
    descripcionForm: this.descripcion,
  });

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<CrearParametroComponent>
  ) { }

  ngOnInit(): void { }

  // MÉTODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      descripcion: form.descripcionForm
    };
    this.rest.IngresarTipoParametro(datos).subscribe(response => {
      this.toastr.success('Nuevo parámetro registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.CerrarVentana();
    });
  }

  // MÉTODO PARA CERRAR VENTANA
  CerrarVentana() {
    this.ventana.close();
  }

  // MÉTODO PARA VALIDAR INGRESO SOLO LETRAS
  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  // MÉTODO PARA VALIDAR INGRESO DE DESCRIPCIÓN
  ObtenerErrorNombre() {
    if (this.descripcion.hasError('required')) {
      return 'Campo obligatorio.';
    }
    return this.descripcion.hasError('pattern') ? 'Ingresar una descripción válida.' : '';
  }

}
