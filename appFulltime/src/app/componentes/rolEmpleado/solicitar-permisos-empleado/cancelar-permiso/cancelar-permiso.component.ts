import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PermisosService } from 'src/app/servicios/permisos/permisos.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cancelar-permiso',
  templateUrl: './cancelar-permiso.component.html',
  styleUrls: ['./cancelar-permiso.component.css']
})
export class CancelarPermisoComponent implements OnInit {

  constructor(
    private restP: PermisosService,
    private toastr: ToastrService,
    public dialogRef: MatDialogRef<CancelarPermisoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  aceptarAdvertencia() {
    this.restP.EliminarPermiso(this.data.id, this.data.documento).subscribe(res => {
      console.log(res);
      this.dialogRef.close(true);
    }, err => {
      const { access, message } = err.error.message;
      if (access === false) {
        this.toastr.error(message)
        this.dialogRef.close(false);
      }
    });
  }

}
