import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { DepartamentosService } from 'src/app/servicios/catalogos/catDepartamentos/departamentos.service';
import { NotificacionesService } from 'src/app/servicios/catalogos/catNotificaciones/notificaciones.service';
import { TipoPermisosService } from 'src/app/servicios/catalogos/catTipoPermisos/tipo-permisos.service';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { EditarNotificacionComponent } from './editar-notificacion/editar-notificacion.component';
import { ListarNotiAutorizacionesComponent } from '../catNotiAutorizaciones/listar/listar-noti-autorizaciones/listar-noti-autorizaciones.component';
import { SucursalService } from 'src/app/servicios/sucursales/sucursal.service';
import { Router } from '@angular/router';

interface Nivel {
  valor: string
}

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  //encapsulation: ViewEncapsulation.None
})
export class NotificacionesComponent implements OnInit {

  departamentos: any = [];
  tipoPermiso: any = [];

  tipo = new FormControl('', Validators.required);
  nivel = new FormControl('', Validators.required);
  idDepartamento = new FormControl('', Validators.required);
  idTipoPermiso = new FormControl('', Validators.required);
  sucursal = new FormControl('', Validators.required);

  public nuevaNotificacionForm = new FormGroup({
    tipoForm: this.tipo,
    nivelForm: this.nivel,
    idSucForm: this.sucursal,
    idDepartamentoForm: this.idDepartamento,
    idTipoPermisoForm: this.idTipoPermiso
  });

  niveles: Nivel[] = [
    { valor: '1' },
    { valor: '2' },
    { valor: '3' },
    { valor: '4' },
    { valor: '5' }
  ];

  HabilitarD: boolean = true;
  HabilitarP: boolean = true;
  HabilitarS: boolean = true;

  tipo_permiso_res: any = [];
  noti_res: any = [];
  depa_res: any = [];
  sucu_res: any = [];

  // items de paginacion de la tabla
  tamanio_pagina: number = 5;
  numero_pagina: number = 1;
  pageSizeOptions = [5, 10, 20, 50];
  dataParams: any;

  constructor(
    private toastr: ToastrService,
    private rest: NotificacionesService,
    private restD: DepartamentosService,
    private restP: TipoPermisosService,
    private restS: SucursalService,
    private router: Router,
    public vistaRegistrarDatos: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataParams = this.router.routerState.snapshot.root.children[0].params;
    console.log(this.dataParams);
    this.setValores();
  }

  setValores() {
    this.nuevaNotificacionForm.patchValue({ nivelForm: this.dataParams.nivel });
    this.rest.getNotiByDepaRest(parseInt(this.dataParams.id_depa)).subscribe(res => {
      this.noti_res = res;
    }); 
    this.restS.getOneSucursalRest(this.dataParams.id_suc).subscribe(res => {
      this.sucu_res = res;
      this.nuevaNotificacionForm.patchValue({ idSucForm: parseInt(this.dataParams.id_suc) });
    });
    this.restD.EncontrarUnDepartamento(this.dataParams.id_depa).subscribe(res => {
      this.departamentos = [res];
      this.nuevaNotificacionForm.patchValue({ idDepartamentoForm: parseInt(this.dataParams.id_depa) });
    });
    this.restP.getTipoPermisoRest().subscribe(res => {
      this.tipo_permiso_res = res;
      console.log(this.tipo_permiso_res)
      this.ObtenerTipoPermiso(parseInt(this.dataParams.id_depa))
    });
  }

  ManejarPagina(e: PageEvent) {
    this.tamanio_pagina = e.pageSize;
    this.numero_pagina = e.pageIndex + 1;
  }

  tipo_permiso_Asignado: any = [];
  ObtenerTipoPermiso(id_depa) {
    this.HabilitarP = true;
    this.tipoPermiso = []
    this.tipo_permiso_Asignado = [];
    this.noti_res.forEach(elm => {
      if (id_depa == elm.departamento) {
        this.tipo_permiso_Asignado.push(elm.descripcion);
      }
    });
    // console.log(this.tipo_permiso_Asignado);
    this.tipo_permiso_res.forEach(element => {
      if (this.tipo_permiso_Asignado.indexOf(element.descripcion) < 0) {
        let dataTipoPermiso = {
          id: element.id,
          descripcion: element.descripcion,
        }
        this.tipoPermiso.push(dataTipoPermiso);
      }
    });
    // console.log(this.tipoPermiso);
  }

  IngresarSoloNumeros(evt) {
    if (window.event) {
      var keynum = evt.keyCode;
    }
    else {
      keynum = evt.which;
    }
    // Comprobamos si se encuentra en el rango numérico y que teclas no recibirá.
    if ((keynum > 47 && keynum < 58) || keynum == 8 || keynum == 13 || keynum == 6) {
      return true;
    }
    else {
      this.toastr.info('No se admite el ingreso de letras', 'Usar solo números', {
        timeOut: 6000,
      })
      return false;
    }
  }

  ObtenerMensajeErrorTipoRequerido() {
    if (this.tipo.hasError('required')) {
      return 'Campo obligatorio';
    }
  }

  insertarNotificacion(form) {
    let newNoti = {
      tipo: form.tipoForm,
      nivel: form.nivelForm,
      id_departamento: form.idDepartamentoForm,
      id_tipo_permiso: form.idTipoPermisoForm
    }
    this.rest.postNotificacionesRest(newNoti).subscribe(response => {
      if (response.message === 'error') {
        this.toastr.error('El código ingresado ya esta siendo usado', 'CÓDIGO DE NOTIFICACIÓN DEBE SER ÚNICO', {
          timeOut: 6000,
        });
      }
      else {
        this.toastr.success('Operación Exitosa', 'Notificación guardada', {
          timeOut: 6000,
        });
        this.limpiarCampos();
        this.setValores();
      }
    }, error => {
      console.log(error);
    })
  }

  limpiarCampos() {
    this.nuevaNotificacionForm.reset();
  }

  EditarNotificacion(datosSeleccionados: any): void {
    this.vistaRegistrarDatos.open(EditarNotificacionComponent, { width: '450px', data: datosSeleccionados }).disableClose = true;
  }

  AbrirListaNotificacionAutorizacion(datosSeleccionados: any): void {
    this.vistaRegistrarDatos.open(ListarNotiAutorizacionesComponent, { width: '500px', data: datosSeleccionados }).disableClose = true;
  }
}
