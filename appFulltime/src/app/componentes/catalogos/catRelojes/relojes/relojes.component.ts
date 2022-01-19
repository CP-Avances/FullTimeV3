import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RelojesService } from 'src/app/servicios/catalogos/catRelojes/relojes.service';
import { ToastrService } from 'ngx-toastr';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';


@Component({
  selector: 'app-relojes',
  templateUrl: './relojes.component.html',
  styleUrls: ['./relojes.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class RelojesComponent implements OnInit {

  sucursales: any = [];
  departamento: any = [];
  nomDepartamento: any = [];

  // Activar ingreso de número de acciones
  activarCampo: boolean = false;

  // Control de campos y validaciones del formulario
  nombreF = new FormControl('', [Validators.required, Validators.minLength(4)]);
  ipF = new FormControl('', [Validators.required, Validators.pattern("[0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}[.][0-9]{1,3}")]);
  puertoF = new FormControl('', [Validators.required, Validators.pattern('[0-9]{4}')]);
  contraseniaF = new FormControl('', [Validators.minLength(4)]);
  marcaF = new FormControl('', [Validators.minLength(4)]);
  modeloF = new FormControl('', [Validators.minLength(3)]);
  serieF = new FormControl('', Validators.minLength(4));
  idFabricacionF = new FormControl('', [Validators.minLength(4)]);
  fabricanteF = new FormControl('', [Validators.minLength(4)]);
  funcionesF = new FormControl('', [Validators.required]);
  macF = new FormControl('');
  codigoF = new FormControl('', Validators.required);
  idSucursalF = new FormControl('', Validators.required);
  idDepartamentoF = new FormControl('', [Validators.required]);
  numeroF = new FormControl('', [Validators.required]);

  // Asignación de validaciones a inputs del formulario
  public RelojesForm = new FormGroup({
    nombreForm: this.nombreF,
    ipForm: this.ipF,
    puertoForm: this.puertoF,
    contraseniaForm: this.contraseniaF,
    marcaForm: this.marcaF,
    modeloForm: this.modeloF,
    serieForm: this.serieF,
    idFabricacionForm: this.idFabricacionF,
    fabricanteForm: this.fabricanteF,
    macForm: this.macF,
    funcionesForm: this.funcionesF,
    idSucursalForm: this.idSucursalF,
    idDepartamentoForm: this.idDepartamentoF,
    codigoForm: this.codigoF,
    numeroForm: this.numeroF
  });

  constructor(
    private rest: RelojesService,
    private restCatDepartamento: DepartamentosService,
    private restSucursales: SucursalService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RelojesComponent>,
  ) { }

  ngOnInit(): void {
    this.FiltrarSucursales();
  }

  FiltrarSucursales() {
    let idEmpre = parseInt(localStorage.getItem('empresa'));
    this.sucursales = [];
    this.restSucursales.BuscarSucEmpresa(idEmpre).subscribe(datos => {
      this.sucursales = datos;
    }, error => {
      this.toastr.info('No se han encntrado registros de establecimientos', '', {
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

  ObtenerNombre(form) {
    this.nomDepartamento = [];
    this.restCatDepartamento.EncontrarUnDepartamento(form.idDepartamentoForm).subscribe(datos => {
      this.nomDepartamento = datos;
      console.log(this.nomDepartamento.nombre)
      if (this.nomDepartamento.nombre === 'Ninguno') {
        this.toastr.info('No ha seleccionado ningún departamento. Seleccione un departamento y continue con el registro', '', {
          timeOut: 6000,
        })
      }
    }, error => {
      this.toastr.info('Descripción ingresada no coincide con los registros', '', {
        timeOut: 6000,
      })
    });
  }

  InsertarReloj(form) {
    let datosReloj = {
      nombre: form.nombreForm,
      ip: form.ipForm,
      puerto: form.puertoForm,
      contrasenia: form.contraseniaForm,
      marca: form.marcaForm,
      modelo: form.modeloForm,
      serie: form.serieForm,
      id_fabricacion: form.idFabricacionForm,
      fabricante: form.fabricanteForm,
      mac: form.macForm,
      tien_funciones: form.funcionesForm,
      id_sucursal: form.idSucursalForm,
      id_departamento: form.idDepartamentoForm,
      id: form.codigoForm,
      numero_accion: form.numeroForm
    };
    this.nomDepartamento = [];
    this.restCatDepartamento.EncontrarUnDepartamento(form.idDepartamentoForm).subscribe(datos => {
      this.nomDepartamento = datos;
      console.log(this.nomDepartamento.nombre)
      if (this.nomDepartamento.nombre === 'Ninguno') {
        this.toastr.info('No ha seleccionado ningún departamento. Seleccione un departamento y continue con el registro', '', {
          timeOut: 6000,
        })
      }
      else {
        this.rest.CrearNuevoReloj(datosReloj).subscribe(response => {
          if (response.message === 'guardado') {
            this.LimpiarCampos();
            this.toastr.success('Operación Exitosa', 'Dispositivo registrado', {
              timeOut: 6000,
            })
          }
          else {
            this.toastr.error('Verificar que el código de reloj y la ip del dispositivo no se encuentren registrados.',
              'Operación Fallida', {
              timeOut: 6000,
            })
          }

        }, error => { });
      }
    }, error => { });

  }

  ObtenerMensajeErrorNombreRequerido() {
    if (this.nombreF.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

  ObtenerMensajeErrorIp() {
    if (this.ipF.hasError('pattern')) {
      return 'Ingresar IP Ej: 0.0.0.0';
    }
    return this.ipF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  ObtenerMensajeErrorPuerto() {
    if (this.puertoF.hasError('pattern')) {
      return 'Ingresar 4 números';
    }
    return this.puertoF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  IngresarIp(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 46) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
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

  activarVista() {
    this.activarCampo = true;
    this.RelojesForm.patchValue({
      numeroForm: ''
    })
  }

  desactivarVista() {
    this.activarCampo = false;
    this.RelojesForm.patchValue({
      numeroForm: 0
    })
  }

  LimpiarCampos() {
    this.RelojesForm.reset();
  }

  CerrarVentanaRegistroReloj() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

}
