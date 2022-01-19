import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CiudadFeriadosService } from 'src/app/servicios/ciudadFeriados/ciudad-feriados.service';
import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';
import { CiudadService } from 'src/app/servicios/ciudad/ciudad.service'
import { ThemePalette } from '@angular/material/core';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-editar-ciudad',
  templateUrl: './editar-ciudad.component.html',
  styleUrls: ['./editar-ciudad.component.css']
})
export class EditarCiudadComponent implements OnInit {

  // Datos Ciudad-Feriado
  ciudadFeriados: any = [];
  nombreProvincias: any = [];

  actualizarPagina: boolean = false;

  // Datos Provincias, Continentes, Países y Ciudades
  provincias: any = [];
  continentes: any = [];
  seleccionarContinente;
  paises: any = [];
  nombreCiudades: any = [];

  // Buscar ID
  idProv: any = [];
  idPais: any = [];
  idContin: any = [];

  // Control de los campos del formulario
  nombreCiudadF = new FormControl('', [Validators.required]);
  idProvinciaF = new FormControl('', [Validators.required]);
  nombreContinenteF = new FormControl('', Validators.required);
  nombrePaisF = new FormControl('', Validators.required);

  // Asignar los campos en un formulario en grupo
  public asignarCiudadForm = new FormGroup({
    nombreCiudadForm: this.nombreCiudadF,
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
    private restF: CiudadFeriadosService,
    private restP: ProvinciaService,
    private toastr: ToastrService,
    private router: Router,
    public dialogRef: MatDialogRef<EditarCiudadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.continentes = this.ObtenerContinentes();
    this.CargarDatos();
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
      this.paises[this.paises.length] = { nombre: "Seleccionar" };
    })
  }

  FiltrarPaises(form) {
    var nombreContinente = form.nombreContinenteForm;
    if (nombreContinente === 'Seleccionar' || nombreContinente === '') {
      this.toastr.info('No ha seleccionado ninguna opción','', {
        timeOut: 6000,
      })
      this.limpiarDatosContinente();
    }
    else {
      this.ObtenerPaises(nombreContinente);
      this.limpiarDatosContinente();
    }
  }

  ObtenerProvincias(pais) {
    this.provincias = [];
    this.restP.BuscarUnaProvincia(pais).subscribe(datos => {
      this.provincias = datos;
      this.provincias[this.provincias.length] = { nombre: "Seleccionar" };
    }, error => {
      this.toastr.info('El País seleccionado no tiene Provincias, Departamentos o Estados registrados','', {
        timeOut: 6000,
      })
    })
  }

  FiltrarProvincias(form) {
    var nombrePais = form.nombrePaisForm;
    if (nombrePais === undefined) {
      this.toastr.info('No ha seleccionado ninguna opción','', {
        timeOut: 6000,
      })
      this.limpiarDatosPais()
    }
    else {
      this.ObtenerProvincias(nombrePais);
      this.limpiarDatosPais()
    }
  }

  ObtenerCiudades(provincia) {
    this.nombreCiudades = [];
    this.restF.BuscarCiudadProvincia(provincia).subscribe(datos => {
      this.nombreCiudades = datos;
      this.nombreCiudades[this.nombreCiudades.length] = { descripcion: "Seleccionar" };
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
      });
      this.limpiarDatosProvincia();
    }
    else {
      this.ObtenerCiudades(nombreProvincia);
      this.limpiarDatosProvincia();
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
  }

  limpiarDatosContinente() {
    this.paises = [];
    this.provincias = [];
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombrePaisForm: '',
      nombreCiudadForm: '',
      idProvinciaForm: '',
    })
  }

  limpiarDatosPais() {
    this.provincias = [];
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombreCiudadForm: '',
      idProvinciaForm: '',
    })
  }

  limpiarDatosProvincia() {
    this.nombreCiudades = [];
    this.asignarCiudadForm.patchValue({
      nombreCiudadForm: '',
    })
  }

  CerrarVentanaAsignarCiudad() {
    this.LimpiarCampos();
    this.dialogRef.close();
    this.habilitarprogress === false;
  }

  InsertarFeriadoCiudad(form) {
    this.habilitarprogress === true;
    var idFeriado = this.data.idferiado;
    var nombreCiudad = form.nombreCiudadForm;
    if (nombreCiudad != 'Seleccionar') {
      var buscarCiudad = {
        id_feriado: idFeriado,
        id_ciudad: nombreCiudad,
        id: this.data.idciudad_asignada
      }
      this.ciudadFeriados = [];
      this.restF.BuscarIdCiudad(buscarCiudad).subscribe(datos => {
        this.ciudadFeriados = datos;
        this.toastr.info('Se le recuerda que esta Ciudad ya fue asignada a este Feriado','', {
          timeOut: 6000,
        })
        this.CargarDatos();
        this.habilitarprogress === false;
      }, error => {
        this.restF.ActualizarDatos(buscarCiudad).subscribe(response => {
          this.habilitarprogress === false;
          this.toastr.success('Operación Exitosa', 'Datos Actualizados', {
            timeOut: 6000,
          });
          this.CerrarVentanaAsignarCiudad();
        }, error => {
          this.toastr.error('Operación Fallida', 'Ciudad no pudo ser asignada a Feriado', {
            timeOut: 6000,
          });
          this.habilitarprogress === false;
        });
        this.habilitarprogress === false;
      });
    } else {
      this.toastr.info('Debe seleccionar una ciudad','', {
        timeOut: 6000,
      });
      this.habilitarprogress === false;
    }
  }

  CargarDatos() {
    // Buscar datos de la ciudad
    this.restCiudad.getUnaCiudadRest(this.data.idciudad).subscribe(datosC => {
      this.idProv = datosC;
      //Buscar datos de la provincia
      this.restP.BuscarUnaProvinciaId(this.idProv[0].id_provincia).subscribe(datosP => {
        this.idPais = datosP;
        // Cargar provincias del pais establecido
        this.ObtenerProvincias(this.idPais[0].id_pais);
        // Cargar ciudades de la provincia establecida
        this.ObtenerCiudades(this.idPais[0].nombre);
        // Imprimir datos en pantalla
        this.asignarCiudadForm.patchValue({
          idProvinciaForm: this.idPais[0].nombre,
        })
        // Buscar datos del pais
        this.restP.BuscarPaisId(this.idPais[0].id_pais).subscribe(datosC => {
          this.idContin = datosC;
          // Cargar datos del pais establecido
          this.ObtenerPaises(this.idContin[0].continente);
          // Mostrar datos en pantalla
          this.seleccionarContinente = this.idContin[0].continente;
          this.asignarCiudadForm.patchValue({
            nombreContinenteForm: this.idContin[0].continente,
            nombrePaisForm: this.idContin[0].id,
            nombreCiudadForm: this.data.idciudad,
          })
        })
      })
    })
  }


}
