import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service'
import { RegistrarCiudadComponent } from 'src/app/componentes/ciudades/registrar-ciudad/registrar-ciudad.component'
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';

@Component({
  selector: 'app-listar-ciudad',
  templateUrl: './listar-ciudad.component.html',
  styleUrls: ['./listar-ciudad.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class ListarCiudadComponent implements OnInit {

  // Almacenamiento de datos
  datosCiudades: any = [];
  filtroCiudad = '';
  filtroProvincia = '';

  // items de paginacion de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  // Control de campos y validaciones del formulario
  ciudadF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // Asignación de validaciones a inputs del formulario
  public BuscarCiudadForm = new FormGroup({
    ciudadForm: this.ciudadF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    public rest: CiudadService,
    public vistaRegistrarDatos: MatDialog,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ListarCiudades();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ListarCiudades() {
    this.datosCiudades = [];
    this.rest.ConsultarNombreCiudades().subscribe(datos => {
      this.datosCiudades = datos;
    })
  }

  AbrirVentanaRegistrarCiudad() {
    this.vistaRegistrarDatos.open(RegistrarCiudadComponent, { width: '600px' }).afterClosed().subscribe(item => {
      this.ListarCiudades();
    });
  }

  /* **********************************************************************************
   * ELIMAR REGISTRO ENROLADO Y ENROLADOS-DISPOSITIVO 
   * **********************************************************************************/

  /** Función para eliminar registro seleccionado */
  Eliminar(id_ciu: number) {
    //console.log("probando id", id_prov)
    this.rest.EliminarCiudad(id_ciu).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ListarCiudades();
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/listarCiudades']);
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
    this.BuscarCiudadForm.setValue({
      ciudadForm: '',
      provinciaForm: ''
    });
    this.ListarCiudades;
  }

  ObtenerMensajeCiudadLetras() {
    if (this.ciudadF.hasError('pattern')) {
      return 'Indispensable ingresar dos letras';
    }
  }

  ObtenerMensajeProvinciaLetras() {
    if (this.provinciaF.hasError('pattern')) {
      return 'Indispensable ingresar dos letras';
    }
  }

}
