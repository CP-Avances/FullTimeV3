// IMPORTAR LIBRERIAS
import { Validators, FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Component, OnInit } from '@angular/core';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import pdfMake from 'pdfmake/build/pdfmake';
import { ToastrService } from 'ngx-toastr';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// LIBRERÍA PARA FORMATO DE FECHAS
import * as moment from 'moment';
moment.locale('es');

// LLAMADO DE SERVICIOS
import { EmpleadoProcesosService } from 'src/app/servicios/empleado/empleadoProcesos/empleado-procesos.service';
import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { AccionPersonalService } from 'src/app/servicios/accionPersonal/accion-personal.service';
import { EmpresaService } from 'src/app/servicios/catalogos/catEmpresa/empresa.service';

@Component({
  selector: 'app-listar-pedido-accion',
  templateUrl: './listar-pedido-accion.component.html',
  styleUrls: ['./listar-pedido-accion.component.css']
})

export class ListarPedidoAccionComponent implements OnInit {

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  // DATOS FILTROS DE BÚSQUEDA
  filtroCodigo: number;
  filtroCedula: '';
  filtroNombre: '';
  filtroApellido: '';
  // DATOS DEL FORMULARIO DE BÚSQUEDA
  codigo = new FormControl('');
  cedula = new FormControl('', [Validators.minLength(2)]);
  nombre = new FormControl('', [Validators.minLength(2)]);
  apellido = new FormControl('', [Validators.minLength(2)]);

  constructor(
    public restEmpleadoProcesos: EmpleadoProcesosService, // SERVICIO DATOS PROCESOS DEL EMPLEADO
    public restAccion: AccionPersonalService, // SERVICIO DATOS ACCIONES DE PERSONAL
    public restCargo: EmplCargosService, // SERVICIO DATOS DE CARGO
    public restEmpre: EmpresaService, // SERVICIO DATOS DE EMPRESA
    private toastr: ToastrService, // VARIABLE PARA MANEJO DE NOTIFICACIONES 
  ) { }

  ngOnInit(): void {
    this.ObtenerLogo();
    this.VerDatosAcciones();
    this.ObtenerEmpresa();
  }

  // EVENTO PARA MANEJAR LA PÁGINACIÓN
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  // OBTENER LOGO DEL MINISTERIO DE TRABAJO
  logo: any = String;
  ObtenerLogo() {
    this.restAccion.LogoImagenBase64().subscribe(res => {
      this.logo = 'data:image/jpeg;base64,' + res.imagen;
    });
  }

  //DATOS ACCIONES
  listaPedidos: any = [];
  VerDatosAcciones() {
    this.listaPedidos = [];
    this.restAccion.BuscarDatosPedido().subscribe(data => {
      this.listaPedidos = data;
    });
  }

  // MÉTODO PARA OBTENER DATOS DE COLORES DE LA EMPRESA
  empresa: any = [];
  ObtenerEmpresa() {
    this.empresa = [];
    this.restEmpre.ConsultarDatosEmpresa(parseInt(localStorage.getItem('empresa'))).subscribe(res => {
      this.empresa = res;
    });
  }

  texto_color_cargo: string = '';
  texto_color_numero: string = '';
  texto_color_proceso: string = '';
  texto_color_salario: string = '';
  texto_color_empresa: string = '';
  datosPedido: any = [];
  procesoPropuesto: any = [];
  procesoActual: any = [];
  empleado_1: any = [];
  empleado_2: any = [];
  empleado_3: any = [];

  buscarProcesos: any = [];
  empleadoProcesos: any = [];
  idCargo: any = [];
  contador: number = 0;
  MostrarInformacion(id: number) {
    this.texto_color_cargo = 'white';
    this.texto_color_numero = 'white';
    this.texto_color_proceso = 'white';
    this.texto_color_salario = 'white';
    this.texto_color_empresa = 'white';
    this.texto_color_proceso_actual = 'black';
    this.datosPedido = [];
    this.empleado_1 = [];
    this.empleado_2 = [];
    this.empleado_3 = [];
    this.procesoPropuesto = [];
    this.procesoActual = [];
    this.buscarProcesos = [];
    this.empleadoProcesos = [];
    this.idCargo = [];
    this.contador = 0;
    this.restAccion.BuscarDatosPedidoId(id).subscribe(data => {
      this.datosPedido = data;
      console.log('data pedido', this.datosPedido)
      this.BuscarPedidoEmpleado(this.datosPedido);
    });
  }

  /** MÉTODO PARA MOSTRAR DATOS DE LOS EMPLEADOS SELECCIONADOS EN EL PEDIDO */
  BuscarPedidoEmpleado(pedido: any) {
    this.restAccion.BuscarDatosPedidoEmpleados(pedido[0].id_empleado).subscribe(datos1 => {
      this.empleado_1 = datos1;
      this.ListarProcesosEmpleado(pedido);
    })
  }

  /** MÉTODO PARA MOSTRAR LA INFORMACIÓN DE LOS PROCESOS DEL EMPLEADO */
  ListarProcesosEmpleado(pedido: any) {
    this.restCargo.BuscarIDCargo(pedido[0].id_empleado).subscribe(datos => {
      this.idCargo = datos;
      var contar = 0;
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        contar = contar + 1;
        this.BuscarProcesosCargo(this.idCargo, i, contar);
      }
    });
  }

  /** MÉTODO PARA BUSCAR PROCESOS QUE TIENE EL EMPLEADO DE ACUERDO AL CARGO */
  BuscarProcesosCargo(id_cargo: any, valor: any, contar: any) {
    this.restEmpleadoProcesos.ObtenerProcesoPorIdCargo(id_cargo[valor]['id']).subscribe(datos => {
      this.buscarProcesos = datos;
      if (this.buscarProcesos.length != 0) {
        if (this.contador === 0) {
          this.empleadoProcesos = datos
          this.contador++;
        }
        else {
          this.empleadoProcesos = this.empleadoProcesos.concat(datos);
        }
      }
      if (contar === this.idCargo.length) {
        this.restAccion.Buscarprocesos(this.empleadoProcesos[this.empleadoProcesos.length - 1].id).subscribe(proc_a => {
          this.procesoActual = proc_a;
          this.EscribirProcesosActuales(this.procesoActual);
          this.BusquedaInformacion();
        });
      }
    }, error => {
      if (contar === this.idCargo.length) {
        if (this.empleadoProcesos.length === 0) {
          this.EscribirProcesosActuales_Vacios();
          this.BusquedaInformacion();
          this.toastr.info('El reporte no refleja informácion de procesos actuales del colaborador seleccionado.', 'Cargar la información respectiva.', {
            timeOut: 6000,
          })
        }
      }
    });
  }

  /** MÉTODO PARA BUSCAR INFORMACIÓN DE LOS EMPLEADOS RESPONSABLES / FIRMAS */
  BusquedaInformacion() {
    this.restAccion.BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].firma_empl_uno)).subscribe(data2 => {
      this.empleado_2 = data2;
      this.restAccion.BuscarDatosPedidoEmpleados(parseInt(this.datosPedido[0].firma_empl_dos)).subscribe(data3 => {
        this.empleado_3 = data3;
        this.VerificarDatos();
      });
    });
  }

  /** MÉTODO PARA VERIFICAR DATOS INGRESADO Y NO INGRESADO */
  VerificarDatos() {
    if (this.datosPedido[0].proceso_propuesto === null && this.datosPedido[0].cargo_propuesto === null) {
      this.DefinirColor(this.datosPedido, '');
      this.generarPdf('download');
    }
    else if (this.datosPedido[0].proceso_propuesto != null && this.datosPedido[0].cargo_propuesto != null) {
      this.restAccion.Buscarprocesos(this.datosPedido[0].proceso_propuesto).subscribe(proc1 => {
        this.procesoPropuesto = proc1;
        this.EscribirProcesosPropuestos(this.procesoPropuesto);
        this.restAccion.ConsultarUnCargoPropuesto(this.datosPedido[0].cargo_propuesto).subscribe(carg => {
          this.DefinirColor(this.datosPedido, carg[0].descripcion.toUpperCase())
          this.generarPdf('download');
        })
      });
    }
    else if (this.datosPedido[0].proceso_propuesto != null && this.datosPedido[0].cargo_propuesto === null) {
      this.restAccion.Buscarprocesos(this.datosPedido[0].proceso_propuesto).subscribe(proc => {
        this.procesoPropuesto = proc;
        this.EscribirProcesosPropuestos(this.procesoPropuesto);
        this.DefinirColor(this.datosPedido, '')
        this.generarPdf('download');
      });
    }
    else if (this.datosPedido[0].proceso_propuesto === null && this.datosPedido[0].cargo_propuesto != null) {
      this.restAccion.ConsultarUnCargoPropuesto(this.datosPedido[0].cargo_propuesto).subscribe(carg => {
        this.DefinirColor(this.datosPedido, carg[0].descripcion.toUpperCase())
        this.generarPdf('download');
      })
    }
  }

  /** MÉTODO PARA DEFINIR COLORES DE TEXTO / IMPRIMIR ESPACIOS */
  cargo_propuesto: string = '';
  proceso_propuesto: string = '';
  salario_propuesto: string = '';
  num_partida: string = '';
  DefinirColor(array: any, nombre_cargo: any) {
    this.cargo_propuesto = '';
    this.proceso_propuesto = '';
    this.salario_propuesto = '';
    this.num_partida = '';
    if (array[0].cargo_propuesto != '' && array[0].cargo_propuesto != null) {
      this.texto_color_cargo = 'black';
      this.cargo_propuesto = nombre_cargo;
    }
    else {
      this.cargo_propuesto = '----------';
    }
    if (array[0].proceso_propuesto != '' && array[0].proceso_propuesto != null) {
      this.texto_color_empresa = 'black';
      this.texto_color_proceso = 'black';
    }
    else {
      this.proceso_padre_p = '----------';
      this.nombre_procesos_p = '----------';
    }
    if (array[0].salario_propuesto != '' && array[0].salario_propuesto != null) {
      this.texto_color_salario = 'black';
    }
    else {
      this.salario_propuesto = '----------';
    }
  }

  /** MÉTODO PARA REALIZAR BÚSQUEDA DE PROCESOS QUE TIENEN REGISTRADOS EL EMPLEADO */
  nombre_procesos_a: string = '';
  proceso_padre_a: string = '';
  EscribirProcesosActuales(array) {
    this.nombre_procesos_a = '';
    this.proceso_padre_a = '';
    array.map(obj => {
      if (this.proceso_padre_a != '') {
        this.nombre_procesos_a = this.nombre_procesos_a + '\n' + obj.nombre;
      }
      else {
        this.proceso_padre_a = obj.nombre;
      }
    })
  }

  /** M+ETODO PARA IMPRIMIR ESPACIOS CUANDO EL EMPLEADO NO REGISTRA PROCESOS */
  texto_color_proceso_actual: string = '';
  EscribirProcesosActuales_Vacios() {
    this.proceso_padre_a = '';
    this.proceso_padre_a = '-------------';
    this.texto_color_proceso_actual = 'white';
  }

  /** MÉTODO PARA IMPRIMIR PROCESOS PROPUESTOS */
  nombre_procesos_p: string = '';
  proceso_padre_p: string = '';
  EscribirProcesosPropuestos(array) {
    this.nombre_procesos_p = '';
    this.proceso_padre_p = '';
    array.map(obj => {
      if (this.proceso_padre_p != '') {
        this.nombre_procesos_p = this.nombre_procesos_p + '\n' + obj.nombre;
      }
      else {
        this.proceso_padre_p = obj.nombre;
      }
    })
  }

  /* ****************************************************************************************************
   *                               PARA LA EXPORTACIÓN DE ARCHIVOS PDF
   * ****************************************************************************************************/

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
    return {
      // ENCABEZADO DE LA PÁGINA
      pageMargins: [10, 40, 10, 40],
      content: [

        this.PresentarHoja1_Parte_1(),
        this.PresentarHoja1_Parte_2(),
        this.PresentarHoja1_Parte_3(),
        this.PresentarHoja1_Parte_4(),
        this.PresentarHoja1_Parte_5(),
        this.PresentarHoja1_Parte_6(),
        this.PresentarHoja1_Parte_7(),
        this.PresentarHoja1_Parte_8(),
        this.PresentarHoja1_Parte_8_1(),
        this.PresentarHoja1_Parte_9(),
        this.PresentarHoja1_Parte_10(),
        this.PresentarHoja1_Parte_11_1(),
        this.PresentarHoja1_Parte_11_2(),
        this.PresentarHoja1_Parte_12(),
        this.PresentarHoja1_Parte_13_1(),
        this.PresentarHoja1_Parte_13_2(),
        { text: '', pageBreak: 'before', style: 'subheader' },
        this.PresentarHoja2_Parte_1(),
        this.PresentarHoja2_Parte_2(),
        this.PresentarHoja2_Parte_3_1(),
        this.PresentarHoja2_Parte_3_2(),
        this.PresentarHoja2_Parte_3_3(),
        this.PresentarHoja2_Parte_3_4(),
        this.PresentarHoja2_Parte_3_5(),
        this.PresentarHoja2_Parte_4_1(),
        this.PresentarHoja2_Parte_4_2(),
        this.PresentarHoja2_Parte_4_3(),
        this.PresentarHoja2_Parte_4_4(),
        this.PresentarHoja2_Parte_4_5(),
        this.PresentarHoja2_Parte_4_6(),
      ],
      styles: {
        itemsTable: { fontSize: 8 },
        itemsTable_c: { fontSize: 9 },
        itemsTable_d: { fontSize: 9, alignment: 'right' }
      }
    };
  }

  PresentarHoja1_Parte_1() {
    return {
      table: {
        widths: [280, 'auto', '*'],
        heights: [40],

        body: [
          [
            {
              border: [true, true, true, false],
              margin: [70, 10, 0, 0],
              image: this.logo,
              width: 100,
            },
            {
              border: [false, true, true, false],
              text: [
                { text: '---------------', style: 'itemsTable', color: 'white' },
              ]
            },
            {
              border: [false, true, true, false],
              table: {
                body: [
                  [{ text: 'ACCIÓN DE PERSONAL', style: 'itemsTable_c', margin: [65, 0, 0, 0] }],
                  [{
                    text: [{ text: 'N° ', style: 'itemsTable_c' },
                    { text: '------------', color: 'white', style: 'itemsTable' },
                    { text: this.datosPedido[0].identi_accion_p, style: 'itemsTable_c' }], margin: [40, 5, 0, 0]
                  }],
                  [{
                    text: [{ text: 'Fecha: ', style: 'itemsTable_c' },
                    { text: '---------', color: 'white', style: 'itemsTable' },
                    { text: moment(this.datosPedido[0].fec_rige_desde).format('DD MMMM YYYY'), style: 'itemsTable_c' }], margin: [32, 0, 0, 0]
                  }],
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_2() {
    return {
      table: {
        widths: ['*'],
        heights: [20],
        body: [
          [
            {
              border: [true, true, true, false],
              table: {
                body: [
                  [{
                    text: [{ text: 'DECRETO: ', style: 'itemsTable_c' },
                    { text: '----------------------------------------------------', color: 'white', style: 'itemsTable' },
                    { text: 'ACUERDO:', style: 'itemsTable_c' },
                    { text: '----------------------------------------------------', color: 'white', style: 'itemsTable' },
                    { text: 'RESOLUCIÓN:', style: 'itemsTable_c' }], margin: [85, 6, 0, 0]
                  }],
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_3() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [20],
        body: [
          [
            {
              border: [true, false, false, true],
              margin: [90, 4, 0, 0],
              text: [
                { text: 'No.', style: 'itemsTable_c' },
              ]
            },
            {
              border: [false, false, false, true],
              margin: [0, 0, 0, 0],
              table: {
                body: [
                  [{ text: '-------------------------------', color: 'white' }],
                  [{ text: '-------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'
            },
            {
              border: [false, false, false, true],
              margin: [0, 4, 0, 0],
              text: [
                { text: 'FECHA:', style: 'itemsTable_c' },
              ]
            },
            {
              border: [false, false, true, true],
              margin: [0, 0, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------', color: 'white' }],
                  [{ text: '------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_4() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [30],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{ text: this.empleado_1[0].apellido.toUpperCase(), style: 'itemsTable_c', margin: [0, 6, 0, 0] }],
                  [{ text: 'APELLIDO', style: 'itemsTable_c', margin: [110, 0, 0, 0] }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{ text: this.empleado_1[0].nombre.toUpperCase(), style: 'itemsTable_c', margin: [0, 6, 0, 0] }],
                  [{ text: 'NOMBRE', style: 'itemsTable_c', margin: [110, 0, 0, 0] }]
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_5() {
    return {
      table: {
        widths: ['*', '*', '*'],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'No. de Cédula de Ciudadanía', style: 'itemsTable_c' },
                    { text: '-----', color: 'white', style: 'itemsTable' }], margin: [40, 0, 0, 0]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'No. de Afilicación IESS', style: 'itemsTable_c' },
                    { text: '--------', color: 'white', style: 'itemsTable' }], margin: [40, 0, 0, 0]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{ text: 'Rige a partir de:', style: 'itemsTable_c', margin: [40, 0, 0, 0] }],
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_6() {
    return {
      table: {
        widths: ['*', '*', '*'],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: this.empleado_1[0].cedula, style: 'itemsTable_c' }], margin: [130, 0, 0, 0],
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: '', style: 'itemsTable_c' }]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{ text: moment(this.datosPedido[0].fec_rige_desde).format('dddd DD MMMM YYYY'), style: 'itemsTable_c' }],
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_7() {
    return {
      table: {
        widths: ['*'],
        heights: [15],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'EXPLICACIÓN: (Opcional: adjuntar Anexo)', style: 'itemsTable_c' }]
                  }]
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_8() {
    return {
      table: {
        widths: ['*'],
        heights: [40],

        body: [
          [
            {
              border: [true, false, true, false],
              table: {
                body: [
                  [{
                    text: [{ text: 'BASE LEGAL: ', style: 'itemsTable_c' },
                    { text: this.datosPedido[0].base_legal, style: 'itemsTable' }]
                  }]
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_8_1() {
    return {
      table: {
        widths: ['*'],
        heights: [20],

        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: this.datosPedido[0].adicion_legal, style: 'itemsTable' }]
                  }]
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_9() {
    return {
      table: {
        widths: ['*', '*', '*', '*'],
        heights: [10],

        body: [
          [
            {
              border: [true, false, false, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'INGRESO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'NOMBRAMIENTO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'ASCENSO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'SUBROGACIÓN:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'ENCARGO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'VACACIONES:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'TRASLADO:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'TRASPASO:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'CAMBIO ADMINISTRATIVO:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'INTERCAMBIO:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'COMISIÓN DE SERVICIOS:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'LICENCIA:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, false, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'REVALORIZACIÓN:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'RECLASIFICACIÓN:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'UBICACIÓN:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'REINTEGRO:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'REINSTITUCIONAL:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'RENUNCIA:', style: 'itemsTable' }], margin: [10, 0, 0, 0]
                  }]
                ]
              },
              layout: 'noBorders'
            },
            {
              border: [false, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'SUPRESIÓN:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'DESTITUCIÓN:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'REMOCIÓN:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    text: [{ text: 'JUBILACIÓN:', style: 'itemsTable' }], margin: [5, 0, 0, 0]
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'OTRO:', style: 'itemsTable' }]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            table: {
                              margin: [10, -20, 0, 0],
                              body: [
                                [{ text: '---------------------', color: 'white', style: 'itemsTable' }],
                                [{ text: '---------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],
                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                ]
              },
              layout: 'noBorders'
            }
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_10() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'SITUACIÓN ACTUAL', style: 'itemsTable_c' }], margin: [110, 0, 0, 0]
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'PROCESO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [15, 0, 0, 0],
                            table: {
                              body: [
                                [{ text: this.proceso_padre_a, style: 'itemsTable', color: this.texto_color_proceso_actual }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],

                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: '-----------', color: 'white', style: 'itemsTable' }]
                                }],
                                [{
                                  text: [{ text: 'SUBPROCESO:', style: 'itemsTable' }], margin: [15, -25, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],

                            table: {
                              body: [
                                [{ text: '\n' + this.nombre_procesos_a, style: 'itemsTable', margin: [0, -30, 0, 0] }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'PUESTO:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [19, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.empleado_1[0].cargo.toUpperCase(), style: 'itemsTable', }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'LUGAR DE TRABAJO:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [0, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.empresa[0].nombre.toUpperCase(), style: 'itemsTable', }],
                                [{ text: '--------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'REMUNERACIÓN MENSUAL:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [0, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.empleado_1[0].sueldo, style: 'itemsTable', }],
                                [{ text: '---------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    text: [{ text: 'PARTIDA PRESUPUESTARIA: ' + '  ' + this.datosPedido[0].tipo.toUpperCase() + '\n' + this.datosPedido[0].num_partida, style: 'itemsTable' }], margin: [20, -12, 0, 0]
                  }],

                ]
              },
              layout: 'noBorders'
            },
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'SITUACIÓN PROPUESTA', style: 'itemsTable_c' }], margin: [110, 0, 0, 0]
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'PROCESO:', style: 'itemsTable' }], margin: [15, 0, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [15, 0, 0, 0],
                            table: {
                              body: [
                                [{ text: this.proceso_padre_p, style: 'itemsTable', color: this.texto_color_proceso }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],

                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: '-----------', color: 'white', style: 'itemsTable' }]
                                }],
                                [{
                                  text: [{ text: 'SUBPROCESO:', style: 'itemsTable' }], margin: [15, -25, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],

                            table: {
                              body: [
                                [{ text: '\n' + this.nombre_procesos_p, style: 'itemsTable', margin: [0, -30, 0, 0], color: this.texto_color_proceso }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],

                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'PUESTO:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [19, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.cargo_propuesto, style: 'itemsTable', color: this.texto_color_cargo }],
                                [{ text: '-------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'LUGAR DE TRABAJO:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [0, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.empresa[0].nombre.toUpperCase(), style: 'itemsTable', color: this.texto_color_empresa }],
                                [{ text: '--------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    table: {
                      widths: ['auto', '*'],
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              body: [
                                [{
                                  text: [{ text: 'REMUNERACIÓN MENSUAL:', style: 'itemsTable' }], margin: [15, -18, 0, 0]
                                }]
                              ]
                            },
                            layout: 'noBorders'
                          },
                          {
                            border: [false, false, false, false],
                            margin: [0, -18, 0, 0],
                            table: {
                              body: [
                                [{ text: this.salario_propuesto, style: 'itemsTable', color: this.texto_color_salario }],
                                [{ text: '---------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                              ]
                            },
                            layout: 'lightHorizontalLines'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }],
                  [{
                    text: [{ text: 'PARTIDA PRESUPUESTARIA: ' + '\n' + this.datosPedido[0].num_partida_propuesta, style: 'itemsTable' }], margin: [20, -12, 0, 0]
                  }],
                ]
              },
              layout: 'noBorders'
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_11_1() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: 'ACTA FINAL DEL CONCURSO', style: 'itemsTable_c' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: 'PROCESO DE RECURSOS HUMANOS', style: 'itemsTable_c' },
              ]
            }
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_11_2() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [15],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ['auto', '*', 'auto', '*'],
                heights: [20],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [
                        { text: 'No.', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [{ text: '-------------------------------', color: 'white', style: 'itemsTable' }],
                          [{ text: '-------------------------------', color: 'white', style: 'itemsTable' }],

                        ]
                      },
                      layout: 'lightHorizontalLines'
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, 0, 0, 0],
                      text: [
                        { text: 'FECHA:', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, true, true],
                      margin: [0, -5, 0, 0],
                      table: {

                        body: [
                          [{ text: '------------------------------', color: 'white', style: 'itemsTable' }],
                          [{ text: '------------------------------', color: 'white', style: 'itemsTable' }],
                        ]
                      },
                      layout: 'lightHorizontalLines'
                    },
                  ],
                ],
              },
              layout: 'noBorders'
            },
            {
              border: [true, false, true, true],
              table: {
                widths: ['auto', '*'],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [
                        { text: 'f.', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -8, 0, 0],
                      table: {
                        body: [
                          [{ text: '------------------------------------------------------------------------', color: 'white' }],
                          [{ text: this.datosPedido[0].abrev_empl_uno.toUpperCase() + ' ' + this.empleado_2[0].nombre.toUpperCase() + ' ' + this.empleado_2[0].apellido.toUpperCase() + '\n' + this.empleado_2[0].cargo.toUpperCase() + '\n' + this.empleado_2[0].departamento.toUpperCase(), style: 'itemsTable', alignment: 'center' }],

                        ]
                      },
                      layout: 'lightHorizontalLines'

                    },
                  ],
                ],
              },
              layout: 'noBorders'
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja1_Parte_12() {
    return {
      table: {
        widths: ['*'],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                body: [
                  [{
                    text: [{ text: 'DIOS, PATRIA Y LIBERTAD', style: 'itemsTable_c' }], margin: [235, 0, 0, 0]
                  }],
                  [{
                    table: {
                      body: [
                        [
                          {
                            border: [false, false, false, false],
                            table: {
                              widths: ['auto', '*'],
                              body: [
                                [
                                  {
                                    border: [false, false, false, false],
                                    margin: [150, -5, 0, 0],
                                    text: [
                                      { text: 'f.', style: 'itemsTable' },
                                    ]
                                  },
                                  {
                                    border: [false, false, false, false],
                                    margin: [0, -10, 0, 0],
                                    table: {
                                      body: [
                                        [{ text: '------------------------------------------------------------------------', color: 'white' }],
                                        [{ text: this.datosPedido[0].abrev_empl_dos.toUpperCase() + ' ' + this.empleado_3[0].nombre.toUpperCase() + ' ' + this.empleado_3[0].apellido.toUpperCase() + '\n' + this.empleado_3[0].cargo.toUpperCase() + '\n' + this.empleado_3[0].departamento.toUpperCase(), style: 'itemsTable', alignment: 'center' }],

                                      ]
                                    },
                                    layout: 'lightHorizontalLines'

                                  },
                                ],
                              ],
                            },
                            layout: 'noBorders'
                          },
                        ],
                      ],

                    },
                    layout: {
                      defaultBorder: false,
                    }
                  }]
                ]
              },
              layout: 'noBorders'
            },

          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }


  PresentarHoja1_Parte_13_1() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [10],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: 'RECURSOS HUMANOS', style: 'itemsTable_c' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [90, 0, 0, 0],
              text: [
                { text: 'REGISTRO Y CONTROL', style: 'itemsTable_c' },
              ]
            }
          ],
        ],
      },
    };
  }

  PresentarHoja1_Parte_13_2() {
    return {
      table: {
        widths: ['*', '*'],
        heights: [15],
        body: [
          [
            {
              border: [true, false, true, true],
              table: {
                widths: ['auto', '*', 'auto', '*'],
                heights: [20],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, 0, 0, 0],
                      text: [
                        { text: 'No.', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -5, 0, 0],
                      table: {
                        body: [
                          [{ text: this.datosPedido[0].identi_accion_p, style: 'itemsTable' }],
                          [{ text: '-------------------------------', color: 'white', style: 'itemsTable' }],

                        ]
                      },
                      layout: 'lightHorizontalLines'
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, 0, 0, 0],
                      text: [
                        { text: 'FECHA:', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, true, true],
                      margin: [0, -5, 0, 0],
                      table: {

                        body: [
                          [{ text: moment(this.datosPedido[0].fec_rige_desde).format('DD MMMM YYYY'), style: 'itemsTable' }],
                          [{ text: '------------------------------', color: 'white', style: 'itemsTable' }],
                        ]
                      },
                      layout: 'lightHorizontalLines'
                    },
                  ],
                ],
              },
              layout: 'noBorders'
            },
            {
              border: [true, false, true, true],
              table: {
                widths: ['auto', '*'],
                body: [
                  [
                    {
                      border: [true, false, false, true],
                      margin: [15, -5, 0, 0],
                      text: [
                        { text: 'f.', style: 'itemsTable' },
                      ]
                    },
                    {
                      border: [false, false, false, true],
                      margin: [0, -8, 0, 0],
                      table: {
                        body: [
                          [{ text: '---------------------------------------------------------------------------------------', color: 'white', style: 'itemsTable' }],
                          [{ text: 'Nombre:', style: 'itemsTable' }],
                        ]
                      },
                      layout: 'lightHorizontalLines'

                    },
                  ],
                ],
              },
              layout: 'noBorders'
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }


  PresentarHoja2_Parte_1() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [75.5],
        body: [
          [
            {
              border: [true, true, false, true],
              margin: [19, 20, 0, 0],
              text: [
                { text: 'CAUCIÓN REGISTRADA CON No.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, true, false, true],
              margin: [12, 15, 0, 0],
              table: {
                body: [
                  [{ text: '--------------------------------------------', color: 'white' }],
                  [{ text: '--------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'
            },
            {
              border: [false, true, false, true],
              margin: [19, 20, 0, 0],
              text: [
                { text: 'FECHA:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, true, true, true],
              margin: [12, 15, 0, 0],
              table: {

                body: [
                  [{ text: '--------------------------------------------', color: 'white' }],
                  [{ text: '--------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_2() {
    return {
      table: {
        widths: [565.28],
        heights: [45.3],
        body: [
          [
            {
              border: [true, false, true, true],
              text: ''
            }
          ]
        ],
      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  //241.6
  PresentarHoja2_Parte_3_1() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, 30, 0, 0],
              text: [
                { text: 'LA PERSONA REEMPLAZA A:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, false],
              margin: [8, 25, 0, 0],
              table: {

                body: [
                  [{ text: '--------------------------------------------', color: 'white' }],
                  [{ text: '--------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, false],
              margin: [0, 30, 0, 0],
              text: [
                { text: 'EN EL PUESTO DE:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [8, 25, 0, 0],
              table: {

                body: [
                  [{ text: '--------------------------------------------', color: 'white' }],
                  [{ text: '--------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja2_Parte_3_2() {
    return {
      table: {
        widths: ['auto', '*'],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -15, 0, 0],
              text: [
                { text: 'QUIEN CESO EN FUNCIONES POR:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [0, -21, 0, 0],
              table: {

                body: [
                  [{ text: '-----------------------------------------------------------------------------------------------------------------------', color: 'white' }],
                  [{ text: '-----------------------------------------------------------------------------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja2_Parte_3_3() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -35, 0, 0],
              text: [
                { text: 'ACCIÓN DE PERSONAL REGISTRADA CON No.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, false],
              margin: [0, -40, 0, 0],
              table: {

                body: [
                  [{ text: '----------------------------------------------', color: 'white' }],
                  [{ text: '----------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, false],
              margin: [0, -35, 0, 0],
              text: [
                { text: 'FECHA:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [0, -40, 0, 0],
              table: {

                body: [
                  [{ text: '-------------------------------------------', color: 'white' }],
                  [{ text: '-------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja2_Parte_3_4() {
    return {
      table: {
        widths: ['auto', '*'],
        heights: [60.8],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -15, 0, 0],
              text: [
                { text: 'AFILIACIÓN AL COLEGIO DE PROFESIONALES DE:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [0, -21, 0, 0],
              table: {

                body: [
                  [{ text: '-------------------------------------------------------------------------------------------------------', color: 'white' }],
                  [{ text: '-------------------------------------------------------------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'
            }
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja2_Parte_3_5() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [50.8],
        body: [
          [
            {
              border: [true, false, false, true],
              margin: [19, -5, 0, 0],
              text: [
                { text: 'No.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, true],
              margin: [12, -12, 0, 0],
              table: {

                body: [
                  [{ text: '-----------------------------------------------------------', color: 'white' }],
                  [{ text: '-----------------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, true],
              margin: [19, -5, 0, 0],
              text: [
                { text: 'FECHA:', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, true],
              margin: [12, -12, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],
      },
    };
  }


  //392.6
  PresentarHoja2_Parte_4_1() {
    return {
      table: {
        widths: ['*'],
        heights: [40],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [19, 30, 0, 0],
              text: [
                { text: 'POSESIÓN DEL CARGO', style: 'itemsTable' },
              ]
            },
          ]
        ],
      },

    };
  }

  PresentarHoja2_Parte_4_2() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [40],

        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, 30, 0, 0],
              text: [
                { text: 'YO', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, false],
              margin: [8, 25, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------', color: 'white' }],
                  [{ text: '------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, false],
              margin: [0, 30, 0, 0],
              text: [
                { text: 'CON CÉDULA DE CIUDADANÍA No.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [8, 25, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------', color: 'white' }],
                  [{ text: '------------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  PresentarHoja2_Parte_4_3() {
    return {
      table: {
        widths: ['*'],
        heights: [40],
        body: [
          [
            {
              border: [true, false, true, false],
              margin: [19, -12, 0, 0],
              text: [
                { text: 'JURO LEALTAD AL ESTADO ECUATORIANO.', style: 'itemsTable' },
              ]
            },
          ]
        ],
      },

    };
  }

  PresentarHoja2_Parte_4_4() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [40],
        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -20, 0, 0],
              text: [
                { text: 'LUGAR.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, false],
              margin: [12, -25, 0, 0],
              table: {

                body: [
                  [{ text: '-----------------------------------------------------------', color: 'white' }],
                  [{ text: '-----------------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, false],
              margin: [19, -20, 0, 0],
              text: [
                { text: '-----', style: 'itemsTable', color: 'white' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [12, -25, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'noBorders'
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_5() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [40],
        body: [
          [
            {
              border: [true, false, false, false],
              margin: [19, -30, 0, 0],
              text: [
                { text: 'FECHA.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, false],
              margin: [12, -36, 0, 0],
              table: {

                body: [
                  [{ text: '-----------------------------------------------------------', color: 'white' }],
                  [{ text: '-----------------------------------------------------------', color: 'white' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, false],
              margin: [19, -30, 0, 0],
              text: [
                { text: '-----', style: 'itemsTable', color: 'white' },
              ]
            },
            {
              border: [false, false, true, false],
              margin: [12, -36, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                  [{ text: '------------------------------------------------------------', color: 'white' }],
                ]
              },
              layout: 'noBorders'
            },
          ],
        ],
      },
    };
  }

  PresentarHoja2_Parte_4_6() {
    return {
      table: {
        widths: ['auto', '*', 'auto', '*'],
        heights: [86.3],

        body: [
          [
            {
              border: [true, false, false, true],
              margin: [35, 30, 0, 0],
              text: [
                { text: 'f.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, false, true],
              margin: [0, 18, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------', color: 'white' }],
                  [{ text: 'Funcionario', style: 'itemsTable', alignment: 'center' }],

                ]
              },
              layout: 'lightHorizontalLines'

            },
            {
              border: [false, false, false, true],
              margin: [0, 30, 0, 0],
              text: [
                { text: 'f.', style: 'itemsTable' },
              ]
            },
            {
              border: [false, false, true, true],
              margin: [0, 18, 0, 0],
              table: {

                body: [
                  [{ text: '------------------------------------------------', color: 'white' }],
                  [{ text: 'Responsable de Recursos Humanos', style: 'itemsTable', alignment: 'center' }],
                ]
              },
              layout: 'lightHorizontalLines'
            },
          ],
        ],

      },
      layout: {
        defaultBorder: false,
      }
    };
  }

  LimpiarCampos() {
    this.codigo.reset();
    this.cedula.reset();
    this.nombre.reset();
    this.apellido.reset();
  }


  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    //Se define todo el abecedario que se va a usar.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    //Es la validación del KeyCodes, que teclas recibe el campo de texto.
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
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
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
