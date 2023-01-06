import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { RegistrarSucursalesComponent } from 'src/app/componentes/catalogos/catSucursal/registrar-sucursales/registrar-sucursales.component';
import { EditarSucursalComponent } from 'src/app/componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { ColoresEmpresaComponent } from 'src/app/componentes/catalogos/catEmpresa/colores-empresa/colores-empresa.component';
import { TipoSeguridadComponent } from '../tipo-seguridad/tipo-seguridad.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { LogosComponent } from 'src/app/componentes/catalogos/catEmpresa/logos/logos.component';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service'

@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrls: ['./ver-empresa.component.css']
})
export class VerEmpresaComponent implements OnInit {

  idEmpresa: string;
  datosEmpresa: any = [];
  datosSucursales: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  //IMAGEN
  logo: string;
  imagen_default: boolean = true;
  sinCambios: boolean = true;
  conCambios: boolean = true;
  cambiosTodos: boolean = true;

  constructor(
    public ventana: MatDialog,
    public empresa: EmpresaService,
    public router: Router,
    public restS: SucursalService,
    private toastr: ToastrService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idEmpresa = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosEmpresa();
    this.ObtenerSucursal();
  }

  // METODO DE CONTROL DE PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // CARGAR DATOS DE EMPRESA EN FORMULARIO
  nombre_establecimiento: any;
  CargarDatosEmpresa() {
    this.datosEmpresa = [];
    this.empresa.ConsultarDatosEmpresa(parseInt(this.idEmpresa)).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].establecimiento === null || this.datosEmpresa[0].establecimiento === '' || this.datosEmpresa[0].establecimiento === undefined) {
        this.nombre_establecimiento = 'establecimientos';
      }
      else {
        this.nombre_establecimiento = this.datosEmpresa[0].establecimiento;
      }

      this.ObtenerLogotipo();

      if (this.datosEmpresa[0].cambios === true) {
        if (this.datosEmpresa[0].dias_cambio === 0) {
          this.cambiosTodos = false;
          this.conCambios = true;
          this.sinCambios = true;
        }
        else {
          this.conCambios = false;
          this.sinCambios = true;
          this.cambiosTodos = true;
        }
      }
      else {
        this.sinCambios = false;
        this.conCambios = true;
        this.cambiosTodos = true;
      }
    });
  }

  // METODO PARA OBTENER LOGOTIPO DE EMPRESA
  ObtenerLogotipo() {
    this.empresa.LogoEmpresaImagenBase64(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) {
        this.imagen_default = true
      }
      else {
        this.imagen_default = false;
        this.logo = 'data:image/jpeg;base64,' + res.imagen;
      }
    })
  }

  // METODO PARA MOSTRAR LISTA DE SUCURSALES
  ObtenerSucursal() {
    this.restS.BuscarSucursal().subscribe(data => {
      this.datosSucursales = data;
    });
  }

  // VENTANA PARA EDITAR DATOS DE EMPRESA 
  EditarDatosEmpresa(): void {
    this.router.navigate(['/informacionEmpresa', this.idEmpresa])
  }

  // VENTANA DE EDICION DE ESTABLECIMIENTOS
  AbrirVentanaEditarSucursal(datosSeleccionados: any): void {
    this.ventana.open(EditarSucursalComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
        }
      });
  }

  // VENTANA DE REGISTRO DE ESTABLECIMIENTO
  AbrirVentanaRegistrarSucursal() {
    this.ventana.open(RegistrarSucursalesComponent,
      { width: '900px', data: parseInt(this.idEmpresa) })
      .afterClosed().subscribe((items: any) => {
        this.ObtenerSucursal();
      });
  }

  // VENTANA PARA REVISAR FORMATO DE REPORTES COLORES
  AbrirVentanaReportes(datos_empresa: any, ventana: any) {
    this.ventana.open(ColoresEmpresaComponent, {
      width: '700',
      data: { datos: datos_empresa, ventana: ventana }
    })
      .afterClosed().subscribe((items: any) => {
        if (items) {
          if (items.actualizar === true) {
            this.CargarDatosEmpresa();
          }
        }
      });
  }

  // METODO PARA EDITAR LOGO DE EMPRESA
  EditarLogo() {
    this.ventana.open(LogosComponent, {
      width: '500px',
      data: { empresa: parseInt(this.idEmpresa), pagina: 'empresa' }
    }).afterClosed()
      .subscribe((res: any) => {
        this.ObtenerLogotipo();
      })
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO 
  Eliminar(id_sucursal: number) {
    this.restS.EliminarRegistro(id_sucursal).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerSucursal();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/vistaEmpresa/', this.idEmpresa]);
        }
      });
  }

  // VENTANA DE REGISTRO DE FRASE DE SEGURIDAD
  AbrirVentanaSeguridad(datosSeleccionados: any) {
    this.ventana.open(TipoSeguridadComponent, { width: '500', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        if (items) {
          if (items === true) {
            this.CargarDatosEmpresa();
          }
        }
      });
  }

}
