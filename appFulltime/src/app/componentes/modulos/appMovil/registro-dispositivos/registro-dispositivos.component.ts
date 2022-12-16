import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DeleteRegistroDispositivoComponent } from '../delete-registro-dispositivo/delete-registro-dispositivo.component';
import { ItableDispositivos } from 'src/app/model/reportes.model'; 
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
    selector: 'app-registro-dispositivos',
    templateUrl: './registro-dispositivos.component.html',
    styleUrls: ['./registro-dispositivos.component.css']
})

export class RegistroDispositivosComponent implements OnInit {

  usersDispositivosRegistrados: any = [];
  dispositivo: any = [];

  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

   // Items de paginación de la tabla
   tamanio_pagina: number = 5;
   numero_pagina: number = 1;
   pageSizeOptions = [5, 10, 20, 50];
 
   BooleanAppMap: any = { 'true': 'Si', 'false': 'No' };

  get habilitarMovil(): boolean { return this.funciones.app_movil; }

  selectionEmp = new SelectionModel<ItableDispositivos>(true, []);

  constructor(
    private usuariosService: UsuarioService,
    private toastr: ToastrService,
    private validar: ValidacionesService,
    private dialog: MatDialog,
    private funciones: MainNavService
  ) {}
    
  ngOnInit(): void {
    if (this.habilitarMovil === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
        message: '¿Te gustaría activarlo? Comunícate con nosotros.',
        url: 'www.casapazmino.com.ec'
      }
      return this.validar.RedireccionarHomeAdmin(mensaje);
    }
    else {
      this.ObtenerDispositivosRegistrados();
    }
  }

  // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE LAS TABLAS
  habilitar: boolean = false;
  HabilitarSeleccion_habilitados() {
    if(this.habilitar === false){
      this.habilitar = true;
    }else{
      this.habilitar = false;
      this.selectionEmp.clear();
    }
  }

  ObtenerDispositivosRegistrados(){
    this.usuariosService.getUserDispositivoMovil().subscribe(res => {
      this.usersDispositivosRegistrados = res;
    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })
  }

  openDialogDeleteDispositivo() {
    this.habilitar = false;
    if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
    this.dialog.open(DeleteRegistroDispositivoComponent, { data: this.selectionEmp.selected }).afterClosed().subscribe(result => {
      result.forEach(item => {
         this.dispositivo.push(item.id_dispositivo);
      });

      console.log("id_dispositivos: ", this.dispositivo)
      if (result) {
        this.usuariosService.deleteDispositivoMovil(this.dispositivo).subscribe(res => {
          this.toastr.success('Dispositivos eliminados correctamente');
          this.ObtenerDispositivosRegistrados();
          this.selectionEmp.clear();
          this.habilitar = false;
          this.numero_pagina = 1;
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
      }

    })
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.usersDispositivosRegistrados.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp()?
      this.selectionEmp.clear() :
      this.usersDispositivosRegistrados.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmp(row?: ItableDispositivos): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  IngresarSoloNumeros(evt) {
    return this.validar.IngresarSoloNumeros(evt)
  }

  IngresarSoloLetras(e) {
    return this.validar.IngresarSoloLetras(e);
  }
}
