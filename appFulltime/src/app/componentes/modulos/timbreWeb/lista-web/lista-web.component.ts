import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UpdateEstadoWebComponent } from '../update-estado-web/update-estado-web.component';
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

@Component({
    selector: 'app-lista-web',
    templateUrl: './lista-web.component.html',
    styleUrls: ['./lista-web.component.css']
  })
  export class ListaWebComponent implements OnInit{

    usersAppWeb_habilitados: any = [];
    usersAppWeb_deshabilitados: any = [];

    selectionEmp = new SelectionModel<ITableEmpleados>(true, []);
    selectionEmpDeshab = new SelectionModel<ITableEmpleados>(true, []);


    filtroCodigo: number;
    filtroCedula: '';
    filtroNombre: '';

    filtroCodigodes: number;
    filtroCedulades: '';
    filtroNombredes: '';

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

    get habilitarTimbreWeb(): boolean { return this.funciones.timbre_web; }

    constructor(
        private usuariosService: UsuarioService,
        private toastr: ToastrService,
        private validar: ValidacionesService,
        private dialog: MatDialog,
        private funciones: MainNavService
    ){}

    ngOnInit(): void {

        if (this.habilitarTimbreWeb === false) {
            let mensaje = {
              access: false,
              title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Aplicación Móvil. \n`,
              message: '¿Te gustaría activarlo? Comunícate con nosotros.',
              url: 'www.casapazmino.com.ec'
            }
            return this.validar.RedireccionarHomeAdmin(mensaje);
          }
          else {
            this.ObtenerUsuariosAppWeb();
          }
    }

    ObtenerUsuariosAppWeb() {
        this.usuariosService.getUserTimbreWeb().subscribe(res => {
          let usuariosHabilitados = [];
          let usuariosDeshabilitados = [];
          res.forEach(usuario => {
            if(usuario.web_habilita === true){
              usuariosHabilitados.push(usuario);
            }else{
              usuariosDeshabilitados.push(usuario);
            }
          });
    
          this.usersAppWeb_habilitados = usuariosHabilitados;
          this.usersAppWeb_deshabilitados = usuariosDeshabilitados;
          
        }, err => {
          console.log(err);
          this.toastr.error(err.error.message)
        })
    }

    // METODO PARA ACTIVAR O DESACTIVAR CHECK LIST DE LAS TABLAS
    habilitar: boolean = false;
    deshabilitar: boolean = false;
    HabilitarSeleccion_habilitados() {
        if(this.habilitar === false){
            this.habilitar = true;
        }else{
            this.habilitar = false;
            this.selectionEmp.clear();
        }
    }

    HabilitarSeleccion_deshabilitados() {
        if(this,this.deshabilitar === false){
            this.deshabilitar = true;
        }else{
            this.deshabilitar = false;
            this.selectionEmpDeshab.clear();
        }
    }

    openDialogUpdateAppWeblHabilitados() {
        this.selectionEmpDeshab.clear();
        this.deshabilitar = false;
        if (this.selectionEmp.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
        this.dialog.open(UpdateEstadoWebComponent, { data: this.selectionEmp.selected }).afterClosed().subscribe(result => {
          console.log(result);
          if (result) {
            this.usuariosService.updateUsersTimbreWeb(result).subscribe(res => {
              console.log(res);
              this.toastr.success(res.message)
              this. ObtenerUsuariosAppWeb();
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
    
      openDialogUpdateAppWebDeshabilitados() {
        this.selectionEmp.clear();
        this.habilitar = false;
        if (this.selectionEmpDeshab.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
        this.dialog.open(UpdateEstadoWebComponent, { data: this.selectionEmpDeshab.selected }).afterClosed().subscribe(result => {
          console.log(result);
          if (result) {
            this.usuariosService.updateUsersTimbreWeb(result).subscribe(res => {
              console.log(res);
              this.toastr.success(res.message)
              this. ObtenerUsuariosAppWeb();
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

    /** Si el número de elementos seleccionados coincide con el número total de filas. */
    isAllSelectedEmpHabilitados() {
        const numSelected = this.selectionEmp.selected.length;
        return numSelected === this.usersAppWeb_habilitados.length
    }

    isAllSelectedEmpDeshabilitados() {
        const numSelectedDes = this.selectionEmpDeshab.selected.length;
        return numSelectedDes === this.usersAppWeb_deshabilitados.length
    }

    /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
    masterToggleEmphabilitado() {
        this.isAllSelectedEmpHabilitados()?
        this.selectionEmp.clear() :
        this.usersAppWeb_habilitados.forEach(row => this.selectionEmp.select(row));
    }

    masterToggleEmpdeshabilitado() {
        this.isAllSelectedEmpDeshabilitados()?
        this.selectionEmpDeshab.clear() :
        this.usersAppWeb_deshabilitados.forEach(row => this.selectionEmpDeshab.select(row));
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

    ManejarPaginaHabilitados(e: PageEvent) {
        this.tamanio_pagina = e.pageSize;
        this.numero_pagina = e.pageIndex + 1;
    }
    
    ManejarPaginaDeshabilitados(a: PageEvent) {
        this.tamanio_paginades = a.pageSize;
        this.numero_paginades = a.pageIndex + 1;
    }

    IngresarSoloNumeros(evt) {
        return this.validar.IngresarSoloNumeros(evt)
    }
    
    IngresarSoloLetras(e) {
        return this.validar.IngresarSoloLetras(e);
    }

  }

