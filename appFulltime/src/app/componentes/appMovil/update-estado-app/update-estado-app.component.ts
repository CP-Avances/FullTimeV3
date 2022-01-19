import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-estado-app',
  templateUrl: './update-estado-app.component.html',
  styleUrls: ['./update-estado-app.component.css']
})
export class UpdateEstadoAppComponent implements OnInit {

  BooleanAppMap: any = {'true': 'Si', 'false': 'No'};
  
  constructor(
    public dialogRef: MatDialogRef<UpdateEstadoAppComponent>,
    @Inject(MAT_DIALOG_DATA) public empleados: any
  ) { }

  ngOnInit(): void { }

}
