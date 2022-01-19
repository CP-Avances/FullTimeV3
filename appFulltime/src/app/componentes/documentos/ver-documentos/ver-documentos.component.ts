import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { EditarDocumentoComponent } from 'src/app/componentes/documentos/editar-documento/editar-documento.component'
import { SubirDocumentoComponent } from 'src/app/componentes/documentos/subir-documento/subir-documento.component'
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-documentos',
  templateUrl: './ver-documentos.component.html',
  styleUrls: ['./ver-documentos.component.css']
})
export class VerDocumentosComponent implements OnInit {

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

  // Array de carpetas
  array_carpetas: any = [];

  hipervinculo: string = environment.url

  constructor(
    private rest: DocumentosService,
    private toastr: ToastrService,
    public router: Router,
    private route: ActivatedRoute,
    public vistaRegistrarDatos: MatDialog,
  ) { }

  ngOnInit(): void {
    this.ObtenerDocumentacion();
    this.ObtenerCarpetas();
  }

  ObtenerCarpetas() {
    this.rest.ListarCarpeta().subscribe(res => {
      this.array_carpetas = res
    })
  }

  AbrirCarpeta(nombre_carpeta: string) {
    this.router.navigate([nombre_carpeta ], { relativeTo: this.route, skipLocationChange: false });
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

  AbrirVentanaEditarDocumento(datosSeleccionados: any): void {
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
  }

    /** Función para eliminar registro seleccionado Planificación*/
    EliminarDocumento(id_detalle: number) {
      this.rest.EliminarRegistro(id_detalle).subscribe(res => {
        this.toastr.error('Registro eliminado','', {
          timeOut: 6000,
        });
        this.ObtenerDocumentacion();
      });
    }
  
    /** Función para confirmar si se elimina o no un registro */
    ConfirmarDelete(datos: any) {
      console.log(datos);
      this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarDocumento(datos.id);
          } else {
            this.router.navigate(['/archivos/']);
          }
        });
    }

}
