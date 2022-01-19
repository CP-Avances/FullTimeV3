import { Component, OnInit } from '@angular/core';

import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

@Component({
  selector: 'app-autoriza-empleado',
  templateUrl: './autoriza-empleado.component.html',
  styleUrls: ['./autoriza-empleado.component.css']
})
export class AutorizaEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idCargo: any = [];
  cont: number;

  constructor(
    public restCargo: EmplCargosService,
    public restAutoridad: AutorizaDepartamentoService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
  }

  /* 
   * ***************************************************************************************************
   *                               MÉTODO PARA MOSTRAR DATOS
   * ***************************************************************************************************
  */

  /* Método para mostrar datos de autoridad departamentos */
  autorizacionEmpleado: any;
  autorizacionesTotales: any;
  ObtenerAutorizaciones(id_empleado: number) {
    this.autorizacionEmpleado = [];
    this.autorizacionesTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo ", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restAutoridad.BuscarAutoridadCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.autorizacionEmpleado = datos;
          if (this.autorizacionEmpleado.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.autorizacionesTotales = datos
              this.cont++;
            }
            else {
              this.autorizacionesTotales = this.autorizacionesTotales.concat(datos);
              console.log("Datos autorizacion" + i + '', this.autorizacionesTotales)
            }
          }
        })
      }
    });
  }

}
