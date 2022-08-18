// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';
import { Router } from '@angular/router';
import { number } from 'echarts/core';

@Component({
  selector: 'app-horarios-multiples',
  templateUrl: './horarios-multiples.component.html',
  styleUrls: ['./horarios-multiples.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class HorariosMultiplesComponent implements OnInit {

  // OPCIONES DE DÍAS LIBRERIAS EN HORARIOS
  miercoles = false;
  domingo = false;
  viernes = false;
  martes = false;
  jueves = false;
  sabado = false;
  lunes = false;

  horarios: any = []; // VARIABLE DE ALMACENAMIENTO DE HORARIOS

  // CAMPOS DE FORMULARIO
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', Validators.required);
  horarioF = new FormControl('', Validators.required);
  miercolesF = new FormControl('');
  viernesF = new FormControl('');
  domingoF = new FormControl('');
  martesF = new FormControl('');
  juevesF = new FormControl('');
  sabadoF = new FormControl('');
  lunesF = new FormControl('');

  // ASIGNACIÓN DE VALIDACIONES A INPUTS DEL FORMULARIO
  public EmpleadoHorarioForm = new FormGroup({
    fechaInicioForm: this.fechaInicioF,
    fechaFinalForm: this.fechaFinalF,
    miercolesForm: this.miercolesF,
    horarioForm: this.horarioF,
    viernesForm: this.viernesF,
    domingoForm: this.domingoF,
    martesForm: this.martesF,
    juevesForm: this.juevesF,
    sabadoForm: this.sabadoF,
    lunesForm: this.lunesF,
  });

  constructor(
    public router: Router, // VARIABLE USADA PARA NAVEGACIÓN ENTRE PÁGINAS
    public restH: HorarioService, // SERVCIOS DE HORARIOS
    public restE: EmpleadoService, // SERVICIOS DE DATOS DE EMPLEADOS
    private toastr: ToastrService, // VARIABLE USADA PARA MOSTRAR NOTIFICACIONES
    public restP: PlanGeneralService, // SERVICIO DE DATOS DE PLANIFICACIÓN DE HORARIOS
    public rest: EmpleadoHorariosService, // SERVICIO DE DATOS DE HORARIOS ASIGNADOS A UN EMPLEADO
    public restD: DetalleCatHorariosService, // SERVICIO DE DATOS DE DETALLES DE HORARIOS
    @Inject(MAT_DIALOG_DATA) public data: any, // IMPORTACIÓN DE DATOS DE COMPONENTE HORARIOS-MULTIPLE-EMPLEADO
    public ventana: MatDialogRef<HorariosMultiplesComponent>, // VARIABLE USADA PARA ABRIR VENTANAS EXTERNAS
  ) { }

  ngOnInit(): void {
    console.log('varios', this.data.datos)
    this.BuscarHorarios();
  }

  // VARIABLES DE ALMACENAMIENTO DE DATOS ESPECIFICOS DE UN HORARIO
  detalles_horarios: any = [];
  vista_horarios: any = [];
  hora_entrada: any;
  hora_salida: any;

  // MÉTODO PARA MOSTRAR NOMBRE DE HORARIO CON DETALLE DE ENTRADA Y SALIDA
  BuscarHorarios() {
    this.horarios = [];
    this.vista_horarios = [];
    // BÚSQUEDA DE HORARIOS
    this.restH.getHorariosRest().subscribe(datos => {
      this.horarios = datos;
      this.horarios.map(hor => {
        // BÚSQUEDA DE DETALLES DE ACUERDO AL ID DE HORARIO
        this.restD.ConsultarUnDetalleHorario(hor.id).subscribe(res => {
          this.detalles_horarios = res;
          this.detalles_horarios.map(det => {
            if (det.tipo_accion === 'E') {
              this.hora_entrada = det.hora.slice(0, 5)
            }
            if (det.tipo_accion === 'S') {
              this.hora_salida = det.hora.slice(0, 5)
            }
          })
          let datos_horario = [{
            id: hor.id,
            nombre: '(' + this.hora_entrada + '-' + this.hora_salida + ') ' + hor.nombre
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        }, error => {
          let datos_horario = [{
            id: hor.id,
            nombre: hor.nombre
          }]
          if (this.vista_horarios.length === 0) {
            this.vista_horarios = datos_horario;
          } else {
            this.vista_horarios = this.vista_horarios.concat(datos_horario);
          }
        })
      })
    })
  }

  // MÉTODO PARA VERIFICAR QUE CAMPOS DE FECHAS NO SE ENCUENTREN VACIOS
  VerificarIngresoFechas(form) {
    if (form.fechaInicioForm === '' || form.fechaInicioForm === null || form.fechaInicioForm === undefined ||
      form.fechaFinalForm === '' || form.fechaFinalForm === null || form.fechaFinalForm === undefined) {
      this.toastr.warning('Por favor ingrese fechas de inicio y fin de actividades.', '', {
        timeOut: 6000,
      });
      this.EmpleadoHorarioForm.patchValue({
        horarioForm: 0
      })
    }
    else {
      this.ValidarFechas(form);
    }
  }

  // MÉTODO PARA VERIFICAR SI EL EMPLEADO INGRESO CORRECTAMENTE LAS FECHAS
  ValidarFechas(form) {
    if (Date.parse(form.fechaInicioForm) < Date.parse(form.fechaFinalForm)) {
      this.VerificarFormatoHoras(form);
    }
    else {
      this.toastr.warning('Fecha de inicio de actividades debe ser mayor a la fecha fin de actividades.', '', {
        timeOut: 6000,
      });
      this.EmpleadoHorarioForm.patchValue({
        horarioForm: 0
      })
    }
  }

  // MÉTODO PARA VERIFICAR EL FORMATO DE HORAS DE UN HORARIO
  VerificarFormatoHoras(form) {
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    if (obj_res.detalle === true) {
      const { hora_trabajo, id } = obj_res;
      console.log('horario_horas', this.StringTimeToSegundosTime(hora_trabajo))
      // VERIFICACIÓN DE FORMATO CORRECTO DE HORARIOS
      if (!this.StringTimeToSegundosTime(hora_trabajo)) {
        this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
        this.toastr.warning('Formato de horas en horario seleccionado no son válidas.', 'Dar click para verificar registro de detalle de horario.', {
          timeOut: 6000,
        }).onTap.subscribe(obj => {
          this.ventana.close();
          this.router.navigate(['/verHorario', id]);
        });
      }
    }
  }

  // MÉTODO PARA LIMPIAR CAMPO SELECCIÓN DE HORARIO
  LimpiarHorario() {
    this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
  }

  MensajeAlerta() {
    this.toastr.warning('En la tabla podrá observar una lista de usuarios a los cuales no se logró asignar HORARIO.', 'Verificar la información.', {
      timeOut: 6000,
    })
  }
  // MÉTODO PARA VERIFICAR QUE LOS USUARIOS NO DUPLIQUEN SU ASIGNACIÓN DE HORARIO
  VerificarDuplicidad(form) {
    this.contador = 0;
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    let duplicados = [];
    let correctos = [];
    this.data.datos.map(dh => {
      // MÉTODO PARA BUSCAR DATOS DUPLICADOS DE HORARIOS
      this.rest.VerificarDuplicidadHorarios(dh.id, fechas).subscribe(response => {
        duplicados = duplicados.concat(dh);
        this.contador = this.contador + 1;
        if (this.contador === this.data.datos.length) {
          if (duplicados.length === this.data.datos.length) {
            this.MensajeAlerta();
            this.ventana.close(duplicados);
          }
          else {
            this.VerificarContrato(form, correctos, duplicados);
          }
        }
      }, error => {
        correctos = correctos.concat(dh);
        this.contador = this.contador + 1;
        if (this.contador === this.data.datos.length) {
          if (duplicados.length === this.data.datos.length) {
            this.MensajeAlerta();
            this.ventana.close(duplicados);
          }
          else {
            this.VerificarContrato(form, correctos, duplicados);
          }
        }
      });
    })
  }

  // MÉTODO PARA VERIFICAR FECHAS DE CONTRATO 
  cont2: number = 0;
  VerificarContrato(form, correctos, problemas) {
    this.cont2 = 0;
    let contrato = [];
    let sin_contrato = [];
    correctos.map(dh => {
      let datosBusqueda = {
        id_cargo: dh.id_cargo,
        id_empleado: dh.id
      }
      // MÉTODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
      this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
        // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
        if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaInicioForm)) {
          contrato = contrato.concat(dh);
          this.cont2 = this.cont2 + 1;
          if (this.cont2 === correctos.length) {
            if (sin_contrato.length === correctos.length) {
              this.MensajeAlerta();
              this.ventana.close(problemas);
            }
            else {
              this.ValidarHorarioByHorasTrabaja(form, contrato, problemas);
            }
          }
        }
        else {
          sin_contrato = sin_contrato.concat(dh);
          problemas = problemas.concat(dh);
          this.cont2 = this.cont2 + 1;
          if (this.cont2 === correctos.length) {
            if (sin_contrato.length === correctos.length) {
              this.MensajeAlerta();
              this.ventana.close(problemas);
            }
            else {
              this.ValidarHorarioByHorasTrabaja(form, contrato, problemas);
            }
          }
        }
      }, error => { });
    })
  }

  // MÉTODO PARA VALIDAR HORAS DE TRABAJO SEGÚN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  cont3: number = 0;
  ValidarHorarioByHorasTrabaja(form, correctos, problemas) {
    let horas_correctas = [];
    let horas_incorrectas = [];
    let seg: any;
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    const { hora_trabajo } = obj_res;
    if (obj_res.detalle === true) {
      console.log(correctos)
      correctos.map(dh => {
        seg = this.SegundosToStringTime(dh.hora_trabaja * 3600)

        // MÉTODO PARA LECTURA DE HORARIOS DE EMPLEADO
        this.horariosEmpleado = [];
        let fechas = {
          fechaInicio: form.fechaInicioForm,
          fechaFinal: form.fechaFinalForm,
        };
        this.rest.VerificarHorariosExistentes(dh.id, fechas).subscribe(existe => {

          this.cont3 = this.cont3 + 1;
          this.horariosEmpleado = existe;
          this.horariosEmpleado.map(h => {
            // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
            this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
          })
          // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
          this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');

          // MÉTODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          if (this.StringTimeToSegundosTime(this.sumHoras) === this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          } else if (this.StringTimeToSegundosTime(this.sumHoras) < this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
          else {
            horas_incorrectas = horas_incorrectas.concat(dh);
            problemas = problemas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
        }, error => {
          this.cont3 = this.cont3 + 1;
          // MÉTODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
          if (this.StringTimeToSegundosTime(hora_trabajo) === this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          } else if (this.StringTimeToSegundosTime(hora_trabajo) < this.StringTimeToSegundosTime(seg)) {
            horas_correctas = horas_correctas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
          else {
            horas_incorrectas = horas_incorrectas.concat(dh);
            problemas = problemas.concat(dh);
            if (this.cont3 === correctos.length) {
              if (horas_incorrectas.length === correctos.length) {
                this.MensajeAlerta();
                this.ventana.close(problemas);
              }
              else {
                this.InsertarEmpleadoHorario(form, horas_correctas, problemas);
              }
            }
          }
        });
      })
    }
    else {
      this.InsertarEmpleadoHorario(form, correctos, problemas);
    }
  }

  SegundosToStringTime(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;
    return h + ':' + m + ':' + s;
  }

  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // MÉTODO PARA INGRESAR DATOS DE HORARIO
  contador: number = 0;
  cont4: number = 0;
  InsertarEmpleadoHorario(form, correctos, problemas) {
    this.cont4 = 0;
    correctos.map(obj => {
      let datosempleH = {
        fec_inicio: form.fechaInicioForm,
        fec_final: form.fechaFinalForm,
        id_horarios: form.horarioForm,
        miercoles: form.miercolesForm,
        codigo: parseInt(obj.codigo),
        id_empl_cargo: obj.id_cargo,
        viernes: form.viernesForm,
        domingo: form.domingoForm,
        martes: form.martesForm,
        jueves: form.juevesForm,
        sabado: form.sabadoForm,
        lunes: form.lunesForm,
        id_hora: 0,
        estado: 1,
      };
      console.log(datosempleH);
      this.rest.IngresarEmpleadoHorarios(datosempleH).subscribe(response => {
        this.IngresarPlanGeneral(form, obj);
        this.cont4 = this.cont4 + 1;
        if (this.cont4 === correctos.length) {
          this.ventana.close(problemas);
          if (correctos.length === this.data.datos.length) {
            this.toastr.success('Operación Exitosa', 'Se asignó HORARIO a ' + correctos.length + ' colaboradores.', {
              timeOut: 6000,
            })
          }
          else {
            this.toastr.success('En la tabla podrá observar una lista de usuarios a los cuales no se logró asignar HORARIO.', 'Se asignó HORARIO a ' + correctos.length + ' colaboradores.', {
              timeOut: 6000,
            })
          }
        }
      });
    })
  }

  // MÉTODO PARA INGRESAR PLANIFICACIÓN GENERAL
  detalles: any = [];
  fechasHorario: any = [];
  inicioDate: any;
  finDate: any;
  IngresarPlanGeneral(form, dh) {
    this.detalles = [];
    this.restD.ConsultarUnDetalleHorario(form.horarioForm).subscribe(res => {
      this.detalles = res;
      this.fechasHorario = []; // ARRAY QUE CONTIENE TODAS LAS FECHAS DEL MES INDICADO 
      this.inicioDate = moment(form.fechaInicioForm).format('MM-DD-YYYY');
      this.finDate = moment(form.fechaFinalForm).format('MM-DD-YYYY');
      // INICIALIZAR DATOS DE FECHA
      var start = new Date(this.inicioDate);
      var end = new Date(this.finDate);
      // LÓGICA PARA OBTENER EL NOMBRE DE CADA UNO DE LOS DÍA DEL PERIODO INDICADO
      while (start <= end) {
        this.fechasHorario.push(moment(start).format('YYYY-MM-DD'));
        var newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);
      }
      this.fechasHorario.map(obj => {
        this.detalles.map(element => {
          var accion = 0;
          if (element.tipo_accion === 'E') {
            accion = element.minu_espera;
          }
          let plan = {
            estado: null,
            fec_hora_horario: obj + ' ' + element.hora,
            tipo_entr_salida: element.tipo_accion,
            id_horario: form.horarioForm,
            id_det_horario: element.id,
            id_empl_cargo: dh.id_cargo,
            maxi_min_espera: accion,
            codigo: dh.codigo,
            fec_horario: obj,
          };
          this.restP.CrearPlanGeneral(plan).subscribe(res => {
          })
        })
      })
    });
  }

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.EmpleadoHorarioForm.reset();
    this.EmpleadoHorarioForm.patchValue({
      miercolesForm: false,
      viernesForm: false,
      domingoForm: false,
      martesForm: false,
      juevesForm: false,
      sabadoForm: false,
      lunesForm: false,
    });
  }

  // MÉTODO PARA CERRAR VENTANA
  CerrarVentanaEmpleadoHorario() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
