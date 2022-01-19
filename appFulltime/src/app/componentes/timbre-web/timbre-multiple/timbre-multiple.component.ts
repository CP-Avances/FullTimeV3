// IMPORTAR LIBRERIAS
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

// SERVICIOS FILTROS DE BÚSQUEDA
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { LoginService } from 'src/app/servicios/login/login.service';

// IMPORTAR COMPONENTES
import { FraseSeguridadComponent } from '../../frase-administrar/frase-seguridad/frase-seguridad.component';
import { SeguridadComponent } from 'src/app/componentes/frase-administrar/seguridad/seguridad.component';
import { CrearTimbreComponent } from '../crear-timbre/crear-timbre.component';

export interface EmpleadoElemento {
  id: number;
  nombre: string;
  apellido: string;
}

@Component({
  selector: 'app-timbre-multiple',
  templateUrl: './timbre-multiple.component.html',
  styleUrls: ['./timbre-multiple.component.css']
})

export class TimbreMultipleComponent implements OnInit {

  // VARIABLE DE ALMACENAMIENTO DE DATOS DE EMPLEADO
  Lista_empleados: any = [];

  // ITEMS DE PAGINACION DE LA TABLA
  numero_pagina: number = 1;
  tamanio_pagina: number = 5;
  pageSizeOptions = [5, 10, 20, 50];

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

  // BÚSQUEDA INMEDIATA DATOS DEL FORMULARIO 
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
    public restDepa: DepartamentosService,
    public restEmpleado: EmpleadoService,
    private validar: ValidacionesService,
    public restD: DatosGeneralesService,
    private restTimbres: TimbresService,
    private restEmpresa: EmpresaService,
    public restCargo: EmplCargosService,
    private restUsuario: UsuarioService,
    public restRegimen: RegimenService,
    public restSucur: SucursalService,
    public loginService: LoginService,
    private toastr: ToastrService,
    private ventana: MatDialog,
    private router: Router,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.ObtenerEmpleados();
    this.ListarSucursales();
    this.ListarDepartamentos();
    this.ListarCargos();
    this.ListarRegimen();
  }

  // MÉTODO PARA MANEJAR PÁGINAS DE TABLA
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // MÉTODO PARA OBTENER DATOS DE EMPLEADO
  ObtenerEmpleados() {
    this.Lista_empleados = [];
    this.restD.ListarInformacionActual().subscribe(data => {
      this.Lista_empleados = data;
      console.log('datos_actuales', this.Lista_empleados)
    });
  }

  // MÉTODO PARA APLICAR FILTRO DE BÚSQUEDA
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filtroEmpleados = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // MÉTODO PARA INGRESAR TIMBRE DE UN USUARIO
  RegistrarTibre(empleado) {
    this.ventana.open(CrearTimbreComponent, { width: '400px', data: empleado }).afterClosed().subscribe(dataT => {
      if (!dataT.close) {
        this.restTimbres.PostTimbreWebAdmin(dataT).subscribe(res => {
          this.toastr.success(res.message)
          // MÉTODO PARA AUDITORIA DE TIMBRES
          this.validar.Auditar('app-web', 'timbres', '', dataT, 'INSERT');
        }, err => {
          this.toastr.error(err)
        })
      }
    })
  }

  // FUNCIÓN PARA CONFIRMAR CREACIÓN DE TIMBRE 
  ConfirmarTimbre(empleado: any) {
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(datos => {
      if (datos[0].seg_frase === true) {
        this.restUsuario.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
          if (data[0].frase === null || data[0].frase === '') {
            this.toastr.info('Debe registrar su frase de seguridad.', 'Configuración doble seguridad', { timeOut: 10000 })
              .onTap.subscribe(obj => {
                this.RegistrarFrase()
              })
          }
          else {
            this.AbrirVentana(empleado);
          }
        });
      }
      else if (datos[0].seg_contrasena === true) {
        this.AbrirVentana(empleado);
      }
      else if (datos[0].seg_ninguna === true) {
        this.RegistrarTibre(empleado);
      }
    });

  }

  // MÉTODO PARA ABRIR VENTANA DE SEGURIDAD
  AbrirVentana(datos: any) {
    this.ventana.open(SeguridadComponent, { width: '350px' }).afterClosed()
      .subscribe((confirmado: string) => {
        console.log('prueba', confirmado)
        if (confirmado === 'true') {
          this.RegistrarTibre(datos);
        } else if (confirmado === 'false') {
          this.router.navigate(['/timbres-multiples']);
        } else if (confirmado === 'olvidar') {
          this.router.navigate(['/frase-olvidar']);
        }
      });
  }

  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent, { width: '350px', data: this.idEmpleadoLogueado }).disableClose = true;
  }

  // MÉTODO PARA HABILITAR Y DESHABILITAR SELECCIÓN DE DATOS
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

  // MÉTODO PARA REGISTRAR VARIOS TIMBRES
  TimbrarVarios() {
    let EmpleadosSeleccionados;
    EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
      return {
        id: obj.id,
        empleado: obj.nombre + ' ' + obj.apellido
      }
    })
    if (EmpleadosSeleccionados.length > 0) {
      this.ventana.open(CrearTimbreComponent, { width: '400px', data: EmpleadosSeleccionados })
        .afterClosed().subscribe(dataT => {
          this.LimpiarCampos();
          this.ObtenerEmpleados();
          this.LimpiarBusquedas();
          this.selectionUno.clear();
          this.btnCheckHabilitar = false;
        })
    }
  }

  // MÉTODO PARA VERIFICAR TIPO DE SEGURIDAD EN EL SISTEMA
  VerificarSeguridad() {
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(datos => {
      if (datos[0].seg_frase === true) {
        this.restUsuario.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
          if (data[0].frase === null || data[0].frase === '') {
            this.toastr.info('Debe registrar su frase de seguridad.', 'Configuración doble seguridad', { timeOut: 10000 })
              .onTap.subscribe(obj => {
                this.RegistrarFrase()
              })
          }
          else {
            this.AbrirSeguridad();
          }
        });
      }
      else if (datos[0].seg_contrasena === true) {
        this.AbrirSeguridad();
      }
      else if (datos[0].seg_ninguna === true) {
        this.TimbrarVarios();
      }
    });
  }

  AbrirSeguridad() {
    this.ventana.open(SeguridadComponent, { width: '350px' }).afterClosed()
      .subscribe((confirmado: string) => {
        console.log('config', confirmado)
        if (confirmado === 'true') {
          this.TimbrarVarios();
        } else if (confirmado === 'false') {
          this.router.navigate(['/timbres-multiples']);
        } else if (confirmado === 'olvidar') {
          this.router.navigate(['/frase-olvidar']);
        }
      });
  }

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.departamentoF.reset();
    this.regimenF.reset();
    this.cargoF.reset();
    this.filtroEmpleado = '';
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
        laboralForm: '',
        depaForm: '',
        cargosForm: '',
        sucursalForm: ''
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

}
