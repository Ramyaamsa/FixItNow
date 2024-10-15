import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../shared_services/report.service';
import { ReportPrintService } from '../../shared_services/report-print.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
declare var $: any;

@Component({
  selector: 'app-asset-report-print',
  templateUrl: './asset-report-print.component.html',
  styleUrls: ['./asset-report-print.component.css']
})

export class AssetReportPrintComponent {
  reportId: any;
  reportData: any;
  reportTitle = "";
  reportType = "scrap";
  assetReportLists:any= [];
  rpt: any = [];
  groupBy="";
  height: any;
  orientation: any;


  constructor(private timeFormat: TimeFormatPipe ,private reportPrint:ReportPrintService,private router: Router,private activateRoute:ActivatedRoute,private reportservice:ReportService) {}
  ngOnInit() {
    this.height = window.innerHeight - 88;
    this.reportId = this.activateRoute.snapshot.paramMap.get('assetReportId');
    var data: any = sessionStorage.getItem('assetScrapPrint_' + this.reportId);
    this.reportData = JSON.parse(data);
    this.reportTitle = this.reportData.title;
    this.reportType = this.reportData['formdata']['report_type'];

    const formData = new FormData();
    for (const key in this.reportData.formdata) {
      formData.append(key, this.reportData.formdata[key]);
    }
    setTimeout(() => {
      this.getAssetReportData(formData);
    }, 50);
	} 
  getAssetReportData(formData:any){
    const startTime = Date.now();   
    this.reportservice.assetReportData(formData).subscribe(res => {
      if(res.length > 0){
        if(res[0].is_error == true){
          alert(res[0].message)
        }else{
          this.assetReportLists = res[0].asset_reportLists;
          this.assetReportLists.forEach((element: any) => {
            element.active_duration = this.timeFormat.transform(element.active_duration);
            element.inactive_duration = this.timeFormat.transform(element.inactive_duration);
          })          
          const endTime = Date.now();
          var responseTime = Math.round((endTime - startTime) / 1000);
          setTimeout(() => {
            this.bootstrapFunction();
          }, responseTime);
        }
      }
    })
  }

  bootstrapFunction() {
    var $table = $('.table');
    $table.bootstrapTable('destroy').bootstrapTable();
    $table.bootstrapTable('refreshOptions', []);
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
    } else if (this.reportType == 'solution_bank') {
      table_id = 'solution_bank_table'
    } else if (this.reportType == 'mttr') {
      table_id = 'mttr_table'
    } else if (this.reportType == 'delete_log') {
      table_id = 'delete_log_table'
    }
    this.reportPrint.downloadReport(report_type, this.reportData.selectFields, this.reportTitle, table_id, this.reportData.title);
  }
}
