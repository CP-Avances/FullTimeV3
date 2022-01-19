import { Component, OnInit } from '@angular/core';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts_hora from 'echarts/core';
import * as echarts_perm from 'echarts/core';
import * as echarts_vaca from 'echarts/core';
import * as echarts_atra from 'echarts/core';
import { TimbresService } from 'src/app/servicios/timbres/timbres.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-empleado',
  templateUrl: './home-empleado.component.html',
  styleUrls: ['./home-empleado.component.css']
})
export class HomeEmpleadoComponent implements OnInit {

  fecha: string;
  horas_extras: any;
  vacaciones: any;
  permisos: any;
  atrasos: any;
  
  ultimoTimbre: any = {
    timbre: '',
    accion: ''
  };

  constructor(
    private restGraficas: GraficasService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private restTimbres: TimbresService
  ) { }

  ngOnInit(): void {
    echarts_hora.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_perm.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_vaca.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_atra.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );

    var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    var diasSemana = new Array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
    var f=new Date();
    this.fecha = diasSemana[f.getDay()] + ", " + f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear();
    this.UltimoTimbre();
    this.SaldoVacaciones();
    this.ModeloGraficas();
  }

  async UltimoTimbre() {
    await this.restTimbres.UltimoTimbreEmpleado().subscribe(res => {
      console.log('ULTIMO TIMBRE:', res);
      this.ultimoTimbre = res
    },err => {
      this.toastr.error(err.error.message)
    })
  }

  SaldoVacaciones() {
    console.log('SALDO DE VACACIONES: ');
    
  }

  ModeloGraficas() {
    this.GraficaUno()
    this.GraficaDos();
    this.GraficaTres();
    this.GraficaCuatro();
  }

  GraficaUno() {
    let local = sessionStorage.getItem('horasExtras');
    var chartDom = document.getElementById('charts_horas_extras') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoHoraExtra().subscribe(res => {
        // console.log('************* Horas extras **************');
        sessionStorage.setItem('horasExtras', JSON.stringify(res))
        // console.log(res);
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaDos() {
    let local = sessionStorage.getItem('vacaciones');
    var chartDom = document.getElementById('charts_vacaciones') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoVacaciones().subscribe(res => {
        // console.log('************* Vacaciones **************');
        sessionStorage.setItem('vacaciones', JSON.stringify(res))
        // console.log(res);
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaTres() {
    let local = sessionStorage.getItem('permisos');
    var chartDom = document.getElementById('charts_permisos') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoPermisos().subscribe(res => {
        // console.log('************* Permisos **************');
        // console.log(res);
        sessionStorage.setItem('permisos', JSON.stringify(res))
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  GraficaCuatro() {
    let local = sessionStorage.getItem('atrasos');
    var chartDom = document.getElementById('charts_atraso') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.EmpleadoAtrasos().subscribe(res => {
        // console.log('*************  ATRASOS **************');
        // console.log(res);
        sessionStorage.setItem('atrasos', JSON.stringify(res))
        thisChart.setOption(res);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON);
    }
  }

  RefrescarGraficas() {
    sessionStorage.removeItem('atrasos');
    sessionStorage.removeItem('permisos');
    sessionStorage.removeItem('vacaciones');
    sessionStorage.removeItem('horasExtras');
    this.ModeloGraficas();
  }

  MenuRapido(num: number) {
    console.log(num);
    
    switch (num) {
      case 1: //Horas Extras
        this.router.navigate(['/horaExtraEmpleado'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 2: //Vacaciones
        this.router.navigate(['/vacacionesEmpleado'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 3: //Permisos
        this.router.navigate(['/solicitarPermiso'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 4: //Retrasos
        this.router.navigate(['/macro/user/atrasos'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 5: //Timbres
        this.router.navigate(['/timbres-personal'], {relativeTo: this.route, skipLocationChange: false});
        break;
      default:
        this.router.navigate(['/estadisticas'], {relativeTo: this.route, skipLocationChange: false});
        break;
    }
  }

}
