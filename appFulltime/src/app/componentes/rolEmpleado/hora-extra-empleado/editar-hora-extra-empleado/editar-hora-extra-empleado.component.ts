import { Component, OnInit, Inject } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { PedHoraExtraService } from 'src/app/servicios/horaExtra/ped-hora-extra.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';

interface Estado {
  id: number,
  nombre: string
}

@Component({
  selector: 'app-editar-hora-extra-empleado',
  templateUrl: './editar-hora-extra-empleado.component.html',
  styleUrls: ['./editar-hora-extra-empleado.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
export class EditarHoraExtraEmpleadoComponent implements OnInit {

  estados: Estado[] = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'Pre-autorizado' },
    { id: 3, nombre: 'Autorizado' },
    { id: 4, nombre: 'Negado' },
  ];

  // Control de campos y validaciones del formulario
  descripcionF = new FormControl('', [Validators.required]);
  fechaInicioF = new FormControl('', [Validators.required]);
  FechaFinF = new FormControl('', [Validators.required]);
  horaInicioF = new FormControl('');
  horaFinF = new FormControl('', [Validators.required]);
  horasF = new FormControl('', [Validators.required]);
  estadoF = new FormControl('', [Validators.required]);
  funcionF = new FormControl('', [Validators.required]);

  public PedirHoraExtraForm = new FormGroup({
    descripcionForm: this.descripcionF,
    fechaInicioForm: this.fechaInicioF,
    FechaFinForm: this.FechaFinF,
    horaInicioForm: this.horaInicioF,
    horaFinForm: this.horaFinF,
    horasForm: this.horasF,
    estadoForm: this.estadoF,
    funcionForm: this.funcionF
  });

  id_user_loggin: number;
  id_cargo_loggin: number;

  constructor(
    // private rest: TipoPermisosService,
    private restHE: PedHoraExtraService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarHoraExtraEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public datos: any
  ) { }

  ngOnInit(): void {
    console.log(this.datos);

    this.id_user_loggin = parseInt(localStorage.getItem("empleado"));
    this.id_cargo_loggin = parseInt(localStorage.getItem("ultimoCargo"));

    this.estados.forEach(obj => {
      if (this.datos.estado === obj.nombre){
      this.PedirHoraExtraForm.patchValue({estadoForm: obj.id});
      }
    });
    this.PedirHoraExtraForm.patchValue({
      descripcionForm: this.datos.descripcion,
      fechaInicioForm: this.datos.fec_inicio,
      FechaFinForm: this.datos.fec_final,
      horaInicioForm: this.datos.fec_inicio.split("T")[1].split(".")[0],
      horaFinForm: this.datos.fec_final.split("T")[1].split(".")[0],
      horasForm: this.datos.num_hora.split(":")[0] + ":" + this.datos.num_hora.split(":")[1],
      funcionForm: this.datos.tipo_funcion
    });
  }

  insertarHoraExtra(form1) {
    let dataPedirHoraExtra = {
      fec_inicio: null,
      fec_final: null,
      num_hora: form1.horasForm + ":00",
      descripcion: form1.descripcionForm,
      estado: form1.estadoForm,
      tipo_funcion: form1.funcionForm,
    }

    dataPedirHoraExtra.fec_inicio = this.ValidarFechas(form1.fechaInicioForm, form1.horaInicioForm);
    dataPedirHoraExtra.fec_final = this.ValidarFechas(form1.FechaFinForm, form1.horaFinForm);
    
    console.log(dataPedirHoraExtra);
    this.restHE.EditarHoraExtra(this.datos.id, dataPedirHoraExtra).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Hora extra solicitada', {
        timeOut: 6000,
      });
      this.dialogRef.close(true);
      console.log(response);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close();
      }
    });

  }

  ValidarFechas(fecha, hora) {
    if (hora.split(":").length < 3) {
      hora = hora + ":00";
    }

    if (fecha._i != undefined) {
      fecha._i.month = fecha._i.month + 1;
      if (fecha._i.month < 10 && fecha._i.date < 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month < 10 && fecha._i.date >= 10) {
        return fecha._i.year + "-0" + fecha._i.month + "-" + fecha._i.date + "T" + hora + ".000Z"
      } else if (fecha._i.month >= 10 && fecha._i.date < 10) {
        return fecha._i.year + "-" + fecha._i.month + "-0" + fecha._i.date + "T" + hora + ".000Z"
      }
    } else {
      return fecha.split("T")[0] + "T" + hora + '.000Z'
    }

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

  CalcularTiempo(form) {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
    if (form.horaInicioForm != '' && form.horaFinForm != '') {
      console.log('revisando horas', form.horaInicioForm, form.horaFinForm)
      var hora1 = (String(form.horaInicioForm) + ':00').split(":"),
        hora2 = (String(form.horaFinForm) + ':00').split(":"),
        t1 = new Date(),
        t2 = new Date();
      t1.setHours(parseInt(hora1[0]), parseInt(hora1[1]), parseInt(hora1[2]));
      t2.setHours(parseInt(hora2[0]), parseInt(hora2[1]), parseInt(hora2[2]));
      //Aquí hago la resta
      t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes(), t2.getSeconds() - t1.getSeconds());
      if (t1.getHours() < 10 && t1.getMinutes() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getHours() < 10) {
        var tiempoTotal: string = '0' + t1.getHours() + ':' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
      else if (t1.getMinutes() < 10) {
        var tiempoTotal: string = t1.getHours() + ':' + '0' + t1.getMinutes();
        this.PedirHoraExtraForm.patchValue({ horasForm: tiempoTotal })
      }
    }
    else {
      this.toastr.info('Debe ingresar la hora de inicio y la hora de fin de actividades.', 'VERIFICAR', {
        timeOut: 6000,
      })
    }
  }

  LimpiarCampoHoras() {
    this.PedirHoraExtraForm.patchValue({ horasForm: '' })
  }

}
