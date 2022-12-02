import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ThemePalette } from '@angular/material/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { FeriadosService } from 'src/app/servicios/catalogos/catFeriados/feriados.service';

@Component({
  selector: 'app-asignar-ciudad',
  templateUrl: './asignar-ciudad.component.html',
  styleUrls: ['./asignar-ciudad.component.css']
})

export class AsignarCiudadComponent implements OnInit {

  // DATOS CIUDAD-FERIADO
  ciudadFeriados: any = [];
  nombreProvincias: any = [];

  actualizarPagina: boolean = false;

  // HABILITAR O DESHABILITAR SELECTOR DE CIUDADES
  Habilitar: boolean = true;

  // DATOS PROVINCIAS, CONTINENTES, PAÍSES Y CIUDADES
  nombreCiudades: any = [];
  continentes: any = [];
  provincias: any = [];
  paises: any = [];
  id_feriado: string;

  filteredOptPais: Observable<string[]>;
  filteredOptProv: Observable<string[]>;

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombreContinenteF = new FormControl('', Validators.required);
  nombreCiudadF = new FormControl('');
  idProvinciaF = new FormControl('', [Validators.required]);
  nombrePaisF = new FormControl('', Validators.required);
  tipoF = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    nombreCiudadForm: this.nombreCiudadF,
    idProvinciaForm: this.idProvinciaF,
    nombrePaisForm: this.nombrePaisF,
    tipoForm: this.tipoF,
  });

  /**
   * VARIABLES PROGRESS SPINNER
   */
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'indeterminate';
  value = 10;

  constructor(
    private restF: CiudadFeriadosService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    private feriado_: FeriadosService,
    private router: Router,
  ) {
    // OBTENER ID DE REGISTRO
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.id_feriado = aux[2];
  }

  ngOnInit(): void {
    this.ObtenerContinentes();
    this.BuscarDatosFeriado(parseInt(this.id_feriado));
  }

  // METODO PARA BUSCAR INFORMACION DE UN FERIADO
  feriado: any = [];
  BuscarDatosFeriado(idFeriado: number) {
    this.feriado = [];
    this.feriado_.ConsultarUnFeriado(idFeriado).subscribe(data => {
      this.feriado = data[0];
      this.feriado.descripcion = this.feriado.descripcion.toUpperCase();
    })
  }

  // METODO PARA FILTRAR DATOS DE PAISES
  private _filterPais(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA FILTRAR DATOS DE PROVINCIAS
  private _filterProvincia(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.provincias.filter(provincias => provincias.nombre.toLowerCase().includes(filterValue));
    }
  }

  // METODO PARA LISTAR CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.restP.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
    })
  }

  // METODO PARA BUSCAR PAISES
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.restP.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.filteredOptPais = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filterPais(value))
        );
    })
  }

  // METODO PARA MOSTRAR LISTA EN FORMULARIO
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
  }

  // METODO PARA BUSCAR PROVINCIAS
  ObtenerProvincias(pais: any) {
    this.provincias = [];
    this.restP.BuscarProvinciaPais(pais).subscribe(datos => {
      this.provincias = datos;
      this.filteredOptProv = this.idProvinciaF.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filterProvincia(value))
        );
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA MOSTRAR LISTA EN FORMULARIO
  FiltrarProvincias(form: any) {
    let idPais = 0;
    this.paises.forEach(obj => {
      if (obj.nombre === form.nombrePaisForm) {
        idPais = obj.id
      }
    });
    this.ObtenerProvincias(idPais);
  }

  // METODO PARA LISTAR CIUDADES
  ObtenerCiudades(provincia: any) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
      this.Habilitar = false;
      if (this.ciudadesSeleccionadas.length != 0) {
        (<HTMLInputElement>document.getElementById('seleccionar')).checked = false;
      }
    }, error => {
      this.toastr.info('Provincia, Departamento o Estado no tiene ciudades registradas.', '', {
        timeOut: 6000,
      })
    })
  }

  // METODO PARA MOSTRAR LISTA DE CIUDADES
  FiltrarCiudades(form: any) {
    var nombreProvincia = form.idProvinciaForm;
    this.ObtenerCiudades(nombreProvincia);
  }

  // METODO PARA SELECCIONAR AGREGAR CIUDADES
  ciudadesSeleccionadas = [];
  AgregarCiudad(data: string) {
    this.ciudadesSeleccionadas.push(data);
  }

  // METODO PARA RETIRAR CIUDADES
  QuitarCiudad(data: any) {
    this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== data);
  }

  // AGREGAR DATOS MULTIPLES DE CIUDADES DE LA PROVINCIA INDICADA
  AgregarTodos() {
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

  // QUITAR TODOS LOS DATOS SELECCIONADOS DE LA PROVINCIA INDICADA
  limpiarData: any = [];
  QuitarTodos() {
    this.limpiarData = this.nombreCiudades;
    for (var i = 0; i <= this.limpiarData.length - 1; i++) {
      (<HTMLInputElement>document.getElementById('ciudadesSeleccionadas' + i)).checked = false;
      this.ciudadesSeleccionadas = this.ciudadesSeleccionadas.filter(s => s !== this.nombreCiudades[i]);
    }
  }

  // METODO PARA ASIGNAR CIUDADES A FERIADO
  InsertarFeriadoCiudad() {
    // VALIDAR SI SE HA SELECCIONADO CIUDADES
    if (this.ciudadesSeleccionadas.length != 0) {
      this.habilitarprogress = true;
      // RECORRER LA LISTA DE CIUDADES SELECCIONADAS
      this.ciudadesSeleccionadas.map(obj => {
        var buscarCiudad = {
          id_feriado: parseInt(this.id_feriado),
          id_ciudad: obj.id
        }
        // BUSCAR ID DE CIUDADES EXISTENTES
        this.ciudadFeriados = [];
        this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
          this.ciudadFeriados = datos;
          this.habilitarprogress = false;
          this.toastr.info('Se le recuerda que ' + obj.descripcion + ' ya fue asignada a este Feriado.', '', {
            timeOut: 6000,
          })
        }, error => {
          this.habilitarprogress = false;
          this.restF.CrearCiudadFeriado(buscarCiudad).subscribe(response => {
            this.toastr.success('Operación Exitosa.', 'Ciudad asignada a Feriado.', {
              timeOut: 1000,
            });
          }, error => {
            this.toastr.error('Operación Fallida.', 'Ups!!! algo salio mal.', {
              timeOut: 6000,
            })
          });
        });
      });
      this.CerrarVentana();
    }
    else {
      this.toastr.info('No ha seleccionado CIUDADES.', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
  }

  // METODO PARA CERRAR VENTA DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.router.navigate(['/verFeriados', this.id_feriado]);
  }
}
