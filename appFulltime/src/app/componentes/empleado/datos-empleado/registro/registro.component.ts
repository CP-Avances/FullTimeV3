// SECCIÓN DE LIBRERIAS
import { MAT_MOMENT_DATE_FORMATS, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormGroup, Validators, FormBuilder, FormControl, NumberValueAccessor } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { Component, OnInit } from '@angular/core';
import { startWith, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr'
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';
import * as L from 'leaflet';

// SECCIÓN DE SERVICIOS
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { ValidacionesService } from 'src/app/servicios/validaciones/validaciones.service';
import { EmplLeafletComponent } from 'src/app/componentes/settings/leaflet/empl-leaflet/empl-leaflet.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],

  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es' },
  ]
})

export class RegistroComponent implements OnInit {

  empleadoGuardado: any = [];
  nacionalidades: any = [];
  escritura = false;
  roles: any = [];
  hide = true;

  private idNacionalidad: number;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  NacionalidadControl = new FormControl('', Validators.required);
  filteredOptions: Observable<string[]>;

  constructor(
    private rol: RolesService,
    private rest: EmpleadoService,
    private user: UsuarioService,
    private toastr: ToastrService,
    private router: Router,
    private validar: ValidacionesService,
    private _formBuilder: FormBuilder,
    public ventana: MatDialog,
  ) { }

  date: any;
  HabilitarDescrip: boolean = true;
  estilo: any;

  ngOnInit(): void {
    this.cargarRoles();
    this.obtenerNacionalidades();
    this.VerificarCodigo();
    this.primeroFormGroup = this._formBuilder.group({
      codigoForm: [''],
      nombreForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,48}")],
      apellidoForm: ['', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,64}")],
      cedulaForm: ['', Validators.required],
      emailForm: ['', Validators.email],
      correoAlternativoForm: ['', Validators.email],
      fechaForm: ['', Validators.required],
    });
    this.segundoFormGroup = this._formBuilder.group({
      telefonoForm: ['', Validators.required],
      domicilioForm: ['', Validators.required],
      estadoCivilForm: ['', Validators.required],
      generoForm: ['', Validators.required],
      nacionalidadForm: this.NacionalidadControl
    });
    this.terceroFormGroup = this._formBuilder.group({
      rolForm: ['', Validators.required],
      userForm: ['', Validators.required],
      passForm: ['', Validators.required],
    });
    this.filteredOptions = this.NacionalidadControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  datosCodigo: any = [];
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos;
      if (this.datosCodigo[0].automatico === true) {
        this.primeroFormGroup.patchValue({
          codigoForm: parseInt(this.datosCodigo[0].valor) + 1
        })
        this.escritura = true;
      }
      else {
        this.escritura = false;
      }
    }, error => {
      this.toastr.info('Primero configurar el código de empleado.', '', {
        timeOut: 6000,
      });
      this.router.navigate(['/codigo/']);
    });
  }

  private _filter(value: string): string[] {
    if (value != null) {
      const filterValue = value.toLowerCase();
      return this.nacionalidades.filter(nacionalidades => nacionalidades.nombre.toLowerCase().includes(filterValue));
    }
  }

  IngresarSoloLetras(e) {
    this.validar.IngresarSoloLetras(e);
  }

  IngresarSoloNumeros(evt) {
    this.validar.IngresarSoloNumeros(evt);
  }

  LimpiarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
    this.terceroFormGroup.reset();
  }

  cargarRoles() {
    this.rol.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  insertarEmpleado(form1, form2, form3) {

    // Busca el id de la nacionalidad elegida en el autocompletado
    this.nacionalidades.forEach(obj => {
      if (form2.nacionalidadForm == obj.nombre) {
        console.log(obj);
        this.idNacionalidad = obj.id;
      }
    });

    // REALIZAR UN CAPITAL LETTER A LOS NOMBRES Y APELLIDOS
    var NombreCapitalizado: any;
    let nombres = form1.nombreForm.split(' ');
    if (nombres.length > 1) {
      console.log('tamaño de la cadena', nombres.length);
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      let name2 = nombres[1].charAt(0).toUpperCase() + nombres[1].slice(1);
      NombreCapitalizado = name1 + ' ' + name2;
    }
    else {
      let name1 = nombres[0].charAt(0).toUpperCase() + nombres[0].slice(1);
      var NombreCapitalizado = name1
    }

    var ApellidoCapitalizado: any;
    let apellidos = form1.apellidoForm.split(' ');
    if (apellidos.length > 1) {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      let lastname2 = apellidos[1].charAt(0).toUpperCase() + apellidos[1].slice(1);
      ApellidoCapitalizado = lastname1 + ' ' + lastname2;
    }
    else {
      let lastname1 = apellidos[0].charAt(0).toUpperCase() + apellidos[0].slice(1);
      ApellidoCapitalizado = lastname1
    }

    let dataEmpleado = {
      cedula: form1.cedulaForm,
      apellido: ApellidoCapitalizado,
      nombre: NombreCapitalizado,
      esta_civil: form2.estadoCivilForm,
      genero: form2.generoForm,
      correo: form1.emailForm,
      fec_nacimiento: form1.fechaForm,
      estado: 1,
      mail_alernativo: form1.correoAlternativoForm,
      domicilio: form2.domicilioForm,
      telefono: form2.telefonoForm,
      id_nacionalidad: this.idNacionalidad,
      codigo: form1.codigoForm
    };

    if (this.contador === 0) {
      this.rest.postEmpleadoRest(dataEmpleado).subscribe(response => {
        if (response.message === 'error') {
          this.toastr.error('El código y cédula del empleado son datos únicos y no deben ser igual al resto de registros.', 'Uno de los datos ingresados es Incorrecto', {
            timeOut: 6000,
          });
        }
        else {
          this.empleadoGuardado = response;
          this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
          this.RegistrarGeolocalizacion(this.empleadoGuardado.id, this.empleadoGuardado.codigo);
        }
      });
    }
    else {
      this.GuardarDatosUsuario(form3, this.empleadoGuardado.id, form1);
      this.ActualizarDomicilio(this.empleadoGuardado.id);
      this.ActualizarTrabajo(this.empleadoGuardado.id);
    }
  }

  verDatos(id: string) {
    this.router.navigate(['/verEmpleado/', id]);
  }

  obtenerNacionalidades() {
    this.rest.getListaNacionalidades().subscribe(res => {
      this.nacionalidades = res;
    });
  }

  contador: number = 0;
  GuardarDatosUsuario(form3, id, form1) {
    //Cifrado de contraseña
    const md5 = new Md5();
    let clave = md5.appendStr(form3.passForm).end();
    console.log("pass", clave);
    let dataUser = {
      usuario: form3.userForm,
      contrasena: clave,
      estado: true,
      id_rol: form3.rolForm,
      id_empleado: id,
      app_habilita: true
    }
    this.user.postUsuarioRest(dataUser).subscribe(data => {
      if (data.message === 'error') {
        this.toastr.error('Por favor ingrese otro nombre de usuario', 'Nombre de usuario existente', {
          timeOut: 6000,
        });
        this.contador = 1;
      }
      else {
        this.ActualizarCodigo(form1.codigoForm);
        this.verDatos(id);
        this.toastr.success('Operacion Exitosa', 'Empleado guardado', {
          timeOut: 6000,
        });
        console.log('ver coordenadas', this.h_latitud + ' ' + this.h_longitud);
        this.LimpiarCampos();
        this.contador = 0;
      }
    });
  }

  ActualizarCodigo(codigo) {
    if (this.datosCodigo[0].automatico === true) {
      let dataCodigo = {
        valor: codigo,
        id: 1
      }
      this.rest.ActualizarCodigo(dataCodigo).subscribe(res => {
      })
    }
  }

  /** ************************************************************************************** **
   ** *              REGISTRO DE COORDENADAS DE UBICACIÓN DOMICILIO Y TRABAJO              * **
   ** ************************************************************************************** **/

  // VARIABLES DE COORDENADAS DE TRABAJO
  t_longitud: String;
  t_latitud: String;

  // VARIABLES DE COORDENADAS DE DOMICILIO
  h_longitud: String;
  h_latitud: String;


  // METODO INCLUIR EL CROKIS DOMICILIO
  AbrirMapaDomicilio() {
    this.ventana.open(EmplLeafletComponent, { width: '500px', height: '500px' })
      .afterClosed().subscribe((res: any) => {
        if (res.message === true) {
          this.h_latitud = res.latlng.lat;
          this.h_longitud = res.latlng.lng;
        }
      });
  }

  // METODO INCLUIR EL CROKIS TRABAJO
  AbrirMapaTrabajo() {
    this.ventana.open(EmplLeafletComponent, { width: '500px', height: '500px' })
      .afterClosed().subscribe((res: any) => {
        if (res.message === true) {
          this.t_latitud = res.latlng.lat;
          this.t_longitud = res.latlng.lng;
        }
      });
  }

  RegistrarGeolocalizacion(id: number, codigo: number) {
    let data = {
      h_lat: this.h_latitud,
      h_lng: this.h_longitud,
      t_lat: this.t_latitud,
      t_lng: this.t_longitud
    }
    this.rest.InsertarUbicacion(id, codigo, data).subscribe(respuesta => {
    }, err => { });

    let mapa = {
      lat: this.h_latitud,
      lng: this.h_longitud
    }
    this.rest.putGeolocalizacion(id, mapa).subscribe(respuesta => {
    }, err => { });
  }

  ActualizarDomicilio(id: number) {
    if (this.h_latitud != '' && this.h_longitud != '') {
      let data = {
        lat: this.h_latitud,
        lng: this.h_longitud,
      }
      this.rest.ActualizarUbicacionDomicilio(id, data).subscribe(respuesta => {
      }, err => { });

      this.rest.putGeolocalizacion(id, data).subscribe(respuesta => {
      }, err => { });
    }
  }

  ActualizarTrabajo(id: number) {
    if (this.t_latitud != '' && this.t_longitud != '') {
      let data = {
        lat: this.t_latitud,
        lng: this.t_longitud
      }
      this.rest.ActualizarUbicacionTrabajo(id, data).subscribe(respuesta => {
      }, err => {
      });
    }
  }

}


