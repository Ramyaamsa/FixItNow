import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../shared_services/report.service';
import { ReportPrintService } from '../../shared_services/report-print.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-breakdown-report-print',
  templateUrl: './breakdown-report-print.component.html',
  styleUrls: ['./breakdown-report-print.component.css']
})
export class BreakdownReportPrintComponent {
  reportId: any;
  reportData: any;
  reportTitle: any;
  reportType: any;
  totalCompleteDuration: any = 0;
  totalDowntime: any = 0;
  breakdownReportLists: any = [];
  breakdownReportFilterLists: any = [];
  ticketStatusLists: any = [];
  checkedStatuses: any = [];
  rpt: any = [];
  groupBy = "";
  height: any;
  orientation: any;

  constructor(private timeFormat: TimeFormatPipe,private spinner: NgxSpinnerService, private activateRoute: ActivatedRoute, private reportservice: ReportService, private reportPrint: ReportPrintService) { }
  ngOnInit() {
    this.height = window.innerHeight - 80;

    this.reportId = this.activateRoute.snapshot.paramMap.get('report_id');
    var data: any = sessionStorage.getItem('breakdownPrint_' + this.reportId);
    this.reportData = JSON.parse(data);
    this.reportTitle = this.reportData.title;
    
    
    this.groupBy = this.reportData['formdata']['group_by'];
    this.reportType = this.reportData['formdata']['report_type'];
    this.spinner.show();

    var reportFieldsOption: any = this.reportData.fieldOptions;
    for (var j = 0; j < reportFieldsOption.length; j++) {
      this.rpt[reportFieldsOption[j]] = false;
    }

    const formData = new FormData();
    for (const key in this.reportData.formdata) {
      formData.append(key, this.reportData.formdata[key]);
    }
    setTimeout(() => {
      this.getBreakdownReportData(formData);
    }, 50);

    this.getTicketStatusLists();
  }

  getBreakdownReportData(formData: any) {
    const startTime = Date.now();
    var selectedReportFields: any = this.reportData.selectFields;
    var rv: any = {};
    for (var i = 0; i < selectedReportFields.length; i++) {
      this.rpt[selectedReportFields[i]] = true;
      rv[selectedReportFields[i]] = i;
    }
    this.reportservice.breakdownReportData(formData).subscribe(res => {
      if (res[0].is_error == true) {
        alert(res[0].message)
      } else {
        this.breakdownReportLists = res[0].breakdown_reportLists;
        // this.breakdownReportFilterLists = this.breakdownReportLists;
        if (this.reportType == 'spares') {
          this.breakdownReportLists = this.breakdownReportLists.filter((spare: { spare_name: null; }) => spare.spare_name != null);
        }
        for (var i = 0; i < this.breakdownReportLists.length; i++) {
          this.breakdownReportLists[i]['head_response_hr'] = this.timeFormat.transform(this.breakdownReportLists[i].head_response_hr);
          this.breakdownReportLists[i]['engineer_response_hr'] = this.timeFormat.transform(this.breakdownReportLists[i].engineer_response_hr);
          this.breakdownReportLists[i]['mttr'] = this.timeFormat.transform(this.breakdownReportLists[i].mttr);
          this.breakdownReportLists[i]['mtbf'] = this.timeFormat.transform(this.breakdownReportLists[i].mtbf);
          this.totalCompleteDuration = this.breakdownReportLists[i].complete_duration + this.totalCompleteDuration;
          this.totalDowntime = this.breakdownReportLists[i].downtime_duration + this.totalDowntime;
          this.breakdownReportLists[i]['complete_duration'] = this.timeFormat.transform(this.breakdownReportLists[i].complete_duration);
          this.breakdownReportLists[i]['downtime_duration'] = this.timeFormat.transform(this.breakdownReportLists[i].downtime_duration);
        }
        this.totalCompleteDuration = this.timeFormat.transform(this.totalCompleteDuration);
        this.totalDowntime = this.timeFormat.transform(this.totalDowntime);

        // this.breakdownReportFilterLists.forEach((element: any) => {
        //   element.complete_duration = this.timeFormat.transform(element.complete_duration);
        //   element.downtime_duration = this.timeFormat.transform(element.downtime_duration);
        //   element.mttr = this.timeFormat.transform(element.mttr);
        //   element.mtbf = this.timeFormat.transform(element.mtbf);
        // })

        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          this.bootstrapFunction(rv);
        }, responseTime);
        
        this.spinner.hide();
      }
    })
  }
  getTicketStatusLists() {
    this.reportservice.getTicketStatusLists().subscribe(res => {
      if (res.length > 0) {
        if (res[0].is_error == true) {
          alert(res[0].message)
        } else {
          this.ticketStatusLists = res[0].Breakdown_status_Lists;
        }
      }
    })
  }

  getStatusData(status_id: any, event: Event): void {

    var checkbox1 = $("#bd" + status_id);
    checkbox1.prop("checked", !checkbox1.prop("checked"));

    // if (checkbox1.prop("checked")) {
    //   this.checkedStatuses.push(status_id);
    // } else {
    //   this.checkedStatuses = this.checkedStatuses.filter((status_id: any) => status_id !== status_id);
    // }

    this.totalCompleteDuration = 0;
    this.totalDowntime = 0;

    this.breakdownReportFilterLists = this.breakdownReportLists.filter((breakdown: { status_id: any; }) => breakdown.status_id == status_id);

    // this.breakdownReportFilterLists = this.breakdownReportLists.filter((breakdown: { status_id: any }) => 
    //   this.checkedStatuses.includes(breakdown.status_id)
    // );

    for (var i = 0; i < this.breakdownReportFilterLists.length; i++) {
      this.totalCompleteDuration = this.breakdownReportFilterLists[i].total_complete_duration + this.totalCompleteDuration;
      this.totalDowntime = this.breakdownReportFilterLists[i].total_downtime + this.totalDowntime;
    }
  }

  bootstrapFunction(rv: any) {
    var $table = $('#table');

    $table.bootstrapTable('destroy').bootstrapTable();
    $table.bootstrapTable('refreshOptions', rv);
    $table.tablesorter({
      sortReset: true,
      sortRestart: true
    })

    $('.table thead tr th').click((e: any) => {
      if ($(e.currentTarget).hasClass('tablesorter-headerDesc')) {
        $('.sort_hide').show();
      } else {
        $('.sort_hide').hide();
      }
    });
  }
  downloadReport(report_type: any) {
    this.reportPrint.downloadReport(report_type, this.reportData.selectFields, this.reportTitle, 'table', this.reportData.title);
  }
}
