import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { EditarDocumentoComponent } from 'src/app/componentes/documentos/editar-documento/editar-documento.component'
import { SubirDocumentoComponent } from 'src/app/componentes/documentos/subir-documento/subir-documento.component'
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-documentacion',
  templateUrl: './ver-documentacion.component.html',
  styleUrls: ['./ver-documentacion.component.css']
})
export class VerDocumentacionComponent implements OnInit {

  // Almacenamiento de datos y búsqueda
  listaDocumentos: any = [];

  // filtros
  filtroNombreDocumento = '';

  // Control de campos y validaciones del formulario
  nombreDocF = new FormControl('', [Validators.minLength(2)]);

  // Asignación de validaciones a inputs del formulario
  public buscarDocumentoForm = new FormGroup({
    nombreDocForm: this.nombreDocF,
  });


  // items de paginacion de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url

  constructor(
    private rest: DocumentosService,
    private toastr: ToastrService,
    public vistaRegistrarDatos: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ObtenerDocumentacion();
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  ObtenerDocumentacion() {
    this.listaDocumentos = [];
    this.rest.ListarArchivos().subscribe(datos => {
      this.listaDocumentos = datos;
    })
  }

  LimpiarCampos() {
    this.buscarDocumentoForm.setValue({
      nombreDocForm: '',
    });
    this.ObtenerDocumentacion();
  }

  /*  AbrirVentanaEditarDocumento(datosSeleccionados: any): void {
      this.vistaRegistrarDatos.open(EditarDocumentoComponent, { width: '400px', data: { datosDocumento: datosSeleccionados, actualizar: false } })
        .afterClosed().subscribe(item => {
          this.ObtenerDocumentacion();
        });
    }
  
    AbrirVentanaRegistrar(): void {
      this.vistaRegistrarDatos.open(SubirDocumentoComponent, { width: '400px' })
        .afterClosed().subscribe(item => {
          this.ObtenerDocumentacion();
        });
    }*/
}
