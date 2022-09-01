// IMPORTAR LIBRERIAS
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

// IMPORTAR SERVICIOS
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

// IMPORTAR COMPONENTES
import { VerEmpleadoComponent } from '../../ver-empleado/ver-empleado.component';
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

  // DATOS EXTRAIDOS DEL COMPONENTE IMPORTADO
  @Input() idEmploy: string;
  @Input() dvacuna: any;

  constructor(
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE VACUNACIÓN
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS DE NAVEGACIÓN
    public validar: ValidacionesService, // VARIABLE USADA EN VALIDACIONES
    public metodos: VerEmpleadoComponent, // VARIABLE USADA PARA LEER MÉTODO DE COMPONENTE IMPORTADO
    public toastr: ToastrService, // VARIABLE USADA EN NOTIFICACIONES
  ) { }

  ngOnInit(): void {
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    this.MostrarDatos();
  }

  // VARIABLES DE ALMACENAMINETO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  fechaF = new FormControl('');
  nombreF = new FormControl('');
  archivoF = new FormControl('');
  vacunaF = new FormControl('');
  certificadoF = new FormControl('');

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

  // MÉTODO PARA QUITAR ARCHIVO SELECCIONADO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoF.patchValue('');
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

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.vacunaForm.reset();
    this.HabilitarBtn = false;
  }

  // MÉTODO PARA CERRAR VENTANA DE REGISTRO
  CerrarRegistro() {
    this.metodos.mostrarVacunaEditar = false;
    this.metodos.btnVacuna = 'Añadir';
  }

  // MÉTODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.vacunaForm.patchValue({
      certificadoForm: '',
    });
  }

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
  GuardarDatosCarnet(form) {
    let dataCarnet = {

      id_tipo_vacuna: form.vacunaForm,
      descripcion: form.nombreForm,
      nom_carnet: form.certificadoForm,
      id_empleado: parseInt(this.idEmploy),
      fecha: form.fechaForm,
    }

    if (this.dvacuna.nom_carnet != '' && this.dvacuna.nom_carnet != null &&
      (form.certificadoForm === '' || form.certificadoForm === null || form.certificadoForm === undefined)) {
      dataCarnet.nom_carnet = this.dvacuna.nom_carnet;
    }

    this.restVacuna.ActualizarRegistroVacuna(this.dvacuna.id, dataCarnet).subscribe(response => {
      this.toastr.success('', 'Registro Vacunación guardado.', {
        timeOut: 6000,
      });
      this.metodos.ObtenerDatosVacunas(this.metodos.formato_fecha);
      if (form.certificadoForm === '' || form.certificadoForm === null || form.certificadoForm === undefined) {
        this.CerrarRegistro();
      }
    }, error => { });
  }

  // MÉTODO PARA GUARDAR ARCHIVO SELECCIONADO
  CargarDocumento() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restVacuna.SubirDocumento(formData, this.dvacuna.id).subscribe(res => {
      this.archivoF.reset();
      this.nameFile = '';
    });
  }

  // MÉTODO PARA GUARDAR DATOS DE REGISTROS SI EL ARCHIVO CUMPLE CON LOS REQUISITOS
  VerificarArchivo(form) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.GuardarDatosCarnet(form);
      this.CargarDocumento();
      this.metodos.ObtenerDatosVacunas(this.metodos.formato_fecha);
      this.CerrarRegistro();
    }
    else {
      this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA REGISTRAR DATOS EN EL SISTEMA
  GuardarDatosSistema(form) {
    if (form.certificadoForm != '' && form.certificadoForm != null && form.certificadoForm != undefined) {
      this.VerificarArchivo(form);
    }
    else {
      this.GuardarDatosCarnet(form);
    }
  }

}
