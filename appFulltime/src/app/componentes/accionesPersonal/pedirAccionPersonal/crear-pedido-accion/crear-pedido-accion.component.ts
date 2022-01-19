/** IMPORTACIÓN DE LIBRERIAS */
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import * as moment from 'moment';
/** IMPORTACIÓN DE SERVICIOS */
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { Router } from '@angular/router';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';

@Component({
  selector: 'app-crear-pedido-accion',
  templateUrl: './crear-pedido-accion.component.html',
  styleUrls: ['./crear-pedido-accion.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class CrearPedidoAccionComponent implements OnInit {

  // FILTRO DE NOMBRES DE LOS EMPLEADOS
  filtroNombreH: Observable<string[]>;
  filtroNombreG: Observable<string[]>;
  filtroNombre: Observable<string[]>;
  seleccionarEmpleados: any;
  seleccionEmpleadoH: any;
  seleccionEmpleadoG: any;

  // EVENTOS RELACIONADOS A SELECCIÓN E INGRESO DE ACUERDOS - DECRETOS - RESOLUCIONES
  ingresoAcuerdo: boolean = false;
  vistaAcuerdo: boolean = true;

  // EVENTOS REALCIONADOS A SELECCIÓN E INGRESO DE CARGOS PROPUESTOS
  ingresoCargo: boolean = false;
  vistaCargo: boolean = true;

  // INICIACIÓN DE CAMPOS DEL FORMULARIO
  descripcionF = new FormControl('', [Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}")]);
  identificacionF = new FormControl('', [Validators.required, Validators.minLength(3)]);
  otroDecretoF = new FormControl('', [Validators.minLength(3)]);
  otroCargoF = new FormControl('', [Validators.minLength(3)]);
  fechaDesdeF = new FormControl('', [Validators.required]);
  numPartidaF = new FormControl('', [Validators.required]);
  baseF = new FormControl('', [Validators.minLength(6)]);
  accionF = new FormControl('', [Validators.required]);
  fechaF = new FormControl('', [Validators.required]);
  numPropuestaF = new FormControl('');
  tipoProcesoF = new FormControl('');
  tipoDecretoF = new FormControl('');
  idEmpleadoHF = new FormControl('');
  idEmpleadoGF = new FormControl('');
  fechaHastaF = new FormControl('');
  idEmpleadoF = new FormControl('');
  tipoCargoF = new FormControl('');
  sueldoF = new FormControl('');
  abrevHF = new FormControl('');
  abrevGF = new FormControl('');

  // ASIGNAR LOS CAMPOS DEL FORMULARIO EN UN GRUPO
  public AccionPersonalForm = new FormGroup({
    identificacionForm: this.identificacionF,
    numPropuestaForm: this.numPropuestaF,
    tipoDecretoForm: this.tipoDecretoF,
    otroDecretoForm: this.otroDecretoF,
    idEmpleadoHForm: this.idEmpleadoHF,
    idEmpleadoGForm: this.idEmpleadoGF,
    descripcionForm: this.descripcionF,
    tipoProcesoForm: this.tipoProcesoF,
    idEmpleadoForm: this.idEmpleadoF,
    fechaDesdeForm: this.fechaDesdeF,
    fechaHastaForm: this.fechaHastaF,
    numPartidaForm: this.numPartidaF,
    tipoCargoForm: this.tipoCargoF,
    otroCargoForm: this.otroCargoF,
    accionForm: this.accionF,
    sueldoForm: this.sueldoF,
    abrevHForm: this.abrevHF,
    abrevGForm: this.abrevGF,
    fechaForm: this.fechaF,
    baseForm: this.baseF,

  });

  // INICIACIÓN DE VARIABLES 
  idEmpleadoLogueado: any;
  empleados: any = [];
  departamento: any;
  FechaActual: any;

  constructor(
    public restAccion: AccionPersonalService,
    public restProcesos: ProcesoService,
    public restEmpresa: EmpresaService,
    private toastr: ToastrService,
    public restE: EmpleadoService,
    public router: Router,
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {

    // INICIALIZACÓN DE FECHA Y MOSTRAR EN FORMULARIO
    var f = moment();
    this.FechaActual = f.format('YYYY-MM-DD');
    this.AccionPersonalForm.patchValue({
      fechaForm: this.FechaActual
    });
    // INVOCACIÓN A LOS MÉTODOS PARA CARGAR DATOS
    this.ObtenerTiposAccion();
    this.ObtenerEmpleados();
    this.ObtenerDecretos();
    this.ObtenerCargos();
    this.MostrarDatos();
    this.ObtenerProcesos();

    // DATOS VACIOS INDICAR LA OPCIÓN OTRO
    this.decretos[this.decretos.length] = { descripcion: "OTRO" };
    this.cargos[this.cargos.length] = { descripcion: "OTRO" };

    // MÉTODO PARA AUTOCOMPLETADO EN BÚSQUEDA DE NOMBRES
    this.filtroNombre = this.idEmpleadoF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filtrarEmpleado(value))
      );
    this.filtroNombreH = this.idEmpleadoHF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filtrarEmpleado(value))
      );
    this.filtroNombreG = this.idEmpleadoGF.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filtrarEmpleado(value))
      );
  }

  // MÉTODO PARA BÚSQUEDA DE NOMBRES SEGÚN LO INGRESADO POR EL USUARIO
  private _filtrarEmpleado(value: string): string[] {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.empleados.filter(info => info.empleado.toUpperCase().includes(filterValue));
    }
  }

  // BÚSQUEDA DE DATOS DE EMPRESA
  empresa: any = [];
  MostrarDatos() {
    this.empresa = [];
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(data => {
      this.empresa = data;
      this.AccionPersonalForm.patchValue({
        numPartidaForm: this.empresa[0].num_partida
      });
    });
  }

  // BÚSQUEDA DE DATOS DE LA TABLA CG_PROCESOS
  procesos: any = [];
  ObtenerProcesos() {
    this.procesos = [];
    this.restProcesos.getProcesosRest().subscribe(datos => {
      this.procesos = datos;
    })
  }

  // BÚSQUEDA DE DATOS DE LA TABLA DECRETOS_ACUERDOS_RESOL
  decretos: any = [];
  ObtenerDecretos() {
    this.decretos = [];
    this.restAccion.ConsultarDecreto().subscribe(datos => {
      this.decretos = datos;
      this.decretos[this.decretos.length] = { descripcion: "OTRO" };
    })
  }

  // MÉTODO PARA ACTIVAR FORMULARIO NOMBRE DE OTRA OPCIÓN
  estilo: any;
  IngresarOtro(form) {
    if (form.tipoDecretoForm === undefined) {
      this.AccionPersonalForm.patchValue({
        otroDecretoForm: '',
      });
      this.estilo = { 'visibility': 'visible' }; this.ingresoAcuerdo = true;
      this.toastr.info('Ingresar nombre de un nuevo tipo de proceso', '', {
        timeOut: 6000,
      })
      this.vistaAcuerdo = false;
    }
  }

  // MÉTODO PARA VER LISTA DE DECRETOS
  VerDecretos() {
    this.AccionPersonalForm.patchValue({
      otroDrecretoForm: '',
    });
    this.estilo = { 'visibility': 'hidden' }; this.ingresoAcuerdo = false;
    this.vistaAcuerdo = true;
  }

  // MÉTODO DE BÚSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe(datos => {
      this.tipos_accion = datos;
    })
  }

  // MÉTODO PARA BÚSQUEDA DE DATOS DE LA TABLA CARGO_PROPUESTO
  cargos: any = [];
  ObtenerCargos() {
    this.cargos = [];
    this.restAccion.ConsultarCargoPropuesto().subscribe(datos => {
      this.cargos = datos;
      this.cargos[this.cargos.length] = { descripcion: "OTRO" };
    })
  }

  // MÉTODO PARA ACTIVAR FORMULARIO DE INGRESO DE UN NUEVO TIPO DE CARGO PROPUESTO
  estiloC: any;
  IngresarCargo(form) {
    if (form.tipoCargoForm === undefined) {
      this.AccionPersonalForm.patchValue({
        otroCargoForm: '',
      });
      this.estiloC = { 'visibility': 'visible' }; this.ingresoCargo = true;
      this.toastr.info('Ingresar nombre de un nuevo tipo de cargo o puesto propuesto.', '', {
        timeOut: 6000,
      })
      this.vistaCargo = false;
    }
  }

  // MÉTODO PARA VER LISTA DE CARGOS PROPUESTO
  VerCargos() {
    this.AccionPersonalForm.patchValue({
      otroCargoForm: '',
    });
    this.estiloC = { 'visibility': 'hidden' }; this.ingresoCargo = false;
    this.vistaCargo = true;
  }


  // MÉTODO PARA OBTENER LISTA DE EMPLEADOS
  ObtenerEmpleados() {
    this.empleados = [];
    this.restE.getBuscadorEmpledosRest().subscribe(data => {
      this.empleados = data;
      this.seleccionarEmpleados = '';
      this.seleccionEmpleadoH = '';
      this.seleccionEmpleadoG = '';
      console.log('empleados', this.empleados)
    })
  }

  // MÉTODO PARA REALIZAR EL REGISTRO DE ACCIÓN DE PERSONAL
  InsertarAccionPersonal(form) {
    // CAMBIO EL APELLIDO Y NOMBRE DE LOS EMPLEADOS SELECCIONADOS A LETRAS MAYÚSCULAS
    let datos1 = {
      informacion: (form.idEmpleadoForm).toUpperCase()
    }
    let datos2 = {
      informacion: (form.idEmpleadoHForm).toUpperCase()
    }
    let datos3 = {
      informacion: (form.idEmpleadoGForm).toUpperCase()
    }
    // BÚSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA EL PEDIDO DE ACCIÓN DE PERSONAL
    this.restE.BuscarEmpleadoNombre(datos1).subscribe(empl1 => {
      var idEmpl_pedido = empl1[0].id;
      // BÚSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
      this.restE.BuscarEmpleadoNombre(datos2).subscribe(empl2 => {
        var idEmpl_firmaH = empl2[0].id;
        // BÚSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA SEGUNDA FIRMA
        this.restE.BuscarEmpleadoNombre(datos3).subscribe(empl3 => {
          var idEmpl_firmaG = empl3[0].id;
          // INICIALIZAMOS EL ARRAY CON TODOS LOS DATOS DEL PEDIDO
          let datosAccion = {
            id_empleado: idEmpl_pedido,
            fec_creacion: form.fechaForm,
            fec_rige_desde: String(moment(form.fechaDesdeForm, "YYYY/MM/DD").format("YYYY-MM-DD")),
            fec_rige_hasta: String(moment(form.fechaHastaForm, "YYYY/MM/DD").format("YYYY-MM-DD")),
            identi_accion_p: form.identificacionForm,
            num_partida: form.numPartidaForm,
            decre_acue_resol: form.tipoDecretoForm,
            abrev_empl_uno: form.abrevHForm,
            firma_empl_uno: idEmpl_firmaH,
            abrev_empl_dos: form.abrevGForm,
            firma_empl_dos: idEmpl_firmaG,
            adicion_legal: form.baseForm,
            tipo_accion: form.accionForm,
            descrip_partida: form.descripcionForm,
            cargo_propuesto: form.tipoCargoForm,
            proceso_propuesto: form.tipoProcesoForm,
            num_partida_propuesta: form.numPropuestaForm,
            salario_propuesto: form.sueldoForm
          }
          // VALIDAR QUE FECHAS SE ENCUENTREN BIEN INGRESADA
          if (form.fechaHastaForm === '' || form.fechaHastaForm === null) {
            datosAccion.fec_rige_hasta = null;
            console.log('informacion', datosAccion)
            this.ValidacionesIngresos(form, datosAccion);
          } else {
            if (Date.parse(form.fechaDesdeForm) < Date.parse(form.fechaHastaForm)) {
              this.ValidacionesIngresos(form, datosAccion);
            }
            else {
              this.toastr.info('Las fechas ingresadas no son las correctas.', 'Revisar los datos ingresados.', {
                timeOut: 6000,
              })
            }
          }
        })
      })
    })
  }

  // MÉTODO PARA VERIFICAR LAS POSIBLES OPCIONES DE INGRESOS EN EL FORMULARIO
  ValidacionesIngresos(form, datosAccion) {
    // INGRESO DE DATOS DE ACUERDO A LO INGRESADO POR EL USUARIO
    if (form.tipoDecretoForm != undefined &&
      form.tipoCargoForm != undefined) {
      console.log('INGRESA 1', datosAccion)
      this.GuardarDatos(datosAccion);
    }
    else if (form.tipoDecretoForm === undefined &&
      form.tipoCargoForm != undefined) {
      console.log('INGRESA 2', datosAccion)
      this.IngresarNuevoDecreto(form, datosAccion, '1');
    }
    else if (form.tipoDecretoForm != undefined &&
      form.tipoCargoForm === undefined) {
      console.log('INGRESA 3', datosAccion)
      this.IngresarNuevoCargo(form, datosAccion, '1');
    }
    else if (form.tipoDecretoForm === undefined &&
      form.tipoCargoForm === undefined) {
      console.log('INGRESA 5', datosAccion)
      this.IngresarNuevoDecreto(form, datosAccion, '2');
    }
    else {
      console.log('INGRESA 9', datosAccion)
      this.GuardarDatos(datosAccion);
    }
  }

  // MÉTODO PARA GUARDAR LOS DATOS DEL PEDIDO DE ACCIONES DE PERSONAL
  GuardarDatos(datosAccion: any) {
    // CAMBIAR VALOR A NULL LOS CAMPOS CON FORMATO INTEGER QUE NO SON INGRESADOS
    if (datosAccion.decre_acue_resol === '' || datosAccion.decre_acue_resol === null) {
      datosAccion.decre_acue_resol = null;
    }
    if (datosAccion.cargo_propuesto === '' || datosAccion.cargo_propuesto === null) {
      datosAccion.cargo_propuesto = null;
    }
    if (datosAccion.proceso_propuesto === '' || datosAccion.proceso_propuesto === null) {
      datosAccion.proceso_propuesto = null;
    }
    if (datosAccion.salario_propuesto === '' || datosAccion.salario_propuesto === null) {
      datosAccion.salario_propuesto = null;
    }
    console.log('DATOS FINALES', datosAccion)
    this.restAccion.IngresarPedidoAccion(datosAccion).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'Acción de Personal Registrada', {
        timeOut: 6000,
      });
      this.router.navigate(['/listaPedidos/',]);
    });
  }

  // MÉTODO PARA INGRESAR NUEVO TIPO DE DECRETO - ACUERDO - RESOLUCION
  IngresarNuevoDecreto(form, datos: any, opcion: string) {
    if (form.otroDecretoForm != '') {
      let acuerdo = {
        descripcion: form.otroDecretoForm
      }
      this.restAccion.IngresarDecreto(acuerdo).subscribe(resol => {
        // BUSCAR ID DE ÚLTIMO REGISTRO DE DECRETOS - ACUERDOS - RESOLUCIÓN - OTROS
        this.restAccion.BuscarIdDecreto().subscribe(max => {
          datos.decre_acue_resol = max[0].id;
          // INGRESAR PEDIDO DE ACCION DE PERSONAL
          if (opcion === '1') {
            this.GuardarDatos(datos);
          }
          else if (opcion === '2') {
            this.IngresarNuevoCargo(form, datos, '2');
          }
          else if (opcion === '3') {
            this.IngresarNuevoCargo(form, datos, '1');
          }
          else if (opcion === '4') {
            //this.IngresarNuevoProceso(form, datos, '1');
          }
        });
      });
    }
    else {
      this.toastr.info('Ingresar una nueva opción o seleccionar una de la lista', 'Verificar datos', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO PARA INGRESAR NUEVO CARGO PROPUESTO
  IngresarNuevoCargo(form, datos: any, opcion: string) {
    if (form.otroCargoForm != '') {
      let cargo = {
        descripcion: form.otroCargoForm
      }
      this.restAccion.IngresarCargoPropuesto(cargo).subscribe(resol => {
        // BUSCAR ID DE ÚLTIMO REGISTRO DE CARGOS PROPUESTOS
        this.restAccion.BuscarIdCargoPropuesto().subscribe(max => {
          datos.cargo_propuesto = max[0].id;
          // INGRESAR PEDIDO DE ACCION DE PERSONAL
          if (opcion === '1') {
            this.GuardarDatos(datos);
          }
          else if (opcion === '2') {
            //this.IngresarNuevoProceso(form, datos, '1');
          }
        });
      });
    }
    else {
      this.toastr.info('Ingresar una nueva opción o seleccionar una de la lista', 'Verificar datos', {
        timeOut: 6000,
      });
    }
  }

  /* contador: number = 0;
   InsertarPlanificacion(form) {
     let datosPlanComida = {
       id_empleado: this.data.idEmpleado,
       fecha: form.fechaForm,
       id_comida: form.platosForm,
       observacion: form.observacionForm,
       fec_comida: form.fechaPlanificacionForm,
       hora_inicio: form.horaInicioForm,
       hora_fin: form.horaFinForm,
       extra: form.extraForm
     };
     this.restPlan.CrearSolicitudComida(datosPlanComida).subscribe(response => {
       this.EnviarNotificaciones(form.fechaPlanificacionForm);
       this.toastr.success('Operación Exitosa', 'Servicio de Alimentación Registrado.', {
         timeOut: 6000,
       })
       this.CerrarRegistroPlanificacion();
     });
   }*/

  // MÉTODOS PARA MOSTRAR MENSAJES DE ADVERTENCIA DE ERRORES AL USUARIO
  ObtenerMensajeErrorDescripcion() {
    if (this.descripcionF.hasError('pattern')) {
      return 'Ingrese información válida';
    }
  }

  /*  jefes: any = [];
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
    }*/

  // MÉTODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO TEXTO.
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

  // MÉTODO PARA INGRESAR SOLO NÚMEROS
  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

}
