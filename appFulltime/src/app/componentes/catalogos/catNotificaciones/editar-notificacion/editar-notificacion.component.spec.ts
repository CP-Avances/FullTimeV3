import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarNotificacionComponent } from './editar-notificacion.component';

describe('EditarNotificacionComponent', () => {
  let component: EditarNotificacionComponent;
  let fixture: ComponentFixture<EditarNotificacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarNotificacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
