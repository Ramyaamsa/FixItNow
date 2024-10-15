import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from '../../shared_services/report.service';
import { CommonService } from '../../shared_services/common.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
import { DatePipe } from '@angular/common';
import { IframeCommunicationService } from '../../shared_services/iframe-communication.service';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  loginId: any = '';
  userType: any = '';
  loginCompanyId: any = '';
  loginBuId: any = '';
  companyId: any = '';
  buId: any = '';
  dashboardTitle: any = '';
  groupBy: any = 'company';
  periodId: any = 'date';
  fromDate: any = new Date();
  toDate: any = '';

  companyAssetList: any = [];
  buAssetList: any = [];
  plantAssetList: any = [];
  companyBreakdownList: any = [];
  buBreakdownList: any = [];
  plantBreakdownList: any = [];

  breakdownSpareQty: any = 0;
  breakdownSpareCost: any = 0;

  constructor(private spinner: NgxSpinnerService, private date: DatePipe, private report: ReportService,
    private common: CommonService, private timeFormat: TimeFormatPipe, private iframeCom: IframeCommunicationService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.userType = localStorage.getItem('employee_type');
    this.loginCompanyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.loginBuId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.fromDate = this.date.transform(this.fromDate, 'dd-MM-yyyy');

    var today = new Date();
    $('#from_to_date').daterangepicker({
      maxDate: '+0d',
      locale: {
        format: 'DD-MM-YYYY',
        separator: ' to '
      },
      startDate: '01-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + today.getFullYear(),
      endDate: this.fromDate
    });

    this.spinner.show();
    $('#no_plant_chart').css('display', 'none');

    $('#from_to_date').on('change', () => {
      this.spinner.show();
      var custom_date = $('#from_to_date').val();
      const dates = custom_date.split('to');
      this.fromDate = dates[0].trim();
      this.toDate = dates[1].trim();
      this.getCompanyBreakdown();
    });

    this.getCompanyAssetList();

  }

  periodChange(type: any, period: any) {
    this.spinner.show();
    this.companyId = '';
    this.buId = '';
    $('#from_to_input_div').hide();
    this.periodId = period;
    if (type == 'today' || type == 'previous') {
      this.fromDate = this.timeFormat.dateCustom(type);
      this.toDate = "";
    } else if (type == 'week' || type == 'month' || type == 'year') {
      this.fromDate = this.timeFormat.dateCustom(type);
      this.toDate = this.timeFormat.dateCustom('today');
    } else {
      $('#from_to_input_div').show();
      var custom_date = $('#from_to_date').val();
      const dates = custom_date.split('to');
      this.fromDate = dates[0].trim();
      this.toDate = dates[1].trim();
    }

    this.getCompanyBreakdown();
  }

  getCompanyAssetList() {
    const assetData = new FormData;
    assetData.append('company_id', this.loginCompanyId);
    assetData.append('group_by', 'company');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);
    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.companyAssetList = res[0].asset_reportLists;
        this.getBuAssetDetail();
      }
    })
  }

  getBuAssetDetail() {
    const assetData = new FormData;
    assetData.append('company_id', this.loginCompanyId);
    assetData.append('bu_id', this.loginBuId);
    assetData.append('group_by', 'bu');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);

    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.buAssetList = res[0].asset_reportLists;
        this.getPlantAssetDetail();
      }
    })
  }

  getPlantAssetDetail() {
    const assetData = new FormData;
    assetData.append('company_id', this.loginCompanyId);
    assetData.append('bu_id', this.loginBuId);
    assetData.append('plant_id', '');
    assetData.append('group_by', 'plant');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);

    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.plantAssetList = res[0].asset_reportLists;
        this.getCompanyBreakdown();
      }
    })
  }

  getCompanyBreakdown() {
    const formdata = new FormData;
    formdata.append('company_id', this.loginCompanyId);
    formdata.append('group_by', 'company');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide()
        this.common.toastdata(res.message, 'error');
      } else {
        this.companyBreakdownList = res[0].breakdown_reportLists;
        this.getBuBreakdown();
      }
    })
  }

  getBuBreakdown() {
    const formdata = new FormData;
    formdata.append('company_id', this.loginCompanyId);
    formdata.append('bu_id', this.loginBuId);
    formdata.append('group_by', 'bu');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide()
        this.common.toastdata(res.message, 'error');
      } else {
        this.buBreakdownList = res[0].breakdown_reportLists;
        this.getPlantBreakdown();
      }
    })
  }

  getPlantBreakdown() {
    const formdata = new FormData;
    formdata.append('company_id', this.loginCompanyId);
    formdata.append('bu_id', this.loginBuId);
    formdata.append('plant_id', '');
    formdata.append('group_by', 'plant');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.plantBreakdownList = res[0].breakdown_reportLists;
        this.extensionTable();
      }
    })
  }

  extensionTable() {
    var str = '';
    var ii = 0;
    var jj = 0;
    var kk = 0;

    var drill_company = $("#dril_company_ip").val();
    var drill_bu = $("#dril_bu_ip").val();

    for (var i = 0; i < this.companyAssetList.length; i++) {
      var companyBreakdown = this.companyBreakdownList.filter((data: any) => data.company_id == this.companyAssetList[i].company_id);
      this.dashboardTitle = this.companyAssetList[0].company;
      this.companyId = this.companyAssetList[0].company_id;
      if (i == 0) {
        $("#dril_company_default").val(this.companyAssetList[i].company_id);
        $("#dril_company_default").attr("company_code", this.companyAssetList[i].company);
      }

      var iconClass = "fa-plus-circle ";
      if (drill_company == 'company' + this.companyAssetList[i].company_id) {
        iconClass = "fa-minus-circle ";
      }
      str += '<tr class="company" data-child="company' + this.companyAssetList[i].company_id + '" company_id="' + this.companyAssetList[i].company_id + '" company_code="' + this.companyAssetList[i].company + '">';
      str += '    <td>' + (ii + 1) + '</td>';
      str += '    <td>';
      str += '     <div class="row">';
      str += '        <div class=" col-md-1 col-2">';
      str += '            <i class="fas_change fas ' + iconClass + 'text-md m-0 p-0 pt-2" style="width:10%"></i>';
      str += '        </div>';
      str += '          <div class="col-md-11 col-10">';
      str += '             <h4 class="mb-0 text-left"><i class="fas fa-city text-md"></i>&nbsp;' + this.companyAssetList[i].company + '</h4>';
      str += '          </div>';
      str += '      </div>';
      str += '    </td>';
      str += '    <td class="numeric">' + this.companyAssetList[i].total_count + '</td>';
      if (companyBreakdown == '') {
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
      } else {
        var open = companyBreakdown[0].reject + companyBreakdown[0].reassign + companyBreakdown[0].reopen + companyBreakdown[0].open;
        var inprogress = companyBreakdown[0].check_in + companyBreakdown[0].on_hold + companyBreakdown[0].pending;
        var others = companyBreakdown[0].assign + companyBreakdown[0].accept + companyBreakdown[0].completed + companyBreakdown[0].cancel;
        str += '    <td>' + companyBreakdown[0].ticket_count + '</td>';
        str += '    <td>' + open + '</td>';
        str += '    <td>' + inprogress + '</td>';
        str += '    <td>' + companyBreakdown[0].fixed + '</td>';
        str += '    <td>' + others + '</td>';
      }
      str += '</tr>';

      for (var j = 0; j < this.buAssetList.length; j++) {
        if (this.companyAssetList[i].company_id == this.buAssetList[j].company_id) {
          var buBreakdown = this.buBreakdownList.filter((data: any) => data.bu_id == this.buAssetList[j].bu_id);
          var iconClass = "fa-plus-circle ";
          showClass = 'hidden';

          if (this.userType == 'BU Head') {
            var showClass = "";
            var bno: any = (jj + 1);
          } else {
            if (drill_bu == 'bu' + this.buAssetList[j].bu_id) {
              iconClass = "fa-minus-circle ";
              var showClass = "";
            }
            bno = (ii + 1) + '.' + (jj + 1);
          }


          str += '<tr class="bu company' + this.buAssetList[j].company_id + ' ' + showClass + '" data-child="bu' + this.buAssetList[j].bu_id + '" bu_id="' + this.buAssetList[j].bu_id + '" bu_code="' + this.buAssetList[j].bu + '">';
          str += '    <td>' + bno + '</td>';
          str += '    <td>';
          str += '     <div class="row">';
          str += '        <div class="col-md-1 col-2">';
          str += '            <i class="fas_change fas ' + iconClass + 'text-md m-0 p-0 pt-2" style="width:10%"></i>';
          str += '        </div>';
          str += '          <div class="col-md-11 col-10">';
          str += '             <h4 class="mb-0 text-left" style="text-align: start;margin-left: 10px;"><i class="fas fa-code-branch text-md"></i>&nbsp;' + this.buAssetList[j].bu + '</h4>';
          str += '          </div>';
          str += '      </div>';
          str += '    </td>';
          str += '    <td class="numeric">' + this.buAssetList[j].total_count + '</td>';
          if (buBreakdown == '') {
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
          } else {
            var open = buBreakdown[0].reject + buBreakdown[0].reassign + buBreakdown[0].reopen + buBreakdown[0].open;
            var inprogress = buBreakdown[0].check_in + buBreakdown[0].on_hold + buBreakdown[0].pending;
            var others = buBreakdown[0].assign + buBreakdown[0].accept + buBreakdown[0].completed + buBreakdown[0].cancel;
            str += '    <td>' + buBreakdown[0].ticket_count + '</td>';
            str += '    <td>' + open + '</td>';
            str += '    <td>' + inprogress + '</td>';
            str += '    <td>' + buBreakdown[0].fixed + '</td>';
            str += '    <td>' + others + '</td>';
          }
          str += '</tr>';

          for (var k = 0; k < this.plantAssetList.length; k++) {
            if (this.buAssetList[j].bu_id == this.plantAssetList[k].bu_id) {
              var plantBreakdown = this.plantBreakdownList.filter((data: any) => data.plant_id == this.plantAssetList[k].plant_id);
              var mshowClass = "hidden";
              if (drill_bu == 'bu' + this.plantAssetList[k].bu_id) {
                mshowClass = "";
              }

              if (this.userType == 'BU Head') {
                var pno = (jj + 1) + '.' + (kk + 1);
              } else {
                pno = (ii + 1) + '.' + (jj + 1) + '.' + (kk + 1);
              }

              str += '<tr class="plant bu' + this.plantAssetList[k].bu_id + ' ' + mshowClass + '" data-child="plant" plant_id="' + this.plantAssetList[k].plant_id + '" plant="' + this.plantAssetList[k].plant + '">';
              // str += '    <td class="text-white">' + (ii + 1) + '.' + (jj + 1) + '.' + (kk + 1) + '</td>';
              str += '    <td>' + pno + '</td>';
              str += '    <td>';
              str += '     <div class="row">';
              str += '          <div class="col-md-12" style="text-align: start;padding-left: 10%;">';
              str += '             <h4 class="mb-0 text-left"><i class="fas fa-industry text-md"></i>&nbsp;' + this.plantAssetList[k].plant + '</h4>';
              str += '          </div>';
              str += '      </div>';
              str += '    </td>';
              str += '    <td class="numeric">' + this.plantAssetList[k].total_count + '</td>';
              if (plantBreakdown == '') {
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
              } else {
                var open = plantBreakdown[0].reject + plantBreakdown[0].reassign + plantBreakdown[0].reopen + plantBreakdown[0].open;
                var inprogress = plantBreakdown[0].check_in + plantBreakdown[0].on_hold + plantBreakdown[0].pending;
                var others = plantBreakdown[0].assign + plantBreakdown[0].accept + plantBreakdown[0].completed + plantBreakdown[0].cancel;
                str += '    <td>' + plantBreakdown[0].ticket_count + '</td>';
                str += '    <td>' + open + '</td>';
                str += '    <td>' + inprogress + '</td>';
                str += '    <td>' + plantBreakdown[0].fixed + '</td>';
                str += '    <td>' + others + '</td>';
              }
              str += '</tr>';
              kk = kk + 1;
            }
          }
          jj = jj + 1;
          kk = 0;
        }
      }
      ii = ii + 1;
      jj = 0;
    }
    $("#table_data_c_b_p").html(str);
    this.spinner.hide();
    this.getPlantChart();

    $('#extension_table tbody tr').click((e: any) => {
      var parent_class = $(e.currentTarget).attr('class');
      var child = $(e.currentTarget).attr('data-child');
      var ChildCount = document.getElementsByClassName(child);
      
      if (child != 'plant') {
        if ($(e.currentTarget).find(".fas_change").hasClass('fa-plus-circle')) {
          $(e.currentTarget).find(".fas_change").removeClass('fa-plus-circle').addClass('fa-minus-circle');
          if (child.includes('company')) {
            (document.getElementById('dril_company_ip') as HTMLInputElement).value = child;
          } else if (child.includes('bu')) {
            (document.getElementById('dril_bu_ip') as HTMLInputElement).value = child;
          }
        }
        else {
          $(e.currentTarget).find(".fas_change").removeClass('fa-minus-circle').addClass('fa-plus-circle');
          if (child.includes('company')) {
            (document.getElementById('dril_company_ip') as HTMLInputElement).value = '';
          } else if (child.includes('bu')) {
            (document.getElementById('dril_bu_ip') as HTMLInputElement).value = '';
          }
        }

        if (parent_class == 'company') {
          for (var i = 0; i < ChildCount.length; i++) {
            var grant_child = ChildCount[i].getAttribute('data-child');
            if ($('.' + grant_child).is(":visible")) {
              $('.' + grant_child).hide();
              $(ChildCount[i]).find(".fas_change").removeClass('fa-minus-circle').addClass('fa-plus-circle');
            }
            $(ChildCount[i]).toggle();
          }
        }
        else {
          $('.' + child).toggle();
        }
      }
    });

    $('.company').click((e: any) => {
      this.companyId = $(e.currentTarget).attr('company_id');
      this.buId = '';
      this.dashboardTitle = $(e.currentTarget).attr('company_code');
      this.groupBy = 'company';
      this.getPlantChart();
    });

    $('.bu').click((e: any) => {
      this.buId = $(e.currentTarget).attr('bu_id');
      this.dashboardTitle = $(e.currentTarget).attr('bu_code');
      this.groupBy = 'bu';
      this.getPlantChart();
    });

    $('.plant').click((e: any) => {
      var plantId = $(e.currentTarget).attr('plant_id');
      var plantName = '<i class="far fa-chart-bar"></i>&nbsp; ' + 'Live - ' + $(e.currentTarget).attr('plant');
      var plantUrl = 'iframe/dashboard/plant/' + plantId;
      let tabVal = {
        tabName: plantName,
        tabUrl: plantUrl,
        tabOpen: 1
      };
      this.iframeCom.setIframe(tabVal);
    });
  }

  getPlantChart() {
    const plantData = new FormData();
    plantData.append('company_id', this.companyId);
    plantData.append('bu_id', this.buId);
    plantData.append('group_by', 'plant');
    plantData.append('report_type', 'cumulative');
    plantData.append('period', this.periodId);
    plantData.append('from_date', this.fromDate);
    plantData.append('to_date', this.toDate);
    plantData.append('limit_report_for', 'exception');
    plantData.append('limit_exception_for', 'downtime');
    plantData.append('limit_order_by', 'desc');
    plantData.append('limit_operation_value', '10');

    this.report.breakdownReportData(plantData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error')
        this.loadSpareData();
      } else {
        var plantReport = res[0].breakdown_reportLists;
        if (plantReport.length > 0) {
          let ticket_count: any = [];
          let plant_name: any = [];
          let downtime_duration: any = [];
          $("#plant_chart").show();
          $("#no_plant_chart").css('display', 'none');
          for (var i = 0; i < plantReport.length; i++) {
            ticket_count.push(plantReport[i].ticket_count);
            var downtime = plantReport[i].sum_of_downtime / 3600;
            downtime_duration.push(Number(downtime.toFixed(1)));
            plant_name.push(plantReport[i].plant_name)
          }
          this.loadPlantChart(plant_name, ticket_count, downtime_duration)
        } else {
          $("#plant_chart").hide();
          $("#no_plant_chart").css('display', 'flex');
        }
        this.loadSpareData();
      }
    });
  }

  loadPlantChart(xaxis: any, yaxis: any, yaxis1: any) {
    $('#plant_chart').highcharts({
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 350
      },
      title: {
        text: null
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        categories: xaxis,
        labels: {
          align: 'left',
          style: {
            color: '#fff',
          },

        },
      },
      yAxis: [{
        min: 0,
        allowDecimals: false,
        title: {
          text: 'Ticket Count',
          style: {
            color: '#d5d5d5'
          }
        },
        labels: {
          format: '{value}',
          style: {
            color: '#d5d5d5'
          }
        },
        gridLineWidth: 0,
      }, {
        min: 0,
        allowDecimals: false,
        title: {
          text: 'Downtime Duration',
          style: {
            color: '#d5d5d5'
          }
        },
        labels: {
          format: '{value} Hr',
          style: {
            color: '#d5d5d5'
          }
        },
        gridLineWidth: 0,
        opposite: true
      }],
      plotOptions: {
        column: {
          borderWidth: 0,
          grouping: false,
          shadow: false,
        }
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: '#d5d5d5',
        }
      },
      tooltip: {
        shared: true
      },
      series: [{
        name: 'Total Ticket',
        color: 'rgba(248,161,63,1)',
        data: yaxis,
        pointPadding: 0.3,
        pointPlacement: -0.2
      }, {
        name: 'Downtime',
        color: 'rgba(186,60,61,1)',
        data: yaxis1,
        tooltip: {
          valueSuffix: ' Hrs'
        },
        pointPadding: 0.4,
        pointPlacement: -0.2,
        yAxis: 1
      }]
    });
  }

  loadSpareData() {
    const spareData = new FormData();
    spareData.append('company_id', this.companyId);
    spareData.append('bu_id', this.buId);
    spareData.append('group_by', this.groupBy);
    spareData.append('spare_type', 'breakdown');
    spareData.append('report_type', 'cumulative');
    spareData.append('period', this.periodId);
    spareData.append('from_date', this.fromDate);
    spareData.append('to_date', this.toDate);
    spareData.append('report_for', 'regular');
    this.report.spareReportData(spareData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
      } else {
        var spareData = res[0].spare_reportLists;
        if (spareData.length > 0) {
          this.breakdownSpareQty = spareData[0].consumed_qty;
          this.breakdownSpareCost = spareData[0].total_cost;
        } else {
          this.breakdownSpareQty = 0;
          this.breakdownSpareCost = 0;
        }
      }
    })
  }
}
