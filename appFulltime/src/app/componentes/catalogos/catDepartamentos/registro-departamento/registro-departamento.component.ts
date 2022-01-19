import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';

interface Nivel {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-registro-departamento',
  templateUrl: './registro-departamento.component.html',
  styleUrls: ['./registro-departamento.component.css'],
})

export class RegistroDepartamentoComponent implements OnInit {

  // Control de los campos del formulario
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  nivel = new FormControl('', Validators.required);
  departamentoPadre = new FormControl('');
  idSucursalF = new FormControl('');

  // Datos Departamento
  sucursales: any = [];
  departamentos: any = [];
  departamentoId: any = [];
  departamentoModificar: any = []
  editarDepartamento: boolean = false;
  selectPadre;
  idD = '';
  nombreD = '';
  Habilitar: boolean;

  // Asignar los campos en un formulario en grupo
  public nuevoDepartamentoForm = new FormGroup({
    departamentoNombreForm: this.nombre,
    departamentoNivelForm: this.nivel,
    departamentoDepartamentoPadreForm: this.departamentoPadre,
    idSucursalForm: this.idSucursalF,
  });

  // Arreglo de niveles existentes
  niveles: Nivel[] = [
    { valor: '1', nombre: '1' },
    { valor: '2', nombre: '2' },
    { valor: '3', nombre: '3' },
    { valor: '4', nombre: '4' },
    { valor: '5', nombre: '5' }
  ];
  selectNivel: string = this.niveles[0].valor;

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private rest: DepartamentosService,
    private restS: SucursalService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistroDepartamentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    console.log('data', this.data)
    this.FiltrarSucursales();
    if (this.data != undefined) {
      this.Habilitar = true;
      this.rest.BuscarDepartamentoSucursal(this.data).subscribe(datos => {
        this.departamentos = datos;
        this.selectPadre = this.departamentos[this.departamentos.length - 1].nombre;
      }, error => {
        this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.Habilitar = false;
    }
  }

  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa'));
    this.sucursales = [];
    this.restS.BuscarSucEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No existe registro de establecimeintos','', {
        timeOut: 6000,
      })
    })
  }

  InsertarDepartamento(form) {
    this.habilitarprogress = true;

    var departamentoPadreId;
    var departamentoPadreNombre = form.departamentoDepartamentoPadreForm;
    var datosDepartamento = {
      nombre: form.departamentoNombreForm.toUpperCase(),
      nivel: form.departamentoNivelForm,
      depa_padre: departamentoPadreNombre,
      id_sucursal: form.idSucursalForm
    };
    if (this.data != undefined) {
      datosDepartamento.id_sucursal = this.data;
    }
    if (departamentoPadreNombre === null) {
      datosDepartamento.depa_padre = null;
      this.GuardarDatos(datosDepartamento);
    }
    else {
      this.rest.getIdDepartamentoPadre(departamentoPadreNombre).subscribe(datos => {
        departamentoPadreId = datos[0].id;
        datosDepartamento.depa_padre = departamentoPadreId;
        this.habilitarprogress = false;
        this.GuardarDatos(datosDepartamento);
      })
    }
  }

  revisarNombre: any = [];
  contador: number = 0;
  GuardarDatos(datos) {
    this.habilitarprogress = true;
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
        this.habilitarprogress = true;
        this.rest.postDepartamentoRest(datos).subscribe(response => {
          if (response.message === 'error') {
            this.toastr.error('Los datos ingresados tienen un error','', {
              timeOut: 6000,
            });
          }
          else {
            this.toastr.success('Operación Exitosa', 'Departamento registrado', {
              timeOut: 6000,
            });
            this.habilitarprogress = false;
            this.LimpiarCampos();
          }
        });
      }
    }, error => {
      this.toastr.info('Sucursal no cuenta con departamentos registrados','', {
        timeOut: 6000,
      })
    });
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

  ObtenerNombre(id: number) {
    this.selectPadre
    this.rest.EncontrarUnDepartamento(id).subscribe(datos => {
      this.selectPadre = datos[0].nombre
    }, error => {
      this.toastr.info('Descripción ingresada no coincide con los registros','', {
        timeOut: 6000,
      })
    });
  }

  LimpiarCampos() {
    this.nuevoDepartamentoForm.reset();
    this.contador = 0;
  }

  CerrarVentanaRegistroDepartamento() {
    this.LimpiarCampos();
    this.dialogRef.close();
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

