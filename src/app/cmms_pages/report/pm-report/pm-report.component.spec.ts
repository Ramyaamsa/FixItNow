import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmReportComponent } from './pm-report.component';

describe('PmReportComponent', () => {
  let component: PmReportComponent;
  let fixture: ComponentFixture<PmReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PmReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PmReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
