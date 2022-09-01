// IMPORTAR LIBRERIAS
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';

// IMPORTAR SERVICIOS
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';

// IMPORTAR COMPONENTES
import { VerEmpleadoComponent } from '../../ver-empleado/ver-empleado.component';
import { TipoVacunaComponent } from '../tipo-vacuna/tipo-vacuna.component';

@Component({
  selector: 'app-crear-vacuna',
  templateUrl: './crear-vacuna.component.html',
  styleUrls: ['./crear-vacuna.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class CrearVacunaComponent implements OnInit {

  // VARIABLE TOMADA DESDE EL COMPONENTE VER IMPORTADO
  @Input() idEmploy: string;

  constructor(
    public restVacuna: VacunacionService, // CONSULTA DE SERVICIOS DATOS DE VACUNACIÓN
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS DE NAVEGACIÓN
    public metodos: VerEmpleadoComponent, // VARIABLE USADA PARA EXTRAER MÉTODOS DEL COMPONENTEE IMPORTADO
    public toastr: ToastrService, // VARIABLE USADA PARA MENSAJES DE NOTIFICACIONES
  ) { }

  ngOnInit(): void {
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  certificadoF = new FormControl('');
  archivoF = new FormControl('');
  nombreF = new FormControl('');
  vacunaF = new FormControl('');
  fechaF = new FormControl('');

  // FORMULARIO DENTRO DE UN GRUPO
  public vacunaForm = new FormGroup({
    certificadoForm: this.certificadoF,
    archivoForm: this.archivoF,
    vacunaForm: this.vacunaF,
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
    this.metodos.MostrarVentanaVacuna();
  }

  // MÉTODO PARA LIMPIAR NOMBRE DEL ARCHIVO SELECCIONADO
  LimpiarNombreArchivo() {
    this.vacunaForm.patchValue({
      certificadoForm: '',
    });
  }

  // MÉTODO PARA VISUALIZAR CAMPO REGISTRO DE TIPO DE VACUNA
  AbrirVentana(form) {
    if (form.vacunaForm === undefined) {
      this.AbrirTipoVacuna();
    }
  }

  AbrirTipoVacuna() {
    this.ventana.open(TipoVacunaComponent,
      { width: '300px' }).afterClosed().subscribe(item => {
        this.ObtenerTipoVacunas();
      });
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
    this.GuardarDatosSistema(dataCarnet, form);
  }

  // MÉTODO PARA REGISTRAR DATOS EN EL SISTEMA
  GuardarDatosSistema(datos: any, form: any) {
    if (form.certificadoForm != '' && form.certificadoForm != null && form.certificadoForm != undefined) {
      this.VerificarArchivo(datos);
    }
    else {
      this.Registrar_sinCarnet(datos, form);
    }
  }

  Registrar_sinCarnet(datos: any, form: any) {
    this.restVacuna.CrearRegistroVacunacion(datos).subscribe(response => {
      this.toastr.success('', 'Registro guardado.', {
        timeOut: 6000,
      });
      this.metodos.ObtenerDatosVacunas(this.metodos.formato_fecha);
      if (form.certificadoForm === '' || form.certificadoForm === null || form.certificadoForm === undefined) {
        this.CerrarRegistro();
      }
    });
  }

  // MÉTODO PARA GUARDAR DATOS DE REGISTROS SI EL ARCHIVO CUMPLE CON LOS REQUISITOS
  VerificarArchivo(datos: any) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.CargarDocumento(datos);
      this.CerrarRegistro();
    }
    else {
      this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA GUARDAR ARCHIVO SELECCIONADO
  CargarDocumento(datos: any) {
    this.restVacuna.CrearRegistroVacunacion(datos).subscribe(vacuna => {
      let formData = new FormData();
      for (var i = 0; i < this.archivoSubido.length; i++) {
        formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
      }
      this.restVacuna.SubirDocumento(formData, vacuna.id).subscribe(res => {
        this.archivoF.reset();
        this.nameFile = '';
        this.toastr.success('', 'Registro guardado.', {
          timeOut: 6000,
        });
        this.metodos.ObtenerDatosVacunas(this.metodos.formato_fecha);
      });
    });
  }

}


