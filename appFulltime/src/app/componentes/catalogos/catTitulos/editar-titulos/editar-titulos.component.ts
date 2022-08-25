import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { NivelTitulosService } from 'src/app/servicios/nivelTitulos/nivel-titulos.service';

@Component({
  selector: 'app-editar-titulos',
  templateUrl: './editar-titulos.component.html',
  styleUrls: ['./editar-titulos.component.css']
})

export class EditarTitulosComponent implements OnInit {

  // CONTROL DE LOS CAMPOS DEL FORMULARIO
  nombre = new FormControl('', [Validators.required, Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}")]);
  nivelF = new FormControl('');
  nombreNivel = new FormControl('', Validators.pattern("[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{3,48}"))


  // ASIGNAR LOS CAMPOS EN UN FORMULARIO EN GRUPO
  public nuevoTituloForm = new FormGroup({
    tituloNombreForm: this.nombre,
    tituloNivelForm: this.nivelF,
    nombreNivelForm: this.nombreNivel
  });

  // ARREGLO DE NIVELES EXISTENTES
  HabilitarDescrip: boolean = true;
  selectNivel: any;
  niveles: any = [];
  idNivel: any = [];
  estilo: any;

  constructor(
    private ntitulo: NivelTitulosService,
    private rest: TituloService,
    private toastr: ToastrService,
    public ventana: MatDialogRef<EditarTitulosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.obtenerNivelesTitulo();
    this.ImprimirDatos();
  }

  obtenerNivelesTitulo() {
    this.niveles = [];
    this.ntitulo.getNivelesTituloRest().subscribe(res => {
      this.niveles = res;
      this.niveles[this.niveles.length] = { nombre: "OTRO" };
      this.selectNivel = this.niveles[this.niveles.length - 1].nombre;
    });
  }

  ActivarDesactivarNombre(form1) {
    console.log('nivel', form1.tituloNivelForm);
    if (form1.tituloNivelForm === undefined) {
      this.nuevoTituloForm.patchValue({ nombreNivelForm: '' });
      this.estilo = { 'visibility': 'visible' }; this.HabilitarDescrip = false;
      this.toastr.info('Ingresar nombre de nivel de titulación', '', {
        timeOut: 6000,
      });
    }
    else {
      this.nuevoTituloForm.patchValue({ nombreNivelForm: '' });
      this.estilo = { 'visibility': 'hidden' }; this.HabilitarDescrip = true;
    }
  }

  GuardarNivel(form) {
    let dataNivelTitulo = {
      nombre: form.nombreNivelForm,
    };
    this.ntitulo.postNivelTituloRest(dataNivelTitulo).subscribe(response => {
      this.ntitulo.BuscarNivelID().subscribe(datos => {
        var idNivel = datos[0].max;
        console.log('id_nivel', datos[0].max)
        this.ActualizarTitulo(form, idNivel);
      })
    });
  }

  ActualizarTitulo(form, idNivel) {
    let dataTitulo = {
      id: this.data.id,
      nombre: form.tituloNombreForm,
      id_nivel: idNivel,
    };
    this.rest.ActualizarUnTitulo(dataTitulo).subscribe(response => {
      this.toastr.success('Operación Exitosa', 'Título actualizado', {
        timeOut: 6000,
      });
      this.CerrarVentanaRegistroTitulo();
    }, error => {
    });
  }


  IngresarSoloLetras(e) {
    let key = e.keyCode || e.which;
    let tecla = String.fromCharCode(key).toString();
    // SE DEFINE TODO EL ABECEDARIO QUE SE VA A USAR.
    let letras = " áéíóúabcdefghijklmnñopqrstuvwxyzÁÉÍÓÚABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    // ES LA VALIDACIÓN DEL KEYCODES, QUE TECLAS RECIBE EL CAMPO DE TEXTO.
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

  ObtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo Obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'Ingrese un nombre válido' : '';
  }

  ObtenerMensajeErrorNivel() {
    if (this.nombreNivel.hasError('pattern')) {
      return 'Ingrese un nombre válido';
    }
  }

  InsertarTitulo(form) {
    if (form.tituloNivelForm === undefined || form.tituloNivelForm === 'OTRO') {
      if (form.nombreNivelForm != '') {
        this.GuardarNivel(form);
      }
      else {
        this.toastr.info('Ingrese un nombre de nivel o seleccione uno de la lista de niveles', '', {
          timeOut: 6000,
        });
      }
    }
    else {
      this.ActualizarTitulo(form, form.tituloNivelForm);
    }

  }

  ImprimirDatos() {
    this.idNivel = [];
    console.log("nivel_nombre", this.data.nivel);
    this.ntitulo.BuscarNivelNombre(this.data.nivel).subscribe(datos => {
      this.idNivel = datos;
      this.nuevoTituloForm.patchValue({
        tituloNombreForm: this.data.nombre,
        tituloNivelForm: this.data.nivel
      })
      this.selectNivel = this.idNivel[0].id;
      console.log("nivel_id", this.idNivel[0].id, this.idNivel[0].nombre, "otro datos", this.selectNivel);
    })
  }

  LimpiarCampos() {
    this.nuevoTituloForm.reset();
  }

  CerrarVentanaRegistroTitulo() {
    this.obtenerNivelesTitulo();
    this.LimpiarCampos();
    this.ImprimirDatos();
    this.ventana.close();
  }

  Salir() {
    this.LimpiarCampos();
    this.ventana.close();
  }

}
