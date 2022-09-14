import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, LOCALE_ID } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { JwPaginationModule } from 'jw-angular-pagination';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from './app-routing.module';
import { ScrollingModule } from '@angular/cdk/scrolling'
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

// COMPONENTES ADMINISTRADOR
import { VistaRolesComponent } from './componentes/catalogos/catRoles/vista-roles/vista-roles.component';
import { LoginComponent } from './componentes/iniciarSesion/login/login.component';
import { RegistroComponent } from './componentes/empleado/datos-empleado/registro/registro.component';
import { ListaEmpleadosComponent } from './componentes/empleado/datos-empleado/lista-empleados/lista-empleados.component';
import { TitulosComponent } from './componentes/catalogos/catTitulos/titulos/titulos.component';
import { DiscapacidadComponent } from './componentes/empleado/discapacidad/discapacidad.component';
import { HomeComponent } from './componentes/home/home.component';
import { RegistroRolComponent } from './componentes/catalogos/catRoles/registro-rol/registro-rol.component';
import { VerEmpleadoComponent } from './componentes/empleado/ver-empleado/ver-empleado.component';
import { SeleccionarRolPermisoComponent } from './componentes/catalogos/catRoles/seleccionar-rol-permiso/seleccionar-rol-permiso.component';
import { PrincipalHorarioComponent } from './componentes/catalogos/catHorario/principal-horario/principal-horario.component'
import { RegistroHorarioComponent } from './componentes/catalogos/catHorario/registro-horario/registro-horario.component'
import { PrincipalProvinciaComponent } from './componentes/catalogos/catProvincia/listar-provincia/principal-provincia.component';
import { RegistroProvinciaComponent } from './componentes/catalogos/catProvincia/registro-provincia/registro-provincia.component';
import { PrincipalProcesoComponent } from './componentes/catalogos/catProcesos/principal-proceso/principal-proceso.component';
import { RegistroProcesoComponent } from './componentes/catalogos/catProcesos/registro-proceso/registro-proceso.component';
import { HorasExtrasComponent } from './componentes/catalogos/catHorasExtras/registrar-horas-extras/horas-extras.component';
import { RegimenComponent } from './componentes/catalogos/catRegimen/regimen/regimen.component';
import { TipoComidasComponent } from './componentes/catalogos/catTipoComidas/tipo-comidas/tipo-comidas.component';
import { RelojesComponent } from './componentes/catalogos/catRelojes/relojes/relojes.component';
import { ListarFeriadosComponent } from './componentes/catalogos/catFeriados/listar-feriados/listar-feriados.component';
import { PrincipalDepartamentoComponent } from './componentes/catalogos/catDepartamentos/listar-departamento/principal-departamento.component';
import { RegistroDepartamentoComponent } from './componentes/catalogos/catDepartamentos/registro-departamento/registro-departamento.component';
import { RegistrarFeriadosComponent } from './componentes/catalogos/catFeriados/registrar-feriados/registrar-feriados.component';
import { PrincipalEnroladosComponent } from './componentes/catalogos/catEnrolados/principal-enrolados/principal-enrolados.component';
import { RegistroEnroladosComponent } from './componentes/catalogos/catEnrolados/registro-enrolados/registro-enrolados.component';
import { TipoPermisosComponent } from './componentes/catalogos/catTipoPermisos/tipo-permisos/tipo-permisos.component';
import { EditarFeriadosComponent } from './componentes/catalogos/catFeriados/editar-feriados/editar-feriados.component';
import { ListarRegimenComponent } from './componentes/catalogos/catRegimen/listar-regimen/listar-regimen.component';
import { ListarTipoComidasComponent } from './componentes/catalogos/catTipoComidas/listar-tipo-comidas/listar-tipo-comidas.component';
import { ListarRelojesComponent } from './componentes/catalogos/catRelojes/listar-relojes/listar-relojes.component';
import { TituloEmpleadoComponent } from './componentes/empleado/titulos/titulo-empleado/titulo-empleado.component';
import { RegistrarCiudadComponent } from './componentes/catalogos/catCiudad/registrar-ciudad/registrar-ciudad.component';
import { VistaElementosComponent } from './componentes/catalogos/catTipoPermisos/listarTipoPermisos/vista-elementos.component';
import { AsignarCiudadComponent } from './componentes/catalogos/catFeriados/asignar-ciudad/asignar-ciudad.component';
import { RegistroContratoComponent } from './componentes/empleado/contrato/registro-contrato/registro-contrato.component';
import { EmplCargosComponent } from './componentes/empleado/cargo/empl-cargos/empl-cargos.component';
import { ListarTitulosComponent } from './componentes/catalogos/catTitulos/listar-titulos/listar-titulos.component';
import { ListarCiudadFeriadosComponent } from './componentes/catalogos/catFeriados/listar-ciudad-feriados/listar-ciudad-feriados.component';
import { EnroladoRelojComponent } from './componentes/catalogos/catEnrolados/enrolado-reloj/enrolado-reloj.component';
import { ListaSucursalesComponent } from './componentes/catalogos/catSucursal/lista-sucursales/lista-sucursales.component';
import { RegistrarSucursalesComponent } from './componentes/catalogos/catSucursal/registrar-sucursales/registrar-sucursales.component';
import { RegistroEmpresaComponent } from './componentes/catalogos/catEmpresa/registro-empresa/registro-empresa.component';
import { DispositivosEnroladosComponent } from './componentes/catalogos/catEnrolados/dispositivos-enrolados/dispositivos-enrolados.component';
import { RegistroPlanHorarioComponent } from './componentes/horarios/planificacionHorario/registro-plan-horario/registro-plan-horario.component';
import { RegistroDetallePlanHorarioComponent } from './componentes/horarios/detallePlanHorario/registro-detalle-plan-horario/registro-detalle-plan-horario.component';
import { RegistroAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/registro-autorizacion-depa/registro-autorizacion-depa.component';
import { RegistoEmpleadoHorarioComponent } from './componentes/horarios/empleadoHorario/registo-empleado-horario/registo-empleado-horario.component';
import { DetalleCatHorarioComponent } from './componentes/catalogos/catHorario/detalle-cat-horario/detalle-cat-horario.component';
import { NotiAutorizacionesComponent } from './componentes/catalogos/catNotiAutorizaciones/Registro/noti-autorizaciones/noti-autorizaciones.component';
import { EditarRelojComponent } from './componentes/catalogos/catRelojes/editar-reloj/editar-reloj.component';
import { EditarRolComponent } from './componentes/catalogos/catRoles/editar-rol/editar-rol.component';
import { EditarRegimenComponent } from './componentes/catalogos/catRegimen/editar-regimen/editar-regimen.component';
import { EditarDepartamentoComponent } from './componentes/catalogos/catDepartamentos/editar-departamento/editar-departamento.component';
import { EditarTipoPermisosComponent } from './componentes/catalogos/catTipoPermisos/editar-tipo-permisos/editar-tipo-permisos.component';
import { PlanificacionMultipleComponent } from './componentes/horarios/planificacionHorario/planificacion-multiple/planificacion-multiple.component';
import { VerHorarioDetalleComponent } from './componentes/catalogos/catHorario/ver-horario-detalle/ver-horario-detalle.component';
import { EditarHorarioComponent } from './componentes/catalogos/catHorario/editar-horario/editar-horario.component';
import { AutorizacionesComponent } from './componentes/autorizaciones/autorizaciones/autorizaciones.component';
import { EditarTitulosComponent } from './componentes/catalogos/catTitulos/editar-titulos/editar-titulos.component';
import { EditarTipoComidasComponent } from './componentes/catalogos/catTipoComidas/editar-tipo-comidas/editar-tipo-comidas.component';
import { EditarEmpleadoComponent } from './componentes/empleado/datos-empleado/editar-empleado/editar-empleado.component';
import { EditarTituloComponent } from './componentes/empleado/titulos/editar-titulo/editar-titulo.component';
import { OlvidarContraseniaComponent } from './componentes/iniciarSesion/olvidar-contrasenia/olvidar-contrasenia.component';
import { ConfirmarContraseniaComponent } from './componentes/iniciarSesion/confirmar-contrasenia/confirmar-contrasenia.component';
import { EditarEmpresaComponent } from './componentes/catalogos/catEmpresa/editar-empresa/editar-empresa.component';
import { EditarSucursalComponent } from './componentes/catalogos/catSucursal/editar-sucursal/editar-sucursal.component';
import { EditarCatProcesosComponent } from './componentes/catalogos/catProcesos/editar-cat-procesos/editar-cat-procesos.component';
import { EditarEnroladosComponent } from './componentes/catalogos/catEnrolados/editar-enrolados/editar-enrolados.component';
import { MetodosComponent } from './componentes/administracionGeneral/metodoEliminar/metodos.component';
import { EditarContratoComponent } from './componentes/empleado/contrato/editar-contrato/editar-contrato.component';
import { EditarCargoComponent } from './componentes/empleado/cargo/editar-cargo/editar-cargo.component';
import { ListarNotiAutorizacionesComponent } from './componentes/catalogos/catNotiAutorizaciones/listar/listar-noti-autorizaciones/listar-noti-autorizaciones.component';
import { RegistrarTimbreComponent } from './componentes/timbre-web/registrar-timbre/registrar-timbre.component';
import { RegistrarAsistenciaComponent } from './componentes/registrar-asistencia/registrar-asistencia.component';
import { EditarEstadoAutorizaccionComponent } from './componentes/autorizaciones/editar-estado-autorizaccion/editar-estado-autorizaccion.component';
import { VerDetallePlanHorariosComponent } from './componentes/horarios/detallePlanHorario/ver-detalle-plan-horarios/ver-detalle-plan-horarios.component';
import { EditarEstadoVacacionAutoriacionComponent } from './componentes/autorizaciones/editar-estado-vacacion-autoriacion/editar-estado-vacacion-autoriacion.component';
import { SubirDocumentoComponent } from './componentes/documentos/subir-documento/subir-documento.component';
import { VerDocumentosComponent } from './componentes/documentos/ver-documentos/ver-documentos.component';
import { SettingsComponent } from './componentes/administracionGeneral/preferecias/settings/settings.component';
import { VacacionAutorizacionesComponent } from './componentes/autorizaciones/vacacion-autorizaciones/vacacion-autorizaciones.component';
import { ConfigurarAtrasosComponent } from './componentes/reportes/configuracion-reportes/configurar-atrasos/configurar-atrasos.component';
import { HoraExtraAutorizacionesComponent } from './componentes/autorizaciones/hora-extra-autorizaciones/hora-extra-autorizaciones.component';
import { EditarEstadoHoraExtraAutorizacionComponent } from './componentes/autorizaciones/editar-estado-hora-extra-autorizacion/editar-estado-hora-extra-autorizacion.component';
import { EditarCiudadComponent } from './componentes/catalogos/catFeriados/editar-ciudad/editar-ciudad.component';
import { EditarHorarioEmpleadoComponent } from './componentes/horarios/empleadoHorario/editar-horario-empleado/editar-horario-empleado.component';
import { EditarPlanificacionComponent } from './componentes/horarios/planificacionHorario/editar-planificacion/editar-planificacion.component';
import { EditarDetallePlanComponent } from './componentes/horarios/detallePlanHorario/editar-detalle-plan/editar-detalle-plan.component';
import { EditarAutorizacionDepaComponent } from './componentes/autorizaciones/autorizaDepartamentos/editar-autorizacion-depa/editar-autorizacion-depa.component';
import { EditarDispositivoEnroladoComponent } from './componentes/catalogos/catEnrolados/editar-dispositivo-enrolado/editar-dispositivo-enrolado.component';
import { EditarDetalleCatHorarioComponent } from './componentes/catalogos/catHorario/editar-detalle-cat-horario/editar-detalle-cat-horario.component';
import { VerDipositivoComponent } from './componentes/catalogos/catRelojes/ver-dipositivo/ver-dipositivo.component';
import { ConfigurarCodigoComponent } from './componentes/administracionGeneral/configurar-codigo/configurar-codigo.component';
import { VerRegimenComponent } from './componentes/catalogos/catRegimen/ver-regimen/ver-regimen.component';
import { VerTipoPermisoComponent } from './componentes/catalogos/catTipoPermisos/ver-tipo-permiso/ver-tipo-permiso.component';
import { ListaHorasExtrasComponent } from './componentes/catalogos/catHorasExtras/lista-horas-extras/lista-horas-extras.component';
import { EditarHorasExtrasComponent } from './componentes/catalogos/catHorasExtras/editar-horas-extras/editar-horas-extras.component';
import { VerHorasExtrasComponent } from './componentes/catalogos/catHorasExtras/ver-horas-extras/ver-horas-extras.component';
import { VerSucursalComponent } from './componentes/catalogos/catSucursal/ver-sucursal/ver-sucursal.component';
import { VerEmpresaComponent } from './componentes/catalogos/catEmpresa/ver-empresa/ver-empresa.component';
import { LogosComponent } from './componentes/catalogos/catEmpresa/logos/logos.component';

// COMPONENTES EMPLEADO
import { DatosEmpleadoComponent } from './componentes/rolEmpleado/datos-empleado/datos-empleado.component';
import { CambiarContrasenaComponent } from './componentes/rolEmpleado/cambiar-contrasena/cambiar-contrasena.component';
import { ContratoCargoEmpleadoComponent } from './componentes/rolEmpleado/contrato-cargo-empleado/contrato-cargo-empleado.component';
import { PlanificacionHorarioEmpleadoComponent } from './componentes/rolEmpleado/planificacion-horario-empleado/planificacion-horario-empleado.component';
import { DetalleHorarioEmpleadoComponent } from './componentes/rolEmpleado/detalle-horario-empleado/detalle-horario-empleado.component';
import { HorariosEmpleadoComponent } from './componentes/rolEmpleado/horarios-empleado/horarios-empleado.component';
import { VacacionesEmpleadoComponent } from './componentes/rolEmpleado/vacacion-empleado/vacaciones-empleado/vacaciones-empleado.component';
import { SolicitarPermisosEmpleadoComponent } from './componentes/rolEmpleado/permisos-empleado/solicitar-permisos-empleado/solicitar-permisos-empleado.component';
import { VerDocumentacionComponent } from './componentes/rolEmpleado/ver-documentacion/ver-documentacion.component';
import { InformacionJefeComponent } from './componentes/rolEmpleado/informacion-jefe/informacion-jefe.component';
import { HomeEmpleadoComponent } from './componentes/rolEmpleado/home-empleado/home-empleado.component';
import { HoraExtraEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/hora-extra-empleado/hora-extra-empleado.component';
import { PlanificacionComidasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/planificacion-comidas-empleado/planificacion-comidas-empleado.component';
import { ProcesosEmpleadoComponent } from './componentes/rolEmpleado/procesos-empleado/procesos-empleado.component';
import { AutorizaEmpleadoComponent } from './componentes/rolEmpleado/autoriza-empleado/autoriza-empleado.component';
import { CancelarHoraExtraComponent } from './componentes/rolEmpleado/horasExtras-empleado/cancelar-hora-extra/cancelar-hora-extra.component';

// CAMBIAR EL LOCAL DE LA APP
import { registerLocaleData } from '@angular/common';
import localEsEC from '@angular/common/locales/es-EC';
registerLocaleData(localEsEC);

// PIE DE PÁGINA Y NAVEGABILIDAD
import { FooterComponent } from './componentes/iniciarSesion/footer/footer.component';



// CONEXIÓN REST SERVICIOS POSTGRES
import { RolesService } from './servicios/catalogos/catRoles/roles.service';
import { LoginService } from './servicios/login/login.service';
import { TituloService } from './servicios/catalogos/catTitulos/titulo.service';
import { EmpleadoService } from './servicios/empleado/empleadoRegistro/empleado.service'
import { DiscapacidadService } from './servicios/discapacidad/discapacidad.service';
import { ProvinciaService } from './servicios/catalogos/catProvincias/provincia.service';
import { HorarioService } from './servicios/catalogos/catHorarios/horario.service';
import { HorasExtrasService } from './servicios/catalogos/catHorasExtras/horas-extras.service';
import { EnroladoService } from './servicios/catalogos/catEnrolados/enrolado.service';
import { DepartamentosService } from './servicios/catalogos/catDepartamentos/departamentos.service';
import { RolPermisosService } from './servicios/catalogos/catRolPermisos/rol-permisos.service';
import { TipoPermisosService } from './servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { NotificacionesService } from './servicios/catalogos/catNotificaciones/notificaciones.service';
import { CiudadFeriadosService } from './servicios/ciudadFeriados/ciudad-feriados.service';
import { EmpleadoHorariosService } from './servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { EmplCargosService } from './servicios/empleado/empleadoCargo/empl-cargos.service';
import { CiudadService } from './servicios/ciudad/ciudad.service';
import { TokenInterceptorService } from './servicios/login/token-interceptor.service';
import { GraficasService } from './servicios/graficas/graficas.service';
import { ProgressService } from './componentes/administracionGeneral/progress/progress.service';


// SEGURIDAD
import { AuthGuard } from "./servicios/guards/auth.guard";

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { ConfirmarDesactivadosComponent } from './componentes/empleado/datos-empleado/confirmar-desactivados/confirmar-desactivados.component';
import { PlanHoraExtraAutorizaComponent } from './componentes/autorizaciones/plan-hora-extra-autoriza/plan-hora-extra-autoriza.component';
import { ColoresEmpresaComponent } from './componentes/catalogos/catEmpresa/colores-empresa/colores-empresa.component';
import { AyudaComponent } from './componentes/administracionGeneral/preferecias/ayuda/ayuda.component';

import { CorreoEmpresaComponent } from './componentes/administracionGeneral/correo/correo-empresa/correo-empresa.component';
import { ListaArchivosComponent } from './componentes/documentos/lista-archivos/lista-archivos.component';
import { EmplLeafletComponent } from './componentes/modulos/geolocalizacion/empl-leaflet/empl-leaflet.component';
import { TimbreWebComponent } from './componentes/timbre-web/timbre-empleado/timbre-web.component';
import { TimbreAdminComponent } from './componentes/timbre-web/timbre-admin/timbre-admin.component';
import { CrearTimbreComponent } from './componentes/timbre-web/crear-timbre/crear-timbre.component';
import { SeguridadComponent } from './componentes/administracionGeneral/frase-seguridad/seguridad/seguridad.component';
import { TipoSeguridadComponent } from './componentes/catalogos/catEmpresa/tipo-seguridad/tipo-seguridad.component';
import { FraseSeguridadComponent } from './componentes/administracionGeneral/frase-seguridad/frase-seguridad/frase-seguridad.component';
import { MetricaVacacionesComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-vacaciones/metrica-vacaciones.component';
import { MetricaHorasExtrasComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-horas-extras/metrica-horas-extras.component';
import { MetricaAtrasosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-atrasos/metrica-atrasos.component';
import { MetricaPermisosComponent } from './componentes/rolEmpleado/grafica-empl-macro/metrica-permisos/metrica-permisos.component';
import { DetalleMenuComponent } from './componentes/catalogos/catTipoComidas/detalle-menu/detalle-menu.component';
import { VistaMenuComponent } from './componentes/catalogos/catTipoComidas/vista-menu/vista-menu.component';
import { EditarDetalleMenuComponent } from './componentes/catalogos/catTipoComidas/editar-detalle-menu/editar-detalle-menu.component';
import { ConfigReportFirmasHorasExtrasComponent } from './componentes/reportes/configuracion-reportes/config-report-firmas-horas-extras/config-report-firmas-horas-extras.component';
import { AccionesTimbresComponent } from './componentes/administracionGeneral/preferecias/acciones-timbres/acciones-timbres.component';
import { HorariosMultiplesComponent } from './componentes/horarios/rango-fechas/horarios-multiples/horarios-multiples.component';
import { HorarioMultipleEmpleadoComponent } from './componentes/horarios/rango-fechas/horario-multiple-empleado/horario-multiple-empleado.component';

import { ConfigEmpleadosComponent } from './componentes/reportes/configuracion-reportes/config-report-empleados/config-empleados.component';
import { ConfigAsistenciaComponent } from './componentes/reportes/configuracion-reportes/config-report-asistencia/config-asistencia.component';

// Imagen upload
import { ImageUploadModule } from 'angular2-image-upload';

//Modulos Compartidos
import { MaterialModule } from './material/material.module'
import { FiltrosModule } from './filtros/filtros.module';

import { ReportesModule } from './componentes/reportes/reportes.module';

//enviroment
import { environment } from 'src/environments/environment';

import { ProgressComponent } from './componentes/administracionGeneral/progress/progress.component';
import { PlantillaReportesService } from './componentes/reportes/plantilla-reportes.service';

import { CrearVacunaComponent } from './componentes/empleado/vacunacion/crear-vacuna/crear-vacuna.component';
import { EditarVacunaComponent } from './componentes/empleado/vacunacion/editar-vacuna/editar-vacuna.component';
import { TimbreMultipleComponent } from './componentes/timbre-web/timbre-multiple/timbre-multiple.component';
import { CambiarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/cambiar-frase/cambiar-frase.component';
import { RecuperarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/recuperar-frase/recuperar-frase.component';

import { OlvidarFraseComponent } from './componentes/administracionGeneral/frase-seguridad/olvidar-frase/olvidar-frase.component';
import { TipoVacunaComponent } from './componentes/empleado/vacunacion/tipo-vacuna/tipo-vacuna.component';
import { CrearParametroComponent } from './componentes/parametrosGenerales/crear-parametro/crear-parametro.component';
import { ListarParametroComponent } from './componentes/parametrosGenerales/listar-parametro/listar-parametro.component';
import { EditarParametroComponent } from './componentes/parametrosGenerales/editar-parametro/editar-parametro.component';
import { VerParametroComponent } from './componentes/parametrosGenerales/ver-parametro/ver-parametro.component';
import { CrearDetalleParametroComponent } from './componentes/parametrosGenerales/crear-detalle-parametro/crear-detalle-parametro.component';
import { EditarDetalleParametroComponent } from './componentes/parametrosGenerales/editar-detalle-parametro/editar-detalle-parametro.component';
import { CrearCoordenadasComponent } from './componentes/modulos/geolocalizacion/crear-coordenadas/crear-coordenadas.component';
import { ListarCoordenadasComponent } from './componentes/modulos/geolocalizacion/listar-coordenadas/listar-coordenadas.component';
import { EditarCoordenadasComponent } from './componentes/modulos/geolocalizacion/editar-coordenadas/editar-coordenadas.component';
import { VerCoordenadasComponent } from './componentes/modulos/geolocalizacion/ver-coordenadas/ver-coordenadas.component';
import { ComunicadosComponent } from './componentes/administracionGeneral/comunicados/comunicados.component';
import { RegistrarBirthdayComponent } from './componentes/administracionGeneral/birthday/registrar-birthday/registrar-birthday.component';
import { EditarBirthdayComponent } from './componentes/administracionGeneral/birthday/editar-birthday/editar-birthday.component';
import { VerBirthdayComponent } from './componentes/administracionGeneral/birthday/ver-birthday/ver-birthday.component';
import { ConfiguracionComponent } from './componentes/administracionGeneral/correo/configuracion/configuracion.component';
import { EditarPermisoEmpleadoComponent } from './componentes/rolEmpleado/permisos-empleado/editar-permiso-empleado/editar-permiso-empleado.component';
import { CancelarPermisoComponent } from './componentes/rolEmpleado/permisos-empleado/cancelar-permiso/cancelar-permiso.component';
import { CancelarVacacionesComponent } from './componentes/rolEmpleado/vacacion-empleado/cancelar-vacaciones/cancelar-vacaciones.component';
import { EditarVacacionesEmpleadoComponent } from './componentes/rolEmpleado/vacacion-empleado/editar-vacaciones-empleado/editar-vacaciones-empleado.component';
import { EditarHoraExtraEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/editar-hora-extra-empleado/editar-hora-extra-empleado.component';
import { CancelarComidaComponent } from './componentes/rolEmpleado/comidas-empleado/cancelar-comida/cancelar-comida.component';
import { RegistrarNivelTitulosComponent } from './componentes/catalogos/catTitulos/nivelTitulos/registrar-nivel-titulos/registrar-nivel-titulos.component';
import { ListarNivelTitulosComponent } from './componentes/catalogos/catTitulos/nivelTitulos/listar-nivel-titulos/listar-nivel-titulos.component';
import { EditarNivelTituloComponent } from './componentes/catalogos/catTitulos/nivelTitulos/editar-nivel-titulo/editar-nivel-titulo.component';
import { SalidasAntesMacroComponent } from './componentes/reportes/graficas-macro/salidas-antes-macro/salidas-antes-macro.component';
import { InasistenciaMacroComponent } from './componentes/reportes/graficas-macro/inasistencia-macro/inasistencia-macro.component';
import { AsistenciaMacroComponent } from './componentes/reportes/graficas-macro/asistencia-macro/asistencia-macro.component';
import { HoraExtraMacroComponent } from './componentes/reportes/graficas-macro/hora-extra-macro/hora-extra-macro.component';
import { JornadaVsHoraExtraMacroComponent } from './componentes/reportes/graficas-macro/jornada-vs-hora-extra-macro/jornada-vs-hora-extra-macro.component';
import { MarcacionesEmpMacroComponent } from './componentes/reportes/graficas-macro/marcaciones-emp-macro/marcaciones-emp-macro.component';
import { RetrasosMacroComponent } from './componentes/reportes/graficas-macro/retrasos-macro/retrasos-macro.component';
import { TiempoJornadaVsHoraExtMacroComponent } from './componentes/reportes/graficas-macro/tiempo-jornada-vs-hora-ext-macro/tiempo-jornada-vs-hora-ext-macro.component';
import { ListarCiudadComponent } from './componentes/catalogos/catCiudad/listar-ciudad/listar-ciudad.component';
import { RegistrarPeriodoVComponent } from './componentes/modulos/vacaciones/periodoVacaciones/registrar-periodo-v/registrar-periodo-v.component';
import { RegistrarEmpleProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/registrar-emple-proceso/registrar-emple-proceso.component';
import { RegistrarVacacionesComponent } from './componentes/modulos/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { RegistroEmpleadoPermisoComponent } from './componentes/modulos/permisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { EditarEmpleadoProcesoComponent } from './componentes/modulos/accionesPersonal/procesos/editar-empleado-proceso/editar-empleado-proceso.component';
import { EditarEmpleadoPermisoComponent } from './componentes/modulos/permisos/editar-empleado-permiso/editar-empleado-permiso.component';
import { ListarEmpleadoPermisoComponent } from './componentes/modulos/permisos/listar-empleado-permiso/listar-empleado-permiso.component';
import { EditarPeriodoVacacionesComponent } from './componentes/modulos/vacaciones/periodoVacaciones/editar-periodo-vacaciones/editar-periodo-vacaciones.component';
import { PedidoHoraExtraComponent } from './componentes/modulos/horasExtras/pedido-hora-extra/pedido-hora-extra.component';
import { CalculoHoraExtraComponent } from './componentes/modulos/horasExtras/calculos/calculo-hora-extra/calculo-hora-extra.component';
import { VerEmpleadoPermisoComponent } from './componentes/modulos/permisos/ver-empleado-permiso/ver-empleado-permiso.component';
import { ListarVacacionesComponent } from './componentes/modulos/vacaciones/listar-vacaciones/listar-vacaciones.component';
import { EstadoVacacionesComponent } from './componentes/modulos/vacaciones/estado-vacaciones/estado-vacaciones.component';
import { VerVacacionComponent } from './componentes/modulos/vacaciones/ver-vacacion/ver-vacacion.component';
import { ListaPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/lista-pedido-hora-extra/lista-pedido-hora-extra.component';
import { VerPedidoHoraExtraComponent } from './componentes/modulos/horasExtras/ver-pedido-hora-extra/ver-pedido-hora-extra.component';
import { EstadoHoraExtraComponent } from './componentes/modulos/horasExtras/estado-hora-extra/estado-hora-extra.component';
import { EditarPlanComidasComponent } from './componentes/modulos/alimentacion/editar-plan-comidas/editar-plan-comidas.component';
import { HoraExtraRealComponent } from './componentes/modulos/horasExtras/calculos/hora-extra-real/hora-extra-real.component';
import { PlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/plan-hora-extra/plan-hora-extra.component';
import { ListaEmplePlanHoraEComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/empleados-planificar/lista-emple-plan-hora-e.component';
import { TiempoAutorizadoComponent } from './componentes/modulos/horasExtras/tiempo-autorizado/tiempo-autorizado.component';
import { ListaPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-plan-hora-extra/lista-plan-hora-extra.component';
import { ListaPlanificacionesComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/lista-planificaciones/lista-planificaciones.component';
import { EditarPlanHoraExtraComponent } from './componentes/modulos/horasExtras/planificacionHoraExtra/editar-plan-hora-extra/editar-plan-hora-extra.component';
import { PlanComidasComponent } from './componentes/modulos/alimentacion/plan-comidas/plan-comidas.component';
import { SolicitaComidaComponent } from './componentes/modulos/alimentacion/solicita-comida/solicita-comida.component';
import { AdministraComidaComponent } from './componentes/modulos/alimentacion/administra-comida/administra-comida.component';
import { CrearTipoaccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/crear-tipoaccion/crear-tipoaccion.component';
import { EditarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/editar-tipo-accion/editar-tipo-accion.component';
import { ListarTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/listar-tipo-accion/listar-tipo-accion.component';
import { VerTipoAccionComponent } from './componentes/modulos/accionesPersonal/tipoAccionesPersonal/ver-tipo-accion/ver-tipo-accion.component';
import { ListarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/listar-pedido-accion/listar-pedido-accion.component';
import { CrearPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/crear-pedido-accion/crear-pedido-accion.component';
import { EditarPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/editar-pedido-accion/editar-pedido-accion.component';
import { VerPedidoAccionComponent } from './componentes/modulos/accionesPersonal/pedirAccionPersonal/ver-pedido-accion/ver-pedido-accion.component';
import { PermisosMultiplesComponent } from './componentes/modulos/permisos/permisos-multiples/permisos-multiples.component';
import { PermisosMultiplesEmpleadosComponent } from './componentes/modulos/permisos/permisos-multiples-empleados/permisos-multiples-empleados.component';
import { AutorizaSolicitudComponent } from './componentes/modulos/alimentacion/autoriza-solicitud/autoriza-solicitud.component';
import { ListarSolicitudComponent } from './componentes/modulos/alimentacion/listar-solicitud/listar-solicitud.component';
import { EditarSolicitudComidaComponent } from './componentes/modulos/alimentacion/editar-solicitud-comida/editar-solicitud-comida.component';
import { ListarPlanificacionComponent } from './componentes/modulos/alimentacion/listar-planificacion/listar-planificacion.component';
import { ListaAppComponent } from './componentes/modulos/appMovil/lista-app/lista-app.component';
import { UpdateEstadoAppComponent } from './componentes/modulos/appMovil/update-estado-app/update-estado-app.component';
import { PlanificacionComidasComponent } from './componentes/modulos/alimentacion/planificacion-comidas/planificacion-comidas.component';
import { MainNavComponent } from './componentes/administracionGeneral/main-nav/main-nav.component';
import { RealtimeNotificacionComponent } from './componentes/notificaciones/realtime-notificacion/realtime-notificacion.component';
import { RealtimeAvisosComponent } from './componentes/notificaciones/realtime-avisos/realtime-avisos.component';
import { EliminarRealtimeComponent } from './componentes/notificaciones/eliminar-realtime/eliminar-realtime.component';
import { NavbarComponent } from './componentes/administracionGeneral/main-nav/navbar/navbar.component';
import { SearchComponent } from './componentes/administracionGeneral/main-nav/search/search.component';
import { ButtonNotificacionComponent } from './componentes/administracionGeneral/main-nav/button-notificacion/button-notificacion.component';
import { ButtonAvisosComponent } from './componentes/administracionGeneral/main-nav/button-avisos/button-avisos.component';
import { ButtonOpcionesComponent } from './componentes/administracionGeneral/main-nav/button-opciones/button-opciones.component';
import { MainNavService } from './componentes/administracionGeneral/main-nav/main-nav.service';
import { HorasPlanificadasEmpleadoComponent } from './componentes/rolEmpleado/horasExtras-empleado/horas-planificadas-empleado/horas-planificadas-empleado.component';
import { ComidasSolicitadasEmpleadoComponent } from './componentes/rolEmpleado/comidas-empleado/comidas-solicitadas-empleado/comidas-solicitadas-empleado.component';

const config: SocketIoConfig = { url: environment.url, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    VistaRolesComponent,
    LoginComponent,
    RegistroComponent,
    MainNavComponent,
    ListaEmpleadosComponent,
    HomeComponent,
    TitulosComponent,
    DiscapacidadComponent,
    VerEmpleadoComponent,
    RegistroRolComponent,
    SeleccionarRolPermisoComponent,
    RegimenComponent,
    TipoComidasComponent,
    RelojesComponent,
    PrincipalProvinciaComponent,
    RegistroProvinciaComponent,
    PrincipalProcesoComponent,
    RegistroProcesoComponent,
    PrincipalHorarioComponent,
    RegistroHorarioComponent,
    FooterComponent,
    HorasExtrasComponent,
    ListarFeriadosComponent,
    PrincipalDepartamentoComponent,
    RegistroDepartamentoComponent,
    RegistrarFeriadosComponent,
    PrincipalEnroladosComponent,
    RegistroEnroladosComponent,
    TipoPermisosComponent,
    EditarFeriadosComponent,
    ListarRegimenComponent,
    ListarTipoComidasComponent,
    ListarRelojesComponent,
    TituloEmpleadoComponent,
    ListarCiudadComponent,
    RegistrarCiudadComponent,
    AsignarCiudadComponent,
    VistaElementosComponent,
    RegistroContratoComponent,
    EmplCargosComponent,
    ListarTitulosComponent,
    ListarCiudadFeriadosComponent,
    EnroladoRelojComponent,
    PlanificacionComidasEmpleadoComponent,
    ListaSucursalesComponent,
    RegistrarSucursalesComponent,
    RegistroEmpresaComponent,
    RegistrarNivelTitulosComponent,
    ListarNivelTitulosComponent,
    EditarNivelTituloComponent,
    DispositivosEnroladosComponent,
    RegistrarPeriodoVComponent,
    RegistrarEmpleProcesoComponent,
    RegistrarVacacionesComponent,
    RegistroPlanHorarioComponent,
    RegistroDetallePlanHorarioComponent,
    RegistroAutorizacionDepaComponent,
    RegistroEmpleadoPermisoComponent,
    RegistoEmpleadoHorarioComponent,
    DetalleCatHorarioComponent,
    NotiAutorizacionesComponent,
    AutorizacionesComponent,
    EditarTitulosComponent,
    EditarTipoComidasComponent,
    EditarEmpresaComponent,
    EditarSucursalComponent,
    EditarCatProcesosComponent,
    EditarEmpleadoProcesoComponent,
    EditarEnroladosComponent,
    EditarEmpleadoComponent,
    EditarTituloComponent,
    OlvidarContraseniaComponent,
    ConfirmarContraseniaComponent,
    MetodosComponent,
    EditarContratoComponent,
    EditarCargoComponent,
    DatosEmpleadoComponent,
    CambiarContrasenaComponent,
    EditarRelojComponent,
    EditarRolComponent,
    EditarRegimenComponent,
    EditarDepartamentoComponent,
    EditarTipoPermisosComponent,
    PlanificacionMultipleComponent,
    VerHorarioDetalleComponent,
    EditarHorarioComponent,
    EditarEmpleadoPermisoComponent,
    HomeEmpleadoComponent,
    ListarEmpleadoPermisoComponent,
    EditarPeriodoVacacionesComponent,
    RegistrarTimbreComponent,
    RegistrarAsistenciaComponent,
    PedidoHoraExtraComponent,
    CalculoHoraExtraComponent,
    InformacionJefeComponent,
    ListarNotiAutorizacionesComponent,
    VerEmpleadoPermisoComponent,
    EditarEstadoAutorizaccionComponent,
    VerDetallePlanHorariosComponent,
    ListarVacacionesComponent,
    EstadoVacacionesComponent,
    VerVacacionComponent,
    EditarEstadoVacacionAutoriacionComponent,
    ContratoCargoEmpleadoComponent,
    PlanificacionHorarioEmpleadoComponent,
    DetalleHorarioEmpleadoComponent,
    HorariosEmpleadoComponent,
    VacacionesEmpleadoComponent,
    SolicitarPermisosEmpleadoComponent,
    RealtimeNotificacionComponent,
    SubirDocumentoComponent,
    VerDocumentosComponent,
    VerDocumentacionComponent,
    SettingsComponent,
    VacacionAutorizacionesComponent,
    ListaPedidoHoraExtraComponent,
    VerPedidoHoraExtraComponent,
    HoraExtraEmpleadoComponent,
    HoraExtraAutorizacionesComponent,
    EditarEstadoHoraExtraAutorizacionComponent,
    EstadoHoraExtraComponent,
    CancelarPermisoComponent,
    EditarCiudadComponent,
    EditarHorarioEmpleadoComponent,
    EditarPlanificacionComponent,
    EditarDetallePlanComponent,
    EditarPlanComidasComponent,
    EditarAutorizacionDepaComponent,
    EditarDispositivoEnroladoComponent,
    PlanificacionComidasEmpleadoComponent,
    EditarDetalleCatHorarioComponent,
    VerDipositivoComponent,
    ProcesosEmpleadoComponent,
    AutorizaEmpleadoComponent,
    ConfigurarCodigoComponent,
    EditarPermisoEmpleadoComponent,
    CancelarHoraExtraComponent,
    EditarHoraExtraEmpleadoComponent,
    CancelarVacacionesComponent,
    EditarVacacionesEmpleadoComponent,
    VerRegimenComponent,
    VerTipoPermisoComponent,
    ListaHorasExtrasComponent,
    EditarHorasExtrasComponent,
    VerHorasExtrasComponent,
    VerSucursalComponent,
    VerEmpresaComponent,
    RegistrarBirthdayComponent,
    EditarBirthdayComponent,
    VerBirthdayComponent,
    LogosComponent,
    HoraExtraRealComponent,
    PlanHoraExtraComponent,
    ListaEmplePlanHoraEComponent,
    ConfigurarAtrasosComponent,
    TiempoAutorizadoComponent,
    ConfirmarDesactivadosComponent,
    RealtimeAvisosComponent,
    EliminarRealtimeComponent,
    ListaPlanHoraExtraComponent,
    PlanHoraExtraAutorizaComponent,
    ColoresEmpresaComponent,
    ConfigEmpleadosComponent,
    ConfigAsistenciaComponent,
    AyudaComponent,
    CorreoEmpresaComponent,
    ListaPlanificacionesComponent,
    EditarPlanHoraExtraComponent,
    ListaArchivosComponent,
    EmplLeafletComponent,
    TimbreWebComponent,
    TimbreAdminComponent,
    CrearTimbreComponent,
    InasistenciaMacroComponent,
    AsistenciaMacroComponent,
    HoraExtraMacroComponent,
    JornadaVsHoraExtraMacroComponent,
    MarcacionesEmpMacroComponent,
    RetrasosMacroComponent,
    TiempoJornadaVsHoraExtMacroComponent,
    SalidasAntesMacroComponent,
    SeguridadComponent,
    TipoSeguridadComponent,
    FraseSeguridadComponent,
    PlanComidasComponent,
    MetricaVacacionesComponent,
    MetricaHorasExtrasComponent,
    MetricaAtrasosComponent,
    MetricaPermisosComponent,
    DetalleMenuComponent,
    VistaMenuComponent,
    EditarDetalleMenuComponent,

    ConfigReportFirmasHorasExtrasComponent,
    SolicitaComidaComponent,
    AdministraComidaComponent,
    CrearTipoaccionComponent,
    EditarTipoAccionComponent,
    ListarTipoAccionComponent,
    VerTipoAccionComponent,
    ListarPedidoAccionComponent,
    CrearPedidoAccionComponent,
    EditarPedidoAccionComponent,
    VerPedidoAccionComponent,
    AccionesTimbresComponent,
    PermisosMultiplesComponent,
    PermisosMultiplesEmpleadosComponent,
    HorariosMultiplesComponent,
    HorarioMultipleEmpleadoComponent,
    AutorizaSolicitudComponent,
    ListarSolicitudComponent,
    EditarSolicitudComidaComponent,
    ListarPlanificacionComponent,
    NavbarComponent,
    SearchComponent,
    ButtonNotificacionComponent,
    ButtonAvisosComponent,
    ProgressComponent,
    ButtonOpcionesComponent,

    CrearVacunaComponent,
    EditarVacunaComponent,
    TimbreMultipleComponent,
    CambiarFraseComponent,
    RecuperarFraseComponent,
    PlanificacionComidasComponent,
    ListaAppComponent,
    UpdateEstadoAppComponent,
    OlvidarFraseComponent,
    TipoVacunaComponent,
    CrearParametroComponent,
    ListarParametroComponent,
    EditarParametroComponent,
    VerParametroComponent,
    CrearDetalleParametroComponent,
    EditarDetalleParametroComponent,
    CrearCoordenadasComponent,
    ListarCoordenadasComponent,
    EditarCoordenadasComponent,
    VerCoordenadasComponent,
    ComunicadosComponent,
    ConfiguracionComponent,
    CancelarComidaComponent,
    HorasPlanificadasEmpleadoComponent,
    ComidasSolicitadasEmpleadoComponent,

  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    SocketIoModule.forRoot(config),
    FontAwesomeModule,
    FormsModule,
    ImageUploadModule.forRoot(),
    ScrollingModule,
    JwPaginationModule,

    FiltrosModule,
    MaterialModule,
    ReportesModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    },
    {
      provide: LOCALE_ID, useValue: 'es-EC'
    },
    LoginService,
    RolesService,
    TituloService,
    EmpleadoService,
    DiscapacidadService,
    ProvinciaService,
    HorarioService,
    EnroladoService,
    HorasExtrasService,
    NotificacionesService,
    RolPermisosService,
    TipoPermisosService,
    DepartamentosService,
    CiudadFeriadosService,
    CiudadService,
    EmpleadoHorariosService,
    EmplCargosService,
    GraficasService,
    ProgressService,
    MainNavService,
    PlantillaReportesService,
  ],

  bootstrap: [AppComponent]

})
export class AppModule { }
export class CustomMaterialModule { }
export class DatePickerModule { }
