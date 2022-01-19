import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsComponent } from "src/app/componentes/settings/settings.component";
import { AccionesTimbresComponent } from 'src/app/componentes/settings/acciones-timbres/acciones-timbres.component';
import { AyudaComponent } from '../../ayuda/ayuda.component';
import { LoginService } from '../../../servicios/login/login.service';

@Component({
  selector: 'app-button-opciones',
  templateUrl: './button-opciones.component.html',
  styleUrls: ['../main-nav.component.css']
})
export class ButtonOpcionesComponent implements OnInit {

  constructor(
    public vistaFlotante: MatDialog,
    public loginService: LoginService,
  ) { }

  ngOnInit(): void {
  }

  AbrirSettings() {
    const id_empleado = parseInt(localStorage.getItem('empleado'));
    this.vistaFlotante.open(SettingsComponent, { width: '350px', data: { id_empleado } });
  }

  AbrirAccionesTimbres() {
    const id_empresa = parseInt(localStorage.getItem('empresa'));
    this.vistaFlotante.open(AccionesTimbresComponent, { width: '350px', data: { id_empresa } });
  }

  AbrirVentanaAyuda() {
    this.vistaFlotante.open(AyudaComponent, { width: '500px' })
  }

}
