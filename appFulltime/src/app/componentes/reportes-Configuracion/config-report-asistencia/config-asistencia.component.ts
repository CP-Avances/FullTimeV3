import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Task } from 'src/app/model/reportes.model';

@Component({
  selector: 'app-config-asistencia',
  templateUrl: './config-asistencia.component.html',
  styleUrls: ['./config-asistencia.component.css']
})
export class ConfigAsistenciaComponent implements OnInit {

  task: Task = {
    name: 'Seleccionar Todo',
    completed: false,
    subtasks: [
      {name: 'ATRASO', completed: false},
      {name: 'SAL ANTES', completed: false},
      {name: 'ALMUE', completed: false},
      {name: 'HORA TRAB', completed: false},
      {name: 'HORA SUPL', completed: false},
      {name: 'HORA EX. L-V', completed: false},
      {name: 'HORA EX. S-D', completed: false}
    ]
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => t.completed = completed);
  }

  constructor(
    public dialogRef: MatDialogRef<ConfigAsistenciaComponent>,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
  }
  
  GuardarConfiguracionAsistencia() {
    sessionStorage.removeItem('arrayConfigAsistencia');
    sessionStorage.removeItem('columnasValidasAsistencia');

    // console.log(this.task.subtasks);
    let columnasValidas = this.task.subtasks.filter(obj => {
      return (obj.completed === true)
    }).length + 14;
    // console.log(columnasValidas);
    sessionStorage.setItem('columnasValidasAsistencia', columnasValidas.toString())

    let ObjetoJSON = {
      atraso: this.task.subtasks.filter(obj => {return (obj.name === 'ATRASO')}).map(obj => {return obj.completed})[0],
      salida_antes: this.task.subtasks.filter(obj => {return (obj.name === 'SAL ANTES')}).map(obj => {return obj.completed})[0],
      almuerzo: this.task.subtasks.filter(obj => {return (obj.name === 'ALMUE')}).map(obj => {return obj.completed})[0],
      h_trab: this.task.subtasks.filter(obj => {return (obj.name === 'HORA TRAB')}).map(obj => {return obj.completed})[0],
      h_supl: this.task.subtasks.filter(obj => {return (obj.name === 'HORA SUPL')}).map(obj => {return obj.completed})[0],
      h_ex_LV: this.task.subtasks.filter(obj => {return (obj.name === 'HORA EX. L-V')}).map(obj => {return obj.completed})[0],
      h_ex_SD: this.task.subtasks.filter(obj => {return (obj.name === 'HORA EX. S-D')}).map(obj => {return obj.completed})[0]
    }

    let jsonTask = JSON.stringify(ObjetoJSON)
    console.log(jsonTask);
    sessionStorage.setItem('arrayConfigAsistencia', jsonTask)
    this.toastr.success('Configuración guardada','', {
      timeOut: 6000,
    })
    this.dialogRef.close(true)
  }
}
