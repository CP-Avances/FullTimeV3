import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editar-notificacion',
  templateUrl: './editar-notificacion.component.html',
  styleUrls: ['./editar-notificacion.component.css']
})
export class EditarNotificacionComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditarNotificacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
  }

}
