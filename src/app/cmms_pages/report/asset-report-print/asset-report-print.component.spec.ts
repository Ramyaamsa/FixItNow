import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetReportPrintComponent } from './asset-report-print.component';

describe('AssetReportPrintComponent', () => {
  let component: AssetReportPrintComponent;
  let fixture: ComponentFixture<AssetReportPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetReportPrintComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetReportPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
