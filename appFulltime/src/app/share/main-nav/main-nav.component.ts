import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

import { LoginService } from 'src/app/servicios/login/login.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { MenuNode } from '../../model/menu.model'
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { FraseSeguridadComponent } from 'src/app/componentes/frase-administrar/frase-seguridad/frase-seguridad.component';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';
import { MainNavService } from './main-nav.service';
import { PlantillaReportesService } from '../../componentes/reportes/plantilla-reportes.service';

import * as moment from 'moment';

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

  id_empleado_logueado: number;

  treeControl = new NestedTreeControl<MenuNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<MenuNode>();

  idEmpresa: number;
  datosEmpresa: any = [];
  mensaje: boolean = false;

  fec_caducidad_licencia: Date;

  constructor(
    private breakpointObserver: BreakpointObserver,
    public location: Location,
    public restUsuario: UsuarioService,
    public loginService: LoginService,
    public restEmpresa: EmpresaService,
    public restF: FuncionesService,
    public ventana: MatDialog,
    private router: Router,
    private toaster: ToastrService,
    private plantillaPDF: PlantillaReportesService,
    private route: ActivatedRoute,
    private mainService: MainNavService
  ) { }

  hasChild = (_: number, node: MenuNode) => !!node.children && node.children.length > 0;

  isExpanded = true;
  isShowing = false;
  barraInicial = false;

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

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

    // ES IMPORTANTE EL ORDEN EN EL Q SE INVOCAN LAS FUNCIONES.
    if (this.loginService.loggedIn()) {
      this.idEmpresa = parseInt(localStorage.getItem('empresa'))

      this.FuncionLicencia()

      this.mainService.LogicaFunciones()
      this.plantillaPDF.ShowColoresLogo(localStorage.getItem('empresa'))
      this.breakpointObserver.observe('(max-width: 800px)').subscribe((result: BreakpointState) => {
        this.barraInicial = result.matches;
      });
      this.LlamarDatos();
    }

  }

  get color_p(): string { return this.plantillaPDF.color_Primary }
  get color_s(): string { return this.plantillaPDF.color_Secundary }
  get logo(): string { return this.plantillaPDF.logoBase64 }

  LlamarDatos() {
    this.id_empleado_logueado = parseInt(localStorage.getItem('empleado'));
    if (this.logo === 'undefined' || this.color_p === 'undefined' || this.color_s === 'undefined') {
      this.toaster.error('Falta agregar estilo o logotipo de la empresa para imprimir PDFs', 'Error configuración', { timeOut: 10000 })
        .onTap.subscribe(obj => {
          this.IrInfoEmpresa()
        })
      this.mensaje = true;
    } else {
      this.mensaje = false;
      this.SeleccionMenu();
    }
    this.ConfigurarSeguridad();
  }

  IrInfoEmpresa() {
    this.router.navigate(['/vistaEmpresa', this.idEmpresa], { relativeTo: this.route, skipLocationChange: false })
  }

  ConfigurarSeguridad() {

    this.restEmpresa.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].seg_frase === true) {
        this.restUsuario.BuscarDatosUser(this.id_empleado_logueado).subscribe(data => {
          if (data[0].id_rol === 1) {
            if (data[0].frase === null || data[0].frase === '') {
              this.toaster.info('Debe registrar su frase de seguridad.', 'Configuración doble seguridad', { timeOut: 10000 })
                .onTap.subscribe(obj => {
                  this.RegistrarFrase()
                })
            }
          }
        });
      }
    });
  }

  RegistrarFrase() {
    this.ventana.open(FraseSeguridadComponent,
      { width: '350px', data: this.id_empleado_logueado }).disableClose = true;
  }

  irHome() {
    if (this.loginService.getRol() === 1) {
      this.router.navigate(['/home'], { relativeTo: this.route, skipLocationChange: false });
    } else {
      this.router.navigate(['/estadisticas'], { relativeTo: this.route, skipLocationChange: false });
    }
  }


  get HabilitarAccion(): boolean { return this.mainService.accionesPersonal; }
  get HabilitarHoraExtra(): boolean { return this.mainService.horasExtras; }
  get HabilitarAlimentacion(): boolean { return this.mainService.alimentacion; }
  get HabilitarPermisos(): boolean { return this.mainService.permisos; }
  get HabilitarReportes(): boolean { return this.mainService.reportes; }

  /**
   * MENU PRINCIPAL
  */

  nombreSelect: string = '';
  manejarEstadoActivo(name) {
    this.nombreSelect = name;
  }

  SeleccionMenu() {

    const name_emp = localStorage.getItem('name_empresa');
    const tipo_empresa = localStorage.getItem('tipo_empresa');

    if (name_emp !== null && tipo_empresa !== null) {

      this.MetodoSubSelectMenu(name_emp, tipo_empresa)

    } else {
      this.restEmpresa.ConsultarEmpresas().subscribe(res => {
        console.log('Empresa: ', res);
        localStorage.setItem('name_empresa', res[0].nombre);
        localStorage.setItem('tipo_empresa', res[0].tipo_empresa);
        this.MetodoSubSelectMenu(res[0].nombre, res[0].tipo_empresa)

      })

    }

  }

  MetodoSubSelectMenu(nombre: string, tipo_empresa: string) {
    if (tipo_empresa === 'Pública') {
      this.mainService.setAccionesPersonal(true);
    }
    else {
      this.mainService.setAccionesPersonal(false);
    }
    if (this.loginService.getRolMenu() === true) {
      this.dataSource.data = this.MenuAdministracion(nombre) as MenuNode[];
    } else {
      this.dataSource.data = this.MenuEmpleado() as MenuNode[];
    }
  }

  MenuAdministracion(nombre: string) {
    return [
      {
        name: 'Configuración',
        accion: true,
        estado: true,
        icono: 'settings',
        children: [
          { name: 'Inicio', url: '/home' },
          {
            name: 'Parametrización',
            accion: true,
            estado: true,
            icono: 'widgets',
            children: [
              { name: nombre, url: '/vistaEmpresa/' + localStorage.getItem('empresa') },
              { name: 'Parámetros', url: '/parametros' },
              { name: 'Correo', url: '/configurarCorreo/' + localStorage.getItem('empresa') },
              { name: 'Roles', url: '/roles' },
              { name: 'Régimen Laboral', url: '/listarRegimen' },
            ]
          },
          {
            name: 'Localización',
            accion: true,
            estado: true,
            icono: 'location_on',
            children: [
              { name: 'Provincia', url: '/provincia' },
              { name: 'Ciudad', url: '/listarCiudades' },
              { name: 'Establecimiento', url: '/sucursales' },
              { name: 'Departamento', url: '/departamento' },
            ]
          },
        ]
      },
      {
        name: 'Usuarios',
        accion: true,
        estado: true,
        icono: 'account_circle',
        children: [
          { name: 'Configurar Código', url: '/codigo' },
          { name: 'Nivel de Educación', url: '/nivelTitulos' },
          { name: 'Título Profesional', url: '/titulos' },
          { name: 'Empleados', url: '/empleado' },
        ]
      },
      {
        name: 'Planificación',
        accion: true,
        estado: true,
        icono: 'assignment',
        children: [
          { name: 'Feriados', url: '/listarFeriados' },
          { name: 'Horarios', url: '/horario' },
          { name: 'Planificación RangoFecha', url: '/horariosMultiples' },
          { name: 'Planificación Múltiple', url: '/planificacion' },
        ]
      },
      {
        name: 'Módulos',
        accion: true,
        estado: true,
        icono: 'games',
        children: [
          {
            name: 'Permisos',
            accion: this.HabilitarPermisos,
            estado: true,
            icono: 'insert_emoticon',
            children: [
              { name: 'Configurar Permisos', url: '/verTipoPermiso' },
              { name: 'Permisos Múltiples', url: '/permisosMultiples' },
              { name: 'Aprobación Múltiple', url: '/permisos-solicitados' },
            ]
          },
          {
            name: 'Vacaciones',
            accion: this.HabilitarPermisos,
            estado: true,
            icono: 'flight',
            children: [
              { name: 'Aprobación Múltiple', url: '/vacaciones-solicitados' },
            ]
          },
          {
            name: 'Horas Extras',
            accion: this.HabilitarHoraExtra,
            estado: true,
            icono: 'schedule',
            children: [
              { name: 'Configurar HoraExtra', url: '/listaHorasExtras' },
              { name: 'Planificar Hora Extra', url: '/planificaHoraExtra' },
              { name: 'Listar Planificación', url: '/listadoPlanificaciones' },
              { name: 'Aprobación HE Planificada', url: '/planificacionesHorasExtras' },
              { name: 'Aprobación HE Solicitada', url: '/horas-extras-solicitadas' },
            ]
          },
          {
            name: 'Alimentación',
            accion: this.HabilitarAlimentacion,
            estado: true,
            icono: 'local_dining',
            children: [
              { name: 'Configurar Servicio', url: '/listarTipoComidas' },
              { name: 'Planificar Servicio', url: '/alimentacion' },
              { name: 'Listar Planificación', url: '/listaPlanComida' },
              { name: 'Aprobación Múltiple', url: '/listaSolicitaComida' },
            ]
          },
          {
            name: 'Acción Personal',
            accion: this.HabilitarAccion,
            estado: true,
            icono: 'how_to_reg',
            children: [
              { name: 'Procesos', url: '/proceso' },
              { name: 'Tipo Acción Personal', url: '/acciones-personal' },
              { name: 'Pedido Acción Personal', url: '/pedidoAccion' },
              { name: 'Listar Pedidos', url: '/listaPedidos' },
            ]
          },
          {
            name: 'Geolocalización',
            accion: this.HabilitarAccion,
            estado: true,
            icono: 'my_location',
            children: [
              { name: 'Registrar Geolocalización', url: '/coordenadas' },
            ]
          },
          {
            name: 'Aplicación Móvil',
            accion: this.HabilitarAccion,
            estado: true,
            icono: 'phone_android',
            children: [
              { name: 'Reloj Virtual', url: '/app-movil' },
            ]
          },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        icono: 'fingerprint',
        children: [
          { name: 'Dispositivos', url: '/listarRelojes' },
          { name: 'Timbre Teletrabajo', url: '/timbres-personal' },
          { name: 'Timbres Múltiples', url: '/timbres-multiples' },
          { name: 'Administrar Timbres', url: '/timbres-admin' },
        ]
      },
      {
        name: 'Notificaciones',
        accion: true,
        estado: true,
        icono: 'notifications',
        children: [
          { name: 'Documentos', url: '/archivos' },
          { name: 'Cumpleaños', url: '/cumpleanios' },
          { name: 'Comunicados', url: '/comunicados' },
        ]
      },
      {
        name: 'Reportería',
        accion: this.HabilitarReportes,
        estado: true,
        icono: 'description',
        children: [
          { name: 'Reportes', url: '/listaReportes' },
        ]
      }
    ];
  }

  MenuEmpleado() {
    return [
      {
        name: 'Perfil',
        accion: true,
        estado: true,
        icono: 'account_circle',
        children: [
          { name: 'Datos Generales', url: '/datosEmpleado' },
          { name: 'Contrato de Trabajo', url: '/cargoEmpleado' },
        ]
      },
      {
        name: 'Asistencia',
        accion: true,
        estado: true,
        icono: 'mobile_friendly',
        children: [
          { name: 'Planificación', url: '/planificacionHorario' },
          { name: 'Horarios', url: '/horariosEmpleado' },
        ]
      },
      {
        name: 'Horas Extras',
        accion: this.HabilitarHoraExtra,
        estado: true,
        icono: 'hourglass_full',
        children: [
          { name: 'Solicitar Hora Extra', url: '/horaExtraEmpleado' },
        ]
      },
      {
        name: 'Vacaciones',
        accion: true,
        estado: true,
        icono: 'flight',
        children: [
          { name: 'Solicitar Vacaciones', url: '/vacacionesEmpleado' },
        ]
      },
      {
        name: 'Permisos',
        accion: this.HabilitarPermisos,
        estado: true,
        icono: 'transfer_within_a_station',
        children: [
          { name: 'Solicitar Permiso', url: '/solicitarPermiso' },
        ]
      },
      {
        name: 'Alimentación',
        accion: this.HabilitarAlimentacion,
        estado: true,
        icono: 'restaurant',
        children: [
          { name: 'Planificación', url: '/almuerzosEmpleado' },
        ]
      },
      {
        name: 'Timbres',
        accion: true,
        estado: true,
        icono: 'fingerprint',
        children: [
          { name: 'Timbres personal', url: '/timbres-personal' },
        ]
      },
      {
        name: 'Acción Personal',
        accion: this.HabilitarAccion,
        estado: true,
        icono: 'how_to_reg',
        children: [
          { name: 'Procesos', url: '/procesosEmpleado' },
        ]
      },
      {
        name: 'Autorización',
        accion: true,
        estado: true,
        icono: 'lock_open',
        children: [
          { name: 'Autoridad', url: '/autorizaEmpleado' },
        ]
      },
      {
        name: 'Información',
        accion: true,
        estado: true,
        icono: 'info',
        children: [
          { name: 'Autoridades', url: '/informacion' },
          { name: 'Archivos', url: '/verDocumentacion' },
          { name: 'Estadísticas Generales', url: '/estadisticas' },
        ]
      },
      {
        name: 'Notificaciones',
        accion: true,
        estado: this.loginService.getEstado(),
        icono: 'notifications',
        children: [
          { name: 'Lista notificaciones', url: '/lista-notificaciones' },
        ]
      },
    ]
  }

}

