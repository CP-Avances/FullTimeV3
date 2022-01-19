import { Route } from '@angular/compiler/src/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-lista-archivos',
  templateUrl: './lista-archivos.component.html',
  styleUrls: ['./lista-archivos.component.css']
})
export class ListaArchivosComponent implements OnInit {

  archivos: any = [];
  Dirname: string;
  hipervinculo: string = environment.url

  constructor(
    private rest: DocumentosService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(obj => {
      console.log(obj);
      this.Dirname = obj.filename
      this.ObtenerArchivos(obj.filename)
    })
  }

  ObtenerArchivos(nombre_carpeta) {
    this.rest.ListarArchivosDeCarpeta(nombre_carpeta).subscribe(res => {
      console.log(res);
      this.archivos = res
    })
  }

  DescargarArchivo(filename: string) {
    console.log('llego');
    
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res=>{
      console.log(res);
      
    })
  }

}
