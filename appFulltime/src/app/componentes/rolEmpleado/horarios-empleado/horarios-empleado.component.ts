import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

import { EmplCargosService } from 'src/app/servicios/empleado/empleadoCargo/empl-cargos.service';
import { PlanHorarioService } from 'src/app/servicios/horarios/planHorario/plan-horario.service';
import { EmpleadoHorariosService } from 'src/app/servicios/horarios/empleadoHorarios/empleado-horarios.service';

import { RegistoEmpleadoHorarioComponent } from 'src/app/componentes/empleadoHorario/registo-empleado-horario/registo-empleado-horario.component';
import { EditarHorarioEmpleadoComponent } from 'src/app/componentes/empleadoHorario/editar-horario-empleado/editar-horario-empleado.component';
import { MetodosComponent } from 'src/app/componentes/metodoEliminar/metodos.component';
import { EmpleadoService } from 'src/app/servicios/empleado/empleadoRegistro/empleado.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-horarios-empleado',
  templateUrl: './horarios-empleado.component.html',
  styleUrls: ['./horarios-empleado.component.css']
})
export class HorariosEmpleadoComponent implements OnInit {

  idEmpleado: string;
  idCargo: any = [];

  /* Items de paginación de la tabla */
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  selectedIndex: number;

  /** Contador */
  cont = 0;
  hipervinculo: string = environment.url

  constructor(
    public restCargo: EmplCargosService,
    public restPlanH: PlanHorarioService,
    public vistaRegistrarDatos: MatDialog,
    public restEmpleHorario: EmpleadoHorariosService,
    public restEmpleado: EmpleadoService,
    public router: Router,
    private toastr: ToastrService,
  ) {
    this.idEmpleado = localStorage.getItem('empleado');
  }

  ngOnInit(): void {
    this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
    this.ObtenerEmpleado(parseInt(this.idEmpleado));
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

    // Método para ver la información del empleado 
    empleado: any = [];
    ObtenerEmpleado(idemploy: any) {
      this.empleado = [];
      this.restEmpleado.getOneEmpleadoRest(idemploy).subscribe(data => {
        this.empleado = data;
      })
    }

  /* 
   * ***************************************************************************************************
   *                               MÉTODO PARA MOSTRAR DATOS
   * ***************************************************************************************************
  */

  /* Método para mostrar datos de horario */
  horariosEmpleado: any;
  horariosEmpleadoTotales: any = [];
  ObtenerHorariosEmpleado(id_empleado: number) {
    this.horariosEmpleado = [];
    this.horariosEmpleadoTotales = [];
    this.restCargo.BuscarIDCargo(id_empleado).subscribe(datos => {
      this.idCargo = datos;
      console.log("idCargo ", this.idCargo[0].id);
      for (let i = 0; i <= this.idCargo.length - 1; i++) {
        this.restEmpleHorario.BuscarHorarioCargo(this.idCargo[i]['id']).subscribe(datos => {
          this.horariosEmpleado = datos;
          if (this.horariosEmpleado.length === 0) {
            console.log("No se encuentran registros")
          }
          else {
            if (this.cont === 0) {
              this.horariosEmpleadoTotales = datos
              this.cont++;
            }
            else {
              this.horariosEmpleadoTotales = this.horariosEmpleadoTotales.concat(datos);
              console.log("Datos autorizacion" + i + '', this.horariosEmpleadoTotales)
            }
          }
        })
      }
    });
  }

  /* 
   ****************************************************************************************************
   *                               ABRIR VENTANAS PARA REGISTRAR DATOS DEL EMPLEADO
   ****************************************************************************************************
  */

  /* Ventana para registrar horario */
  AbrirVentanaEmplHorario(): void {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      console.log("idcargo ", this.idCargo[0].max)
      this.vistaRegistrarDatos.open(RegistoEmpleadoHorarioComponent,
        { width: '600px', data: { idEmpleado: this.idEmpleado, idCargo: this.idCargo[0].max } }).afterClosed().subscribe(item => {
          this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
        });
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
    });
  }

  /* 
   ****************************************************************************************************
   *                               ABRIR VENTANAS PARA EDITAR DATOS DEL EMPLEADO
   ****************************************************************************************************
  */
  /* Ventana para editar horario del empleado */
  AbrirEditarHorario(datoSeleccionado: any): void {
    console.log(datoSeleccionado);
    this.vistaRegistrarDatos.open(EditarHorarioEmpleadoComponent,
      { width: '600px', data: { idEmpleado: this.idEmpleado, datosHorario: datoSeleccionado } })
      .afterClosed().subscribe(item => {
        this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
      });
  }

  /* ****************************************************************************************************
   *                               CARGAR HORARIOS DEL EMPLEADO CON PLANTILLA
   * ****************************************************************************************************/
  nameFileHorario: string;
  archivoSubidoHorario: Array<File>;
  archivoHorarioForm = new FormControl('');

  fileChangeHorario(element) {
    this.restCargo.BuscarIDCargoActual(parseInt(this.idEmpleado)).subscribe(datos => {
      this.idCargo = datos;
      this.archivoSubidoHorario = element.target.files;
      this.nameFileHorario = this.archivoSubidoHorario[0].name;
      let arrayItems = this.nameFileHorario.split(".");
      let itemExtencion = arrayItems[arrayItems.length - 1];
      let itemName = arrayItems[0].slice(0, 16);
      console.log(itemName.toLowerCase());
      if (itemExtencion == 'xlsx' || itemExtencion == 'xls') {
        if (itemName.toLowerCase() == 'horario empleado') {
          this.plantillaHorario();
          //this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
        } else {
          this.toastr.error('Plantilla seleccionada incorrecta', '', {
            timeOut: 6000,
          });
          this.archivoHorarioForm.reset();
          this.nameFileHorario = '';
        }
      } else {
        this.toastr.error('Error en el formato del documento', 'Plantilla no aceptada', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
    }, error => {
      this.toastr.info('El empleado no tiene registrado un Cargo', 'Primero Registrar Cargo', {
        timeOut: 6000,
      })
       this.archivoHorarioForm.reset();
                this.nameFileHorario = '';
    });
  }

  plantillaHorario() {
    let formData = new FormData();
    for (var i = 0; i < this.archivoSubidoHorario.length; i++) {
      formData.append("uploads[]", this.archivoSubidoHorario[i], this.archivoSubidoHorario[i].name);
      console.log("toda la data", formData)
    }
    this.restEmpleHorario.VerificarDatos_EmpleadoHorario(formData, parseInt(this.idEmpleado)).subscribe(res => {
      if (res.message === 'error') {
        this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
          'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
          'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema.', 'Verificar Plantilla', {
          timeOut: 6000,
        });
        this.archivoHorarioForm.reset();
        this.nameFileHorario = '';
      }
      else {
        this.restEmpleHorario.VerificarPlantilla_EmpleadoHorario(formData).subscribe(resD => {
          if (resD.message === 'error') {
            this.toastr.error('Para el buen funcionamiento del sistema verificar los datos de la plantilla. ' +
              'Recuerde que el horario indicado debe estar registrado en el sistema y debe tener su respectivo detalle de horario, ' +
              'el empleado debe tener registrado un contrato de trabajo y las fechas indicadas no deben estar duplicadas dentro del sistema.', 'Verificar Plantilla', {
              timeOut: 6000,
            });
            this.archivoHorarioForm.reset();
            this.nameFileHorario = '';
          }
          else {
            this.restEmpleHorario.SubirArchivoExcel(formData, parseInt(this.idEmpleado), parseInt(this.empleado[0].codigo)).subscribe(resC => {
              this.toastr.success('Operación Exitosa', 'Plantilla de Horario importada.', {
                timeOut: 6000,
              });
              this.restEmpleHorario.CreaPlanificacion(formData, parseInt(this.idEmpleado), parseInt(this.empleado[0].codigo)).subscribe(resP => {
                this.toastr.success('Operación Exitosa', 'Plantilla de Horario importada.', {
                  timeOut: 6000,
                });
                this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
                //this.actualizar = false;
                //window.location.reload(this.actualizar);
                this.archivoHorarioForm.reset();
                this.nameFileHorario = '';
              });
            });
          }
        });
      }
    });
  }

  /** Función para eliminar registro seleccionado HORARIO*/
  EliminarHorario(id_horario: number) {
    this.restEmpleHorario.EliminarRegistro(id_horario).subscribe(res => {
      this.toastr.error('Registro eliminado','', {
        timeOut: 6000,
      });
      this.ObtenerHorariosEmpleado(parseInt(this.idEmpleado));
    });
  }

  /** Función para confirmar si se elimina o no un registro */
  ConfirmarDeleteHorario(datos: any) {
    console.log(datos);
    this.vistaRegistrarDatos.open(MetodosComponent, { width: '450px' }).afterClosed()
      .subscribe((confirmado: Boolean) => {
        if (confirmado) {
          this.EliminarHorario(datos.id);
        } else {
          this.router.navigate(['/horariosEmpleado']);
        }
      });
  }

}
