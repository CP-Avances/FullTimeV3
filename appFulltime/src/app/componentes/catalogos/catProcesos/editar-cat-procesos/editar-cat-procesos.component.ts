import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProcesoService } from 'src/app/servicios/catalogos/catProcesos/proceso.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// ayuda para crear los niveles
interface Nivel {
  valor: string;
  nombre: string
}

@Component({
  selector: 'app-editar-cat-procesos',
  templateUrl: './editar-cat-procesos.component.html',
  styleUrls: ['./editar-cat-procesos.component.css']
})

export class EditarCatProcesosComponent implements OnInit {

  // Control de los campos del formulario
  nombre = new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]);
  nivel = new FormControl('', Validators.required);
  procesoPadre = new FormControl('', Validators.required);

  procesos: any = [];
  seleccionarNivel;
  seleccionarProceso;

  // asignar los campos en un formulario en grupo
  public nuevoProcesoForm = new FormGroup({
    procesoNombreForm: this.nombre,
    procesoNivelForm: this.nivel,
    procesoProcesoPadreForm: this.procesoPadre
  });

  // Arreglo de niveles existentes
  niveles: Nivel[] = [
    { valor: '1', nombre: '1' },
    { valor: '2', nombre: '2' },
    { valor: '3', nombre: '3' },
    { valor: '4', nombre: '4' },
    { valor: '5', nombre: '5' }
  ];

  constructor(
    private rest: ProcesoService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<EditarCatProcesosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.getProcesos();
    this.ImprimirDatos();
  }

  ImprimirDatos() {
    this.nuevoProcesoForm.patchValue({
      procesoNombreForm: this.data.datosP.nombre,
      procesoNivelForm: this.data.datosP.nivel,
    })
    this.seleccionarNivel = String(this.data.datosP.nivel);
    if (this.data.datosP.proc_padre === null) {
      this.seleccionarProceso = 0;
      this.nuevoProcesoForm.patchValue({
        procesoProcesoPadreForm: 'Ningún Proceso'
      })
      //console.log(this.seleccionarProceso)
    }
    else {
      this.nuevoProcesoForm.patchValue({
        procesoProcesoPadreForm: this.data.datosP.proc_padre
      })
      this.seleccionarProceso = this.data.datosP.proc_padre;
      //console.log(this.seleccionarProceso)
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

  obtenerMensajeErrorNombre() {
    if (this.nombre.hasError('required')) {
      return 'Campo obligatorio';
    }
    return this.nombre.hasError('pattern') ? 'No ingresar números' : '';
  }

  insertarProceso(form) {
    var procesoPadreId
    var procesoPadreNombre = form.procesoProcesoPadreForm;
    if (procesoPadreNombre == 0) {
      let dataProceso = {
        id: this.data.datosP.id,
        nombre: form.procesoNombreForm,
        nivel: form.procesoNivelForm,
      };
      this.ActualizarDatos(dataProceso);
    } else {
      this.rest.getIdProcesoPadre(procesoPadreNombre).subscribe(data => {
        procesoPadreId = data[0].id;
        let dataProceso = {
          id: this.data.datosP.id,
          nombre: form.procesoNombreForm,
          nivel: form.procesoNivelForm,
          proc_padre: procesoPadreId
        };
        this.ActualizarDatos(dataProceso);
      });
    }
  }

  ActualizarDatos(datos) {
    this.rest.ActualizarUnProceso(datos).subscribe(response => {
      console.log(datos)
      this.toastr.success('Operacion Exitosa', 'Proceso actualizado', {
        timeOut: 6000,
      });
      this.CerrarVentanaRegistroProceso();
    }, error => { });
  }

  limpiarCampos() {
    this.nuevoProcesoForm.reset();
  }

  getProcesos() {
    this.procesos = [];
    this.rest.getProcesosRest().subscribe(data => {
      this.procesos = data
    })
  }

  CerrarVentanaRegistroProceso() {
    this.limpiarCampos();
    this.dialogRef.close();
    window.location.reload();
  }

  Salir() {
    this.limpiarCampos();
    this.dialogRef.close();
  }

}
