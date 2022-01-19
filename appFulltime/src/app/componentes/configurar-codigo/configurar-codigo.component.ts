// IMPORTAR LIBRERIAS
import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

// IMPORTAR SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service'

@Component({
  selector: 'app-configurar-codigo',
  templateUrl: './configurar-codigo.component.html',
  styleUrls: ['./configurar-codigo.component.css']
})

export class ConfigurarCodigoComponent implements OnInit {

  // VARIABLES DE MANEJO DE ACTIVACIÓN O DESACTIVACIÓN DE FUNCIONES
  HabilitarDescrip: boolean = true;
  automaticoF = false;
  manualF = false;
  estilo: any;

  // CAMPOS FORMULARIO
  inicioF = new FormControl('');
  seleccionF = new FormControl('');

  // CAMPOS DEL FORMULARIO DENTRO DE UN GRUPO
  public configuracionForm = new FormGroup({
    inicioForm: this.inicioF,
    seleccionForm: this.seleccionF,
  });

  constructor(
    private toastr: ToastrService, // VARIABLE MANEJO DE MENSAJES DE NOTIFICACIONES
    public rest: EmpleadoService, // SERVICIO DATOS DE EMPLEADO
    private router: Router, // VARIABLE DE NAVEGACIÓN RUTAS URL
  ) { }

  ngOnInit(): void {
    this.VerUltimoCodigo();
  }

  // SELECCIÓN DE MÉTODO DE REGISTRO DE CÓDIGO DE EMPLEADO
  RegistrarConfiguracion(form) {
    this.rest.ObtenerCodigo().subscribe(datos => {
      if (this.automaticoF === true) {
        this.ActualizarAutomatico(form);
      }
      else {
        this.ActualizarManual();
      }
    }, error => {
      if (this.automaticoF === true) {
        this.CrearAutomatico(form);
      }
      else {
        this.CrearManual();
      }
    });
  }

  // MÉTODO DE REGISTRO AUTOMATICO DE CÓDIGO DE EMPLEADO
  CrearAutomatico(form) {
    let dataCodigo = {
      id: 1,
      valor: form.inicioForm,
      automatico: this.automaticoF,
      manual: this.manualF
    }
    if (form.inicioForm != '') {
      this.rest.CrearCodigo(dataCodigo).subscribe(datos => {
        this.toastr.success('Configuración Registrada', '', {
          timeOut: 6000,
        });
        this.router.navigate(['/empleado/']);
      })
      this.Limpiar();
    }
    else {
      this.toastr.info('Por favor ingresar un valor para generación de código', '', {
        timeOut: 6000,
      })
    }
  }

  // MÉTODO DE REGISTRO DE CÓDIGO MANUAL
  CrearManual() {
    let dataCodigo = {
      id: 1,
      valor: null,
      automatico: this.automaticoF,
      manual: this.manualF
    }
    this.rest.CrearCodigo(dataCodigo).subscribe(datos => {
      this.toastr.success('Configuración Registrada', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/empleado/']);
    })
    this.Limpiar();
  }

  // MÉTODO DE ACTUALIZACIÓN DE CÓDIGO DE EMPLEADO AUTOMÁTICO
  ActualizarAutomatico(form) {
    let dataCodigo = {
      id: 1,
      valor: form.inicioForm,
      automatico: this.automaticoF,
      manual: this.manualF
    }
    if (form.inicioForm != '') {
      this.rest.ObtenerCodigoMAX().subscribe(datosE => {
        if (parseInt(datosE[0].codigo) < parseInt(form.inicioForm)) {
          this.rest.ActualizarCodigoTotal(dataCodigo).subscribe(datos => {
            this.toastr.success('Configuración Registrada', '', {
              timeOut: 6000,
            });
            this.router.navigate(['/empleado/']);
          })
          this.Limpiar();
        }
        else {
          this.toastr.info('Para el buen funcionamiento del sistema ingrese un nuevo valor y recuerde que ' +
            'este debe ser diferente a los valores anteriormente registrados.', '', {
            timeOut: 6000,
          });
        }
      })
    }
    else {
      this.toastr.info('Por favor ingresar un valor para generación de código', '', {
        timeOut: 6000,
      });
    }
  }

  // MÉTODO DE ACTUALIZACIÓN DE CÓDIGO DE EMPLEADO MANUAL
  ActualizarManual() {
    let dataCodigo = {
      id: 1,
      valor: null,
      automatico: this.automaticoF,
      manual: this.manualF
    }
    this.rest.ActualizarCodigoTotal(dataCodigo).subscribe(datos => {
      this.toastr.success('Configuración Registrada', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/empleado/']);
    })
    this.Limpiar();
  }

  // MÉTODO PARA VER CAMPO DE REGISTRO DE CÓDIGO
  VerCampo() {
    this.estilo = { 'visibility': 'visible' }; this.HabilitarDescrip = false;
    this.configuracionForm.patchValue({
      inicioForm: this.valor_codigo
    })
    this.automaticoF = true;
    this.manualF = false;
  }

  // MÉTODO PARA OCULTAR CAMPO DE REGISTRO DE CÓDIGO
  QuitarCampo() {
    this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
    this.configuracionForm.patchValue({
      inicioForm: ''
    })
    this.automaticoF = false;
    this.manualF = true;
  }

  // MÉTODO PARA BUSCAR EL ÚLTIMO CÓDIGO REGISTADO EN EL SISTEMA
  valor_codigo: any;
  VerUltimoCodigo() {
    this.rest.ObtenerCodigoMAX().subscribe(datosE => {
      this.valor_codigo = parseInt(datosE[0].codigo) + 1;
    }, error => {
      this.valor_codigo = '';
    })
  }

  // MÉTODO DE INGRESO DE SOLO NÚMEROS EN EL CAMPO DEL FORMULARIO
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

  // MÉTODO DE RESETEAR VALORES EN EL FORMULARIO
  Limpiar() {
    this.configuracionForm.reset();
    this.QuitarCampo();
  }

}
