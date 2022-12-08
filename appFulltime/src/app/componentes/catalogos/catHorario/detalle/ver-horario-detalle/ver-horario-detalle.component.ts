import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { DetalleCatHorariosService } from 'src/app/servicios/horarios/detalleCatHorarios/detalle-cat-horarios.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { HorarioService } from 'src/app/servicios/catalogos/catHorarios/horario.service';

import { EditarDetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle/editar-detalle-cat-horario/editar-detalle-cat-horario.component';
import { DetalleCatHorarioComponent } from 'src/app/componentes/catalogos/catHorario/detalle/detalle-cat-horario/detalle-cat-horario.component';
import { EditarHorarioComponent } from 'src/app/componentes/catalogos/catHorario/horario/editar-horario/editar-horario.component';
import { MetodosComponent } from 'src/app/componentes/administracionGeneral/metodoEliminar/metodos.component';

@Component({
  selector: 'app-ver-horario-detalle',
  templateUrl: './ver-horario-detalle.component.html',
  styleUrls: ['./ver-horario-detalle.component.css']
})

export class VerHorarioDetalleComponent implements OnInit {

  idHorario: string;
  datosHorario: any = [];
  datosDetalle: any = [];

  // ITEMS DE PAGINACIÓN DE LA TABLA
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];

  booleanMap = { 'true': 'Si', 'false': 'No' };
  hipervinculo: string = environment.url;

  constructor(
    private toastr: ToastrService,
    private restD: DetalleCatHorariosService,
    private rest: HorarioService,
    public router: Router,
    public ventana: MatDialog,
    public validar: ValidacionesService,
    public parametro: ParametrosService,
  ) {
    var cadena = this.router.url;
    var aux = cadena.split("/");
    this.idHorario = aux[2];
  }

  ngOnInit(): void {
    this.BuscarDatosHorario(this.idHorario);
    this.BuscarHora();
  }

  /** **************************************************************************************** **
   ** **                   BUSQUEDA DE FORMATOS DE FECHAS Y HORAS                           ** ** 
   ** **************************************************************************************** **/

  formato_hora: string = 'HH:mm:ss';

  BuscarHora() {
    // id_tipo_parametro Formato hora = 26
    this.parametro.ListarDetalleParametros(26).subscribe(
      res => {
        this.formato_hora = res[0].descripcion;
        this.ListarDetalles(this.idHorario, this.formato_hora);
      },
      vacio => {
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA MANEJAR LA PAGINACION
  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1
  }

  // METODO PARA BUSCAR UN HORARIO
  BuscarDatosHorario(id_horario: any) {
    this.datosHorario = [];
    this.rest.BuscarUnHorario(id_horario).subscribe(data => {
      this.datosHorario = data;
    })
  }

  // METODO PARA BUSCAR DETALES DE UN HORARIO
  ListarDetalles(id_horario: any, formato_hora: string) {
    this.datosDetalle = [];
    this.restD.ConsultarUnDetalleHorario(id_horario).subscribe(datos => {
      this.datosDetalle = datos;
      this.datosDetalle.forEach(data => {
        data.hora_ = this.validar.FormatearHora(data.hora, formato_hora);
      });
    })
  }

  // METODO PARA REGISTRAR DETALLE DE HORARIO
  AbrirVentanaDetalles(datosSeleccionados: any): void {
    this.ventana.open(DetalleCatHorarioComponent,
      { width: '600px', data: { datosHorario: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(item => {
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA EDITAR HORARIO
  AbrirVentanaEditar(datosSeleccionados: any): void {
    this.ventana.open(EditarHorarioComponent, { width: '900px', data: { horario: datosSeleccionados, actualizar: true } })
      .afterClosed().subscribe(result => {
        if (result !== undefined) {
          this.datosHorario = result
        }
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // METODO PARA EDITAR DETALLE DE HORARIO
  AbrirVentanaEditarDetalle(datosSeleccionados: any): void {
    this.ventana.open(EditarDetalleCatHorarioComponent,
      { width: '600px', data: { detalle: datosSeleccionados, horario: this.datosHorario[0] } }).afterClosed().subscribe(item => {
        this.BuscarDatosHorario(this.idHorario);
        this.ListarDetalles(this.idHorario, this.formato_hora);
      });
  }

  // FUNCION PARA ELIMINAR REGISTRO SELECCIONADO PLANIFICACION
  EliminarDetalle(id_detalle: number) {
    this.restD.EliminarRegistro(id_detalle).subscribe(res => {
      this.toastr.error('Registro eliminado.', '', {
        timeOut: 6000,
      });
      this.BuscarDatosHorario(this.idHorario);
      this.ListarDetalles(this.idHorario, this.formato_hora);
    });
  }

  // FUNCION PARA CONFIRMAR SI SE ELIMINA O NO UN REGISTRO 
  ConfirmarDelete(datos: any) {
    this.ventana.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarDetalle(datos.id);
          let horasT = this.datosHorario[0].hora_trabajo.split(':')[0] + ':' + this.datosHorario[0].hora_trabajo.split(':')[1];
          this.ActualizarHorario(this.datosHorario[0].id, horasT, false);
        } else {
          this.router.navigate(['/verHorario/', this.idHorario]);
        }
      });
  }

  // METODO PARA CALCULAR HORAS DE TRABAJO
  CalcularHorasTrabaja() {
    const [cg_horario] = this.datosHorario;
    const { nocturno, id, min_almuerzo } = cg_horario;

    // SI LAS HORAS TIENEN FORMATO HH:mm SE REALIZA VALIDACIONES
    if (this.datosHorario[0].hora_trabajo.split(':').length === 2) {

      // SI NO EXISTEN DETALLES DE HORARIO
      if (this.datosDetalle.length === 0) return this.toastr.error(
        'Por favor primero ingrese detalle de horario.'
      );

      // REGISTROS INCOMPLETOS DE DETALLE DE HORARIOS
      if (this.datosDetalle.length === 1) return this.toastr.error(
        `Falta ingresar el detalle de horario. Debe tener al menos 2 detalles de 
        horario (Entrada - Salida).`
      );

      // VALIDAR SI EXISTE REGISTRO MINUTOS DE ALMUERZO
      if (min_almuerzo != 0) {
        if (this.datosDetalle.length != 4) return this.toastr.error(
          `Falta ingresar el detalle de horario. Debe tener al menos 4 detalles de 
          horario (Entrada - Inicio alimentación - Fin alimentación - Salida)'`
        );
      }

      // VALIDAR HORARIOS NOCTURNOS
      if (nocturno === true) {
        const hora_ini_horario_nocturno = this.StringTimeToSegundosTime('19:00:00');
        const median_noche = this.StringTimeToSegundosTime('24:00:00');
        const detalleNocturno = this.datosDetalle.map(o => {
          let tiempo = this.StringTimeToSegundosTime(o.hora);
          let value = (hora_ini_horario_nocturno <= tiempo && median_noche > tiempo) ? tiempo : tiempo + median_noche
          return {
            orden: o.orden,
            hora: value
          }
        })
        this.ActualizarHorasTrabajaSegunHorario(detalleNocturno, id, min_almuerzo)
      } else {
        const detalleDiurno = this.datosDetalle.map(o => {
          return {
            orden: o.orden,
            hora: this.StringTimeToSegundosTime(o.hora)
          }
        })
        this.ActualizarHorasTrabajaSegunHorario(detalleDiurno, id, min_almuerzo)
      }
    }
    // VERIFICADO QUE LAS HORAS TENGAN EL FORMATO HH:mm:ss
    else {
      this.toastr.success('Horas totales de trabajo son correctas.', 'Verificación exitosa.', {
        timeOut: 6000
      });
    }
  }

  // METODO PARA ACTUALIZAR HORAS TRABAJADAS DE ACUERDO AL HORARIO - NOCTURNO
  ActualizarHorasTrabajaSegunHorario(detalle: any[], id: number, min_almuerzo: number) {
    if (min_almuerzo === 0) {
      var [det_uno, det_cuatro] = detalle;
    }
    else {
      var [det_uno, det_dos, det_tres, det_cuatro] = detalle;
    }

    const diferencia2 = (det_tres === undefined) ? 0 : det_tres.hora - det_dos.hora;

    let minutos: number = Math.floor((diferencia2 / 60));

    // VALIDAR HORARIO SIN MINUTOS DE ALIMENTACION
    if (min_almuerzo === 0 && minutos != 0) return this.toastr.warning(
      `Por favor eliminar detalle de salida e ingreso de alimentación o configurar 
      minutos de alimentación en el horario.`,
      'El horario registrado indica que no tiene asignado minutos de alimentación.', {
      timeOut: 6000
    });

    // VALIDAR HORARIO CON MINUTOS DE ALIMENTACION
    if (min_almuerzo != 0 && minutos === 0) return this.toastr.warning(
      'El horario registra minutos de alimentación que no han sido establecidos en el detalle.',
      'Por favor ingresar detalle de salida de alimentación.', {
      timeOut: 6000
    });

    // VALIDAR MINUTOS DE ALIMENTACION
    if (min_almuerzo != 0 && minutos < min_almuerzo) return this.toastr.warning(
      `El detalle de entrada y salida alimentación tiene menos minutos de alimentación 
      de lo establecido en el horario.`,
      'Por favor revisar detalle de alimentación.', {
      timeOut: 6000
    });

    // METODO LECTURA DE HORAS ACORDE AL DETALLE INGRESADO
    const diferencia1 = (det_cuatro === undefined) ? 0 : det_cuatro.hora - det_uno.hora;
    const diferenciaTotal = diferencia1 - Math.floor((min_almuerzo * 60));
    const horasT = this.SegundosToStringTime(diferenciaTotal);

    if (horasT < (this.datosHorario[0].hora_trabajo + ':00')) {
      this.toastr.warning(
        'Las horas totales de trabajo definidas en su detalle son menores a las horas de trabajo establecidas en el horario. ' + horasT + ' < ' + this.datosHorario[0].hora_trabajo + ':00',
        'Por favor revisar detalle de horario.', {
        timeOut: 6000
      });
    }

    else if (horasT > (this.datosHorario[0].hora_trabajo + ':00')) {
      this.toastr.warning(
        'Las horas totales de trabajo definidas en su detalle son mayores a las horas de trabajo establecidas en el horario. ' + horasT + ' > ' + this.datosHorario[0].hora_trabajo + ':00',
        'Por favor revisar detalle de horario.', {
        timeOut: 6000
      });
    }
    else {
      this.ActualizarHorario(id, horasT, true);
    }
  }

  // METODO PARA ESTABLECER TIEMPO SEGUNDOS
  StringTimeToSegundosTime(stringTime: string) {
    const h = parseInt(stringTime.split(':')[0]) * 3600;
    const m = parseInt(stringTime.split(':')[1]) * 60;
    const s = parseInt(stringTime.split(':')[2]);
    return h + m + s
  }

  // METODO PARA FORMATEAR HORA
  SegundosToStringTime(segundos: number) {
    let h: string | number = Math.floor(segundos / 3600);
    h = (h < 10) ? '0' + h : h;
    let m: string | number = Math.floor((segundos / 60) % 60);
    m = (m < 10) ? '0' + m : m;
    let s: string | number = segundos % 60;
    s = (s < 10) ? '0' + s : s;

    return h + ':' + m + ':' + s;
  }

  // METODO PARA ACTUALIZAR HORAS DE HORARIO
  ActualizarHorario(id: any, horasT: any, mensaje: boolean) {
    this.rest.ActualizarHorasTrabaja(id, { hora_trabajo: horasT }).subscribe(res => {
      this.datosHorario = res;
      if (mensaje === true) {
        this.toastr.success('Horas totales de trabajo son correctas.', 'Verificación exitosa.', {
          timeOut: 6000
        });
      }
    }, err => {
      this.toastr.error(err.message)
    })
  }

}
