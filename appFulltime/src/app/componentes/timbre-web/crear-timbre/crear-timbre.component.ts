// IMPORTAR LIBRERIAS
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-crear-timbre',
  templateUrl: './crear-timbre.component.html',
  styleUrls: ['./crear-timbre.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})

export class CrearTimbreComponent implements OnInit {

  // CONTROL DE CAMPOS Y VALIDACIONES DEL FORMULARIO
  accionF = new FormControl('', Validators.required);
  FechaF = new FormControl('', Validators.required);
  HoraF = new FormControl('', Validators.required);
  teclaFuncionF = new FormControl('');

  // VARIABLE DE ALMACENAMIENTO DE ID DE EMPLEADO QUE INICIA SESIÓN
  idEmpleadoLogueado: any;
  nombre: string;

  // VARIABLES DE ALMACENMAIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  // LISTA DE ACCIONES DE TIMBRES
  accion: any = [
    { value: 'E', name: 'Entrada' },
    { value: 'S', name: 'Salida' },
    { value: 'S/A', name: 'Inicio Comida' },
    { value: 'E/A', name: 'Fin Comida' },
    { value: 'S/P', name: 'Inicio Permiso' },
    { value: 'E/P', name: 'Fin Permiso' },
  ]

  // AGREGAR CAMPOS DE FORMULARIO A UN GRUPO
  public TimbreForm = new FormGroup({
    horaForm: this.HoraF,
    fechaForm: this.FechaF,
    accionForm: this.accionF,
    teclaFuncionForm: this.teclaFuncionF,
  });

  // MÉTODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  constructor(
    public ventana: MatDialogRef<CrearTimbreComponent>, // VARIABLE MANEJO DE VENTANAS
    @Inject(MAT_DIALOG_DATA) public data: any, // MANEJO DE DATOS ENTRE VENTANAS
    private restEmpleado: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private validar: ValidacionesService, // VARIABLE DE CONTROL DE VALIDACIÓN
    private restTimbres: TimbresService, // SERVICIO DATOS DE TIMBRES
    private toastr: ToastrService, // VARIABLE MANEJO DE NOTIFICACIONES
  ) {
    this.idEmpleadoLogueado = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    if (this.data.length === undefined) {
      this.nombre = this.data.empleado;
    }
    this.VerDatosEmpleado(this.idEmpleadoLogueado);
    console.log(this.data);
    this.Geolocalizar();
  }

  // MÉTODO DE BÚSQUEDA DE DATOS DE EMPLEADO
  empleadoUno: any = [];
  VerDatosEmpleado(idemploy: number) {
    this.empleadoUno = [];
    this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
      this.empleadoUno = data;
    })
  }

  // MÉTODO PARA TOMAR CORDENAS DE UBICACIÓN
  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
          console.log(this.longitud, this.latitud);
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              console.log('No se ha permitido acceder a posición del usuario.');
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              console.log('No se ha podido acceder a información de su posición.');
              break;
            case objPositionError.TIMEOUT:
              console.log('El servicio ha tardado demasiado tiempo en responder.');
              break;
            default:
              console.log('Error desconocido.');
          }
        }, this.options);
    }
    else {
      console.log('Su navegador no soporta API de geolocalización.');
    }
  }

  // MÉTODO DE INGRESO DE ACCIONES DEL TIMBRE
  TeclaFuncion(opcion: string) {
    console.log(opcion);
    if (opcion == 'E') {
      return 0;
    } else if (opcion == 'S') {
      return 1
    } else if (opcion == 'S/A') {
      return 2
    } else if (opcion == 'E/A') {
      return 3
    } else if (opcion == 'S/P') {
      return 4
    } else if (opcion == 'E/P') {
      return 5
    }
  }


  // VARIABLE DE ALMACENAMIENTO DE DATOS
  data_nueva: any = [];

  // MÉTODO DE INGRESO DE TIMBRES
  contador: number = 0;
  insertarTimbre(form1) {
    console.log(form1.fechaForm.toJSON());
    if (this.data.length === undefined) {
      let dataTimbre = {
        fec_hora_timbre: form1.fechaForm.toJSON().split('T')[0] + 'T' + form1.horaForm + ':00',
        accion: form1.accionForm,
        tecl_funcion: this.TeclaFuncion(form1.accionForm),
        observacion: 'Timbre creado por Admin. ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
        latitud: this.latitud,
        longitud: this.longitud,
        id_empleado: this.data.id,
        id_reloj: 98,
      }
      this.ventana.close(dataTimbre)
    }
    else {
      console.log('entra')
      this.contador = 0;
      this.data.map(obj => {
        let dataTimbre = {
          fec_hora_timbre: form1.fechaForm.toJSON().split('T')[0] + 'T' + form1.horaForm + ':00',
          accion: form1.accionForm,
          tecl_funcion: this.TeclaFuncion(form1.accionForm),
          observacion: 'Timbre creado por Admi. ' + this.empleadoUno[0].nombre + ' ' + this.empleadoUno[0].apellido,
          latitud: this.latitud,
          longitud: this.longitud,
          id_empleado: obj.id,
          id_reloj: 98,
        }
        // LIMPIAR VARIABLE Y ALMACENAR DATOS
        this.data_nueva = [];
        this.data_nueva = dataTimbre;
        // MÉTODO DE INSERCIÓN DE TIMBRES
        this.restTimbres.PostTimbreWebAdmin(dataTimbre).subscribe(res => {
          // MÉTODO PARA AUDITAR TIMBRES
          this.data_nueva.id_empleado = obj.id;
          this.validar.Auditar('app-web', 'timbres', '', this.data_nueva, 'INSERT');
          this.contador = this.contador + 1;
          if (this.contador === this.data.length) {
            console.log(res, this.contador);
            this.ventana.close();
            this.toastr.success('Operación Exitosa.', 'Se registro un total de ' + this.data.length + ' timbres exitosamente.', {
              timeOut: 6000,
            })
          }
        })
      })
    }
  }

}
