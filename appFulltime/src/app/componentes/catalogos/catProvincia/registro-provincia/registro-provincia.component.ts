import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { ProvinciaService } from 'src/app/servicios/catalogos/catProvincias/provincia.service';

@Component({
  selector: 'app-registro-provincia',
  templateUrl: './registro-provincia.component.html',
  styleUrls: ['./registro-provincia.component.css'],
})

export class RegistroProvinciaComponent implements OnInit {

  paises: any = [];
  continentes: any = [];

  filteredOptions: Observable<string[]>;

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  nombreContinenteF = new FormControl('');
  nombreProvinciaF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  nombrePaisF = new FormControl('', [Validators.required]);

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    nombreContinenteForm: this.nombreContinenteF,
    nombreProvinciaForm: this.nombreProvinciaF,
    nombrePaisForm: this.nombrePaisF,
  });

  constructor(
    private rest: ProvinciaService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<RegistroProvinciaComponent>,
  ) { }

  ngOnInit(): void {
    this.BuscarProvincias();
    this.continentes = this.ObtenerContinentes();
  }

  // METODO PARA FILTRAR DATOS 
  private _filter(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.paises.filter(pais => pais.nombre.toLowerCase().includes(filterValue));
    }
  }

  // CONSULTAR LISTA DE CONTINENTES
  ObtenerContinentes() {
    this.continentes = [];
    this.rest.BuscarContinente().subscribe(datos => {
      this.continentes = datos;
    })
  }

  // CONSULTAR LISTA DE PAISES DE ACUERDO AL CONTINENTE
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.rest.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.filteredOptions = this.nombrePaisF.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value))
        );
    })
  }

  // METODO PARA REALIZAR BUSQUEDAS POR FILTROS
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    this.ObtenerPaises(nombreContinente);
  }

  // METODO PARA BUSCAR PROVINCIAS
  BuscarProvincias() {
    this.provincias = [];
    this.rest.BuscarProvincias().subscribe(response => {
      this.provincias = response;
    })
  }

  // METODO PARA GUARDAR EL REGISTRO DE PROVINCIA
  provincias: any = [];
  contador: number = 0;
  InsertarProvincia(form: any) {
    let idPais = 0;
    // VALIDACION PAIS
    this.paises.forEach(obj => {
      if (obj.nombre.toUpperCase() === form.nombrePaisForm.toUpperCase()) {
        idPais = obj.id
      }
    });
    if (idPais === 0) {
      this.toastr.error('Verificar selección de país', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    }
    else {
      let provincia = {
        nombre: form.nombreProvinciaForm,
        id_pais: idPais,
      }
      // VALIDAR SI EXISTE REGISTRO DE PROVINCIA
      if (this.provincias.length != 0) {
        this.contador = 0;
        this.provincias.forEach(obj => {
          if (obj.nombre.toUpperCase() === form.nombreProvinciaForm.toUpperCase()) {
            this.contador = this.contador + 1;
          }
        })
        if (this.contador === 0) {
          this.GuardarProvincia(provincia);
        }
        else {
          this.toastr.error('Provincia ya se encuentra registrada.', 'Ups!!! algo salio mal.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.GuardarProvincia(provincia);
      }
    }
  }

  // METODO PARA REGISTRAR PROVINCIA EN BASE DE DATOS
  GuardarProvincia(provincia: any) {
    this.rest.RegistrarProvincia(provincia).subscribe(response => {
      this.toastr.success('Registro guardado exitosamente.', '', {
        timeOut: 6000,
      });
      this.LimpiarCampos();
    }, error => {
      this.toastr.error('Operación Fallida', 'Ups!!! algo salio mal.', {
        timeOut: 6000,
      });
    });
  }

  // METODO DE VALIDACION DE INGRESO DE LETRAS
  IngresarSoloLetras(e: any) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

  // METODO PARA LIMPIAR CAMPOS DEL FORMULARIO
  LimpiarCampos() {
    this.formulario.reset();
    this.ObtenerContinentes();
    this.paises = [];
  }

  // METODO PARA CERRAR FORMULARIO DE REGISTRO
  CerrarVentana() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
