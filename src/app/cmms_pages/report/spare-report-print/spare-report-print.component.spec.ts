import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpareReportPrintComponent } from './spare-report-print.component';

describe('SpareReportPrintComponent', () => {
  let component: SpareReportPrintComponent;
  let fixture: ComponentFixture<SpareReportPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpareReportPrintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpareReportPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
