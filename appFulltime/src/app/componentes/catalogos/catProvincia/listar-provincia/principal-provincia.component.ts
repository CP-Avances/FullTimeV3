import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { RegistroProvinciaComponent } from '../registro-provincia/registro-provincia.component';

import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { ProvinciaService } from '../../../../servicios/catalogos/catProvincias/provincia.service'

@Component({
  selector: 'app-principal-provincia',
  templateUrl: './principal-provincia.component.html',
  styleUrls: ['./principal-provincia.component.css'],
})

export class PrincipalProvinciaComponent implements OnInit {

  // Almacenamiento de datos
  provincias: any = [];
  filtroPais = '';
  filtroProvincia = '';

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  confirmacion = false;

  // Control de campos y validaciones del formulario
  paisF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // Asignación de validaciones a inputs del formulario
  public BuscarProvinciasForm = new FormGroup({
    paisForm: this.paisF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    public rest: ProvinciaService,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ListarProvincias();
  }


  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ListarProvincias() {
    this.provincias = [];
    this.rest.getProvinciasRest().subscribe(datos => {
      this.provincias = datos;
    })
  }

  AbrirVentanaRegistrarProvincia() {
    this.vistaRegistrarDatos.open(RegistroProvinciaComponent, { width: '400px' }).afterClosed().subscribe(item => {
      this.ListarProvincias();
    });
  }

  /* **********************************************************************************
   * ELIMAR REGISTRO ENROLADO Y ENROLADOS-DISPOSITIVO 
   * **********************************************************************************/

  /** Función para eliminar registro seleccionado */
  Eliminar(id_prov: number) {
    //console.log("probando id", id_prov)
    this.rest.EliminarProvincia(id_prov).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ListarProvincias();
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/provincia']);
        }
      });
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  LimpiarCampos() {
    this.BuscarProvinciasForm.setValue({
      paisForm: '',
      provinciaForm: ''
    });
    this.ListarProvincias;
  }

  ObtenerMensajePaisLetras() {
    if (this.paisF.hasError('pattern')) {
      return 'Indispensable ingresar dos letras';
    }
  }

  ObtenerMensajeProvinciaLetras() {
    if (this.provinciaF.hasError('pattern')) {
      return 'Indispensable ingresar dos letras';
    }
  }

}
