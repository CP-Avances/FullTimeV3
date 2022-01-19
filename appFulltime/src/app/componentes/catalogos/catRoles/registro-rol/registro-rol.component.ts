// IMPORTAR LIBRERIAS
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';

@Component({
  selector: 'app-registro-rol',
  templateUrl: './registro-rol.component.html',
  styleUrls: ['./registro-rol.component.css'],
})

export class RegistroRolComponent implements OnInit {

  // VARIABLE PARA ENVIO DE INFORMACION ENTRE VENTANAS
  salir: boolean = false;

  // CAMPOS DE FORMULARIO
  descripcion = new FormControl('', Validators.required);

  // CAMPOS DE FORMULARIO EN GRUPO
  public nuevoRolForm = new FormGroup({
    descripcionForm: this.descripcion
  });

  constructor(
    public ventana: MatDialogRef<RegistroRolComponent>, // VARIABLE PARA MANEJO DE VENTANAS
    public validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    public rest: RolesService, // SERVICIO DATOS DE CATÁLOGO ROLES
  ) {
    this.nuevoRolForm.setValue({
      descripcionForm: '',
    });
  }

  ngOnInit(): void {
  }

  // MÉTODO PARA INSERTAR DATOS
  contador: number = 0;
  data_nueva: any = [];
  roles: any = [];
  InsertarRol(form) {
    this.contador = 0;
    this.roles = [];
    let dataRol = {
      nombre: form.descripcionForm,
    };
    this.data_nueva = dataRol;
    this.rest.getRoles().subscribe(response => {
      this.roles = response;
      this.roles.forEach(obj => {
        if (obj.nombre.toUpperCase() === dataRol.nombre.toUpperCase()) {
          this.contador = this.contador + 1;
        }
      })
      if (this.contador === 0) {
        this.rest.postRoles(dataRol).subscribe(response => {
          console.log(response);
          this.toastr.success('Operacion Exitosa', 'Rol guardado', {
            timeOut: 6000,
          });
          this.validar.Auditar('app-web', 'cg_roles', '', this.data_nueva, 'INSERT');
          this.LimpiarCampos();
          this.salir = true;
        });
      }
      else {
        this.toastr.error('Para el correcto funcionamiento del sistema ingresar un nuevo rol ' +
          'que no se encuentre registrado en el sistema.',
          'Nombre de Rol Duplicado', {
          timeOut: 6000,
        });
      }
    })
  }

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  ObtenerMensajeErrorDescripcion() {
    if (this.descripcion.hasError('required')) {
      return 'Debe ingresar alguna Descripción.';
    }
  }

  LimpiarCampos() {
    this.nuevoRolForm.reset();
  }

  CerrarVentanaRegistroRol() {
    this.LimpiarCampos();
    this.ventana.close(this.salir);
  }
}
