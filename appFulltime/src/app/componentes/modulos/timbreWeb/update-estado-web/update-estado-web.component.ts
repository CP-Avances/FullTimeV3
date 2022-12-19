import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-update-estado-web',
  templateUrl: './update-estado-web.component.html',
  styleUrls: ['./update-estado-web.component.css']
})
export class UpdateEstadoWebComponent implements OnInit {

  BooleanAppMap: any = {'true': 'Si', 'false': 'No'};
  usuarios: any = [];
  
  constructor(
    public dialogRef: MatDialogRef<UpdateEstadoWebComponent>,
    @Inject(MAT_DIALOG_DATA) public empleados: any
  ) { }

  ngOnInit(): void {  
    this.usuarios = this.empleados;
  }

}