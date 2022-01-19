import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

interface Nivel {
  valor: number;
  nombre: string
}

@Component({
  selector: 'app-editar-departamento',
  templateUrl: './editar-departamento.component.html',
  styleUrls: ['./editar-departamento.component.css']
})
export class EditarDepartamentoComponent implements OnInit {

  // Control de los campos del formulario
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  nivel = new FormControl('', Validators.required);
  departamentoPadre = new FormControl('');
  idEmpresaF = new FormControl('', Validators.required);
  idSucursalF = new FormControl('', Validators.required);

  // Datos Departamento
  empresas: any = [];
  sucursales: any = [];
  departamentos: any = [];
  departamentoModificar: any = []
  selectPadre: string = 'Ninguno';
  idD = '';
  nombreD = '';

  // Asignar los campos en un formulario en grupo
  public nuevoDepartamentoForm = new FormGroup({
    departamentoNombreForm: this.nombre,
    departamentoNivelForm: this.nivel,
    departamentoDepartamentoPadreForm: this.departamentoPadre,
    idEmpresaForm: this.idEmpresaF,
    idSucursalForm: this.idSucursalF,
  });

  // Arreglo de niveles existentes
  niveles: Nivel[] = [
    { valor: 1, nombre: '1' },
    { valor: 2, nombre: '2' },
    { valor: 3, nombre: '3' },
    { valor: 4, nombre: '4' },
    { valor: 5, nombre: '5' }
  ];

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private rest: DepartamentosService,
    private restE: EmpresaService,
    private restS: SucursalService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<EditarDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public descripcionD: any
  ) { }

  ngOnInit(): void {
    console.log(this.descripcionD);
    this.ObtenerDepartamentosInicio();
    this.BuscarEmpresas();
    this.ValidarCamposModificar();
  }

  ModificarDepartamento(form) {
    this.habilitarprogress = true;
    var departamentoPadreId
    var departamentoPadreNombre = form.departamentoDepartamentoPadreForm;
    console.log(form.departamentoDepartamentoPadreForm);
    if (departamentoPadreNombre === 0) {
      let datadepartamento = {
        nombre: form.departamentoNombreForm.toUpperCase(),
        nivel: form.departamentoNivelForm,
        depa_padre: null,
        id_sucursal: form.idSucursalForm
      };
      if (datadepartamento.nombre === this.departamentoModificar.nombre) {
        this.ActualizarDepartamento(datadepartamento);
      }
      else {
        this.GuardarDatos(datadepartamento);
      }
    } else {
      this.rest.getIdDepartamentoPadre(departamentoPadreNombre).subscribe(data => {
        departamentoPadreId = data[0].id;
        let datadepartamento = {
          nombre: form.departamentoNombreForm.toUpperCase(),
          nivel: form.departamentoNivelForm,
          depa_padre: departamentoPadreId,
          id_sucursal: form.idSucursalForm
        };
        if (datadepartamento.nombre === this.departamentoModificar.nombre) {
          this.ActualizarDepartamento(datadepartamento);
        }
        else {
          this.GuardarDatos(datadepartamento);
        }
      })
    }
  }

  revisarNombre: any = [];
  contador: number = 0;
  GuardarDatos(datos) {
    this.revisarNombre = [];
    let idSucursal = datos.id_sucursal;
    this.rest.BuscarDepartamentoSucursal(idSucursal).subscribe(data => {
      this.habilitarprogress = false;
      this.revisarNombre = data;
      for (var i = 0; i <= this.revisarNombre.length - 1; i++) {
        if (this.revisarNombre[i].nombre === datos.nombre) {
          this.contador = 1;
        }
      }
      if (this.contador === 1) {
        this.toastr.error('No es posible registrar dos departamentos con el mismo nombre.', 'REVISAR EL NOMBRE DEL DEPARTAMENTO', {
          timeOut: 6000,
        });
        this.contador = 0;
      }
      else {
        this.ActualizarDepartamento(datos);
      }
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
        timeOut: 6000,
      })
    });
  }

  ActualizarDepartamento(datos) {
    this.rest.updateDepartamento(this.descripcionD.id, datos).subscribe(response => {
      this.habilitarprogress = false;
      if (response.message === 'error') {
        this.toastr.error('Existe un error en los datos.','', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operacion Exitosa', 'Departamento modificado', {
          timeOut: 6000,
        });
        //window.location.reload();
        this.dialogRef.close();
      }
    }, error => {
      this.habilitarprogress = false;
    });
  }

  CerrarVentanaRegistroDepartamento() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }

  LimpiarCampos() {
    this.nuevoDepartamentoForm.reset();
    this.contador = 0;
  }

  ValidarCamposModificar() {
    this.idD = this.descripcionD.id;
    this.rest.EncontrarUnDepartamento(parseInt(this.idD)).subscribe(res => {
      this.departamentoModificar = res;
      console.log(this.departamentoModificar)
      this.FiltrarSucursalesEditar(this.descripcionD.id_empresa);
      this.ObtenerDepartamentosEditar(this.descripcionD.id_sucursal);
      this.nuevoDepartamentoForm.patchValue({
        idEmpresaForm: this.descripcionD.id_empresa,
        idSucursalForm: this.descripcionD.id_sucursal,
        departamentoNombreForm: this.departamentoModificar.nombre,
        departamentoNivelForm: this.departamentoModificar.nivel,
      })
      this.ObtenerNombre(this.departamentoModificar.depa_padre);
    }, err => { })
  }

  ObtenerDepartamentosInicio() {
    this.departamentos = [];
    let idSucursal = this.descripcionD.id_sucursal;
    this.rest.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamentos = datos;
      console.log(this.departamentos)
      this.nuevoDepartamentoForm.patchValue({
        departamentoDepartamentoPadreForm: this.descripcionD.departamento_padre
      })
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
        timeOut: 6000,
      })
    });
  }

  BuscarEmpresas() {
    this.empresas = [];
    this.restE.ConsultarEmpresas().subscribe(datos => {
      this.empresas = datos;
    })
  }

  FiltrarSucursales(form) {
    let idEmpre = form.idEmpresaForm
    this.sucursales = [];
    this.restS.BuscarSucEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('La Empresa seleccionada no tiene Sucursales registradas','', {
        timeOut: 6000,
      })
    })
  }

  ObtenerDepartamentos(form) {
    this.departamentos = [];
    let idSucursal = form.idSucursalForm;
    this.rest.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamentos = datos;
      this.selectPadre = this.departamentos[this.departamentos.length - 1].nombre;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
        timeOut: 6000,
      })
    });
  }

  FiltrarSucursalesEditar(idEmpre: number) {
    this.sucursales = [];
    this.restS.BuscarSucEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('La Empresa seleccionada no tiene Sucursales registradas','', {
        timeOut: 6000,
      })
    })
  }

  ObtenerDepartamentosEditar(idSucursal: number) {
    this.departamentos = [];
    this.rest.BuscarDepartamentoSucursal(idSucursal).subscribe(datos => {
      this.departamentos = datos;
      this.selectPadre = this.departamentos[this.departamentos.length - 1].nombre;
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
        timeOut: 6000,
      })
    });
  }

  nombreDepa: any = [];
  ObtenerNombre(id: number) {
    this.nombreDepa = [];
    if (id !== null) {
      this.rest.EncontrarUnDepartamento(id).subscribe(datos => {
        this.nombreDepa = datos;
        this.selectPadre = this.nombreDepa.nombre;
      }, error => {
        this.toastr.info('Descripción ingresada no coincide con los registros','', {
          timeOut: 6000,
        })
      });
    } else {
      console.log('llegue');
      this.nuevoDepartamentoForm.patchValue({
        departamentoDepartamentoPadreForm: 0
      })
      // this.selectPadre = 'Ninguno';
    }
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingresar un nombre válido' : '';
  }
}
