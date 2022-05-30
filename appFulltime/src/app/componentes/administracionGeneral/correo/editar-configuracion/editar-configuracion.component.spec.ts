import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarConfiguracionComponent } from './editar-configuracion.component';

describe('EditarConfiguracionComponent', () => {
  let component: EditarConfiguracionComponent;
  let fixture: ComponentFixture<EditarConfiguracionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarConfiguracionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
