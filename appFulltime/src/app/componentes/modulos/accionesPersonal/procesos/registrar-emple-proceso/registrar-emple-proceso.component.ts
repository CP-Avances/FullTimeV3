import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';

@Component({
  selector: 'app-registrar-emple-proceso',
  templateUrl: './registrar-emple-proceso.component.html',
  styleUrls: ['./registrar-emple-proceso.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class RegistrarEmpleProcesoComponent implements OnInit {

  empleados: any = [];
  procesos: any = [];

  nombreEmpleado = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idProcesoF = new FormControl('', Validators.required);

  public EmpleProcesoForm = new FormGroup({
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    nombreEmpleadoForm: this.nombreEmpleado,
    idProcesoForm: this.idProcesoF
  });

  constructor(
    private rest: EmpleadoService,
    private restP: EmpleadoProcesosService,
    private restPro: ProcesoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistrarEmpleProcesoComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    this.ObtenerEmpleados(this.datoEmpleado.idEmpleado);
    this.ObtenerProcesos();
  }

  // metodo para ver la informacion del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.EmpleProcesoForm.patchValue({
        nombreEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  ObtenerProcesos() {
    this.procesos = [];
    this.restPro.getProcesosRest().subscribe(data => {
      this.procesos = data;
    });
  }

  ValidarDatosProeso(form) {
    if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
      this.InsertarProceso(form);
    }
    else {
      this.toastr.info('La fecha de finalización debe ser mayor a la fecha de inicio','', {
        timeOut: 6000,
      })
    }
  }

  InsertarProceso(form) {
    let datosProceso = {
      id_empl_cargo: this.datoEmpleado.idCargo,
      fec_inicio: form.fecInicioForm,
      fec_final: form.fecFinalForm,
      id: form.idProcesoForm
    };
    this.restP.RegistrarEmpleProcesos(datosProceso).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Período de Procesos del Empleado registrados', {
        timeOut: 6000,
      })
      this.CerrarVentanaRegistroProceso();
    }, error => {
      this.toastr.error('Operación Fallida', 'Registro Inválido', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.EmpleProcesoForm.reset();
  }

  CerrarVentanaRegistroProceso() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

}
