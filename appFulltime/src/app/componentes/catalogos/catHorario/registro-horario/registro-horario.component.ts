// IMPORTAR LIBRERIAS
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

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
  nombre = new FormControl('', [Validators.required, Validators.minLength(2)]);
  minAlmuerzo = new FormControl('', Validators.pattern('[0-9]*'));
  nombreCertificadoF = new FormControl('');
  archivoForm = new FormControl('');
  detalleF = new FormControl('');
  tipoF = new FormControl('');

  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public nuevoHorarioForm = new FormGroup({
    nombreCertificadoForm: this.nombreCertificadoF,
    horarioHoraTrabajoForm: this.horaTrabajo,
    horarioMinAlmuerzoForm: this.minAlmuerzo,
    horarioNombreForm: this.nombre,
    detalleForm: this.detalleF,
    tipoForm: this.tipoF,
  });


  // VARIABLES PROGRESS SPINNER
  mode: ProgressSpinnerMode = 'indeterminate';
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public ventana: MatDialogRef<RegistroHorarioComponent>, // VARIABLE MANEJO DE VENTANAS
    public validar: ValidacionesService, // SERVICIO PARA CONTROL DE VALIDACIONES
    private toastr: ToastrService, // VARIABLE PARA USO DE NOTIFICACIONES
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    public router: Router, // VARIABLE MANEJO DE RUTAS
  ) { }

  ngOnInit(): void {
  }

  // VARAIBLE DE ALMACENAMIENTO DE DATOS DE AUDITORIA
  data_nueva: any = [];

  // MÉTODO PARA TOMAR LOS DATOS DE HORARIO
  idHorario: any;
  InsertarHorario(form) {
    this.habilitarprogress = true;
    let dataHorario = {
      min_almuerzo: form.horarioMinAlmuerzoForm,
      hora_trabajo: form.horarioHoraTrabajoForm,
      doc_nombre: form.nombreCertificadoForm,
      nombre: form.horarioNombreForm,
      detalle: form.detalleForm,
      nocturno: form.tipoForm,
    };
    if (dataHorario.detalle === false) {
      dataHorario.hora_trabajo = this.StringTimeToSegundosTime(form.horarioHoraTrabajoForm)
    }
    else {
      dataHorario.hora_trabajo = this.CambiarFormato(form.horarioHoraTrabajoForm)
    }
    if (dataHorario.min_almuerzo === '' || dataHorario.min_almuerzo === null || dataHorario.min_almuerzo === undefined) {
      dataHorario.min_almuerzo = 0;
    }
    if (form.nombreCertificadoForm === '') {
      this.rest.VerificarDuplicados(form.horarioNombreForm).subscribe(response => {
        this.toastr.info('El nombre de horario ya existe, ingresar un nuevo nombre.', 'Verificar Datos', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      }, error => {
        this.rest.postHorarioRest(dataHorario).subscribe(hora => {
          this.RegistrarAuditoria(dataHorario);
          this.toastr.success('Operación Exitosa', 'Horario registrado', {
            timeOut: 6000,
          });
          this.habilitarprogress = false;
          if (dataHorario.detalle === true) {
            this.router.navigate(['/verHorario', hora.id]);
            this.ventana.close();
          }
          else {
            this.ventana.close();
          }
        }, error => {
          this.toastr.error('Operación Fallida', 'Horario no pudo ser registrado', {
            timeOut: 6000,
          });
          this.habilitarprogress = false;
        });
      });
    }
    else {
      this.rest.VerificarDuplicados(form.horarioNombreForm).subscribe(response => {
        this.toastr.info('El nombre de horario ya existe, ingresar un nuevo nombre.', 'Verificar Datos', {
          timeOut: 6000,
        });
      }, error => {
        this.GuardarDatos(dataHorario);
      });

    }
  }

  // MÉTODO PARA TRANSFORMAR SEGUNDOS EN HORAS
  StringTimeToSegundosTime(stringTime: string) {
    let hora = '';
    if (stringTime.split(':').length === 1) {
      if (parseInt(stringTime) < 10) {
        hora = '0' + parseInt(stringTime) + ':00:00';
        return hora;
      }
      else {
        hora = stringTime + ':00:00';
        return hora;
      }
    }
    else if (stringTime.split(':').length === 2) {
      if (parseInt(stringTime.split(':')[0]) < 10) {
        hora = '0' + String(parseInt(stringTime)).split(':')[0] + ':' + stringTime.split(':')[1] + ':00';
        return hora;
      }
      else {
        hora = stringTime.split(':')[0] + ':' + stringTime.split(':')[1] + ':00';
        return hora;
      }
    }
  }

  // MÉTODO PARA CAMBIAR FORMATO DE HORAS
  CambiarFormato(stringTime: string) {
    let horaT = '';
    if (stringTime.split(':').length === 1) {
      if (parseInt(stringTime) < 10) {
        horaT = '0' + parseInt(stringTime) + ':00';
        return horaT;
      }
      else {
        horaT = stringTime + ':00';
        return horaT;
      }
    }
    else if (stringTime.split(':').length === 2) {
      if (parseInt(stringTime.split(':')[0]) < 10) {
        horaT = '0' + String(parseInt(stringTime)).split(':')[0] + ':' + stringTime.split(':')[1];
        return horaT;
      }
      else {
        horaT = stringTime.split(':')[0] + ':' + stringTime.split(':')[1];
        return horaT;
      }
    }
  }

  GuardarDatos(datos) {
    this.habilitarprogress = true;
    if (this.archivoSubido[0].size <= 2e+6) {
      this.rest.postHorarioRest(datos).subscribe(response => {
        this.RegistrarAuditoria(datos);
        this.toastr.success('Operación Exitosa', 'Horario registrado', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
        this.LimpiarCampos();
        this.idHorario = response;
        this.SubirRespaldo(this.idHorario.id);
        if (datos.detalle === true) {
          this.router.navigate(['/verHorario', this.idHorario.id]);
          this.ventana.close();
        }
        else {
          this.ventana.close();
        }
      }, error => {
        this.habilitarprogress = false;
        this.toastr.error('Operación Fallida', 'Horario no pudo ser registrado', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.toastr.info('El archivo ha excedido el tamaño permitido', 'Tamaño de archivos permitido máximo 2MB', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA VALIDAR INGRESO DE NÚMEROS
  IngresarNumeroDecimal(evt) {
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

  IngresarSoloNumerosEnteros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  ObtenerMensajeErrorHoraTrabajo() {
    if (this.horaTrabajo.hasError('pattern')) {
      return 'Indicar horas y minutos. Ejemplo: 12:05';
    }
  }

  // MÉTODO PARA LIMPIAR FORMULARIOS
  LimpiarCampos() {
    this.nuevoHorarioForm.reset();
  }

  LimpiarNombreArchivo() {
    this.nuevoHorarioForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  // MÉTODO PARA HABILITAR VISTA DE SELECCIÓN DE ARCHIVO
  HabilitarBtn: boolean = false;
  deseleccionarArchivo() {
    this.archivoSubido = [];
    this.isChecked = false;
    this.LimpiarNombreArchivo();
  }

  // MÉTODO PARA SELECCIONAR ARCHIVO
  archivoSubido: Array<File>;
  nameFile: string;
  fileChange(element) {
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.nuevoHorarioForm.patchValue({ nombreCertificadoForm: name });
      this.HabilitarBtn = true
    }
  }

  // MÉTODO PARA REGISTRAR RESPALDO D ECREACIÓN DE HORARIO
  SubirRespaldo(id: number) {
    this.habilitarprogress = true;
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirArchivoRespaldo(formData, id).subscribe(res => {
      this.habilitarprogress = false;
      this.toastr.success('Operación Exitosa.', 'Documento subido con exito.', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // MÉTODO PARA CERRAR VENTANAS
  CerrarVentanaRegistroHorario() {
    this.LimpiarCampos();
    this.ventana.close();
  }

  // MÉTODO PARA AUDITAR CATÁLOGO HORARIOS
  RegistrarAuditoria(dataHorario) {
    this.data_nueva = [];
    this.data_nueva = dataHorario;
    this.validar.Auditar('app-web', 'cg_horarios', '', this.data_nueva, 'INSERT');
  }

}
