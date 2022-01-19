import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service'
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-editar-sucursal',
  templateUrl: './editar-sucursal.component.html',
  styleUrls: ['./editar-sucursal.component.css']
})

export class EditarSucursalComponent implements OnInit {

  // Datos Provincias, Continentes, Países y Ciudades
  empresas: any = [];
  provincias: any = [];
  seleccionarProvincia;
  continentes: any = [];
  seleccionarContinente;
  paises: any = [];
  seleccionarPaises;
  nombreCiudades: any = [];
  seleccionarCiudad;
  ultimoId: any = [];

  // Buscar ID
  idProv: any = [];
  idPais: any = [];
  idContin: any = [];

  nombre = new FormControl('', [Validators.required, Validators.minLength(4)]);
  idCiudad = new FormControl('', [Validators.required]);
  idProvinciaF = new FormControl('', [Validators.required]);
  nombreContinenteF = new FormControl('', Validators.required);
  nombrePaisF = new FormControl('', Validators.required);
  idEmpresaF = new FormControl('', Validators.required);

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  public nuevaSucursalForm = new FormGroup({
    sucursalNombreForm: this.nombre,
    idCiudadForm: this.idCiudad,
    idProvinciaForm: this.idProvinciaF,
    nombreContinenteForm: this.nombreContinenteF,
    nombrePaisForm: this.nombrePaisF,
    idEmpresaForm: this.idEmpresaF,
  });

  constructor(
    public restCiudad: CiudadService,
    public restSucursal: SucursalService,
    private restP: ProvinciaService,
    private restF: CiudadFeriadosService,
    private restE: EmpresaService,
    private restD: DepartamentosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarSucursalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.continentes = this.ObtenerContinentes();
    this.BuscarEmpresas();
    this.CargarDatos();
  }

  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
      //this.seleccionarContinente = this.continentes[this.continentes.length - 1].continente;
    })
  }

  ObtenerPaises(continente) {
    this.paises = [];
    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      //this.seleccionarPaises = this.paises[this.paises.length - 1].nombre;
      //console.log("prueba paises", this.paises)
    })
  }

  FiltrarPaises(form) {
    var nombreContinente = form.nombreContinenteForm;
    if (nombreContinente === 'Seleccionar' || nombreContinente === '') {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
      this.paises = [];
      this.provincias = [];
      this.nombreCiudades = [];
      this.seleccionarPaises = '';
    }
    else {
      this.seleccionarPaises = this.ObtenerPaises(nombreContinente);
    }
  }

  ObtenerProvincias(pais) {
    this.provincias = [];
    this.restP.BuscarUnaProvincia(pais).subscribe(datos => {
      this.provincias = datos;
      //console.log("datos-provincia2:", this.provincias)
      //this.seleccionarProvincia = this.provincias[this.provincias.length - 1].nombre;
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados', '', {
        timeOut: 6000,
      })
    })
  }

  FiltrarProvincias(form) {
    var nombrePais = form.nombrePaisForm;
    if (nombrePais === undefined) {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
      this.provincias = [];
      this.seleccionarProvincia = '';
    }
    else {
      this.seleccionarProvincia = this.ObtenerProvincias(nombrePais);
    }
  }

  ObtenerCiudades(provincia) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
      // console.log("todas las ciuaddaes", this.nombreCiudades);
      //this.seleccionarCiudad = this.nombreCiudades[this.nombreCiudades.length - 1].descripcion;
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas', '', {
        timeOut: 6000,
      })
    })
  }

  FiltrarCiudades(form) {
    var nombreProvincia = form.idProvinciaForm;
    if (nombreProvincia === 'Seleccionar') {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
      this.seleccionarCiudad = '';
    }
    else {
      this.seleccionarCiudad = this.ObtenerCiudades(nombreProvincia);
    }
  }

  SeleccionarCiudad(form) {
    var nombreCiudad = form.idCiudadForm;
    if (nombreCiudad === undefined) {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
    }
  }

  BuscarEmpresas() {
    this.empresas = [];
    this.restE.ConsultarEmpresas().subscribe(datos => {
      this.empresas = datos;
    })
  }

  CargarDatos() {
    // Buscar datos de la ciudad
    this.restCiudad.getUnaCiudadRest(this.data.id_ciudad).subscribe(datosC => {
      this.idProv = datosC;
      //Buscar datos de la provincia
      this.restP.BuscarUnaProvinciaId(this.idProv[0].id_provincia).subscribe(datosP => {
        this.idPais = datosP;
        // Cargar provincias del pais establecido
        this.ObtenerProvincias(this.idPais[0].id_pais);
        this.seleccionarProvincia = this.idPais[0].nombre;
        // Cargar ciudades de la provincia establecida
        this.ObtenerCiudades(this.idPais[0].nombre);
        this.seleccionarCiudad = this.data.id_ciudad;
        // Imprimir datos en pantalla
        this.nuevaSucursalForm.patchValue({
          idProvinciaForm: this.idPais[0].nombre,
        })
        // Buscar datos del pais
        this.restP.BuscarPaisId(this.idPais[0].id_pais).subscribe(datosC => {
          this.idContin = datosC;
          // Cargar datos del pais establecido
          this.ObtenerPaises(this.idContin[0].continente);
          this.seleccionarPaises = this.idContin[0].id;
          // Mostrar datos en pantalla
          this.seleccionarContinente = this.idContin[0].continente;
          this.nuevaSucursalForm.patchValue({
            nombreContinenteForm: this.idContin[0].continente,
            nombrePaisForm: this.idContin[0].id,
            sucursalNombreForm: this.data.nombre,
            idCiudadForm: this.data.id_ciudad,
            idEmpresaForm: this.data.id_empresa,
          })
        })
      })
    })
  }

  listaSucursales: any = [];
  contador: number = 0;
  InsertarSucursal(form) {
    this.habilitarprogress === true;
    this.listaSucursales = [];
    this.contador = 0;
    let dataSucursal = {
      id: this.data.id,
      nombre: form.sucursalNombreForm,
      id_ciudad: form.idCiudadForm,
      id_empresa: form.idEmpresaForm
    };
    this.restSucursal.VerSucursalActualizar(this.data.id).subscribe(res => {
      this.listaSucursales = res;
      console.log('lista', this.listaSucursales);
      for (var i = 0; i <= this.listaSucursales.length - 1; i++) {
        if (this.listaSucursales[i].nombre.toUpperCase() === form.sucursalNombreForm.toUpperCase()) {
          this.contador = 1;
          this.habilitarprogress === false;
        }
      }
      if (this.contador === 1) {
        this.toastr.error('El nombre de la Sucursal ya se encuentra registrado.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.habilitarprogress === false;
      }
      else {
        this.restSucursal.ActualizarSucursal(dataSucursal).subscribe(response => {
          this.toastr.success('Operación Exitosa', 'Sucursal actualizada', {
            timeOut: 6000,
          });
          this.habilitarprogress === false;
          this.CerrarVentanaRegistroSucursal();
        }, error => { });
      }
    })

  }

  LimpiarCampos() {
    this.nuevaSucursalForm.reset();
    this.ObtenerContinentes();
    this.paises = [];
    this.provincias = [];
    this.nombreCiudades = [];
  }

  CerrarVentanaRegistroSucursal() {
    this.LimpiarCampos();
    this.dialogRef.close({actualizar: true});
    // window.location.reload();
  }

  Salir() {
    this.LimpiarCampos();
    this.dialogRef.close({actualizar: false});
  }

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

}
