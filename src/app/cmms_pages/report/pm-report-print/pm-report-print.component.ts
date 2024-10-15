import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../shared_services/report.service';
import { ReportPrintService } from '../../shared_services/report-print.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-pm-report-print',
  templateUrl: './pm-report-print.component.html',
  styleUrls: ['./pm-report-print.component.css']
})
export class PmReportPrintComponent {
  reportId: any;
  reportData: any;
  reportTitle: any;
  reportType: any;
  totalCompleteDuration: any = 0;
  totalDowntime: any = 0;
  pmReportLists: any = [];
  pmReportFilterLists: any = [];
  ticketStatusLists: any = [];
  checkedStatuses: any = [];
  rpt: any = [];
  groupBy = "";
  height: any;
  orientation: any;

  constructor(private timeFormat: TimeFormatPipe ,private spinner: NgxSpinnerService, private activateRoute: ActivatedRoute, private reportservice: ReportService, private reportPrint: ReportPrintService) { }
  ngOnInit() {
    this.height = window.innerHeight - 80;

    this.reportId = this.activateRoute.snapshot.paramMap.get('report_id');
    var data: any = sessionStorage.getItem('pmPrint_' + this.reportId);
    this.reportData = JSON.parse(data);
    this.reportTitle = this.reportData.title;
    var reportFieldsOption: any = this.reportData['formdata']['report_fields'];
    this.groupBy = this.reportData['formdata']['group_by'];
    this.reportType = this.reportData['formdata']['report_type'];
    reportFieldsOption.forEach((row: any) => {
      this.rpt[row.field_code] = false;
    });

    const formData = new FormData();
    for (const key in this.reportData.formdata) {
      formData.append(key, this.reportData.formdata[key]);
    }
    this.spinner.show();
    setTimeout(() => {
      this.getPmReportData(formData);
    }, 50);

    // this.getTicketStatusLists();
  }

  getPmReportData(formData: any) {
    const startTime = Date.now();
    var selectedReportFields: any = this.reportData['formdata']['selectFields'];
    var rv: any = {};
    for (let i = 0; i < selectedReportFields.length; i++) {
      this.rpt[selectedReportFields[i]] = true;
      rv[selectedReportFields[i]] = i;
    }
    this.reportservice.pmReportData(formData).subscribe(res => {
        if (res[0].is_error == true) {
          alert(res[0].message)
        } else {
          this.pmReportLists = res[0].pm_reportLists;
          this.pmReportFilterLists = this.pmReportLists;
          for (var i = 0; i < this.pmReportLists.length; i++) {
            // this.totalCompleteDuration = this.pmReportLists[i].complete_duration + this.totalCompleteDuration;
            this.totalDowntime = this.pmReportLists[i].downtime_duration + this.totalDowntime;
          }
          // this.totalCompleteDuration = this.timeFormat.transform(this.totalCompleteDuration);
          this.totalDowntime = this.timeFormat.transform(this.totalDowntime);

          this.pmReportFilterLists.forEach((element: any) => {
            element.task_completion_time = this.timeFormat.transform(element.task_completion_time);
            element.task_estimation_time = this.timeFormat.transform(element.task_estimation_time);
          })

          const endTime = Date.now();
          var responseTime = Math.round((endTime - startTime) / 1000);
          setTimeout(() => {
            this.bootstrapFunction(rv);
          }, responseTime);
          this.spinner.hide();
        }
    })
  }
  // getTicketStatusLists() {
  //   this.reportservice.getTicketStatusLists().subscribe(res => {
  //     if (res.length > 0) {
  //       if (res[0].is_error == true) {
  //         alert(res[0].message)
  //       } else {
  //         this.ticketStatusLists = res[0].Breakdown_status_Lists;
  //       }
  //     }
  //   })
  // }

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

    this.pmReportFilterLists = this.pmReportLists.filter((pm: { status_id: any; }) => pm.status_id == status_id);
    console.log(this.pmReportFilterLists)

    // this.pmReportFilterLists = this.pmReportLists.filter((pm: { status_id: any }) => 
    //   this.checkedStatuses.includes(pm.status_id)
    // );

    for (var i = 0; i < this.pmReportFilterLists.length; i++) {
      this.totalDowntime = this.pmReportFilterLists[i].total_downtime + this.totalDowntime;
    }
  }

  bootstrapFunction(selectedReportFields: any) {
    var $table = $('#detail_table');

    if (this.reportType == 'detail') {
      $table = $('#detail_table');
    } else if (this.reportType == 'summary') {
      $table = $('#summary_table');
    }else if (this.reportType == 'cumulative') {
      $table = $('#cumulative_table');
    }else if (this.reportType == 'spares') {
      $table = $('#spare_table');
    } else if (this.reportType == 'task') {
      $table = $('#task_table');
    } else if (this.reportType == 'delete_log') {
      $table = $('#delete_log_table');
    }

    $table.bootstrapTable('destroy').bootstrapTable();
    $table.bootstrapTable('refreshOptions', selectedReportFields);
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
    var table_id = '';
    if (this.reportType == 'detail') {
      var table_id = 'detail_table';
    } else if (this.reportType == 'spares') {
      table_id = 'spare_table'
    } else if (this.reportType == 'task') {
      table_id = 'task_table'
    } else if (this.reportType == 'delete_log') {
      table_id = 'delete_log_table'
    }
    this.reportPrint.downloadReport(report_type, this.reportData.selectFields, this.reportTitle, table_id, this.reportData.title);
  }
}
