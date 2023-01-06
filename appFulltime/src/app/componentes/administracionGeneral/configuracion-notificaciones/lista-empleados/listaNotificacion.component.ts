import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatRadioChange } from '@angular/material/radio';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

// IMPORTAR PLANTILLA DE MODELO DE DATOS
import { ITableEmpleados } from 'src/app/model/reportes.model';
import { checkOptions, FormCriteriosBusqueda } from 'src/app/model/reportes.model';


import { PeriodoVacacionesService } from 'src/app/servicios/periodoVacaciones/periodo-vacaciones.service';
import { DatosGeneralesService } from 'src/app/servicios/datosGenerales/datos-generales.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ReportesService } from 'src/app/servicios/reportes/reportes.service';
import { MainNavService } from 'src/app/componentes/administracionGeneral/main-nav/main-nav.service';

// IMPORTAR SERVICIOS
import { EmpleadoElemento } from 'src/app/model/empleado.model';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

import { ConfiguracionNotificacionComponent } from '../configuracion/configuracionNotificacion.component';
import { RegistroEmpleadoPermisoComponent } from 'src/app/componentes/modulos/permisos/registro-empleado-permiso/registro-empleado-permiso.component';
import { PermisosMultiplesComponent } from 'src/app/componentes/modulos/permisos/permisos-multiples/permisos-multiples.component';

@Component({
    selector: 'app-listaNotificacion',
    templateUrl: './listaNotificacion.component.html',
    styleUrls: ['./listaNotificacion.component.css']
})

export class ListaNotificacionComponent implements OnInit {

    idEmpleadoLogueado: any;

    // CONTROL DE CRITERIOS DE BUSQUEDA
    codigo = new FormControl('');
    cedula = new FormControl('', [Validators.minLength(2)]);
    nombre_emp = new FormControl('', [Validators.minLength(2)]);
    nombre_dep = new FormControl('', [Validators.minLength(2)]);
    nombre_suc = new FormControl('', [Validators.minLength(2)]);
    seleccion = new FormControl('');

    habilitado: any;

    public _booleanOptions: FormCriteriosBusqueda = {
        bool_suc: false,
        bool_dep: false,
        bool_emp: false,
    };

    public check: checkOptions[];

    // PRESENTACION DE INFORMACION DE ACUERDO AL CRITERIO DE BUSQUEDA
    departamentos: any = [];
    sucursales: any = [];
    respuesta: any[];
    empleados: any = [];
    origen: any = [];

    selectionSuc = new SelectionModel<ITableEmpleados>(true, []);
    selectionDep = new SelectionModel<ITableEmpleados>(true, []);
    selectionEmp = new SelectionModel<ITableEmpleados>(true, []);

    // ITEMS DE PAGINACIÓN DE LA TABLA SUCURSAL
    pageSizeOptions_suc = [5, 10, 20, 50];
    tamanio_pagina_suc: number = 5;
    numero_pagina_suc: number = 1;

    // ITEMS DE PAGINACION DE LA TABLA DEPARTAMENTO
    pageSizeOptions_dep = [5, 10, 20, 50];
    tamanio_pagina_dep: number = 5;
    numero_pagina_dep: number = 1;

    // ITEMS DE PAGINACION DE LA TABLA EMPLEADOS
    pageSizeOptions_emp = [5, 10, 20, 50];
    tamanio_pagina_emp: number = 5;
    numero_pagina_emp: number = 1;

    // FILTROS SUCURSALES
    filtroNombreSuc_: string = '';
    get filtroNombreSuc() { return this.restR.filtroNombreSuc }

    // FILTROS DEPARTAMENTOS
    filtroNombreDep_: string = '';
    get filtroNombreDep() { return this.restR.filtroNombreDep }

    // FILTROS EMPLEADO
    filtroCodigo_: number;
    filtroCedula_: string = '';
    filtroNombreEmp_: string = '';
    get filtroNombreEmp() { return this.restR.filtroNombreEmp };
    get filtroCodigo() { return this.restR.filtroCodigo };
    get filtroCedula() { return this.restR.filtroCedula };

    // HABILITAR O DESHABILITAR EL ICONO DE PROCESO INDIVIDUAL
    individual: boolean = true;

    constructor(
        public informacion: DatosGeneralesService,
        public restPerV: PeriodoVacacionesService,
        public restR: ReportesService,
        private ventana: MatDialog,
        private toastr: ToastrService,
        private funciones: MainNavService,
        private validar: ValidacionesService,
    ) {
        this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
    }

    ngOnInit(): void {
        this.check = this.restR.checkOptions(3);
        this.BuscarInformacion();
    }

    ngOnDestroy() {
        this.restR.GuardarCheckOpcion(0);
        this.restR.DefaultFormCriterios();
        this.restR.DefaultValoresFiltros();
        this.origen = [];
    }

    BuscarInformacion() {
        this.origen = [];
        this.informacion.ObtenerInformacion().subscribe((res: any[]) => {

            this.origen = JSON.stringify(res);

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
                        let elemento = {
                            id: r.id,
                            nombre: r.name_empleado,
                            codigo: r.codigo,
                            cedula: r.cedula,
                            correo: r.correo,
                            id_cargo: r.id_cargo,
                            id_contrato: r.id_contrato,
                        }
                        this.empleados.push(elemento)
                    })
                })
            })
            console.log('SUCURSALES', this.sucursales);
            console.log('DEPARTAMENTOS', this.departamentos);
            console.log('EMPLEADOS', this.empleados);

        }, err => {
            this.toastr.error(err.error.message)
        })
    }

    // METODO PARA ACTIVAR SELECCION MULTIPLE
    multiple: boolean = false;
    HabilitarSeleccion() {
        this.multiple = true;
        this.individual = false;
        this.activar_seleccion = false;
    }

    // METODO PARA MOSTRAR DATOS DE BUSQUEDA
    opcion: number;
    activar_boton: boolean = false;
    activar_seleccion: boolean = true;
    BuscarPorTipo(e: MatRadioChange) {
        this.opcion = e.value;
        this.activar_boton = true;
        switch (this.opcion) {
            case 1:
                this._booleanOptions.bool_suc = true;
                this._booleanOptions.bool_dep = false;
                this._booleanOptions.bool_emp = false;
                this.activar_seleccion = true;
                this.multiple = false;
                this.individual = true;
                break;
            case 2:
                this._booleanOptions.bool_suc = false;
                this._booleanOptions.bool_dep = true;
                this._booleanOptions.bool_emp = false;
                this.activar_seleccion = true;
                this.multiple = false;
                this.individual = true;
                break;
            case 3:
                this._booleanOptions.bool_suc = false;
                this._booleanOptions.bool_dep = false;
                this._booleanOptions.bool_emp = true;
                this.activar_seleccion = true;
                this.multiple = false;
                this.individual = true;
                break;
            default:
                this._booleanOptions.bool_suc = false;
                this._booleanOptions.bool_dep = false;
                this._booleanOptions.bool_emp = false;
                this.activar_seleccion = true;
                this.multiple = false;
                this.individual = true;
                break;
        }
        this.restR.GuardarFormCriteriosBusqueda(this._booleanOptions);
        this.restR.GuardarCheckOpcion(this.opcion)

    }

    // METODO PARA FILTRAR DATOS DE BUSQUEDA
    Filtrar(e: any, orden: number) {
        switch (orden) {
            case 1: this.restR.setFiltroNombreSuc(e); break;
            case 2: this.restR.setFiltroNombreDep(e); break;
            case 3: this.restR.setFiltroCodigo(e); break;
            case 4: this.restR.setFiltroCedula(e); break;
            case 5: this.restR.setFiltroNombreEmp(e); break;
            default:
                break;
        }
    }

    /** ************************************************************************************** **
     ** **                   METODOS DE SELECCION DE DATOS DE USUARIOS                      ** **
     ** ************************************************************************************** **/

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
    isAllSelectedSuc() {
        const numSelected = this.selectionSuc.selected.length;
        return numSelected === this.sucursales.length
    }

    // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
    masterToggleSuc() {
        this.isAllSelectedSuc() ?
            this.selectionSuc.clear() :
            this.sucursales.forEach(row => this.selectionSuc.select(row));
    }

    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelSuc(row?: ITableEmpleados): string {
        if (!row) {
            return `${this.isAllSelectedSuc() ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionSuc.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
    isAllSelectedDep() {
        const numSelected = this.selectionDep.selected.length;
        return numSelected === this.departamentos.length
    }

    // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
    masterToggleDep() {
        this.isAllSelectedDep() ?
            this.selectionDep.clear() :
            this.departamentos.forEach(row => this.selectionDep.select(row));
    }

    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelDep(row?: ITableEmpleados): string {
        if (!row) {
            return `${this.isAllSelectedDep() ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionDep.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
    isAllSelectedEmp() {
        const numSelected = this.selectionEmp.selected.length;
        return numSelected === this.empleados.length
    }

    // SELECCIONA TODAS LAS FILAS SI NO ESTAN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
    masterToggleEmp() {
        this.isAllSelectedEmp() ?
            this.selectionEmp.clear() :
            this.empleados.forEach(row => this.selectionEmp.select(row));
    }

    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabelEmp(row?: ITableEmpleados): string {
        if (!row) {
            return `${this.isAllSelectedEmp() ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionEmp.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }

    // METODO DE PAGINACION DE DATOS
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

    // METODO PARA PRESENTAR DATOS DE SUCURSALES
    ModelarSucursal(id: number) {
        let usuarios: any = [];
        let respuesta = JSON.parse(this.origen)
        if (id === 0) {
            respuesta.forEach((obj: any) => {
                this.selectionSuc.selected.find(obj1 => {
                    if (obj.id_suc === obj1.id) {
                        obj.departamentos.forEach((obj2: any) => {
                            obj2.empleado.forEach((obj3: any) => {
                                usuarios.push(obj3)
                            })
                        })
                    }
                })
            })
        }
        else {
            respuesta.forEach((obj: any) => {
                if (obj.id_suc === id) {
                    obj.departamentos.forEach((obj2: any) => {
                        obj2.empleado.forEach((obj3: any) => {
                            usuarios.push(obj3)
                        })
                    })
                }
            })
        }

        this.RegistrarMultiple(usuarios);
    }

    // METODO PARA PRESENTAR DATOS DE DEPARTAMENTOS
    ModelarDepartamentos(id: number) {
        let usuarios: any = [];
        let respuesta = JSON.parse(this.origen)

        if (id === 0) {
            respuesta.forEach((obj: any) => {
                obj.departamentos.forEach((obj1: any) => {
                    this.selectionDep.selected.find(obj2 => {
                        if (obj1.id_depa === obj2.id) {
                            obj1.empleado.forEach((obj3: any) => {
                                usuarios.push(obj3)
                            })
                        }
                    })
                })
            })
        }
        else {
            respuesta.forEach((obj: any) => {
                obj.departamentos.forEach((obj1: any) => {
                    if (obj1.id_depa === id) {
                        obj1.empleado.forEach((obj3: any) => {
                            usuarios.push(obj3)
                        })
                    }
                })
            })
        }

        this.RegistrarMultiple(usuarios);
    }

    // METODO PARA PRESENTAR DATOS DE EMPLEADO
    ModelarEmpleados() {
        let respuesta: any = [];
        this.empleados.forEach((obj: any) => {
            this.selectionEmp.selected.find(obj1 => {
                if (obj1.id === obj.id) {
                    respuesta.push(obj)
                }
            })
        })
        this.RegistrarMultiple(respuesta);
    }


    /** ************************************************************************************** **
     ** **                    METODOS DE REGISTRO DE CONFIGURACIONES                        ** ** 
     ** ************************************************************************************** **/

    RegistrarConfiguracion(usuario: any) {
        this.Registrar(usuario);
    }

    // METODO DE VALIDACION DE SELECCION MULTIPLE
    RegistrarMultiple(data: any) {
        if (data.length > 0) {
            this.Registrar(data);
        }
        else {
            this.toastr.warning('No ha seleccionado usuarios.', '', {
                timeOut: 6000,
            });
        }
    }

    // METODO PARA CONFIGURAR DATOS
    Registrar(seleccionados: any) {
        this.ventana.open(ConfiguracionNotificacionComponent,
            { width: '350px', data: seleccionados }).afterClosed().subscribe(result => {
                this.individual = true;
                this.LimpiarFormulario();
            })
    }

    // METODO PARA TOMAR DATOS SELECCIONADOS
    GuardarRegistros(id: number) {
        if (this.opcion === 1) {
            this.ModelarSucursal(id);
        }
        else if (this.opcion === 2) {
            this.ModelarDepartamentos(id);
        }
        else {
            this.ModelarEmpleados();
        }
    }

    // METODO PARA LIMPIAR FORMULARIOS
    LimpiarFormulario() {
        if (this._booleanOptions.bool_emp === true) {

            this.codigo.reset();
            this.cedula.reset();
            this.nombre_emp.reset();

            this._booleanOptions.bool_emp = false;

            this.selectionEmp.clear();
        }

        if (this._booleanOptions.bool_dep) {
            this.nombre_dep.reset();
            this._booleanOptions.bool_dep = false;
            this.selectionDep.clear();
        }

        if (this._booleanOptions.bool_suc) {
            this.nombre_suc.reset();
            this._booleanOptions.bool_suc = false;
            this.selectionSuc.clear();
        }

        this.seleccion.reset();
        this.activar_boton = false;
    }

    // MOSTRAR DATOS DE EMPRESA
    MostrarLista() {
        if (this.opcion === 1) {
            this.nombre_suc.reset();
            this.Filtrar('', 1)
        }
        else if (this.opcion === 2) {
            this.nombre_dep.reset();
            this.Filtrar('', 2)
        }
        else if (this.opcion === 3) {
            this.codigo.reset();
            this.cedula.reset();
            this.nombre_emp.reset();
            this.Filtrar('', 3)
            this.Filtrar('', 4)
            this.Filtrar('', 5)
        }
    }

    IngresarSoloLetras(e) {
        let key = e.keyCode || e.which;
        let tecla = String.fromCharCode(key).toString();
        // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
        let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
        let especiales = [8, 37, 39, 46, 6, 13];
        let tecla_especial = false
        for (var i in especiales) {
            if (key == especiales[i]) {
                tecla_especial = true;
                break;
            }
        }
        if (letras.indexOf(tecla) == -1 && !tecla_especial) {
            this.toastr.info('No se admite datos numéricos', 'Usar solo letras', {
                timeOut: 6000,
            })
            return false;
        }
    }

    IngresarSoloNumeros(evt) {
        if (window.event) {
            var keynum = evt.keyCode;
        }
        else {
            keynum = evt.which;
        }
        // COMPROBAMOS SI SE ENCUENTRA EN EL RANGO NUMÉRICO Y QUE TECLAS NO RECIBIRÁ.
        if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
            return true;
        }
        else {
            this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
                timeOut: 6000,
            })
            return false;
        }
    }
}