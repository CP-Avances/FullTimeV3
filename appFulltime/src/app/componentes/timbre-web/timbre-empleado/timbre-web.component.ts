// IMPORTAR LIBRERIAS
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

// IMPORTAR SERVICIOS
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// IMPORTAR COMPONENTES
import { RegistrarTimbreComponent } from '../registrar-timbre/registrar-timbre.component';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

@Component({
  selector: 'app-timbre-web',
  templateUrl: './timbre-web.component.html',
  styleUrls: ['./timbre-web.component.css']
})

export class TimbreWebComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  timbres: any = [];
  cuenta: any = [];
  info: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // VARIABLES DE ALMACENAMIENTO DE TABLAS
  dataSource: any;
  filtroFechaTimbre = '';
  idEmpleado: number;

  constructor(
    private restTimbres: TimbresService, // SERVICIOS DATOS TIMBRES
    private ventana: MatDialog, // VARIABLE USADA PARA NAVEGACIÓN ENTRE VENTANAS
    private validar: ValidacionesService, // VALIDACIONES DE SERVICIOS
    private toastr: ToastrService, // VARIABLE USADA PARA NOTIFICACIONES
    public parametro: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.BuscarParametro();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha)
      },
      vacio => {
        this.BuscarHora(this.formato_fecha)
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ObtenerListaTimbres(fecha, this.formato_hora);
      },
      vacio => {
        this.ObtenerListaTimbres(fecha, this.formato_hora);
      });
  }

  // METODO DE MANEJO DE PÁGINAS DE LA TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // METODO PARA MOSTRAR DATOS DE TIMBRES
  ObtenerListaTimbres(formato_fecha: string, formato_hora: string) {
    this.restTimbres.ObtenerTimbres().subscribe(res => {
      this.dataSource = new MatTableDataSource(res.timbres);
      this.timbres = this.dataSource.data;
      this.cuenta = res.cuenta;
      this.info = res.info;

      this.timbres.forEach(data => {
        data.fecha = this.validar.FormatearFecha(data.fec_hora_timbre, formato_fecha, this.validar.dia_abreviado);
        data.hora = this.validar.FormatearHora(data.fec_hora_timbre.split(' ')[1], formato_hora);
      })

    }, err => {
      this.toastr.error(err.error.message)
    })
  }

  // METODO PARA REGISTRAR TIMBRES
  AbrirRegistrarTimbre() {
    this.ventana.open(RegistrarTimbreComponent, { width: '500px' }).afterClosed().subscribe(data => {
      //console.log('ver datos de timbres --------------------------', data)

      if (data !== undefined) {
        if (!data.close) {
          this.restTimbres.PostTimbreWeb(data).subscribe(res => {
            // METODO PARA AUDITAR TIMBRES
            data.id_empleado = this.idEmpleado;
            this.validar.Auditar('app-web', 'timbres', '', data, 'INSERT');
            this.BuscarParametro();
            this.toastr.success(res.message)
          }, err => {
            this.toastr.error(err.message)
          })
        }
      }
    })
  }

  // METODO PARA REALIZAR FILTROS DE BUSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroFechaTimbre = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // METODO PARA ABRIR PÁGINA GOOGLE MAPAS
  abrirMapa(latitud, longitud) {
    if (!latitud || !longitud) return this.toastr.warning('Timbre seleccionado no posee registro de coordenadas de ubicación.')
    const rutaMapa = "https://www.google.com/maps/search/+" + latitud + "+" + longitud;
    window.open(rutaMapa);
  }
}
