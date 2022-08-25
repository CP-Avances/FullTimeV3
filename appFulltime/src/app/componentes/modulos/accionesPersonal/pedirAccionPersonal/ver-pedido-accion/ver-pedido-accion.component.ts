import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
/** IMPORTACIÓN DE SERVICIOS */
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { Router } from '@angular/router';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';
@Component({
  selector: 'app-ver-pedido-accion',
  templateUrl: './ver-pedido-accion.component.html',
  styleUrls: ['./ver-pedido-accion.component.css']
})
export class VerPedidoAccionComponent implements OnInit {

  idPedido: string = '';
  // INICIACIÓN DE VARIABLES 
  idEmpleadoLogueado: any;
  empleados: any = [];
  departamento: any;

  constructor(
    public router: Router,
    public restAccion: AccionPersonalService,
    public restProcesos: ProcesoService,
    public restEmpresa: EmpresaService,
    private toastr: ToastrService,
    public restE: EmpleadoService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idPedido = aux[2];
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    this.CargarInformacion();
  }

  datosPedido: any = [];
  datoEmpleado: string = '';
  datoEmpleadoH: string = '';
  datoEmpleadoG: string = '';
  sueldo: string = '';
  cargo: string = '';
  cargoH: string = '';
  cargoG: string = '';
  departamentoE: string = '';
  cedula: string = '';
  CargarInformacion() {
    this.restAccion.BuscarDatosPedidoId(parseInt(this.idPedido)).subscribe(data => {
      this.datosPedido = data;
      console.log('datos', this.datosPedido);
      this.restAccion.BuscarDatosPedidoEmpleados(this.datosPedido[0].id_empleado).subscribe(data1 => {
        console.log('empleado', data1)
        this.datoEmpleado = data1[0].apellido + ' ' + data1[0].nombre;
        this.sueldo = data1[0].sueldo;
        this.cargo = data1[0].cargo;
        this.departamentoE = data1[0].departamento;
        this.cedula = data1[0].cedula;
        this.restAccion.BuscarDatosPedidoEmpleados(this.datosPedido[0].firma_empl_uno).subscribe(data2 => {
          this.datoEmpleadoH = data2[0].apellido + ' ' + data2[0].nombre;
          this.cargoH = data2[0].cargo;
          this.restAccion.BuscarDatosPedidoEmpleados(this.datosPedido[0].firma_empl_dos).subscribe(data3 => {
            this.datoEmpleadoG = data3[0].apellido + ' ' + data3[0].nombre;
            this.cargoG = data3[0].cargo;
          });
        })
      })
    })
  }

}
