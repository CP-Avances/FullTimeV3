// IMPORTAR LIBRERIAS
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef } from '@angular/material/dialog';

// SECCIÓN DE SERVICIOS
import { ParametrosService } from 'src/app/servicios/parametrosGenerales/parametros.service';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { EmpleadoUbicacionService } from 'src/app/servicios/empleadoUbicacion/empleado-ubicacion.service';
import { FuncionesService } from 'src/app/servicios/funciones/funciones.service';

@Component({
  selector: 'app-registrar-timbre',
  templateUrl: './registrar-timbre.component.html',
  styleUrls: ['./registrar-timbre.component.css']
})

export class RegistrarTimbreComponent implements OnInit {

  // CAMPOS DEL FORMULARIO Y VALIDACIONES
  accionF = new FormControl('', Validators.required);
  teclaFuncionF = new FormControl('');
  observacionF = new FormControl('');

  // CAMPOS DENTRO DEL FORMULARIO EN UN GRUPO
  public TimbreForm = new FormGroup({
    teclaFuncionForm: this.teclaFuncionF,
    observacionForm: this.observacionF,
    accionForm: this.accionF,
  });

  // VARIABLE DE SELECCIÓN DE OPCIÓN
  botones_normal: boolean = true;
  boton_abierto: boolean = false;

  // VARIABLES DE ALMACENMAIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  // METODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  // VARIABLES DE ALMACENAMIENTO DE FECHA Y HORA DEL TIMBRE
  f: Date = new Date();

  // ID EMPLEADO QUE INICIO SESIÓN
  id_empl: number;

  constructor(
    private toastr: ToastrService, // VARIABLE DE USO EN NOTIFICACIONES
    public ventana: MatDialogRef<RegistrarTimbreComponent>, // VARIABLE DE USO DE VENTANA DE DIÁLOGO
    public restP: ParametrosService,
    public restE: EmpleadoService,
    public restU: EmpleadoUbicacionService,
    public restF: FuncionesService
  ) {
    this.id_empl = parseInt(localStorage.getItem('empleado'));
  }

  ngOnInit(): void {
    this.BuscarParametro();
    this.Geolocalizar();
    this.VerificarFunciones();
  }

  // METODO PARA ACTIVAR Y DESACTIVAR BOTONES
  ActivarBotones(ob: MatCheckboxChange) {
    if (ob.checked === true) {
      this.boton_abierto = true;
      this.botones_normal = false;
    }
    else {
      this.boton_abierto = false;
      this.botones_normal = true;
    }
  }

  // METODO PARA GUARDAR DATOS DEL TIMBRE SEGUN LA OPCIÓN INGRESADA
  AlmacenarDatos(opcion: number) {
    console.log(opcion);
    switch (opcion) {
      case 1:
        this.accionF.setValue('E')
        this.teclaFuncionF.setValue(0)
        break;
      case 2:
        this.accionF.setValue('S')
        this.teclaFuncionF.setValue(1)
        break;
      case 3:
        this.accionF.setValue('S/A')
        this.teclaFuncionF.setValue(2)
        break;
      case 4:
        this.accionF.setValue('E/A')
        this.teclaFuncionF.setValue(3)
        break;
      case 5:
        this.accionF.setValue('S/P')
        this.teclaFuncionF.setValue(4)
        break;
      case 6:
        this.accionF.setValue('E/P')
        this.teclaFuncionF.setValue(5)
        break;
      case 7:
        this.accionF.setValue('HA')
        this.teclaFuncionF.setValue(6)
        break;
      default:
        this.accionF.setValue('code 99')
        break;
    }
  }

  // METODO PARA TOMAR CORDENAS DE UBICACIÓN
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
              console.log('No se ha permitido el acceso a posición del usuario.');
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

  // METODO PARA TOMAR DATOS DEL TIMBRE
  insertarTimbre(form1) {
    if (this.boton_abierto === true) {
      if (form1.observacionForm != '' && form1.observacionForm != undefined) {
        this.ValidarModulo(this.latitud, this.longitud, this.rango, form1);
      }
      else {
        this.toastr.info('Ingresar un descripción del timbre.', 'Campo de observación es obligatorio.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.ValidarModulo(this.latitud, this.longitud, this.rango, form1);
    }
  }

  // METODO PARA TOMAR DATOS DE MARCACIÓN
  RegistrarDatosTimbre(form1, ubicacion) {
    let dataTimbre = {
      fec_hora_timbre: this.f.toLocaleString(),
      accion: form1.accionForm,
      tecl_funcion: form1.teclaFuncionForm,
      observacion: form1.observacionForm,
      latitud: this.latitud,
      longitud: this.longitud,
      id_reloj: 98,
      ubicacion: ubicacion
    }
    this.ventana.close(dataTimbre)
  }

  // METODO PARA OBTENER RANGO DE PERÍMETRO
  rango: any;
  BuscarParametro() {
    // id_tipo_parametro PARA RANGO DE UBICACIÓN = 22
    let datos = [];
    this.restP.ListarDetalleParametros(22).subscribe(
      res => {
        datos = res;
        if (datos.length != 0) {
          this.rango = ((parseInt(datos[0].descripcion) * (0.0048)) / 500)
        }
        else {
          this.rango = 0.00
        }
      });
  }


  ubicacion: string = '';

  contar: number = 0;
  sin_ubicacion: number = 0;
  // METODO QUE VERIFICAR SI EL TIMBRE FUE REALIZADO EN UN PERíMETRO DEFINIDO
  CompararCoordenadas(informacion: any, form: any, descripcion: any, data: any) {

    this.restP.ObtenerCoordenadas(informacion).subscribe(
      res => {
        if (res[0].verificar === 'ok') {
          this.contar = this.contar + 1;
          this.ubicacion = descripcion;
          if (this.contar === 1) {
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info('Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
              timeOut: 6000,
            })
          }
        }
        else {
          this.sin_ubicacion = this.sin_ubicacion + 1;

          if (this.sin_ubicacion === data.length) {
            this.ValidarDomicilio(informacion, form);
          }
        }
      });
  }

  funciones: any = [];
  VerificarFunciones() {
    this.restF.ListarFunciones().subscribe(res => {
      this.funciones = res;
      console.log('ver funcionalidades', this.funciones);
    })
  }

  // METODO QUE PERMITE VALIDACIONES DE UBICACIÓN
  BuscarUbicacion(latitud: any, longitud: any, rango: any, form: any) {
    var datosUbicacion: any = [];
    this.contar = 0;
    let informacion = {
      lat1: String(latitud),
      lng1: String(longitud),
      lat2: '',
      lng2: '',
      valor: rango
    }
    this.restU.ListarCoordenadasUsuario(this.id_empl).subscribe(
      res => {
        datosUbicacion = res;
        datosUbicacion.forEach((obj: any) => {
          informacion.lat2 = obj.latitud;
          informacion.lng2 = obj.longitud;
          this.CompararCoordenadas(informacion, form, obj.descripcion, datosUbicacion);
        })
        console.log('ver empleado....... ', res)
      }, error => {
        this.ValidarDomicilio(informacion, form);
      });
  }

  ValidarModulo(latitud: any, longitud: any, rango: any, form: any) {
    if (this.funciones[0].geolocalizacion === true) {
      this.BuscarUbicacion(latitud, longitud, rango, form);
    }
    else {
      this.RegistrarDatosTimbre(form, this.ubicacion);
    }
  }

  ValidarDomicilio(informacion: any, form: any) {
    this.restE.BuscarUbicacion(this.id_empl).subscribe(res => {
      if (res[0].longitud != null) {

        informacion.lat2 = res[0].latitud;
        informacion.lng2 = res[0].longitud;

        this.restP.ObtenerCoordenadas(informacion).subscribe(resu => {
          if (resu[0].verificar === 'ok') {
            this.ubicacion = 'DOMICILIO';
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info('Marcación realizada dentro del perímetro definido como ' + this.ubicacion + '.', '', {
              timeOut: 6000,
            })
          }
          else {
            this.ubicacion = 'DESCONOCIDO';
            this.RegistrarDatosTimbre(form, this.ubicacion);
            this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
              timeOut: 6000,
            })
          }
        })
      }
      else {
        this.ubicacion = 'DESCONOCIDO';
        this.RegistrarDatosTimbre(form, this.ubicacion);
        this.toastr.info('Marcación realizada dentro de un perímetro DESCONOCIDO.', '', {
          timeOut: 6000,
        })
      }

    })

  }

}
