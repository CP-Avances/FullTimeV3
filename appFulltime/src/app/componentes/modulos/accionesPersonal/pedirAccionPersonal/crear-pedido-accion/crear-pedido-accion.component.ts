/** IMPORTACION DE LIBRERIAS */
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from "@angular/material/core";
import { FormBuilder, FormControl, Validators, FormGroup} from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { startWith, map } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";
import * as moment from "moment";

/** IMPORTACION DE SERVICIOS */
import { EmpleadoService } from "src/app/servicios/empleado/empleadoRegistro/empleado.service";
import { EmpresaService } from "src/app/servicios/catalogos/catEmpresa/empresa.service";
import { AccionPersonalService } from "src/app/servicios/accionPersonal/accion-personal.service";
import { Router } from "@angular/router";
import { ProcesoService } from "src/app/servicios/catalogos/catProcesos/proceso.service";
import { MainNavService } from "src/app/componentes/administracionGeneral/main-nav/main-nav.service";
import { ValidacionesService } from "src/app/servicios/validaciones/validaciones.service";
import { CiudadService } from "src/app/servicios/ciudad/ciudad.service";

@Component({
  selector: "app-crear-pedido-accion",
  templateUrl: "./crear-pedido-accion.component.html",
  styleUrls: ["./crear-pedido-accion.component.css"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: "es" },
  ],
})
export class CrearPedidoAccionComponent implements OnInit {
  // FILTRO DE NOMBRES DE LOS EMPLEADOS
  filtroNombreH: Observable<string[]>;
  filtroNombreG: Observable<string[]>;
  filtroNombreR: Observable<string[]>;
  filtroNombre: Observable<string[]>;
  seleccionarEmpResponsable: any;
  seleccionarEmpleados: any;
  seleccionEmpleadoH: any;
  seleccionEmpleadoG: any;

  //FILTRO CIUDAD
  filtroCiudad: Observable<string[]>;
  seleccionarCiudad: any;

  // EVENTOS RELACIONADOS A SELECCIÓN E INGRESO DE ACUERDOS - DECRETOS - RESOLUCIONES
  ingresoAcuerdo: boolean = false;
  vistaAcuerdo: boolean = true;

  // EVENTOS REALCIONADOS A SELECCIÓN E INGRESO DE CARGOS PROPUESTOS
  ingresoCargo: boolean = false;
  vistaCargo: boolean = true;

  
  // INICIACIÓN DE CAMPOS DEL FORMULARIO
  descripcionF = new FormControl("", [
    Validators.pattern(
      "[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{4,48}"
    ),
  ]);
  identificacionF = new FormControl("", [
    Validators.required,
    Validators.minLength(3),
  ]);
  otroDecretoF = new FormControl("", [Validators.minLength(3)]);
  otroCargoF = new FormControl("", [Validators.minLength(3)]);
  fechaDesdeF = new FormControl("", [Validators.required]);
  numPartidaF = new FormControl("", [Validators.required]);
  baseF = new FormControl("", [Validators.minLength(6)]);
  accionF = new FormControl("", [Validators.required]);
  fechaF = new FormControl("", [Validators.required]);
  notificacionesPosesiones = new FormControl("");
  funcionesReemp = new FormControl("");
  numPropuestaF = new FormControl("");
  descripcionP = new FormControl("");
  tipoProcesoF = new FormControl("");
  tipoDecretoF = new FormControl("");
  idEmpleadoHF = new FormControl("");
  idEmpleadoGF = new FormControl("");
  idEmpleadoRF = new FormControl("");
  nombreReemp = new FormControl("");
  puestoReemp = new FormControl("");
  accionReemp = new FormControl("");
  fechaHastaF = new FormControl("");
  idEmpleadoF = new FormControl("");
  numPartidaI = new FormControl("");
  fechaReemp = new FormControl("");
  fechaActaF = new FormControl("");
  tipoCargoF = new FormControl("");
  idCiudad = new FormControl("");
  sueldoF = new FormControl("");
  abrevHF = new FormControl("");
  abrevGF = new FormControl("");
  actaF = new FormControl("");

  // ASIGNAR LOS CAMPOS DE LOS FORMULARIOS EN GRUPOS
  isLinear = true;

  public firstFormGroup = new FormGroup({
    identificacionForm: this.identificacionF,
    fechaForm: this.fechaF,
  });
  public secondFormGroup = new FormGroup({
    idEmpleadoForm: this.idEmpleadoF,
    fechaDesdeForm: this.fechaDesdeF,
    fechaHastaForm: this.fechaHastaF,
  });
  public thirdFormGroup = new FormGroup({
    tipoDecretoForm: this.tipoDecretoF,
    otroDecretoForm: this.otroDecretoF,
    baseForm: this.baseF,
    accionForm: this.accionF,
  });
  public fourthFormGroup = new FormGroup({
    numPartidaForm: this.numPartidaF,
    tipoProcesoForm: this.tipoProcesoF,
    idCiudad: this.idCiudad,
    tipoCargoForm: this.tipoCargoF,
    otroCargoForm: this.otroCargoF,
    sueldoForm: this.sueldoF,
    numPropuestaForm: this.numPropuestaF,
    descripcionForm: this.descripcionF,
    numPartidaIForm: this.numPartidaI,
  });
  public fifthFormGroup = new FormGroup({
    actaForm: this.actaF,
    fechaActaForm: this.fechaActaF,
  });
  public sixthFormGroup = new FormGroup({
    idEmpleadoHForm: this.idEmpleadoHF,
    idEmpleadoGForm: this.idEmpleadoGF,
    idEmpleadoRForm: this.idEmpleadoRF,
    abrevHForm: this.abrevHF,
    abrevGForm: this.abrevGF,
  });
  public seventhFormGroup = new FormGroup({
    funcionesReempForm: this.funcionesReemp,
    nombreReempForm: this.nombreReemp,
    puestoReempForm: this.puestoReemp,
    accionReempForm: this.accionReemp,
    fechaReempForm: this.fechaReemp,
  });
  public eighthFormGroup = new FormGroup({
    posesionNotificacionForm: this.notificacionesPosesiones,
    descripcionPForm: this.descripcionP,
  });

  // INICIACIÓN DE VARIABLES
  idEmpleadoLogueado: any;
  empleados: any = [];
  ciudades: any = [];
  departamento: any;
  FechaActual: any;

  get habilitarAccion(): boolean {
    return this.funciones.accionesPersonal;
  }

  constructor(
    public restAccion: AccionPersonalService,
    public restProcesos: ProcesoService,
    public restEmpresa: EmpresaService,
    private toastr: ToastrService,
    public restE: EmpleadoService,
    public restC: CiudadService,
    public router: Router,
    private funciones: MainNavService,
    private validar: ValidacionesService
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem("empleado"));
    this.departamento = parseInt(localStorage.getItem("departamento"));
  }

  ngOnInit(): void {
    if (this.habilitarAccion === false) {
      let mensaje = {
        access: false,
        title: `Ups!!! al parecer no tienes activado en tu plan el Módulo de Acciones de Personal. \n`,
        message: "¿Te gustaría activarlo? Comunícate con nosotros.",
        url: "www.casapazmino.com.ec",
      };
      return this.validar.RedireccionarHomeAdmin(mensaje);
    } else {
      // INICIALIZACÓN DE FECHA Y MOSTRAR EN FORMULARIO
      var f = moment();
      this.FechaActual = f.format("YYYY-MM-DD");
      this.firstFormGroup.patchValue({
        fechaForm: this.FechaActual,
      });
      // INVOCACIÓN A LOS METODOS PARA CARGAR DATOS
      this.ObtenerTiposAccion();
      this.ObtenerEmpleados();
      this.ObtenerDecretos();
      this.ObtenerCiudades();
      this.ObtenerProcesos();
      this.ObtenerCargos();
      this.MostrarDatos();

      // DATOS VACIOS INDICAR LA OPCIÓN OTRO
      this.decretos[this.decretos.length] = { descripcion: "OTRO" };
      this.cargos[this.cargos.length] = { descripcion: "OTRO" };

      // METODO PARA AUTOCOMPLETADO EN BUSQUEDA DE NOMBRES
      this.filtroNombre = this.idEmpleadoF.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarEmpleado(value))
      );
      this.filtroNombreH = this.idEmpleadoHF.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarEmpleado(value))
      );
      this.filtroNombreG = this.idEmpleadoGF.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarEmpleado(value))
      );
      this.filtroNombreR = this.idEmpleadoRF.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarEmpleado(value))
      );
      this.filtroCiudad = this.idCiudad.valueChanges.pipe(
        startWith(""),
        map((value) => this._filtrarCiudad(value))
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGÚN LO INGRESADO POR EL USUARIO
  private _filtrarEmpleado(value: string): string[] {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.empleados.filter((info) =>
        info.empleado.toUpperCase().includes(filterValue)
      );
    }
  }

  // METODO PARA BUSQUEDA DE NOMBRES SEGÚN LO INGRESADO POR EL USUARIO
  private _filtrarCiudad(value: string): string[] {
    if (value != null) {
      const filterValue = value.toUpperCase();
      return this.ciudades.filter((info) =>
        info.descripcion.toUpperCase().includes(filterValue)
      );
    }
  }

  // BUSQUEDA DE DATOS DE EMPRESA
  empresa: any = [];
  MostrarDatos() {
    this.empresa = [];
    this.restEmpresa
      .ConsultarDatosEmpresa(parseInt(localStorage.getItem("empresa")))
      .subscribe((data) => {
        this.empresa = data;
        this.fourthFormGroup.patchValue({
          numPartidaForm: this.empresa[0].num_partida,
        });
      });
  }

  // BUSQUEDA DE DATOS DE LA TABLA CG_PROCESOS
  procesos: any = [];
  ObtenerProcesos() {
    this.procesos = [];
    this.restProcesos.getProcesosRest().subscribe((datos) => {
      this.procesos = datos;
    });
  }

  // BUSQUEDA DE DATOS DE LA TABLA DECRETOS_ACUERDOS_RESOL
  decretos: any = [];
  ObtenerDecretos() {
    this.decretos = [];
    this.restAccion.ConsultarDecreto().subscribe((datos) => {
      this.decretos = datos;
      this.decretos[this.decretos.length] = { descripcion: "OTRO" };
    });
  }

  // METODO PARA ACTIVAR FORMULARIO NOMBRE DE OTRA OPCIÓN
  estilo: any;
  IngresarOtro(form3) {
    if (form3.tipoDecretoForm === undefined) {
      this.thirdFormGroup.patchValue({
        otroDecretoForm: "",
      });
      this.estilo = { visibility: "visible" };
      this.ingresoAcuerdo = true;
      this.toastr.info("Ingresar nombre de un nuevo tipo de proceso", "", {
        timeOut: 6000,
      });
      this.vistaAcuerdo = false;
    }
  }

  // METODO PARA VER LISTA DE DECRETOS
  VerDecretos() {
    this.thirdFormGroup.patchValue({
      otroDecretoForm: "",
    });
    this.estilo = { visibility: "hidden" };
    this.ingresoAcuerdo = false;
    this.vistaAcuerdo = true;
  }

  // METODO DE BUSQUEDA DE DATOS DE LA TABLA TIPO_ACCIONES
  tipos_accion: any = [];
  ObtenerTiposAccion() {
    this.tipos_accion = [];
    this.restAccion.ConsultarTipoAccionPersonal().subscribe((datos) => {
      this.tipos_accion = datos;
    });
  }

  // METODO PARA BUSQUEDA DE DATOS DE LA TABLA CARGO_PROPUESTO
  cargos: any = [];
  ObtenerCargos() {
    this.cargos = [];
    this.restAccion.ConsultarCargoPropuesto().subscribe((datos) => {
      this.cargos = datos;
      this.cargos[this.cargos.length] = { descripcion: "OTRO" };
    });
  }

  //Lista de Posesiones y notificaciones
  posesiones_notificaciones: any = [
    { nombre: "POSESIÓN DEL CARGO" },
    { nombre: "NOTIFICACIÓN" },
  ];

  // METODO PARA ACTIVAR FORMULARIO DE INGRESO DE UN NUEVO TIPO DE CARGO PROPUESTO
  estiloC: any;
  IngresarCargo(form4) {
    if (form4.tipoCargoForm === undefined) {
      this.fourthFormGroup.patchValue({
        otroCargoForm: "",
      });
      this.estiloC = { visibility: "visible" };
      this.ingresoCargo = true;
      this.toastr.info(
        "Ingresar nombre de un nuevo tipo de cargo o puesto propuesto.",
        "",
        {
          timeOut: 6000,
        }
      );
      this.vistaCargo = false;
    }
  }

  // METODO PARA VER LISTA DE CARGOS PROPUESTO
  VerCargos() {
    this.fourthFormGroup.patchValue({
      otroCargoForm: "",
    });
    this.estiloC = { visibility: "hidden" };
    this.ingresoCargo = false;
    this.vistaCargo = true;
  }

  // METODO PARA OBTENER LISTA DE EMPLEADOS
  ObtenerEmpleados() {
    this.empleados = [];
    this.restE.BuscarListaEmpleados().subscribe((data) => {
      this.empleados = data;
      this.seleccionarEmpleados = "";
      this.seleccionEmpleadoH = "";
      this.seleccionEmpleadoG = "";
      this.seleccionarEmpResponsable = "";
      console.log("empleados", this.empleados);
    });
  }

  // METODO PARA OBTENER LISTA DE CIUDADES
  ObtenerCiudades() {
    this.ciudades = [];
    this.restC.ConsultarCiudades().subscribe((data) => {
      this.ciudades = data;
      this.seleccionarCiudad = "";
      console.log("ciudades", this.ciudades);
    });
  }

  //Buscar ciudad seleccionada
  ObtenerIdCiudadSeleccionada(nombreCiudad: String) {
    var results = this.ciudades.filter(function (ciudad) {
      return ciudad.descripcion == nombreCiudad;
    });
    return results[0].id;
  }

  CapitalizarNombre(nombre: any) {
    // REALIZAR UN CAPITAL LETTER A LOS NOMBRES
    let NombreCapitalizado: any;
    let nombres = nombre;
    if (nombres.length == 2) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      NombreCapitalizado = name1 + " " + name2;
    } else if (nombres.length == 3) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      let name3 = nombres[2].charAt(0).toUpperCase() + nombres[2].slice(1);
      NombreCapitalizado = NombreCapitalizado =
        name1 + " " + name2 + " " + name3;
    } else if (nombres.length == 4) {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      let name3 = nombres[2].charAt(0).toUpperCase() + nombres[2].slice(1);
      let name4 = nombres[3].charAt(0).toUpperCase() + nombres[3].slice(1);
      NombreCapitalizado = NombreCapitalizado =
        name1 + " " +name2 +" " + name3 + " " + name4;
    } else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      NombreCapitalizado = NombreCapitalizado = name1;
    }
    return NombreCapitalizado;
  }

  // METODO PARA REALIZAR EL REGISTRO DE ACCIÓN DE PERSONAL
  InsertarAccionPersonal(form1: any, form2: any, form3: any, form4: any, form5: any, form6: any, form7: any, form8: any) {
    // CAMBIO EL APELLIDO Y NOMBRE DE LOS EMPLEADOS SELECCIONADOS A LETRAS MAYÚSCULAS
    let datos1 = {
      informacion: form2.idEmpleadoForm.toUpperCase(),
    };
    let datos2 = {
      informacion: form6.idEmpleadoHForm.toUpperCase(),
    };
    let datos3 = {
      informacion: form6.idEmpleadoGForm.toUpperCase(),
    };
    let datos4 = {
      informacion: form6.idEmpleadoRForm.toUpperCase(),
    };
    let nombreCapitalizado = this.CapitalizarNombre(
      form7.nombreReempForm.split(" ")
    );

    // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA EL PEDIDO DE ACCIÓN DE PERSONAL
    this.restE.BuscarEmpleadoNombre(datos1).subscribe((empl1) => {
      var idEmpl_pedido = empl1[0].id;
      // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA PRIMERA FIRMA
      this.restE.BuscarEmpleadoNombre(datos2).subscribe((empl2) => {
        var idEmpl_firmaH = empl2[0].id;
        // BUSQUEDA DE LOS DATOS DEL EMPLEADO QUE REALIZA LA SEGUNDA FIRMA
        this.restE.BuscarEmpleadoNombre(datos3).subscribe((empl3) => {
          var idEmpl_firmaG = empl3[0].id;
          this.restE.BuscarEmpleadoNombre(datos4).subscribe((empl4) => {
            var idEmpl_responsable = empl4[0].id;
            let idCiudadSeleccionada = this.ObtenerIdCiudadSeleccionada(
              form4.idCiudad
            );
            // INICIALIZAMOS EL ARRAY CON TODOS LOS DATOS DEL PEDIDO
            let datosAccion = {
              id_empleado: idEmpl_pedido,
              fec_creacion: form1.fechaForm,
              fec_rige_desde: String(
                moment(form2.fechaDesdeForm, "YYYY/MM/DD").format("YYYY-MM-DD")
              ),
              fec_rige_hasta: form2.fechaHastaForm!==null ? (String(
                moment(form2.fechaHastaForm, "YYYY/MM/DD").format("YYYY-MM-DD")
              )):null,
              identi_accion_p: form1.identificacionForm,
              num_partida: form4.numPartidaForm,
              decre_acue_resol: form3.tipoDecretoForm,
              abrev_empl_uno: form6.abrevHForm,
              firma_empl_uno: idEmpl_firmaH,
              abrev_empl_dos: form6.abrevGForm,
              firma_empl_dos: idEmpl_firmaG,
              adicion_legal: form3.baseForm,
              tipo_accion: form3.accionForm,
              descrip_partida: form4.descripcionForm,
              cargo_propuesto: form4.tipoCargoForm,
              proceso_propuesto: form4.tipoProcesoForm,
              num_partida_propuesta: form4.numPropuestaForm,
              salario_propuesto: form4.sueldoForm,
              id_ciudad: idCiudadSeleccionada,
              id_empl_responsable: idEmpl_responsable,
              num_partida_individual: form4.numPartidaIForm,
              act_final_concurso: form5.actaForm,
              fec_act_final_concurso: form5.fechaActaForm!==null ? (String(
                moment(form5.fechaActaForm, "YYYY/MM/DD").format("YYYY-MM-DD")
              )):null,
              nombre_reemp: nombreCapitalizado,
              puesto_reemp: form7.puestoReempForm,
              funciones_reemp: form7.funcionesReempForm,
              num_accion_reemp: form7.accionReempForm,
              primera_fecha_reemp: form7.fechaReempForm !==null ? (String(
                moment(form7.fechaReempForm, "YYYY/MM/DD").format("YYYY-MM-DD")
              )):null,
              posesion_notificacion: form8.posesionNotificacionForm,
              descripcion_pose_noti: form8.descripcionPForm,
            };
            // VALIDAR QUE FECHAS SE ENCUENTREN BIEN INGRESADA
            if (form2.fechaHastaForm === "" || form2.fechaHastaForm === null) {
              datosAccion.fec_rige_hasta = null;
              console.log("informacion", datosAccion);
              this.ValidacionesIngresos(form3, form4, datosAccion);
            } else {
              if (
                Date.parse(form2.fechaDesdeForm) <
                Date.parse(form2.fechaHastaForm)
              ) {
                this.ValidacionesIngresos(form3, form4, datosAccion);
              } else {
                this.toastr.info(
                  "Las fechas ingresadas no son las correctas.",
                  "Revisar los datos ingresados.",
                  {
                    timeOut: 6000,
                  }
                );
              }
            }
          });
        });
      });
    });
  }

  // METODO PARA VERIFICAR LAS POSIBLES OPCIONES DE INGRESOS EN EL FORMULARIO
  ValidacionesIngresos(form3,form4, datosAccion) {
    // INGRESO DE DATOS DE ACUERDO A LO INGRESADO POR EL USUARIO
    if (form3.tipoDecretoForm != undefined && form4.tipoCargoForm != undefined) {
      console.log("INGRESA 1", datosAccion);
      this.GuardarDatos(datosAccion);
    } else if (
      form3.tipoDecretoForm === undefined &&
      form4.tipoCargoForm != undefined
    ) {
      console.log("INGRESA 2", datosAccion);
      this.IngresarNuevoDecreto(form3, form4, datosAccion, "1");
    } else if (
      form3.tipoDecretoForm != undefined &&
      form4.tipoCargoForm === undefined
    ) {
      console.log("INGRESA 3", datosAccion);
      this.IngresarNuevoCargo(form4, datosAccion, "1");
    } else if (
      form3.tipoDecretoForm === undefined &&
      form4.tipoCargoForm === undefined
    ) {
      console.log("INGRESA 5", datosAccion);
      this.IngresarNuevoDecreto(form3, form4, datosAccion, "2");
    } else {
      console.log("INGRESA 9", datosAccion);
      this.GuardarDatos(datosAccion);
    }
  }

  // METODO PARA GUARDAR LOS DATOS DEL PEDIDO DE ACCIONES DE PERSONAL
  GuardarDatos(datosAccion: any) {
    // CAMBIAR VALOR A NULL LOS CAMPOS CON FORMATO INTEGER QUE NO SON INGRESADOS
    if (
      datosAccion.decre_acue_resol === "" ||
      datosAccion.decre_acue_resol === null
    ) {
      datosAccion.decre_acue_resol = null;
    }
    if (
      datosAccion.cargo_propuesto === "" ||
      datosAccion.cargo_propuesto === null
    ) {
      datosAccion.cargo_propuesto = null;
    }
    if (
      datosAccion.proceso_propuesto === "" ||
      datosAccion.proceso_propuesto === null
    ) {
      datosAccion.proceso_propuesto = null;
    }
    if (
      datosAccion.salario_propuesto === "" ||
      datosAccion.salario_propuesto === null
    ) {
      datosAccion.salario_propuesto = null;
    }
    console.log("DATOS FINALES", datosAccion);
    this.restAccion.IngresarPedidoAccion(datosAccion).subscribe((res) => {
      this.toastr.success(
        "Operación Exitosa",
        "Acción de Personal Registrada",
        {
          timeOut: 6000,
        }
      );
      this.router.navigate(["/listaPedidos/"]);
    });
  }

  // METODO PARA INGRESAR NUEVO TIPO DE DECRETO - ACUERDO - RESOLUCION
  IngresarNuevoDecreto(form3, form4, datos: any, opcion: string) {
    if (form3.otroDecretoForm != "") {
      let acuerdo = {
        descripcion: form3.otroDecretoForm,
      };
      this.restAccion.IngresarDecreto(acuerdo).subscribe((resol) => {
        // BUSCAR ID DE ÚLTIMO REGISTRO DE DECRETOS - ACUERDOS - RESOLUCIÓN - OTROS
        this.restAccion.BuscarIdDecreto().subscribe((max) => {
          datos.decre_acue_resol = max[0].id;
          // INGRESAR PEDIDO DE ACCION DE PERSONAL
          if (opcion === "1") {
            this.GuardarDatos(datos);
          } else if (opcion === "2" || opcion === "3") {
            this.IngresarNuevoCargo(form4, datos, "1");
          }
          // else if (opcion === '3') {
          //   this.IngresarNuevoCargo(form, datos, '1');
          // }
          else if (opcion === "4") {
            //this.IngresarNuevoProceso(form, datos, '1');
          }
        });
      });
    } else {
      this.toastr.info(
        "Ingresar una nueva opción o seleccionar una de la lista",
        "Verificar datos",
        {
          timeOut: 6000,
        }
      );
    }
  }

  // METODO PARA INGRESAR NUEVO CARGO PROPUESTO
  IngresarNuevoCargo(form4, datos: any, opcion: string) {
    if (form4.otroCargoForm != "") {
      let cargo = {
        descripcion: form4.otroCargoForm,
      };
      this.restAccion.IngresarCargoPropuesto(cargo).subscribe((resol) => {
        // BUSCAR ID DE ÚLTIMO REGISTRO DE CARGOS PROPUESTOS
        this.restAccion.BuscarIdCargoPropuesto().subscribe((max) => {
          datos.cargo_propuesto = max[0].id;
          // INGRESAR PEDIDO DE ACCION DE PERSONAL
          if (opcion === "1") {
            this.GuardarDatos(datos);
          } else if (opcion === "2") {
            //this.IngresarNuevoProceso(form, datos, '1');
          }
        });
      });
    } else {
      this.toastr.info(
        "Ingresar una nueva opción o seleccionar una de la lista",
        "Verificar datos",
        {
          timeOut: 6000,
        }
      );
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

  // METODOS PARA MOSTRAR MENSAJES DE ADVERTENCIA DE ERRORES AL USUARIO
  ObtenerMensajeErrorDescripcion() {
    if (this.descripcionF.hasError("pattern")) {
      return "Ingrese información válida";
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

  // METODO PARA INGRESAR SOLO LETRAS
  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras =
      " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO TEXTO.
    let especiales = [8, 37, 39, 46, 6, 13];
    let tecla_especial = false;
    for (var i in especiales) {
      if (key == especiales[i]) {
        tecla_especial = true;
        break;
      }
    }
    if (letras.indexOf(tecla) == -1 && !tecla_especial) {
      this.toastr.info("No se admite datos numéricos", "Usar solo letras", {
        timeOut: 6000,
      });
      return false;
    }
  }

  // METODO PARA INGRESAR SOLO NÚMEROS
  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    } else {
      keynum = evt.which;
    }
    // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
    if (
      (keynum > 47 && keynum < 58) ||
      keynum == 8 ||
      keynum == 13 ||
      keynum == 6
    ) {
      return true;
    } else {
      this.toastr.info(
        "No se admite el ingreso de letras",
        "Usar solo números",
        {
          timeOut: 6000,
        }
      );
      return false;
    }
  }
}
