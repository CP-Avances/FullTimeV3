import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { EditarSucursalComponent } from 'src/app/componentes/sucursales/editar-sucursal/editar-sucursal.component';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service'
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { RegistroDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { EditarDepartamentoComponent } from 'src/app/componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';

@Component({
  selector: 'app-ver-sucursal',
  templateUrl: './ver-sucursal.component.html',
  styleUrls: ['./ver-sucursal.component.css']
})
export class VerSucursalComponent implements OnInit {

  idSucursal: string;
  datosSucursal: any = [];
  datosDepartamentos: any = [];
  // items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: SucursalService,
    public restD: DepartamentosService,
    private toastr: ToastrService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idSucursal = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosSucursal();
    this.ListaDepartamentos();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  CargarDatosSucursal() {
    this.datosSucursal = [];
    this.rest.getOneSucursalRest(parseInt(this.idSucursal)).subscribe(datos => {
      this.datosSucursal = datos;
    })
  }

  ListaDepartamentos() {
    this.datosDepartamentos = []
    this.restD.BuscarDepaSucursal(parseInt(this.idSucursal)).subscribe(datos => {
      this.datosDepartamentos = datos;
      console.log(this.datosDepartamentos);
    })
  }

  /* Ventana para editar datos de dispositivo seleccionado */
  EditarDatosSucursal(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarSucursalComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe(item => {
        this.CargarDatosSucursal();
      });
  }

  AbrirVentanaEditarDepartamento(departamento: any): void {
    this.vistaRegistrarDatos.open(EditarDepartamentoComponent,
      { width: '600px', data: departamento }).afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  AbrirVentanaRegistrarDepartamento(): void {
    this.vistaRegistrarDatos.open(RegistroDepartamentoComponent, { width: '350px', data: parseInt(this.idSucursal) }).
      afterClosed().subscribe(item => {
        this.ListaDepartamentos();
      });
  }

  /** Función para eliminar registro seleccionado */
  Eliminar(id_dep: number) {
    //console.log("probando id", id_prov)
    this.rest.EliminarRegistro(id_dep).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ListaDepartamentos();
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/vistaSucursales/', this.idSucursal]);
        }
      });
  }

}
