// IMPORTAR LIBRERIAS
import * as moment from 'moment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// IMPORTAR SERVICIOS
import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';
import { PlanGeneralService } from 'src/app/servicios/planGeneral/plan-general.service';

@Component({
  selector: 'app-editar-horario-empleado',
  templateUrl: './editar-horario-empleado.component.html',
  styleUrls: ['./editar-horario-empleado.component.css']
})

export class EditarHorarioEmpleadoComponent implements OnInit {

  // VARIABLES DE OPCIONES DE DÍAS LIBRES
  lunes = false;
  martes = false;
  jueves = false;
  sabado = false;
  viernes = false;
  domingo = false;
  miercoles = false;
  horarios: any = []; // VARIABLE DE ALMACENAMIENTO DE HORARIOS

  // VARIABLES USADAS EN FORMULARIO
  fechaInicioF = new FormControl('', Validators.required);
  fechaFinalF = new FormControl('', Validators.required);
  horarioF = new FormControl('', Validators.required);
  estadoF = new FormControl('', Validators.required);
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
    estadoForm: this.estadoF,
    martesForm: this.martesF,
    juevesForm: this.juevesF,
    sabadoForm: this.sabadoF,
    lunesForm: this.lunesF,
  });

  constructor(
    public router: Router,
    public restH: HorarioService,
    private toastr: ToastrService,
    public restE: EmpleadoService,
    public restP: PlanGeneralService,
    public rest: EmpleadoHorariosService,
    public restD: DetalleCatHorariosService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditarHorarioEmpleadoComponent>,
  ) { }

  ngOnInit(): void {
    console.log('datos', this.data)
    this.BuscarHorarios();
    this.CargarDatos();
    this.ObtenerEmpleado(this.data.idEmpleado);
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

  // MÉTODO PARA VER LA INFORMACIÓN DEL EMPLEADO 
  empleado: any = [];
  ObtenerEmpleado(idemploy: any) {
    this.empleado = [];
    this.restE.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleado = data;
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
    let datosBusqueda = {
      id_cargo: this.data.datosHorario.id_empl_cargo,
      id_empleado: this.data.idEmpleado
    }
    // MÉTODO PARA BUSCAR FECHA DE CONTRATO REGISTRADO EN FICHA DE EMPLEADO
    this.restE.BuscarFechaContrato(datosBusqueda).subscribe(response => {
      // VERIFICAR SI LAS FECHAS SON VALIDAS DE ACUERDO A LOS REGISTROS Y FECHAS INGRESADAS
      if (Date.parse(response[0].fec_ingreso.split('T')[0]) < Date.parse(form.fechaInicioForm)) {
        if (Date.parse(form.fechaInicioForm) < Date.parse(form.fechaFinalForm)) {
          this.VerificarDuplicidad(form);
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
      else {
        this.toastr.warning('Fecha de inicio de actividades no puede ser anterior a fecha de ingreso de contrato.', '', {
          timeOut: 6000,
        });
        this.EmpleadoHorarioForm.patchValue({
          horarioForm: 0
        })
      }
    }, error => { });
  }

  // MÉTODO PARA VERIFICAR DUPLICIDAD DE REGISTROS
  horarioExistentes: any = [];
  VerificarDuplicidad(form) {
    let fechas = {
      fechaInicio: form.fechaInicioForm,
      fechaFinal: form.fechaFinalForm,
      id_horario: form.horarioForm
    };
    this.rest.VerificarDuplicidadHorariosEdicion(this.data.datosHorario.id, this.data.datosHorario.codigo, fechas).subscribe(response => {
      this.toastr.info('Fechas y horario seleccionado ya se encuentran registrados.', 'Verificar la información ingresada.', {
        timeOut: 6000,
      });
      this.EmpleadoHorarioForm.patchValue({
        horarioForm: 0
      })
    }, error => {
      this.ValidarHorarioByHorasTrabaja(form);
    });
  }

  // MÉTODO PARA GUARDAR REGISTROS
  InsertarEmpleadoHorario(form) {
    let datosempleH = {
      id_empl_cargo: this.data.datosHorario.id_empl_cargo,
      fec_inicio: form.fechaInicioForm,
      fec_final: form.fechaFinalForm,
      miercoles: form.miercolesForm,
      id_horarios: form.horarioForm,
      id: this.data.datosHorario.id,
      viernes: form.viernesForm,
      domingo: form.domingoForm,
      martes: form.martesForm,
      estado: form.estadoForm,
      jueves: form.juevesForm,
      sabado: form.sabadoForm,
      lunes: form.lunesForm,
      id_hora: 0,
    };
    console.log(datosempleH);
    this.rest.ActualizarDatos(datosempleH).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Asignación de horario actualizado.', {
        timeOut: 6000,
      });
      this.EliminarPlanificacion();
      this.IngresarPlanGeneral(form);
      this.CerrarVentanaEmpleadoHorario();
    }, error => {
      console.log(error);
    });
  }

  // MÉTODO PARA ELIMINAR PLANIFICACIÓN GENERAL DE HORARIOS
  id_planificacion_general: any = [];
  EliminarPlanificacion() {
    this.id_planificacion_general = [];
    let plan_fecha = {
      fec_inicio: this.data.datosHorario.fec_inicio.split('T')[0],
      fec_final: this.data.datosHorario.fec_final.split('T')[0],
      id_horario: this.data.datosHorario.id_horarios,
      codigo: parseInt(this.empleado[0].codigo)
    };
    this.restP.BuscarFechas(plan_fecha).subscribe(res => {
      this.id_planificacion_general = res;
      this.id_planificacion_general.map(obj => {
        this.restP.EliminarRegistro(obj.id).subscribe(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
      })
    })
  }

  // MÉTODO DE REGISTRO DE PLANIIFCACIÓN GENERAL DE HORARIO
  detalles: any = [];
  inicioDate: any;
  finDate: any;
  fechasHorario: any = [];
  IngresarPlanGeneral(form) {
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
            id_empl_cargo: this.data.datosHorario.id_empl_cargo,
            fec_hora_horario: obj + ' ' + element.hora,
            tipo_entr_salida: element.tipo_accion,
            codigo: this.empleado[0].codigo,
            id_horario: form.horarioForm,
            id_det_horario: element.id,
            maxi_min_espera: accion,
            fec_horario: obj,
            estado: null,
          };
          this.restP.CrearPlanGeneral(plan).subscribe(res => {
            console.log(res);
          }, err => {
            console.log(err);
          })
        })
      })
    });
  }

  // MÉTODO PARA LIMPIAR FORMULARIO
  LimpiarCampos() {
    this.EmpleadoHorarioForm.reset();
  }

  // MÉTODO PARA CERRAR VENTANA DE SELECCIÓN DE HORARIO
  CerrarVentanaEmpleadoHorario() {
    this.LimpiarCampos();
    this.dialogRef.close();
  }

  // MÉTODO PARA MOSTRAR DATOS DE HORARIO SELECCIONADO
  CargarDatos() {
    this.EmpleadoHorarioForm.patchValue({
      fechaInicioForm: this.data.datosHorario.fec_inicio,
      estadoForm: String(this.data.datosHorario.estado),
      fechaFinalForm: this.data.datosHorario.fec_final,
      horarioForm: this.data.datosHorario.id_horarios,
      miercolesForm: this.data.datosHorario.miercoles,
      domingoForm: this.data.datosHorario.domingo,
      viernesForm: this.data.datosHorario.viernes,
      martesForm: this.data.datosHorario.martes,
      juevesForm: this.data.datosHorario.jueves,
      sabadoForm: this.data.datosHorario.sabado,
      lunesForm: this.data.datosHorario.lunes,
    })
    this.miercoles = this.data.datosHorario.miercoles;
    this.viernes = this.data.datosHorario.viernes;
    this.domingo = this.data.datosHorario.domingo;
    this.martes = this.data.datosHorario.martes;
    this.jueves = this.data.datosHorario.jueves;
    this.sabado = this.data.datosHorario.sabado;
    this.lunes = this.data.datosHorario.lunes;
  }

  // MÉTODO PARA VALIDAR HORAS DE TRABAJO SEGÚN CONTRATO
  sumHoras: any;
  suma = '00:00:00';
  horariosEmpleado: any = []
  ValidarHorarioByHorasTrabaja(form) {
    const [obj_res] = this.horarios.filter(o => {
      return o.id === parseInt(form.horarioForm)
    })
    if (!obj_res) return this.toastr.warning('Horario no válido.');
    if (obj_res.detalle === false) {
    }
    else {
      const seg = this.SegundosToStringTime(this.data.horas_trabaja * 3600)
      const { hora_trabajo, id } = obj_res;
      console.log('horario_horas', this.StringTimeToSegundosTime(hora_trabajo))
      console.log(obj_res, hora_trabajo, ' ====== ', seg);

      // VERIFICACIÓN DE FORMATO CORRECTO DE HORARIOS
      if (!this.StringTimeToSegundosTime(hora_trabajo)) {
        this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
        this.toastr.warning('Formato de horas en horario seleccionado no son válidas.', 'Dar click para verificar registro de detalle de horario.', {
          timeOut: 6000,
        }).onTap.subscribe(obj => {
          this.dialogRef.close();
          this.router.navigate(['/verHorario', id]);
        });
      }
      else {
        // MÉTODO PARA LECTURA DE HORARIOS DE EMPLEADO
        this.horariosEmpleado = [];
        let fechas = {
          fechaInicio: form.fechaInicioForm,
          fechaFinal: form.fechaFinalForm,
          id: this.data.datosHorario.id
        };
        this.rest.VerificarHorariosExistentesEdicion(this.data.idEmpleado, fechas).subscribe(existe => {
          this.horariosEmpleado = existe;
          console.log('ver horas horarios', this.horariosEmpleado);
          this.horariosEmpleado.map(h => {
            console.log('ver horas', h.hora_trabajo);
            // SUMA DE HORAS DE CADA UNO DE LOS HORARIOS DEL EMPLEADO
            this.suma = moment(this.suma, 'HH:mm:ss').add(moment.duration(h.hora_trabajo)).format('HH:mm:ss');
          })
          // SUMA DE HORAS TOTALES DE HORARIO CON HORAS DE HORARIO SELECCIONADO
          this.sumHoras = moment(this.suma, 'HH:mm:ss').add(moment.duration(hora_trabajo)).format('HH:mm:ss');
          console.log('horas totales de horarios', this.sumHoras);

          // MÉTODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO
          if (this.StringTimeToSegundosTime(this.sumHoras) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Va a cumplir un total de: ' + this.sumHoras + ' horas.')
          } else if (this.StringTimeToSegundosTime(this.sumHoras) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
          else {
            this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
            return this.toastr.warning('Esta registrando un total de ' + this.sumHoras + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        }, error => {
          // MÉTODO PARA COMPARAR HORAS DE TRABAJO CON HORAS DE CONTRATO CUANDO NO EXISTEN HORARIOS EN LAS FECHAS INDICADAS
          if (this.StringTimeToSegundosTime(hora_trabajo) === this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Va a cumplir un total de: ' + hora_trabajo + ' horas.')
          } else if (this.StringTimeToSegundosTime(hora_trabajo) < this.StringTimeToSegundosTime(seg)) {
            return this.toastr.info('Cumplirá un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
          else {
            this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
            return this.toastr.warning('El horario seleccionado indica un total de ' + hora_trabajo + ' horas.',
              'Recuerde que de acuerdo a su contrato debe cumplir un total de ' + seg + ' horas.', {
              timeOut: 6000,
            });
          }
        });
      }
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

  // MÉTODO PARA LIMPIAR CAMPO SELECCIÓN DE HORARIO
  LimpiarHorario() {
    this.EmpleadoHorarioForm.patchValue({ horarioForm: 0 });
  }

}
