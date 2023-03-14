// IMPORTAR LIBRERIAS
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import * as L from 'leaflet';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { PlantillaReportesService } from '../../reportes/plantilla-reportes.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { PlanHoraExtraService } from 'src/app/servicios/planHoraExtra/plan-hora-extra.service';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { ScriptService } from 'src/app/servicios/empleado/script.service';

// IMPORTAR COMPONENTES
import { RegistroDetallePlanHorarioComponent } from 'src/app/componentes/horarios/detallePlanHorario/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { EditarVacacionesEmpleadoComponent } from 'src/app/componentes/rolEmpleado/vacacion-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { RegistroAutorizacionDepaComponent } from 'src/app/componentes/autorizaciones/autorizaDepartamentos/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { EditarPeriodoVacacionesComponent } from '../../modulos/vacaciones/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { EditarAutorizacionDepaComponent } from 'src/app/componentes/autorizaciones/autorizaDepartamentos/editar-autorizacion-depa/editar-autorizacion-depa.component';
import { RegistoEmpleadoHorarioComponent } from 'src/app/componentes/horarios/empleadoHorario/registo-empleado-horario/registo-empleado-horario.component';
import { RegistrarEmpleProcesoComponent } from '../../modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { EditarEmpleadoProcesoComponent } from '../../modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { EditarSolicitudComidaComponent } from '../../modulos/alimentacion/editar-solicitud-comida/editar-solicitud-comida.component';
import { EditarHorarioEmpleadoComponent } from 'src/app/componentes/horarios/empleadoHorario/editar-horario-empleado/editar-horario-empleado.component';
import { PlanificacionComidasComponent } from '../../modulos/alimentacion/planificacion-comidas/planificacion-comidas.component';
import { RegistroPlanHorarioComponent } from 'src/app/componentes/horarios/planificacionHorario/registro-plan-horario/registro-plan-horario.component';
import { EditarPlanHoraExtraComponent } from '../../modulos/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { RegistrarVacacionesComponent } from '../../modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { EditarPlanificacionComponent } from 'src/app/componentes/horarios/planificacionHorario/editar-planificacion/editar-planificacion.component';
import { CancelarVacacionesComponent } from 'src/app/componentes/rolEmpleado/vacacion-empleado/cancelar-vacaciones/cancelar-vacaciones.component';
import { RegistrarPeriodoVComponent } from '../../modulos/vacaciones/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { EditarPlanComidasComponent } from '../../modulos/alimentacion/editar-plan-comidas/editar-plan-comidas.component';
import { CancelarHoraExtraComponent } from 'src/app/componentes/rolEmpleado/horasExtras-empleado/cancelar-hora-extra/cancelar-hora-extra.component';
import { CambiarContrasenaComponent } from '../../iniciarSesion/contrasenia/cambiar-contrasena/cambiar-contrasena.component';
import { AdministraComidaComponent } from '../../modulos/alimentacion/administra-comida/administra-comida.component';
import { RegistroContratoComponent } from 'src/app/componentes/empleado/contrato/registro-contrato/registro-contrato.component';
import { CancelarPermisoComponent } from '../../rolEmpleado/permisos-empleado/cancelar-permiso/cancelar-permiso.component';
import { EditarEmpleadoComponent } from '../datos-empleado/editar-empleado/editar-empleado.component';
import { FraseSeguridadComponent } from '../../administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { TituloEmpleadoComponent } from '../titulos/titulo-empleado/titulo-empleado.component';
import { EditarContratoComponent } from '../contrato/editar-contrato/editar-contrato.component';
import { PlanHoraExtraComponent } from '../../modulos/horasExtras/planificacionHoraExtra/plan-hora-extra/plan-hora-extra.component';
import { DiscapacidadComponent } from '../discapacidad/discapacidad.component';
import { EditarTituloComponent } from '../titulos/editar-titulo/editar-titulo.component';
import { CambiarFraseComponent } from '../../administracionGeneral/frase-seguridad/cambiar-frase/cambiar-frase.component';
import { EditarVacunaComponent } from '../vacunacion/editar-vacuna/editar-vacuna.component';
import { EmplLeafletComponent } from '../../modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { CrearVacunaComponent } from '../vacunacion/crear-vacuna/crear-vacuna.component';
import { EmplCargosComponent } from 'src/app/componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';
import { LoginService } from 'src/app/servicios/login/login.service';
import { AutorizacionService } from 'src/app/servicios/autorizacion/autorizacion.service';

@Component({
  selector: 'app-ver-empleado',
  templateUrl: './ver-empleado.component.html',
  styleUrls: ['./ver-empleado.component.css']
})

export class VerEmpleadoComponent implements OnInit {

  // VARIABLES DE ALMACENAMIENTO DE DATOS CONSULTADOS
  discapacidadUser: any = [];
  empleadoLogueado: any = [];
  contratoEmpleado: any = [];
  tituloEmpleado: any = [];
  idPerVacacion: any = [];
  empleadoUno: any = [];

  // VARIABLES DE ALMACENAMIENTO DE DATOS DE BOTONES
  btnTitulo = 'Añadir';
  btnDisc = 'Añadir';
  idEmpleado: string; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO SELECCIONADO PARA VER DATOS
  editar: string = '';

  idEmpleadoLogueado: number; // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL
  FechaActual: any; // VARIBLE PARA ALMACENAR LA FECHA DEL DÍA DE HOY

  // ITEMS DE PAGINACIÓN DE LA TABLA 
  pageSizeOptions = [5, 10, 20, 50];
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  selectedIndex: number;

  // METODO DE LLAMADO DE DATOS DE EMPRESA COLORES - LOGO - MARCA DE AGUA
  get s_color(): string { return this.plantillaPDF.color_Secundary }
  get p_color(): string { return this.plantillaPDF.color_Primary }
  get frase_m(): string { return this.plantillaPDF.marca_Agua }
  get logoE(): string { return this.plantillaPDF.logoBase64 }

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS EMPLEADO
    public restPlanHoraDetalle: DetallePlanHorarioService, // SERVICIO DATOS EMPRESA
    public restEmpleHorario: EmpleadoHorariosService, // SERVICIO DATOS HORARIO DE EMPLEADOS
    public restDiscapacidad: DiscapacidadService, // SERVICIO DATOS DISCAPACIDAD
    public restPlanComidas: PlanComidasService, // SERVICIO DATOS DE PLANIFICACIÓN COMIDAS
    public restVacaciones: VacacionesService, // SERVICIO DATOS DE VACACIONES
    public restAutoridad: AutorizaDepartamentoService, // SERVICIO DATOS JEFES
    public restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    public restPermiso: PermisosService, // SERVICIO DATOS PERMISOS
    public restEmpresa: EmpresaService, // SERVICIO DATOS EMPRESA
    public restVacuna: VacunacionService, // SERVICIO DE DATOS DE REGISTRO DE VACUNACIÓN
    public restTitulo: TituloService, // SERVICIO DATOS TÍTULO PROFESIONAL
    public restPlanH: PlanHorarioService, // SERVICIO DATOS PLANIFICACIÓN DE HORARIO
    public plan_hora: PlanHoraExtraService,
    public restCargo: EmplCargosService, // SERVICIO DATOS CARGO
    public parametro: ParametrosService,
    public restPerV: PeriodoVacacionesService, // SERVICIO DATOS PERIODO DE VACACIONES
    public validar: ValidacionesService,
    public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS
    public router: Router, // VARIABLE NAVEGACIÓN DE RUTAS URL
    public restU: UsuarioService, // SERVICIO DATOS USUARIO
    public aviso: RealTimeService,
    private restF: FuncionesService, // SERVICIO DATOS FUNCIONES DEL SISTEMA
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    private restHE: PedHoraExtraService, // SERVICIO DATOS PEDIDO HORA EXTRA
    private sesion: LoginService,
    private informacion: DatosGeneralesService,
    private plantillaPDF: PlantillaReportesService, // SERVICIO DATOS DE EMPRESA
    private scriptService: ScriptService, // SERVICIO DATOS EMPLEADO - REPORTE
    private activatedRoute: ActivatedRoute,
    private restPlanGeneral: PlanGeneralService, // SERVICIO DATOS DE PLANIFICACION
    private aprobar: AutorizacionService, // SERVICIO DE DATOS DE AUTORIZACIONES 

  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    var cadena = this.router.url.split('#')[0];
    this.idEmpleado = cadena.split("/")[2];
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    var a = moment();
    this.FechaActual = a.format('YYYY-MM-DD');
    this.activatedRoute.params
      .pipe(
        switchMap(({ id }) => this.idEmpleado = id)
      )
      .subscribe(() => {
      });
    this.ObtenerEmpleadoLogueado(this.idEmpleadoLogueado);
    this.ObtenerTituloEmpleado();
    this.ObtenerDiscapacidadEmpleado();
    this.VerAccionContrasena();
    this.ObtenerNacionalidades();
    this.VerFuncionalidades();
    this.VerEmpresa();
  }

  /** ***************************************************************************************** **
   ** **                       METODO PARA ACTIVAR FUNCIONALIDADES                           ** **
   ** ***************************************************************************************** **/

  // METODO PARA ACTIVAR FUNCIONALIDADES
  HabilitarAlimentacion: boolean = false;
  habilitarVacaciones: boolean = false;
  HabilitarPermisos: boolean = false;
  HabilitarAccion: boolean = false;
  HabilitarHorasE: boolean = false;
  autorizar: boolean = false;

  VerFuncionalidades() {
    this.restF.ListarFunciones().subscribe(datos => {
      if (datos[0].hora_extra === true) {
        if (this.idEmpleadoLogueado === parseInt(this.idEmpleado)) {
          this.HabilitarHorasE = true;
        }
      }
      if (datos[0].accion_personal === true) {
        this.HabilitarAccion = true;
      }
      if (datos[0].alimentacion === true) {
        this.HabilitarAlimentacion = true;
        this.autorizar = true;
        // FUNCIONES DE AUTORIZACIONES
        this.ObtenerAutorizaciones();
        this.VerAdminComida();
      }
      if (datos[0].permisos === true) {
        this.HabilitarPermisos = true;
        this.autorizar = true;
      }
      if (datos[0].vacaciones === true) {
        this.habilitarVacaciones = true;
      }
      // METODOS DE CONSULTAS GENERALES
      this.BuscarParametro();
    })
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_fecha: string = 'DD/MM/YYYY';
  formato_hora: string = 'HH:mm:ss';

  // METODO PARA BUSCAR PARÁMETRO DE FORMATO DE FECHA
  BuscarParametro() {
    // id_tipo_parametro Formato fecha = 25
    this.parametro.ListarDetalleParametros(25).subscribe(
      res => {
        this.formato_fecha = res[0].descripcion;
        this.BuscarHora(this.formato_fecha);
      },
      vacio => {
        this.BuscarHora(this.formato_fecha);
      });
  }

  BuscarHora(fecha: string) {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        // LLAMADO A PRESENTACION DE DATOS
        this.LlamarMetodos(fecha, this.formato_hora);
      },
      vacio => {
        this.LlamarMetodos(fecha, this.formato_hora);
      });
  }

  // LLAMAR METODOS DE PRESENTACION DE INFORMACION
  LlamarMetodos(formato_fecha: string, formato_hora: string) {
    this.VerDatosActuales(formato_fecha);
    this.VerEmpleado(formato_fecha);
    this.ObtenerDatosVacunas(formato_fecha);
    this.ObtenerContratosEmpleado(formato_fecha);
    if (this.habilitarVacaciones === true) {
      this.ObtenerVacaciones(formato_fecha);
    }
    if (this.HabilitarPermisos === true) {
      this.ObtenerPermisos(formato_fecha, formato_hora);
    }
    if (this.HabilitarAlimentacion === true) {
      this.ObtenerPlanComidasEmpleado(formato_fecha, formato_hora);
      this.ObtenerSolComidas(formato_fecha, formato_hora);
    }
    if (this.HabilitarAccion === true) {
      this.ObtenerEmpleadoProcesos(formato_fecha);
    }
    if (this.HabilitarHorasE === true) {
      this.ObtenerlistaHorasExtrasEmpleado(formato_fecha, formato_hora);
      this.ObtenerPlanHorasExtras(formato_fecha, formato_hora);
    }
  }


  /** **************************************************************************************** **
   ** **                       METODOS GENERALES DEL SISTEMA                                ** ** 
   ** **************************************************************************************** **/

  // BUSQUEDA DE DATOS ACTUALES DEL USUARIO
  datoActual: any = [];
  VerDatosActuales(formato_fecha: string) {
    this.datoActual = [];
    this.informacion.ObtenerDatosActuales(parseInt(this.idEmpleado)).subscribe(res => {
      this.datoActual = res[0];
      // LLAMADO A DATOS DE USUARIO
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
      this.ObtenerCargoEmpleado(this.datoActual.id_cargo, formato_fecha);
      this.ObtenerHorariosEmpleado(this.datoActual.codigo, formato_fecha);
      this.ObtenerHorarioRotativo(this.datoActual.codigo, formato_fecha);
    }, vacio => {
      this.BuscarContratoActual(formato_fecha);
    });
  }

  // METODO PARA VER LA INFORMACIÓN DEL EMPLEADO QUE INICIA SESION
  ObtenerEmpleadoLogueado(idemploy: any) {
    this.empleadoLogueado = [];
    this.restEmpleado.BuscarUnEmpleado(idemploy).subscribe(data => {
      this.empleadoLogueado = data;
    })
  }

  // EVENTO PARA MOSTRAR NÚMERO DE FILAS EN TABLA
  ManejarPagina(e: PageEvent) {
    this.numero_pagina = e.pageIndex + 1;
    this.tamanio_pagina = e.pageSize;
  }


  /** ********************************************************************************************* **
   ** **                      METODO PARA MOSTRAR DATOS PERFIL DE USUARIO                        ** **                                           *
   ** ********************************************************************************************* **/

  // METODO PARA VER LA INFORMACIÓN DEL USUARIO 
  urlImagen: any;
  iniciales: any;
  mostrarImagen: boolean = false;
  textoBoton: string = 'Subir foto';
  VerEmpleado(formato_fecha: string) {
    this.empleadoUno = [];
    this.restEmpleado.BuscarUnEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.empleadoUno = data;
      this.empleadoUno[0].fec_nacimiento_ = this.validar.FormatearFecha(this.empleadoUno[0].fec_nacimiento, formato_fecha, this.validar.dia_abreviado);
      var empleado = data[0].nombre + data[0].apellido;
      if (data[0].imagen != null) {
        this.urlImagen = `${environment.url}/imagenesEmpleados/img/` + data[0].imagen;
        this.mostrarImagen = true;
        this.textoBoton = 'Editar foto';
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarImagen = false;
        this.textoBoton = 'Subir foto';
      }
      this.MapGeolocalizar(data[0].latitud, data[0].longitud, empleado);

      if (this.habilitarVacaciones === true) {
        this.ObtenerPeriodoVacaciones(formato_fecha);
      }
    })
  }

  // METODO PARA VER UBICACIÓN EN EL MAPA
  MARKER: any;
  MAP: any;
  MapGeolocalizar(latitud: number, longitud: number, empleado: string) {
    let zoom = 19;
    if (latitud === null && longitud === null) {
      latitud = -0.1918213;
      longitud = -78.4875258;
      zoom = 7
    }

    if (this.MAP) {
      this.MAP = this.MAP.remove();
    }

    this.MAP = L.map('geolocalizacion', {
      center: [latitud, longitud],
      zoom: zoom
    });
    const marker = L.marker([latitud, longitud]);
    if (this.MARKER !== undefined) {
      this.MAP.removeLayer(this.MARKER);
    }
    else {
      marker.setLatLng([latitud, longitud]);
    }
    marker.bindPopup(empleado);
    this.MAP.addLayer(marker);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(this.MAP);
    this.MARKER = marker;
  }

  // METODO INCLUIR EL CROKIS
  AbrirUbicacion(nombre: string, apellido: string) {
    this.ventana.open(EmplLeafletComponent, { width: '500px', height: '500px' })
      .afterClosed().subscribe((res: any) => {
        if (res.message === true) {
          if (res.latlng != undefined) {
            this.restEmpleado.ActualizarDomicilio(parseInt(this.idEmpleado), res.latlng).subscribe(respuesta => {
              this.toastr.success(respuesta.message);
              this.MAP.off();
              this.MapGeolocalizar(res.latlng.lat, res.latlng.lng, nombre + ' ' + apellido);
            }, err => {
              this.toastr.error(err);
            });
          }
        }
      });
  }

  // METODO EDICION DE REGISTRO DE EMPLEADO
  AbirVentanaEditarEmpleado(dataEmpley) {
    this.ventana.open(EditarEmpleadoComponent, { data: dataEmpley, width: '800px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.VerEmpleado(this.formato_fecha)
        }
      })
  }


  /** ********************************************************************************************* **
   ** **                            PARA LA SUBIR LA IMAGEN DEL EMPLEADO                         ** **                                 *
   ** ********************************************************************************************* **/

  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('');
  FileChange(element: any) {
    this.archivoSubido = element.target.files;
    var detalle = this.archivoSubido[0].name;
    let arrayItems = detalle.split(".");
    let itemExtencion = arrayItems[arrayItems.length - 1];
    // VALIDAR FORMATO PERMITIDO DE ARCHIVO
    if (itemExtencion == 'png' || itemExtencion == 'jpg' || itemExtencion == 'jpeg') {
      // VALIDAR PESO DE IMAGEN
      if (this.archivoSubido.length != 0) {
        if (this.archivoSubido[0].size <= 2e+6) {
          this.SubirPlantilla();
        }
        else {
          this.toastr.info('El archivo ha excedido el tamaño permitido.',
            'Tamaño de archivos permitido máximo 2MB.', {
            timeOut: 6000,
          });
        }
      }
    }
    else {
      this.toastr.info(
        'Formatos permitidos .png, .jpg, .jpeg', 'Formato de imagen no permitido.', {
        timeOut: 6000,
      });
    }
  }

  SubirPlantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restEmpleado.SubirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación Exitosa.', 'Imagen registrada.', {
        timeOut: 6000,
      });
      this.VerEmpleado(this.formato_fecha);
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


  /** ********************************************************************************************* **
   ** **                   BUSQUEDA DE DATOS DE ASIGNACIONES: TITULOS                            ** **                        *
   ** ********************************************************************************************* **/

  // BUSQUEDA DE TITULOS
  ObtenerTituloEmpleado() {
    this.tituloEmpleado = [];
    this.restEmpleado.BuscarTituloUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.tituloEmpleado = data;
    });
  }

  // REGISTRAR NUEVO TITULO
  AbrirVentanaRegistarTituloEmpleado() {
    this.ventana.open(TituloEmpleadoComponent, { data: this.idEmpleado, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // EDITAR UN TITULO
  AbrirVentanaEditarTitulo(dataTitulo: any) {
    this.ventana.open(EditarTituloComponent, { data: dataTitulo, width: '400px' })
      .afterClosed().subscribe(result => {
        if (result) {
          this.ObtenerTituloEmpleado();
        }
      })
  }

  // ELIMINAR REGISTRO DE TITULO 
  EliminarTituloEmpleado(id: number) {
    this.restEmpleado.EliminarTitulo(id).subscribe(res => {
      this.ObtenerTituloEmpleado();
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteTitulo(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarTituloEmpleado(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);

        }
      });
  }


  /** ********************************************************************************************* **
   ** **               BUSQUEDA DE DATOS DE ASIGNACIONES: DISCAPACIDAD                           ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA OBTENER DATOS DE DISCAPACIDAD 
  ObtenerDiscapacidadEmpleado() {
    this.discapacidadUser = [];
    this.restDiscapacidad.BuscarDiscapacidadUsuario(parseInt(this.idEmpleado)).subscribe(data => {
      this.discapacidadUser = data;
      this.HabilitarBtn();
    });
  }

  // ELIMINAR REGISTRO DE DISCAPACIDAD 
  EliminarDiscapacidad(id_discapacidad: number) {
    this.restDiscapacidad.EliminarDiscapacidad(id_discapacidad).subscribe(res => {
      this.ObtenerDiscapacidadEmpleado();
      this.btnDisc = 'Añadir';
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    })
  };

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteDiscapacidad(id: number) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDiscapacidad(id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // REGISTRAR DISCAPACIDAD
  AbrirVentanaDiscapacidad(proceso: string) {
    this.ventana.open(DiscapacidadComponent, {
      data: { idEmpleado: this.idEmpleado, metodo: proceso }, width: '360px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDiscapacidadEmpleado();
      })
  }

  // HABILITAR BOTONES DE EDICION
  HabilitarBtn() {
    if (this.discapacidadUser.length != 0) {
      this.btnDisc = 'Editar';
    }
    else {
      this.btnDisc = 'Añadir';
    }
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE DISCAPACIDAD 
  MostrarDis() {
    if (this.discapacidadUser.length != 0) {
      this.AbrirVentanaDiscapacidad('editar');
    }
    else {
      this.AbrirVentanaDiscapacidad('registrar');
    }
  }

  /** ********************************************************************************************* **
   ** **                          BUSQUEDA DE DATOS DE VACUNACIÓN                                ** **                        *
   ** ********************************************************************************************* **/

  // METODO PARA CONSULTAR DATOS DE REGISTRO DE VACUNACIÓN
  datosVacuna: any = [];
  ObtenerDatosVacunas(formato_fecha: string) {
    this.datosVacuna = [];
    this.restVacuna.ObtenerVacunaEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosVacuna = data;
      this.datosVacuna.forEach(data => {
        data.fecha_ = this.validar.FormatearFecha(data.fecha, formato_fecha, this.validar.dia_completo);
      })
    });
  }

  // EDITAR REGISTRO DE VACUNA
  AbrirVentanaEditar(datos: any) {
    this.ventana.open(EditarVacunaComponent, {
      data: { idEmpleado: this.idEmpleado, vacuna: datos }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE VACUNACION 
  MostrarVentanaVacuna() {
    this.ventana.open(CrearVacunaComponent, {
      data: { idEmpleado: this.idEmpleado }, width: '600px'
    })
      .afterClosed().subscribe(result => {
        this.ObtenerDatosVacunas(this.formato_fecha);
      })
  }

  // ELIMINAR REGISTRO DE VACUNA
  EliminarVacuna(datos: any) {
    this.restVacuna.EliminarRegistroVacuna(datos.id, datos.carnet).subscribe(res => {
      this.ObtenerDatosVacunas(this.formato_fecha);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarEliminarVacuna(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarVacuna(datos);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /** ******************************************************************************************** **
   ** **                    METODOS PARA MANEJO DE DATOS DE CONTRATO                            ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER ULTIMO CONTRATO
  BuscarContratoActual(formato_fecha: string) {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.datoActual.id_contrato = datos[0].max;
      this.ObtenerContratoEmpleado(this.datoActual.id_contrato, formato_fecha);
    });
  }

  // METODO PARA OBTENER EL CONTRATO DE UN EMPLEADO CON SU RESPECTIVO REGIMEN LABORAL 
  ObtenerContratoEmpleado(id_contrato: number, formato_fecha: string) {
    this.contratoEmpleado = [];
    this.restEmpleado.BuscarDatosContrato(id_contrato).subscribe(res => {
      this.contratoEmpleado = res;
      this.contratoEmpleado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fec_salida, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER LISTA DE TODOS LOS CONTRATOS
  contratoBuscado: any = [];
  ObtenerContratosEmpleado(formato_fecha: string) {
    this.contratoBuscado = [];
    this.restEmpleado.BuscarContratosEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.contratoBuscado = res;
      this.contratoBuscado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA VER DATOS DEL CONTRATO SELECCIONADO 
  fechaContrato = new FormControl('');
  public contratoForm = new FormGroup({
    fechaContratoForm: this.fechaContrato,
  });
  contratoSeleccionado: any = [];
  listaCargos: any = [];
  ObtenerContratoSeleccionado(form: any) {
    this.LimpiarCargo();
    this.contratoSeleccionado = [];
    this.restEmpleado.BuscarDatosContrato(form.fechaContratoForm).subscribe(res => {
      this.contratoSeleccionado = res;
      this.contratoSeleccionado.forEach(data => {
        data.fec_ingreso_ = this.validar.FormatearFecha(data.fec_ingreso, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_salida_ = this.validar.FormatearFecha(data.fec_salida, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
    this.restCargo.BuscarCargoIDContrato(form.fechaContratoForm).subscribe(datos => {
      this.listaCargos = datos;
      this.listaCargos.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, this.formato_fecha, this.validar.dia_abreviado);
      })
    }, error => {
      this.toastr.info('El contrato seleccionado no registra ningún cargo.', 'VERIFICAR', {
        timeOut: 6000,
      });
    });
  }

  // METODO PARA LIMPIAR REGISTRO DE CONTRATO
  LimpiarContrato() {
    this.contratoSeleccionado = [];
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.contratoForm.reset();
    this.cargoForm.reset();
  }

  // METODO DE EDICION DE CONTRATOS
  AbrirVentanaEditarContrato(dataContrato: any) {
    this.ventana.open(EditarContratoComponent, { data: dataContrato, width: '900px' })
      .afterClosed().subscribe(result => {
        this.VerDatosActuales(this.formato_fecha);
      })
  }

  // METODO PARA MOSTRAR VENTANA DE EDICION DE CONTRATO
  btnActualizarContrato: boolean = true;
  VerContratoEdicion(value: boolean) {
    this.btnActualizarContrato = value;
  }

  // METODO BUSQUEDA DE DATOS DE CONTRATO 
  idSelectContrato: number;
  ObtenerIdContratoSeleccionado(idContratoEmpleado: number) {
    this.idSelectContrato = idContratoEmpleado;
  }

  // VENTANA PARA INGRESAR CONTRATO DEL EMPLEADO
  AbrirVentanaCrearContrato(): void {
    this.ventana.open(RegistroContratoComponent, { width: '650px', data: this.idEmpleado }).
      afterClosed().subscribe(item => {
        this.VerDatosActuales(this.formato_fecha);
      });
  }


  /** ** ***************************************************************************************** **
   ** ** **                  METODOS PARA MANEJO DE DATOS DE CARGO                              ** **
   ** ******************************************************************************************** **/

  // METODO PARA OBTENER LOS DATOS DEL CARGO DEL EMPLEADO 
  cargoEmpleado: any = [];
  ObtenerCargoEmpleado(id_cargo: number, formato_fecha: string) {
    this.cargoEmpleado = [];
    this.restCargo.BuscarCargoID(id_cargo).subscribe(datos => {
      this.cargoEmpleado = datos;
      this.cargoEmpleado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // METODO PARA LIMPIAR REGISTRO 
  LimpiarCargo() {
    this.cargoSeleccionado = [];
    this.listaCargos = [];
    this.cargoForm.reset();
  }

  // METODO PARA VER CARGO SELECCIONADO 
  fechaICargo = new FormControl('');
  public cargoForm = new FormGroup({
    fechaICargoForm: this.fechaICargo,
  });
  cargoSeleccionado: any = [];
  ObtenerCargoSeleccionado(form) {
    this.cargoSeleccionado = [];
    this.restCargo.BuscarCargoID(form.fechaICargoForm).subscribe(datos => {
      this.cargoSeleccionado = datos;
      this.cargoSeleccionado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, this.formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, this.formato_fecha, this.validar.dia_abreviado);
      })
    });
  }

  // MOSTRAR VENTANA EDICION DE CARGO
  btnActualizarCargo: boolean = true;
  VerCargoEdicion(value: boolean) {
    this.btnActualizarCargo = value;
  }

  // BUSQUEDA DE ID DE CARGO SELECCIONADO
  idSelectCargo: number;
  ObtenerIdCargoSeleccionado(idCargoEmpleado: number) {
    this.idSelectCargo = idCargoEmpleado;
  }

  // VENTANA PARA INGRESAR CARGO DEL EMPLEADO 
  AbrirVentanaCargo(): void {
    if (this.datoActual.id_contrato != undefined) {
      this.ventana.open(EmplCargosComponent,
        { width: '900px', data: { idEmpleado: this.idEmpleado, idContrato: this.datoActual.id_contrato } }).
        afterClosed().subscribe(item => {
          this.VerDatosActuales(this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Contrato.', '', {
        timeOut: 6000,
      });
    }
  }

  /** ***************************************************************************************** ** 
   ** **              METODOS PARA MANEJAR HORARIOS FIJOS DEL USUARIO                        ** ** 
   ** ***************************************************************************************** **/

  // METODO PARA MOSTRAR DATOS DE HORARIO 
  horariosEmpleado: any = [];
  ObtenerHorariosEmpleado(codigo: number, formato_fecha: string) {
    this.horariosEmpleado = [];
    this.restEmpleHorario.BuscarHorarioUsuario(codigo).subscribe(datos => {
      this.horariosEmpleado = datos;
      this.horariosEmpleado.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirVentanaEmplHorario(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistoEmpleadoHorarioComponent,
        {
          width: '640px',
          data: {
            idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo,
            horas_trabaja: this.cargoEmpleado[0].hora_trabaja
          }
        }).afterClosed().subscribe(item => {
          this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR HORARIO DEL EMPLEADO 
  AbrirEditarHorario(datoSeleccionado: any): void {
    this.ventana.open(EditarHorarioEmpleadoComponent,
      {
        width: '640px',
        data: {
          idEmpleado: this.idEmpleado, datosHorario: datoSeleccionado,
          horas_trabaja: this.cargoEmpleado[0].hora_trabaja
        }
      })
      .afterClosed().subscribe(item => {
        console.log(item);
        this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
      });

  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO HORARIO
  EliminarHorario(id_horario: number) {
    this.restEmpleHorario.EliminarRegistro(id_horario).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteHorario(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanGeneral(datos.fec_inicio, datos.fec_final, datos.id_horarios, datos.codigo)
          this.EliminarHorario(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /** ********************************************************************************************* **
   ** **                     CARGAR HORARIOS DEL EMPLEADO CON PLANTILLA                          ** **
   ** ********************************************************************************************* **/

  nameFileHorario: string;
  archivoSubidoHorario: Array<File>;
  archivoHorarioForm = new FormControl('');

  FileChangeHorario(element) {
    if (this.datoActual.id_cargo != undefined) {
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
    }
    else {
      this.toastr.info('El empleado no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
      this.archivoHorarioForm.reset();
      this.nameFileHorario = '';
    }
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
                this.ObtenerHorariosEmpleado(this.datoActual.codigo, this.formato_fecha);
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


  /** **************************************************************************************** **
   ** **             METODO DE PRESENTACION DE DATOS DE HORARIOS ROTATIVOS                  ** **
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DE LA HORARIOS ROTATIVOS 
  horarioRotativo: any = [];
  ObtenerHorarioRotativo(codigo: number, formato_fecha: string) {
    this.horarioRotativo = [];
    this.restPlanH.ObtenerHorarioRotativo(codigo).subscribe(datos => {
      this.horarioRotativo = datos;
      this.horarioRotativo.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA REGISTRAR PLANIFICACIÓN DE HORARIOS DEL EMPLEADO 
  AbrirVentanaHorarioRotativo(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistroPlanHorarioComponent,
        {
          width: '300px', data: {
            idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo
          }
        })
        .afterClosed().subscribe(item => {
          this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA REGISTRAR HORARIO 
  AbrirEditarHorarioRotativo(datoSeleccionado: any): void {
    this.ventana.open(EditarPlanificacionComponent,
      { width: '300px', data: { idEmpleado: this.idEmpleado, datosPlan: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
      });
  }

  // VENTANA PARA REGISTRAR DETALLE DE HORARIO DEL EMPLEADO
  AbrirVentanaDetallePlanHorario(datos: any): void {
    console.log(datos);
    this.ventana.open(RegistroDetallePlanHorarioComponent,
      { width: '350px', data: { idEmpleado: this.idEmpleado, planHorario: datos, actualizarPage: false, direccionarE: false } }).disableClose = true;
  }


  // BUSCAR FECHAS DE HORARIO y ELIMINAR PLANIFICACION GENERAL
  id_planificacion_general: any = [];
  EliminarPlanGeneral(fec_inicio: string, fec_final: string, horario: number, codigo: string) {
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

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE HORARIO ROTATIVO
  EliminarHorarioRotativo(id_plan: number) {
    this.restPlanH.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerHorarioRotativo(this.datoActual.codigo, this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO DE HORARIO ROTATIVO
  ConfirmarHorarioRotativo(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.BuscarDatosPlanHorario(datos.id, datos.codigo)
          this.EliminarHorarioRotativo(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  // BUSCAR DETALLES DEL HORARIO ROTATIVO 
  detallesPlanificacion: any = [];
  BuscarDatosPlanHorario(id_planificacion: any, codigo: string) {
    this.detallesPlanificacion = [];
    this.restPlanHoraDetalle.ObtenerPlanHoraDetallePorIdPlanHorario(id_planificacion)
      .subscribe(datos => {
        this.detallesPlanificacion = datos;
        this.detallesPlanificacion.map(obj => {
          this.EliminarPlanificacionGeneral(obj.fecha, obj.id_horario, codigo)
        })
      })
  }

  // ELIMINAR REGISTROS DE PLANIFICACION GENERAL 
  EliminarPlanificacionGeneral(fecha: string, horario: number, codigo: string) {
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


  /** **************************************************************************************** **
   ** **                METODO DE PRESENTACION DE DATOS DE PERMISOS                         ** ** 
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DEL PERMISO 
  permisosTotales: any = [];
  ObtenerPermisos(formato_fecha: string, formato_hora: string) {
    this.permisosTotales = [];
    this.restPermiso.BuscarPermisoEmpleado(parseInt(this.idEmpleado)).subscribe(datos => {
      this.permisosTotales = datos;
      this.permisosTotales.forEach(p => {
        // TRATAMIENTO DE FECHAS Y HORAS
        p.fec_creacion_ = this.validar.FormatearFecha(p.fec_creacion, formato_fecha, this.validar.dia_completo);
        p.fec_inicio_ = this.validar.FormatearFecha(p.fec_inicio, formato_fecha, this.validar.dia_completo);
        p.fec_final_ = this.validar.FormatearFecha(p.fec_final, formato_fecha, this.validar.dia_completo);

        p.hora_ingreso_ = this.validar.FormatearHora(p.hora_ingreso, formato_hora);
        p.hora_salida_ = this.validar.FormatearHora(p.hora_salida, formato_hora);

      })
    })
  }

  // VENTANA PARA REGISTRAR PERMISOS DEL EMPLEADO 
  solicita_permiso: any = [];
  solicitudes_permiso: boolean = true;
  formulario_permiso: boolean = false;
  AbrirVentanaPermiso(): void {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      this.formulario_permiso = true;
      this.solicitudes_permiso = false;
      this.solicita_permiso = [];
      this.solicita_permiso = [
        {
          id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato,
          id_cargo: this.datoActual.id_cargo,
          ventana: 'empleado'
        }
      ]
    }
    else {
      this.formulario_permiso = false;
      this.solicitudes_permiso = true;
      this.toastr.info('El usuario no tiene registrado un Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO EDICION DE PERMISOS
  formulario_editar_permiso: boolean = false;
  empleado_permiso: number = 0;
  EditarPermiso(permisos: any) {
    this.formulario_editar_permiso = true;
    this.solicitudes_permiso = false;
    this.solicita_permiso = [];
    this.solicita_permiso = permisos;
    this.empleado_permiso = parseInt(this.idEmpleado);
  }

  // METODO PARA ELIMINAR PERMISOS DEL USUARIO
  CancelarPermiso(dataPermiso: any) {
    this.ventana.open(CancelarPermisoComponent,
      {
        width: '450px',
        data: { info: dataPermiso, id_empleado: parseInt(this.idEmpleado) }
      }).afterClosed().subscribe(items => {
        this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
      });
  }

  // MANEJO DE FILTRO DE DATOS DE PERMISOS
  filtradoFecha = '';
  fechaF = new FormControl('');

  // ASIGNACION DE VALIDACIONES A INPUTS DEL FORMULARIO
  public formulario = new FormGroup({
    fechaForm: this.fechaF,
  });

  // METODO PARA LIMPIAR FORMULARIO
  LimpiarCamposPermisos() {
    this.fechaF.setValue('');
    this.ObtenerPermisos(this.formato_fecha, this.formato_hora);
  }

  // METODO PARA CONSULTAR DATOS DEL USUARIO QUE SOLICITA EL PERMISO
  unPermiso: any = [];
  ConsultarPermisoIndividual(id: number) {
    this.unPermiso = [];
    this.restPermiso.ObtenerInformeUnPermiso(id).subscribe(datos => {
      this.unPermiso = datos[0];
      // TRATAMIENTO DE FECHAS Y HORAS
      this.unPermiso.fec_creacion_ = this.validar.FormatearFecha(this.unPermiso.fec_creacion, this.formato_fecha, this.validar.dia_completo);
      this.unPermiso.fec_inicio_ = this.validar.FormatearFecha(this.unPermiso.fec_inicio, this.formato_fecha, this.validar.dia_completo);
      this.unPermiso.fec_final_ = this.validar.FormatearFecha(this.unPermiso.fec_final, this.formato_fecha, this.validar.dia_completo);

      this.unPermiso.hora_ingreso_ = this.validar.FormatearHora(this.unPermiso.hora_ingreso, this.formato_hora);
      this.unPermiso.hora_salida_ = this.validar.FormatearHora(this.unPermiso.hora_salida, this.formato_hora);

      this.ConsultarAprobacionPermiso(id);
    })
  }

  // METODO PARA VER LA INFORMACION DE LA APROBACION DEL PERMISO
  aprobacionPermiso: any = [];
  empleado_estado: any = [];
  lectura: number = 0;
  ConsultarAprobacionPermiso(id: number) {
    this.aprobacionPermiso = [];
    this.empleado_estado = [];
    this.lectura = 1;
    this.aprobar.BuscarAutorizacionPermiso(id).subscribe(data => {
      this.aprobacionPermiso = data[0];
      if (this.aprobacionPermiso.id_documento === '' || this.aprobacionPermiso.id_documento === null) {
        this.GenerarPDFPermisos('open');
      }
      else {
        // METODO PARA OBTENER EMPLEADOS Y ESTADOS
        var autorizaciones = this.aprobacionPermiso.id_documento.split(',');
        autorizaciones.map((obj: string) => {
          this.lectura = this.lectura + 1;
          if (obj != '') {
            let empleado_id = obj.split('_')[0];
            var estado_auto = obj.split('_')[1];

            // CAMBIAR DATO ESTADO INT A VARCHAR
            if (estado_auto === '1') {
              estado_auto = 'Pendiente';
            }
            if (estado_auto === '2') {
              estado_auto = 'Preautorizado';
            }
            if (estado_auto === '3') {
              estado_auto = 'Autorizado';
            }
            if (estado_auto === '4') {
              estado_auto = 'Permiso Negado';
            }
            // CREAR ARRAY DE DATOS DE COLABORADORES
            var data = {
              id_empleado: empleado_id,
              estado: estado_auto
            }
            this.empleado_estado = this.empleado_estado.concat(data);
            // CUANDO TODOS LOS DATOS SE HAYAN REVISADO EJECUTAR METODO DE INFORMACION DE AUTORIZACION
            if (this.lectura === autorizaciones.length) {
              this.VerInformacionAutoriza(this.empleado_estado);
            }
          }
        })
      }
    });
  }

  // METODO PARA INGRESAR NOMBRE Y CARGO DEL USUARIO QUE REVIZO LA SOLICITUD 
  cadena_texto: string = ''; // VARIABLE PARA ALMACENAR TODOS LOS USUARIOS
  cont: number = 0;
  VerInformacionAutoriza(array: any) {
    this.cont = 0;
    array.map(empl => {
      this.informacion.InformarEmpleadoAutoriza(parseInt(empl.id_empleado)).subscribe(data => {
        this.cont = this.cont + 1;
        empl.nombre = data[0].fullname;
        empl.cargo = data[0].cargo;
        empl.departamento = data[0].departamento;
        if (this.cadena_texto === '') {
          this.cadena_texto = data[0].fullname + ': ' + empl.estado;
        } else {
          this.cadena_texto = this.cadena_texto + ' --.-- ' + data[0].fullname + ': ' + empl.estado;
        }
        if (this.cont === array.length) {
          this.GenerarPDFPermisos('open');
        }
      })
    })
  }


  /** **************************************************************************************************** ** 
   **                        METODO PARA EXPORTAR A PDF SOLICITUDES DE PERMISOS                            **
   ** **************************************************************************************************** **/

  // METODO PARA DESCARGAR SOLICITUD DE PERMISO
  GenerarPDFPermisos(action = 'open') {
    var documentDefinition: any;
    if (this.empleado_estado.length === 0) {
      documentDefinition = this.CabeceraDocumentoPermisoEmpleado();
    }
    else {
      documentDefinition = this.CabeceraDocumentoPermisoAprobacion();
    }

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;
      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  // CABECERA Y PIE DE PAGINA DEL DOCUMENTO
  CabeceraDocumentoPermisoEmpleado() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        var f = moment();
        fecha = f.format('DD/MM/YYYY');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: this.unPermiso.empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -25, 0, 20] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] },
        this.InformarEmpleado(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  // METODO PARA MOSTRAR LA INFORMACION DE LA SOLICITUD DEL PERMISO
  InformarEmpleado() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA SOLICITUD: ' + this.unPermiso.fec_creacion_, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.unPermiso.ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.unPermiso.nombre, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.unPermiso.apellido, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.unPermiso.cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.unPermiso.regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'Sucursal: ' + this.unPermiso.sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.unPermiso.num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.unPermiso.tipo_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DESDE: ' + this.unPermiso.fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.unPermiso.descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA HASTA: ' + this.unPermiso.fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APROBACIÓN: ' + this.cadena_texto, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.unPermiso.nombre + ' ' + this.unPermiso.apellido + '\n' + this.unPermiso.cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 10; },
        paddingBottom: function (i: any, node: any) { return 10; }
      }
    };
  }

  // CABECERA Y PIE DE PAGINA DEL DOCUMENTO
  CabeceraDocumentoPermisoAprobacion() {
    return {
      // ENCABEZADO DE LA PAGINA
      pageOrientation: 'landscape',
      watermark: { text: this.frase_m, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoLogueado[0].nombre + ' ' + this.empleadoLogueado[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // PIE DE PAGINA
      footer: function (currentPage: { toString: () => string; }, pageCount: string, fecha: string, hora: string) {
        var f = moment();
        fecha = f.format('DD/MM/YYYY');
        hora = f.format('HH:mm:ss');
        return {
          margin: 10,
          columns: [
            'Fecha: ' + fecha + ' Hora: ' + hora,
            {
              text: [
                {
                  text: '© Pag ' + currentPage.toString() + ' of ' + pageCount,
                  alignment: 'right', color: 'blue',
                  opacity: 0.5
                }
              ],
            }
          ], fontSize: 10, color: '#A4B8FF',
        }
      },
      content: [
        { image: this.logoE, width: 150, margin: [10, -25, 0, 5] },
        { text: this.unPermiso.empresa.toUpperCase(), bold: true, fontSize: 20, alignment: 'center', margin: [0, -25, 0, 20] },
        { text: 'SOLICITUD DE PERMISO', fontSize: 10, alignment: 'center', margin: [0, 0, 0, 20] },
        this.InformarAprobacion(),
      ],
      styles: {
        tableHeader: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.p_color, },
        tableHeaderA: { fontSize: 10, bold: true, alignment: 'center', fillColor: this.s_color, margin: [20, 0, 20, 0], },
        itemsTableD: { fontSize: 10, alignment: 'left', margin: [50, 5, 5, 5] },
        itemsTable: { fontSize: 10, alignment: 'center', }
      }
    };
  }

  // METODO PARA MOSTRAR LA INFORMACION DEL PERMISO CON APROBACION
  InformarAprobacion() {
    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: 'INFORMACIÓN GENERAL', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'FECHA SOLICITUD: ' + this.unPermiso.fec_creacion_, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'CIUDAD: ' + this.unPermiso.ciudad, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APELLIDOS: ' + this.unPermiso.nombre, style: 'itemsTableD' }] },
              { text: [{ text: 'NOMBRES: ' + this.unPermiso.apellido, style: 'itemsTableD' }] },
              { text: [{ text: 'CÉDULA: ' + this.unPermiso.cedula, style: 'itemsTableD' }] }
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'RÉGIMEN: ' + this.unPermiso.regimen, style: 'itemsTableD' }] },
              { text: [{ text: 'Sucursal: ' + this.unPermiso.sucursal, style: 'itemsTableD' }] },
              { text: [{ text: 'N°. Permiso: ' + this.unPermiso.num_permiso, style: 'itemsTableD' }] }
            ]
          }],
          [{ text: 'MOTIVO', style: 'tableHeader' }],
          [{
            columns: [
              { text: [{ text: 'TIPO DE SOLICITUD: ' + this.unPermiso.tipo_permiso, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA DESDE: ' + this.unPermiso.fec_inicio_, style: 'itemsTableD' }] },]
          }],
          [{
            columns: [
              { text: [{ text: 'OBSERVACIÓN: ' + this.unPermiso.descripcion, style: 'itemsTableD' }] },
              { text: [{ text: '', style: 'itemsTableD' }] },
              { text: [{ text: 'FECHA HASTA: ' + this.unPermiso.fec_final_, style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              { text: [{ text: 'APROBACIÓN: ', style: 'itemsTableD' }] },
            ]
          }],
          [{
            columns: [
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: this.empleado_estado[this.empleado_estado.length - 1].estado.toUpperCase() + ' POR', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.empleado_estado[this.empleado_estado.length - 1].nombre + '\n' + this.empleado_estado[this.empleado_estado.length - 1].cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              },
              {
                columns: [
                  { width: '*', text: '' },
                  {
                    width: 'auto',
                    layout: 'lightHorizontalLines',
                    table: {
                      widths: ['auto'],
                      body: [
                        [{ text: 'EMPLEADO', style: 'tableHeaderA' },],
                        [{ text: ' ', style: 'itemsTable', margin: [0, 20, 0, 20] },],
                        [{ text: this.unPermiso.nombre + ' ' + this.unPermiso.apellido + '\n' + this.unPermiso.cargo, style: 'itemsTable' },]
                      ]
                    }
                  },
                  { width: '*', text: '' },
                ]
              }
            ]
          }],
        ]
      },
      layout: {
        hLineColor: function (i: number, node: { table: { body: string | any[]; }; }) {
          return (i === 0 || i === node.table.body.length) ? 'rgb(80,87,97)' : 'rgb(80,87,97)';
        },
        paddingLeft: function (i: any, node: any) { return 40; },
        paddingRight: function (i: any, node: any) { return 40; },
        paddingTop: function (i: any, node: any) { return 10; },
        paddingBottom: function (i: any, node: any) { return 10; }
      }
    };
  }


  /** **************************************************************************************** **
   ** **            METODO DE PRESENTACION DE DATOS DE PERIODO DE VACACIONES                ** ** 
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DEL PERIODO DE VACACIONES 
  peridoVacaciones: any;
  ObtenerPeriodoVacaciones(formato_fecha: string) {
    this.peridoVacaciones = [];
    this.restPerV.ObtenerPeriodoVacaciones(this.empleadoUno[0].codigo).subscribe(datos => {
      this.peridoVacaciones = datos;

      this.peridoVacaciones.forEach(v => {
        // TRATAMIENTO DE FECHAS Y HORAS 
        v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
        v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
      })
    })
  }

  // VENTANA PARA INGRESAR PERÍODO DE VACACIONES 
  AbrirVentanaPerVacaciones(): void {
    if (this.datoActual.id_contrato != undefined) {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        console.log("idPerVaca ", this.idPerVacacion[0].id);
        this.toastr.info('El empleado ya tiene registrado un periodo de vacaciones y este se actualiza automáticamente', '', {
          timeOut: 6000,
        })
      }, error => {
        this.ventana.open(RegistrarPeriodoVComponent,
          {
            width: '900px', data: {
              idEmpleado: this.idEmpleado,
              idContrato: this.datoActual.id_contrato
            }
          })
          .afterClosed().subscribe(item => {
            this.ObtenerPeriodoVacaciones(this.formato_fecha);
          });
      });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Contrato.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA PERIODO DE VACACIONES 
  AbrirEditarPeriodoVacaciones(datoSeleccionado: any): void {
    this.ventana.open(EditarPeriodoVacacionesComponent,
      { width: '900px', data: { idEmpleado: this.idEmpleado, datosPeriodo: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerPeriodoVacaciones(this.formato_fecha);
      });
  }


  /** **************************************************************************************** **
   ** **                 METODO DE PRESENTACION DE DATOS DE VACACIONES                      ** ** 
   ** **************************************************************************************** **/

  // METODO PARA IMPRIMIR DATOS DE VACACIONES 
  vacaciones: any = [];
  ObtenerVacaciones(formato_fecha: string) {
    this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idPerVacacion = datos;
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
        this.vacaciones.forEach(v => {
          // TRATAMIENTO DE FECHAS Y HORAS 
          v.fec_ingreso_ = this.validar.FormatearFecha(v.fec_ingreso, formato_fecha, this.validar.dia_completo);
          v.fec_inicio_ = this.validar.FormatearFecha(v.fec_inicio, formato_fecha, this.validar.dia_completo);
          v.fec_final_ = this.validar.FormatearFecha(v.fec_final, formato_fecha, this.validar.dia_completo);
        })
      });
    });
  }

  // VENTANA PARA REGISTRAR VACACIONES DEL EMPLEADO 
  AbrirVentanaVacaciones(): void {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos[0];
        this.ventana.open(RegistrarVacacionesComponent,
          {
            width: '900px', data: {
              idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion.id,
              idContrato: this.idPerVacacion.idcontrato, idCargo: this.datoActual.id_cargo,
              idContratoActual: this.datoActual.id_contrato
            }
          })
          .afterClosed().subscribe(item => {
            this.ObtenerVacaciones(this.formato_fecha);
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones.', '', {
          timeOut: 6000,
        })
      });
    }
    else {
      this.toastr.info('El usuario no tiene registrado Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // METODO PARA EDITAR REGISTRO DE VACACION
  EditarVacaciones(v) {
    this.ventana.open(EditarVacacionesEmpleadoComponent,
      {
        width: '900px',
        data: {
          info: v, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }

  // METODO PARA ELIMINAR REGISTRO DE VACACIONES
  CancelarVacaciones(v) {
    this.ventana.open(CancelarVacacionesComponent,
      {
        width: '450px',
        data: {
          id: v.id, id_empleado: parseInt(this.idEmpleado),
          id_contrato: this.datoActual.id_contrato
        }
      }).afterClosed().subscribe(items => {
        this.ObtenerVacaciones(this.formato_fecha);
      });
  }


  /** *************************************************************************************** **
   ** **                 METODO PARA MOSTRAR DATOS DE HORAS EXTRAS                         ** ** 
   ** *************************************************************************************** **/

  // METODO DE BUSQUEDA DE HORAS EXTRAS
  hora_extra: any = [];
  solicita_horas: boolean = true;
  ObtenerlistaHorasExtrasEmpleado(formato_fecha: string, formato_hora: string) {
    this.hora_extra = [];
    this.restHE.ObtenerListaEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.hora_extra = res;
      this.hora_extra.forEach(h => {
        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        h.fecha_inicio_ = this.validar.FormatearFecha(moment(h.fec_inicio).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(moment(h.fec_inicio).format('HH:mm:ss'), formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(moment(h.fec_final).format('YYYY-MM-DD'), formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(moment(h.fec_final).format('HH:mm:ss'), formato_hora);

        h.fec_solicita_ = this.validar.FormatearFecha(h.fec_solicita, formato_fecha, this.validar.dia_completo);
      })

    }, err => {
      //return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  CancelarHoraExtra(h: any) {
    this.ventana.open(CancelarHoraExtraComponent,
      { width: '450px', data: h }).afterClosed().subscribe(items => {
        console.log(items);
        this.ObtenerlistaHorasExtrasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  /** *************************************************************************************** **
   ** **                 METODO PARA MOSTRAR DATOS DE HORAS EXTRAS                         ** ** 
   ** *************************************************************************************** **/

  // METODO DE BUSQUEDA DE HORAS EXTRAS
  hora_extra_plan: any = [];
  plan_horas: boolean = false;
  ObtenerPlanHorasExtras(formato_fecha: string, formato_hora: string) {
    this.hora_extra_plan = [];
    this.plan_hora.ListarPlanificacionUsuario(parseInt(this.idEmpleado)).subscribe(res => {
      this.hora_extra_plan = res;
      this.hora_extra_plan.forEach(h => {
        if (h.estado === 1) {
          h.estado = 'Pendiente';
        }
        else if (h.estado === 2) {
          h.estado = 'Pre-autorizado';
        }
        else if (h.estado === 3) {
          h.estado = 'Autorizado';
        }
        else if (h.estado === 4) {
          h.estado = 'Negado';
        }

        h.fecha_inicio_ = this.validar.FormatearFecha(h.fecha_desde, formato_fecha, this.validar.dia_completo);
        h.hora_inicio_ = this.validar.FormatearHora(h.hora_inicio, formato_hora);

        h.fecha_fin_ = this.validar.FormatearFecha(h.fecha_hasta, formato_fecha, this.validar.dia_completo);;
        h.hora_fin_ = this.validar.FormatearHora(h.hora_fin, formato_hora);
      })

    }, err => {
      // return this.validar.RedireccionarEstadisticas(err.error);
    });
  }

  MostrarPlanH() {
    this.solicita_horas = false;
    this.plan_horas = true;
  }

  MostrarSolicitaH() {
    this.solicita_horas = true;
    this.plan_horas = false;
  }

  // METODO PARA ABRIR FORMULARIO DE INGRESO DE PLANIFICACION DE HE
  PlanificarHoras() {
    if (this.datoActual.id_contrato != undefined && this.datoActual.id_cargo != undefined) {
      let datos = {
        id_contrato: this.datoActual.id_contrato,
        id_cargo: this.datoActual.id_cargo,
        nombre: this.datoActual.nombre + ' ' + this.datoActual.apellido,
        cedula: this.datoActual.cedula,
        codigo: this.datoActual.codigo,
        correo: this.datoActual.correo,
        id: this.datoActual.id,
      }
      this.ventana.open(
        PlanHoraExtraComponent,
        {
          width: '800px',
          data: { planifica: datos, actualizar: false }
        })
        .afterClosed().subscribe(item => {
          this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado Contrato o Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  AbrirEditarPlan(datoSeleccionado: any) {
    this.ventana.open(EditarPlanHoraExtraComponent, {
      width: '600px',
      data: { planifica: datoSeleccionado, modo: 'individual' }
    })
      .afterClosed().subscribe(id_plan => {
        this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
      });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlan(datos: any) {
    console.log('ver data seleccionada... ', datos)
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarPlanEmpleado(datos.id_plan, datos.id_empleado, datos);
        }
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanEmpleado(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fecha_desde, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fecha_hasta, this.formato_fecha, this.validar.dia_completo);
    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    this.plan_hora.EliminarPlanEmpleado(id_plan, id_empleado).subscribe(res => {
      this.NotificarPlanHora(desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreoPlanH(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerPlanHorasExtras(this.formato_fecha, this.formato_hora);
    });
  }

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE HORAS EXTRAS
  NotificarPlanHora(desde: any, hasta: any, h_inicio: any, h_fin: any, recibe: number) {
    let mensaje = {
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: recibe,
      tipo: 10, // PLANIFICACIÓN DE HORAS EXTRAS
      mensaje: 'Planificación de horas extras eliminada desde ' +
        desde + ' hasta ' +
        hasta + ' horario de ' + h_inicio + ' a ' + h_fin,
    }
    this.plan_hora.EnviarNotiPlanificacion(mensaje).subscribe(res => {
      this.aviso.RecibirNuevosAvisos(res.respuesta);
    });
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE HORAS EXTRAS
  EnviarCorreoPlanH(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {

    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      id_empl_envia: this.idEmpleadoLogueado,
      observacion: datos.descripcion,
      proceso: 'eliminado',
      correos: cuenta_correo,
      nombres: usuario,
      asunto: 'ELIMINACION DE PLANIFICACION DE HORAS EXTRAS',
      inicio: h_inicio,
      desde: desde,
      hasta: hasta,
      horas: moment(datos.horas_totales, 'HH:mm').format('HH:mm'),
      fin: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE HE
    this.plan_hora.EnviarCorreoPlanificacion(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
    })
  }

  /** ****************************************************************************************** **
   ** **         METODO PARA MOSTRAR DATOS DE ADMINISTRACION MODULO DE ALIMENTACION           ** **
   ** ****************************************************************************************** **/

  // MOSTRAR DATOS DE USUARIO - ADMINISTRACIÓN DE MÓDULO DE ALIMENTACIÓN 
  administra_comida: any = [];
  VerAdminComida() {
    this.administra_comida = [];
    this.restU.BuscarDatosUser(parseInt(this.idEmpleado)).subscribe(res => {
      this.administra_comida = res;
    });
  }

  // VENTANA PARA REGISTRAR ADMINISTRACION DE MÓDULO DE ALIMENTACIÓN 
  AbrirVentanaAdminComida(): void {
    this.ventana.open(AdministraComidaComponent,
      { width: '450px', data: { idEmpleado: this.idEmpleado } })
      .afterClosed().subscribe(item => {
        this.VerAdminComida();
      });
  }

  /** *************************************************************************************** **
   ** **          METODO DE PRESENTACION DE DATOS DE SERVICIO DE ALIMENTACION              ** **
   ** *************************************************************************************** **/

  // METODO PARA MOSTRAR DATOS DE PLANIFICACION DE ALMUERZOS 
  planComidas: any = [];
  ObtenerPlanComidasEmpleado(formato_fecha: string, formato_hora: string) {
    this.planComidas = [];
    this.restPlanComidas.ObtenerPlanComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(res => {
      this.planComidas = res;
      this.FormatearFechas(this.planComidas, formato_fecha, formato_hora);
    });
  }

  // METODO PARA FORMATEAR FECHAS Y HORAS 
  FormatearFechas(datos: any, formato_fecha: string, formato_hora: string) {
    datos.forEach(c => {
      // TRATAMIENTO DE FECHAS Y HORAS
      c.fecha_ = this.validar.FormatearFecha(c.fecha, formato_fecha, this.validar.dia_completo);

      if (c.fec_comida != undefined) {
        c.fec_comida_ = this.validar.FormatearFecha(c.fec_comida, formato_fecha, this.validar.dia_completo);
      }
      else {
        c.fec_inicio_ = this.validar.FormatearFecha(c.fec_inicio, formato_fecha, this.validar.dia_completo);
        c.fec_final_ = this.validar.FormatearFecha(c.fec_final, formato_fecha, this.validar.dia_completo);
      }

      c.hora_inicio_ = this.validar.FormatearHora(c.hora_inicio, formato_hora);
      c.hora_fin_ = this.validar.FormatearHora(c.hora_fin, formato_hora);

    })
  }

  // VENTANA PARA INGRESAR PLANIFICACION DE COMIDAS 
  AbrirVentanaPlanificacion(): void {
    console.log(this.idEmpleado);
    var info = {
      id_contrato: this.datoActual.id_contrato,
      id_cargo: this.datoActual.id_cargo,
      nombre: this.datoActual.nombre + ' ' + this.datoActual.apellido,
      cedula: this.datoActual.cedula,
      correo: this.datoActual.correo,
      codigo: this.datoActual.codigo,
      id: this.datoActual.id,
    }
    this.ventana.open(PlanificacionComidasComponent, {
      width: '600px',
      data: { servicios: info }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  // VENTANA PARA EDITAR PLANIFICACIÓN DE COMIDAS 
  AbrirEditarPlanComidas(datoSeleccionado): void {
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

  // VENTANA DE PLANIFICACION DE COMIDAS
  VentanaEditarPlanComida(datoSeleccionado: any, componente: any, forma: any) {
    this.ventana.open(componente, {
      width: '600px',
      data: { solicitud: datoSeleccionado, modo: forma }
    })
      .afterClosed().subscribe(item => {
        this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
      });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeletePlanComidas(datos: any) {
    // VERIFICAR SI HAY UN REGISTRO CON ESTADO CONSUMIDO DENTRO DE LA PLANIFICACION
    let datosConsumido = {
      id_plan_comida: datos.id,
      id_empleado: datos.id_empleado
    }
    this.restPlanComidas.EncontrarPlanComidaEmpleadoConsumido(datosConsumido).subscribe(consu => {
      this.toastr.info('Proceso no válido. Usuario ' + this.empleadoUno[0].nombre + ' '
        + this.empleadoUno[0].apellido + ' tiene registros de alimentación consumidos.', '', {
        timeOut: 6000,
      })
    }, error => {
      this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
        .subscribe((confirmado: Boolean) => {
          if (confirmado) {
            this.EliminarPlanComidas(datos.id, datos.id_empleado, datos);
          } else {
            this.router.navigate(['/verEmpleado/', this.idEmpleado]);
          }
        });
    });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO DE PLANIFICACIÓN
  EliminarPlanComidas(id_plan: number, id_empleado: number, datos: any) {

    // LECTURA DE DATOS DE USUARIO
    let usuario = '<tr><th>' + datos.nombre +
      '</th><th>' + datos.cedula + '</th></tr>';
    let cuenta_correo = datos.correo;

    // LECTURA DE DATOS DE LA PLANIFICACIÓN
    let desde = this.validar.FormatearFecha(datos.fec_inicio, this.formato_fecha, this.validar.dia_completo);
    let hasta = this.validar.FormatearFecha(datos.fec_final, this.formato_fecha, this.validar.dia_completo);

    let h_inicio = this.validar.FormatearHora(datos.hora_inicio, this.formato_hora);
    let h_fin = this.validar.FormatearHora(datos.hora_fin, this.formato_hora);

    this.restPlanComidas.EliminarPlanComida(id_plan, id_empleado).subscribe(res => {
      this.NotificarPlanificacion(datos, desde, hasta, h_inicio, h_fin, id_empleado);
      this.EnviarCorreo(datos, cuenta_correo, usuario, desde, hasta, h_inicio, h_fin);
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
    });
  }

  /** ***************************************************************************************************** **
   ** **                METODO DE BUSQUEDA DE PLANIFICACIONES DE SERVICIO DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/
  plan_comida: boolean = false;
  MostrarPlanComida() {
    this.ObtenerPlanComidasEmpleado(this.formato_fecha, this.formato_hora);
    this.solicita_comida = false;
    this.plan_comida = true;
  }

  solicita_comida: boolean = true;
  MostrarSolicitaComida() {
    this.ObtenerSolComidas(this.formato_fecha, this.formato_hora);
    this.solicita_comida = true;
    this.plan_comida = false;
  }

  // METODO PARA MOSTRAR DATOS DE PLANIFICACIÓN DE ALMUERZOS 
  solicitaComida: any = [];
  ObtenerSolComidas(formato_fecha: string, formato_hora: string) {
    this.solicitaComida = [];
    this.restPlanComidas.ObtenerSolComidaPorIdEmpleado(parseInt(this.idEmpleado)).subscribe(sol => {
      this.solicitaComida = sol;
      this.FormatearFechas(this.solicitaComida, formato_fecha, formato_hora);
    });
  }


  /** ***************************************************************************************************** **
   ** **               METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE ALIMENTACION                ** **
   ** ***************************************************************************************************** **/

  // METODO DE ENVIO DE NOTIFICACIONES DE PLANIFICACION DE SERVICIO DE ALIMENTACION
  NotificarPlanificacion(datos: any, desde: any, hasta: any, h_inicio: any, h_fin: any, id_empleado_recibe: number) {
    let mensaje = {
      id_comida: datos.id_detalle,
      id_empl_envia: this.idEmpleadoLogueado,
      id_empl_recive: id_empleado_recibe,
      tipo: 20, // PLANIFICACIÓN DE ALIMENTACION
      mensaje: 'Planificación de alimentación eliminada desde ' +
        desde + ' hasta ' +
        hasta +
        ' horario de ' + h_inicio + ' a ' + h_fin + ' servicio ',
    }
    this.restPlanComidas.EnviarMensajePlanComida(mensaje).subscribe(res => {
    })
  }

  // METODO DE ENVIO DE CORREO DE PLANIFICACIÓN DE SERVICIO DE ALIMENTACION
  EnviarCorreo(datos: any, cuenta_correo: any, usuario: any, desde: any, hasta: any, h_inicio: any, h_fin: any) {
    // DATOS DE ESTRUCTURA DEL CORREO
    let DataCorreo = {
      tipo_solicitud: 'ELIMINA',
      observacion: datos.observacion,
      id_comida: datos.id_detalle,
      id_envia: this.idEmpleadoLogueado,
      nombres: usuario,
      proceso: 'eliminado',
      asunto: 'ELIMINACION DE PLANIFICACION DE ALIMENTACION',
      correo: cuenta_correo,
      inicio: h_inicio,
      extra: datos.extra,
      desde: desde,
      hasta: hasta,
      final: h_fin,
    }

    // METODO ENVIO DE CORREO DE PLANIFICACIÓN DE ALIMENTACION
    this.restPlanComidas.EnviarCorreoPlan(DataCorreo).subscribe(res => {
      if (res.message === 'ok') {
        this.toastr.success('Correo de planificación enviado exitosamente.', '', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.warning('Ups algo salio mal !!!', 'No fue posible enviar correo de planificación.', {
          timeOut: 6000,
        });
      }
      console.log(res.message);
    })
  }

  /** ******************************************************************************************* **
   ** **                   METODO DE PRSENTACION DE DATOS DE PROCESOS                          ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE LOS PROCESOS DEL EMPLEADO 
  empleadoProcesos: any = [];
  ObtenerEmpleadoProcesos(formato_fecha: string) {
    this.empleadoProcesos = [];
    this.restEmpleadoProcesos.ObtenerProcesoUsuario(parseInt(this.idEmpleado)).subscribe(datos => {
      this.empleadoProcesos = datos;
      this.empleadoProcesos.forEach(data => {
        data.fec_inicio_ = this.validar.FormatearFecha(data.fec_inicio, formato_fecha, this.validar.dia_abreviado);
        data.fec_final_ = this.validar.FormatearFecha(data.fec_final, formato_fecha, this.validar.dia_abreviado);
      })
    })
  }

  // VENTANA PARA INGRESAR PROCESOS DEL EMPLEADO 
  AbrirVentanaProcesos(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistrarEmpleProcesoComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo } })
        .afterClosed().subscribe(item => {
          this.ObtenerEmpleadoProcesos(this.formato_fecha);
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR PROCESOS DEL EMPLEADO 
  AbrirVentanaEditarProceso(datoSeleccionado: any): void {
    this.ventana.open(EditarEmpleadoProcesoComponent,
      { width: '500px', data: { idEmpleado: this.idEmpleado, datosProcesos: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerEmpleadoProcesos(this.formato_fecha);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PROCESOS
  EliminarProceso(id_plan: number) {
    this.restEmpleadoProcesos.EliminarRegistro(id_plan).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerEmpleadoProcesos(this.formato_fecha);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteProceso(datos: any) {
    console.log(datos);
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarProceso(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }


  /** ******************************************************************************************* **
   ** **                METODO DE PRESENTACION DE DATOS DE AUTORIZACION                        ** ** 
   ** ******************************************************************************************* **/

  // METODO PARA MOSTRAR DATOS DE AUTORIDAD DEPARTAMENTOS 
  autorizacionesTotales: any = [];
  ObtenerAutorizaciones() {
    this.autorizacionesTotales = [];
    this.restAutoridad.BuscarAutoridadUsuario(parseInt(this.idEmpleado)).subscribe(datos => {
      this.autorizacionesTotales = datos;
    })
  }

  // VENTANA PARA REGISTRAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS 
  AbrirVentanaAutorizar(): void {
    if (this.datoActual.id_cargo != undefined) {
      this.ventana.open(RegistroAutorizacionDepaComponent,
        { width: '550px', data: { idEmpleado: this.idEmpleado, idCargo: this.datoActual.id_cargo } })
        .afterClosed().subscribe(item => {
          this.ObtenerAutorizaciones();
        });
    }
    else {
      this.toastr.info('El usuario no tiene registrado un Cargo.', '', {
        timeOut: 6000,
      })
    }
  }

  // VENTANA PARA EDITAR AUTORIZACIONES DE DIFERENTES DEPARTAMENTOS 
  AbrirEditarAutorizar(datoSeleccionado: any): void {
    this.ventana.open(EditarAutorizacionDepaComponent,
      { width: '550px', data: { idEmpleado: this.idEmpleado, datosAuto: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerAutorizaciones();
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACIÓN
  EliminarAutorizacion(id_auto: number) {
    this.restAutoridad.EliminarRegistro(id_auto).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.ObtenerAutorizaciones();
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDeleteAutorizacion(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarAutorizacion(datos.id);
        } else {
          this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

  /** ***************************************************************************************** **
   ** **                      METODO DE MANEJO DE BOTONES DE PERFIL                          ** **                      
   ** ***************************************************************************************** **/

  // VENTANA PARA MODIFICAR CONTRASEÑA 
  CambiarContrasena(): void {
    this.ventana.open(CambiarContrasenaComponent, { width: '350px', data: this.idEmpleado })
      .afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.sesion.logout();
        }
      });
  }

  // INGRESAR FRASE 
  IngresarFrase(): void {
    this.restU.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
      if (data[0].frase === null || data[0].frase === '') {
        this.ventana.open(FraseSeguridadComponent, { width: '450px', data: this.idEmpleado })
          .afterClosed()
          .subscribe((confirmado: Boolean) => {
            if (confirmado) {
              this.VerEmpresa();
            }
          });
      }
      else {
        this.CambiarFrase();
      }
    });
  }

  // CAMBIAR FRASE 
  CambiarFrase(): void {
    this.ventana.open(CambiarFraseComponent, { width: '450px', data: this.idEmpleado })
      .disableClose = true;
  }

  // VER BOTON FRASE DE ACUERDO A LA CONFIGURACION DE SEGURIDAD
  empresa: any = [];
  frase: boolean = false;
  cambiar_frase: boolean = false;
  activar_frase: boolean = false;
  VerEmpresa() {
    this.empresa = [];
    this.restEmpresa.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(data => {
      this.empresa = data;
      if (this.empresa[0].seg_frase === true) {
        this.activar_frase = true;
        this.restU.BuscarDatosUser(this.idEmpleadoLogueado).subscribe(data => {
          if (data[0].frase === null || data[0].frase === '') {
            this.frase = true;
            this.cambiar_frase = false;
          }
          else {
            this.frase = false;
            this.cambiar_frase = true;
          }
        });
      }
      else {
        this.activar_frase = false;
      }
    });
  }

  // MOSTRAR BOTON CAMBIAR CONTRASEÑA
  activar: boolean = false;
  VerAccionContrasena() {
    if (parseInt(this.idEmpleado) === this.idEmpleadoLogueado) {
      this.activar = true;
    }
    else {
      this.activar = false;
    }
  }


  /** ****************************************************************************************** **
   ** **                               PARA LA GENERACION DE PDFs                             ** **                                           *
   ** ****************************************************************************************** **/

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
              { text: 'Fecha Nacimiento: ' + this.empleadoUno[0].fec_nacimiento_ },
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
          ...this.tituloEmpleado.map(obj => {
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
          ...this.contratoEmpleado.map(obj => {
            const ingreso = obj.fec_ingreso_;
            if (obj.fec_salida === null) {
              const salida = '';
              return [obj.descripcion, obj.dia_anio_vacacion, ingreso, salida];
            } else {
              const salida = obj.fec_salida_;
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

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL                        ** **                           *
   ** ******************************************************************************************* **/

  ExportToExcel() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleado);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'PERFIL');
    xlsx.utils.book_append_sheet(wb, wsc, 'CONTRATO');
    xlsx.utils.book_append_sheet(wb, wst, 'TITULOS');
    xlsx.utils.book_append_sheet(wb, wsd, 'DISCAPACIDA');
    xlsx.writeFile(wb, "EmpleadoEXCEL" + new Date().getTime() + '.xlsx');
  }

  /** ******************************************************************************************* **
   ** **                          PARA LA EXPORTACIÓN DE ARCHIVOS CSV                          ** **                                *
   ** ******************************************************************************************* **/

  ExportToCVS() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleado);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.tituloEmpleado);
    const csvDataE = xlsx.utils.sheet_to_csv(wse);
    const csvDataC = xlsx.utils.sheet_to_csv(wsc);
    const csvDataD = xlsx.utils.sheet_to_csv(wsd);
    const csvDataT = xlsx.utils.sheet_to_csv(wst);
    const data: Blob = new Blob([csvDataE, csvDataC, csvDataD, csvDataT], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(data, "EmpleadoCSV" + new Date().getTime() + '.csv');
  }

  /** ******************************************************************************************* ** 
   ** **                             METODO PARA IMPRIMIR EN XML                               ** **
   ** ******************************************************************************************* **/

  nacionalidades: any = [];
  ObtenerNacionalidades() {
    this.restEmpleado.BuscarNacionalidades().subscribe(res => {
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
          "fechaNacimiento": obj.fec_nacimiento_,
          "estado": estado,
          "domicilio": obj.domicilio,
          "telefono": obj.telefono,
          "nacionalidad": nacionalidad,
          "imagen": obj.imagen
        }
      }
      arregloEmpleado.push(objeto)
    });
    this.restEmpleado.CrearXML(arregloEmpleado).subscribe(res => {
      this.data = res;
      this.urlxml = `${environment.url}/empleado/download/` + this.data.name;
      window.open(this.urlxml, "_blank");
    });
  }

}

