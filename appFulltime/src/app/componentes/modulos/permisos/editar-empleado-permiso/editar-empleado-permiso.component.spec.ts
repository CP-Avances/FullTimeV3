import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEmpleadoPermisoComponent } from './editar-empleado-permiso.component';

describe('EditarEmpleadoPermisoComponent', () => {
  let component: EditarEmpleadoPermisoComponent;
  let fixture: ComponentFixture<EditarEmpleadoPermisoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarEmpleadoPermisoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarEmpleadoPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
