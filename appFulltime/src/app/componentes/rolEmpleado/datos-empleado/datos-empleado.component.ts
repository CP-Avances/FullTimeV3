import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import * as moment from 'moment';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import * as xlsx from 'xlsx';
import * as FileSaver from 'file-saver';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { DiscapacidadService } from 'src/app/servicios/discapacidad/discapacidad.service';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';
import { DetallePlanHorarioService } from 'src/app/servicios/horarios/detallePlanHorario/detalle-plan-horario.service';
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { PlanComidasService } from 'src/app/servicios/planComidas/plan-comidas.service';
import { ScriptService } from 'src/app/servicios/empleado/script.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { AutorizaDepartamentoService } from 'src/app/servicios/autorizaDepartamento/autoriza-departamento.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { RegistrarVacacionesComponent } from 'src/app/componentes/vacaciones/registrar-vacaciones/registrar-vacaciones.component';
import { RegistroPlanHorarioComponent } from 'src/app/componentes/planHorarios/registro-plan-horario/registro-plan-horario.component';
import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/empleadoPermisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { CambiarContrasenaComponent } from 'src/app/componentes/rolEmpleado/cambiar-contrasena/cambiar-contrasena.component';
// import { NavbarComponent } from '../../../share/main-nav/navbar/navbar.component';
import { environment } from 'src/environments/environment';
import { VacunacionService } from 'src/app/servicios/empleado/empleadoVacunas/vacunacion.service';
import { MetodosComponent } from '../../metodoEliminar/metodos.component';

@Component({
  selector: 'app-datos-empleado',
  templateUrl: './datos-empleado.component.html',
  styleUrls: ['./datos-empleado.component.css']
})

export class DatosEmpleadoComponent implements OnInit {


  iniciales: string;
  urlImagen: any;
  mostrarImagen: boolean = false;
  mostrarIniciales: boolean = false;
  barraDis = false;

  empleadoUno: any = [];
  idEmpleado: string;
  fechaNacimiento: any = [];
  discapacidadUser: any = [];

  relacionTituloEmpleado: any = [];
  auxRestTitulo: any = [];

  idContrato: any = [];
  contratoEmpleadoRegimen: any = [];
  contratoEmpleado: any = [];
  fechaContratoIngreso: string;
  fechaContratoSalida: string;

  fechaCargoInicio: string;
  fechaCargoFinal: string;

  logo: any;
  idCargo: any = [];
  idPerVacacion: any = [];
  idPlanHorario: any = [];
  cont: number;

  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  hipervinculo: string = environment.url; // VARIABLE DE MANEJO DE RUTAS CON URL

  constructor(
    public restTitulo: TituloService,
    public restEmpleado: EmpleadoService,
    public restDiscapacidad: DiscapacidadService,
    public restCargo: EmplCargosService,
    public restPerV: PeriodoVacacionesService,
    public restPlanH: PlanHorarioService,
    public vistaRegistrarDatos: MatDialog,
    public restVacaciones: VacacionesService,
    public restPlanHoraDetalle: DetallePlanHorarioService,
    public restEmpleadoProcesos: EmpleadoProcesosService,
    public restPlanComidas: PlanComidasService,
    public restEmpleHorario: EmpleadoHorariosService,
    public restPermiso: PermisosService,
    public restAutoridad: AutorizaDepartamentoService,
    public restEmpre: EmpresaService,
    private toastr: ToastrService,
    private scriptService: ScriptService,
    public restVacuna: VacunacionService,
    // public Main: NavbarComponent,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
    this.obtenerTituloEmpleado(parseInt(this.idEmpleado));
    this.obtenerDiscapacidadEmpleado(this.idEmpleado);
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  ngOnInit(): void {
    this.verEmpleado(this.idEmpleado);
    this.obtenerContratoEmpleadoRegimen();
    this.obtenerPlanComidasEmpleado(parseInt(this.idEmpleado));
    this.obtenerPermisos(parseInt(this.idEmpleado))
    this.ObtenerAutorizaciones(parseInt(this.idEmpleado));
    this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
    this.obtenerCargoEmpleado(parseInt(this.idEmpleado));
    this.obtenerEmpleadoProcesos(parseInt(this.idEmpleado));
    this.obtenerVacaciones(parseInt(this.idEmpleado));
    this.ObtenerDatosVacunas();
    this.ObtenerLogo();
    this.ObtenerColores();
  }

  // Método para obtener el logo de la empresa
  logoE: any = String;
  ObtenerLogo() {
    this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa')).subscribe(res => {
      this.logoE = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  // MÉTODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA 
  p_color: any;
  s_color: any;
  frase: any;
  ObtenerColores() {
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
      this.p_color = res[0].color_p;
      this.s_color = res[0].color_s;
      this.frase = res[0].marca_agua;
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }
  /* 
     * ***************************************************************************************************
     *                               MÉTODO PARA MOSTRAR DATOS
     * ***************************************************************************************************
    */
  /** Método para ver la información del empleado */
  textoBoton: string = 'Subir Foto';
  verEmpleado(idemploy: any) {
    this.empleadoUno = [];
    let idEmpleadoActivo = localStorage.getItem('empleado');
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoUno = data;
      this.fechaNacimiento = data[0]['fec_nacimiento'].split("T")[0];
      if (data[0]['imagen'] != null) {
        this.urlImagen = `${environment.url}/empleado/img/` + data[0]['imagen'];
        this.mostrarImagen = true;
        this.mostrarIniciales = false;
        this.textoBoton = 'Editar Foto';
        if (idEmpleadoActivo === idemploy) {
          // this.Main.urlImagen = this.urlImagen;
        }
      } else {
        this.iniciales = data[0].nombre.split(" ")[0].slice(0, 1) + data[0].apellido.split(" ")[0].slice(0, 1);
        this.mostrarIniciales = true
        this.mostrarImagen = false;
        this.textoBoton = 'Subir Foto';
      }
    })
  }

  /** Método para obtener datos de discapacidad */
  obtenerDiscapacidadEmpleado(idEmployDisca: any) {
    this.discapacidadUser = [];
    this.restDiscapacidad.getDiscapacidadUsuarioRest(idEmployDisca).subscribe(data => {
      this.discapacidadUser = data;
    }, error => { console.log("") });
  }

  /** Método para obtener los títulos de un empleado a través de la tabla EMPL_TITULOS 
    * que conecta a la tabla EMPLEADOS con CG_TITULOS */
  obtenerTituloEmpleado(idEmployTitu: number) {
    this.relacionTituloEmpleado = [];
    this.restEmpleado.getEmpleadoTituloRest(idEmployTitu).subscribe(data => {
      this.relacionTituloEmpleado = data;
    }, error => { console.log("") });
  }

  /** Método para obtener el contrato de un empleado con su respectivo régimen laboral */
  idContratoEmpleado: number;
  obtenerContratoEmpleadoRegimen() {
    this.restEmpleado.BuscarIDContratoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      this.restEmpleado.BuscarDatosContrato(this.idContrato[0].max).subscribe(res => {
        this.contratoEmpleado = res;
      }, error => { });
    }, error => { });
  }

  /** Método para obtener los datos del cargo del empleado */
  cargoEmpleado: any = [];
  cargosTotalesEmpleado: any = [];
  obtenerCargoEmpleado(id_empleado: number) {
    this.cargoEmpleado = [];
    this.cargosTotalesEmpleado = [];
    this.restCargo.BuscarIDCargoActual(id_empleado).subscribe(datos => {
      this.cargosTotalesEmpleado = datos;
      let cargoIdActual = this.cargosTotalesEmpleado[0].max;
      this.restCargo.getUnCargoRest(cargoIdActual).subscribe(datos => {
        this.cargoEmpleado = datos;
      }, error => { });
    });
  }

  /* Método para imprimir datos del permiso */
  permisosEmpleado: any;
  permisosTotales: any;
  obtenerPermisos(id_empleado: number) {
    this.permisosEmpleado = [];
    this.permisosTotales = [];
    this.restEmpleado.BuscarIDContrato(id_empleado).subscribe(datos => {
      this.idContrato = datos;
      // console.log("idContrato ", this.idContrato[0].id);
      for (let i = 0; i <= this.idContrato.length - 1; i++) {
        this.restPermiso.BuscarPermisoContrato(this.idContrato[i]['id']).subscribe(datos => {
          this.permisosEmpleado = datos;
          console.log(this.permisosTotales);
          if (this.permisosEmpleado.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.permisosTotales = datos
              this.cont++;
            }
            else {
              this.permisosTotales = this.permisosTotales.concat(datos);
              console.log("Datos Permisos" + i + '', this.permisosTotales)
            }
          }
        }, err => {
          const { access, message } = err.error.message;
          if (access === false) {
            this.toastr.error(message)
          }
        })
      }
    });
  }

  vacaciones: any = [];
  obtenerVacaciones(id_empleado: number) {
    this.restPerV.BuscarIDPerVacaciones(id_empleado).subscribe(datos => {
      this.idPerVacacion = datos;
      console.log("idPerVaca ", this.idPerVacacion[0].id);
      this.restVacaciones.ObtenerVacacionesPorIdPeriodo(this.idPerVacacion[0].id).subscribe(res => {
        this.vacaciones = res;
      }, error => { console.log("") });
    }, error => { });
  }

  planHorario: any;
  obtenerPlanHorarios(idEmpleadoCargo: number) {
    this.restPlanH.ObtenerPlanHorarioPorIdCargo(idEmpleadoCargo).subscribe(res => {
      this.planHorario = res;
      this.planHorario.map(obj => {
        this.obtenerPlanHoraDetalle(obj.id);
      })
    }, error => { console.log("") });
  }

  planHoraDetalle: any;
  obtenerPlanHoraDetalle(id_plan_horario: number) {
    this.restPlanHoraDetalle.ObtenerPlanHoraDetallePorIdPlanHorario(id_plan_horario).subscribe(res => {
      this.planHoraDetalle = res;
    }, error => { console.log("") });
  }

  /** Método para mostrar datos de los procesos del empleado */
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

  /** Método para mostrar datos de planificación de almuerzos */
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



  /* Método para mostrar datos de autoridad departamentos */
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

  /* Método para mostrar datos de horario */
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



  /* 
  ****************************************************************************************************
  *                               ABRIR VENTANAS DE SOLICITUDES
  ****************************************************************************************************
  */

  /* Ventana para realizar cambio de contraseña */
  CambiarContrasena(): void {
    console.log(this.idEmpleado);
    this.vistaRegistrarDatos.open(CambiarContrasenaComponent, { width: '350px', data: this.idEmpleado }).disableClose = true;
  }

  /* Ventana para registrar vacaciones del empleado */
  AbrirVentanaVacaciones(): void {
    this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idPerVacacion = datos;
      console.log(this.idPerVacacion)
      this.vistaRegistrarDatos.open(RegistrarVacacionesComponent,
        { width: '900px', data: { idEmpleado: this.idEmpleado, idPerVacacion: this.idPerVacacion[0].id, idContrato: this.idPerVacacion[0].idcontrato } }).disableClose = true;
    }, error => {
      this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones', 'Primero Registrar Periodo de Vacaciones', {
        timeOut: 6000,
      })
    });
  }

  /* Ventana para registrar planificación de horarios del empleado */
  AbrirVentanaPlanHorario(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistroPlanHorarioComponent,
        { width: '300px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } }).disableClose = true;
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  /* Ventana para registrar permisos del empleado */
  AbrirVentanaPermiso(): void {
    this.restEmpleado.BuscarIDContrato(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idContrato = datos;
      console.log("Ultimo idContrato ", this.idContrato[this.idContrato.length - 1].id)
      this.restPerV.BuscarIDPerVacaciones(parseInt(this.idEmpleado)).subscribe(datos => {
        this.idPerVacacion = datos;
        console.log("idPerVaca ", this.idPerVacacion[0].id)
        this.vistaRegistrarDatos.open(RegistroEmpleadoPermisoComponent,
          {
            width: '1200px',
            data: { idEmpleado: this.idEmpleado, idContrato: this.idContrato[this.idContrato.length - 1].id, idPerVacacion: this.idPerVacacion[0].id }
          }).afterClosed().subscribe(item => {
            this.obtenerPermisos(parseInt(this.idEmpleado));
          });
      }, error => {
        this.toastr.info('El empleado no tiene registrado Periodo de Vacaciones', 'Primero Registrar Periodo de Vacaciones', {
          timeOut: 6000,
        })
      });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Contrato', 'Primero Registrar Contrato', {
        timeOut: 6000,
      })
    });
  }

  /* 
  ****************************************************************************************************
  *                               PARA LA GENERACION DE PDFs
  ****************************************************************************************************
  */

  generarPdf(action = 'open') {
    const documentDefinition = this.getDocumentDefinicion();
    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }
  }

  getDocumentDefinicion() {
    sessionStorage.setItem('profile', this.empleadoUno);
    return {
      // Encabezado de la página
      pageOrientation: 'landscape',
      watermark: { text: this.frase, color: 'blue', opacity: 0.1, bold: true, italics: false },
      header: { text: 'Impreso por:  ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido, margin: 10, fontSize: 9, opacity: 0.3, alignment: 'right' },

      // Pie de página
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
            [{ text: this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido, style: 'name' },
            { text: 'Fecha Nacimiento: ' + this.fechaNacimiento },
            { text: 'Corre Electronico: ' + this.empleadoUno[0].correo, },
            { text: 'Teléfono: ' + this.empleadoUno[0].telefono, }
            ]
          ]
        },
        { text: 'Contrato Empleado', style: 'header' },
        this.presentarDataPDFcontratoEmpleado(),
        { text: 'Plan de comidas', style: 'header' },
        { text: 'Titulos', style: 'header' },
        this.presentarDataPDFtitulosEmpleado(),
        { text: 'Discapacidad', style: 'header' },
        this.presentarDataPDFdiscapacidadEmpleado(),
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

  presentarDataPDFtitulosEmpleado() {
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

  presentarDataPDFcontratoEmpleado() {
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

  presentarDataPDFdiscapacidadEmpleado() {
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

  /* 
  ****************************************************************************************************
  *                               PARA LA EXPORTACIÓN DE ARCHIVOS EXCEL Y CSV
  ****************************************************************************************************
  */

  exportToExcel() {
    const wse: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.empleadoUno);
    const wsc: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.contratoEmpleadoRegimen);
    const wsd: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.discapacidadUser);
    const wst: xlsx.WorkSheet = xlsx.utils.json_to_sheet(this.relacionTituloEmpleado);
    const wb: xlsx.WorkBook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, wse, 'perfil');
    xlsx.utils.book_append_sheet(wb, wsc, 'contrato');
    xlsx.utils.book_append_sheet(wb, wst, 'titulos');
    xlsx.utils.book_append_sheet(wb, wsd, 'discapacida');
    xlsx.writeFile(wb, "EmpleadoEXCEL" + new Date().getTime() + '.xlsx');
  }

  exportToCVS() {
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

  /* 
  ****************************************************************************************************
  *                               PARA LA SUBIR LA IMAGEN DEL EMPLEADO
  ****************************************************************************************************
  */
  nameFile: string;
  archivoSubido: Array<File>;
  archivoForm = new FormControl('');

  fileChange(element) {
    this.archivoSubido = element.target.files;
    this.plantilla();
  }

  plantilla() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubido.length; i++) {
      console.log(this.archivoSubido[i], this.archivoSubido[i].name)
      formData.append("image[]", this.archivoSubido[i], this.archivoSubido[i].name);
    }
    this.restEmpleado.subirImagen(formData, parseInt(this.idEmpleado)).subscribe(res => {
      this.toastr.success('Operación Exitosa', 'imagen subida.', {
        timeOut: 6000,
      });
      this.verEmpleado(this.idEmpleado)
      this.archivoForm.reset();
      this.nameFile = '';
    });
  }


  /**
  * 
  * METODO PARA EXPORTAR A XML
  * 
  */

  nacionalidades: any = [];
  obtenerNacionalidades() {
    this.restEmpleado.getListaNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  EstadoCivilSelect: any = ['Soltero/a', 'Unión de Hecho', 'Casado/a', 'Divorciado/a', 'Viudo/a'];
  GeneroSelect: any = ['Masculino', 'Femenino'];
  EstadoSelect: any = ['Activo', 'Inactivo'];

  urlxml: string;
  data: any = [];
  exportToXML() {
    var objeto;
    var arregloEmpleado = [];
    this.empleadoUno.forEach(obj => {
      var estadoCivil = this.EstadoCivilSelect[obj.esta_civil - 1];
      var genero = this.GeneroSelect[obj.genero - 1];
      var estado = this.EstadoSelect[obj.estado - 1];
      let nacionalidad;
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


  /* ************************************************************************************************** *
 *                               REGISTRO DE VACUNACIÓN                                               *
 * ************************************************************************************************** */
  // MÉTODO PARA CONSULTAR DATOS DE REGISTRO DE VACUNACIÓN
  mostrarVacuna = true;
  btnHabilitadoVacuna = true;
  datosVacuna: any = [];
  ObtenerDatosVacunas() {
    this.datosVacuna = [];
    this.restVacuna.ObtenerVacunaEmpleado(parseInt(this.idEmpleado)).subscribe(data => {
      this.datosVacuna = data;
      this.HabilitarBotonesVacuna();
    });
  }

  btnVacuna = 'Añadir';
  mostrarVacunaEditar: boolean = true;
  HabilitarBotonesVacuna() {
    if (this.datosVacuna.length == 0) {
      this.btnVacuna = 'Añadir';
    } else {
      this.btnVacuna = 'Editar';
    }
  }

  // LÓGICA DE BOTÓN PARA MOSTRAR COMPONENTE DEL REGISTRO DE VACUNACION 
  MostrarVentanaVacuna() {
    if (this.btnVacuna != 'Editar' && this.btnVacuna != 'Cancelar') {
      if (this.mostrarVacuna == true) {
        this.mostrarVacuna = false;
        this.btnVacuna = 'No Añadir';
      } else {
        this.mostrarVacuna = true;
        this.btnVacuna = 'Añadir';
      }
    } else {
      if (this.mostrarVacunaEditar == false) {
        this.mostrarVacunaEditar = true;
        this.btnVacuna = 'Editar';
      } else {
        this.mostrarVacunaEditar = false;
        this.btnVacuna = 'Cancelar';
      }
    }
  }

  // ELIMINAR REGISTRO DE VACUNA
  EliminarVacuna(id: number) {
    this.restVacuna.EliminarRegistroVacuna(id).subscribe(res => {
      this.ObtenerDatosVacunas();
      this.btnVacuna = 'Añadir';
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
          // this.router.navigate(['/verEmpleado/', this.idEmpleado]);
        }
      });
  }

}
