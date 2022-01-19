import { Component, OnInit, Inject } from '@angular/core';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-editar-titulo',
  templateUrl: './editar-titulo.component.html',
  styleUrls: ['./editar-titulo.component.css']
})
export class EditarTituloComponent implements OnInit {

  cgTitulos: any = [];

  observa = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  idTitulo = new FormControl('', [Validators.required])

  public editarTituloEmpleadoForm = new FormGroup({
    observacionForm: this.observa,
    idTituloForm: this.idTitulo
  });

  constructor(
    private rest: EmpleadoService,
    private toastr: ToastrService,
    private restTitulo: TituloService,
    private validacionService: ValidacionesService,
    private dialogRef: MatDialogRef<EditarTituloComponent>,
    @Inject(MAT_DIALOG_DATA) public titulo: any
  ) { }

  ngOnInit(): void {
    this.obtenerTitulos();
  }

  ActualizarTituloEmpleado(form){
    let dataTituloEmpleado = {
      observacion: form.observacionForm,
      id_titulo: form.idTituloForm,
    }
    this.rest.putEmpleadoTituloRest(this.titulo.id , dataTituloEmpleado).subscribe(data => {
      this.toastr.success('Actualización Exitosa', 'Titulo asignado al empleado', {
        timeOut: 6000,
      });
      this.dialogRef.close(data)
    });
  }

  obtenerTitulos() {
    this.restTitulo.getTituloRest().subscribe(data => {
      this.cgTitulos = data;
      this.llenarFormulario()
    });
  }

  llenarFormulario() {
    const { observaciones, nombre } = this.titulo;

    const [ id_titulo ] = this.cgTitulos.filter(o => { return o.nombre === nombre }).map(o => { return o.id});

    this.editarTituloEmpleadoForm.patchValue({
      observacionForm: observaciones,
      idTituloForm: id_titulo
    })
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  VerificarTitulo() {
    window.open("https://www.senescyt.gob.ec/web/guest/consultas", "_blank");
  }
  
  cancelar(){
    console.log('cancelar edicion titulo');
    this.dialogRef.close(false)
  }

}
