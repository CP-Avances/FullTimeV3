// IMPORTAR LIBRERIAS
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
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
    public ventana: MatDialog, // VARIABLE DE MANEJO DE VENTANAS DE NAVEGACIÓN
    public toastr: ToastrService, // VARIABLE USADA EN NOTIFICACIONES
    public validar: ValidacionesService, // VARIABLE USADA EN VALIDACIONES
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE VACUNACIÓN
    public metodos: VerEmpleadoComponent, // VARIABLE USADA PARA LEER MÉTODO DE COMPONENTE IMPORTADO
  ) { }

  ngOnInit(): void {
    this.ObtenerTipoVacunas();
    this.tipoVacuna[this.tipoVacuna.length] = { nombre: "OTRO" };
    this.MostrarDatos();
    console.log('ver', this.dvacuna)
  }

  // VARIABLES DE SLECCIÓN DE DOSIS
  estado_1: boolean = false;
  estado_2: boolean = false;
  estado_3: boolean = false;

  // VARIABLES PARA HABILITAR FECHAS
  fecha_1: boolean = false;
  fecha_2: boolean = false;
  fecha_3: boolean = false;

  // VARIABLES DE ALMACENAMINETO DE DATOS
  tipoVacuna: any = [];

  // VALIDACIONES DE CAMPOS DE FORMULARIO
  fecha1F = new FormControl('');
  fecha2F = new FormControl('');
  fecha3F = new FormControl('');
  nombreF = new FormControl('');
  archivoF = new FormControl('');
  vacuna_1F = new FormControl('');
  vacuna_2F = new FormControl('');
  vacuna_3F = new FormControl('');
  certificadoF = new FormControl('');

  // FORMULARIO DENTRO DE UN GRUPO
  public vacunaForm = new FormGroup({
    certificadoForm: this.certificadoF,
    vacuna_1Form: this.vacuna_1F,
    vacuna_2Form: this.vacuna_2F,
    vacuna_3Form: this.vacuna_3F,
    archivoForm: this.archivoF,
    nombreForm: this.nombreF,
    fecha1Form: this.fecha1F,
    fecha2Form: this.fecha2F,
    fecha3Form: this.fecha3F,

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
      fecha1Form: this.dvacuna.fecha_1,
      fecha2Form: this.dvacuna.fecha_2,
      fecha3Form: this.dvacuna.fecha_3,
      vacuna_1Form: this.dvacuna.id_tipo_vacuna_1,
      vacuna_2Form: this.dvacuna.id_tipo_vacuna_2,
      vacuna_3Form: this.dvacuna.id_tipo_vacuna_3,
    })
    this.estado_1 = this.fecha_1 = this.dvacuna.dosis_1;
    this.estado_2 = this.fecha_2 = this.dvacuna.dosis_2;
    this.estado_3 = this.fecha_3 = this.dvacuna.dosis_3;
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
    this.estado_1 = false;
    this.estado_2 = false;
    this.estado_3 = false;
    this.fecha_1 = false;
    this.fecha_2 = false;
    this.fecha_3 = false;
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
  AbrirVentana(form, opcion: number) {
    if (opcion === 1) {
      if (form.vacuna_1Form === 'OTRO') {
        this.AbrirTipoVacuna();
      }
    }
    else if (opcion === 2) {
      if (form.vacuna_2Form === 'OTRO') {
        this.AbrirTipoVacuna();
      }
    }
    else if (opcion === 3) {
      if (form.vacuna_3Form === 'OTRO') {
        this.AbrirTipoVacuna();
      }
    }
  }

  // MÉTODO PARA GUARDAR DATOS DE REGISTRO DE VACUNACIÓN 
  GuardarDatosCarnet(form) {
    let dataCarnet = {
      dosis_1: this.estado_1,
      dosis_2: this.estado_2,
      dosis_3: this.estado_3,
      fecha_1: form.fecha1Form,
      fecha_2: form.fecha2Form,
      fecha_3: form.fecha3Form,
      nom_carnet: form.certificadoForm,
      id_tipo_vacuna_2: form.vacuna_2Form,
      id_tipo_vacuna_3: form.vacuna_3Form,
      id_tipo_vacuna_1: form.vacuna_1Form,
    }
    if(dataCarnet.id_tipo_vacuna_1 === ''){
      dataCarnet.id_tipo_vacuna_1 = null;
    }
    if(dataCarnet.id_tipo_vacuna_2 === ''){
      dataCarnet.id_tipo_vacuna_2 = null;
    }
    if(dataCarnet.id_tipo_vacuna_3 === ''){
      dataCarnet.id_tipo_vacuna_3 = null;
    }
    if (this.dvacuna.nom_carnet != '' && this.dvacuna.nom_carnet != null &&
      (form.certificadoForm === '' || form.certificadoForm === null || form.certificadoForm === undefined)) {
      dataCarnet.nom_carnet = this.dvacuna.nom_carnet;
    }
    this.MensajeFechas(form, dataCarnet);
    this.restVacuna.ActualizarRegistroVacuna(this.dvacuna.id, dataCarnet).subscribe(response => {
      this.toastr.success(this.mensaje, 'Registro Vacunación guardado.', {
        timeOut: 6000,
      });
      this.metodos.ObtenerDatosVacunas();
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
      this.metodos.ObtenerDatosVacunas();
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

  // MÉTODO PARA VER CAMPO FECHA 1
  VerFecha_1(estado: boolean) {
    this.estado_1 = estado;
    if (this.estado_1 === true) {
      this.fecha_1 = true;
    }
    else {
      this.fecha_1 = false;
      this.fecha1F.reset();
    }
  }

  // MÉTODO PARA VER CAMPO FECHA 2
  VerFecha_2(estado: boolean) {
    this.estado_2 = estado;
    if (this.estado_2 === true) {
      this.fecha_2 = true;
    }
    else {
      this.fecha_2 = false;
      this.fecha2F.reset();
    }
  }

  // MÉTODO PARA VER CAMPO FECHA 3
  VerFecha_3(estado: boolean) {
    this.estado_3 = estado;
    if (this.estado_3 === true) {
      this.fecha_3 = true;
    }
    else {
      this.fecha_3 = false;
      this.fecha3F.reset();
    }
  }

  // MÉTODO PARA ENVIAR MENSAJE INDICANDO QUE DEBE ACTUALIZAR REGISTRO
  mensaje: string = '';
  MensajeFechas(form, datos: any) {
    let frase = 'Recuerde actualizar su registro de vacunación e ingresar fechas correspondientes a cada dosis recibida.';
    if (this.estado_1 === true) {
      if (form.fecha1Form === '' || form.fecha1Form === null || form.fecha1Form === undefined) {
        this.mensaje = frase;
        datos.fecha_1 = null;
      }
    }
    else {
      datos.fecha_1 = null;
    }
    if (this.estado_2 === true) {
      if (form.fecha2Form === '' || form.fecha2Form === null || form.fecha2Form === undefined) {
        this.mensaje = frase;
        datos.fecha_2 = null;
      }
    }
    else {
      datos.fecha_2 = null;
    }
    if (this.estado_3 === true) {
      if (form.fecha3Form === '' || form.fecha3Form === null || form.fecha3Form === undefined) {
        this.mensaje = frase;
        datos.fecha_3 = null;
      }
    }
    else {
      datos.fecha_3 = null;
    }
  }

}
