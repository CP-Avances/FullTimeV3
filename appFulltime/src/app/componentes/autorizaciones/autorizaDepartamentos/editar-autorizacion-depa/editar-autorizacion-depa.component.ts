import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';

@Component({
  selector: 'app-editar-autorizacion-depa',
  templateUrl: './editar-autorizacion-depa.component.html',
  styleUrls: ['./editar-autorizacion-depa.component.css']
})
export class EditarAutorizacionDepaComponent implements OnInit {

  departamento: any = [];
  sucursales: any = [];
  empleados: any = [];
  idEmpresa: number;

  selec1: boolean = false;
  selec2: boolean = false;

  nombreEmpleadoF = new FormControl('', [Validators.required]);
  idSucursal = new FormControl('', [Validators.required]);
  idDepartamento = new FormControl('', [Validators.required]);
  autorizarF = new FormControl('', [Validators.required]);

  public autorizarDepaForm = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
    idSucursalForm: this.idSucursal,
    idDeparForm: this.idDepartamento,
    autorizarForm: this.autorizarF,
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restAutoriza: AutorizaDepartamentoService,
    private restSucursales: SucursalService,
    private restE: EmpresaService,
    private rest: EmpleadoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarAutorizacionDepaComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) {
    this.idEmpresa = parseInt(localStorage.getItem('empresa'));
  }

  ngOnInit(): void {
    this.BuscarSucursales();
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.CargarDatos();
  }

  // Método para ver la información del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.autorizarDepaForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  BuscarSucursales() {
    this.sucursales = [];
    this.restSucursales.BuscarSucEmpresa(this.idEmpresa).subscribe(datos => {
      this.sucursales = datos;
    });
  }

  ObtenerDepartamentos(form) {
    this.departamento = [];
    let idSucursal = form.idSucursalForm;
    this.restCatDepartamento.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados', '', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.autorizarDepaForm.reset();
  }

  InsertarAutorizacion(form) {
    let autorizarDepar = {
      id_departamento: form.idDeparForm,
      id_empl_cargo: this.datoEmpleado.datosAuto.id_empl_cargo,
      estado: form.autorizarForm,
      id: this.datoEmpleado.datosAuto.id
    }
    console.log(autorizarDepar);
    this.restAutoriza.ActualizarDatos(autorizarDepar).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Autorización actualizada', {
        timeOut: 6000,
      });
      this.CerrarVentanaAutorizar();
      this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    });
  }

  CerrarVentanaAutorizar() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  CargarDatos() {
    this.restSucursales.BuscarSucEmpresa(this.datoEmpleado.datosAuto.id_empresa).subscribe(datos => {
      this.sucursales = datos;
    });
    this.restCatDepartamento.BuscarDepartamentoSucursal(this.datoEmpleado.datosAuto.id_sucursal).subscribe(datos => {
      this.departamento = datos;
    });
    this.autorizarDepaForm.patchValue({
      idSucursalForm: this.datoEmpleado.datosAuto.id_sucursal,
      idDeparForm: this.datoEmpleado.datosAuto.id_departamento,
      autorizarForm: this.datoEmpleado.datosAuto.estado,
    })
    if (this.datoEmpleado.datosAuto.estado === true) {
      this.selec1 = true;
    }
    else {
      this.selec1 = true;
    }
  }

}
