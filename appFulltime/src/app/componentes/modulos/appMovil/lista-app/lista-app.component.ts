import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UpdateEstadoAppComponent } from '../update-estado-app/update-estado-app.component';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
  selector: 'app-lista-app',
  templateUrl: './lista-app.component.html',
  styleUrls: ['./lista-app.component.css']
})

export class ListaAppComponent implements OnInit {

  usersAppMovil_habilitados: any = [];
  usersAppMovil_deshabilitados: any = [];

  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmpDeshab = new SelectionModel<ITableEmpleados>(true, []);


  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';

  filtroCodigodes: number;
  filtroCedulades: '';
  filtroNombredes: '';

  filtronum: boolean;
  filtrolet: boolean;

  ocultar: boolean = false;
  ocultardes: boolean = false;

  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);

  codigodes = new FormControl('');
  cedulades = new FormControl('', [Validators.minLength(2)]);
  nombredes = new FormControl('', [Validators.minLength(2)]);

  // Items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  tamanio_paginades: number = 5;
  numero_paginades: number = 1;

  pageSizeOptions = [5, 10, 20, 50];

  BooleanAppMap: any = { 'true': 'Si', 'false': 'No' };

  get habilitarMovil(): boolean { return this.funciones.app_movil; }

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
      this.ObtenerUsuariosAppMovil();
    }
  }

  // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE LAS TABLAS
  habilitar: boolean = false;
  deshabilitar: boolean = false;
  HabilitarSeleccion_habilitados() {
    if(this.habilitar === false){
      this.habilitar = true;

      if(this.filtroNombre != undefined){
        if(this.filtroNombre.length > 1){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }

      if(this.filtroCodigo != undefined){
        if(this.filtroCodigo > 0){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }

      if(this.filtroCedula != undefined){
        if(this.filtroCedula.length > 1){
          this.ocultar = true;
        }else{
          this.ocultar = false;
        }
      }
      
    }else{
      this.habilitar = false;
      this.ocultar = false;
      this.selectionEmp.clear();
    }
  }

  HabilitarSeleccion_deshabilitados() {
    if(this,this.deshabilitar === false){
      this.deshabilitar = true;

      if(this.filtroNombredes != undefined){
        if(this.filtroNombredes.length > 1){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

      if(this.filtroCodigodes != undefined){
        if(this.filtroCodigodes > 0){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

      if(this.filtroCedulades != undefined){
        if(this.filtroCedulades.length > 1){
          this.ocultardes = true;
        }else{
          this.ocultardes = false;
        }
      }

    }else{
      this.deshabilitar = false;
      this.ocultardes = false;
      this.selectionEmpDeshab.clear();
    }
  }


  ObtenerUsuariosAppMovil() {
    this.usuariosService.getUsersAppMovil().subscribe(res => {
      let usuariosHabilitados = [];
      let usuariosDeshabilitados = [];
      res.forEach(usuario => {
        if(usuario.app_habilita === true){
          usuariosHabilitados.push(usuario);
        }else{
          usuariosDeshabilitados.push(usuario);
        }
      });

      this.usersAppMovil_habilitados = usuariosHabilitados;
      this.usersAppMovil_deshabilitados = usuariosDeshabilitados;
      
    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })
  }

  openDialogUpdateAppMovilHabilitados() {
    this.selectionEmpDeshab.clear();
    this.deshabilitar = false;
    if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
    this.dialog.open(UpdateEstadoAppComponent, { data: this.selectionEmp.selected }).afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.usuariosService.updateUsersAppMovil(result).subscribe(res => {
          console.log(res);
          this.toastr.success(res.message)
          this.ObtenerUsuariosAppMovil();
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

  openDialogUpdateAppMovilDeshabilitados() {
    this.selectionEmp.clear();
    this.habilitar = false;
    if (this.selectionEmpDeshab.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
    this.dialog.open(UpdateEstadoAppComponent, { data: this.selectionEmpDeshab.selected }).afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.usuariosService.updateUsersAppMovil(result).subscribe(res => {
          console.log(res);
          this.toastr.success(res.message)
          this.ObtenerUsuariosAppMovil();
          this.selectionEmpDeshab.clear();
          this.deshabilitar = false;
          this.numero_paginades = 1;
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
      }

    })
  }


  ManejarPaginaHabilitados(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ManejarPaginaDeshabilitados(a: PageEvent) {
    this.tamanio_paginades = a.pageSize;
    this.numero_paginades = a.pageIndex + 1;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmpHabilitados() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.usersAppMovil_habilitados.length;
  }

  isAllSelectedEmpDeshabilitados() {
    const numSelectedDes = this.selectionEmpDeshab.selected.length;
    return numSelectedDes === this.usersAppMovil_deshabilitados.length;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmphabilitado() {
    this.isAllSelectedEmpHabilitados()?
      this.selectionEmp.clear() :
      this.usersAppMovil_habilitados.forEach(row => this.selectionEmp.select(row));
  }

  masterToggleEmpdeshabilitado() {
    this.isAllSelectedEmpDeshabilitados()?
      this.selectionEmpDeshab.clear() :
      this.usersAppMovil_deshabilitados.forEach(row => this.selectionEmpDeshab.select(row));
  }


  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmphabilitados(row?: ITableEmpleados): string {
    
    if (!row) {
      return `${this.isAllSelectedEmpHabilitados() ? 'select' : 'deselect'} all`;
    }
    
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  checkboxLabelEmpdeshabilitados(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmpDeshabilitados() ? 'select' : 'deselect'} all`;
    }
    
    return `${this.selectionEmpDeshab.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  IngresarSoloNumeros(evt) {
    this.filtronum = this.validar.IngresarSoloNumeros(evt)
    return this.filtronum;
  }

  IngresarSoloLetras(e) {
    this.filtrolet = this.validar.IngresarSoloLetras(e);
    return this.filtrolet;
  }


}
