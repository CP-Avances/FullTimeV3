import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-registrar-sucursales',
  templateUrl: './registrar-sucursales.component.html',
  styleUrls: ['./registrar-sucursales.component.css']
})

export class RegistrarSucursalesComponent implements OnInit {

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

  filteredOptPais: Observable<string[]>;
  filteredOptProv: Observable<string[]>;
  filteredOptCiud: Observable<string[]>;

  nombre = new FormControl('', [Validators.required, Validators.minLength(4)]);
  idCiudad = new FormControl('', [Validators.required]);
  idProvinciaF = new FormControl('', [Validators.required]);
  nombreContinenteF = new FormControl('', Validators.required);
  nombrePaisF = new FormControl('', Validators.required);

  public nuevaSucursalForm = new FormGroup({
    sucursalNombreForm: this.nombre,
    idCiudadForm: this.idCiudad,
    idProvinciaForm: this.idProvinciaF,
    nombreContinenteForm: this.nombreContinenteF,
    nombrePaisForm: this.nombrePaisF,
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    public restCiudad: CiudadService,
    public restSucursal: SucursalService,
    private restP: ProvinciaService,
    private restF: CiudadFeriadosService,
    private restE: EmpresaService,
    private restD: DepartamentosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistrarSucursalesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.continentes = this.ObtenerContinentes();
    this.filteredOptPais = this.nombrePaisF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterPais(value))
      );
    this.filteredOptProv = this.idProvinciaF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterProvincia(value))
      );
    this.filteredOptCiud = this.idCiudad.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterCiudad(value))
      );
  }

  private _filterPais(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  private _filterProvincia(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter(provincias => provincias.nombre.toLowerCase().includes(filterValue));
    }
  }

  private _filterCiudad(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nombreCiudades.filter(ciudades => ciudades.descripcion.toLowerCase().includes(filterValue));
    }
  }

  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
      this.continentes[this.continentes.length] = { continente: "Seleccionar" };
      this.seleccionarContinente = this.continentes[this.continentes.length - 1].continente;
    });
  }

  ObtenerPaises(continente) {
    this.paises = [];
    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.seleccionarPaises = '';
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
      this.seleccionarProvincia = '';
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados', '', {
        timeOut: 6000,
      })
    })
  }

  FiltrarProvincias(form) {
    let idPais;
    this.paises.forEach(obj => {
      if (obj.nombre === form.nombrePaisForm) {
        idPais = obj.id
      }
    });
    if (idPais === undefined) {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
      this.provincias = [];
      this.seleccionarProvincia = '';
    }
    else {
      this.seleccionarProvincia = this.ObtenerProvincias(idPais);
    }
  }

  ObtenerCiudades(provincia) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
      this.seleccionarCiudad = '';
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas', '', {
        timeOut: 6000,
      })
    })
  }

  FiltrarCiudades(form) {
    let nombreProvincia = form.idProvinciaForm;
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

  contador: number = 0;
  listaSucursales: any = [];
  InsertarSucursal(form) {
    this.habilitarprogress = true;
    this.contador = 0;
    this.listaSucursales = [];
    let idEmpr = localStorage.getItem('empresa');
    let idCiud;
    this.nombreCiudades.forEach(obj => {
      if (obj.descripcion === form.idCiudadForm) {
        idCiud = obj.id
      }
    });
    let dataSucursal = {
      nombre: form.sucursalNombreForm,
      id_ciudad: idCiud,
      id_empresa: idEmpr
    };
    this.restSucursal.VerSucursalesRegistro().subscribe(responseS => {
      this.listaSucursales = responseS;
      this.habilitarprogress = false;
      console.log('sucursales lista', this.listaSucursales);
      for (var i = 0; i <= this.listaSucursales.length - 1; i++) {
        if (this.listaSucursales[i].nombre.toUpperCase() === form.sucursalNombreForm.toUpperCase()) {
          console.log('nombre', this.listaSucursales[i].nombre.toUpperCase(), 'form', form.sucursalNombreForm.toUpperCase());
          this.contador = 1;
        }
      }
      console.log('contador', this.contador)
      if (this.contador === 1) {
        this.toastr.error('El nombre de la Sucursal ya se encuentra registrado.', 'Operación Fallida', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      }
      else {
        this.restSucursal.postSucursalRest(dataSucursal).subscribe(response => {
          this.toastr.success('Operación Exitosa', 'Sucursal guardada', {
            timeOut: 6000,
          });
          this.habilitarprogress = false;
          this.LimpiarCampos();
          //Obtener ultimo ID para registrar un departamento de nombre Ninguno -- útil para cada sucursal registrada
          this.restSucursal.EncontrarUltimoId().subscribe(datos => {
            this.ultimoId = datos;
            console.log("id sucursal: ", this.ultimoId[0].max);
            let datosDepartamentos = {
              nombre: 'Ninguno',
              nivel: 1,
              depa_padre: null,
              id_sucursal: this.ultimoId[0].max
            };
            console.log("insertar departamento: ", datosDepartamentos);
            this.restD.postDepartamentoRest(datosDepartamentos).subscribe(response => {
              this.ultimoId = [];
              console.log('depa-guardado')
            });
          }, error => { });
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
  }

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
  }

}
