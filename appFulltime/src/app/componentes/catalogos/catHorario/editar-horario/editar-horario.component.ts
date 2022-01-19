// IMPORTAR LIBRERIAS
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';


@Component({
  selector: 'app-editar-horario',
  templateUrl: './editar-horario.component.html',
  styleUrls: ['./editar-horario.component.css']
})

export class EditarHorarioComponent implements OnInit {

  // OPCIONES DE REGISTRO DE HORARIO
  nocturno = false;
  detalle = false;

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

  // VARIABLES DE CONTROL
  contador: number = 0;
  isChecked: boolean = false;

  // VARIABLES PROGRESS SPINNER
  mode: ProgressSpinnerMode = 'indeterminate';
  habilitarprogress: boolean = false;
  color: ThemePalette = 'primary';
  value = 10;

  constructor(
    public ventana: MatDialogRef<EditarHorarioComponent>, // VARIABLES DE NAVEGACIÓN ENTRE VENTANAS
    @Inject(MAT_DIALOG_DATA) public data: any, // VARIABLE DE DATOS DE VENTANAS
    public restD: DetalleCatHorariosService, // SERVICIO DE DATOS GENERALES
    public validar: ValidacionesService, // VARIABLE DE CONTROL DE VALIDACIONES
    private toastr: ToastrService, // VARIABLE DE MANEJO DE NOTIFICACIONES
    private rest: HorarioService, // SERVICIO DATOS DE HORARIO
    public router: Router, // VARIABLE DE MANEJO DE RUTAS
  ) { }

  ngOnInit(): void {
    // MÉTODO DE LECTURA DE DATOS
    this.nuevoHorarioForm.patchValue({
      horarioHoraTrabajoForm: this.data.horario.hora_trabajo.split(':')[0] + ':' + this.data.horario.hora_trabajo.split(':')[1],
      horarioMinAlmuerzoForm: this.data.horario.min_almuerzo,
      nombreCertificadoForm: this.data.horario.doc_nombre,
      horarioNombreForm: this.data.horario.nombre,
      detalleForm: this.data.horario.detalle,
      tipoForm: this.data.horario.nocturno,
    });

    if (this.data.horario.doc_nombre != '' && this.data.horario.doc_nombre != null) {
      this.HabilitarBtn = true;
      this.isChecked = true;
    }
    else {
      this.HabilitarBtn = false;
      this.isChecked = false;
    }
    if (this.data.horario.nocturno === true) {
      this.nocturno = true;
    } else {
      this.nocturno = false;
    }
    if (this.data.horario.detalle === true) {
      this.detalle = true;
    } else {
      this.detalle = false;
    }
  }

  // MÉTODO PARA REGISTRAR DATOS DE HORARIO
  ModificarHorario(form) {
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
    // VERIFICAR SI SE SUBE UN ARCHIVO
    if (form.nombreCertificadoForm === '') {
      this.rest.VerificarDuplicadosEdicion(this.data.horario.id, form.horarioNombreForm).subscribe(response => {
        this.toastr.info('Nombre de horario ya se encuentra registrado.', 'Verificar Datos.', {
          timeOut: 6000,
        });
        this.habilitarprogress = false;
      }, error => {
        dataHorario.doc_nombre = null;
        this.rest.putHorarioRest(this.data.horario.id, dataHorario).subscribe(response => {
          this.RegistrarAuditoria(dataHorario);
          this.ModificarDocumento();
          this.toastr.success('Operación Exitosa', 'Horario actualizado.', {
            timeOut: 6000,
          });
          if (dataHorario.min_almuerzo === 0) {
            this.EliminarDetallesComida();
          }
          if (dataHorario.detalle === false) {
            this.EliminarTodoDetalles();
          }
          this.SalirActualizar(dataHorario, response);
        }, error => {
          this.toastr.error('Operación Fallida', 'Horario no pudo ser actualizado.', {
            timeOut: 6000,
          })
        });
      });
    }
    else {
      if (this.contador === 0) {
        this.rest.VerificarDuplicadosEdicion(this.data.horario.id, form.horarioNombreForm).subscribe(response => {
          this.habilitarprogress = false;
          this.toastr.info(response.message, 'Verificar Datos', {
            timeOut: 6000,
          });
        }, error => {
          this.GuardarDatos(dataHorario);
        });
      }
      else {
        this.rest.VerificarDuplicadosEdicion(this.data.horario.id, form.horarioNombreForm).subscribe(response => {
          this.habilitarprogress = false;
          this.toastr.info(response.message, 'Verificar Datos', {
            timeOut: 6000,
          });
        }, error => {
          this.ActualizarDatos(dataHorario);
        });
      }
    }
  }

// MÉTODO QUE VERIFICA TAMAÑO DE ARCHIVO SELECCIONADO
  ActualizarDatos(datos) {
    this.habilitarprogress = true;
    if (this.archivoSubido[0].size <= 2e+6) {
      this.rest.putHorarioRest(this.data.horario.id, datos).subscribe(response => {
        this.RegistrarAuditoria(datos);
        this.habilitarprogress = false;
        this.toastr.success('Operación Exitosa', 'Horario actualizado', {
          timeOut: 6000,
        });
        if (datos.min_almuerzo === 0) {
          this.EliminarDetallesComida();
        }
        if (datos.detalle === false) {
          this.EliminarTodoDetalles();
        }
        this.SubirRespaldo(this.data.horario.id);
        this.SalirActualizar(datos, response);
      }, error => {
        this.toastr.error('Operación Fallida.', 'Horario no pudo ser actualizado.', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.toastr.warning('El archivo ha excedido el tamaño permitido.', 'Tamaño de archivos permitido máximo 2MB.', {
        timeOut: 6000,
      });
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

  // MÉTODO PARA VER U OCULTAR SELECCIÓN DE ARCHIVO
  HabilitarBtn: boolean = false;
  deseleccionarArchivo() {
    this.archivoSubido = [];
    this.isChecked = false;
    this.LimpiarNombreArchivo();
  }

  // MÉTODO PARA ACTUALIZAR DOCUMENTO
  ModificarDocumento() {
    this.habilitarprogress = true;
    let datoDocumento = {
      documento: null
    }
    this.rest.EditarDocumento(this.data.horario.id, datoDocumento).subscribe(response => {
      this.habilitarprogress = false;
    }, error => { });
  }

  // MÉTODO PARA GURADAR DATOS SIN UN ARCHIVO SELECCIONADO
  GuardarDatos(datos) {
    this.habilitarprogress = true;
    this.rest.putHorarioRest(this.data.horario.id, datos).subscribe(response => {
      this.RegistrarAuditoria(datos);
      this.habilitarprogress = false;
      this.toastr.success('Operación Exitosa', 'Horario actualizado', {
        timeOut: 6000,
      });
      if (datos.min_almuerzo === 0) {
        this.EliminarDetallesComida();
      }
      if (datos.detalle === false) {
        this.EliminarTodoDetalles();
      }
      this.SalirActualizar(datos, response);
    }, error => {
      this.habilitarprogress = false;

      this.toastr.error('Operación Fallida', 'Horario no pudo ser actualizado', {
        timeOut: 6000,
      })
    });
  }

  // MÉTODO PARA INGRESAR SOLO NÚMEROS
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

  // MÉTODO PARA LIMPIAR CAMPOS DE FORMULARIO
  LimpiarCampos() {
    this.nuevoHorarioForm.reset();
  }

  LimpiarNombreArchivo() {
    this.nuevoHorarioForm.patchValue({
      nombreCertificadoForm: '',
    });
  }

  // MÉTODO PARA SELECCIONAR UN ARCHIVO
  nameFile: string;
  archivoSubido: Array<File>;
  fileChange(element) {
    this.contador = 1;
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      this.nuevoHorarioForm.patchValue({ nombreCertificadoForm: name });
      this.HabilitarBtn = true
    }
  }

  // MÉTODO PARA GURDAR DATOS DE ARCHIVO SELECCIONADO
  SubirRespaldo(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirArchivoRespaldo(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Documento subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  // MÉTODO PRA CERRAR VENTANAS
  CerrarVentanaEditarHorario() {
    this.ventana.close();
  }

  // MÉTODO PARA NAVEGAR ENTRE VENTANAS
  SalirActualizar(datos, response) {
    if (this.data.actualizar === false) {
      this.LimpiarCampos();
      this.ventana.close(response);
      if (datos.detalle != false) {
        this.router.navigate(['/verHorario/', this.data.horario.id]);
      }
    }
    else {
      this.LimpiarCampos();
      this.ventana.close(response);
      if (datos.detalle != true) {
        this.router.navigate(['/horario']);
      }
    }

  }

  // MÉTODO PARA CAMBIAR SEGUNDOS A HORAS
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

  // MÉTODO PARA BUSCAR DETALLES Y ELIMINAR SOLO DETALLES DE COMIDA
  detalles_horarios: any = [];
  EliminarDetallesComida() {
    this.restD.ConsultarUnDetalleHorario(this.data.horario.id).subscribe(res => {
      this.detalles_horarios = res;
      this.detalles_horarios.map(det => {
        if (det.tipo_accion === 'E/A') {
          this.EliminarDetalle(det.id);
        }
        if (det.tipo_accion === 'S/A') {
          this.EliminarDetalle(det.id);
        }
      })
    }, error => { })
  }

  EliminarTodoDetalles() {
    this.restD.ConsultarUnDetalleHorario(this.data.horario.id).subscribe(res => {
      this.detalles_horarios = res;
      this.detalles_horarios.map(det => {
        this.EliminarDetalle(det.id);
      })
    }, error => { })
  }


  // MÉTODO PARA ELIMINAR DETALLE DE COMIDAS
  EliminarDetalle(id_detalle: number) {
    this.restD.EliminarRegistro(id_detalle).subscribe(res => {
    });
  }

  // MÉTODO PARA AUDITAR CATÁLOGO HORARIOS
  data_nueva: any = [];
  RegistrarAuditoria(dataHorario) {
    this.data_nueva = [];
    this.data_nueva = dataHorario;
    this.validar.Auditar('app-web', 'cg_horarios', this.data.horario, this.data_nueva, 'UPDATE');
  }

}
