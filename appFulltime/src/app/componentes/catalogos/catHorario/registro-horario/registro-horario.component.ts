// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

@Component({
  selector: 'app-registro-horario',
  templateUrl: './registro-horario.component.html',
  styleUrls: ['./registro-horario.component.css'],
})

export class RegistroHorarioComponent implements OnInit {

  // VARIABLES DE OPCIONES DE REGISTRO DE HORARIO
  detalle = false;
  nocturno = false;
  isChecked: boolean = false;

  // VALIDACIONES PARA EL FORMULARIO
  horaTrabajo = new FormControl('', [Validators.required, Validators.pattern("^[0-9]*(:[0-9][0-9])?$")]);
  minAlmuerzo = new FormControl('', Validators.pattern('[0-9]*'));
  archivoForm = new FormControl('');
  documentoF = new FormControl('');
  detalleF = new FormControl('');
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  tipoF = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public nuevoHorarioForm = new FormGroup({
    horarioHoraTrabajoForm: this.horaTrabajo,
    horarioMinAlmuerzoForm: this.minAlmuerzo,
    horarioNombreForm: this.nombre,
    documentoForm: this.documentoF,
    detalleForm: this.detalleF,
    tipoForm: this.tipoF,
  });


  // VARIABLES PROGRESS SPINNER
  habilitarprogress: boolean = false;
  mode: ProgressSpinnerMode = 'indeterminate';
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public ventana: MatDialogRef<RegistroHorarioComponent>, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService, // SERVICIO PARA CONTROL DE VALIDACIONES
    public router: Router, // VARIABLE MANEJO DE RUTAS
    private toastr: ToastrService, // VARIABLE PARA USO DE NOTIFICACIONES
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
  ) { }

  ngOnInit(): void {
  }

  // VARAIBLE DE ALMACENAMIENTO DE DATOS DE AUDITORIA
  data_nueva: any = [];

  // MÉTODO PARA TOMAR LOS DATOS DE HORARIO
  idHorario: any;
  InsertarHorario(form: any) {
    this.habilitarprogress = true;
    let dataHorario = {
      min_almuerzo: form.horarioMinAlmuerzoForm,
      hora_trabajo: form.horarioHoraTrabajoForm,
      nocturno: form.tipoForm,
      detalle: form.detalleForm,
      nombre: form.horarioNombreForm,
    };

    if (dataHorario.detalle === false) {
      dataHorario.hora_trabajo = moment(form.horarioHoraTrabajoForm, 'HH:mm:ss').format('HH:mm:ss');
    }
    else {
      dataHorario.hora_trabajo = moment(form.horarioHoraTrabajoForm, 'HH:mm:ss').format('HH:mm');
    }

    if (dataHorario.min_almuerzo === '' || dataHorario.min_almuerzo === null || dataHorario.min_almuerzo === undefined) {
      dataHorario.min_almuerzo = 0;
    }

    this.rest.BuscarHorarioNombre(form.horarioNombreForm).subscribe(response => {
      this.toastr.info('El nombre de horario ya existe.', 'Verificar Datos.', {
        timeOut: 6000,
      });
      this.habilitarprogress = false;

    }, error => {
      this.GuardarDatos(dataHorario, form);
    });
  }


  // METODO PARA REGISTRAR DATOS DEL HORARIO
  GuardarDatos(datos: any, form: any) {
    this.rest.RegistrarHorario(datos).subscribe(response => {
      this.RegistrarAuditoria(datos);
      this.toastr.success('Operación Exitosa.', 'Horario registrado.', {
        timeOut: 6000,
      });

      if (this.isChecked === true && form.documentoForm != '') {
        this.SubirRespaldo(response.id, form);
      }

      this.LimpiarCampos();

      if (datos.detalle === true) {
        this.router.navigate(['/verHorario', response.id]);
        this.ventana.close();
      }
      else {
        this.ventana.close();
      }

    }, error => {
      this.habilitarprogress = false;
      this.toastr.error('Ups! algo salio mal.', '', {
        timeOut: 6000,
      })
    });
  }


  /** ********************************************************************************************* **
   ** **                             METODO PARA SUBIR ARCHIVO                                   ** **
   ** ********************************************************************************************* **/

  // MÉTODO PARA SELECCIONAR ARCHIVO
  archivoSubido: Array<File>;
  nameFile: string;
  fileChange(element: any) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      if (this.archivoSubido[0].size <= 2e+6) {
        this.nuevoHorarioForm.patchValue({ documentoForm: name });
        this.HabilitarBtn = true;
      }
      else {
        this.toastr.info('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
          timeOut: 6000,
        });
      }
    }
  }

  // MÉTODO PARA REGISTRAR RESPALDO D ECREACIÓN DE HORARIO
  SubirRespaldo(id: number, form: any) {
    this.habilitarprogress = true;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirArchivo(formData, id, form.documentoForm).subscribe(res => {
      this.habilitarprogress = false;
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // METODO PARA LIMPIAR CAMPO NOMBRE DE ARCHIVO
  LimpiarNombreArchivo() {
    this.nuevoHorarioForm.patchValue({
      documentoForm: '',
    });
  }

  // MÉTODO PARA HABILITAR VISTA DE SELECCIÓN DE ARCHIVO
  HabilitarBtn: boolean = false;
  RetirarArchivo() {
    this.isChecked = false;
    this.archivoSubido = [];
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }

  // MÉTODO PARA VALIDAR INGRESO DE NÚMEROS DECIMALES
  IngresarNumeroCaracter(evt: any) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6 || keynum == 58) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  // METODO PARA VALIDAR INGRESO DE NUMEROS
  IngresarSoloNumerosEnteros(evt: any) {
    this.validar.IngresarSoloNumeros(evt);
  }

  // MENSAJE QUE INDICA FORMATO DE INGRESO DE NUMERO DE HORAS
  ObtenerMensajeErrorHoraTrabajo() {
    if (this.horaTrabajo.hasError('pattern')) {
      return 'Indicar horas y minutos. Ejemplo: 12:05';
    }
  }

  // MÉTODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.nuevoHorarioForm.reset();
    this.habilitarprogress = false;
  }

  // MÉTODO PARA CERRAR VENTANA
  CerrarVentanaRegistroHorario() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // MÉTODO PARA AUDITAR CATÁLOGO HORARIOS
  RegistrarAuditoria(dataHorario: any) {
    this.data_nueva = [];
    this.data_nueva = dataHorario;
    this.validar.Auditar('app-web', 'cg_horarios', '', this.data_nueva, 'INSERT');
  }

}
