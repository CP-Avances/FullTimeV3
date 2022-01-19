import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Router } from '@angular/router';

import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-empl-cargos',
  templateUrl: './empl-cargos.component.html',
  styleUrls: ['./empl-cargos.component.css'],
  //encapsulation: ViewEncapsulation.None
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class EmplCargosComponent implements OnInit {

  habilitarCargo: boolean = false;
  idEmpleado: string;

  departamento: any = [];
  sucursales: any = [];
  empresas: any = [];
  tipoCargo: any = [];

  idEmpleContrato = new FormControl('', [Validators.required]);
  idDepartamento = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idSucursal = new FormControl('', [Validators.required]);
  sueldo = new FormControl('', [Validators.required]);
  horaTrabaja = new FormControl('', [Validators.required]);
  tipoF = new FormControl('');
  cargoF = new FormControl('', [Validators.minLength(3)]);

  public nuevoEmplCargosForm = new FormGroup({
    // idEmplContratoForm: this.idEmpleContrato,
    idDeparForm: this.idDepartamento,
    fecInicioForm: this.fechaInicio,
    fecFinalForm: this.fechaFinal,
    idSucursalForm: this.idSucursal,
    sueldoForm: this.sueldo,
    horaTrabajaForm: this.horaTrabaja,
    cargoForm: this.cargoF,
    tipoForm: this.tipoF
  });

  constructor(
    private restCatDepartamento: DepartamentosService,
    private restEmplCargos: EmplCargosService,
    private restSucursales: SucursalService,
    private restEmpleado: EmpleadoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EmplCargosComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any,
    public router: Router,
  ) {
    this.idEmpleado = datoEmpleado.idEmpleado;
    console.log("idEmpleado ", this.idEmpleado);
  }

  ngOnInit(): void {
    this.limpiarCampos();
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
  }

  BuscarTiposCargos() {
    this.tipoCargo = [];
    this.restEmplCargos.ObtenerTipoCargos().subscribe(datos => {
      this.tipoCargo = datos;
      this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
    })
  }

  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa'));
    this.sucursales = [];
    this.restSucursales.BuscarSucEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('La Empresa seleccionada no tiene Sucursales registradas', '', {
        timeOut: 6000,
      })
    })
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

  limpiarCampos() {
    this.nuevoEmplCargosForm.reset();
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  estilo: any;
  IngresarOtro(form) {
    if (form.tipoForm === undefined) {
      this.nuevoEmplCargosForm.patchValue({
        cargoForm: '',
      });
      this.estilo = { 'visibility': 'visible' }; this.habilitarCargo = true;
      this.toastr.info('Ingresar nombre del nuevo cargo.', 'Etiqueta Cargo a desempeñar activa', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  ValidarDatosRegistro(form) {
    let datosBusqueda = {
      id_contrato: this.datoEmpleado.idContrato,
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      console.log('fecha', response[0].fec_ingreso.split('T')[0], ' ', Date.parse(form.fecInicioForm), Date.parse(response[0].fec_ingreso.split('T')[0]))
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fecInicioForm)) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
          this.insertarEmpleadoCargo(form);
        }
        else {
          this.toastr.info('La fecha de finalización de actividades debe ser posterior a la fecha de inicio de actividades', '', {
            timeOut: 6000,
          })
        }
      }
      else {
        this.toastr.info('La fecha de inicio de actividades no puede ser anterior a la fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
      }
    }, error => { });
  }

  insertarEmpleadoCargo(form) {
    let dataEmpleadoCargo = {
      id_empl_contrato: this.datoEmpleado.idContrato,
      id_departamento: form.idDeparForm,
      fec_inicio: form.fecInicioForm, //"2020-03-26" 
      fec_final: form.fecFinalForm,
      id_sucursal: form.idSucursalForm,
      sueldo: form.sueldoForm,
      hora_trabaja: form.horaTrabajaForm,
      cargo: form.tipoForm
    }
    if (form.tipoForm === undefined) {
      this.IngresarTipoCargo(form, dataEmpleadoCargo);
    }
    else {
      console.log(dataEmpleadoCargo);
      this.restEmplCargos.postEmpleadoCargosRest(dataEmpleadoCargo).subscribe(res => {
        this.toastr.success('Operación Exitosa', 'Cargo del empleado Guardado', {
          timeOut: 6000,
        });
        this.CerrarVentanaRegistroCargo();
      });
    }
  }

  IngresarTipoCargo(form, datos: any) {
    if (form.cargoForm != '') {
      let tipo_cargo = {
        cargo: form.cargoForm
      }
      this.restEmplCargos.CrearTipoCargo(tipo_cargo).subscribe(res => {
        // Buscar id de último cargo ingresado
        this.restEmplCargos.ObtenerUltimoTipoCargos().subscribe(data => {
          // Buscar id de último cargo ingresado
          datos.cargo = data[0].max;
          this.restEmplCargos.postEmpleadoCargosRest(datos).subscribe(res => {
            this.toastr.success('Operación Exitosa', 'Cargo del empleado Guardado', {
              timeOut: 6000,
            });
            this.CerrarVentanaRegistroCargo();
          });
        });
      });
    }
    else {
      this.toastr.info('Ingresar el nuevo cargo a desempeñar', 'Verificar datos', {
        timeOut: 6000,
      });
    }
  }

  CerrarVentanaRegistroCargo() {
    this.limpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

  habilitarSeleccion: boolean = true;
  VerTiposCargos() {
    this.nuevoEmplCargosForm.patchValue({
      cargoForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.habilitarCargo = false;
    this.habilitarSeleccion = true;
  }

}
