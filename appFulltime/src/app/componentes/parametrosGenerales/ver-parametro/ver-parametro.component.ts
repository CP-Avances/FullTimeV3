// SECCIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
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
  carga: boolean = false;
  kardex: boolean = false;
  laboral_calendario: boolean = false;

  ingreso: number = 0;

  constructor(
    private toastr: ToastrService,
    public parametro: ParametrosService,
    public ventana: MatDialog,
    public router: Router,
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
    if (this.idParametro === '27') {
      this.formato = false;
      this.carga = true;
    }
    if (this.idParametro === '28') {
      this.formato = false;
      this.kardex = true;
    }
    if (this.idParametro === '31') {
      this.formato = false;
      this.laboral_calendario = true;
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
    this.parametro.ListarUnParametro(id).subscribe(data => {
      this.parametros = data;
    })
  }

  id_detalle: number;
  // MÉTODO PARA BUSCAR DETALLES DE PARAMÉTRO GENERAL
  ListarDetalles(id: any) {
    this.datosDetalle = [];
    this.parametro.ListarDetalleParametros(id).subscribe(datos => {
      this.datosDetalle = datos;
      if (this.ingreso === 0) {
        this.seleccion = this.datosDetalle[0].descripcion;
        this.opcion_kardex = this.datosDetalle[0].descripcion;
        this.opcion_laboral = this.datosDetalle[0].descripcion;
      }
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
    this.parametro.EliminarDetalleParametro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.LimpiarSeleccion();
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
   ** **        REGISTRAR O EDITAR DETALLE DE PARAMETRO FORMATO DE FECHA Y HORA                ** ** 
   ** ******************************************************************************************* **/

  GuardarDatos(seleccion: number) {
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

    this.RegistrarValores(formato);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** ** 
   ** ******************************************************************************************* **/

  seleccion: any;
  SelecionarCarga(event: MatRadioChange) {
    this.seleccion = event.value;
    console.log('seleccion ... ', this.seleccion)
    this.RegistrarValores(this.seleccion);
  }


  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO CARGA DE VACACIONES                 ** ** 
   ** ******************************************************************************************* **/

  opcion_kardex: any;
  SelecionarDescarga(event: MatRadioChange) {
    this.opcion_kardex = event.value;
    console.log('seleccion ... ', this.opcion_kardex)
    this.RegistrarValores(this.opcion_kardex);
  }

  /** ******************************************************************************************* **
   ** **           REGISTRAR O EDITAR DETALLE DE PARAMETRO LABORAL - CALENDARIO                ** ** 
   ** ******************************************************************************************* **/

  opcion_laboral: any;
  SelecionarLaboral(event: MatRadioChange) {
    this.opcion_laboral = event.value;
    console.log('seleccion ... ', this.opcion_laboral)
    this.RegistrarValores(this.opcion_laboral);
  }


  /** ******************************************************************************************* **
   ** **                   ALMACENAMIENTO DE PARAMETROS EN BASE DE DATOS                       ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA REGISTRAR DETALLES 
  RegistrarValores(detalle: string) {
    this.ingreso = 1;
    this.parametro.ListarDetalleParametros(parseInt(this.idParametro)).subscribe(datos => {
      this.ActualizarDetalle(datos[0].id_detalle, detalle);
    }, vacio => {
      this.CrearDetalle(detalle);
    })
  }

  // MÉTODO PARA REGISTRAR NUEVO PARÁMETRO
  CrearDetalle(detalle: string) {
    let datos = {
      id_tipo: this.idParametro,
      descripcion: detalle
    };
    this.parametro.IngresarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // METODO PARA ACTUALIZAR DETALLE DEL PARAMETRO
  ActualizarDetalle(id_detalle: number, detalle: string) {
    let datos = {
      id: id_detalle,
      descripcion: detalle
    };
    this.parametro.ActualizarDetalleParametro(datos).subscribe(response => {
      this.toastr.success('Detalle registrado exitosamente.',
        '', {
        timeOut: 2000,
      })
      this.LeerDatos();
    });
  }

  // MOSTRAR DATOS DE PARAMETROS Y DETALLES
  LeerDatos() {
    this.BuscarParametros(this.idParametro);
    this.ListarDetalles(this.idParametro);
  }

  // LIMPIAR OPCIONES DE SELECCION
  LimpiarSeleccion() {
    this.seleccion = '';
    this.opcion_kardex = '';
    this.opcion_laboral = '';
  }

}
