// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';

// IMPORTAR COMPONENTES
import { TipoVacunaComponent } from '../tipo-vacuna/tipo-vacuna.component';

@Component({
  selector: 'app-editar-vacuna',
  templateUrl: './editar-vacuna.component.html',
  styleUrls: ['./editar-vacuna.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class EditarVacunaComponent implements OnInit {

  idEmploy: string;
  dvacuna: any;

  constructor(
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE VACUNACIÓN
    public validar: ValidacionesService, // VARIABLE USADA EN VALIDACIONES
    public toastr: ToastrService, // VARIABLE USADA EN NOTIFICACIONES
    private ventana_: MatDialogRef<EditarVacunaComponent>,
    public ventana: MatDialog,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    this.idEmploy = this.datos.idEmpleado;
    this.dvacuna = this.datos.vacuna;
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    this.MostrarDatos();
  }

  // VARIABLES DE ALMACENAMINETO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  certificadoF = new FormControl('');
  seleccion = new FormControl('');
  archivoF = new FormControl('');
  nombreF = new FormControl('');
  vacunaF = new FormControl('');
  fechaF = new FormControl('');

  // FORMULARIO DENTRO DE UN GRUPO
  public vacunaForm = new FormGroup({
    certificadoForm: this.certificadoF,
    vacunaForm: this.vacunaF,
    archivoForm: this.archivoF,
    nombreForm: this.nombreF,
    fechaForm: this.fechaF,
  });

  // MÉTODO PARA CONSULTAR DATOS DE TIPO DE VACUNA
  ObtenerTipoVacunas() {
    this.tipoVacuna = [];
    this.restVacuna.ListarTiposVacuna().subscribe(data => {
      this.tipoVacuna = data;
      this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    });
  }

  // MÉTODO PARA MOSTRAR DATOS DE VACUNA
  MostrarDatos() {
    this.vacunaForm.patchValue({
      fechaForm: this.dvacuna.fecha,
      vacunaForm: this.dvacuna.id_tipo_vacuna,
      nombreForm: this.dvacuna.descripcion
    })
  }

  // VENTANA DE REGISTRO DE TIPO DE VACUNA
  AbrirTipoVacuna() {
    this.ventana.open(TipoVacunaComponent,
      { width: '300px' }).afterClosed().subscribe(item => {
        this.ObtenerTipoVacunas();
      });
  }

  // MÉTODO PARA VISUALIZAR CAMPO REGISTRO DE TIPO DE VACUNA
  AbrirVentana(form: any) {
    if (form.vacunaForm === undefined) {
      this.AbrirTipoVacuna();
    }
  }

  // MÉTODO PARA GUARDAR DATOS DE REGISTRO DE VACUNACIÓN 
  GuardarDatosCarnet(form: any) {
    let vacuna = {
      id_tipo_vacuna: form.vacunaForm,
      descripcion: form.nombreForm,
      id_empleado: parseInt(this.idEmploy),
      fecha: form.fechaForm,
    }
    this.VerificarInformacion(vacuna, form);
  }

  GuardarDatos(datos: any) {
    this.restVacuna.ActualizarRegistroVacuna(this.dvacuna.id, datos).subscribe(response => {
      this.toastr.success('', 'Registro Vacunación guardado.', {
        timeOut: 6000,
      });
    });
  }

  VerificarInformacion(datos: any, form: any) {
    if (this.opcion === 1) {
      let eliminar = {
        documento: this.dvacuna.carnet,
        id: parseInt(this.dvacuna.id)
      }
      this.GuardarDatos(datos);
      this.restVacuna.EliminarArchivo(eliminar).subscribe(res => {
      });
      this.CerrarRegistro();
    }
    else if (this.opcion === 2) {
      if (form.certificadoForm != '' && form.certificadoForm != null) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.EliminarCarnetServidor();
          this.GuardarDatos(datos);
          this.CargarDocumento(form);
          this.CerrarRegistro();
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
      else {
        this.toastr.info('No ha seleccionado ningún archivo.', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.GuardarDatos(datos);
      this.CerrarRegistro();
    }
  }

  EliminarCarnetServidor() {
    let eliminar = {
      documento: this.dvacuna.carnet,
    }
    console.log('eliminar...', eliminar)
    this.restVacuna.EliminarArchivoServidor(eliminar).subscribe(res => {
    });
  }

  /** ************************************************************************************************* **
   ** **                             CARGAR ARCHIVOS DE VACUNACION                                   ** **
   ** ************************************************************************************************* **/

  // MÉTODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoF.patchValue('');
  }

  // MÉTODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.vacunaForm.patchValue({
      certificadoForm: '',
    });
  }

  // MÉTODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.vacunaForm.patchValue({ certificadoForm: name });
      this.HabilitarBtn = true;
    }
  }

  // MÉTODO PARA GUARDAR ARCHIVO SELECCIONADO
  CargarDocumento(form: any) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restVacuna.SubirDocumento(formData, this.dvacuna.id, form.certificadoForm).subscribe(res => {
      this.archivoF.reset();
      this.nameFile = '';
    });
  }

  // METODOS DE ACTIVACION DE CARGA DE ARCHIVO 
  activar: boolean = false;
  opcion: number = 0;
  ActivarArchivo() {
    this.acciones = true;
    this.activar = true;
    this.opcion = 2;
  }

  // METODO PARA INDICAR QUE SE ELIMINE EL ARCHIVO DEL REGISTRO
  QuitarArchivo() {
    this.acciones = true;
    this.activar = false;
    this.opcion = 1;
    this.RetirarArchivo();
  }

  // METODO PARA CANCELAR OPCION SELECCIONADA
  acciones: boolean = false;
  LimpiarAcciones() {
    this.seleccion.reset();
    this.acciones = false;
    this.activar = false;
    this.RetirarArchivo();
    this.opcion = 0;
  }

  // MÉTODO PARA CERRAR VENTANA DE REGISTRO
  CerrarRegistro() {
    this.ventana_.close();
  }

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.vacunaForm.reset();
    this.HabilitarBtn = false;
  }
}
