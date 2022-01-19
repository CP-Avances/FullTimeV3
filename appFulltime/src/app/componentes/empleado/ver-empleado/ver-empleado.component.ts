// IMPORTAR LIBRERIAS
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { ToastrService } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as L from 'leaflet';

// IMPORTAR SERVICIOS
import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { ScriptService } from 'src/app/servicios/empleado/script.service';

// IMPORTAR COMPONENTES
import { EditarVacacionesEmpleadoComponent } from 'src/app/componentes/rolEmpleado/vacaciones-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { EditarHoraExtraEmpleadoComponent } from 'src/app/componentes/rolEmpleado/hora-extra-empleado/editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { EditarPermisoEmpleadoComponent } from 'src/app/componentes/rolEmpleado/solicitar-permisos-empleado/editar-permiso-empleado/editar-permiso-empleado.component';
import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/detallePlanHorarios/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { RegistroAutorizacionDepaComponent } from 'src/app/componentes/autorizacionDepartamento/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { EditarAutorizacionDepaComponent } from 'src/app/componentes/autorizacionDepartamento/editar-autorizacion-depa/editar-autorizacion-depa.component';
import { EditarPeriodoVacacionesComponent } from 'src/app/componentes/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/empleadoPermisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { CancelarVacacionesComponent } from 'src/app/componentes/rolEmpleado/vacaciones-empleado/cancelar-vacaciones/cancelar-vacaciones.component';
import { CancelarHoraExtraComponent } from 'src/app/componentes/rolEmpleado/hora-extra-empleado/cancelar-hora-extra/cancelar-hora-extra.component';
import { CancelarPermisoComponent } from 'src/app/componentes/rolEmpleado/solicitar-permisos-empleado/cancelar-permiso/cancelar-permiso.component';
import { RegistoEmpleadoHorarioComponent } from 'src/app/componentes/empleadoHorario/registo-empleado-horario/registo-empleado-horario.component';
import { RegistrarEmpleProcesoComponent } from 'src/app/componentes/empleadoProcesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { EditarEmpleadoProcesoComponent } from 'src/app/componentes/empleadoProcesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { PlanificacionComidasComponent } from 'src/app/componentes/planificacionComidas/planificacion-comidas/planificacion-comidas.component';
import { EditarHorarioEmpleadoComponent } from 'src/app/componentes/empleadoHorario/editar-horario-empleado/editar-horario-empleado.component';
import { EditarPlanComidasComponent } from 'src/app/componentes/planificacionComidas/editar-plan-comidas/editar-plan-comidas.component';
import { RegistroPlanHorarioComponent } from 'src/app/componentes/planHorarios/registro-plan-horario/registro-plan-horario.component';
import { EditarSolicitudComidaComponent } from '../../planificacionComidas/editar-solicitud-comida/editar-solicitud-comida.component';
import { RegistrarPeriodoVComponent } from 'src/app/componentes/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { EditarPlanificacionComponent } from 'src/app/componentes/planHorarios/editar-planificacion/editar-planificacion.component';
import { RegistrarVacacionesComponent } from 'src/app/componentes/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { RegistroContratoComponent } from 'src/app/componentes/empleado/contrato/registro-contrato/registro-contrato.component';
import { CambiarContrasenaComponent } from '../../rolEmpleado/cambiar-contrasena/cambiar-contrasena.component';
import { EmplCargosComponent } from 'src/app/componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { PedidoHoraExtraComponent } from '../../horasExtras/pedido-hora-extra/pedido-hora-extra.component';
import { EditarEmpleadoComponent } from '../datos-empleado/editar-empleado/editar-empleado.component';
import { EditarTituloComponent } from '../titulos/editar-titulo/editar-titulo.component';
import { EmplLeafletComponent } from '../../settings/leaflet/empl-leaflet/empl-leaflet.component';
import { AdministraComidaComponent } from '../../administra-comida/administra-comida.component';
import { FraseSeguridadComponent } from '../../frase-administrar/frase-seguridad/frase-seguridad.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { TituloEmpleadoComponent } from '../titulos/titulo-empleado/titulo-empleado.component';
import { EditarContratoComponent } from '../contrato/editar-contrato/editar-contrato.component';

import { CambiarFraseComponent } from '../../frase-administrar/cambiar-frase/cambiar-frase.component';

import { switchMap, tap } from 'rxjs/operators';


@Component({
  selector: 'app-ver-empleado',
  templateUrl: './ver-empleado.component.html',
  styleUrls: ['./ver-empleado.component.css']
})

export class VerEmpleadoComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS CONSULTADOS
  contratoEmpleadoRegimen: any = [];
  relacionTituloEmpleado: any = [];
  discapacidadUser: any = [];
  empleadoLogueado: any = [];
  contratoEmpleado: any = [];
  idPerVacacion: any = [];
  empleadoUno: any = [];
  idContrato: any = [];
  idCargo: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE BOTONES
  btnTitulo = 'Añadir';
  btnDisc = 'Añadir';
  btnVacuna = 'Añadir';
  editar: string = '';
  idEmpleado: string; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO SELECCIONADO PARA VER DATOS

  // VARIABLES PARA HABILITAR O DESHABILITAR FUNCIONES
  HabilitarAccion: boolean = true;
  HabilitarHorasE: boolean = true;
  mostrarDiscapacidad = true;
  mostrarVacuna = true;
  btnHabilitado = true;
  btnHabilitadoVacuna = true;

  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL
  idEmpleadoLogueado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY
  logo: any; // VARIABLE DE ALMACENAMIENTO DE LOGO DE EMPRESA
  cont = 0; // VARIABLE USADA COMO CONTADOR DE DATOS

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  selectedIndex: number;

  // MÉTODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase_m(): string { return this.plantillaPDF.marca_Agua }
  get logoE(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    public restPlanHoraDetalle: DetallePlanHorarioService, // SERVICIO DATOS EMPRESA
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS EMPLEADO
    public restAutoridad: AutorizaDepartamentoService, // SERVICIO DATOS JEFES
    public restEmpleHorario: EmpleadoHorariosService, // SERVICIO DATOS HORARIO DE EMPLEADOS
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    public restDiscapacidad: DiscapacidadService, // SERVICIO DATOS DISCAPACIDAD
    private restPlanGeneral: PlanGeneralService, // SERVICIO DATOS DE PLANIFICACIÓN
    public restPlanComidas: PlanComidasService, // SERVICIO DATOS DE PLANIFICACIÓN COMIDAS
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public restVacaciones: VacacionesService, // SERVICIO DATOS DE VACACIONES
    public vistaRegistrarDatos: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public restPlanH: PlanHorarioService, // SERVICIO DATOS PLANIFICACIÓN DE HORARIO
    private scriptService: ScriptService, // SERVICIO DATOS EMPLEADO - REPORTE
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE REGISTRO DE VACUNACIÓN
    public restPermiso: PermisosService, // SERVICIO DATOS PERMISOS
    public restCargo: EmplCargosService, // SERVICIO DATOS CARGO
    private restHE: PedHoraExtraService, // SERVICIO DATOS PEDIDO HORA EXTRA
    public restEmpresa: EmpresaService, // SERVICIO DATOS EMPRESA
    public restTitulo: TituloService, // SERVICIO DATOS TÍTULO PROFESIONAL
    private restF: FuncionesService, // SERVICIO DATOS FUNCIONES DEL SISTEMA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    public restU: UsuarioService, // SERVICIO DATOS USUARIO
    public router: Router, // VARIABLE NAVEGACIÓN DE RUTAS URL

    private activatedRoute: ActivatedRoute,

  ) {
    console.log('Constructor');

    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    var cadena = this.router.url.split('#')[0];
    this.idEmpleado = cadena.split("/")[2];
    this.obtenerTituloEmpleado(parseInt(this.idEmpleado));
    this.obtenerDiscapacidadEmpleado(this.idEmpleado);
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    console.log('ON INIT');
    var a = moment();
    this.FechaActual = a.format('YYYY-MM-DD');
    this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
    this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
    this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
    this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
    this.ObtenerEmpleadoLogueado(this.idEmpleadoLogueado);
    this.obtenerCargoEmpleado(parseInt(this.idEmpleado));
    this.obtenerPlanHorarios(parseInt(this.idEmpleado));
    this.obtenerVacaciones(parseInt(this.idEmpleado));
    this.obtenerPermisos(parseInt(this.idEmpleado));
    this.VerAccionContrasena(this.idEmpleado);
    this.ObtenerlistaHorasExtrasEmpleado();
    this.obtenerContratoEmpleadoRegimen();
    this.VerAdminComida(this.idEmpleado);
    this.verEmpleado(this.idEmpleado);
    this.obtenerContratosEmpleado();
    this.ObtenerNacionalidades();
    this.ObtenerDatosVacunas();
    this.VerFuncionalidades();
    this.VerEmpresa();
    //this.VerAccionPersonal();
    //this.VerHorasExtras();
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.idEmpleado = id)
      )
      .subscribe(() => {
      });
  }

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
    })
  }

  // METODO INCLUIR EL CROKIS
  AbrirLeaflet(nombre: string, apellido: string) {
    this.vistaRegistrarDatos.open(EmplLeafletComponent, { width: '500px', height: '500px' }).afterClosed().subscribe((res: any) => {
      console.log(res);
      if (res.message === true) {
        this.restEmpleado.putGeolocalizacion(parseInt(this.idEmpleado), res.latlng).subscribe(respuesta => {
          this.toastr.success(respuesta.message);
          this.MAP.off();
          this.MAP.remove();
          this.MapGeolocalizar(res.latlng.lat, res.latlng.lng, nombre + ' ' + apellido)
        }, err => {
          this.toastr.error(err)
        });
      }
    });
  }

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS DETERMINADO EN TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }


  AbirVentanaEditarEmpleado(dataEmpley) {
    this.vistaRegistrarDatos.open(EditarEmpleadoComponent, { data: dataEmpley, width: '800px' }).afterClosed().subscribe(result => {
      if (result) {
        this.verEmpleado(this.idEmpleado)
      }
    })
  }

  /** * ******************************************************************************************** *
   *  *                   MÉTODOS PARA MENEJO DE DATOS DE TÍTULO PROFESIONAL
   ** * ******************************************************************************************** */

  // MÉTODO PARA OBTENER LOS TÍTULOS DE UN EMPLEADO A TRAVÉS DE LA TABLA EMPL_TITULOS 
  // QUE CONECTA A LA TABLA EMPLEADOS CON CG_TITULOS 
  obtenerTituloEmpleado(idEmployTitu: number) {
    this.relacionTituloEmpleado = [];
    this.restEmpleado.getEmpleadoTituloRest(idEmployTitu).subscribe(data => {
      this.relacionTituloEmpleado = data;
    });
  }

  AbrirVentanaRegistarTituloEmpleado() {
    this.vistaRegistrarDatos.open(TituloEmpleadoComponent, { data: this.idEmpleado, width: '360px' }).afterClosed().subscribe(result => {
      if (result) {
        this.obtenerTituloEmpleado(parseInt(this.idEmpleado))
      }
    })
  }

  AbrirVentanaEditarTitulo(dataTitulo) {
    this.vistaRegistrarDatos.open(EditarTituloComponent, { data: dataTitulo, width: '360px' }).afterClosed().subscribe(result => {
      if (result) {
        this.obtenerTituloEmpleado(parseInt(this.idEmpleado))
      }
    })
  }

  // ELIMINAR REGISTRO DE TÍTULO 
  eliminarTituloEmpleado(id: number) {
    this.restEmpleado.deleteEmpleadoTituloRest(id).subscribe(res => {
      this.obtenerTituloEmpleado(parseInt(this.idEmpleado));
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.habilitarBtn();
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteTitulo(id: number) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.eliminarTituloEmpleado(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);

        }
      });
  }




  /** * ******************************************************************************************** *
   *  *                   MÉTODOS PARA MENEJO DE DATOS DE CONTRATO
   ** * ******************************************************************************************** */

  // MÉTODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO RÉGIMEN LABORAL 
  idContratoEmpleado: number;
  obtenerContratoEmpleadoRegimen() {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      this.restEmpleado.BuscarDatosContrato(this.idContrato[0].max).subscribe(res => {
        this.contratoEmpleado = res;
      });
    });
  }

  // MÉTODO PARA VER LISTA DE TODOS LOS CONTRATOS
  contratoBuscado: any = [];
  obtenerContratosEmpleado() {
    this.contratoBuscado = [];
    this.restEmpleado.BuscarContratoEmpleadoRegimen(parseInt(this.idEmpleado)).subscribe(res => {
      this.contratoBuscado = res;
    });
  }

  // MÉTODO PARA VER DATOS DEL CONTRATO SELECCIONADO 
  fechaContrato = new FormControl('');
  public contratoForm = new FormGroup({
    fechaContratoForm: this.fechaContrato,
  });
  contratoSeleccionado: any = [];
  listaCargos: any = [];
  obtenerContratoSeleccionado(form) {
    this.LimpiarCargo();
    this.contratoSeleccionado = [];
    this.restEmpleado.BuscarDatosContrato(form.fechaContratoForm).subscribe(res => {
      this.contratoSeleccionado = res;
    }, error => { });
    this.restCargo.getInfoCargoEmpleadoRest(form.fechaContratoForm).subscribe(datos => {
      this.listaCargos = datos;
    }, error => {
      this.toastr.info('El contrato seleccionado no registra ningún cargo', 'VERIFICAR', {
        timeOut: 6000,
      });
    });
  }

  // MÉTODO PARA LIMPIAR REGISTRO 
  LimpiarContrato() {
    this.contratoSeleccionado = [];
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.contratoForm.reset();
    this.cargoForm.reset();
  }

  AbrirVentanaEditarContrato(dataContrato) {
    this.vistaRegistrarDatos.open(EditarContratoComponent, { data: dataContrato, width: '600px' }).afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        this.obtenerContratoEmpleadoRegimen()
      }
    })
  }

  btnActualizarContrato: boolean = true;
  verContratoEdicion(value: boolean) {
    this.btnActualizarContrato = value;
  }

  idSelectContrato: number;
  ObtenerIdContratoSeleccionado(idContratoEmpleado: number) {
    this.idSelectContrato = idContratoEmpleado;
  }

  // VENTANA PARA INGRESAR CONTRATO DEL EMPLEADO
  AbrirVentanaCrearContrato(): void {
    this.vistaRegistrarDatos.open(RegistroContratoComponent, { width: '650px', data: this.idEmpleado }).
      afterClosed().subscribe(item => {
        this.obtenerContratoEmpleadoRegimen();
        this.obtenerCargoEmpleado(parseInt(this.idEmpleado));
      });
  }

  /** * ******************************************************************************************** *
   *  *                   MÉTODOS PARA MENEJO DE DATOS DE CARGO
   ** * ******************************************************************************************** */

  // MÉTODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO 
  cargosTotalesEmpleado: any = [];
  cargoEmpleado: any = [];
  nombreCargo: string;
  obtenerCargoEmpleado(id_empleado: number) {
    this.cargoEmpleado = [];
    this.cargosTotalesEmpleado = [];
    this.restCargo.BuscarIDCargoActual(id_empleado).subscribe(datos => {
      this.cargosTotalesEmpleado = datos;
      let cargoIdActual = this.cargosTotalesEmpleado[0].max;
      this.restCargo.getUnCargoRest(cargoIdActual).subscribe(datos => {
        this.cargoEmpleado = datos;
        this.restCargo.ObtenerUnTipoCargo(this.cargoEmpleado[0].cargo).subscribe(datos => {
          this.nombreCargo = datos[0].cargo;
        });
      });
    });
  }

  // MÉTODO PARA LIMPIAR REGISTRO 
  LimpiarCargo() {
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.cargoForm.reset();
  }

  // MÉTODO PARA VER CARGO SELECCIONADO 
  fechaICargo = new FormControl('');
  public cargoForm = new FormGroup({
    fechaICargoForm: this.fechaICargo,
  });
  cargoSeleccionado: any = [];
  nombreCargoSeleccionado: string;
  obtenerCargoSeleccionadoEmpleado(form) {
    this.cargoSeleccionado = [];
    this.restCargo.getUnCargoRest(form.fechaICargoForm).subscribe(datos => {
      this.cargoSeleccionado = datos;
      this.restCargo.ObtenerUnTipoCargo(this.cargoSeleccionado[0].cargo).subscribe(datos => {
        this.nombreCargoSeleccionado = datos[0].cargo;
      });
    });
  }

  btnActualizarCargo: boolean = true;
  verCargoEdicion(value: boolean) {
    this.btnActualizarCargo = value;
  }

  idSelectCargo: number;
  ObtenerIdCargoSeleccionado(idCargoEmpleado: number) {
    this.idSelectCargo = idCargoEmpleado;
  }

  // VENTANA PARA INGRESAR CARGO DEL EMPLEADO 
  AbrirVentanaCargo(): void {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      console.log(datos);
      console.log("idcargo ", this.idContrato[0].max)
      this.vistaRegistrarDatos.open(EmplCargosComponent,
        { width: '900px', data: { idEmpleado: this.idEmpleado, idContrato: this.idContrato[0].max } }).
        afterClosed().subscribe(item => {
          this.obtenerCargoEmpleado(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      });
    });
  }

  /* *************************************************************************************************** *
   *                               MÉTODO PARA MOSTRAR DATOS                                             *
   * *************************************************************************************************** */
  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  textoBoton: string = 'Subir Foto';
  verEmpleado(idemploy: string) {
    this.empleadoUno = [];
    let idEmpleadoActivo = localStorage.getItem('empleado');
    this.restEmpleado.getOneEmpleadoRest(parseInt(idemploy)).subscribe(data => {
      console.log(data);
      this.empleadoUno = data;
      var empleado = data[0]['nombre'] + data[0]['apellido'];
      if (data[0]['imagen'] != null) {
        this.urlImagen = `${environment.url}/empleado/img/` + data[0]['imagen'];
        if (idEmpleadoActivo === idemploy) {
          // this.Main.urlImagen = this.urlImagen;
        }
        this.mostrarImagen = true;
        this.textoBoton = 'Editar Foto';
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.textoBoton = 'Subir Foto';
      }
      this.MapGeolocalizar(data[0]['latitud'], data[0]['longitud'], empleado);
      this.obtenerPeriodoVacaciones();
    })
  }

  MARKER: any;
  MAP: any;
  MapGeolocalizar(latitud: number, longitud: number, empleado: string) {
    let zoom = 19;
    if (latitud === null && longitud === null) {
      latitud = -0.9286188999999999;
      longitud = -78.6059801;
      zoom = 7
    }
    this.MAP = L.map('geolocalizacion', {
      center: [latitud, longitud],
      zoom: zoom
    });
    const marker = L.marker([latitud, longitud]);
    if (this.MARKER !== undefined) {
      this.MAP.removeLayer(this.MARKER);
    } else {
      marker.setLatLng([latitud, longitud]);
    }
    marker.bindPopup(empleado);
    this.MAP.addLayer(marker);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(this.MAP);
    this.MARKER = marker;
  }

  // MÉTODO PARA OBTENER DATOS DE DISCAPACIDAD 
  obtenerDiscapacidadEmpleado(idEmployDisca: any) {
    this.discapacidadUser = [];
    this.restDiscapacidad.getDiscapacidadUsuarioRest(idEmployDisca).subscribe(data => {
      this.discapacidadUser = data;
      this.habilitarBtn();
    });
  }

  // MÉTODO PARA IMPRIMIR DATOS DEL PERMISO 
  permisosTotales: any;
  obtenerPermisos(id_empleado: number) {
    this.permisosTotales = [];
    this.restEmpleado.getOneEmpleadoRest(id_empleado).subscribe(datos => {
      this.restPermiso.BuscarPermisoCodigo(datos[0].codigo).subscribe(datos => {
        this.permisosTotales = datos;
      }, err => {
        const { access, message } = err.error.message;
        if (access === false) {
          this.toastr.error(message)
        }
      })
    });
  }

  // MÉTODO PARA IMPRIMIR DATOS DE VACACIONES 
  vacaciones: any = [];
  obtenerVacaciones(id_empleado: number) {
    this.restPerV.BuscarIDPerVacaciones(id_empleado).subscribe(datos => {
      this.idPerVacacion = datos;
      console.log("idPerVaca ", this.idPerVacacion[0].id);
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
      });
    });
  }

  // MÉTODO PARA IMPRIMIR DATOS DE LA PLANIFICACIÓN DE HORARIOS 
  planHorario: any;
  planHorarioTotales: any;
  obtenerPlanHorarios(id_empleado: number) {
    this.planHorario = [];
    this.planHorarioTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restPlanH.ObtenerPlanHorarioPorIdCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.planHorario = datos;
          if (this.planHorario.length != 0) {
            if (this.cont === 0) {
              this.planHorarioTotales = datos
              this.cont++;
            }
            else {
              this.planHorarioTotales = this.planHorarioTotales.concat(datos);
              console.log("Datos plan horario" + i + '', this.planHorarioTotales)
            }
          }
        })
      }
    });
  }

  // MÉTODO PARA MOSTRAR DATOS DE LOS PROCESOS DEL EMPLEADO 
  buscarProcesos: any = [];
  empleadoProcesos: any = [];
  obtenerEmpleadoProcesos(id_empleado: number) {
    this.buscarProcesos = [];
    this.empleadoProcesos = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo Procesos", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restEmpleadoProcesos.ObtenerProcesoPorIdCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.buscarProcesos = datos;
          if (this.buscarProcesos.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.empleadoProcesos = datos
              this.cont++;
            }
            else {
              this.empleadoProcesos = this.empleadoProcesos.concat(datos);
              console.log("Datos procesos" + i + '', this.empleadoProcesos)
            }
          }
        })
      }
    });
  }

  // MÉTODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE ALMUERZOS 
  planComidas: any;
  obtenerPlanComidasEmpleado(id_empleado: number) {
    this.planComidas = [];
    this.restPlanComidas.ObtenerPlanComidaPorIdEmpleado(id_empleado).subscribe(res => {
      this.planComidas = res;
      console.log('comidas 1', this.planComidas);
      this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol => {
        this.planComidas = this.planComidas.concat(sol);
        console.log('comidas 2', this.planComidas);
      });
    }, error => {
      this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(id_empleado).subscribe(sol2 => {
        this.planComidas = sol2;
        console.log('comidas 3', this.planComidas);
      });
    });
  }

  // MÉTODO PARA IMPRIMIR DATOS DEL PERIODO DE VACACIONES 
  peridoVacaciones: any;
  obtenerPeriodoVacaciones() {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;
    })
  }

  // MÉTODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS 
  autorizacionEmpleado: any;
  autorizacionesTotales: any;
  ObtenerAutorizaciones(id_empleado: number) {
    this.autorizacionEmpleado = [];
    this.autorizacionesTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo ", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restAutoridad.BuscarAutoridadCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.autorizacionEmpleado = datos;
          if (this.autorizacionEmpleado.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.autorizacionesTotales = datos
              this.cont++;
            }
            else {
              this.autorizacionesTotales = this.autorizacionesTotales.concat(datos);
              console.log("Datos autorizacion" + i + '', this.autorizacionesTotales)
            }
          }
        })
      }
    });
  }

  // MÉTODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any;
  horariosEmpleadoTotales: any = [];
  ObtenerHorariosEmpleado(id_empleado: number) {
    this.horariosEmpleado = [];
    this.horariosEmpleadoTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo ", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restEmpleHorario.BuscarHorarioCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.horariosEmpleado = datos;
          if (this.horariosEmpleado.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.horariosEmpleadoTotales = datos
              this.cont++;
            }
            else {
              this.horariosEmpleadoTotales = this.horariosEmpleadoTotales.concat(datos);
              console.log("Datos autorizacion" + i + '', this.horariosEmpleadoTotales)
            }
          }
        })
      }
    });
  }

  hora_extra: any = [];
  ObtenerlistaHorasExtrasEmpleado() {
    this.hora_extra = [];
    this.restHE.ObtenerListaEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      console.log('estado', res);
      this.hora_extra = res;
      for (var i = 0; i <= this.hora_extra.length - 1; i++) {
        if (this.hora_extra[i].estado === 1) {
          this.hora_extra[i].estado = 'Pendiente';
        }
        else if (this.hora_extra[i].estado === 2) {
          this.hora_extra[i].estado = 'Pre-autorizado';
        }
        else if (this.hora_extra[i].estado === 3) {
          this.hora_extra[i].estado = 'Autorizado';
        }
        else if (this.hora_extra[i].estado === 4) {
          this.hora_extra[i].estado = 'Negado';
        }
      }

    }, err => {
      const { access, message } = err.error;
      if (access === false) return this.toastr.error(message)
    });
  }

  /* *************************************************************************************************** *
   *                               ABRIR VENTANAS PARA ELIMINAR DATOS DEL EMPLEADO                       *
   * *************************************************************************************************** */

  // ELIMINAR REGISTRO DE DISCAPACIDAD 
  eliminarDiscapacidad(id_discapacidad: number) {
    console.log("id_dicacapacidad", id_discapacidad)
    this.restDiscapacidad.deleteDiscapacidadUsuarioRest(id_discapacidad).subscribe(res => {
      this.obtenerDiscapacidadEmpleado(this.idEmpleado);
      this.btnDisc = 'Añadir';
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
    })
  };

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteDiscapacidad(id: number) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.eliminarDiscapacidad(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO HORARIO
  EliminarHorario(id_horario: number) {
    this.restEmpleHorario.EliminarRegistro(id_horario).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteHorario(datos: any) {
    console.log('datos horario', datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanGeneral(datos.fec_inicio, datos.fec_final, datos.id_horarios, datos.codigo)
          this.EliminarHorario(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // BUSCAR FECHAS DE HORARIO
  id_planificacion_general: any = [];
  EliminarPlanGeneral(fec_inicio, fec_final, horario, codigo) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fec_inicio.split('T')[0],
      fec_final: fec_final.split('T')[0],
      id_horario: horario,
      codigo: parseInt(codigo)
    };
    this.restPlanGeneral.BuscarFechas(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarPlanificacion(id_plan: number) {
    this.restPlanH.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.obtenerPlanHorarios(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlanificacion(datos: any) {
    console.log('planificacion', datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.BuscarDatosPlanHorario(datos.id, datos.codigo)
          this.EliminarPlanificacion(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // BUSCAR DETALLES DE LA PLANIFICACIÓN 
  detallesPlanificacion: any = [];
  BuscarDatosPlanHorario(id_planificacion: any, codigo) {
    this.detallesPlanificacion = [];
    this.restPlanHoraDetalle.ObtenerPlanHoraDetallePorIdPlanHorario(id_planificacion).subscribe(datos => {
      this.detallesPlanificacion = datos;
      console.log('detalles', this.detallesPlanificacion);
      this.detallesPlanificacion.map(obj => {
        this.EliminarPlanificacionGeneral(obj.fecha, obj.id_horario, codigo)
      })
    })
  }

  // ELIMINAR REGISTROS DE PLANIFICACION GENERAL 
  EliminarPlanificacionGeneral(fecha, horario, codigo) {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: fecha.split('T')[0],
      id_horario: horario,
      codigo: parseInt(codigo)
    };
    this.restPlanGeneral.BuscarFecha(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restPlanGeneral.EliminarRegistro(obj.id).subscribe(res => {
        })
      })
    })
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {
    this.restPlanComidas.EliminarPlanComida(id_plan, id_empleado).subscribe(res => {
      this.EnviarNotificaciones(datos.fec_inicio, datos.fec_final, datos.hora_inicio, datos.hora_fin, this.idEmpleadoLogueado, datos.id_empleado)
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlanComidas(datos: any) {
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restPlanComidas.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('No es posible eliminar la planificación de alimentación de ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + ' ya que presenta registros de servicio de alimentación consumidos.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          } else {
            this.router.navigate(['/verEmpleado/', this.idEmpleado]);
          }
        });
    });
  }

  envios: any = [];
  EnviarNotificaciones(fecha_plan_inicio: any, fecha_plan_fin: any, h_inicio: any, h_fin: any, empleado_envia: any, empleado_recibe: any) {
    let datosCorreo = {
      id_usua_plan: empleado_recibe,
      id_usu_admin: empleado_envia,
      fecha_inicio: moment(fecha_plan_inicio).format('DD-MM-YYYY'),
      fecha_fin: moment(fecha_plan_fin).format('DD-MM-YYYY'),
      hora_inicio: h_inicio,
      hora_fin: h_fin
    }
    this.restPlanComidas.EnviarCorreoEliminaPlan(datosCorreo).subscribe(envio => {
      this.envios = [];
      this.envios = envio;
      if (this.envios.notificacion === true) {
        this.NotificarPlanificacion(empleado_envia, empleado_recibe);
      }
    });
  }

  NotificarPlanificacion(empleado_envia: any, empleado_recive: any) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: 'Planificación de Alimentación Eliminada.'
    }
    this.restPlanComidas.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarProceso(id_plan: number) {
    this.restEmpleadoProcesos.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteProceso(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarProceso(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // FUNCIÓN PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarAutorizacion(id_auto: number) {
    this.restAutoridad.EliminarRegistro(id_auto).subscribe(res => {
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
      this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteAutorizacion(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarAutorizacion(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  CancelarHoraExtra(h) {
    this.vistaRegistrarDatos.open(CancelarHoraExtraComponent, { width: '300px', data: h.id }).afterClosed().subscribe(items => {
      console.log(items);
      if (items === true) {
        this.ObtenerlistaHorasExtrasEmpleado();
      }
    });
  }

  CancelarPermiso(dataPermiso) {
    this.vistaRegistrarDatos.open(CancelarPermisoComponent, { width: '300px', data: dataPermiso }).afterClosed().subscribe(items => {
      if (items === true) {
        this.obtenerPermisos(parseInt(this.idEmpleado));
      }
    });
  }

  CancelarVacaciones(v) {
    this.vistaRegistrarDatos.open(CancelarVacacionesComponent, { width: '300px', data: v.id }).afterClosed().subscribe(items => {
      this.obtenerVacaciones(parseInt(this.idEmpleado));
    });
  }

  /* 
  ****************************************************************************************************
  *                               ACCIONES BOTONES
  ****************************************************************************************************
 */

  // ESTE MÉTODO CONTROLA QUE SE HABILITE EL BOTÓN SI NO EXISTE UN REGISTRO DE DISCAPACIDAD, 
  // SI HAY REGISTRO SE HABILITA PARA ACTUALIZAR ESTE REGISTRO. 
  habilitarBtn() {
    if (this.discapacidadUser.length == 0) {
      this.btnHabilitado = true;
    } else {
      this.btnHabilitado = true;
      this.btnDisc = 'Editar';
      this.mostrarDiscapacidad = true;
    }
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE DISCAPACIDAD 
  mostrarDis() {
    if (this.btnDisc != 'Editar') {
      if (this.mostrarDiscapacidad == true) {
        this.mostrarDiscapacidad = false;
        this.btnDisc = 'No Añadir';
      } else {
        this.mostrarDiscapacidad = true;
        this.btnDisc = 'Añadir';
      }
    } else {
      if (this.mostrarDiscapacidad == false) {
        this.mostrarDiscapacidad = true;
        this.editar = 'editar';
      } else {
        this.mostrarDiscapacidad = false;
        this.editar = 'editar';
      }
    }
  }


  /* ************************************************************************************************** *
   *                               REGISTRO DE VACUNACIÓN                                               *
   * ************************************************************************************************** */
  // MÉTODO PARA CONSULTAR DATOS DE REGISTRO DE VACUNACIÓN
  datosVacuna: any = [];
  ObtenerDatosVacunas() {
    this.datosVacuna = [];
    this.restVacuna.ObtenerVacunaEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosVacuna = data;
    });
  }

  mostrarVacunaEditar: boolean = false;
  vacuna_editar: any = [];
  AbrirVentanaEditar(datos: any) {
    this.vacuna_editar = datos;
    this.mostrarVacunaEditar = true;
    this.btnVacuna = 'No Añadir';
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE VACUNACION 
  MostrarVentanaVacuna() {
    this.mostrarVacunaEditar = false;
    if (this.mostrarVacuna == true) {
      this.mostrarVacuna = false;
      this.btnVacuna = 'No Añadir';
    } else {
      this.mostrarVacuna = true;
      this.btnVacuna = 'Añadir';
    } 
  }

  // ELIMINAR REGISTRO DE VACUNA
  EliminarVacuna(id: number) {
    this.restVacuna.EliminarRegistroVacuna(id).subscribe(res => {
      this.ObtenerDatosVacunas();
      this.toastr.error('Registro eliminado', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCIÓN PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminarVacuna(id: number) {
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarVacuna(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /* **************************************************************************************************** *
   *                               ABRIR VENTANAS PARA REGISTRAR DATOS DEL EMPLEADO                       *
   ****************************************************************************************************** */

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirVentanaEmplHorario(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo: ", this.idCargo)
      this.vistaRegistrarDatos.open(RegistoEmpleadoHorarioComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max, horas_trabaja: this.idCargo[0].hora_trabaja } }).afterClosed().subscribe(item => {
          this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA INGRESAR PERÍODO DE VACACIONES 
  AbrirVentanaPerVacaciones(): void {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      console.log("idcargo ", this.idContrato);
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        console.log("idPerVaca ", this.idPerVacacion[0].id);
        this.toastr.info('El empleado ya tiene registrado un periodo de vacaciones y este se actualiza automáticamente', '', {
          timeOut: 6000,
        })
      }, error => {
        this.vistaRegistrarDatos.open(RegistrarPeriodoVComponent,
          { width: '900px', data: { idEmpleado: this.idEmpleado, idContrato: this.idContrato[0].max } })
          .afterClosed().subscribe(item => {
            this.obtenerPeriodoVacaciones();
          });
      });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR VACACIONES DEL EMPLEADO 
  AbrirVentanaVacaciones(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        console.log("idPerVaca ", this.idPerVacacion)
        this.vistaRegistrarDatos.open(RegistrarVacacionesComponent,
          { width: '900px', data: { idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion[0].id, idContrato: this.idPerVacacion[0].idcontrato, idCargo: this.idCargo[0].max } })
          .afterClosed().subscribe(item => {
            this.obtenerVacaciones(parseInt(this.idEmpleado));
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones', 'Primero Registrar Periodo de Vacaciones', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR PLANIFICACIÓN DE HORARIOS DEL EMPLEADO 
  AbrirVentanaPlanHorario(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistroPlanHorarioComponent,
        { width: '300px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } })
        .afterClosed().subscribe(item => {
          this.obtenerPlanHorarios(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR DETALLE DE HORARIO DEL EMPLEADO
  AbrirVentanaDetallePlanHorario(datos: any): void {
    console.log(datos);
    this.vistaRegistrarDatos.open(RegistroDetallePlanHorarioComponent,
      { width: '350px', data: { idEmpleado: this.idEmpleado, planHorario: datos, actualizarPage: false, direccionarE: false } }).disableClose = true;
  }

  // VENTANA PARA INGRESAR PLANIFICACIÓN DE COMIDAS 
  AbrirVentanaPlanificacion(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(PlanificacionComidasComponent, {
      width: '600px',
      data: { idEmpleado: this.idEmpleado, modo: 'individual' }
    })
      .afterClosed().subscribe(item => {
        this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA INGRESAR PROCESOS DEL EMPLEADO 
  AbrirVentanaProcesos(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistrarEmpleProcesoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } }).afterClosed().subscribe(item => {
          this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS 
  AbrirVentanaAutorizar(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistroAutorizacionDepaComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } }).afterClosed().subscribe(item => {
          this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR ADMINISTRACION DE MÓDULO DE ALIMENTACIÓN 
  AbrirVentanaAdminComida(): void {
    this.vistaRegistrarDatos.open(AdministraComidaComponent,
      { width: '600px', data: { idEmpleado: this.idEmpleado } })
      .afterClosed().subscribe(item => {
        this.VerAdminComida(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA REGISTRAR PERMISOS DEL EMPLEADO 
  AbrirVentanaPermiso(): void {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      console.log("idContrato ", this.idContrato[0].max)
      this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idCargo = datos;
        this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
          this.idPerVacacion = datos;
          console.log("idPerVaca ", this.idPerVacacion[0].id)
          this.vistaRegistrarDatos.open(RegistroEmpleadoPermisoComponent,
            {
              width: '1200px',
              data: { idEmpleado: this.idEmpleado, idContrato: this.idContrato[0].max, idPerVacacion: this.idPerVacacion[0].id, idCargo: this.idCargo[0].max }
            }).afterClosed().subscribe(item => {
              this.obtenerPermisos(parseInt(this.idEmpleado));
            });
        }, error => {
          this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones', 'Primero Registrar Periodo de Vacaciones', {
            timeOut: 6000,
          })
        });
      }, error => {
        this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

  AbrirVentanaHoraExtra() {
    this.vistaRegistrarDatos.open(PedidoHoraExtraComponent, { width: '9iipx' })
      .afterClosed().subscribe(items => {
        this.ObtenerlistaHorasExtrasEmpleado();
      });
  }

  /* *************************************************************************************************** *
   *                               VENTANA PARA EDITAR DATOS                                             *
   * *************************************************************************************************** */
  // VENTANA PARA EDITAR PROCESOS DEL EMPLEADO 
  AbrirVentanaEditarProceso(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarEmpleadoProcesoComponent,
      { width: '400px', data: { idEmpleado: this.idEmpleado, datosProcesos: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA EDITAR PROCESOS DEL EMPLEADO 
  AbrirEditarPeriodoVacaciones(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarPeriodoVacacionesComponent,
      { width: '900px', data: { idEmpleado: this.idEmpleado, datosPeriodo: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.obtenerPeriodoVacaciones();
      });
  }

  // VENTANA PARA EDITAR HORARIO DEL EMPLEADO 
  AbrirEditarHorario(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.vistaRegistrarDatos.open(EditarHorarioEmpleadoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, datosHorario: datoSeleccionado, horas_trabaja: datos[0].hora_trabaja } })
        .afterClosed().subscribe(item => {
          console.log(item);
          this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirEditarPlanificacion(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarPlanificacionComponent,
      { width: '300px', data: { idEmpleado: this.idEmpleado, datosPlan: datoSeleccionado } }).afterClosed().subscribe(item => {
        this.obtenerPlanHorarios(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirEditarPlanComidas(datoSeleccionado): void {
    console.log(datoSeleccionado);
    if (datoSeleccionado.fec_inicio != undefined) {
      // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
      let datosConsumido = {
        id_plan_comida: datoSeleccionado.id,
        id_empleado: datoSeleccionado.id_empleado
      }
      this.restPlanComidas.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
        this.toastr.info('No es posible actualizar la planificación de alimentación de ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + ' ya que presenta registros de servicio de alimentación consumidos.', '', {
          timeOut: 6000,
        })
      }, error => {
        this.VentanaEditarPlanComida(datoSeleccionado, EditarPlanComidasComponent, 'individual');
      });
    }
    else {
      this.VentanaEditarPlanComida(datoSeleccionado, EditarSolicitudComidaComponent, 'administrador')
    }
  }

  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.vistaRegistrarDatos.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
      });
  }

  // VENTANA PARA EDITAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS 
  AbrirEditarAutorizar(datoSeleccionado): void {
    console.log('datos auto', datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarAutorizacionDepaComponent,
      { width: '600px', data: { idEmpleado: this.idEmpleado, datosAuto: datoSeleccionado } }).afterClosed().subscribe(item => {
        this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
      });
  }

  EditarHoraExtra(h) {
    this.vistaRegistrarDatos.open(EditarHoraExtraEmpleadoComponent, { width: '900px', data: h }).afterClosed().subscribe(items => {
      console.log(items);
      if (items === true) {
        this.ObtenerlistaHorasExtrasEmpleado();
      }
    });
  }

  EditarPermiso(permisos) {
    this.vistaRegistrarDatos.open(EditarPermisoEmpleadoComponent, {
      width: '1200px',
      data: { dataPermiso: permisos, id_empleado: parseInt(this.idEmpleado) }
    }).afterClosed().subscribe(items => {
      if (items === true) {
        this.obtenerPermisos(parseInt(this.idEmpleado));
      }
    });
  }

  EditarVacaciones(v) {
    this.vistaRegistrarDatos.open(EditarVacacionesEmpleadoComponent, { width: '900px', data: v }).afterClosed().subscribe(items => {
      this.obtenerVacaciones(parseInt(this.idEmpleado));
    });
  }

  /* ******************************************************************************************************* *
   *                               PARA LA GENERACION DE PDFs                                                *
   * ******************************************************************************************************* */
  GenerarPdf(action = 'open') {
    const documentDefinition = this.GetDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  GetDocumentDefinicion() {
    sessionStorage.setItem('profile', this.empleadoUno);
    return {
      // ENCABEZADO DE LA PÁGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },
      // PIE DE PÁGINA
      footer: function (currentPage: any, pageCount: any, fecha: any, hora: any) {
        var f = moment();
        fecha = f.format('YYYY-MM-DD');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            { text: 'Fecha: ' + fecha + ' Hora: ' + hora, opacity: 0.3 },
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', opacity: 0.3
                }
              ],
            }
          ], fontSize: 10
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: 'Perfil Empleado', bold: true, fontSize: 20, alignment: 'center', margin: [0, -30, 0, 10] },
        {
          columns: [
            [
              { text: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido, style: 'name' },
              { text: 'Fecha Nacimiento: ' + this.empleadoUno[0].fec_nacimiento.split("T")[0] },
              { text: 'Corre Electronico: ' + this.empleadoUno[0].correo },
              { text: 'Teléfono: ' + this.empleadoUno[0].telefono }
            ]
          ]
        },
        { text: 'Contrato Empleado', style: 'header' },
        this.PresentarDataPDFcontratoEmpleado(),
        { text: 'Plan de comidas', style: 'header' },
        { text: 'Titulos', style: 'header' },
        this.PresentarDataPDFtitulosEmpleado(),
        { text: 'Discapacidad', style: 'header' },
        this.PresentarDataPDFdiscapacidadEmpleado(),
      ],
      info: {
        title: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido + '_PERFIL',
        author: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
        subject: 'Perfil',
        keywords: 'Perfil, Empleado',
      },
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], decoration: 'underline' },
        name: { fontSize: 16, bold: true },
        tableHeader: { bold: true, alignment: 'center', fillColor: this.p_color }
      }
    };
  }

  PresentarDataPDFtitulosEmpleado() {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Observaciones', style: 'tableHeader' },
            { text: 'Nombre', style: 'tableHeader' },
            { text: 'Nivel', style: 'tableHeader' }
          ],
          ...this.relacionTituloEmpleado.map(obj => {
            return [obj.observaciones, obj.nombre, obj.nivel];
          })
        ]
      }
    };
  }

  PresentarDataPDFcontratoEmpleado() {
    return {
      table: {
        widths: ['*', 'auto', 100, '*'],
        body: [
          [
            { text: 'Descripción', style: 'tableHeader' },
            { text: 'Dias Vacacion', style: 'tableHeader' },
            { text: 'Fecha Ingreso', style: 'tableHeader' },
            { text: 'Fecha Salida', style: 'tableHeader' }
          ],
          ...this.contratoEmpleadoRegimen.map(obj => {
            const ingreso = obj.fec_ingreso.split("T")[0];
            if (obj.fec_salida === null) {
              const salida = '';
              return [obj.descripcion, obj.dia_anio_vacacion, ingreso, salida];
            } else {
              const salida = obj.fec_salida.split("T")[0];
              return [obj.descripcion, obj.dia_anio_vacacion, ingreso, salida];
            }
          })
        ]
      }
    };
  }

  PresentarDataPDFdiscapacidadEmpleado() {
    return {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: 'Carnet conadis', style: 'tableHeader' },
            { text: 'Porcentaje', style: 'tableHeader' },
            { text: 'Tipo', style: 'tableHeader' }
          ],
          ...this.discapacidadUser.map(obj => {
            return [obj.carn_conadis, obj.porcentaje + ' %', obj.tipo];
          })
        ]
      }
    };
  }

  /* *************************************************************************************************** *
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL                                 *
   * *************************************************************************************************** */

  ExportToExcel() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleadoRegimen);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relacionTituloEmpleado);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'PERFIL');
    xlsx.utils.book_append_sheet(wb, wsc, 'CONTRATO');
    xlsx.utils.book_append_sheet(wb, wst, 'TITULOS');
    xlsx.utils.book_append_sheet(wb, wsd, 'DISCAPACIDA');
    xlsx.writeFile(wb, "EmpleadoEXCEL" + new Date().getTime() + '.xlsx');
  }

  /* **************************************************************************************************** *
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS CSV                                    *
   * **************************************************************************************************** */

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleadoRegimen);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relacionTituloEmpleado);
    const csvDataE = xlsx.utils.sheet_to_csv(wse);
    const csvDataC = xlsx.utils.sheet_to_csv(wsc);
    const csvDataD = xlsx.utils.sheet_to_csv(wsd);
    const csvDataT = xlsx.utils.sheet_to_csv(wst);
    const data: Blob = new Blob([csvDataE, csvDataC, csvDataD, csvDataT], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadoCSV" + new Date().getTime() + '.csv');
  }

  /* *************************************************************************************************** *
   *                               PARA LA SUBIR LA IMAGEN DEL EMPLEADO                                  *
   * *************************************************************************************************** */
  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('');
  FileChange(element) {
    this.archivoSubido = element.target.files;
    this.SubirPlantilla();
  }

  SubirPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
      console.log("iamge", formData);
    }
    this.restEmpleado.subirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'imagen subida.', {
        timeOut: 6000,
      });
      this.verEmpleado(this.idEmpleado)
      this.archivoForm.reset();
      this.nameFile = '';
      this.ResetDataMain();
    });
  }

  ResetDataMain() {
    localStorage.removeItem('fullname');
    localStorage.removeItem('correo');
    localStorage.removeItem('iniciales');
    localStorage.removeItem('view_imagen');
  }

  /* ****************************************************************************************************
   *                               CARGAR HORARIOS DEL EMPLEADO CON PLANTILLA
   * ****************************************************************************************************/
  nameFileHorario: string;
  archivoSubidoHorario: Array<File>;
  archivoHorarioForm = new FormControl('');

  FileChangeHorario(element) {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      this.archivoSubidoHorario = element.target.files;
      this.nameFileHorario = this.archivoSubidoHorario[0].name;
      let arrayItems = this.nameFileHorario.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0].slice(0, 16);
      console.log(itemName.toLowerCase());
      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase() == 'horario empleado') {
          this.SubirPlantillaHorario();
        } else {
          this.toastr.error('Plantilla seleccionada incorrecta', '', {
            timeOut: 6000,
          });
          this.archivoHorarioForm.reset();
          this.nameFileHorario = '';
        }
      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
      this.archivoHorarioForm.reset();
      this.nameFileHorario = '';
    });
  }

  SubirPlantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoHorario.length; i++) {
      formData.append("uploads[]", this.archivoSubidoHorario[i], this.archivoSubidoHorario[i].name);
      console.log("toda la data", this.archivoSubidoHorario[i])
    }
    this.restEmpleHorario.VerificarDatos_EmpleadoHorario(formData, parseInt(this.idEmpleado)).subscribe(res => {
      console.log('entra')
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
          'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
          'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema. ' +
          'Las fechas deben estar ingresadas correctamente, la fecha de inicio no debe ser posterior a la fecha final.', 'Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
      else {
        this.restEmpleHorario.VerificarPlantilla_EmpleadoHorario(formData).subscribe(resD => {
          if (resD.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
              'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
              'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema.', 'Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivoHorarioForm.reset();
            this.nameFileHorario = '';
          }
          else {
            this.restEmpleHorario.SubirArchivoExcel(formData, parseInt(this.idEmpleado), parseInt(this.empleadoUno[0].codigo)).subscribe(resC => {

              this.restEmpleHorario.CreaPlanificacion(formData, parseInt(this.idEmpleado), parseInt(this.empleadoUno[0].codigo)).subscribe(resP => {
                this.toastr.success('Operación Exitosa', 'Plantilla de Horario importada.', {
                  timeOut: 6000,
                });
                this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
                //this.actualizar = false;
                //window.location.reload(this.actualizar);
                this.archivoHorarioForm.reset();
                this.nameFileHorario = '';
              });
              /*this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
              //this.actualizar = false;
              //window.location.reload(this.actualizar);
              this.archivoHorarioForm.reset();
              this.nameFileHorario = '';*/
            });
          }
        });
      }
    });
  }

  /* ***************************************************************************************************** 
   *                              MÉTODO PARA IMPRIMIR EN XML
   * *****************************************************************************************************/
  nacionalidades: any = [];
  ObtenerNacionalidades() {
    this.restEmpleado.getListaNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];

  urlxml: string;
  data: any = [];
  ExportToXML() {
    var objeto: any;
    var arregloEmpleado = [];
    this.empleadoUno.forEach(obj => {
      var estadoCivil = this.EstadoCivilSelect[obj.esta_civil - 1];
      var genero = this.GeneroSelect[obj.genero - 1];
      var estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad: any;
      this.nacionalidades.forEach(element => {
        if (obj.id_nacionalidad == element.id) {
          nacionalidad = element.nombre;
        }
      });
      objeto = {
        "empleado": {
          '@codigo': obj.codigo,
          "cedula": obj.cedula,
          "apellido": obj.apellido,
          "nombre": obj.nombre,
          "estadoCivil": estadoCivil,
          "genero": genero,
          "correo": obj.correo,
          "fechaNacimiento": obj.fec_nacimiento.split("T")[0],
          "estado": estado,
          "correoAlternativo": obj.mail_alternativo,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
          "imagen": obj.imagen
        }
      }
      arregloEmpleado.push(objeto)
    });
    this.restEmpleado.DownloadXMLRest(arregloEmpleado).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/empleado/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

  // HABILITAR O DESHABILITAR VISTA DE ACCIONES DE PERSONAL 
  VerAccionPersonal() {
    this.restEmpresa.ConsultarEmpresas().subscribe(res => {
      if (res[0].tipo_empresa === 'Pública') {
        this.HabilitarAccion = false;
      }
      else {
        this.HabilitarAccion = true;
      }
    })
  }

  HabilitarAlimentacion: boolean;
  HabilitarPermisos: boolean;
  VerFuncionalidades() {
    this.restF.ListarFunciones().subscribe(datos => {
      console.log('datos', datos)
      if (datos[0].hora_extra === true) {
        if (this.idEmpleadoLogueado === parseInt(this.idEmpleado)) {
          this.HabilitarHorasE = false;
        }
      }
      if (datos[0].accion_personal === true) {
        this.VerAccionPersonal();
      }
      if (datos[0].alimentacion === true) {
        this.HabilitarAlimentacion = true;
      }
      if (datos[0].permisos === true) {
        this.HabilitarPermisos = true;
      }

    }, error => {
      this.HabilitarHorasE = true;
      this.HabilitarAlimentacion = false;
      this.HabilitarPermisos = false;
    })
  }

  // VENTANA PARA MODIFICAR CONTRASEÑA 
  CambiarContrasena(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(CambiarContrasenaComponent, { width: '350px', data: this.idEmpleado }).disableClose = true;
  }

  // INGRESAR FRASE 
  IngresarFrase(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(FraseSeguridadComponent, { width: '350px', data: this.idEmpleado }).disableClose = true;
  }

  // CAMBIAR FRASE 
  CambiarFrase(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(CambiarFraseComponent, { width: '350px', data: this.idEmpleado }).disableClose = true;
  }

  // VER BOTÓN FRASE DE ACUERDO A LA  CONFIGURACIÓN DE SEGURIDAD
  empresa: any = [];
  frase: boolean = false;
  cambiar_frase: boolean = false;
  VerEmpresa() {
    this.empresa = [];
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].seg_frase === true) {
        this.restU.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
          if (data[0].frase === null || data[0].frase === '') {
            this.frase = true;
          }
          else {
            this.cambiar_frase = true;
          }
        });
      }
    });
  }

  // MOSTRAR DATOS DE USUARIO - ADMINISTRACIÓN DE MÓDULO DE ALIMENTACIÓN 
  administra_comida: any = [];
  VerAdminComida(idEmpleado) {
    this.administra_comida = [];
    this.restU.BuscarDatosUser(idEmpleado).subscribe(res => {
      this.administra_comida = res;
    });
  }

  usuario: any = [];
  activar: boolean = false;
  VerAccionContrasena(idEmpleado) {
    this.usuario = [];
    this.restU.BuscarDatosUser(idEmpleado).subscribe(res => {
      this.usuario = res;
      if (this.usuario[0].id_rol === 1) {
        this.activar = true;
      }
      else {
        this.activar = false;
      }
    });
  }

}

