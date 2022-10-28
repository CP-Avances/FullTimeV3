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
  seleccionarPaises: any;
  seleccionarContinente: any;

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
    this.continentes = this.ObtenerContinentes();
    this.filteredOptions = this.nombrePaisF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

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
      this.continentes[this.continentes.length] = { continente: "Seleccionar" };
      this.seleccionarContinente = this.continentes[this.continentes.length - 1].continente;
    })
  }

  // CONSULTAR LISTA DE PAISES DE ACUERDO AL CONTINENTE
  ObtenerPaises(continente: any) {
    this.paises = [];
    this.rest.BuscarPais(continente).subscribe(datos => {
      this.paises = datos;
      this.paises[this.paises.length] = { nombre: "Seleccionar" };
      this.seleccionarPaises = this.paises[this.paises.length - 1].nombre;
    })
  }

  // METODO PARA REALIZAR BUSQUEDAS POR FILTROS
  FiltrarPaises(form: any) {
    var nombreContinente = form.nombreContinenteForm;
    if (nombreContinente === 'Seleccionar' || nombreContinente === '') {
      this.toastr.info('No ha seleccionado ninguna opción', '', {
        timeOut: 6000,
      })
      this.paises = [];
      this.seleccionarPaises = '';
    }
    else {
      this.seleccionarPaises = this.ObtenerPaises(nombreContinente);
    }
  }

  // METODO PARA GUARDAR EL REGISTRO DE PROVINCIA
  provincias: any = [];
  contador: number = 0;
  InsertarProvincia(form: any) {
    this.provincias = [];
    let idPais: any;
    this.paises.forEach(obj => {
      if (obj.nombre === form.nombrePaisForm) {
        idPais = obj.id
      }
    });
    let dataProvincia = {
      nombre: form.nombreProvinciaForm,
      id_pais: idPais,
    };

    if (dataProvincia.id_pais === 'Seleccionar') {
      this.toastr.info('Seleccionar un país', '', {
        timeOut: 6000,
      })
    }
    else {
      this.rest.getProvinciasRest().subscribe(response => {
        this.provincias = response;
        this.provincias.forEach(obj => {
          if (obj.nombre.toUpperCase() === form.nombreProvinciaForm.toUpperCase()) {
            this.contador = this.contador + 1;
          }
        })
        if (this.contador === 0) {
          this.rest.postProvinciaRest(dataProvincia).subscribe(response => {
            this.toastr.success('Registro guardado', 'Provincia - Departamento - Estado', {
              timeOut: 6000,
            });
            this.LimpiarCampos();
          }, error => {
            this.toastr.error('Operación Fallida', 'Provincia no pudo ser registrada', {
              timeOut: 6000,
            });
          });
        }
        else {
          this.toastr.error('La provincia ya se encuentra registrada.', 'Nombre Duplicado', {
            timeOut: 6000,
          });
        }
      })
    }
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

  // MENSAJE DE ERROR 
  ObtenerMensajeProvinciaRequerido() {
    if (this.nombreProvinciaF.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombreProvinciaF.hasError('pattern') ? 'Ingrese un nombre válido' : '';
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
