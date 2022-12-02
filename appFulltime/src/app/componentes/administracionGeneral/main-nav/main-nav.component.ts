import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NestedTreeControl } from '@angular/cdk/tree';
import { map, shareReplay } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import * as moment from 'moment';

import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { MainNavService } from './main-nav.service';
import { LoginService } from 'src/app/servicios/login/login.service';

import { FraseSeguridadComponent } from 'src/app/componentes/administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';

import { MenuNode } from 'src/app/model/menu.model';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})

export class MainNavComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe('(max-width: 800px)')
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  // CONTROL DE MENU
  treeControl = new NestedTreeControl<MenuNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<MenuNode>();

  // VARIABLES DE ALMACENAMIENTO
  idEmpresa: number;
  datosEmpresa: any = [];
  id_empleado_logueado: number;

  // VERIFICAR LICENCIA
  fec_caducidad_licencia: Date;

  constructor(
    public restF: FuncionesService,
    public inicio: LoginService,
    public ventana: MatDialog,
    public location: Location,
    public restEmpresa: EmpresaService,
    public restUsuario: UsuarioService,
    private route: ActivatedRoute,
    private router: Router,
    private toaster: ToastrService,
    private funciones: MainNavService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  hasChild = (_: number, node: MenuNode) => !!node.children && node.children.length > 0;

  isExpanded = true;
  isShowing = false;
  barraInicial = false;

  // EVENTOS DE SELECCION DE MENU
  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  // EVENTOS DE SELECCION DE MEN
  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  // METODO PARA MOSTRAR DATOS DE LICENCIA DEL SISTEMA
  showMessageLicencia: Boolean = false;
  FuncionLicencia() {
    const licencia = localStorage.getItem('fec_caducidad_licencia');
    if (licencia !== null) {
      const fec_caducidad = new Date(licencia.split('.')[0])
      const fecha_hoy = new Date();
      this.fec_caducidad_licencia = fec_caducidad;
      const fecha1 = moment(fecha_hoy.toJSON().split('T')[0])
      const fecha2 = moment(fec_caducidad.toJSON().split('T')[0])

      const diferencia = fecha2.diff(fecha1, 'days');

      if (diferencia <= 30) {
        this.showMessageLicencia = true;
        const text = (diferencia === 1) ? 'dia' : 'dias';
        this.toaster.warning(`SU LICENCIA EXPIRA EN ${diferencia + ' ' + text}`)
      }
    }
  }

  ngOnInit() {
    // ES IMPORTANTE EL ORDEN EN EL QUE SE INVOCAN LAS FUNCIONES
    if (this.inicio.loggedIn()) {
      this.idEmpresa = parseInt(localStorage.getItem('empresa'))
      this.FuncionLicencia();
      this.funciones.LogicaFunciones();
      this.breakpointObserver.observe('(max-width: 800px)').subscribe((result: BreakpointState) => {
        this.barraInicial = result.matches;
      });
      this.LlamarDatos();
    }
  }

  // METODO PARA MOSTRAR METODOS
  LlamarDatos() {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado'));
    this.SeleccionMenu();
    this.ConfigurarSeguridad();
  }

  // METODO PARA VALIDAR FRASE DE SEGURIDAD
  ConfigurarSeguridad() {
    this.restEmpresa.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].seg_frase === true) {
        this.restUsuario.BuscarDatosUser(this.id_empleado_logueado).subscribe(data => {
          if (data[0].id_rol === 1) {
            if (data[0].frase === null || data[0].frase === '') {
              this.toaster.info('Debe registrar su frase de seguridad.',
                'Configuración doble seguridad.', { timeOut: 10000 })
                .onTap.subscribe(obj => {
                  this.RegistrarFrase();
                })
            }
          }
        });
      }
    });
  }

  // METODO PARA REGISTRAR FRASE DE SEGURIDAD
  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent,
      { width: '350px', data: this.id_empleado_logueado }).disableClose = true;
  }

  // METODO DE NAVEGACION SEGUN ROL DE ACCESO
  irHome() {
    if (this.inicio.getRol() === 1) {
      this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
    } else {
      this.router.navigate(['/estadisticas'], { relativeTo: this.route, skipLocationChange: false });
    }
  }

  // CONTROL DE FUNCIONES DEL SISTEMA
  get HabilitarGeolocalizacion(): boolean { return this.funciones.geolocalizacion; }
  get HabilitarAlimentacion(): boolean { return this.funciones.alimentacion; }
  get HabilitarVacaciones(): boolean { return this.funciones.vacaciones; }
  get HabilitarHoraExtra(): boolean { return this.funciones.horasExtras; }
  get HabilitarPermisos(): boolean { return this.funciones.permisos; }
  get HabilitarReportes(): boolean { return this.funciones.reportes; }
  get HabilitarAccion(): boolean { return this.funciones.accionesPersonal; }
  get HabilitarMovil(): boolean { return this.funciones.app_movil; }

  // CONTROL DE MENU PRINCIPAL
  nombreSelect: string = '';
  manejarEstadoActivo(name: any) {
    this.nombreSelect = name;
  }

  // METODO DE SELECCION DE MENU
  SeleccionMenu() {
    const name_emp = localStorage.getItem('name_empresa');
    if (name_emp !== null) {
      this.MetodoSubSelectMenu(name_emp)
    } else {
      this.restEmpresa.ConsultarEmpresas().subscribe(res => {
        localStorage.setItem('name_empresa', res[0].nombre);
        this.MetodoSubSelectMenu(res[0].nombre)
      })
    }
  }

  // METODO DE LLMANADO DE MENU
  MetodoSubSelectMenu(nombre: string) {
    if (this.inicio.getRolMenu() === true) {
      this.dataSource.data = this.MenuAdministracion(nombre) as MenuNode[];
    } else {
      this.dataSource.data = this.MenuEmpleado() as MenuNode[];
    }
  }

  // MENU PERFIL ADMINISTRADOR
  MenuAdministracion(nombre: string) {
    return [
      {
        name: 'Configuración',
        accion: true,
        estado: true,
        color: true,
        icono: 'settings',
        children: [
          {
            name: 'Parametrización',
            accion: true,
            estado: true,
            color: true,
            icono: 'widgets',
            children: [
              { name: nombre, url: '/vistaEmpresa/' + localStorage.getItem('empresa'), color: true },
              { name: 'Parámetros', url: '/parametros', color: true },
              { name: 'Correo', url: '/configurarCorreo/' + localStorage.getItem('empresa'), color: true },
              { name: 'Roles', url: '/roles', color: true },
              { name: 'Régimen Laboral', url: '/listarRegimen', color: true },
            ]
          },
          {
            name: 'Localización',
            accion: true,
            estado: true,
            color: true,
            icono: 'location_on',
            children: [
              { name: 'Provincia', url: '/provincia', color: true },
              { name: 'Ciudad', url: '/listarCiudades', color: true },
              { name: 'Establecimiento', url: '/sucursales', color: true },
              { name: 'Departamento', url: '/departamento', color: true },
            ]
          },
        ]
      },
      {
        name: 'Usuarios',
        accion: true,
        estado: true,
        color: true,
        icono: 'account_circle',
        children: [
          { name: 'Configurar Código', url: '/codigo', color: true },
          { name: 'Nivel de Educación', url: '/nivelTitulos', color: true },
          { name: 'Título Profesional', url: '/titulos', color: true },
          { name: 'Empleados', url: '/empleado', color: true },
        ]
      },
      {
        name: 'Planificación',
        accion: true,
        estado: true,
        color: true,
        icono: 'assignment',
        children: [
          { name: 'Feriados', url: '/listarFeriados', color: true },
          { name: 'Horarios', url: '/horario', color: true },
          { name: 'Planificación RangoFecha', url: '/horariosMultiples', color: true },
          // { name: 'Planificación Múltiple', url: '/planificacion', color: true },
        ]
      },
      {
        name: 'Módulos',
        accion: true,
        estado: true,
        color: true,
        icono: 'games',
        children: [
          {
            name: 'Permisos',
            accion: this.HabilitarPermisos,
            estado: this.HabilitarPermisos,
            color: true,
            icono: 'insert_emoticon',
            children: [
              { name: 'Configurar Permisos', url: '/verTipoPermiso', color: true },
              { name: 'Permisos Múltiples', url: '/permisosMultiples', color: true },
              { name: 'Aprobación Múltiple', url: '/permisos-solicitados', color: true },
            ]
          },
          {
            name: 'Permisos',
            accion: !this.HabilitarPermisos,
            estado: !this.HabilitarPermisos,
            color: false,
            activo: this.HabilitarPermisos,
            icono: 'insert_emoticon',
            url: '/verTipoPermiso'
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarVacaciones,
            estado: this.HabilitarVacaciones,
            icono: 'flight',
            color: true,
            children: [
              { name: 'Aprobación Múltiple', url: '/vacaciones-solicitados', color: true },
            ]
          },
          {
            name: 'Vacaciones',
            accion: !this.HabilitarVacaciones,
            estado: !this.HabilitarVacaciones,
            activo: this.HabilitarVacaciones,
            icono: 'flight',
            color: false,
            url: '/vacaciones-solicitados'
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: this.HabilitarHoraExtra,
            color: true,
            icono: 'schedule',
            children: [
              { name: 'Configurar HoraExtra', url: '/listaHorasExtras', color: true },
              { name: 'Planificar Hora Extra', url: '/planificaHoraExtra', color: true },
              { name: 'Listar Planificación', url: '/listadoPlanificaciones', color: true },
              { name: 'Aprobación Múltiple', url: '/horas-extras-solicitadas', color: true },
            ]
          },
          {
            name: 'Horas Extras',
            accion: !this.HabilitarHoraExtra,
            estado: !this.HabilitarHoraExtra,
            activo: this.HabilitarHoraExtra,
            icono: 'schedule',
            color: false,
            url: '/listaHorasExtras'
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: this.HabilitarAlimentacion,
            icono: 'local_dining',
            color: true,
            children: [
              { name: 'Configurar Servicio', url: '/listarTipoComidas', color: true },
              { name: 'Planificar Servicio', url: '/alimentacion', color: true },
              { name: 'Listar Planificación', url: '/listaPlanComida', color: true },
              { name: 'Aprobación Múltiple', url: '/listaSolicitaComida', color: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: !this.HabilitarAlimentacion,
            estado: !this.HabilitarAlimentacion,
            activo: this.HabilitarAlimentacion,
            icono: 'local_dining',
            color: false,
            url: '/listarTipoComidas'
          },
          {
            name: 'Acción Personal',
            accion: this.HabilitarAccion,
            estado: this.HabilitarAccion,
            icono: 'how_to_reg',
            color: true,
            children: [
              { name: 'Procesos', url: '/proceso', color: true },
              { name: 'Tipo Acción Personal', url: '/acciones-personal', color: true },
              { name: 'Pedido Acción Personal', url: '/pedidoAccion', color: true },
              { name: 'Listar Pedidos', url: '/listaPedidos', color: true },
            ]
          },
          {
            name: 'Acción Personal',
            accion: !this.HabilitarAccion,
            estado: !this.HabilitarAccion,
            activo: this.HabilitarAccion,
            icono: 'how_to_reg',
            color: false,
            url: '/proceso'
          },
          {
            name: 'Geolocalización',
            accion: this.HabilitarGeolocalizacion,
            estado: this.HabilitarGeolocalizacion,
            icono: 'my_location',
            color: true,
            children: [
              { name: 'Registrar Geolocalización', url: '/coordenadas', color: true },
            ]
          },
          {
            name: 'Geolocalización',
            accion: !this.HabilitarGeolocalizacion,
            estado: !this.HabilitarGeolocalizacion,
            activo: this.HabilitarGeolocalizacion,
            icono: 'my_location',
            color: false,
            url: '/coordenadas'
          },
          {
            name: 'Aplicación Móvil',
            accion: this.HabilitarMovil,
            estado: this.HabilitarMovil,
            icono: 'phone_android',
            color: true,
            children: [
              { name: 'Reloj Virtual', url: '/app-movil', color: true },
            ]
          },
          {
            name: 'Aplicación Móvil',
            accion: !this.HabilitarMovil,
            estado: !this.HabilitarMovil,
            activo: this.HabilitarMovil,
            icono: 'phone_android',
            color: false,
            url: '/app-movil'
          },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        icono: 'fingerprint',
        color: true,
        children: [
          { name: 'Dispositivos', url: '/listarRelojes', color: true },
          { name: 'Timbre Teletrabajo', url: '/timbres-personal', color: true },
          { name: 'Timbres Múltiples', url: '/timbres-multiples', color: true },
          { name: 'Administrar Timbres', url: '/timbres-admin', color: true },
        ]
      },
      {
        name: 'Notificaciones',
        accion: true,
        estado: true,
        icono: 'notifications',
        color: true,
        children: [
          { name: 'Documentos', url: '/archivos', color: true },
          { name: 'Cumpleaños', url: '/cumpleanios', color: true },
          { name: 'Comunicados', url: '/comunicados', color: true },
        ]
      },
      {
        name: 'Reportes',
        accion: this.HabilitarReportes,
        estado: true,
        icono: 'description',
        color: true,
        children: [
          {
            name: 'Generales',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'grid_view',
            color: true,
            children: [
              { name: 'Kardex', url: '/reporteKardex', color: true },
              { name: 'Timbres', url: '/reporteTimbres', color: true },
              { name: 'Atrasos', url: '/reporteAtrasos', color: true },
              { name: 'Permisos', url: '/reportePermisos', color: true },
              { name: 'Empleados', url: '/reporteEmpleados', color: true },
              { name: 'Entradas Salidas', url: '/reporteEntradaSalida', color: true },
              { name: 'Empleados Inactivos', url: '/reporte-emp-inactivos', color: true },
              { name: 'Solicitudes Horas Extras', url: '/horas/extras', color: true },
              { name: 'Horas Extras Autorizaciones', url: '/reporteHorasExtras', color: true },
              { name: 'Asistencia Detalle Consolidado', url: '/reporteAsistenciaConsolidado', color: true },
            ]
          },
          {
            name: 'Múltiples',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'watch_later',
            color: true,
            children: [
              { name: 'Faltas', url: '/reporte-faltas', color: true },
              //{ name: 'Atrasos', url: '/reporte-atrasos-multiples', color: true },
              { name: 'Timbres', url: '/reporte-timbres-multiples', color: true },
              { name: 'Timbre Teletrabajo', url: '/reporte-timbre-sistema', color: true },
              { name: 'Timbre Reloj Virtual', url: '/reporte-timbre-reloj-virtual', color: true },
              { name: 'Timbre Horario Abierto', url: '/reporte-timbre-abierto', color: true },
              { name: 'Puntualidad', url: '/reporte-puntualidad', color: true },
              //{ name: 'Horas Trabajadas', url: '/reporte-horas-trabaja', color: true },
              { name: 'Empleados Vacunados', url: '/lista-vacunados', color: true },
              //{ name: 'Timbre Incompleto', url: '/reporte-timbre-incompleto', color: true },
              //{ name: 'Salidas Anticipadas', url: '/salidas-anticipadas', color: true },
              { name: 'Vacaciones Solicitadas', url: '/solicitud-vacacion', color: true },
            ]
          },
          {
            name: 'Estadísticos',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'leaderboard',
            color: true,
            children: [
              { name: 'Atrasos', url: '/macro/retrasos', color: true },
              { name: 'Timbres', url: '/macro/marcaciones', color: true },
              { name: 'Asistencia', url: '/macro/asistencia', color: true },
              { name: 'Inasistencia', url: '/macro/inasistencia', color: true },
              { name: 'Horas Extras', url: '/macro/hora-extra', color: true },
              { name: 'Salidas antes', url: '/macro/tiempo-jornada-vs-hora-ext', color: true },
              { name: 'Jornada vs Horas extras', url: '/macro/jornada-vs-hora-extra', color: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'restaurant',
            color: true,
            children: [
              { name: 'Tickets Consumidos', url: '/alimentosGeneral', color: true },
              { name: 'Detalle Tickets Consumidos', url: '/alimentosDetallado', color: true },
              { name: 'Servicios Invitados', url: '/alimentosInvitados', color: true },
            ]
          },
          {
            name: 'Notificaciones',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'notifications_active',
            color: true,
            children: [
              { name: 'Todos', url: '/listaAllNotificaciones', color: true },
              { name: 'Usuarios', url: '/listaNotifacionUsuario', color: true },
            ]
          },
          {
            name: 'Auditoría',
            accion: this.HabilitarReportes,
            estado: true,
            icono: 'gavel',
            color: true,
            children: [
              { name: 'Auditoria', url: '/auditoria', color: true },
            ]
          },
        ]
      },
    ];
  }

  // SELECCION MENU DE EMPLEADO
  MenuEmpleado() {
    return [
      {
        name: 'Perfil',
        accion: true,
        estado: true,
        icono: 'account_circle',
        color: true,
        children: [
          { name: 'Datos Generales', url: '/datosEmpleado' },
          { name: 'Contrato de Trabajo', url: '/cargoEmpleado' },
        ]
      },
      {
        name: 'Asistencia',
        accion: true,
        estado: true,
        color: true,
        icono: 'mobile_friendly',
        children: [
          { name: 'Planificación RangoFecha', url: '/horariosEmpleado' },
          { name: 'Planificación Rotativa', url: '/planificacionHorario' },
        ]
      },
      {
        name: 'Módulos',
        accion: true,
        estado: true,
        color: true,
        icono: 'games',
        children: [
          {
            name: 'Permisos',
            accion: this.HabilitarPermisos,
            estado: this.HabilitarPermisos,
            color: true,
            icono: 'transfer_within_a_station',
            children: [
              { name: 'Solicitar Permiso', url: '/solicitarPermiso', color: true },
            ]
          },
          {
            name: 'Permisos',
            accion: !this.HabilitarPermisos,
            estado: !this.HabilitarPermisos,
            activo: this.HabilitarPermisos,
            color: false,
            icono: 'transfer_within_a_station',
            url: '/solicitarPermiso'
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarVacaciones,
            estado: this.HabilitarVacaciones,
            color: true,
            icono: 'flight',
            children: [
              { name: 'Solicitar Vacaciones', url: '/vacacionesEmpleado', color: true },
            ]
          },
          {
            name: 'Vacaciones',
            accion: !this.HabilitarVacaciones,
            estado: !this.HabilitarVacaciones,
            activo: this.HabilitarVacaciones,
            color: false,
            icono: 'flight',
            url: '/vacacionesEmpleado'
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: this.HabilitarHoraExtra,
            color: true,
            icono: 'hourglass_full',
            children: [
              { name: 'Solicitar Hora Extra', url: '/horaExtraEmpleado', color: true },
              { name: 'Planificación HorasExtras', url: '/horasPlanEmpleado', color: true },
            ]
          },
          {
            name: 'Horas Extras',
            accion: !this.HabilitarHoraExtra,
            estado: !this.HabilitarHoraExtra,
            activo: this.HabilitarHoraExtra,
            color: false,
            icono: 'hourglass_full',
            url: '/horaExtraEmpleado'
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: this.HabilitarAlimentacion,
            color: true,
            icono: 'restaurant',
            children: [
              { name: 'Solicitar Servicio', url: '/comidasEmpleado', color: true },
              { name: 'Planificación Alimentación', url: '/comidasPlanEmpleado', color: true },
            ]
          },
          {
            name: 'Alimentación',
            accion: !this.HabilitarAlimentacion,
            estado: !this.HabilitarAlimentacion,
            activo: this.HabilitarAlimentacion,
            color: false,
            icono: 'restaurant',
            url: '/comidasEmpleado'
          },
          {
            name: 'Acción Personal',
            accion: this.HabilitarAccion,
            estado: this.HabilitarAccion,
            color: true,
            icono: 'how_to_reg',
            children: [
              { name: 'Procesos', url: '/procesosEmpleado', color: true },
            ]
          },
          {
            name: 'Acción Personal',
            accion: !this.HabilitarAccion,
            estado: !this.HabilitarAccion,
            activo: this.HabilitarAccion,
            color: false,
            icono: 'how_to_reg',
            url: '/procesosEmpleado'
          },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        color: true,
        icono: 'fingerprint',
        children: [
          { name: 'Timbre Teletrabajo', url: '/timbres-personal', color: true },
        ]
      },
      {
        name: 'Autorización',
        accion: true,
        estado: true,
        color: true,
        icono: 'lock_open',
        children: [
          { name: 'Autoridad', url: '/autorizaEmpleado', color: true },
        ]
      },
      {
        name: 'Información',
        accion: true,
        estado: true,
        icono: 'info',
        color: true,
        children: [
          { name: 'Autoridades', url: '/informacion', color: true },
          { name: 'Documentos', url: '/verDocumentacion', color: true },
        ]
      },
      {
        name: 'Notificaciones',
        accion: true,
        estado: true,
        color: true,
        icono: 'notifications',
        children: [
          { name: 'Lista notificaciones', url: '/lista-notificaciones', color: true },
        ]
      },
    ]
  }
}
