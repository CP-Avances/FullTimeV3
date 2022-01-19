import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VacacionesService } from 'src/app/servicios/vacaciones/vacaciones.service';

@Component({
  selector: 'app-cancelar-vacaciones',
  templateUrl: './cancelar-vacaciones.component.html',
  styleUrls: ['./cancelar-vacaciones.component.css']
})
export class CancelarVacacionesComponent implements OnInit {

  constructor(
    
    private restV: VacacionesService,
    public dialogRef: MatDialogRef<CancelarVacacionesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

  aceptarAdvertencia() {
    this.restV.EliminarVacacion(this.data).subscribe(res => {
      console.log(res);
      this.dialogRef.close(true);
    });
  }
}
