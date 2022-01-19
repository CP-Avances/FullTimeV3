import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { ToastrService } from 'ngx-toastr';
import { VerEmpleadoComponent } from '../../ver-empleado/ver-empleado.component';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';

@Component({
  selector: 'app-editar-cargo',
  templateUrl: './editar-cargo.component.html',
  styleUrls: ['./editar-cargo.component.css']
})
export class EditarCargoComponent implements OnInit {

  @Input() idSelectCargo: number;
  @Input() idEmploy: string;

  cargo: any = [];
  departamento: any = [];
  sucursales: any = [];
  empresas: any = [];

  idDepartamento = new FormControl('', [Validators.required]);
  fechaInicio = new FormControl('', Validators.required);
  fechaFinal = new FormControl('', Validators.required);
  idSucursal = new FormControl('', [Validators.required]);
  sueldo = new FormControl('', [Validators.required]);
  horaTrabaja = new FormControl('', [Validators.required]);
  tipoF = new FormControl('');
  cargoF = new FormControl('', [Validators.minLength(3)]);

  public nuevoEmplCargosForm = new FormGroup({
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
    private verEmpleado: VerEmpleadoComponent,
  ) { }

  ngOnInit(): void {
    this.obtenerCargoEmpleado();
    this.FiltrarSucursales();
    this.BuscarTiposCargos();
    this.tipoCargo[this.tipoCargo.length] = { cargo: "OTRO" };
  }

  id_empl_contrato: number;
  obtenerCargoEmpleado() {
    this.restEmplCargos.getUnCargoRest(this.idSelectCargo).subscribe(res => {
      this.cargo = res;
      this.id_empl_contrato = this.cargo[0].id_empl_contrato;
      this.cargo.forEach(obj => {
        this.ObtenerDepartamentosSet(obj.id_sucursal);
        console.log(obj);
        this.nuevoEmplCargosForm.patchValue({
          idDeparForm: obj.id_departamento,
          fecInicioForm: obj.fec_inicio,
          fecFinalForm: obj.fec_final,
          idSucursalForm: obj.id_sucursal,
          sueldoForm: obj.sueldo.split('.')[0],
          horaTrabajaForm: obj.hora_trabaja,
          tipoForm: obj.cargo
        })
      });
    })
  }

  tipoCargo: any = [];
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

  FiltrarSucursalesSet(id: number) {
    this.sucursales = [];
    this.restSucursales.BuscarSucEmpresa(id).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('La Empresa seleccionada no tiene Sucursales registradas', '', {
        timeOut: 6000,
      })
    })
  }

  ObtenerDepartamentosSet(id: number) {
    this.departamento = [];
    this.restCatDepartamento.BuscarDepartamentoSucursal(id).subscribe(datos => {
      this.departamento = datos;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados', '', {
        timeOut: 6000,
      })
    });
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

  ValidarDatosRegistro(form) {
    console.log('id contrato', this.cargo[0].id_empl_contrato);
    let datosBusqueda = {
      id_contrato: this.id_empl_contrato
    }
    this.restEmpleado.BuscarFechaIdContrato(datosBusqueda).subscribe(response => {
      console.log('fecha', response[0].fec_ingreso.split('T')[0], ' ', Date.parse(form.fecInicioForm), Date.parse(response[0].fec_ingreso.split('T')[0]))
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fecInicioForm)) {
        if (Date.parse(form.fecInicioForm) < Date.parse(form.fecFinalForm)) {
          this.ActualizarEmpleadoCargo(form);
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

  ActualizarEmpleadoCargo(form) {
    let dataEmpleadoCargo = {
      id_departamento: form.idDeparForm,
      fec_inicio: form.fecInicioForm,
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
      this.restEmplCargos.ActualizarContratoEmpleado(this.idSelectCargo, this.id_empl_contrato, dataEmpleadoCargo).subscribe(res => {
        this.verEmpleado.obtenerCargoEmpleado(parseInt(this.idEmploy));
        this.cancelar();
        this.toastr.success('Operación Exitosa', 'Cargo del empleado Actualizado', {
          timeOut: 6000,
        });
      });
    }
  }

  cancelar() { this.verEmpleado.verCargoEdicion(true); }

  estilo: any;
  habilitarCargo: boolean = false;
  habilitarSeleccion: boolean = true;
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

  VerTiposCargos() {
    this.nuevoEmplCargosForm.patchValue({
      cargoForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.habilitarCargo = false;
    this.habilitarSeleccion = true;
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
          this.restEmplCargos.ActualizarContratoEmpleado(this.idSelectCargo, this.id_empl_contrato, datos).subscribe(res => {
            this.verEmpleado.obtenerCargoEmpleado(parseInt(this.idEmploy));
            this.cancelar();
            this.toastr.success('Operación Exitosa', 'Cargo del empleado Actualizado', {
              timeOut: 6000,
            });
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
}
