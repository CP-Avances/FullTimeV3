import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { RegimenService } from 'src/app/servicios/catalogos/catRegimen/regimen.service';

@Component({
  selector: 'app-registro-contrato',
  templateUrl: './registro-contrato.component.html',
  styleUrls: ['./registro-contrato.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class RegistroContratoComponent implements OnInit {

  isChecked: boolean = false;
  habilitarSeleccion: boolean = true;
  habilitarContrato: boolean = false;

  // Datos Régimen
  regimenLaboral: any = [];
  empleados: any = [];
  seleccionarRegimen;

  // Control de campos y validaciones del formulario
  idEmpleadoF = new FormControl('', [Validators.required]);
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
    idEmpleadoForm: this.idEmpleadoF,
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
    private rest: EmpleadoService,
    private restR: RegimenService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<RegistroContratoComponent>,
    @Inject(MAT_DIALOG_DATA) public datoEmpleado: any
  ) { }

  ngOnInit(): void {
    console.log(this.datoEmpleado);
    this.regimenLaboral = this.ObtenerRegimen();
    this.ObtenerEmpleados(this.datoEmpleado);
    this.ObtenerTipoContratos();
    this.tipoContrato[this.tipoContrato.length] = { descripcion: "OTRO" };
  }

  ObtenerRegimen() {
    this.regimenLaboral = [];
    console.log('obtener regimen');

    this.restR.ConsultarRegimen().subscribe(datos => {
      console.log(datos);

      this.regimenLaboral = datos;
      this.regimenLaboral[this.regimenLaboral.length] = { nombre: "Seleccionar Régimen" };
      this.seleccionarRegimen = this.regimenLaboral[this.regimenLaboral.length - 1].nombre;
    })
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

  // metodo para ver la informacion del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.rest.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.ContratoForm.patchValue({
        idEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
      })
    })
  }

  ValidarDatosContrato(form) {
    if (form.fechaSalidaForm === '' || form.fechaSalidaForm === null) {
      form.fechaSalidaForm = null;
      this.InsertarContrato(form);
    } else {
      if (Date.parse(form.fechaIngresoForm) < Date.parse(form.fechaSalidaForm)) {
        this.InsertarContrato(form);
      }
      else {
        this.toastr.info('La fecha de salida debe ser mayor a la fecha de ingreso', '', {
          timeOut: 6000,
        })
      }
    }
  }

  contador: number = 0;
  InsertarContrato(form) {
    let datosContrato = {
      id_empleado: this.datoEmpleado,
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
            this.ValidarDuplicidad(datosContrato, form);
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
      this.ValidarDuplicidad(datosContrato, form);
    }
  }

  ValidarDuplicidad(datos, form): any {
    this.revisarFecha = [];
    this.rest.BuscarContratoEmpleadoRegimen(this.datoEmpleado).subscribe(data => {
      console.log(data);

      this.revisarFecha = data;
      var ingreso = String(moment(datos.fec_ingreso, "YYYY/MM/DD").format("YYYY-MM-DD"));
      console.log('fechas', ingreso, ' ', this.revisarFecha);
      for (var i = 0; i <= this.revisarFecha.length - 1; i++) {
        console.log('fechas1', this.revisarFecha[i].fec_ingreso.split('T')[0]);
        if (this.revisarFecha[i].fec_ingreso.split('T')[0] === ingreso) {
          this.contador = 1;
        }
      }
      if (this.contador === 1) {
        this.toastr.error('La fecha de ingreso de contrato ya se encuentra registrada.', 'Contrato ya existe.', {
          timeOut: 6000,
        })
        this.contador = 0;
      }
      else {
        this.RegistrarContrato(form, datos);
      }
    }, error => {
      this.RegistrarContrato(form, datos);
    });
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

  HabilitarBtn: boolean = false;
  deseleccionarArchivo() {
    this.archivoSubido = [];
    this.isChecked = false;
    this.HabilitarBtn = false;
    this.LimpiarNombreArchivo();
    this.archivoForm.patchValue('');
  }

  nameFile: string;
  archivoSubido: Array<File>;

  fileChange(element) {
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

  idContratoRegistrado: any;
  revisarFecha: any = [];
  GuardarDatos(datos) {
    if (this.archivoSubido[0].size <= 2e+6) {
      this.rest.CrearContratoEmpleado(datos).subscribe(response => {
        this.toastr.success('Operación Exitosa', 'Contrato registrado', {
          timeOut: 6000,
        })
        this.idContratoRegistrado = response;
        console.log('ver id', response);
        this.CargarContrato(this.idContratoRegistrado.id);
        this.CerrarVentanaRegistroContrato();
      }, error => {
        this.toastr.error('Operación Fallida', 'Contrato no fue registrado', {
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

  RegistrarContrato(form, datos) {
    if (form.nombreContratoForm === '') {
      this.rest.CrearContratoEmpleado(datos).subscribe(response => {
        this.toastr.success('Operación Exitosa', 'Contrato registrado', {
          timeOut: 6000,
        })
        this.CerrarVentanaRegistroContrato();
      }, error => {
        this.toastr.error('Operación Fallida', 'Contrato no fue registrado', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.GuardarDatos(datos);
    }
  }

  LimpiarCampos() {
    this.ContratoForm.reset();
    this.contador = 0;
  }

  LimpiarNombreArchivo() {
    this.ContratoForm.patchValue({
      nombreContratoForm: '',
    });
  }

  CerrarVentanaRegistroContrato() {
    this.LimpiarCampos();
    this.dialogRef.close();
    //window.location.reload();
  }


  VerTiposContratos() {
    this.ContratoForm.patchValue({
      contratoForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.habilitarContrato = false;
    this.habilitarSeleccion = true;
  }

}
