// SECCIÓN DE LIBRERIAS
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { BirthdayService } from 'src/app/servicios/birthday/birthday.service';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';

import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';

import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR MODELOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesAsistenciasService } from 'src/app/servicios/reportes/reportes-asistencias.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';

export interface EmpleadoElemento {
  id_recibe: number;
  nombre: string;
  apellido: string;
  codigo: number;
  correo: string;
  comunicado_mail: boolean;
  comunicado_noti: boolean;
}

@Component({
  selector: 'app-comunicados',
  templateUrl: './comunicados.component.html',
  styleUrls: ['./comunicados.component.css']
})
export class ComunicadosComponent implements OnInit {




  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre_emp = new FormControl('', [Validators.minLength(2)]);
  nombre_dep = new FormControl('', [Validators.minLength(2)]);
  nombre_suc = new FormControl('', [Validators.minLength(2)]);
  seleccion = new FormControl('');

  filtroNombreSuc_: string = '';

  filtroNombreDep_: string = '';

  filtroCodigo_: number;
  filtroCedula_: string = '';
  filtroNombreEmp_: string = '';


  public _booleanOptions: FormCriteriosBusqueda = {
    bool_suc: false,
    bool_dep: false,
    bool_emp: false,
  };

  public check: checkOptions[];


  idEmpleado: number;

  tituloF = new FormControl('', [Validators.required]);
  mensajeF = new FormControl('', [Validators.required]);

  public comunicadoForm = new FormGroup({
    tituloForm: this.tituloF,
    mensajeForm: this.mensajeF,
  })

  id_empresa: number = parseInt(localStorage.getItem("empresa"));

  constructor(
    private restB: BirthdayService,
    private toastr: ToastrService,
    private realTime: RealTimeService,
    private reporteService: ReportesService,
    private validacionService: ValidacionesService,

    private R_asistencias: ReportesAsistenciasService,

    private restP: ParametrosService,
  ) {
    this.idEmpleado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {

    this.BuscarParametro();
    this.check = this.reporteService.checkOptions(3);
    console.log('CHECK ', this.check);









    sessionStorage.removeItem('reporte_timbres_multiple');
    this.R_asistencias.Departamentos().subscribe((res: any[]) => {
      sessionStorage.setItem('reporte_timbres_multiple', JSON.stringify(res))

      res.forEach(obj => {
        this.sucursales.push({
          id: obj.id_suc,
          nombre: obj.name_suc
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          this.departamentos.push({
            id: ele.id_depa,
            nombre: ele.name_dep
          })
        })
      })

      res.forEach(obj => {
        obj.departamentos.forEach(ele => {
          ele.empleado.forEach(r => {
            if (r.comunicado_mail === true || r.comunicado_noti === true) {

              let elemento = {
                id: r.id,
                nombre: r.name_empleado,
                codigo: r.codigo,
                cedula: r.cedula,
                correo: r.correo,
                comunicado_mail: r.comunicado_mail,
                comunicado_noti: r.comunicado_noti,
              }
              this.empleados.push(elemento)
            }
          })
        })
      })
      console.log('SUCURSALES', this.sucursales);
      console.log('DEPARTAMENTOS', this.departamentos);
      console.log('EMPLEADOS', this.empleados);
      // console.log('TABULADO',this.tabulado);
      // console.log('INCOMPLETOS',this.incompletos);

    }, err => {
      this.toastr.error(err.error.message)
    })


  }

  InsertarMensajeBirthday(form) {
    let dataMensaje = {
      id_empresa: this.id_empresa,
      titulo: form.tituloForm,
      link: form.linkForm,
      mensaje: form.mensajeForm
    }
    console.log(dataMensaje);

    this.restB.CrearBirthday(dataMensaje).subscribe(res => {
      console.log(res);
    })

  }

  ngOnDestroy() {
    this.reporteService.GuardarCheckOpcion(0);
    this.reporteService.DefaultFormCriterios();
    this.reporteService.DefaultValoresFiltros();
    console.log('Componenete destruido');
  }


  opcion: number;
  BuscarPorTipo(e: MatRadioChange) {
    console.log('CHECK ', e.value);
    this.opcion = e.value;
    switch (this.opcion) {
      case 1:
        this._booleanOptions.bool_suc = true;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      case 2:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = true;
        this._booleanOptions.bool_emp = false;
        break;
      case 3:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = true;
        break;
      case 4:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      case 5:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
      default:
        this._booleanOptions.bool_suc = false;
        this._booleanOptions.bool_dep = false;
        this._booleanOptions.bool_emp = false;
        break;
    }
    this.reporteService.GuardarFormCriteriosBusqueda(this._booleanOptions);
    this.reporteService.GuardarCheckOpcion(this.opcion)

  }

  Filtrar(e, orden: number) {
    switch (orden) {
      case 1: this.reporteService.setFiltroNombreSuc(e); break;
      case 2: this.reporteService.setFiltroNombreDep(e); break;
      case 3: this.reporteService.setFiltroCodigo(e); break;
      case 4: this.reporteService.setFiltroCedula(e); break;
      case 5: this.reporteService.setFiltroNombreEmp(e); break;
      default:
        break;
    }
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }

  departamentos: any = [];
  sucursales: any = [];
  respuesta: any[];
  empleados: any = [];
  tabulado: any = [];



  selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
  selectionDep = new SelectionModel<ITableEmpleados>(true, []);
  selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

  // ITEMS DE PAGINACIÓN DE LA TABLA SUCURSAL
  pageSizeOptions_suc = [5, 10, 20, 50];
  tamanio_pagina_suc: number = 5;
  numero_pagina_suc: number = 1;
  // ITEMS DE PAGINACIÓN DE LA TABLA DEPARTAMENTO
  pageSizeOptions_dep = [5, 10, 20, 50];
  tamanio_pagina_dep: number = 5;
  numero_pagina_dep: number = 1;
  // ITEMS DE PAGINACIÓN DE LA TABLA EMPLEADOS
  pageSizeOptions_emp = [5, 10, 20, 50];
  tamanio_pagina_emp: number = 5;
  numero_pagina_emp: number = 1;


  get filtroNombreSuc() { return this.reporteService.filtroNombreSuc }

  get filtroNombreDep() { return this.reporteService.filtroNombreDep }

  get filtroNombreEmp() { return this.reporteService.filtroNombreEmp };
  get filtroCodigo() { return this.reporteService.filtroCodigo };
  get filtroCedula() { return this.reporteService.filtroCedula };


  /*****************************************************************************
  * 
  * 
  * Varios Metodos Complementarios al funcionamiento. 
  * 
  * 
  **************************************************************************/

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedSuc() {
    const numSelected = this.selectionSuc.selected.length;
    return numSelected === this.sucursales.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleSuc() {
    this.isAllSelectedSuc() ?
      this.selectionSuc.clear() :
      this.sucursales.forEach(row => this.selectionSuc.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelSuc(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedDep() {
    const numSelected = this.selectionDep.selected.length;
    return numSelected === this.departamentos.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleDep() {
    this.isAllSelectedDep() ?
      this.selectionDep.clear() :
      this.departamentos.forEach(row => this.selectionDep.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelDep(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  /** Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelectedEmp() {
    const numSelected = this.selectionEmp.selected.length;
    return numSelected === this.empleados.length
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara. */
  masterToggleEmp() {
    this.isAllSelectedEmp() ?
      this.selectionEmp.clear() :
      this.empleados.forEach(row => this.selectionEmp.select(row));
  }

  /** La etiqueta de la casilla de verificación en la fila pasada*/
  checkboxLabelEmp(row?: ITableEmpleados): string {
    if (!row) {
      return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
    }
    return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  ManejarPaginaResultados(e: PageEvent) {
    if (this._booleanOptions.bool_suc === true) {
      this.tamanio_pagina_suc = e.pageSize;
      this.numero_pagina_suc = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_dep === true) {
      this.tamanio_pagina_dep = e.pageSize;
      this.numero_pagina_dep = e.pageIndex + 1;
    } else if (this._booleanOptions.bool_emp === true) {
      this.tamanio_pagina_emp = e.pageSize;
      this.numero_pagina_emp = e.pageIndex + 1;
    }
  }



  ModelarSucursal(form) {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple'))
    respuesta.forEach((obj: any) => {
      this.selectionSuc.selected.find(obj1 => {
        if (obj.id_suc === obj1.id) {
          obj.departamentos.forEach((obj2: any) => {
            obj2.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          })
        }
      })
    })

    this.EnviarNotificaciones(usuarios, form);
  }

  ModelarEmpleados(form) {
    let respuesta: any = [];
    this.empleados.forEach((obj: any) => {
      this.selectionEmp.selected.find(obj1 => {
        if (obj1.id === obj.id) {
          respuesta.push(obj)
        }
      })
    })
    this.EnviarNotificaciones(respuesta, form);
  }

  ModelarDepartamentos(form) {
    let usuarios: any = [];
    let respuesta = JSON.parse(sessionStorage.getItem('reporte_timbres_multiple'))
    respuesta.forEach((obj: any) => {
      obj.departamentos.forEach((obj1: any) => {
        this.selectionDep.selected.find(obj2 => {
          if (obj1.id_depa === obj2.id) {
            obj1.empleado.forEach((obj3: any) => {
              if (obj3.comunicado_mail === true || obj3.comunicado_noti === true) {
                usuarios.push(obj3)
              }
            })
          }
        })
      })
    })
    this.EnviarNotificaciones(usuarios, form);
  }

  cont: number = 0;
  EnviarNotificaciones(data: any, form) {
    var f = moment();
    var hora = f.format('HH:mm:ss');

    if (data.length > 0) {

      this.ContarCorreos(data);
      if (this.cont_correo <= this.correos) {
        this.cont = 0;
        data.forEach((obj: any) => {
          let datosCorreo = {
            id_envia: this.idEmpleado,
            correo: obj.correo,
            mensaje: form.mensajeForm,
            asunto: form.tituloForm,
            hora: hora
          }
          if (obj.comunicado_mail === true) {
            this.realTime.EnviarCorreoComunicado(datosCorreo).subscribe(envio => {
              this.cont = this.cont + 1;
              this.envios = [];
              this.envios = envio;
              if (obj.comunicado_noti === true) {
                this.NotificarPlanificacion(this.idEmpleado, obj.id, form);
              }
              if (this.cont === data.length) {
                this.toastr.success('Mensaje enviado exitosamente.', '', {
                  timeOut: 6000,
                });
                this.LimpiarFormulario();
                this.BuscarParametro();
              }
            });
          }

        })
      }
      else {
        this.toastr.warning('Trata de enviar un total de ' + this.cont_correo + ' correos, sin embargo solo tiene permitido enviar un total de ' + this.correos + ' correos.', 'ACCIÓN NO PERMITIDA.', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.toastr.warning('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      });
    }


  }

  cont_correo: number = 0;
  info_correo: string = '';
  ContarCorreos(data: any) {
    this.cont_correo = 0;
    this.info_correo = '';
    data.forEach((obj: any) => {
      if (obj.comunicado_mail === true) {
        this.cont_correo = this.cont_correo + 1
        if (this.info_correo === '') {
          this.info_correo = obj.correo;
        }
        else {
          this.info_correo = this.info_correo + '; ' + obj.correo;
        }

      }
    })

    console.log('ver correos -----------', this.info_correo)
  }



  jefes: any = [];
  envios: any = [];


  NotificarPlanificacion(empleado_envia: any, empleado_recive: any, form) {
    let mensaje = {
      id_empl_envia: empleado_envia,
      id_empl_recive: empleado_recive,
      mensaje: form.tituloForm + '; ' + form.mensajeForm
    }
    console.log(mensaje);
    this.realTime.EnviarMensajeComunicado(mensaje).subscribe(res => {
      console.log(res.message);
    })
  }



  GuardarRegistros(form) {
    // console.log('ver seleccion', this.opcion)
    if (this.opcion === 1) {
      this.ModelarSucursal(form);
      // this.AbrirVentanaBusqueda();
    }
    else if (this.opcion === 2) {
      this.ModelarDepartamentos(form);
      // this.AbrirVentanaBusqueda();
    }
    else {
      this.ModelarEmpleados(form);
      // this.AbrirVentanaBusqueda();
    }
  }

  LimpiarFormulario() {
    this.comunicadoForm.reset();
    if (this._booleanOptions.bool_emp === true || this._booleanOptions.bool_tab === true || this._booleanOptions.bool_inc === true) {
      this.codigo.reset();
      this.cedula.reset();
      this.nombre_emp.reset();
      this._booleanOptions.bool_emp = false;
      this._booleanOptions.bool_tab = false;
      this._booleanOptions.bool_inc = false;
    }
    if (this._booleanOptions.bool_dep) {
      this.nombre_dep.reset();
      this._booleanOptions.bool_dep = false;
    }
    if (this._booleanOptions.bool_suc) {
      this.nombre_suc.reset();
      this._booleanOptions.bool_suc = false;
    }
    this.seleccion.reset();
  }







  correos: number;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 22
    let datos = [];
    this.restP.ListarDetalleParametros(24).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.correos = parseInt(datos[0].descripcion)
        }
        else {
          this.correos = 0
        }
      });
  }

}
