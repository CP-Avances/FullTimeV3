import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { startWith, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { UsuarioService } from 'src/app/servicios/usuarios/usuario.service';
import { RolesService } from 'src/app/servicios/catalogos/catRoles/roles.service';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-empleado',
  templateUrl: './editar-empleado.component.html',
  styleUrls: ['./editar-empleado.component.css']
})

export class EditarEmpleadoComponent implements OnInit {

  nacionalidades: any = [];
  private idNacionalidad: number;

  roles: any = [];
  usuario: any = [];
  hide = true;

  isLinear = true;
  primeroFormGroup: FormGroup;
  segundoFormGroup: FormGroup;
  terceroFormGroup: FormGroup;

  NacionalidadControl = new FormControl('', Validators.required);
  filteredOptions: Observable<string[]>;
  idEmpleado: number;

  constructor(
    private rest: EmpleadoService,
    private user: UsuarioService,
    private rol: RolesService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private validacionService: ValidacionesService,
    public router: Router,
    public dialogRef: MatDialogRef<EditarEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado: any
  ) {
    this.idEmpleado = this.empleado.id;
  }

  ngOnInit(): void {
    console.log(this.empleado);
    this.obtenerNacionalidades();
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
      estadoForm: ['', Validators.required],
      nacionalidadForm: this.NacionalidadControl
    });
    this.terceroFormGroup = this._formBuilder.group({
      rolForm: ['', Validators.required],
      userForm: ['', Validators.required],
    });
    
    this.cargarRoles();
    this.VerificarCodigo();
  }

  datosCodigo: any = [];
  escritura = false;
  VerificarCodigo() {
    this.datosCodigo = [];
    this.rest.ObtenerCodigo().subscribe(datos => {
      this.datosCodigo = datos;
      if (this.datosCodigo[0].automatico === true) {
        this.escritura = true;
      }
      else {
        this.escritura = false;
      }
    }, error => {
      this.toastr.info('Primero configurar el código de empleado.','', {
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

  cargarRoles() {
    this.rol.getRoles().subscribe(data => {
      this.roles = data;
    });
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }
  
  IngresarSoloNumeros(evt) {
    return this.validacionService.IngresarSoloNumeros(evt);
  }


  actualizarEmpleado(form1, form2, form3) {
    // Busca el id de la nacionalidad elegida en el autocompletado
    this.nacionalidades.forEach(obj => {
      if (form2.nacionalidadForm == obj.nombre) {
        console.log(obj);
        this.idNacionalidad = obj.id;
      }
    });
    // Realizar un capital letter a los nombres y apellidos
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
      estado: form2.estadoForm,
      mail_alernativo: form1.correoAlternativoForm,
      domicilio: form2.domicilioForm,
      telefono: form2.telefonoForm,
      id_nacionalidad: this.idNacionalidad,
      codigo: form1.codigoForm
    };

    if (this.contador === 0) {
      this.rest.putEmpleadoRest(dataEmpleado, this.idEmpleado).subscribe(response => {
        if (response.message === 'error') {
          this.toastr.error('El código y cédula del empleado son datos únicos y no deben ser igual al resto de registros.', 'Uno de los datos ingresados es Incorrecto', {
            timeOut: 6000,
          });
        }
        else {
          this.ActualizarUser(form3, form1);
        }
      });
    }
    else {
      this.ActualizarUser(form3, form1);
    }
  }


  contador: number = 0;
  ActualizarUser(form3, form1) {
    this.contador = 0;
    let dataUser = {
      usuario: form3.userForm,
      contrasena: this.usuario[0].contrasena,
      id_rol: form3.rolForm,
      id_empleado: this.idEmpleado
    }
    this.user.ActualizarDatos(dataUser).subscribe(data => {
      if (data.message === 'error') {
        this.toastr.error('Por favor ingrese otro nombre de usuario', 'Nombre de usuario existente', {
          timeOut: 6000,
        });
        this.contador = 1;
      }
      else {
        this.toastr.success('Operacion Exitosa', 'Empleado Actualizado', {
          timeOut: 6000,
        });
        this.ActualizarCodigo(form1.codigoForm);
        this.limpliarCampos();
        this.dialogRef.close(true)
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

  limpliarCampos() {
    this.primeroFormGroup.reset();
    this.segundoFormGroup.reset();
    this.terceroFormGroup.reset();
  }

  obtenerNacionalidades() {
    this.rest.getListaNacionalidades().subscribe(res => {
      this.nacionalidades = res;
      this.obtenerEmpleado();
      this.filteredOptions = this.NacionalidadControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    });
  }

  obtenerEmpleado() {

    const { apellido, cedula, codigo, correo, domicilio, esta_civil, estado, fec_nacimiento, genero, 
      id, id_nacionalidad, mail_alternativo, nombre, telefono } = this.empleado;

    this.primeroFormGroup.setValue({
      codigoForm: codigo,
      nombreForm: nombre,
      apellidoForm: apellido,
      cedulaForm: cedula,
      emailForm: correo,
      correoAlternativoForm: mail_alternativo,
      fechaForm: fec_nacimiento,
    });

    this.segundoFormGroup.setValue({
      telefonoForm: telefono,
      domicilioForm: domicilio,
      estadoCivilForm: esta_civil,
      generoForm: genero,
      estadoForm: estado,
      nacionalidadForm: this.nacionalidades.filter(o => { return id_nacionalidad === o.id}).map(o => { return o.nombre })
    });

    this.user.BuscarDatosUser(id).subscribe(res => {
      this.usuario = [];
      this.usuario = res;
      this.terceroFormGroup.patchValue({
        rolForm: this.usuario[0].id_rol,
        userForm: this.usuario[0].usuario,
      });
    });
  }

  cancelar() { 
    this.dialogRef.close(false)
  }

}
