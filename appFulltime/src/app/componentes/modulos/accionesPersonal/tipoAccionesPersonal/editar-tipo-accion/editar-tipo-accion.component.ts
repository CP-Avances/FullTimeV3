import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';

@Component({
  selector: 'app-editar-tipo-accion',
  templateUrl: './editar-tipo-accion.component.html',
  styleUrls: ['./editar-tipo-accion.component.css']
})

export class EditarTipoAccionComponent implements OnInit {

  selec1: boolean = false;
  selec2: boolean = false;
  selec3: boolean = false;

  // EVENTOS RELACIONADOS A SELECCIÓN E INGRESO DE PROCESOS PROPUESTOS
  ingresoTipo: boolean = false;
  vistaTipo: boolean = true;

  // Control de campos y validaciones del formulario
  otroTipoF = new FormControl('', [Validators.minLength(3)]);
  descripcionF = new FormControl('', [Validators.required]);
  baseLegalF = new FormControl('', [Validators.required]);
  tipoAccionF = new FormControl('');
  tipoF = new FormControl('');

  // Asignación de validaciones a inputs del formulario
  public AccionesForm = new FormGroup({
    descripcionForm: this.descripcionF,
    baseLegalForm: this.baseLegalF,
    tipoForm: this.tipoF,
    tipoAccionForm: this.tipoAccionF,
    otroTipoForm: this.otroTipoF,
  });

  constructor(
    private rest: AccionPersonalService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarTipoAccionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.ObtenerTiposAccionPersonal();
    this.ObtenerTiposAccion();
    // DATOS VACIOS INDICAR LA OPCIÓN OTRO
    this.tipos[this.tipos.length] = { descripcion: "OTRO" };
    this.CargarDatos();
  }

  CargarDatos() {
    this.selec1 = false;
    this.selec2 = false;
    this.selec3 = false;
    this.AccionesForm.patchValue({
      tipoAccionForm: this.data.id_tipo,
      descripcionForm: this.data.descripcion,
      baseLegalForm: this.data.base_legal,
    })
    if (this.data.tipo_permiso === true) {
      this.selec1 = true;
      this.CambiarEstadosPermisos();
    }
    if (this.data.tipo_vacacion === true) {
      this.selec2 = true;
      this.CambiarEstadosVacaciones();
    }
    if (this.data.tipo_situacion_propuesta === true) {
      this.selec3 = true;
      this.CambiarEstadosSituacion();
    }
  }

  InsertarAccion(form) {
    let datosAccion = {
      id_tipo: form.tipoAccionForm,
      descripcion: form.descripcionForm,
      base_legal: form.baseLegalForm,
      tipo_permiso: this.selec1,
      tipo_vacacion: this.selec2,
      tipo_situacion_propuesta: this.selec3,
      id: this.data.id
    };
    if (form.tipoAccionForm != undefined) {
      this.GuardarInformacion(datosAccion);
    }
    else {
      this.IngresarNuevoTipo(form, datosAccion);
    }
  }

  contador: number = 0;
  GuardarInformacion(datosAccion) {
    this.contador = 0;
    this.tipos_acciones.map(obj => {
      if (obj.id_tipo === datosAccion.id_tipo) {
        this.contador = this.contador + 1;
      }
    });
    if (this.contador != 0) {
      this.toastr.error('El tipo de acción de personal seleccionado ya se encuentra registrado.',
        'Operación Fallida', {
        timeOut: 6000,
      })
    } else {
      this.rest.ActualizarDatos(datosAccion).subscribe(response => {
        this.toastr.success('Operación Exitosa', '', {
          timeOut: 6000,
        })
        this.CerrarVentanaRegistro();
      }, error => {
        this.toastr.error('Revisar los datos',
          'Operación Fallida', {
          timeOut: 6000,
        })
      });
    }
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCION_PERSONAL
  tipos_acciones: any = [];
  ObtenerTiposAccionPersonal() {
    this.tipos_acciones = [];
    this.rest.BuscarDatosTipoEdicion(this.data.id_tipo).subscribe(datos => {
      this.tipos_acciones = datos;
    })
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

  LimpiarCampos() {
    this.AccionesForm.reset();
  }

  CerrarVentanaRegistro() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  CambiarEstadosPermisos() {
    this.selec2 = false;
    this.selec3 = false;
    this.selec1 = true;
  }

  CambiarEstadosVacaciones() {
    this.selec1 = false;
    this.selec3 = false;
    this.selec2 = true;
  }

  CambiarEstadosSituacion() {
    this.selec1 = false;
    this.selec2 = false;
    this.selec3 = true;
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCION
  tipos: any = [];
  ObtenerTiposAccion() {
    this.tipos = [];
    this.rest.ConsultarTipoAccion().subscribe(datos => {
      this.tipos = datos;
      this.tipos[this.tipos.length] = { descripcion: "OTRO" };
    })
  }

  // METODO PARA ACTIVAR FORMULARIO DE INGRESO DE UN NUEVO TIPO_ACCION
  estiloT: any;
  IngresarTipoAccion(form) {
    if (form.tipoAccionForm === undefined) {
      this.AccionesForm.patchValue({
        otroTipoForm: '',
      });
      this.estiloT = { 'visibility': 'visible' }; this.ingresoTipo = true;
      this.toastr.info('Ingresar nombre de un nuevo tipo de acción personal.', '', {
        timeOut: 6000,
      })
      this.vistaTipo = false;
    }
  }

  // METODO PARA VER LA LISTA DE TIPOS_ACCION
  VerTiposAccion() {
    this.AccionesForm.patchValue({
      otroTipoForm: '',
    });
    this.estiloT = { 'visibility': 'hidden' }; this.ingresoTipo = false;
    this.vistaTipo = true;
  }

  // METODO PARA INGRESAR NUEVO PROCESO PROPUESTO
  IngresarNuevoTipo(form, datos: any) {
    if (form.otroTipoForm != '') {
      let tipo = {
        descripcion: form.otroTipoForm
      }
      this.VerificarDuplicidad(form, tipo, datos);
    }
    else {
      this.toastr.info('Ingresar una nueva opción o seleccionar una de la lista', 'Verificar datos', {
        timeOut: 6000,
      });
    }
  }

  contar: number = 0;
  VerificarDuplicidad(form, tipo, datos) {
    this.contar = 0;
    this.tipos.map(obj => {
      if (obj.descripcion.toUpperCase() === form.otroTipoForm.toUpperCase()) {
        this.contar = this.contar + 1;
      }
    });
    if (this.contar != 0) {
      this.toastr.error('El nombre de tipo de acción personal ingresado ya se encuentra dentro de la lista de tipos de acciones de personal.',
        'Operación Fallida', {
        timeOut: 6000,
      })
    } else {
      this.rest.IngresarTipoAccion(tipo).subscribe(resol => {
        // BUSCAR ID DE ÚLTIMO REGISTRO DE TIPO_ACCION
        this.rest.BuscarIdTipoAccion().subscribe(max => {
          datos.id_tipo = max[0].id;
          // INGRESAR DATOS DE REGISTRO LEGAL DE TIPO DE ACCIONES DE PERSONAL
          this.GuardarInformacion(datos);
        });
      });
    }
  }
}
