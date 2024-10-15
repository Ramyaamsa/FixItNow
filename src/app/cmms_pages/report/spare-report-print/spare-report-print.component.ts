import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../shared_services/report.service';
import { ReportPrintService } from '../../shared_services/report-print.service';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-spare-report-print',
  templateUrl: './spare-report-print.component.html',
  styleUrls: ['./spare-report-print.component.css']
})
export class SpareReportPrintComponent {
  reportId: any;
  reportData: any;
  reportTitle: any;
  reportType = "";
  spareReportLists:any= [];
  rpt: any = [];
  groupBy="";
  height: any;
  orientation: any;


  constructor(private router: Router,private spinner: NgxSpinnerService,private activateRoute:ActivatedRoute,private reportservice:ReportService, private reportPrint: ReportPrintService) { }
  ngOnInit() {
    this.height = window.innerHeight - 80;

    this.reportId = this.activateRoute.snapshot.paramMap.get('report_id');
    var data: any = sessionStorage.getItem('sparePrint_' + this.reportId);
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
      this.getSpareReportData(formData);
    }, 50);
	} 
  getSpareReportData(formData:any){
    const startTime = Date.now();
    var selectedReportFields: any = this.reportData['formdata']['selectFields'];
    var rv: any = {};
    for (let i = 0; i < selectedReportFields.length; i++) {
      this.rpt[selectedReportFields[i]] = true;
      rv[selectedReportFields[i]] = i;
    }
    
    this.reportservice.spareReportData(formData).subscribe(res => {
      if(res[0].is_error == true){
        alert(res[0].message)
      }else{
        this.spareReportLists = res[0].spare_reportLists;        
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          this.bootstrapFunction(rv);
        }, responseTime);
        this.spinner.hide();
      }
    })
    
  }
  
  bootstrapFunction(selectedReportFields: any) {
    var $table = $('#detail_table');

    if (this.reportType == 'detail') {
      $table = $('#detail_table');
    } else if (this.reportType == 'summary') {
      $table = $('#summary_table');
    }else if (this.reportType == 'cumulative') {
      $table = $('#cumulative_table');
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
      table_id = 'detail_table';
    } else if (this.reportType == 'summary') {
      table_id = 'summary_table'
    } else if (this.reportType == 'cumulative') {
      table_id = 'cumulative_table'
    }
    this.reportPrint.downloadReport(report_type, this.reportData.selectFields, this.reportTitle, table_id, this.reportData.title);
  }
}
