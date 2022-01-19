import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SucListaNotiComponent } from './suc-lista-noti.component';

describe('SucListaNotiComponent', () => {
  let component: SucListaNotiComponent;
  let fixture: ComponentFixture<SucListaNotiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SucListaNotiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SucListaNotiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
