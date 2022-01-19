import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { EmpleadoService } from '../../../servicios/empleado/empleadoRegistro/empleado.service';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['../main-nav.component.css']
})
export class SearchComponent implements OnInit {

  filteredOptions: Observable<string[]>;
  options: string[] = [];
  buscar_empl: any = [];

  myControl = new FormControl();

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  constructor(
    private empleadoService: EmpleadoService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
    this.BarraBusquedaEmpleados();
  }

  BarraBusquedaEmpleados() {

    if (!!sessionStorage.getItem('lista-empleados')) {
      // console.log('ya hay lista en la sesion iniciada');
      let empleados = JSON.parse(sessionStorage.getItem('lista-empleados'));

      empleados.forEach(obj => {
        this.options.push(obj.empleado)
      });
      this.buscar_empl = empleados
    } else {
      // console.log('entra aqui solo al iniciar sesion');
      this.empleadoService.getBuscadorEmpledosRest().subscribe(res => {
        let ObjetoJSON = JSON.stringify(res)
        sessionStorage.setItem('lista-empleados', ObjetoJSON)
        res.forEach(obj => {
          this.options.push(obj.empleado)
        });
        this.buscar_empl = res
      })
    }
  };

  abrirInfoEmpleado(nombre: string) {
    this.buscar_empl.forEach(element => {
      if (element.empleado === nombre) {
        this.router.navigate(['/verEmpleado/', element.id],
          { relativeTo: this.route, skipLocationChange: false });
      }
    });
  }

}
