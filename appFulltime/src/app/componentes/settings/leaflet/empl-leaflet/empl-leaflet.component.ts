import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import * as L from 'leaflet';

@Component({
  selector: 'app-empl-leaflet',
  templateUrl: './empl-leaflet.component.html',
  styleUrls: ['./empl-leaflet.component.css']
})
export class EmplLeafletComponent implements OnInit {

  COORDS: any;
  MARKER: any;

  // MÉTODO DE CONTROL DE MEMORIA
  private options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 15000
  };

  // VARIABLES DE ALMACENMAIENTO DE COORDENADAS
  latitud: number;
  longitud: number;

  constructor(
    private view: MatDialogRef<EmplLeafletComponent>
  ) { }

  ngOnInit(): void {
    this.Geolocalizar()
  }

  Geolocalizar() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (objPosition) => {
          this.latitud = objPosition.coords.latitude;
          this.longitud = objPosition.coords.longitude;
          console.log(this.longitud, this.latitud);
          this.cordenadas(this.latitud, this.longitud)
        }, (objPositionError) => {
          switch (objPositionError.code) {
            case objPositionError.PERMISSION_DENIED:
              console.log('No se ha permitido el acceso a la posición del usuario.');
              break;
            case objPositionError.POSITION_UNAVAILABLE:
              console.log('No se ha podido acceder a la información de su posición.');
              break;
            case objPositionError.TIMEOUT:
              console.log('El servicio ha tardado demasiado tiempo en responder.');
              break;
            default:
              console.log('Error desconocido.');
          }
        }, this.options);
    }
    else {
      console.log('Su navegador no soporta la API de geolocalización.');
    }
  }

  cordenadas(latitud: number, longitud: number) {
    const map = L.map('map-template', {
      center: [latitud, longitud],
      zoom: 13
    });

    map.locate({ enableHighAccuracy: true })

    map.on('click', (e: any) => {
      console.log(e.latlng);
      console.log(this.COORDS, '===', this.MARKER);

      const coords: any = [e.latlng.lat, e.latlng.lng];
      const marker = L.marker(coords);
      if (this.COORDS !== undefined) {
        map.removeLayer(this.MARKER);
      } else {
        marker.setLatLng(coords);
      }
      marker.bindPopup('Ubicación vivienda');
      map.addLayer(marker)
      this.COORDS = e.latlng;
      this.MARKER = marker
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(map);

  }

  GuardarLocalizacion() {
    this.view.close({ message: true, latlng: this.COORDS })
  }

  Salir() {
    this.view.close({ message: false })
  }

}
