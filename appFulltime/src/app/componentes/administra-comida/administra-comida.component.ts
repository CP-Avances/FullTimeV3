import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-administra-comida',
  templateUrl: './administra-comida.component.html',
  styleUrls: ['./administra-comida.component.css']
})
export class AdministraComidaComponent implements OnInit {

  empleados: any = [];
  selec1: boolean = false;
  selec2: boolean = false;

  nombreEmpleadoF = new FormControl('', [Validators.required]);
  comidaF = new FormControl('', Validators.required);

  public adminComidaForm = new FormGroup({
    nombreEmpleadoForm: this.nombreEmpleadoF,
    comidaForm: this.comidaF,
  });

  constructor(
    private rest: EmpleadoService,
    private restU: UsuarioService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<AdministraComidaComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.MostrarDatos();
  }

  // Método para ver la información del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.adminComidaForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  usuario: any = [];
  MostrarDatos() {
    this.usuario = [];
    this.restU.BuscarDatosUser(this.datoEmpleado.idEmpleado).subscribe(datos => {
      this.usuario = datos;
      this.adminComidaForm.patchValue({
        comidaForm: this.usuario[0].admin_comida
      })
      if (this.usuario[0].admin_comida === true) {
        this.selec1 = true;
      }
      else {
        this.selec2 = true;
      }
    });
  }

  LimpiarCampos() {
    this.adminComidaForm.reset();
  }

  InsertarAutorizacion(form) {
    let administraComida = {
      admin_comida: form.comidaForm,
      id_empleado: this.datoEmpleado.idEmpleado
    }
    this.restU.RegistrarAdminComida(administraComida).subscribe(res => {
      this.toastr.success('Operación Exitosa', '', {
        timeOut: 6000,
      });
      this.CerrarVentanaAutorizar();
    });
  }

  CerrarVentanaAutorizar() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }
}


