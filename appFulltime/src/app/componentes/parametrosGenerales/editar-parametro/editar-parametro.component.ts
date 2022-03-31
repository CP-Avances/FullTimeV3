// SECCIÓN DE LIBRERIAS
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// SECCIÓN SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-parametro',
  templateUrl: './editar-parametro.component.html',
  styleUrls: ['./editar-parametro.component.css']
})

export class EditarParametroComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  descripcion = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public ParametrosForm = new FormGroup({
    descripcionForm: this.descripcion,
  });

  constructor(
    private rest: ParametrosService,
    private toastr: ToastrService,
    public router: Router,
    public validar: ValidacionesService,
    public ventana: MatDialogRef<EditarParametroComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.MostrarInformacion();
  }

  // MÉTODO PARA MOSTRAR INFORMACIÓN
  MostrarInformacion() {
    this.ParametrosForm.patchValue({
      descripcionForm: this.data.parametros.descripcion
    })
  }

  // MÉTODO PARA REGISTRAR NUEVO PARÁMETRO
  GuardarDatos(form: any) {
    let datos = {
      id: this.data.parametros.id,
      descripcion: form.descripcionForm
    };
    this.rest.ActualizarTipoParametro(datos).subscribe(response => {
      this.toastr.success('Nuevo parámetro registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      if (this.data.actualizar === true) {
        this.CerrarVentana();
      }
      else {
        this.CerrarVentana();
        this.router.navigate(['/mostrar/parametros', this.data.parametros.id]);
      }
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
