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

@Component({
  selector: 'app-lista-app',
  templateUrl: './lista-app.component.html',
  styleUrls: ['./lista-app.component.css']
})
export class ListaAppComponent implements OnInit {

  usersAppMovil: any = [];

  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

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

  constructor(
    private usuariosService: UsuarioService,
    private toastr: ToastrService,
    private validacionesService: ValidacionesService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.ObtenerUsuariosAppMovil()
  }

  // MÉTODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE TABLA

  habilitar: boolean = false;
  HabilitarSeleccion() {
    if (this.habilitar === false) {
      this.habilitar = true;
    } else if (this.habilitar === true) {
      this.habilitar = false;
    }
  }

  ObtenerUsuariosAppMovil() {
    this.usuariosService.getUsersAppMovil().subscribe(res => {
      // console.log(res);
      this.usersAppMovil = res
    }, err => {
      console.log(err);
      this.toastr.error(err.error.message)
    })
  }

  openDialogUpdateAppMovil() {
    if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')

    this.dialog.open(UpdateEstadoAppComponent, { data: this.selectionEmp.selected }).afterClosed().subscribe(result => {
      console.log(result);
      if (result) {
        this.usuariosService.updateUsersAppMovil(result).subscribe(res => {
          console.log(res);
          this.toastr.success(res.message)
          this.ObtenerUsuariosAppMovil();
          this.selectionEmp.clear();
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
      }

    })

  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.usersAppMovil.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.usersAppMovil.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  IngresarSoloNumeros(evt) {
    return this.validacionesService.IngresarSoloNumeros(evt)
  }

  IngresarSoloLetras(e) {
    return this.validacionesService.IngresarSoloLetras(e);
  }


}
