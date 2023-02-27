import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistroProvinciaComponent } from '../registro-provincia/registro-provincia.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

import { ProvinciaService } from '../../../../servicios/catalogos/catProvincias/provincia.service'

@Component({
  selector: 'app-principal-provincia',
  templateUrl: './principal-provincia.component.html',
  styleUrls: ['./principal-provincia.component.css'],
})

export class PrincipalProvinciaComponent implements OnInit {

  // ALMACENAMIENTO DE DATOS
  provincias: any = [];
  filtroPais = '';
  filtroProvincia = '';

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  confirmacion = false;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  paisF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);
  provinciaF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    paisForm: this.paisF,
    provinciaForm: this.provinciaF,
  });

  constructor(
    private toastr: ToastrService,
    private router: Router,
    public rest: ProvinciaService,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ListarProvincias();
  }

  // EVENTOS DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA BUSCAR PROVINCIAS
  ListarProvincias() {
    this.provincias = [];
    this.rest.BuscarProvincias().subscribe(datos => {
      this.provincias = datos;
    })
  }

  // METODO PARA REGISTRAR PROVINCIAS
  AbrirVentanaRegistrarProvincia() {
    this.ventana.open(RegistroProvinciaComponent, { width: '550px' }).afterClosed().subscribe(item => {
      this.ListarProvincias();
    });
  }

  /** ******************************************************************************* **
   ** **            ELIMAR REGISTRO ENROLADO Y ENROLADOS-DISPOSITIVO               ** **
   ** ******************************************************************************* **/

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO
  Eliminar(id_prov: number) {
    this.rest.EliminarProvincia(id_prov).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ListarProvincias();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/provincia']);
        }
      });
  }

  // METODO PARA REGISTRAR SOLO LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.setValue({
      paisForm: '',
      provinciaForm: ''
    });
    this.ListarProvincias;
  }

}
