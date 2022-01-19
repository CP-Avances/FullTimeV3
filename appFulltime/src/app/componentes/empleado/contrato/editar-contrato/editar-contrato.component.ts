import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-contrato',
  templateUrl: './editar-contrato.component.html',
  styleUrls: ['./editar-contrato.component.css']
})
export class EditarContratoComponent implements OnInit {

  idSelectContrato: number;
  idEmpleado: number;

  // Datos Régimen
  regimenLaboral: any = [];
  seleccionarRegimen;

  contador: number = 0;

  isChecked: boolean;

  habilitarSeleccion: boolean = true;
  habilitarContrato: boolean = false;

  // Control de campos y validaciones del formulario
  idRegimenF = new FormControl('', [Validators.required]);
  fechaIngresoF = new FormControl('', [Validators.required]);
  fechaSalidaF = new FormControl('');
  controlVacacionesF = new FormControl('', [Validators.required]);
  controlAsistenciaF = new FormControl('', [Validators.required]);
  nombreContratoF = new FormControl('');
  archivoForm = new FormControl('');
  tipoF = new FormControl('');
  contratoF = new FormControl('', [Validators.minLength(3)]);

  // Asignación de validaciones a inputs del formulario
  public ContratoForm = new FormGroup({
    idRegimenForm: this.idRegimenF,
    fechaIngresoForm: this.fechaIngresoF,
    fechaSalidaForm: this.fechaSalidaF,
    controlVacacionesForm: this.controlVacacionesF,
    controlAsistenciaForm: this.controlAsistenciaF,
    nombreContratoForm: this.nombreContratoF,
    tipoForm: this.tipoF,
    contratoForm: this.contratoF
  });

  constructor(
    private restRegimen: RegimenService,
    private rest: EmpleadoService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<EditarContratoComponent>,
    @Inject(MAT_DIALOG_DATA) public contrato: any
  ) { }

  ngOnInit(): void {
    console.log(this.contrato);
    this.idSelectContrato = this.contrato.id;
    this.idEmpleado = this.contrato.id_empleado;
    this.ObtenerRegimen();
    this.ObtenerTipoContratos();
    this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
  }

  llenarContratoSeleccionado() {
    const { id_regimen, fec_ingreso, fec_salida, vaca_controla, asis_controla, doc_nombre, id_tipo_contrato } = this.contrato;
    
    this.ContratoForm.patchValue({
      idRegimenForm: id_regimen,
      fechaIngresoForm: fec_ingreso,
      fechaSalidaForm: fec_salida,
      controlVacacionesForm: vaca_controla,
      controlAsistenciaForm: asis_controla,
      nombreContratoForm: doc_nombre,
      tipoForm: id_tipo_contrato
    });

    if (this.contrato.doc_nombre != '' && this.contrato.doc_nombre != null) {
      this.HabilitarBtn = true;
      this.isChecked = true;
    }
    else {
      this.HabilitarBtn = false;
      this.isChecked = false;
    }

  }

  ObtenerRegimen() {
    this.regimenLaboral = [];
    this.restRegimen.ConsultarRegimen().subscribe(datos => {
      this.regimenLaboral = datos;
      this.llenarContratoSeleccionado();
      // this.regimenLaboral[this.regimenLaboral.length] = { nombre: "Seleccionar Régimen" };
      // this.seleccionarRegimen = this.regimenLaboral[this.regimenLaboral.length - 1].nombre;
    })
  }

  ValidarDatosContrato(form) {
    if (form.fechaSalidaForm === '' || form.fechaSalidaForm === null) {
      form.fechaSalidaForm = null;
      this.ActualizarContrato(form);
    } else {
      if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
        this.ActualizarContrato(form);
      }
      else {
        this.toastr.info('La fecha de salida debe ser mayor a la fecha de ingreso', '', {
          timeOut: 6000,
        })
      }
    }
  }

  HabilitarBtn: boolean = false;
  deseleccionarArchivo() {
    this.archivoSubido = [];
    this.isChecked = false;
    this.LimpiarNombreArchivo();
  }


  ActualizarContrato(form) {
    let datosContrato = {
      fec_ingreso: form.fechaIngresoForm,
      fec_salida: form.fechaSalidaForm,
      vaca_controla: form.controlVacacionesForm,
      asis_controla: form.controlAsistenciaForm,
      id_regimen: form.idRegimenForm,
      doc_nombre: form.nombreContratoForm,
      id_tipo_contrato: form.tipoForm
    };
    if (form.tipoForm === undefined) {
      if (form.contratoForm != '') {
        let tipo_contrato = {
          descripcion: form.contratoForm
        }
        this.rest.CrearTiposContrato(tipo_contrato).subscribe(res => {
          // Buscar id de último cargo ingresado
          this.rest.BuscarUltimoTiposContratos().subscribe(data => {
            // Buscar id de último cargo ingresado
            datosContrato.id_tipo_contrato = data[0].id;
            if (datosContrato.fec_ingreso === this.contrato.fec_ingreso) {
              this.RegistrarContrato(datosContrato);
            }
            else {
              this.ValidarDuplicidad(datosContrato, form);
            }
          });
        });
      }
      else {
        this.toastr.info('Ingresar el nuevo cargo a desempeñar', 'Verificar datos', {
          timeOut: 6000,
        });
      }
    }
    else {
      if (datosContrato.fec_ingreso === this.contrato.fec_ingreso) {
        this.RegistrarContrato(datosContrato);
      }
      else {
        this.ValidarDuplicidad(datosContrato, form);
      }
    }

  }

  revisarFecha: any = [];
  duplicado: number = 0;
  ValidarDuplicidad(datos, form): any {
    this.revisarFecha = [];
    this.rest.BuscarContratoEmpleadoRegimen(this.contrato.id_empleado).subscribe(data => {
      this.revisarFecha = data;
      var ingreso = String(moment(datos.fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
      console.log('fechas', ingreso, ' ', this.revisarFecha);
      for (var i = 0; i <= this.revisarFecha.length - 1; i++) {
        console.log('fechas1', this.revisarFecha[i].fec_ingreso.split('T')[0]);
        if (this.revisarFecha[i].fec_ingreso.split('T')[0] === ingreso) {
          this.duplicado = 1;
        }
      }
      if (this.duplicado === 1) {
        this.toastr.error('La fecha de ingreso de contrato ya se encuentra registrada.', 'Contrato ya existe.', {
          timeOut: 6000,
        })
        this.duplicado = 0;
      }
      else {
        if (form.nombreContratoForm === '') {
          datos.doc_nombre = null;
          this.rest.ActualizarContratoEmpleado(this.idSelectContrato, this.idEmpleado, datos).subscribe(response => {
            this.toastr.success('Operación Exitosa', 'Datos de Contrato Actualizado', {
              timeOut: 6000,
            });
            this.ModificarDocumento();
            this.dialogRef.close(datos);
          }, error => {
            this.toastr.error('Operación Fallida', 'Datos de Contrato no fueron actualizados', {
              timeOut: 6000,
            })
          });
        }
        else {
          this.RegistrarContrato(datos);
        }
      }
    });
  }

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
    this.contador = 1;
    this.archivoSubido = element.target.files;
    if (this.archivoSubido.length != 0) {
      const name = this.archivoSubido[0].name;
      console.log(this.archivoSubido[0].name);
      this.ContratoForm.patchValue({ nombreContratoForm: name });
      this.HabilitarBtn = true;
    }

  }

  CargarContrato(id: number) {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("uploads[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.rest.SubirContrato(formData, id).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Contrato subido con exito', {
        timeOut: 6000,
      });
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }

  ModificarDocumento() {
    let datoDocumento = {
      documento: null
    }
    this.rest.EditarDocumento(this.idSelectContrato, datoDocumento).subscribe(response => {
    }, error => { });
  }

  GuardarDatos(datos) {
    this.rest.ActualizarContratoEmpleado(this.idSelectContrato, this.idEmpleado, datos).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Datos de Contrato actualizado', {
        timeOut: 6000,
      });
      this.dialogRef.close(datos)
    }, error => {
      this.toastr.error('Operación Fallida', 'Datos de Contrato no pudieron ser actualizados', {
        timeOut: 6000,
      })
    });
  }

  RegistrarContrato(datos) {
    if (this.contador === 0) {
      this.GuardarDatos(datos);
    }
    else {
      this.ActualizarDatos(datos);
    }
  }

  ActualizarDatos(datos) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.rest.ActualizarContratoEmpleado(this.idSelectContrato, this.idEmpleado, datos).subscribe(response => {
        this.toastr.success('Operación Exitosa', 'Datos de Contrato actualizado', {
          timeOut: 6000,
        });
        this.CargarContrato(this.idSelectContrato);
        this.dialogRef.close(datos)
      }, error => {
        this.toastr.error('Operación Fallida', 'Datos de Contrato no pudieron ser actualizados', {
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

  LimpiarNombreArchivo() {
    this.ContratoForm.patchValue({
      nombreContratoForm: '',
    });
  }

  cancelar() {
    console.log("cancelado");
    this.dialogRef.close(false)
  }

  VerTiposContratos() {
    this.ContratoForm.patchValue({
      contratoForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.habilitarContrato = false;
    this.habilitarSeleccion = true;
  }

  estilo: any;
  IngresarOtro(form) {
    if (form.tipoForm === undefined) {
      this.ContratoForm.patchValue({
        contratoForm: '',
      });
      this.estilo = { 'visibility': 'visible' }; this.habilitarContrato = true;
      this.toastr.info('Ingresar nombre del nuevo tipo de contrato.', 'Etiqueta Tipo Contrato activa', {
        timeOut: 6000,
      })
      this.habilitarSeleccion = false;
    }
  }

  // Método para obtener tipos de contratos
  tipoContrato: any = [];
  ObtenerTipoContratos() {
    this.tipoContrato = [];
    this.rest.BuscarTiposContratos().subscribe(datos => {
      this.tipoContrato = datos;
      this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
    })
  }

}
