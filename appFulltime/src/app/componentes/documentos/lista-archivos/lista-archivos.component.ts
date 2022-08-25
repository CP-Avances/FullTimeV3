import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DocumentosService } from 'src/app/servicios/documentos/documentos.service';
import { environment } from '../../../../environments/environment';
import { SubirDocumentoComponent } from '../subir-documento/subir-documento.component';

@Component({
  selector: 'app-lista-archivos',
  templateUrl: './lista-archivos.component.html',
  styleUrls: ['./lista-archivos.component.css']
})
export class ListaArchivosComponent implements OnInit {

  archivos: any = [];
  Dirname: string;
  hipervinculo: string = environment.url
  subir: boolean = false;

  constructor(
    private rest: DocumentosService,
    private route: ActivatedRoute,
    public ventana: MatDialog,
  ) { }

  ngOnInit(): void {
    this.MostrarArchivos();
  }

  MostrarArchivos() {
    this.route.params.subscribe(obj => {
      console.log(obj);
      this.Dirname = obj.filename
      this.ObtenerArchivos(obj.filename)
    })

    if (this.Dirname === 'documentacion') {
      this.subir = true;
    } else {
      this.subir = false;
    }
  }

  ObtenerArchivos(nombre_carpeta) {
    this.rest.ListarArchivosDeCarpeta(nombre_carpeta).subscribe(res => {
      console.log(res);
      this.archivos = res
    })
  }

  DescargarArchivo(filename: string) {
    console.log('llego');
    this.rest.DownloadFile(this.Dirname, filename).subscribe(res => {
      console.log(res);
    })
  }

  EliminarArchivo(filename: string) {
    console.log('llego');
    this.rest.EliminarArchivo(this.Dirname, filename).subscribe(res => {
      console.log(res);
      this.MostrarArchivos();
    })

  }

  AbrirVentanaRegistrar(): void {
    this.ventana.open(SubirDocumentoComponent, { width: '400px' })
      .afterClosed().subscribe(item => {
        this.MostrarArchivos();
      });
  }

}
