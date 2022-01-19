import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { TipoComidasService } from 'src/app/servicios/catalogos/catTipoComidas/tipo-comidas.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';

@Component({
  selector: 'app-solicita-comida',
  templateUrl: './solicita-comida.component.html',
  styleUrls: ['./solicita-comida.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class SolicitaComidaComponent implements OnInit {

  idComidaF = new FormControl('', Validators.required);
  idEmpleadoF = new FormControl('');
  fechaF = new FormControl('', [Validators.required]);
  observacionF = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  fechaPlanificacionF = new FormControl('', Validators.required);
  horaInicioF = new FormControl('', Validators.required);
  horaFinF = new FormControl('', Validators.required);
  tipoF = new FormControl('', Validators.required);;
  platosF = new FormControl('', Validators.required);;
  extraF = new FormControl('', [Validators.required]);

  // asignar los campos en un formulario en grupo
  public PlanificacionComidasForm = new FormGroup({
    idComidaForm: this.idComidaF,
    idEmpleadoForm: this.idEmpleadoF,
    fechaForm: this.fechaF,
    observacionForm: this.observacionF,
    fechaPlanificacionForm: this.fechaPlanificacionF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF,
    tipoForm: this.tipoF,
    platosForm: this.platosF,
    extraForm: this.extraF
  });

  tipoComidas: any = [];
  empleados: any = [];
  FechaActual: any;
  idEmpleadoLogueado: any;
  departamento: any;

  constructor(
    private toastr: ToastrService,
    private rest: TipoComidasService,
    public restE: EmpleadoService,
    public restPlan: PlanComidasService,
    public restUsuario: UsuarioService,
    public dialogRef: MatDialogRef<SolicitaComidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    console.log('datos', this.data, this.data.servicios, 'departamento', this.departamento)
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.MostrarDatos();
    this.ObtenerServicios();
    this.ObtenerEmpleados(this.data.idEmpleado);

  }

  descripcion: string;
  empleado_recibe: number;
  empleado_envia: number;
  tipo: string;
  MostrarDatos() {
    this.ObtenerEmpleados(this.data.idEmpleado);
    this.restUsuario.BuscarDatosUser(parseInt(this.idEmpleadoLogueado)).subscribe(data => {
      this.empleado_envia = this.data.idEmpleado;
      this.empleado_recibe = this.idEmpleadoLogueado;
    });
  }

  servicios: any = [];
  ObtenerServicios() {
    this.servicios = [];
    this.restPlan.ObtenerTipoComidas().subscribe(datos => {
      this.servicios = datos;
    })
  }

  // Al seleccionar un tipo de servicio se muestra la lista de menús registrados
  ObtenerPlatosComidas(form) {
    this.idComidaF.reset();
    this.platosF.reset();
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.tipoComidas = [];
    this.rest.ConsultarUnServicio(form.tipoForm).subscribe(datos => {
      this.tipoComidas = datos;
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registrados Menús para esta tipo de servicio.', {
        timeOut: 6000,
      })
    })
  }

  detalle: any = [];
  ObtenerDetalleMenu(form) {
    this.platosF.reset();
    this.horaInicioF.reset();
    this.horaFinF.reset();
    this.detalle = [];
    this.rest.ConsultarUnDetalleMenu(form.idComidaForm).subscribe(datos => {
      this.detalle = datos;
      this.PlanificacionComidasForm.patchValue({
        horaInicioForm: this.detalle[0].hora_inicio,
        horaFinForm: this.detalle[0].hora_fin
      })
    }, error => {
      this.toastr.info('Verificar la información.', 'No existen registros de Alimentación para este Menú.', {
        timeOut: 6000,
      })
    })
  }

  // metodo para ver la informacion del empleado 
  ObtenerEmpleados(idemploy: any) {
    this.empleados = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleados = data;
      console.log(this.empleados)
      this.PlanificacionComidasForm.patchValue({
        idEmpleadoForm: this.empleados[0].nombre + ' ' + this.empleados[0].apellido,
        fechaForm: this.FechaActual,
        extraForm: 'false'
      })
    })
  }

  contador: number = 0;
  InsertarPlanificacion(form) {
    let datosPlanComida = {
      id_empleado: this.data.idEmpleado,
      fecha: form.fechaForm,
      id_comida: form.platosForm,
      observacion: form.observacionForm,
      fec_comida: form.fechaPlanificacionForm,
      hora_inicio: form.horaInicioForm,
      hora_fin: form.horaFinForm,
      extra: form.extraForm,
      verificar: 'NO'
    };

    let datosDuplicados = {
      id: this.data.idEmpleado,
      fecha_inicio: form.fechaPlanificacionForm,
      fecha_fin: form.fechaPlanificacionForm
    }
    this.restPlan.BuscarDuplicadosFechas(datosDuplicados).subscribe(plan => {
      console.log('datos fechas', plan)
      this.toastr.info(this.empleados[0].nombre + ' ' + this.empleados[0].apellido + ' ya tiene registrada una planificación de alimentación en la fecha solicitada.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.restPlan.CrearSolicitudComida(datosPlanComida).subscribe(response => {
        this.EnviarNotificaciones(form.fechaPlanificacionForm);
        this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Registrado.', {
          timeOut: 6000,
        })
        this.CerrarRegistroPlanificacion();
      });
    });
  }

  ObtenerMensajeErrorObservacion() {
    if (this.observacionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
    return this.observacionF.hasError('required') ? 'Campo Obligatorio' : '';
  }

  CerrarRegistroPlanificacion() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  LimpiarCampos() {
    this.PlanificacionComidasForm.reset();
    this.ObtenerServicios();
  }


  jefes: any = [];
  envios: any = [];
  EnviarNotificaciones(fecha) {
    this.restPlan.obtenerJefes(this.departamento).subscribe(data => {
      this.jefes = [];
      this.jefes = data;
      this.jefes.map(obj => {
        let datosCorreo = {
          id_usua_solicita: this.data.idEmpleado,
          correo: obj.correo,
          comida_mail: obj.comida_mail,
          comida_noti: obj.comida_noti
        }
        this.restPlan.EnviarCorreo(datosCorreo).subscribe(envio => {
          this.envios = [];
          this.envios = envio;
          console.log('datos envio', this.envios.notificacion);
          if (this.envios.notificacion === true) {
            this.NotificarPlanificacion(this.data.idEmpleado, obj.empleado, fecha);
          }
        });
      })
    });
  }

  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, fecha) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: 'Solicitó Alimentación ' + ' para ' + moment(fecha).format('YYYY-MM-DD')
    }
    console.log(mensaje);
    this.restPlan.EnviarMensajePlanComida(mensaje).subscribe(res => {
      console.log(res.message);
    })
  }

  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
        timeOut: 6000,
      })
      return false;
    }
  }

}
