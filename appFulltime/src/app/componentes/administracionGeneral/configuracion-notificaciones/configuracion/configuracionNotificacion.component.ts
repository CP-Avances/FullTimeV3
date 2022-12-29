import { Component, OnInit, Inject } from '@angular/core';
import { RealTimeService } from 'src/app/servicios/notificaciones/real-time.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-configuracionNotificacion',
    templateUrl: './configuracionNotificacion.component.html',
    styleUrls: ['./configuracionNotificacion.component.css']
})

export class ConfiguracionNotificacionComponent implements OnInit {

    formGroup: FormGroup;

    constructor(
        public formBuilder: FormBuilder,
        private restN: RealTimeService,
        private toaster: ToastrService,
        public dialogRef: MatDialogRef<ConfiguracionNotificacionComponent>,
        @Inject(MAT_DIALOG_DATA) public empleados: any
      ) {
        this.formGroup = formBuilder.group({
          vacaMail: false,
          vacaNoti: false,
          permisoMail: false,
          permisoNoti: false,
          horaExtraMail: false,
          horaExtraNoti: false,
          comidaMail: false,
          comidaNoti: false,
          comunicadoMail: false,
          comunicadoNoti: false,
        });
      }

    ngOnInit(): void {
        console.log("Empleados: ",this.empleados);
        if((this.empleados.length == 1)){
            this.empleados.forEach(item => {
                this.restN.ObtenerConfiguracionEmpleado(item.id).subscribe(res => {
                    this.formGroup.patchValue({
                        vacaMail: res[0].vaca_mail,
                        vacaNoti: res[0].vaca_noti,
                        permisoMail: res[0].permiso_mail,
                        permisoNoti: res[0].permiso_noti,
                        horaExtraMail: res[0].hora_extra_mail,
                        horaExtraNoti: res[0].hora_extra_noti,
                        comidaMail: res[0].comida_mail,
                        comidaNoti: res[0].comida_noti,
                        comunicadoMail: res[0].comunicado_mail,
                        comunicadoNoti: res[0].comunicado_noti
                    });
        
                }, error => {
                    console.log(error);
                });
            });
        }
        
    }

    CrearConfiguracion(form, item: any) {

        let data = {
            id_empleado: item.id,
            vaca_mail: form.vacaMail,
            vaca_noti: form.vacaNoti,
            permiso_mail: form.permisoMail,
            permiso_noti: form.permisoNoti,
            hora_extra_mail: form.horaExtraMail,
            hora_extra_noti: form.horaExtraNoti,
            comida_mail: form.comidaMail,
            comida_noti: form.comidaNoti,
            comunicado_mail: form.comunicadoMail,
            comunicado_noti: form.comunicadoNoti
        }
            this.restN.IngresarConfigNotiEmpleado(data).subscribe(res => {
            this.dialogRef.close();
            if(this.empleados.length == 1){
                this.toaster.success('Operación exitosa', 'Configuración Actualizada', {
                    timeOut: 6000,
                });
            }
        });
    }
    
    ActualizarConfiguracion(form) {
        this.empleados.forEach(item => {
            let data = {
                vaca_mail: form.vacaMail,
                vaca_noti: form.vacaNoti,
                permiso_mail: form.permisoMail,
                permiso_noti: form.permisoNoti,
                hora_extra_mail: form.horaExtraMail,
                hora_extra_noti: form.horaExtraNoti,
                comida_mail: form.comidaMail,
                comida_noti: form.comidaNoti,
                comunicado_mail: form.comunicadoMail,
                comunicado_noti: form.comunicadoNoti
            }

            this.restN.ObtenerConfiguracionEmpleado(item.id).subscribe(res => {
                this.restN.ActualizarConfigNotiEmpl(item.id, data).subscribe(res => {
                    this.dialogRef.close();
                    if(this.empleados.length == 1){
                        this.toaster.success('Operación exitosa', 'Configuración Actualizada', {
                            timeOut: 6000,
                        });
                    }
                });
    
            }, error => {
                console.log(error);
                this.CrearConfiguracion(form, item);
            });
        });
    }

}