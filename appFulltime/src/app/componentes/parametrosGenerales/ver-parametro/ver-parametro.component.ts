// SECCIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

// SECCIÓN DE SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarParametroComponent } from '../editar-parametro/editar-parametro.component';
import { CrearDetalleParametroComponent } from '../crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from '../editar-detalle-parametro/editar-detalle-parametro.component';

@Component({
  selector: 'app-ver-parametro',
  templateUrl: './ver-parametro.component.html',
  styleUrls: ['./ver-parametro.component.css']
})

export class VerParametroComponent implements OnInit {

  parametros: any = [];
  idParametro: string;
  datosDetalle: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ACTIVADORES
  formato: boolean = true;
  formato_fecha: boolean = false;
  formato_hora: boolean = false;

  constructor(
    private toastr: ToastrService,
    public restP: ParametrosService,
    public router: Router,
    public ventana: MatDialog,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idParametro = aux[3];
  }

  ngOnInit(): void {
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
    this.ActivarBoton();
  }

  ActivarBoton() {
    if (this.idParametro === '25') {
      this.formato = false;
      this.formato_fecha = true;
    }
    if (this.idParametro === '26') {
      this.formato = false;
      this.formato_hora = true;
    }

  }

  // MÉTODO PARA MANEJAR PAGINACIÓN DE TABLAS
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1
    this.tamanio_pagina = e.pageSize;
  }

  // MÉTODO PARA BUSCAR DATOS TIPO PARÁMETRO
  BuscarParametros(id: any) {
    this.parametros = [];
    this.restP.ListarUnParametro(id).subscribe(data => {
      this.parametros = data;
    })
  }

  id_detalle: number;
  // MÉTODO PARA BUSCAR DETALLES DE PARAMÉTRO GENERAL
  ListarDetalles(id: any) {
    this.datosDetalle = [];
    this.restP.ListarDetalleParametros(id).subscribe(datos => {
      this.datosDetalle = datos;
    })
  }

  // MÉTODO PARA INGRESAR DETALLE DE PARÁMETRO
  AbrirVentanaDetalles(datos: any): void {
    this.ventana.open(CrearDetalleParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // MÉTODO PARA EDITAR PARÁMETRO
  AbrirVentanaEditar(datos: any): void {
    this.ventana.open(EditarParametroComponent,
      { width: '400px', data: { parametros: datos, actualizar: true } })
      .afterClosed().subscribe(result => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // MÉTODO PARA EDITAR DETALLE DE PARÁMETRO
  AbrirVentanaEditarDetalle(datos: any): void {
    this.ventana.open(EditarDetalleParametroComponent,
      { width: '600px', data: { parametros: datos } }).
      afterClosed().subscribe(item => {
        this.BuscarParametros(this.idParametro);
        this.ListarDetalles(this.idParametro);
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarDetalle(id_detalle: number) {
    this.restP.EliminarDetalleParametro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.BuscarParametros(this.idParametro);
      this.ListarDetalles(this.idParametro);
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id_detalle);
        } else {
          this.router.navigate(['/mostrar/parametros/', this.idParametro]);
        }
      });
  }

  /** ******************************************************************************************* **
   ** **             REGISTRAR O EDITAR DETALLE DE PARAMETRO FORMATO DE FECHA                  ** ** 
   ** ******************************************************************************************* **/

  GuardarDatos(seleccion: number, tipo: string) {
    let formato = '';
    if (seleccion === 1) {
      formato = 'DD/MM/YYYY';
    }
    else if (seleccion === 2) {
      formato = 'MM/DD/YYYY';
    }
    else if (seleccion === 3) {
      formato = 'YYYY-MM-DD';
    }
    else if (seleccion === 4) {
      formato = 'hh:mm:ss A';
    }
    else if (seleccion === 5) {
      formato = 'HH:mm:ss';
    }

    this.restP.ListarDetalleParametros(parseInt(this.idParametro)).subscribe(datos => {
      this.ActualizarDetalle(datos[0].id_detalle, formato, tipo);
    }, vacio => {
      this.CrearDetalle(formato, tipo);
    })

  }

  // MÉTODO PARA REGISTRAR NUEVO PARÁMETRO
  CrearDetalle(formato: string, tipo: string) {
    let datos = {
      id_tipo: this.idParametro,
      descripcion: formato
    };
    this.restP.IngresarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerFormato(formato, tipo);
    });
  }

  ActualizarDetalle(id_detalle: number, formato: string, tipo: string) {
    let datos = {
      id: id_detalle,
      descripcion: formato
    };
    this.restP.ActualizarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerFormato(formato, tipo);
    });
  }

  LeerFormato(tipo: string, formato: string) {
    if (tipo === 'fecha') {
      localStorage.removeItem('fechas');
      localStorage.setItem('fechas', formato);
      this.BuscarParametros(this.idParametro);
      this.ListarDetalles(this.idParametro);
    }
    else {
      localStorage.removeItem('horas');
      localStorage.setItem('horas', formato);
      this.BuscarParametros(this.idParametro);
      this.ListarDetalles(this.idParametro);
    }
  }

}
