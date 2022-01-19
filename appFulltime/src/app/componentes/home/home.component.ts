import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraficasService } from 'src/app/servicios/graficas/graficas.service';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import * as echarts_asis from 'echarts/core';
import * as echarts_hora from 'echarts/core';
import * as echarts_inas from 'echarts/core';
import * as echarts_jorn from 'echarts/core';
import * as echarts_marc from 'echarts/core';
import * as echarts_retr from 'echarts/core';
import * as echarts_tiem from 'echarts/core';
import * as echarts_sali from 'echarts/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
 
  fecha: string;

  constructor(
    private restGraficas: GraficasService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    echarts_hora.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_retr.use(
      [TooltipComponent, LegendComponent, BarChart, GridComponent, CanvasRenderer]
    );
    echarts_asis.use(
      [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
    );
    echarts_jorn.use(
      [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
    );
    echarts_tiem.use(
      [TooltipComponent, LegendComponent, BarChart, CanvasRenderer]
    );
    echarts_inas.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );
    echarts_marc.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );
    echarts_sali.use(
      [TooltipComponent, LegendComponent, LineChart, GridComponent, CanvasRenderer]
    );

    var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    var diasSemana = new Array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
    var f=new Date();
    this.fecha = diasSemana[f.getDay()] + ", " + f.getDate() + " de " + meses[f.getMonth()] + " de " + f.getFullYear();
    this.ModeloGraficas();
  }

  ModeloGraficas() {
    this.GraficaUno()
    this.GraficaDos();
    this.GraficaTres();
    this.GraficaCuatro();
    this.GraficaCinco();
    this.GraficaSeis();
    this.GraficaSiete();
    this.GraficaOcho();
  }

  GraficaUno() {
    let local = sessionStorage.getItem('asistencia');
    var chartDom = document.getElementById('charts_asistencia') as HTMLCanvasElement;
    var thisChart = echarts_asis.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaAsistenciaMicro().subscribe(res => {
        // console.log('************* Asistencia Micro **************');
        sessionStorage.setItem('asistencia', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaDos() {
    let local = sessionStorage.getItem('HoraExtra');
    var chartDom = document.getElementById('charts_hora_extra') as HTMLCanvasElement;
    var thisChart = echarts_hora.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaHoraExtraMicro().subscribe(res => {
        // console.log('************* Hora Extra Micro **************');
        sessionStorage.setItem('HoraExtra', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaTres() {
    let local = sessionStorage.getItem('inasistencia');
    var chartDom = document.getElementById('charts_inasistencia') as HTMLCanvasElement;
    var thisChart = echarts_inas.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaInasistenciaMicro().subscribe(res => {
        // console.log('************* Inasistencia Micro **************');
        sessionStorage.setItem('inasistencia', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaCuatro() {
    let local = sessionStorage.getItem('JornadaHoraExtra');
    var chartDom = document.getElementById('charts_jornada_hora_extra') as HTMLCanvasElement;
    var thisChart = echarts_jorn.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaJornadaHoraExtraMicro().subscribe(res => {
        // console.log('************* Jornada Hora Extra Micro **************');
        sessionStorage.setItem('JornadaHoraExtra', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaCinco() {
    let local = sessionStorage.getItem('marcaciones');
    var chartDom = document.getElementById('charts_marcaciones') as HTMLCanvasElement;
    var thisChart = echarts_marc.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaMarcacionesMicro().subscribe(res => {
        // console.log('************* Marcaciones Micro **************');
        sessionStorage.setItem('marcaciones', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaSeis() {
    let local = sessionStorage.getItem('retrasos');
    var chartDom = document.getElementById('charts_retrasos') as HTMLCanvasElement;
    var thisChart = echarts_retr.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaRetrasoMicro().subscribe(res => {
        // console.log('************* Retrasos Micro **************');
        sessionStorage.setItem('retrasos', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaSiete() {
    let local = sessionStorage.getItem('tiempo_jornada');
    var chartDom = document.getElementById('charts_tiempo_jornada') as HTMLCanvasElement;
    var thisChart = echarts_tiem.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaTiempoJornadaHoraExtraMicro().subscribe(res => {
        // console.log('************* Tiempo Jornada Micro **************');
        sessionStorage.setItem('tiempo_jornada', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  GraficaOcho() {
    let local = sessionStorage.getItem('salida_antes');
    var chartDom = document.getElementById('charts_salidas_antes') as HTMLCanvasElement;
    var thisChart = echarts_sali.init(chartDom, 'light', {width: 350, renderer: 'svg',devicePixelRatio: 5 });

    if (local === null) {
      this.restGraficas.MetricaSalidasAntesMicro().subscribe(res => {
        // console.log('************* Salida Antes Micro **************');
        sessionStorage.setItem('salida_antes', JSON.stringify(res))
        thisChart.setOption(res.datos_grafica);
      });
    } else {
      // this.salidas_antes = JSON.parse(local);
      var data_JSON = JSON.parse(local);
      thisChart.setOption(data_JSON.datos_grafica);
    }
  }

  RefrescarGraficas() {
    sessionStorage.removeItem('JornadaHoraExtra');
    sessionStorage.removeItem('retrasos');
    sessionStorage.removeItem('asistencia');
    sessionStorage.removeItem('inasistencia');
    sessionStorage.removeItem('HoraExtra');
    sessionStorage.removeItem('marcaciones');
    sessionStorage.removeItem('tiempo_jornada');
    sessionStorage.removeItem('salida_antes');
    this.ModeloGraficas();
  }

  MenuRapido(num: number) {
    switch (num) {
      case 1: //Reportes
        this.router.navigate(['/listaReportes'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 2: //Horas Extras
        this.router.navigate(['/horas-extras-solicitadas'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 3: //Vacaciones
        this.router.navigate(['/vacaciones-solicitados'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 4: //Permisos
        this.router.navigate(['/permisos-solicitados'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 5: //Retrasos
        this.router.navigate(['/macro/retrasos'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 6: //Métricas
        this.router.navigate(['/home'], {relativeTo: this.route, skipLocationChange: false});
        break;
      default:
        this.router.navigate(['/home'], {relativeTo: this.route, skipLocationChange: false});
        break;
    }
  }

  RedireccionarRutas(num: number) {
    switch (num) {
      case 1: //Reportes
        this.router.navigate(['/macro/inasistencia'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 2: //Horas Extras
        this.router.navigate(['/macro/hora-extra'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 3: //Vacaciones
        this.router.navigate(['/macro/asistencia'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 4: //Permisos
        this.router.navigate(['/macro/retrasos'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 5: //Retrasos
        this.router.navigate(['/macro/marcaciones'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 6: //Métricas
        this.router.navigate(['/macro/tiempo-jornada-vs-hora-ext'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 7: //Métricas
        this.router.navigate(['/macro/jornada-vs-hora-extra'], {relativeTo: this.route, skipLocationChange: false});
        break;
      case 8: //Salidas antes
        this.router.navigate(['/macro/salidas-antes'], {relativeTo: this.route, skipLocationChange: false});
        break;
      default:
        this.router.navigate(['/home'], {relativeTo: this.route, skipLocationChange: false});
        break;
    }
  }

}
