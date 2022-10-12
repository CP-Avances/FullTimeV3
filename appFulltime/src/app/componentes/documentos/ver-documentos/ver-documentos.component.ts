import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';

import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-documentos',
  templateUrl: './ver-documentos.component.html',
  styleUrls: ['./ver-documentos.component.css']
})
export class VerDocumentosComponent implements OnInit {

  // ARRAY DE CARPETAS
  array_carpetas: any = [];

  constructor(
    private rest: DocumentosService,
    private route: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.ObtenerCarpetas();
  }

  ObtenerCarpetas() {
    this.rest.ListarCarpeta().subscribe(res => {
      this.array_carpetas = res
    })
  }

  AbrirCarpeta(nombre_carpeta: string) {
    this.router.navigate([nombre_carpeta], { relativeTo: this.route, skipLocationChange: false });
  }

}
