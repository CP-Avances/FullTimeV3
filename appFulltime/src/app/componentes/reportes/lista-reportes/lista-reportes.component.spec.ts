import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReportesComponent } from './lista-reportes.component';

describe('ListaReportesComponent', () => {
  let component: ListaReportesComponent;
  let fixture: ComponentFixture<ListaReportesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaReportesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
