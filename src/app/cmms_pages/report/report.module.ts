import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallLogsComponent } from './call-logs/call-logs.component';
import { PmReportComponent } from './pm-report/pm-report.component';
import { LogReportComponent } from './log-report/log-report.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AssetScrapComponent } from './asset-scrap/asset-scrap.component';
import { SpareComponent } from './spare/spare.component';
import { BreakdownReportComponent } from './breakdown-report/breakdown-report.component';
import { ReportsComponent } from './reports/reports.component';
import { BreakdownReportPrintComponent } from './breakdown-report-print/breakdown-report-print.component';
import { SpareReportPrintComponent } from './spare-report-print/spare-report-print.component';
import { AssetReportPrintComponent } from './asset-report-print/asset-report-print.component';
import { PmReportPrintComponent } from './pm-report-print/pm-report-print.component';

const routes: Routes = [{
  path: 'call_logs',
  component: CallLogsComponent
},{
  path: 'log_report',
  component: LogReportComponent
},{
  path: 'pm_report',
  component: PmReportComponent
},{
  path: 'asset_scrap',
  component: AssetScrapComponent
},{
  path: 'spare',
  component: SpareComponent
},{
  path: 'breakdown_report',
  component: BreakdownReportComponent
},{
  path: 'reports',
  component: ReportsComponent
},{
  path: 'breakdown_report_print/:report_id',
  component: BreakdownReportPrintComponent
},{
  path: 'pm_report_print/:report_id',
  component: PmReportPrintComponent
},{
  path: 'spare_report_print/:report_id',
  component: SpareReportPrintComponent
},{
  path: 'asset_report_print/:assetReportId',
  component: AssetReportPrintComponent
}]

@NgModule({
  declarations: [
    CallLogsComponent,
    PmReportComponent,
    LogReportComponent,
    AssetScrapComponent,
    SpareComponent,
    BreakdownReportComponent,
    ReportsComponent,
    BreakdownReportPrintComponent,
    SpareReportPrintComponent,
    AssetReportPrintComponent,
    PmReportPrintComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class ReportModule { }
