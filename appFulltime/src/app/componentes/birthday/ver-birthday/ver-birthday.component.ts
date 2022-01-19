import { Component, OnInit } from '@angular/core';
import { BirthdayService } from 'src/app/servicios/birthday/birthday.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistrarBirthdayComponent } from '../registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from '../editar-birthday/editar-birthday.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ver-birthday',
  templateUrl: './ver-birthday.component.html',
  styleUrls: ['./ver-birthday.component.css']
})
export class VerBirthdayComponent implements OnInit {

  cumple: any = [];
  HabilitarBtn: boolean = false;
  API_URL: string = environment.url;

  constructor(
    private restB: BirthdayService,
    private vistaPantalla: MatDialog
  ) { }

  ngOnInit(): void {
    this.ObtenerMensajeCumple();
  }

  ObtenerMensajeCumple(){
    let id_empresa = parseInt(localStorage.getItem("empresa"));
    this.restB.ObtenerBirthdayEmpresa(id_empresa).subscribe(res => {
      this.cumple = res;
      console.log(this.cumple);
    }, error => {
      this.HabilitarBtn = true;
    });
  }

  AbrirRegistrarMensaje() {
    this.vistaPantalla.open(RegistrarBirthdayComponent, {width: '500px'}).afterClosed().subscribe(items => {
      console.log(items);
      this.ObtenerMensajeCumple();
    })
  }
  
  EditarMensaje(dataSelect) {
    this.vistaPantalla.open(EditarBirthdayComponent, {width: '500px', data: dataSelect}).afterClosed().subscribe(items => {
      console.log(items);
      this.ObtenerMensajeCumple();
    })
  }
  

}
