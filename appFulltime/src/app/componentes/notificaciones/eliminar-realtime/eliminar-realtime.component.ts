import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';

@Component({
  selector: 'app-eliminar-realtime',
  templateUrl: './eliminar-realtime.component.html',
  styleUrls: ['./eliminar-realtime.component.css']
})
export class EliminarRealtimeComponent implements OnInit {

  ids: any = [];
  contenidoSolicitudes: boolean = false;
  contenidoAvisos: boolean = false;

  constructor(
    private toastr: ToastrService,
    private restAvisos: TimbresService,
    private realtime: RealTimeService,
    public dialogRef: MatDialogRef<EliminarRealtimeComponent>,
    @Inject(MAT_DIALOG_DATA) public Notificaciones: any,
  ) { }

  ngOnInit(): void {
    this.ids = this.Notificaciones.lista.map(obj => {
      return obj.id
    });
    this.Opcion();
  }

  Opcion(){
    if (this.Notificaciones.opcion === 1) {
      this.contenidoAvisos = true;
      console.log('AVISOS DE TIMBRES');
    } else if (this.Notificaciones.opcion === 2) {
      this.contenidoSolicitudes = true;
      console.log('NOTIFICACIONES DE PERMISOS, HORAS EXTRAS Y VACACIONES');
    }
  }

  ConfirmarListaNotificaciones(){
    if (this.Notificaciones.opcion === 1) {
      console.log('Eliminacion de notificaciones de timbres');
      this.restAvisos.EliminarAvisos(this.ids).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        })
      });
      this.dialogRef.close(true);
      
    } else if (this.Notificaciones.opcion === 2) {
      console.log('Eliminacion de notificaciones de permisos, horas extras y vacaciones');
      this.realtime.EliminarNotificaciones(this.ids).subscribe(res => {
        console.log(res);
        this.toastr.success(res.message,'', {
          timeOut: 6000,
        })
      });
      this.dialogRef.close(true);
    }
  }

}
