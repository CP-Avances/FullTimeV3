// IMPORTAR LIBRERIAS
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Validators, FormControl, FormGroup } from '@angular/forms';

// SERVICIOS FILTROS DE BÚSQUEDA
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

// IMPORTAR SERVICIOS
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// IMPORTAR COMPONENTES
import { RegistoEmpleadoHorarioComponent } from '../registo-empleado-horario/registo-empleado-horario.component';
import { HorariosMultiplesComponent } from '../horarios-multiples/horarios-multiples.component';

export interface EmpleadoElemento {
  id: number;
  codigo: number;
  nombre: string;
  apellido: string;
  id_cargo: number;
  hora_trabaja: number;
}

@Component({
  selector: 'app-horario-multiple-empleado',
  templateUrl: './horario-multiple-empleado.component.html',
  styleUrls: ['./horario-multiple-empleado.component.css']
})

export class HorarioMultipleEmpleadoComponent implements OnInit {

  Lista_empleados: any = []; // VARIABLE USADA PARA ALMACENAR LISTA DE EMPLEADOS

  // VARIABLE USADA PARA ALMACENAR LISTA DE EMPLEADOS QUE NO SE ASIGNAN HORARIO
  empleados_sin_asignacion: any = [];
  no_asignados: boolean = false;

  // ITEMS DE PAGINACIÓN DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

  // ITEMS DE PAGINACIÓN DE LA TABLA EMPLEADOS SIN HORARIO
  numero_pagina_h: number = 1;
  tamanio_pagina_h: number = 5;
  pageSizeOptions_h = [5, 10, 20, 50];

  // VARIABLES TABLA DE DATOS
  dataSource: any;
  filtroEmpleados = '';
  idEmpleadoLogueado: any;

  // FILTROS DE BÚSQUEDA 
  sucursalF = new FormControl('');
  laboralF = new FormControl('');
  cargosF = new FormControl('');
  depaF = new FormControl('');

  // FORMULARIO DE BÚSQUEDAS
  public busquedasForm = new FormGroup({
    sucursalForm: this.sucursalF,
    laboralForm: this.laboralF,
    cargosForm: this.cargosF,
    depaForm: this.depaF,
  });

  // DATOS DEL FORMULARIO DE BÚSQUEDA INMEDIATA
  departamentoF = new FormControl('', Validators.minLength(2));
  regimenF = new FormControl('', Validators.minLength(2));
  cedula = new FormControl('', Validators.minLength(2));
  nombre = new FormControl('', Validators.minLength(2));
  cargoF = new FormControl('', Validators.minLength(2));
  codigo = new FormControl('');

  // DATOS DE FILTROS DE BÚSQUEDA
  filtroDepartamento: '';
  filtroCodigo: number;
  filtroEmpleado = '';
  filtroRegimen: '';
  filtroCedula: '';
  filtroCargo: '';

  constructor(
    // FILTROS DE BÚSQUEDA
    public restDepa: DepartamentosService,
    public restCargo: EmplCargosService,
    public restRegimen: RegimenService,
    public restSucur: SucursalService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public restD: DatosGeneralesService, // SERVICIO DE DATOS INFORMATIVOS DE USUARIOS
    public validar: ValidacionesService, // VARIABLE USADA PARA VALIDACIONES DE INGRESO DE LETRAS - NÚMEROS
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES
    private ventana: MatDialog, // VARIABLE PARA MANEJO DE VENTANAS
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados();
    //FILTROS DE BÚSQUEDA
    this.ListarDepartamentos();
    this.ListarSucursales();
    this.ListarRegimen();
    this.ListarCargos();
  }

  // MÉTODO PARA MANEJO DE PÁGINAS EN TABLAS
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA MANEJO DE PÁGINAS EN TABLAS DE EMPLEADOS SIN ASIGNACIÓN
  ManejarPaginaH(e: PageEvent) {
    this.tamanio_pagina_h = e.pageSize;
    this.numero_pagina_h = e.pageIndex + 1;
  }

  // MÉTODO PARA BÚSQUEDA DE EMPLEADOS
  ObtenerEmpleados() {
    this.Lista_empleados = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.Lista_empleados = data;
      console.log('datos_actuales', this.Lista_empleados)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroEmpleados = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // MÉTODO PARA ABRI VENTANA DE ASIGNACIÓN DE HORARIO
  idCargo: any;
  AbrirVentanaEmplHorario(id_empleado: any): void {
    this.restCargo.BuscarIDCargoActual(parseInt(id_empleado)).subscribe(datos => {
      this.idCargo = datos;
      this.ventana.open(RegistoEmpleadoHorarioComponent,
        { width: '600px', data: { idEmpleado: id_empleado, idCargo: this.idCargo[0].max, horas_trabaja: this.idCargo[0].hora_trabaja } }).afterClosed().subscribe(item => {
          this.ObtenerEmpleados();
        });
    }, error => {
      this.toastr.warning('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // MÉTODO PARA MOSTRAR SELECTORES DE USUARIOS
  selectionUno = new SelectionModel<EmpleadoElemento>(true, []);
  btnCheckHabilitar: boolean = false;
  auto_individual: boolean = true;
  HabilitarSeleccion() {
    if (this.btnCheckHabilitar === false) {
      this.btnCheckHabilitar = true;
      this.auto_individual = false;
    } else if (this.btnCheckHabilitar === true) {
      this.btnCheckHabilitar = false;
      this.auto_individual = true;
    }
  }

  // SI EL NÚMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NÚMERO TOTAL DE FILAS.
  isAllSelected() {
    const numSelected = this.selectionUno.selected.length;
    const numRows = this.Lista_empleados.length;
    return numSelected === numRows;
  }

  // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCIÓN CLARA. 
  masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.Lista_empleados.forEach(row => this.selectionUno.select(row));
  }

  // LA ETIQUETA DE LA CASILLA DE VERIFICACIÓN EN LA FILA PASADA
  checkboxLabel(row?: EmpleadoElemento): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  // MÉTODO PARA INGRESAR PLANIFICACIÓN DE HORARIOS A VARIOS EMPLEADOS
  PlanificacionVarios() {
    let EmpleadosSeleccionados: any;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        empleado: obj.nombre + ' ' + obj.apellido,
        id_cargo: obj.id_cargo,
        codigo: obj.codigo,
        id: obj.id,
        hora_trabaja: obj.hora_trabaja,
      }
    })
    if (EmpleadosSeleccionados.length > 0) {
      // VENTANA PARA INGRESAR DATOS DE HORARIOS MÚLTIPLES 
      this.ventana.open(HorariosMultiplesComponent,
        { width: '600px', data: { datos: EmpleadosSeleccionados } })
        .afterClosed().subscribe(item => {
          this.ObtenerEmpleados();
          this.selectionUno.clear();
          this.HabilitarSeleccion();
          if (item) {
            if (item.length != 0) {
              this.no_asignados = true;
              this.empleados_sin_asignacion = item
            }
          }
        });
    }
  }

  // MÉTODO DE VALIDACIÓN DE INGRESO DE LETRAS Y NÚMEROS
  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.departamentoF.reset();
    this.filtroEmpleado = '';
    this.regimenF.reset();
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.cargoF.reset();
  }

  // FILTROS DE BÚSQUEDA 
  sucursales: any = [];
  ListarSucursales() {
    this.sucursales = [];
    this.restSucur.getSucursalesRest().subscribe(res => {
      this.sucursales = res;
    });
  }

  departamentos: any = [];
  ListarDepartamentos() {
    this.departamentos = [];
    this.restDepa.ConsultarDepartamentos().subscribe(res => {
      this.departamentos = res;
    });
  }

  cargos: any = [];
  ListarCargos() {
    this.cargos = [];
    this.restCargo.ObtenerTipoCargos().subscribe(res => {
      this.cargos = res;
    });
  }

  regimen: any = [];
  ListarRegimen() {
    this.regimen = [];
    this.restRegimen.ConsultarRegimen().subscribe(res => {
      this.regimen = res;
    });
  }

  LimpiarBusquedas() {
    this.busquedasForm.patchValue(
      {
        sucursalForm: '',
        laboralForm: '',
        cargosForm: '',
        depaForm: '',
      })
    this.ObtenerEmpleados();
    this.ListarSucursales();
    this.ListarDepartamentos();
    this.ListarCargos();
    this.ListarRegimen();
  }

  LimpiarCampos1() {
    this.busquedasForm.patchValue(
      {
        laboralForm: '',
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos2() {
    this.busquedasForm.patchValue(
      {
        depaForm: '',
        cargosForm: ''
      })
  }

  LimpiarCampos3() {
    this.busquedasForm.patchValue(
      { cargosForm: '' })
  }


  FiltrarSucursal(form) {
    this.departamentos = [];
    this.restDepa.BuscarDepartamentoSucursal(form.sucursalForm).subscribe(res => {
      this.departamentos = res;
    });
    this.cargos = [];
    this.restCargo.ObtenerCargoSucursal(form.sucursalForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('La sucursal seleccionada no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.regimen = [];
    this.restRegimen.ConsultarRegimenSucursal(form.sucursalForm).subscribe(res => {
      this.regimen = res;
    });
    this.LimpiarCampos1();
  }

  FiltrarRegimen(form) {
    this.cargos = [];
    this.restCargo.ObtenerCargoRegimen(form.laboralForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El regimen seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.departamentos = [];
    this.restDepa.BuscarDepartamentoRegimen(form.laboralForm).subscribe(res => {
      this.departamentos = res;
    });
    this.LimpiarCampos2();
  }

  FiltrarDepartamento(form) {
    this.cargos = [];
    this.restCargo.ObtenerCargoDepartamento(form.depaForm).subscribe(res => {
      this.cargos = res;
    }, error => {
      this.toastr.info('El departamento seleccionado no cuenta con cargos registrados.', 'Verificar la Información', {
        timeOut: 3000,
      })
    });
    this.LimpiarCampos3();
  }

  VerInformacionSucursal(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucursal(form.sucursalForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepa(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuDepa(form.sucursalForm, form.depaForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaRegimen(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuDepaRegimen(form.sucursalForm, form.depaForm, form.laboralForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuCargo(form.sucursalForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimen(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuRegimen(form.sucursalForm, form.laboralForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuRegimenCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuRegimenCargo(form.sucursalForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuDepaCargo(form.sucursalForm, form.depaForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionSucuDepaCargoRegimen(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosSucuRegimenDepartamentoCargo(form.sucursalForm, form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepartamento(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosDepartamento(form.depaForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosDepaCargo(form.depaForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimen(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosDepaRegimen(form.depaForm, form.laboralForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionDepaRegimenCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosDepaRegimenCargo(form.depaForm, form.laboralForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimen(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosRegimen(form.laboralForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionRegimenCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosRegimenCargo(form.laboralForm, form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerInformacionCargo(form) {
    this.Lista_empleados = [];
    this.restD.VerDatosCargo(form.cargosForm).subscribe(res => {
      this.Lista_empleados = res;
    }, error => {
      this.toastr.error('Ningún dato coincide con los criterios de búsqueda indicados.', 'Verficar Información', {
        timeOut: 6000,
      })
    });
  }

  VerificarBusquedas(form) {
    console.log('form', form.depaForm, form.sucursalForm, form.cargosForm, form.laboralForm)
    if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.toastr.info('Ingresar un criterio de búsqueda.', 'Verficar Información', {
        timeOut: 6000,
      })
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucursal(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionSucuDepa(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuDepaRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionSucuCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionSucuRegimen(form);
    }
    else if (form.sucursalForm != '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuRegimenCargo(form);
    }
    else if (form.sucursalForm != '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionSucuDepaCargoRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm === '') {
      this.VerInformacionDepartamento(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionDepaCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionDepaRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm != '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionDepaRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm === '') {
      this.VerInformacionRegimen(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm != '' && form.cargosForm != '') {
      this.VerInformacionRegimenCargo(form);
    }
    else if (form.sucursalForm === '' && form.depaForm === '' &&
      form.laboralForm === '' && form.cargosForm != '') {
      this.VerInformacionCargo(form);
    }
  }

  CerrarTabla() {
    this.no_asignados = false;
    this.empleados_sin_asignacion = [];
  }

}
