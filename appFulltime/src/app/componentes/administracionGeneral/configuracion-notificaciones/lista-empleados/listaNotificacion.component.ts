// SECCIÓN DE LIBRERIAS
import { Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as xlsx from 'xlsx';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';
import { EmpleadoElemento } from 'src/app/model/empleado.model';

import { ConfiguracionNotificacionComponent } from '../configuracion/configuracionNotificacion.component';

@Component({
    selector: 'app-listaNotificacion',
    templateUrl: './listaNotificacion.component.html',
    styleUrls: ['./listaNotificacion.component.css']
})


export class ListaNotificacionComponent implements OnInit {

    // VARIABLES DE ALMACENAMIENTO DE DATOS 
    nacionalidades: any = [];
    empleadoD: any = [];
    empleado: any = [];

    // CAMPOS DEL FORMULARIO
    apellido = new FormControl('', [Validators.minLength(2)]);
    codigo = new FormControl('');
    cedula = new FormControl('', [Validators.minLength(2)]);
    nombre = new FormControl('', [Validators.minLength(2)]);

    // VARIABLES USADAS EN BUSQUEDA DE FILTRO DE DATOS
    filtroCodigo: number;
    filtroApellido: '';
    filtroCedula: '';
    filtroNombre: '';

    // ITEMS DE PAGINACION DE LA TABLA
    pageSizeOptions = [5, 10, 20, 50];
    tamanio_pagina: number = 5;
    numero_pagina: number = 1;

    // ITEMS DE PAGINACION DE LA TABLA DESHABILITADOS
    pageSizeOptionsDes = [5, 10, 20, 50];
    tamanio_paginaDes: number = 5;
    numero_paginaDes: number = 1;

    // VARAIBLES DE SELECCION DE DATOS DE UNA TABLA
    selectionUno = new SelectionModel<EmpleadoElemento>(true, []);
    selectionDos = new SelectionModel<EmpleadoElemento>(true, []);

    //selectionEmp = new SelectionModel<ItableDispositivos>(true, []);

    idEmpleado: number;


    constructor(
        public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
        public ventana: MatDialog, // VARIABLE MANEJO DE VENTANAS DE DIÁLOGO
        public router: Router, // VARIABLE DE USO DE PÁGINAS CON URL
        public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
        private toastr: ToastrService, // VARIABLE DE MANEJO DE MENSAJES DE NOTIFICACIONES
    ){
        this.idEmpleado = parseInt(localStorage.getItem('empleado'));
    }

    ngOnInit(): void {
        this.ObtenerEmpleados(this.idEmpleado);
        this.ObtenerColores();
        this.GetEmpleados();
        this.ObtenerLogo();
    }

    // SI EL NUMERO DE ELEMENTOS SELECCIONADOS COINCIDE CON EL NUMERO TOTAL DE FILAS. 
    isAllSelected() {
        const numSelected = this.selectionUno.selected.length;
        const numRows = this.empleado.length;
        return numSelected === numRows;
    }

    // SELECCIONA TODAS LAS FILAS SI NO ESTÁN TODAS SELECCIONADAS; DE LO CONTRARIO, SELECCION CLARA. 
    masterToggle() {
    this.isAllSelected() ?
      this.selectionUno.clear() :
      this.empleado.forEach(row => this.selectionUno.select(row));
    }

    // LA ETIQUETA DE LA CASILLA DE VERIFICACION EN LA FILA PASADA
    checkboxLabel(row?: EmpleadoElemento): string {
        if (!row) {
            return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
        }
        return `${this.selectionUno.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
    }


    // METODO PARA DESACTIVAR O ACTIVAR CHECK LIST DE EMPLEADOS ACTIVOS
    btnCheckHabilitar: boolean = false;
    HabilitarSeleccion() {
        if (this.btnCheckHabilitar === false) {
            this.btnCheckHabilitar = true;
        } else if (this.btnCheckHabilitar === true) {
            this.btnCheckHabilitar = false;
        }
    }

    // METODO PARA DESHABILITAR USUARIOS
  Deshabilitar(opcion: number) {
    let EmpleadosSeleccionados: any;
    if (opcion === 1) {
      EmpleadosSeleccionados = this.selectionUno.selected.map(obj => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    } else if (opcion === 2 || opcion === 3) {
      EmpleadosSeleccionados = this.selectionDos.selected.map(obj => {
        return {
          id: obj.id,
          empleado: obj.nombre + ' ' + obj.apellido
        }
      })
    }

    // VERIFICAR QUE EXISTAN USUARIOS SELECCIONADOS
    if (EmpleadosSeleccionados.length != 0) {
      this.ventana.open(ConfiguracionNotificacionComponent, {
        width: '500px',
        data: { opcion: opcion, lista: EmpleadosSeleccionados }
      })
        .afterClosed().subscribe(item => {
          if (item === true) {
            this.GetEmpleados();
            this.btnCheckHabilitar = false;
            this.selectionUno.clear();
            this.selectionDos.clear();
            EmpleadosSeleccionados = [];
          };
        });
    }
    else {
      this.toastr.info('No ha seleccionado usuarios.', '', {
        timeOut: 6000,
      })
    }
  }

    // METODO PARA VER LA INFORMACION DEL EMPLEADO 
    ObtenerEmpleados(idemploy: any) {
        this.empleadoD = [];
        this.rest.BuscarUnEmpleado(idemploy).subscribe(data => {
            this.empleadoD = data;
        })
    }

    // METODO PARA OBTENER LOGO DE EMPRESA
    logo: any = String;
    ObtenerLogo() {
        this.restEmpre.LogoEmpresaImagenBase64(localStorage.getItem('empresa')).subscribe(res => {
            this.logo = 'data:image/jpeg;base64,' + res.imagen;
        });
    }

    // METODO PARA OBTENER COLORES Y MARCA DE AGUA DE EMPRESA 
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

    // METODO PARA MANEJAR PAGINACION
    ManejarPagina(e: PageEvent) {
        this.numero_pagina = e.pageIndex + 1;
        this.tamanio_pagina = e.pageSize;
    }

    // METODO PARA MANEJAR PAGINACION INACTIVOS
    ManejarPaginaDes(e: PageEvent) {
        this.numero_paginaDes = e.pageIndex + 1;
        this.tamanio_paginaDes = e.pageSize;
    }

    // METODO PARA VALIDAR INGRESO DE LETRAS
    IngresarSoloLetras(e: any) {
        let key = e.keyCode || e.which;
        let tecla = String.fromCharCode(key).toString();
        // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
        let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        // ES LA VALIDACION DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

    //  METODO PARA VALIDAR INGRESO DE NUMEROSO
     IngresarSoloNumeros(evt: any) {
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

    // METODO PARA LISTAR USUARIOS
    GetEmpleados() {
        this.empleado = [];
        this.rest.ListarEmpleadosActivos().subscribe(data => {
            this.empleado = data;
            this.OrdenarDatos(this.empleado);
        })
    }

    // ORDENAR LOS DATOS SEGUN EL  CODIGO
    OrdenarDatos(array: any) {
        function compare(a: any, b: any) {
        if (parseInt(a.codigo) < parseInt(b.codigo)) {
            return -1;
        }
        if (parseInt(a.codigo) > parseInt(b.codigo)) {
            return 1;
        }
        return 0;
        }
        array.sort(compare);
    }

    // METODO PARA LIMPIAR FORMULARIO
    LimpiarCampos() {
        this.codigo.reset();
        this.cedula.reset();
        this.nombre.reset();
        this.apellido.reset();
    }

    AbrirSettings() {
        if (this.selectionUno.selected.length === 0) return this.toastr.warning('Debe seleccionar al menos un empleado para modificar su acceso al reloj virtual.')
        this.ventana.open(ConfiguracionNotificacionComponent, { width: '350px', data: this.selectionUno.selected }).afterClosed().subscribe(result => {

          if (result) {
            this.toastr.success('Configuración Actualizada');
            this.numero_pagina = 1;
          }
          this.selectionUno.clear();
          this.btnCheckHabilitar  = false;
        })
          
    }
}