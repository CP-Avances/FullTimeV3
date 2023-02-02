import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-registro-dispositivo',
  templateUrl: './delete-registro-dispositivo.component.html',
  styleUrls: ['./delete-registro-dispositivo.component.css']
})
export class DeleteRegistroDispositivoComponent implements OnInit {

  BooleanAppMap: any = {'true': 'Si', 'false': 'No'};
  usuarios: any = [];
  
  constructor(
    public dialogRef: MatDialogRef<DeleteRegistroDispositivoComponent>,
    @Inject(MAT_DIALOG_DATA) public dispositivos: any
  ) { }

  ngOnInit(): void {  
    this.usuarios = this.dispositivos;
  }

}