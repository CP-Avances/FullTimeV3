import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-asignar-ciudad',
  templateUrl: './asignar-ciudad.component.html',
  styleUrls: ['./asignar-ciudad.component.css']
})

export class AsignarCiudadComponent implements OnInit {

  // Datos Ciudad-Feriado
  ciudadFeriados: any = [];
  nombreProvincias: any = [];

  actualizarPagina: boolean = false;

  // Habilitar o deshabilitar selector de ciudades
  Habilitar: boolean = true;

  // Datos Provincias, Continentes, Países y Ciudades
  provincias: any = [];
  seleccionarProvincia;
  continentes: any = [];
  seleccionarContinente;
  paises: any = [];
  seleccionarPaises;
  nombreCiudades: any = [];
  seleccionarCiudad;

  filteredOptPais: Observable<string[]>;
  filteredOptProv: Observable<string[]>;
  filteredOptCiud: Observable<string[]>;

  // Control de los campos del formulario
  nombreCiudadF = new FormControl('');
  idProvinciaF = new FormControl('', [Validators.required]);
  nombreContinenteF = new FormControl('', Validators.required);
  nombrePaisF = new FormControl('', Validators.required);
  tipoF = new FormControl('');

  // Asignar los campos en un formulario en grupo
  public asignarCiudadForm = new FormGroup({
    nombreCiudadForm: this.nombreCiudadF,
    idProvinciaForm: this.idProvinciaF,
    nombreContinenteForm: this.nombreContinenteF,
    nombrePaisForm: this.nombrePaisF,
    tipoForm: this.tipoF,
  });

  /**
   * Variables progress spinner
   */
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;
  habilitarprogress: boolean = false;

  constructor(
    private restF: CiudadFeriadosService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<AsignarCiudadComponent>,
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
    this.filteredOptCiud = this.nombreCiudadF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterCiudad(value))
      );
  }

  // Arreglos para guardar las ciudades seleccionadas
  ciudadesSeleccionadas = [];

  AgregarCiudad(data: string) {
    this.ciudadesSeleccionadas.push(data);
  }

  QuitarCiudad(data) {
    this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== data);
  }

  // Agregar datos multiples de ciudades de la provincia indicada
  AgregarTodos() {
    console.log('ciudades', this.ciudadesSeleccionadas);
    if (this.ciudadesSeleccionadas.length === 0) {
      this.ciudadesSeleccionadas = this.nombreCiudades;
    }
    else {
      this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.concat(this.nombreCiudades);
    }
    for (var i = 0; i <= this.nombreCiudades.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('ciudadesSeleccionadas' + i)).checked = true;
    }
  }

  // Quitar todos los datos seleccionados de la provincia indicada
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.nombreCiudades;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('ciudadesSeleccionadas' + i)).checked = false;
      this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== this.nombreCiudades[i]);
      console.log('retirar', this.nombreCiudades[i]);
    }
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
    })
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
      this.toastr.info('No ha seleccionado ninguna opción','', {
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
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados','', {
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
      this.toastr.info('No ha seleccionado ninguna opción','', {
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
      console.log('ciudades', this.nombreCiudades);
      this.Habilitar = false;
      if (this.ciudadesSeleccionadas.length != 0) {
        (<HTMLInputElement>document.getElementById('selecTodo')).checked = false;
      }
      this.seleccionarCiudad = '';
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas','', {
        timeOut: 6000,
      })
    })
  }

  FiltrarCiudades(form) {
    var nombreProvincia = form.idProvinciaForm;
    if (nombreProvincia === 'Seleccionar') {
      this.toastr.info('No ha seleccionado ninguna opción','', {
        timeOut: 6000,
      })
      this.seleccionarCiudad = '';
    }
    else {
      this.seleccionarCiudad = this.ObtenerCiudades(nombreProvincia);
    }
  }

  SeleccionarCiudad(form) {
    var nombreCiudad = form.nombreCiudadForm;
    if (nombreCiudad === undefined) {
      this.toastr.info('No ha seleccionado ninguna opción','', {
        timeOut: 6000,
      })
    }
  }

  LimpiarCampos() {
    this.asignarCiudadForm.reset();
    this.ObtenerContinentes();
    this.paises = [];
    this.provincias = [];
    this.nombreCiudades = [];
    this.Habilitar = true;
    this.habilitarprogress = false;
  }

  CerrarVentanaAsignarCiudad() {
    this.LimpiarCampos();
    this.dialogRef.close();
    this.habilitarprogress = false;
  }

  InsertarFeriadoCiudad() {
    if (this.ciudadesSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      this.ciudadesSeleccionadas.map(obj => {
        var buscarCiudad = {
          id_feriado: this.data.feriado.id,
          id_ciudad: obj.id
        }
        this.ciudadFeriados = [];
        this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
          this.ciudadFeriados = datos;
          this.toastr.info('Se le recuerda que ' + obj.descripcion + ' ya fue asignada a este Feriado','', {
            timeOut: 6000,
          })
          this.habilitarprogress = false;
        }, error => {
          this.habilitarprogress = true;
          this.restF.CrearCiudadFeriado(buscarCiudad).subscribe(response => {
            this.toastr.success('Operación Exitosa', 'Ciudad asignada a Feriado', {
              timeOut: 6000,
            });
            this.habilitarprogress = false;
          }, error => {
            this.toastr.error('Operación Fallida', 'Ciudad no pudo ser asignada a Feriado', {
              timeOut: 6000,
            })
          });
        });
      });
      this.actualizarPagina = this.data.actualizar;
      if (this.actualizarPagina === true) {
        this.LimpiarCampos();
      }
      else {
        this.dialogRef.close();
        this.router.navigate(['/verFeriados/', this.data.feriado.id]);
      }
    }
    else {
      this.toastr.info('No ha seleccionado ninguna opción','', {
        timeOut: 6000,
      })
    }

    console.log('prueba', this.ciudadesSeleccionadas)
  }

}
