import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';

import { EditarEmpresaComponent } from 'src/app/componentes/catalogos/catEmpresa/editar-empresa/editar-empresa.component';
import { EditarSucursalComponent } from 'src/app/componentes/sucursales/editar-sucursal/editar-sucursal.component';
import { RegistrarSucursalesComponent } from 'src/app/componentes/sucursales/registrar-sucursales/registrar-sucursales.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { ColoresEmpresaComponent } from 'src/app/componentes/catalogos/catEmpresa/colores-empresa/colores-empresa.component';
import { LogosComponent } from 'src/app/componentes/catalogos/catEmpresa/logos/logos.component';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service'
import { KardexService } from 'src/app/servicios/reportes/kardex.service';
import { CorreoEmpresaComponent } from '../correo-empresa/correo-empresa.component';
import { TipoSeguridadComponent } from '../tipo-seguridad/tipo-seguridad.component';

@Component({
  selector: 'app-ver-empresa',
  templateUrl: './ver-empresa.component.html',
  styleUrls: ['./ver-empresa.component.css']
})
export class VerEmpresaComponent implements OnInit {

  idEmpresa: string;
  datosEmpresa: any = [];
  datosSucursales: any = [];
  // items de paginación de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  //imagen
  logo: string;
  imagen_default: boolean = true;
  sinCambios: boolean = true;
  conCambios: boolean = true;
  cambiosTodos: boolean = true;

  constructor(
    public router: Router,
    public vistaRegistrarDatos: MatDialog,
    public rest: EmpresaService,
    public restS: SucursalService,
    private toastr: ToastrService,
    private restK: KardexService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idEmpresa = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosEmpresa();
    this.ObtenerSucursal();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  nombre_establecimiento: any;
  CargarDatosEmpresa() {
    this.datosEmpresa = [];
    this.rest.ConsultarDatosEmpresa(parseInt(this.idEmpresa)).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].establecimiento === null || this.datosEmpresa[0].establecimiento === '' || this.datosEmpresa[0].establecimiento === undefined) {
        this.nombre_establecimiento = 'establecimientos';
      }
      else {
        this.nombre_establecimiento = this.datosEmpresa[0].establecimiento;
      }
      if (this.datosEmpresa[0].logo != null) {
        this.ObtenerLogotipo();
      }
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

  ObtenerLogotipo() {
    this.restK.LogoEmpresaImagenBase64(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) { this.imagen_default = true };
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
      this.imagen_default = false;
    })
  }

  ObtenerSucursal() {
    this.restS.getSucursalesRest().subscribe(data => {
      this.datosSucursales = data;
    });
  }

  /* Ventana para editar datos de dispositivo seleccionado */
  EditarDatosEmpresa(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarEmpresaComponent, { width: '800px', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
          this.ObtenerLogotipo();
          this.CargarDatosEmpresa();
        }
      });
  }

  AbrirVentanaEditarSucursal(datosSeleccionados: any): void {
    console.log(datosSeleccionados);
    this.vistaRegistrarDatos.open(EditarSucursalComponent, { width: '900px', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
        }
      });
  }

  AbrirVentanaRegistrarSucursal() {
    this.vistaRegistrarDatos.open(RegistrarSucursalesComponent, { width: '900px', data: parseInt(this.idEmpresa) })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
        }
      });
  }

  AbrirVentanaReportes(datos_empresa, ventana) {
    this.vistaRegistrarDatos.open(ColoresEmpresaComponent, { width: '350', data: {datos: datos_empresa, ventana: ventana} })
      .afterClosed().subscribe((items: any) => {
        if (items.actualizar === true) {
          this.ObtenerSucursal();
          this.ObtenerLogotipo();
          this.CargarDatosEmpresa();
        }
      });
  }

  EditarLogo() {
    this.vistaRegistrarDatos.open(LogosComponent, { width: '500px', data: parseInt(this.idEmpresa) }).afterClosed()
      .subscribe((res: any) => {
        if (res.actualizar === true) {
          this.ObtenerLogotipo();
        }
        else {
          this.ObtenerLogotipo();
        }
      })
  }

  ConfigurarCorreoElectronico(info_empresa) {
    this.vistaRegistrarDatos.open(CorreoEmpresaComponent, { width: '400px', data: info_empresa }).afterClosed()
      .subscribe(res => {
        console.log(res);

      })

  }

  /** Función para eliminar registro seleccionado */
  Eliminar(id_sucursal: number) {
    //console.log("probando id", id_prov)
    this.restS.EliminarRegistro(id_sucursal).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerSucursal();
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDelete(datos: any) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.Eliminar(datos.id);
        } else {
          this.router.navigate(['/vistaEmpresa/', this.idEmpresa]);
        }
      });
  }

  AbrirVentanaSeguridad(datosSeleccionados) {
    this.vistaRegistrarDatos.open(TipoSeguridadComponent, { width: '300', data: datosSeleccionados })
      .afterClosed().subscribe((items: any) => {
        this.ObtenerSucursal();
        this.ObtenerLogotipo();
        this.CargarDatosEmpresa();
      });
  }

}
