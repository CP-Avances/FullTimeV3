import { Component, OnInit, Inject } from '@angular/core';
import { TituloService } from 'src/app/servicios/catalogos/catTitulos/titulo.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidacionesService } from '../../../../servicios/validaciones/validaciones.service';

@Component({
  selector: 'app-titulo-empleado',
  templateUrl: './titulo-empleado.component.html',
  styleUrls: ['./titulo-empleado.component.css'],
})
export class TituloEmpleadoComponent implements OnInit {

  // @Input() idEmploy: string;

  cgTitulos: any = [];
  selectTitle: string = '';

  observa = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  idTitulo = new FormControl('', [Validators.required])

  public nuevoTituloEmpleadoForm = new FormGroup({
    observacionForm: this.observa,
    idTituloForm: this.idTitulo
  });

  constructor(
    public restTitulo: TituloService,
    public restEmpleado: EmpleadoService,
    private toastr: ToastrService,
    private validacionService: ValidacionesService,
    private dialogRef: MatDialogRef<TituloEmpleadoComponent>,
    @Inject(MAT_DIALOG_DATA) public empleado: any
  ) { }

  ngOnInit(): void {
    this.obtenerTitulos();
  }

  obtenerTitulos() {
    this.restTitulo.getTituloRest().subscribe(data => {
      this.cgTitulos = data;
    });
  }

  insertarTituloEmpleado(form) {
    let dataTituloEmpleado = {
      observacion: form.observacionForm,
      id_empleado: this.empleado,
      id_titulo: form.idTituloForm,
    }
    this.restEmpleado.postEmpleadoTitulos(dataTituloEmpleado).subscribe(data => {
      this.toastr.success('Operacion Exitosa', 'Titulo asignado al empleado', {
        timeOut: 6000,
      });
      this.limpiarCampos();
      this.dialogRef.close(true)
    });
  }

  IngresarSoloLetras(e) {
    return this.validacionService.IngresarSoloLetras(e);
  }

  limpiarCampos() {
    this.nuevoTituloEmpleadoForm.reset();
  }

  cerrarRegistro() {
    this.dialogRef.close(false)
  }

  VerificarTitulo() {
    window.open("https://www.senescyt.gob.ec/web/guest/consultas", "_blank");
  }
}
