import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogReportComponent } from './log-report.component';

describe('LogReportComponent', () => {
  let component: LogReportComponent;
  let fixture: ComponentFixture<LogReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
