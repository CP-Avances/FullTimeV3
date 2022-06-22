// SECCIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

// SECCIÓN DE SERVICICOS
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

// SECCIÓN DE COMPONENTES
import { CorreoEmpresaComponent } from 'src/app/componentes/administracionGeneral/correo/correo-empresa/correo-empresa.component';
import { LogosComponent } from 'src/app/componentes/catalogos/catEmpresa/logos/logos.component';

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})

export class ConfiguracionComponent implements OnInit {

  idEmpresa: string;
  datosEmpresa: any = [];

  // IMAGENES
  cabecera: string;
  pie: string;
  imagen_default_c: boolean = true;
  imagen_default_p: boolean = true;

  constructor(
    public restE: EmpresaService,
    public router: Router,
    public ventana: MatDialog,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idEmpresa = aux[2];
  }

  ngOnInit(): void {
    this.CargarDatosEmpresa();
  }

  CargarDatosEmpresa() {
    this.datosEmpresa = [];
    this.restE.ConsultarDatosEmpresa(parseInt(this.idEmpresa)).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].cabecera_firma != null) {
        this.ObtenerCabeceraCorreo();
      }
      if (this.datosEmpresa[0].pie_firma != null) {
        this.ObtenerPieCorreo();
      }
    });
  }

  ObtenerCabeceraCorreo() {
    this.restE.ObtenerCabeceraCorreo(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) { this.imagen_default_c = true };
      this.cabecera = 'data:image/jpeg;base64,' + res.imagen;
      this.imagen_default_c = false;
    })
  }

  ObtenerPieCorreo() {
    this.restE.ObtenerPieCorreo(this.idEmpresa).subscribe(res => {
      if (res.imagen === 0) { this.imagen_default_p = true };
      this.pie = 'data:image/jpeg;base64,' + res.imagen;
      this.imagen_default_p = false;
    })
  }

  EditarLogo(pagina: String) {
    this.ventana.open(LogosComponent, {
      width: '500px',
      data: { empresa: parseInt(this.idEmpresa), pagina: pagina }
    }).afterClosed()
      .subscribe((res: any) => {
        this.ObtenerCabeceraCorreo();
        this.ObtenerPieCorreo();
      })
  }

  ConfigurarCorreoElectronico(info_empresa) {
    this.ventana.open(CorreoEmpresaComponent, { width: '400px', data: info_empresa }).afterClosed()
      .subscribe(res => {
        this.CargarDatosEmpresa();
      })
  }

}
