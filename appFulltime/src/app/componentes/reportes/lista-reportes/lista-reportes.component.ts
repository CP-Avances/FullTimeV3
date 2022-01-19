import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

interface CategoriasReportes {
  name: string;
  icono?: string,
  children?: RutasReportes[];
}

interface RutasReportes {
  name: string;
  url: string;
}

@Component({
  selector: 'app-lista-reportes',
  templateUrl: './lista-reportes.component.html',
  styleUrls: ['./lista-reportes.component.css']
})
export class ListaReportesComponent implements OnInit {

  idEmpresa: number;
  datosEmpresa: any = [];
  habilitarReportes: string = 'hidden';
  mensaje: boolean = false;

  treeControl = new NestedTreeControl<CategoriasReportes>(node => node.children);
  dataSource = new MatTreeNestedDataSource<CategoriasReportes>();

  hasChild = (_: number, node: CategoriasReportes) => !!node.children && node.children.length > 0;

  constructor(
    private rest: EmpresaService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit(): void {
    this.idEmpresa = parseInt(localStorage.getItem('empresa'))
    this.LlamarDatos();
  }

  LlamarDatos() {
    this.rest.ConsultarDatosEmpresa(this.idEmpresa).subscribe(datos => {
      this.datosEmpresa = datos;
      if (this.datosEmpresa[0].logo === null || this.datosEmpresa[0].color_p === null || this.datosEmpresa[0].color_s === null) {
        this.toast.error('Falta agregar estilo o logotipo de la empresa para imprimir PDFs', 'Error configuración', { timeOut: 10000 })
          .onTap.subscribe(obj => {
            this.IrInfoEmpresa()
          })
        this.mensaje = true;
      } else {
        this.habilitarReportes = 'visible';
      }
    });
  }

  IrInfoEmpresa() {
    this.router.navigate(['/vistaEmpresa', this.idEmpresa], { relativeTo: this.route, skipLocationChange: false })
  }

}

const TREE_DATA: CategoriasReportes[] = [
  {
    name: 'Reportes Generales',
    icono: 'grid_view',
    children: [
      { name: 'Kardex', url: '/reporteKardex' },
      { name: 'Timbres', url: '/reporteTimbres' },
      { name: 'Timbre Abierto', url: '/reporte-timbre-abierto' },
      { name: 'Atrasos', url: '/reporteAtrasos' },
      { name: 'Permisos', url: '/reportePermisos' },
      { name: 'Empleados', url: '/reporteEmpleados' },
      { name: 'Entradas Salidas', url: '/reporteEntradaSalida' },
      { name: 'Empleados Inactivos', url: '/reporte-emp-inactivos' },
      { name: 'Solicitudes Horas Extras', url: '/horas/extras' },
      { name: 'Horas Extras Autorizaciones', url: '/reporteHorasExtras' },
      { name: 'Asistencia Detalle Consolidado', url: '/reporteAsistenciaConsolidado' },
    ]
  },
  {
    name: 'Reportes Múltiples',
    icono: 'watch_later',
    children: [
     { name: 'Faltas', url: '/reporte-faltas' },
      //{ name: 'Atrasos', url: '/reporte-atrasos-multiples' },
      { name: 'Timbres', url: '/reporte-timbres-multiples' },
      { name: 'Puntualidad', url: '/reporte-puntualidad' },
      //{ name: 'Horas Trabajadas', url: '/reporte-horas-trabaja' },
      { name: 'Empleados Vacunados', url: '/lista-vacunados' },
      //{ name: 'Timbre Incompleto', url: '/reporte-timbre-incompleto' },
      //{ name: 'Salidas Anticipadas', url: '/salidas-anticipadas' },
      { name: 'Vacaciones Solicitadas', url: '/solicitud-vacacion' },
    ]
  },
  {
    name: 'Reportes Estadísticos',
    icono: 'leaderboard',
    children: [
      { name: 'Atrasos', url: '/macro/marcaciones' },
      { name: 'Asistencia', url: '/macro/asistencia' },
      { name: 'Inasistencia', url: '/macro/inasistencia' },
      { name: 'Horas Extras', url: '/macro/hora-extra' },
      { name: 'Salidas antes', url: '/macro/tiempo-jornada-vs-hora-ext' },
      { name: 'Jornada vs Horas extras', url: '/macro/jornada-vs-hora-extra' },
      { name: 'Tiempo Jornada vs Horas Extras', url: '/macro/retrasos' },
    ]
  },
  {
    name: 'Reportes Módulo de Alimentación',
    icono: 'local_dining',
    children: [
      { name: 'Tickets Consumidos', url: '/alimentosGeneral' },
      { name: 'Detallado Tickets Consumidos', url: '/alimentosDetallado' },
      { name: 'Servicios Invitados', url: '/alimentosInvitados' },
    ]
  },
  {
    name: 'Reportes Notificaciones',
    icono: 'notifications',
    children: [
      { name: 'Todos', url: '/listaAllNotificaciones' },
      { name: 'Usuarios', url: '/listaNotifacionUsuario' },
    ]
  },
  {
    name: 'Reportes Auditoría',
    icono: 'gavel',
    children: [
      { name: 'Lista reportes', url: '/auditoria' },
    ]
  },
];
