// IMPORTAR LIBRERIAS
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

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

  // MÉTODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  // VARIABLES DE ALMACENAMIENTO DE FECHA Y HORA DEL TIMBRE
  f: Date = new Date();

  constructor(
    public ventana: MatDialogRef<RegistrarTimbreComponent>, // VARIABLE DE USO DE VENTANA DE DIÁLOGO
    private toastr: ToastrService, // VARIABLE DE USO EN NOTIFICACIONES
  ) { }

  ngOnInit(): void {
    this.Geolocalizar();
  }

  // MÉTODO PARA ACTIVAR Y DESACTIVAR BOTONES
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

  // MÉTODO PARA GUARDAR DATOS DEL TIMBRE SEGUN LA OPCIÓN INGRESADA
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

  // MÉTODO PARA TOMAR DATOS DEL TIMBRE
  insertarTimbre(form1) {
    if (this.boton_abierto === true) {
      if (form1.observacionForm != '' && form1.observacionForm != undefined) {
        this.RegistrarDatosTimbre(form1);
      }
      else {
        this.toastr.info('Ingresar un descripción del timbre.', 'Campo de observación es obligatorio.', {
          timeOut: 6000,
        })
      }
    }
    else {
      this.RegistrarDatosTimbre(form1);
    }
  }

  RegistrarDatosTimbre(form1) {
    let dataTimbre = {
      fec_hora_timbre: this.f.toLocaleString(),
      accion: form1.accionForm,
      tecl_funcion: form1.teclaFuncionForm,
      observacion: form1.observacionForm,
      latitud: this.latitud,
      longitud: this.longitud,
      id_reloj: 98,
    }
    this.ventana.close(dataTimbre)
  }

}
