import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Componentes Administrador
import { VistaRolesComponent } from './componentes/catalogos/catRoles/vista-roles/vista-roles.component';
import { RegistroComponent } from './componentes/empleado/datos-empleado/registro/registro.component';
import { ListaEmpleadosComponent } from './componentes/empleado/datos-empleado/lista-empleados/lista-empleados.component';
import { LoginComponent } from './componentes/login/login.component';
import { HomeComponent } from './componentes/home/home.component';
import { VerEmpleadoComponent } from './componentes/empleado/ver-empleado/ver-empleado.component';
import { SeleccionarRolPermisoComponent } from './componentes/catalogos/catRoles/seleccionar-rol-permiso/seleccionar-rol-permiso.component'
import { ListarRegimenComponent } from './componentes/catalogos/catRegimen/listar-regimen/listar-regimen.component';
import { RegimenComponent } from './componentes/catalogos/catRegimen/regimen/regimen.component';
import { TipoComidasComponent } from './componentes/catalogos/catTipoComidas/tipo-comidas/tipo-comidas.component';
import { RelojesComponent } from './componentes/catalogos/catRelojes/relojes/relojes.component'
import { PrincipalProcesoComponent } from './componentes/catalogos/catProcesos/principal-proceso/principal-proceso.component';
import { RegistroProcesoComponent } from './componentes/catalogos/catProcesos/registro-proceso/registro-proceso.component';
import { PrincipalProvinciaComponent } from './componentes/catalogos/catProvincia/listar-provincia/principal-provincia.component';
import { PrincipalDepartamentoComponent } from './componentes/catalogos/catDepartamentos/listar-departamento/principal-departamento.component';
import { PrincipalHorarioComponent } from './componentes/catalogos/catHorario/principal-horario/principal-horario.component';
import { RegistroHorarioComponent } from './componentes/catalogos/catHorario/registro-horario/registro-horario.component';
import { HorasExtrasComponent } from './componentes/catalogos/catHorasExtras/registrar-horas-extras/horas-extras.component';
import { RegistrarFeriadosComponent } from './componentes/catalogos/catFeriados/registrar-feriados/registrar-feriados.component';
import { ListarFeriadosComponent } from './componentes/catalogos/catFeriados/listar-feriados/listar-feriados.component';
import { RegistroDepartamentoComponent } from './componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { PrincipalEnroladosComponent } from './componentes/catalogos/catEnrolados/principal-enrolados/principal-enrolados.component';
import { TipoPermisosComponent } from './componentes/catalogos/catTipoPermisos/tipo-permisos/tipo-permisos.component';
import { ListarTipoComidasComponent } from './componentes/catalogos/catTipoComidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { ListarRelojesComponent } from './componentes/catalogos/catRelojes/listar-relojes/listar-relojes.component';
import { ListarCiudadComponent } from './componentes/ciudades/listar-ciudad/listar-ciudad.component';
import { VistaElementosComponent } from './componentes/catalogos/catTipoPermisos/listarTipoPermisos/vista-elementos.component';
import { EmplCargosComponent } from './componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { ListarTitulosComponent } from './componentes/catalogos/catTitulos/listar-titulos/listar-titulos.component';
import { ListarCiudadFeriadosComponent } from './componentes/catalogos/catFeriados/listar-ciudad-feriados/listar-ciudad-feriados.component';
import { ListaSucursalesComponent } from './componentes/sucursales/lista-sucursales/lista-sucursales.component';
import { ListarEmpresasComponent } from './componentes/catalogos/catEmpresa/listar-empresas/listar-empresas.component';
import { ListarNivelTitulosComponent } from './componentes/nivelTitulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { DispositivosEnroladosComponent } from './componentes/catalogos/catEnrolados/dispositivos-enrolados/dispositivos-enrolados.component';
import { OlvidarContraseniaComponent } from './componentes/login/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/login/confirmar-contrasenia/confirmar-contrasenia.component';
import { PlanificacionMultipleComponent } from './componentes/planificacion-multiple/planificacion-multiple.component';
import { VerHorarioDetalleComponent } from './componentes/catalogos/catHorario/ver-horario-detalle/ver-horario-detalle.component';
import { ListarEmpleadoPermisoComponent } from './componentes/empleadoPermisos/listar-empleado-permiso/listar-empleado-permiso.component';
import { RegistrarAsistenciaComponent } from './componentes/asistencia/registrar-asistencia/registrar-asistencia.component';
import { VerPedidoHoraExtraComponent } from './componentes/horasExtras/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
import { CalculoHoraExtraComponent } from './componentes/horasExtras/calculo-hora-extra/calculo-hora-extra.component';
import { VerDetallePlanHorariosComponent } from './componentes/detallePlanHorarios/ver-detalle-plan-horarios/ver-detalle-plan-horarios.component';
import { VerEmpleadoPermisoComponent } from './componentes/empleadoPermisos/ver-empleado-permiso/ver-empleado-permiso.component';
import { VerVacacionComponent } from './componentes/vacaciones/ver-vacacion/ver-vacacion.component';
import { ListarVacacionesComponent } from './componentes/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { VerDocumentosComponent } from './componentes/documentos/ver-documentos/ver-documentos.component';
import { SucListaNotiComponent } from './componentes/catalogos/catNotificaciones/suc-lista-noti/suc-lista-noti.component';
import { VerDipositivoComponent } from './componentes/catalogos/catRelojes/ver-dipositivo/ver-dipositivo.component';
import { ConfigurarCodigoComponent } from './componentes/configurar-codigo/configurar-codigo.component';
import { VerRegimenComponent } from './componentes/catalogos/catRegimen/ver-regimen/ver-regimen.component';
import { VerTipoPermisoComponent } from './componentes/catalogos/catTipoPermisos/ver-tipo-permiso/ver-tipo-permiso.component';
import { ListaHorasExtrasComponent } from './componentes/catalogos/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { VerHorasExtrasComponent } from './componentes/catalogos/catHorasExtras/ver-horas-extras/ver-horas-extras.component';
import { VerEmpresaComponent } from './componentes/catalogos/catEmpresa/ver-empresa/ver-empresa.component';
import { VerSucursalComponent } from './componentes/sucursales/ver-sucursal/ver-sucursal.component';
import { VerBirthdayComponent } from './componentes/birthday/ver-birthday/ver-birthday.component';
import { HoraExtraRealComponent } from './componentes/calculos/hora-extra-real/hora-extra-real.component';
import { ListaEmplePlanHoraEComponent } from './componentes/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { ListaPlanHoraExtraComponent } from './componentes/horasExtras/planificacionHoraExtra/lista-plan-hora-extra/lista-plan-hora-extra.component';
import { RealtimeAvisosComponent } from './componentes/notificaciones/realtime-avisos/realtime-avisos.component';
import { ListaPlanificacionesComponent } from './componentes/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { PlanComidasComponent } from './componentes/planificacionComidas/plan-comidas/plan-comidas.component';
import { ListarTipoAccionComponent } from './componentes/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { VerTipoAccionComponent } from './componentes/accionesPersonal/tipoAccionesPersonal/ver-tipo-accion/ver-tipo-accion.component';

// Seguridad
import { AuthGuard } from "./guards/auth.guard";

//Reportes
import { ReporteTimbresComponent } from './componentes/reportes/timbres/reporte-timbres/reporte-timbres.component';
import { ReportePermisosComponent } from './componentes/reportes/reporte-permisos/reporte-permisos.component';
import { ReporteAtrasosComponent } from './componentes/reportes/atrasos/reporte-atrasos/reporte-atrasos.component';
import { ReporteEntradaSalidaComponent } from './componentes/reportes/entradas-salidas/reporte-entrada-salida/reporte-entrada-salida.component';
import { AsistenciaConsolidadoComponent } from './componentes/reportes/reporte-asistencia-consolidado/asistencia-consolidado.component';
import { ListaReportesComponent } from './componentes/reportes/lista-reportes/lista-reportes.component';
import { ReporteHorasPedidasComponent } from './componentes/reportes/horas-extras/reporte-horas-pedidas/reporte-horas-pedidas.component';
import { TimbreAbiertosComponent } from './componentes/reportes/timbres/timbre-abiertos/timbre-abiertos.component';


// Componentes Empleado
import { ContratoCargoEmpleadoComponent } from './componentes/rolEmpleado/contrato-cargo-empleado/contrato-cargo-empleado.component';
import { DatosEmpleadoComponent } from './componentes/rolEmpleado/datos-empleado/datos-empleado.component';
import { HomeEmpleadoComponent } from './componentes/rolEmpleado/home-empleado/home-empleado.component';
import { InformacionJefeComponent } from './componentes/rolEmpleado/informacion-jefe/informacion-jefe.component';
import { PlanificacionHorarioEmpleadoComponent } from './componentes/rolEmpleado/planificacion-horario-empleado/planificacion-horario-empleado.component';
import { DetalleHorarioEmpleadoComponent } from './componentes/rolEmpleado/detalle-horario-empleado/detalle-horario-empleado.component';
import { HorariosEmpleadoComponent } from './componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VacacionesEmpleadoComponent } from './componentes/rolEmpleado/vacaciones-empleado/vacaciones-empleado.component';
import { SolicitarPermisosEmpleadoComponent } from './componentes/rolEmpleado/solicitar-permisos-empleado/solicitar-permisos-empleado.component';
import { RealtimeNotificacionComponent } from './componentes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { VerDocumentacionComponent } from './componentes/rolEmpleado/ver-documentacion/ver-documentacion.component';
import { ListaPedidoHoraExtraComponent } from './componentes/horasExtras/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { HoraExtraEmpleadoComponent } from './componentes/rolEmpleado/hora-extra-empleado/hora-extra-empleado.component';
import { PlanificacionComidasEmpleadoComponent } from './componentes/rolEmpleado/planificacion-comidas-empleado/planificacion-comidas-empleado.component';
import { ProcesosEmpleadoComponent } from './componentes/rolEmpleado/procesos-empleado/procesos-empleado.component';
import { AutorizaEmpleadoComponent } from './componentes/rolEmpleado/autoriza-empleado/autoriza-empleado.component';
import { ReporteKardexComponent } from './componentes/reportes/vacaciones/reporte-kardex/reporte-kardex.component';
import { ReporteEmpleadosComponent } from './componentes/reportes/empleados/reporte-empleados/reporte-empleados.component';
import { ListaArchivosComponent } from './componentes/documentos/lista-archivos/lista-archivos.component';
import { TimbreWebComponent } from './componentes/timbre-web/timbre-empleado/timbre-web.component';
import { TimbreAdminComponent } from './componentes/timbre-web/timbre-admin/timbre-admin.component';
import { ReporteHorasExtrasComponent } from './componentes/reportes/horas-extras/reporte-horas-extras/reporte-horas-extras.component';
import { InasistenciaMacroComponent } from './componentes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { AsistenciaMacroComponent } from './componentes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { HoraExtraMacroComponent } from './componentes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { RetrasosMacroComponent } from './componentes/graficas-macro/retrasos-macro/retrasos-macro.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { AlimentosGeneralComponent } from './componentes/reportes/alimentacion/alimentos-general/alimentos-general.component';
import { SalidasAntesMacroComponent } from './componentes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { ReporteAtrasosMultiplesComponent } from './componentes/reportes/atrasos/reporte-atrasos-multiples/reporte-atrasos-multiples.component';
import { ReporteEmpleadosInactivosComponent } from './componentes/reportes/empleados/reporte-empleados-inactivos/reporte-empleados-inactivos.component';
import { ReporteFaltasComponent } from './componentes/reportes/reporte-faltas/reporte-faltas.component';
import { ReporteHorasTrabajadasComponent } from './componentes/reportes/reporte-horas-trabajadas/reporte-horas-trabajadas.component';
import { ReporteTimbresMultiplesComponent } from './componentes/reportes/timbres/reporte-timbres-multiples/reporte-timbres-multiples.component';
import { ReportePuntualidadComponent } from './componentes/reportes/reporte-puntualidad/reporte-puntualidad.component';
import { MetricaAtrasosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-atrasos/metrica-atrasos.component';
import { MetricaHorasExtrasComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaPermisosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-permisos/metrica-permisos.component';
import { MetricaVacacionesComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-vacaciones/metrica-vacaciones.component';
import { VistaMenuComponent } from './componentes/catalogos/catTipoComidas/vista-menu/vista-menu.component';
import { DetallePlanificadosComponent } from './componentes/reportes/alimentacion/detalle-planificados/detalle-planificados.component';
import { CrearPedidoAccionComponent } from './componentes/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { ListarPedidoAccionComponent } from './componentes/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/empleadoHorario/horario-multiple-empleado/horario-multiple-empleado.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/empleadoPermisos/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { EditarPedidoAccionComponent } from './componentes/accionesPersonal/pedirAccionPersonal/editar-pedido-accion/editar-pedido-accion.component';
import { VerPedidoAccionComponent } from './componentes/accionesPersonal/pedirAccionPersonal/ver-pedido-accion/ver-pedido-accion.component';
import { ListarSolicitudComponent } from './componentes/planificacionComidas/listar-solicitud/listar-solicitud.component';
import { ListarPlanificacionComponent } from './componentes/planificacionComidas/listar-planificacion/listar-planificacion.component';
import { AdministradorTodasComponent } from './componentes/reportes/notificaciones/administrador-todas/administrador-todas.component';
import { PorUsuarioComponent } from './componentes/reportes/notificaciones/por-usuario/por-usuario.component';
import { TimbreMultipleComponent } from './componentes/timbre-web/timbre-multiple/timbre-multiple.component';

import { ListaAppComponent } from './componentes/appMovil/lista-app/lista-app.component';
import { RecuperarFraseComponent } from './componentes/frase-administrar/recuperar-frase/recuperar-frase.component';
import { OlvidarFraseComponent } from './componentes/frase-administrar/olvidar-frase/olvidar-frase.component';
import { VacunaMultipleComponent } from './componentes/reportes/vacunas/vacuna-multiple/vacuna-multiple.component';
import { AlimentosInvitadosComponent } from './componentes/reportes/alimentacion/alimentos-invitados/alimentos-invitados.component';
import { TimbreIncompletoComponent } from './componentes/reportes/timbres/timbre-incompleto/timbre-incompleto.component';
import { SalidasAntesComponent } from './componentes/reportes/entradas-salidas/salidas-antes/salidas-antes.component';
import { AuditoriaComponent } from './componentes/reportes/auditoria/auditoria.component';
import { SolicitudVacacionComponent } from './componentes/reportes/vacaciones/solicitud-vacacion/solicitud-vacacion.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Para rol Administrador
  { path: 'roles', component: VistaRolesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarEmpleado', component: RegistroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'empleado', component: ListaEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'titulos', component: ListarTitulosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'regimenLaboral', component: RegimenComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'tipoComidas', component: TipoComidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verMenu/:id', component: VistaMenuComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'relojes', component: RelojesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'proceso', component: PrincipalProcesoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarProceso', component: RegistroProcesoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'provincia', component: PrincipalProvinciaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'departamento', component: PrincipalDepartamentoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarDepartamento', component: RegistroDepartamentoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horario', component: PrincipalHorarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'registrarHorario', component: RegistroHorarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horasExtras', component: HorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'suc-notificaciones', component: SucListaNotiComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'feriados', component: RegistrarFeriadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listarFeriados', component: ListarFeriadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'enrolados', component: PrincipalEnroladosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'tipoPermisos', component: TipoPermisosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listarRegimen', component: ListarRegimenComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listarTipoComidas', component: ListarTipoComidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listarRelojes', component: ListarRelojesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listarCiudades', component: ListarCiudadComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verTipoPermiso', component: VistaElementosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'emplCargos', component: EmplCargosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'sucursales', component: ListaSucursalesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'nivelTitulos', component: ListarNivelTitulosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'empresa', component: ListarEmpresasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'planificacion', component: PlanificacionMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'permisos-solicitados', component: ListarEmpleadoPermisoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'vacaciones-solicitados', component: ListarVacacionesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horas-extras-solicitadas', component: ListaPedidoHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'asistencia', component: RegistrarAsistenciaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'calcularHoraExtra', component: CalculoHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  { path: 'archivos', component: VerDocumentosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'archivos/:filename', component: ListaArchivosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  { path: 'codigo', component: ConfigurarCodigoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'cumpleanios', component: VerBirthdayComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verEmpleado/:id', component: VerEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'seleccionarPermisos/:id', component: SeleccionarRolPermisoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'modificarDepartamento/:id', component: RegistroDepartamentoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verFeriados/:id', component: ListarCiudadFeriadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'enroladoDispositivo/:id', component: DispositivosEnroladosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verHorario/:id', component: VerHorarioDetalleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verDetalles/:id/:id_empleado', component: VerDetallePlanHorariosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verDispositivos/:id', component: VerDipositivoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verRegimen/:id', component: VerRegimenComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'vistaPermiso/:id', component: VerTipoPermisoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaHorasExtras', component: ListaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verHoraExtra/:id', component: VerHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'vistaEmpresa/:id', component: VerEmpresaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'vistaSucursales/:id', component: VerSucursalComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'planificacionesHorasExtras', component: ListaPlanHoraExtraComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horaExtraReal', component: HoraExtraRealComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'planificaHoraExtra', component: ListaEmplePlanHoraEComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listadoPlanificaciones', component: ListaPlanificacionesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'timbres-admin', component: TimbreAdminComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentacion', component: PlanComidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaPlanComida', component: ListarPlanificacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'timbres-multiples', component: TimbreMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'app-movil', component: ListaAppComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // Graficas administrador
  { path: 'macro/inasistencia', component: InasistenciaMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/asistencia', component: AsistenciaMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/hora-extra', component: HoraExtraMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/jornada-vs-hora-extra', component: JornadaVsHoraExtraMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/marcaciones', component: MarcacionesEmpMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/retrasos', component: RetrasosMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/tiempo-jornada-vs-hora-ext', component: TiempoJornadaVsHoraExtMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'macro/salidas-antes', component: SalidasAntesMacroComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // Graficas Empleado
  { path: 'macro/user/atrasos', component: MetricaAtrasosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/horas-extras', component: MetricaHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/permisos', component: MetricaPermisosComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'macro/user/vacaciones', component: MetricaVacacionesComponent, canActivate: [AuthGuard], data: { roles: 2 } },

  // Reportes
  { path: 'reporteAsistenciaConsolidado', component: AsistenciaConsolidadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteEmpleados', component: ReporteEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteKardex', component: ReporteKardexComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteTimbres', component: ReporteTimbresComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reportePermisos', component: ReportePermisosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteAtrasos', component: ReporteAtrasosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteEntradaSalida', component: ReporteEntradaSalidaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporteHorasExtras', component: ReporteHorasExtrasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaReportes', component: ListaReportesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horas/extras', component: ReporteHorasPedidasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-atrasos-multiples', component: ReporteAtrasosMultiplesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-emp-inactivos', component: ReporteEmpleadosInactivosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-faltas', component: ReporteFaltasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-horas-trabaja', component: ReporteHorasTrabajadasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-puntualidad', component: ReportePuntualidadComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbres-multiples', component: ReporteTimbresMultiplesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-abierto', component: TimbreAbiertosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'reporte-timbre-incompleto', component: TimbreIncompletoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'salidas-anticipadas', component: SalidasAntesComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'solicitud-vacacion', component: SolicitudVacacionComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // Reportes Alimentacion
  { path: 'alimentosGeneral', component: AlimentosGeneralComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentosDetallado', component: DetallePlanificadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaSolicitaComida', component: ListarSolicitudComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'alimentosInvitados', component: AlimentosInvitadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // REPORTES DE VACUNAS
  { path: 'lista-vacunados', component: VacunaMultipleComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // NOTIFICACIONES
  { path: 'listaAllNotificaciones', component: AdministradorTodasComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaNotifacionUsuario', component: PorUsuarioComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  // Rol mixto para las autorizaciones
  { path: 'lista-notificaciones', component: RealtimeNotificacionComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'lista-avisos', component: RealtimeAvisosComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'ver-permiso/:id', component: VerEmpleadoPermisoComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'ver-vacacion/:id', component: VerVacacionComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'ver-hora-extra/:id', component: VerPedidoHoraExtraComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },
  { path: 'timbres-personal', component: TimbreWebComponent, canActivate: [AuthGuard], data: { rolMix: 0 } },

  // Para rol empleado
  { path: 'datosEmpleado', component: DatosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'estadisticas', component: HomeEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'informacion', component: InformacionJefeComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'cargoEmpleado', component: ContratoCargoEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'planificacionHorario', component: PlanificacionHorarioEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'horariosEmpleado', component: HorariosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'vacacionesEmpleado', component: VacacionesEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'solicitarPermiso', component: SolicitarPermisosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'verDocumentacion', component: VerDocumentacionComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'horaExtraEmpleado', component: HoraExtraEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'almuerzosEmpleado', component: PlanificacionComidasEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'procesosEmpleado', component: ProcesosEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'autorizaEmpleado', component: AutorizaEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },
  { path: 'detallesHEmpleado/:id/:id_empleado', component: DetalleHorarioEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 2 } },

  // pantalla inicial
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'olvidar-contrasenia', component: OlvidarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'confirmar-contrasenia/:token', component: ConfirmarContraseniaComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'recuperar-frase/:token', component: RecuperarFraseComponent, canActivate: [AuthGuard], data: { log: false } },
  { path: 'frase-olvidar', component: OlvidarFraseComponent, canActivate: [AuthGuard], data: { log: false } },

  // Acciones de Personal
  { path: 'acciones-personal', component: ListarTipoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'vistaTipoAccion/:id', component: VerTipoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'pedidoAccion', component: CrearPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'listaPedidos', component: ListarPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'editarPedido/:id', component: EditarPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'verAccion/:id', component: VerPedidoAccionComponent, canActivate: [AuthGuard], data: { roles: 1 } },

  //MULTIPLES HORARIOS - PERMISOS
  // Acciones de Personal
  { path: 'permisosMultiples', component: PermisosMultiplesEmpleadosComponent, canActivate: [AuthGuard], data: { roles: 1 } },
  { path: 'horariosMultiples', component: HorarioMultipleEmpleadoComponent, canActivate: [AuthGuard], data: { roles: 1 } },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
