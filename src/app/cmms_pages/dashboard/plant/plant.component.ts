import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ReportService } from '../../shared_services/report.service';
import { CommonService } from '../../shared_services/common.service';
import { TimeFormatPipe } from '../../shared_services/time-format.pipe';
import { DatePipe } from '@angular/common';
import { IframeCommunicationService } from '../../shared_services/iframe-communication.service';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  styleUrls: ['./plant.component.css']
})
export class PlantComponent {
  loginId: any = '';
  userType: any = '';
  dashboardTitle: any = '';
  plantId: any = '';
  groupBy: any = 'plant';
  periodId: any = 'date';
  chartPeriodId: any = 'today';
  fromDate: any = new Date();
  toDate: any = '';

  departmentAssetList: any = [];
  assetGroupAssetList: any = [];
  assetList: any = [];

  departmentBreakdownList: any = [];
  assetGroupBreakdownList: any = [];
  assetBreakdownList: any = [];
  engineerList: any = [];

  departmentId: any = '';
  assetGroupId: any = '';
  assetId: any = '';
  downtime: any = '00:00';
  mtbf: any = '00:00';
  mttr: any = '00:00';

  totalSpare: any = 0;
  totalCost: any = 0;
  breakdownSpare: any = 0;
  breakdownSpareCost: any = 0;
  pmSpare: any = 0;
  pmSpareCost: any = 0;

  constructor(private spinner: NgxSpinnerService, private activateRoute: ActivatedRoute, private date: DatePipe, private report: ReportService,
    private common: CommonService, private timeFormat: TimeFormatPipe, private iframeCom: IframeCommunicationService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.userType = localStorage.getItem('employee_type');
    this.plantId = this.activateRoute.snapshot.paramMap.get('plant_id');
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
      this.getDepartmentBreakdown();
    });

    this.getDepartmentAssetList();

  }

  periodChange(type: any, period: any) {
    this.spinner.show();
    $('#from_to_input_div').hide();
    this.periodId = period;
    if (type == 'today' || type == 'previous') {
      this.fromDate = this.timeFormat.dateCustom(type);
      this.toDate = "";
      if (type == 'previous') {
        this.chartPeriodId = 'previous_day';
      } else {
        this.chartPeriodId = 'today';
      }
    } else if (type == 'week' || type == 'month' || type == 'year') {
      this.fromDate = this.timeFormat.dateCustom(type);
      this.toDate = this.timeFormat.dateCustom('today');
      this.chartPeriodId = this.periodId;
    } else {
      $('#from_to_input_div').show();
      var custom_date = $('#from_to_date').val();
      const dates = custom_date.split('to');
      this.fromDate = dates[0].trim();
      this.toDate = dates[1].trim();

      this.chartPeriodId = this.periodId;
    }

    this.getDepartmentBreakdown();
  }

  getDepartmentAssetList() {
    const assetData = new FormData;
    assetData.append('plant_id', this.plantId);
    assetData.append('group_by', 'department');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);
    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.departmentAssetList = res[0].asset_reportLists;
        if (this.departmentAssetList != '') {
          this.dashboardTitle = this.departmentAssetList[0].plant;
        }
        this.getAssetGroupList();
      }
    });
  }

  getAssetGroupList() {
    const assetData = new FormData;
    assetData.append('plant_id', this.plantId);
    assetData.append('group_by', 'asset_group');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);
    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.assetGroupAssetList = res[0].asset_reportLists;
        this.getAssetList();
      }
    });
  }

  getAssetList() {
    const assetData = new FormData;
    assetData.append('plant_id', this.plantId);
    assetData.append('group_by', 'asset');
    assetData.append('report_type', 'detail');
    assetData.append('period', 'date');
    assetData.append('from_date', this.fromDate);
    assetData.append('user_login_id', this.loginId);
    this.report.assetReportData(assetData).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.assetList = res[0].asset_reportLists;
        this.getDepartmentBreakdown();
      }
    });
  }

  getDepartmentBreakdown() {
    const formdata = new FormData;
    formdata.append('plant_id', this.plantId);
    formdata.append('group_by', 'department');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.departmentBreakdownList = res[0].breakdown_reportLists;
        this.getAssetGroupBreakdown();
      }
    });
  }

  getAssetGroupBreakdown() {
    const formdata = new FormData;
    formdata.append('plant_id', this.plantId);
    formdata.append('group_by', 'asset_group');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.assetGroupBreakdownList = res[0].breakdown_reportLists;
        this.getAssetBreakdown();
      }
    });
  }

  getAssetBreakdown() {
    const formdata = new FormData;
    formdata.append('plant_id', this.plantId);
    formdata.append('group_by', 'asset');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate)
    formdata.append('to_date', this.toDate)
    this.report.breakdownReportData(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.common.toastdata(res.message, 'error');
      } else {
        this.assetBreakdownList = res[0].breakdown_reportLists;
        this.extensionTable();
      }
    });
  }

  extensionTable() {
    var str = '';
    var ii = 0;
    var jj = 0;
    var kk = 0;

    var drill_department = $("#dril_department_ip").val();
    var drill_asset_group = $("#dril_asset_group_ip").val();
    var drill_asset = $("#dril_asset_ip").val();
    for (var i = 0; i < this.departmentAssetList.length; i++) {
      if (i == 0) {
        $("#dril_department_default").val(this.departmentAssetList[i].department_id);
        $("#dril_department_default").attr("department_code", this.departmentAssetList[i].department_code);
      }
      var departmentBreakdown = this.departmentBreakdownList.filter((data: any) => data.department_id == this.departmentAssetList[i].department_id);

      var showClass = "";
      var iconClass = "fa-plus-circle ";
      if (drill_department == 'department' + this.departmentAssetList[i].department_id) {
        iconClass = "fa-minus-circle ";
      }
      str += '<tr class="department ' + showClass + '" data-child="department' + this.departmentAssetList[i].department_id + '" department_id="' + this.departmentAssetList[i].department_id + '" department_code="' + this.departmentAssetList[i].department + '">';
      str += '    <td class="text-white">' + (ii + 1) + '</td>';
      str += '    <td>';
      str += '     <div class="row">';
      str += '        <div class=" col-md-1 col-2">';
      str += '            <i class="fas_change fas ' + iconClass + 'text-md m-0 p-0 pt-2" style="width:10%"></i>';
      str += '        </div>';
      str += '          <div class="col-md-11 col-10">';
      str += '             <h4 class="mb-0 text-left"><i class="fas fa-city text-md"></i>&nbsp;' + this.departmentAssetList[i].department + '</h4>';
      str += '          </div>';
      str += '      </div>';
      str += '    </td>';
      str += '    <td class="numeric">' + this.departmentAssetList[i].total_count + '</td>';
      if (departmentBreakdown == '') {
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
        str += '    <td>0</td>';
      } else {
        var open = departmentBreakdown[0].reject + departmentBreakdown[0].reassign + departmentBreakdown[0].reopen + departmentBreakdown[0].open;
        var inprogress = departmentBreakdown[0].check_in + departmentBreakdown[0].on_hold + departmentBreakdown[0].pending;
        var others = departmentBreakdown[0].assign + departmentBreakdown[0].accept;
        var fixed = departmentBreakdown[0].cancel + departmentBreakdown[0].fixed
        str += '    <td>' + departmentBreakdown[0].ticket_count + '</td>';
        str += '    <td>' + open + '</td>';
        str += '    <td>' + inprogress + '</td>';
        str += '    <td>' + departmentBreakdown[0].completed + '</td>';
        str += '    <td>' + fixed + '</td>';
        str += '    <td>' + others + '</td>';
      }
      str += '</tr>';

      for (var j = 0; j < this.assetGroupAssetList.length; j++) {
        if (this.departmentAssetList[i].department_id == this.assetGroupAssetList[j].department_id) {
          var agBreakdown = this.assetGroupBreakdownList.filter((data: any) => data.asset_group_id == this.assetGroupAssetList[j].asset_group_id);
          var showClass = "hidden";

          var iconClass = "fa-plus-circle ";
          if (drill_department == 'department' + this.assetGroupAssetList[j].department_id) {
            showClass = "";
            if (drill_asset_group == 'asset_group' + this.assetGroupAssetList[j].asset_group_id) {
              iconClass = "fa-minus-circle ";
            }
          }

          str += '<tr class="asset_group department' + this.assetGroupAssetList[j].department_id + ' ' + showClass + '" data-child="asset_group' + this.assetGroupAssetList[j].asset_group_id + '" asset_group_id="' + this.assetGroupAssetList[j].asset_group_id + '" asset_group_code="' + this.assetGroupAssetList[j].asset_group + '">';
          str += '    <td class="text-white">' + (ii + 1) + '.' + (jj + 1) + '</td>';
          str += '    <td>';
          str += '     <div class="row">';
          str += '        <div class="col-md-1 col-2">';
          str += '            <i class="fas_change fas ' + iconClass + 'text-md m-0 p-0 pt-2" style="width:10%"></i>';
          str += '        </div>';
          str += '          <div class="col-md-11 col-10">';
          str += '             <h4 class="mb-0 text-left" style="text-align: start;margin-left: 10px;"><i class="fas fa-code-branch text-md"></i>&nbsp;' + this.assetGroupAssetList[j].asset_group + '</h4>';
          str += '          </div>';
          str += '      </div>';
          str += '    </td>';
          str += '    <td class="numeric">' + this.assetGroupAssetList[j].total_count + '</td>';
          if (agBreakdown == '') {
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
            str += '    <td>0</td>';
          } else {
            var open = agBreakdown[0].reject + agBreakdown[0].reassign + agBreakdown[0].reopen + agBreakdown[0].open;
            var inprogress = agBreakdown[0].check_in + agBreakdown[0].on_hold + agBreakdown[0].pending;
            var others = agBreakdown[0].assign + agBreakdown[0].accept;
            var fixed = agBreakdown[0].cancel + agBreakdown[0].fixed;
            str += '    <td>' + agBreakdown[0].ticket_count + '</td>';
            str += '    <td>' + open + '</td>';
            str += '    <td>' + inprogress + '</td>';
            str += '    <td>' + agBreakdown[0].completed + '</td>';
            str += '    <td>' + fixed + '</td>';
            str += '    <td>' + others + '</td>';
          }
          str += '</tr>';
          console.log(this.assetList)
          for (var k = 0; k < this.assetList.length; k++) {
            if (this.assetGroupAssetList[j].asset_group_id == this.assetList[k].asset_group_id) {
              var assetBreakdown = this.assetBreakdownList.filter((data: any) => data.asset_id == this.assetList[k].asset_id);

              var mshowClass = "hidden";
              if (drill_asset_group == 'asset_group' + this.assetList[k].asset_group_id) {
                mshowClass = "";
              }

              str += '<tr class="asset asset_group' + this.assetList[k].asset_group_id + ' ' + mshowClass + '" data-child="asset" asset_id="' + this.assetList[k].asset_id + '" asset_code="' + this.assetList[k].asset + '">';
              str += '    <td class="text-white">' + (ii + 1) + '.' + (jj + 1) + '.' + (kk + 1) + '</td>';
              str += '    <td>';
              str += '     <div class="row">';
              str += '          <div class="col-md-12" style="text-align: start;padding-left: 10%;">';
              str += '             <h4 class="mb-0 text-left"><i class="fas fa-industry text-md"></i>&nbsp;' + this.assetList[k].asset + '</h4>';
              str += '          </div>';
              str += '      </div>';
              str += '    </td>';
              str += '    <td class="numeric"> - </td>';
              if (assetBreakdown == '') {
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
                str += '    <td>0</td>';
              } else {
                var open = assetBreakdown[0].reject + assetBreakdown[0].reassign + assetBreakdown[0].reopen + assetBreakdown[0].open;
                var inprogress = assetBreakdown[0].check_in + assetBreakdown[0].on_hold + assetBreakdown[0].pending;
                var others = assetBreakdown[0].assign + assetBreakdown[0].accept;
                var fixed = assetBreakdown[0].cancel + assetBreakdown[0].fixed;
                str += '    <td>' + assetBreakdown[0].ticket_count + '</td>';
                str += '    <td>' + open + '</td>';
                str += '    <td>' + inprogress + '</td>';
                str += '    <td>' + assetBreakdown[0].completed + '</td>';
                str += '    <td>' + fixed + '</td>';
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

    this.getBreakdownChart();

    $('#extension_table tbody tr').click((e: any) => {
      var parent_class = $(e.currentTarget).attr('class');
      var child = $(e.currentTarget).attr('data-child');
      var ChildCount = document.getElementsByClassName(child);

      if (child != 'asset') {
        if ($(e.currentTarget).find(".fas_change").hasClass('fa-plus-circle')) {
          $(e.currentTarget).find(".fas_change").removeClass('fa-plus-circle').addClass('fa-minus-circle');
          if (child.includes('department')) {
            (document.getElementById('dril_department_ip') as HTMLInputElement).value = child;
          } else if (child.includes('asset_group')) {
            (document.getElementById('dril_asset_group_ip') as HTMLInputElement).value = child;
          }
        }
        else {
          $(e.currentTarget).find(".fas_change").removeClass('fa-minus-circle').addClass('fa-plus-circle');
          if (child.includes('department')) {
            (document.getElementById('dril_department_ip') as HTMLInputElement).value = '';
          } else if (child.includes('asset_group')) {
            (document.getElementById('dril_asset_group_ip') as HTMLInputElement).value = '';
          }
        }

        if (parent_class == 'department') {
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

    $('.department').click((e: any) => {
      this.departmentId = $(e.currentTarget).attr('department_id');
      this.dashboardTitle = $(e.currentTarget).attr('department_code');
      this.groupBy = 'department';
      this.assetGroupId = '';
      this.assetId = '';
      this.downtime = '00:00';
      this.mttr = '00:00';
      this.mtbf = '00:00';
      this.getBreakdownChart();
    });

    $('.asset_group').click((e: any) => {
      this.assetGroupId = $(e.currentTarget).attr('asset_group_id');
      this.dashboardTitle = $(e.currentTarget).attr('asset_group_code');
      this.groupBy = 'asset_group';
      this.assetId = '';
      this.downtime = '00:00';
      this.mttr = '00:00';
      this.mtbf = '00:00';
      this.getBreakdownChart();
    });

    $('.asset').click((e: any) => {
      this.assetId = $(e.currentTarget).attr('asset_id');
      this.dashboardTitle = $(e.currentTarget).attr('asset_code');
      this.groupBy = 'asset';
      this.downtime = '00:00';
      this.mttr = '00:00';
      this.mtbf = '00:00';
      this.getBreakdownChart();
    });
  }

  getBreakdownChart() {
    const formdata = new FormData();
    formdata.append('plant_id', this.plantId);
    formdata.append('department_id', this.departmentId);
    formdata.append('asset_group_id', this.assetGroupId);
    formdata.append('asset_id', this.assetId);
    formdata.append('group_by', this.groupBy);
    formdata.append('report_type', 'summary');
    formdata.append('period', this.chartPeriodId);
    formdata.append('from_date', this.fromDate);
    formdata.append('to_date', this.toDate);
    formdata.append('user_login_id', this.loginId);
    this.report.breakdownReportData(formdata).subscribe(res => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getBreakdownAnalysis();
      } else {
        var breakdownList = res[0].breakdown_reportLists;
        this.getBreakdownAnalysis();
        if (breakdownList.length > 0) {
          var xaxis: any = [];
          var open_count: any = [];
          var inprogress_count: any = [];
          var acknowledge_count: any = [];
          var closed_count: any = [];
          var others_count: any = [];
          for (var i = 0; i < breakdownList.length; i++) {
            var open = breakdownList[i].reject + breakdownList[i].reassign + breakdownList[i].reopen + breakdownList[i].open;
            var inprogress = breakdownList[i].check_in + breakdownList[i].on_hold + breakdownList[i].pending;
            var others = breakdownList[i].assign + breakdownList[i].accept;
            var closed = breakdownList[i].fixed + breakdownList[i].cancel;

            open_count.push(open);
            inprogress_count.push(inprogress);
            acknowledge_count.push(breakdownList[i].completed);
            closed_count.push(closed);
            others_count.push(others);

            if (this.chartPeriodId == "previous_day" || this.chartPeriodId == "today") {
              xaxis.push(breakdownList[i].date + ':00');
            } else {
              xaxis.push(breakdownList[i].date);
            }
          }
          var series = [
            {
              name: 'Closed',
              color: '#00aa00',
              data: closed_count,
              stack: 'Open'
            },
            {
              name: 'Acknowledge',
              color: '#1cff73',
              data: acknowledge_count,
              stack: 'Open'
            },
            {
              name: 'Open',
              color: '#23ffed',
              data: open_count,
              stack: 'Open'
            },
            {
              name: 'Others',
              color: '#ffa500',
              data: others_count,
              stack: 'Other'
            },
            {
              name: 'In Progress',
              color: '#1c94ff',
              data: inprogress_count,
              stack: 'Other'
            }
          ];
          $("#breakdown_count").show();
          $("#no_breakdown_count").css('display', 'none');
          this.loadBreakdownChart(xaxis, series);
        } else {
          $("#breakdown_count").hide();
          $("#no_breakdown_count").css('display', 'flex');
        }
      }
    });
  }

  loadBreakdownChart(xaxis: any, series: any) {
    $('#breakdown_count').highcharts({
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 320,
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
          style: {
            color: '#009fff',
          }
        },
        gridLineWidth: 0
      },
      yAxis: [{
        allowDecimals: false,
        min: 0,
        title: {
          text: 'Tickets Count',
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        },
        gridLineWidth: 0
      }],
      legend: {
        itemStyle: {
          color: '#25d6ff',
        }
      },
      tooltip: {
        format: '<b>{key}</b><br/>{series.name}: {y}<br/>' +
          'Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          borderColor: 'transparent'
        }
      },
      series: series
    });
  }

  getBreakdownAnalysis() {
    const formData = new FormData();
    formData.append('plant_id', this.plantId);
    formData.append('department_id', this.departmentId);
    formData.append('asset_group_id', this.assetGroupId);
    formData.append('asset_id', this.assetId);
    formData.append('group_by', 'breakdown_category');
    formData.append('report_type', 'cumulative');
    formData.append('limit_report_for', 'exception');
    formData.append('limit_exception_for', 'breakdown_category');
    formData.append('limit_order_by', 'desc');
    formData.append('period', this.periodId);
    formData.append('from_date', this.fromDate);
    formData.append('to_date', this.toDate);
    formData.append('user_login_id', this.loginId);

    let xAxisName: any;
    let xAxisData: any = [];
    let yAxisData1: any = [];
    let yAxisData2: any = [];

    this.report.breakdownReportData(formData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getDowntimeDetail();
      } else {
        var breakdownList = res[0].breakdown_reportLists;
        this.getDowntimeDetail();
        if (breakdownList.length > 0) {
          breakdownList.forEach((dc: any, i: any) => {
            xAxisName = breakdownList[i].breakdown_category_name;
            xAxisData.push(xAxisName);
            let object: any = {};

            object["ticket_count"] = breakdownList[i].ticket_count;
            object["breakdown_category_id"] = breakdownList[i].breakdown_category_id;
            object["breakdown_sub_category_id"] = breakdownList[i].breakdown_sub_category_id;
            object["name"] = xAxisName;
            object["y"] = Number(breakdownList[i].ticket_count);
            object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
            object["drilldown"] = true;
            yAxisData1.push(object);

            object = {};

            object["ticket_count"] = breakdownList[i].ticket_count;
            object["breakdown_category_id"] = breakdownList[i].breakdown_category_id;
            object["breakdown_sub_category_id"] = breakdownList[i].breakdown_sub_category_id;
            object["name"] = xAxisName;
            let loss2 = (breakdownList[i].sum_of_downtime) / 3600;
            object["y"] = Number(loss2.toFixed(1));
            object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
            object["drilldown"] = true;
            yAxisData2.push(object);
          });
          $("#breakdown_analysis").show();
          $("#no_breakdown_analysis").css('display', 'none');
          this.loadBreakdownAnalysis(xAxisData, yAxisData1, yAxisData2);
        } else {
          $("#breakdown_analysis").hide();
          $("#no_breakdown_analysis").css('display', 'flex');
        }
      }
    });
  }

  loadBreakdownAnalysis(xAxis: any, yAxis1: any, yAxix2: any) {
    var series = [{
      "id": 'main_loss',
      "colorByPoint": true,
      "name": "Breakdown Count",
      "type": "column",
      "yAxis": 0,
      "data": yAxis1,
      'tooltip': {
        'valueSuffix': ' hrs'
      },
    }, {
      "id": "",
      "name": "Duration",
      "type": "spline",
      "yAxis": 1,
      "data": yAxix2,
      'tooltip': {
        'valueSuffix': ' hrs'
      },
    }]
    var categories = [xAxis];
    var subtitles = [''];
    var drilldownLevel = 0;
    var drillupEventID = '';

    $('#breakdown_analysis').highcharts({
      chart: {
        backgroundColor: 'transparent',
        height: 338,
        events: {
          drilldown: function (e: any) {
            var chart = this;
            const reportLevelLabel = e.point.series.userOptions.id;
            const breakdown_category_id = e.point.breakdown_category_id;
            const breakdown_sub_category_id = e.point.breakdown_sub_category_id;
            const drillDown_date: any = "";

            drillupEventID = '';
            switch (reportLevelLabel) {
              case 'main_loss':
                drillDownByMainLoss(e, chart, breakdown_category_id, drillDown_date);
                break;
              case 'sub_loss':
                drillDownBySubLoss(e, chart, breakdown_sub_category_id, drillDown_date);
                break;
            }
          },
          drillup: (e: any) => {
            var chart = this;
            onDrillup(e, chart);
          }
        },
      },
      drilldown: {
        activeAxisLabelStyle: {
          color: '#009fff',
          style: {
            fontWeight: 'normal',
          },
          textDecoration: 'none'
        },
        breadcrumbs: {
          buttonTheme: {
            fill: '#fff',
            padding: 5,
            stroke: '#ccc',
            strokeWidth: 1,
          },
          floating: true,
          position: {
            x: 60,
            y: -15
          },
          showFullPath: true
        }
      },
      series,
      xAxis: [{
        type: 'category',
        categories: categories[0],
        crosshair: true,
        labels: {
          style: {
            color: '#ebebeb',
          }
        },
      }],
      title: {
        text: ''
      },
      subtitle: {},
      yAxis: [{
        allowDecimals: false,
        labels: {
          format: '{value}',
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        },
        gridLineColor: 'transparent',
        title: {
          text: 'Breakdown Count',
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        }
      }, { // Secondary yAxis
        title: {
          text: 'Duration',
          style: {
            color: '#03adab',
            fontWeight: 600
          }
        },
        gridLineColor: 'transparent',
        allowDecimals: false,
        labels: {
          format: '{value} Hrs',
          style: {
            color: '#03adab',
            fontWeight: 600
          }
        },
        opposite: true
      }],
      plotOptions: {
        column: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            y: 40,
            format: '<p class="m-0" style="color: #fff">{point.y} </p>',
          },
          borderWidth: 0
        },
        spline: {
          dataLabels: {
            enabled: true,
            useHTML: true,
            format: '<p class="m-0" style="color: #fff">{point.hour}</p>',
          },
        },
        series: {
          borderColor: 'transparent',
          colors: [
            '#058DC7', '#17E8AF', '#E81750', '#27D828', '#D827D7', '#EFBF10',
            '#1040EF', '#00E6FF', '#DD21DE'
          ]
        },
      },
      tooltip: {
        "backgroundColor": '#343a40',
        "borderColor": '#6c757d',
        "padding": 0,
        "shadow": false,
        "shared": false,
        "useHTML": true,
        headerFormat: '<table class="table table-bordered mb-0">' +
          '<tr>' +
          '<th class="text-center text-white" colspan="2">{point.key}</th>' +
          '</tr>',
        pointFormat: '<tr class="text-white" style="font-size:0.9rem;">' +
          '<td><i class="fas fa-hourglass"></i>&nbsp; No.of Tickets</td>' +
          '<td style="text-align: right;color: {point.color}""><b>{point.ticket_count}</b></td>' +
          '</tr>' +
          '<tr class="text-white" style="font-size:0.9rem">' +
          '<td><i class="fas fa-history"></i>&nbsp; Duration </td>' +
          '<td style="text-align: right;color: {point.color}""><b>{point.hour}</b></td>' +
          '</tr>',
        footerFormat: '</table>',
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false
      }
    });

    const drillDownByMainLoss = (e: any, chart: any, breakdown_category_id: any, date: any) => {
      const formData = new FormData();
      formData.append('plant_id', this.plantId);
      formData.append('department_id', this.departmentId);
      formData.append('asset_group_id', this.assetGroupId);
      formData.append('asset_id', this.assetId);
      formData.append('group_by', 'breakdown_sub_category');
      formData.append('breakdown_category_id', breakdown_category_id);
      formData.append('report_type', 'cumulative');
      formData.append('limit_report_for', 'exception');
      formData.append('limit_exception_for', 'breakdown_sub_category');
      formData.append('limit_order_by', 'desc');
      formData.append('period', this.periodId);
      formData.append('from_date', this.fromDate);
      formData.append('to_date', this.toDate);
      formData.append('user_login_id', this.loginId);

      var xAxisDataDrill: any = [];
      var yAxisDataDrill1: any = [];
      var yAxisDataDrill2: any = [];
      var xAxisDrillName: any;

      this.report.breakdownReportData(formData).subscribe(res => {
        if (res.is_error) {
          this.common.toastdata(res.message, 'error');
        } else {
          var breakdownList = res[0].breakdown_reportLists;
          if (breakdownList.length > 0) {
            breakdownList.forEach((dc: any, i: any) => {
              xAxisDrillName = breakdownList[i].breakdown_sub_category_name;
              xAxisDataDrill.push(breakdownList[i].breakdown_sub_category_name);

              let object: any = {};

              object["ticket_count"] = breakdownList.ticket_count;
              object["breakdown_category_id"] = breakdownList[i].breakdown_category_id;
              object["breakdown_sub_category_id"] = breakdownList[i].breakdown_sub_category_id;
              object["asset_id"] = breakdownList[i].asset_id;
              object["name"] = xAxisDrillName;
              object["y"] = Number(breakdownList[i].ticket_count);
              object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
              object["drilldown"] = true;
              yAxisDataDrill1.push(object);

              object = {};

              object["ticket_count"] = breakdownList[i].ticket_count;
              object["breakdown_category_id"] = breakdownList[i].breakdown_category_id;
              object["breakdown_sub_category_id"] = breakdownList[i].breakdown_sub_category_id;
              object["asset_id"] = breakdownList[i].asset_id;
              object["name"] = xAxisDrillName;
              let loss1 = (breakdownList[i].sum_of_downtime) / 3600;
              object["y"] = Number(loss1.toFixed(1));
              object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
              object["drilldown"] = false;
              yAxisDataDrill2.push(object);
            });
          }
          var series = [{
            "id": "sub_loss",
            "colorByPoint": true,
            "name": "Breakdown Count",
            "type": "column",
            "yAxis": 0,
            "allowDecimals": false,
            "data": yAxisDataDrill1,
            "tooltip": {
              "valueSuffix": ' hrs'
            },
          }, {
            "id": "",
            "name": "Duration",
            "type": "spline",
            "yAxis": 1,
            "allowDecimals": false,
            "data": yAxisDataDrill2,
            "tooltip": {
              "valueSuffix": 'Hrs'
            },
          }];
          chart.addSingleSeriesAsDrilldown(e.point, series[0]);
          chart.addSingleSeriesAsDrilldown(e.point, series[1]);
          chart.applyDrilldown();
          categories[1] = xAxisDataDrill;
          chart.update({
            xAxis: {
              categories: xAxisDataDrill,
              crosshair: true
            }
          });
          drilldownLevel++;
        }
      });
    }

    const drillDownBySubLoss = (e: any, chart: any, breakdown_sub_category_id: any, subLoss_date: any) => {
      const formData = new FormData();
      formData.append('plant_id', this.plantId);
      formData.append('department_id', this.departmentId);
      formData.append('asset_group_id', this.assetGroupId);
      formData.append('asset_id', this.assetId);
      formData.append('breakdown_subcategory_id', breakdown_sub_category_id);
      formData.append('group_by', 'asset');
      formData.append('report_type', 'cumulative');
      formData.append('limit_report_for', 'exception');
      formData.append('limit_exception_for', 'asset');
      formData.append('limit_order_by', 'desc');
      formData.append('period', this.periodId);
      formData.append('from_date', this.fromDate);
      formData.append('to_date', this.toDate);
      formData.append('user_login_id', this.loginId);

      var xAxisDataDrill: any = [];
      var yAxisDataDrill1: any = [];
      var yAxisDataDrill2: any = [];
      var xAxisDrillName: any;

      this.report.breakdownReportData(formData).subscribe(res => {
        if (res.is_error) {
          this.common.toastdata(res.message, 'error');
        } else {
          var breakdownList = res[0].breakdown_reportLists;
          if (breakdownList.length > 0) {
            breakdownList.forEach((dc: any, i: any) => {
              xAxisDrillName = breakdownList[i].asset_name;
              xAxisDataDrill.push(breakdownList[i].asset_code);

              let object: any = {};

              object["ticket_count"] = breakdownList[i].ticket_count;
              object["asset_id"] = breakdownList[i].asset_id;
              object["name"] = xAxisDrillName;
              object["y"] = Number(breakdownList[i].ticket_count);
              object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
              object["drilldown"] = false;
              yAxisDataDrill1.push(object);

              object = {};

              object["ticket_count"] = breakdownList[i].ticket_count;
              object["breakdown_category_id"] = breakdownList[i].breakdown_category_id;
              object["breakdown_sub_category_id"] = breakdownList[i].breakdown_sub_category_id;
              object["asset_id"] = breakdownList[i].asset_id;
              object["name"] = xAxisDrillName;
              let loss1 = (breakdownList[i].sum_of_downtime) / 3600;
              object["y"] = Number(loss1.toFixed(1));
              object["hour"] = this.timeFormat.transform(breakdownList[i].sum_of_downtime);
              object["drilldown"] = false;
              yAxisDataDrill2.push(object);
            });
          }
          var series = [{
            "id": "",
            "colorByPoint": true,
            "name": "Breakdown Count",
            "type": "column",
            "allowDecimals": false,
            "yAxis": 0,
            "data": yAxisDataDrill1,
            "tooltip": {
              "valueSuffix": ' hrs'
            },
          }, {
            "id": "",
            "name": "Duration",
            "type": "spline",
            "allowDecimals": false,
            "yAxis": 1,
            "data": yAxisDataDrill2,
            "tooltip": {
              "valueSuffix": 'Hrs'
            },
          }];

          subtitles[2] = '';
          chart.addSingleSeriesAsDrilldown(e.point, series[0]);
          chart.addSingleSeriesAsDrilldown(e.point, series[1]);
          chart.applyDrilldown();
          categories[2] = xAxisDataDrill;
          chart.update({
            xAxis: {
              categories: xAxisDataDrill,
              crosshair: true
            },
          });
          drilldownLevel++;
        }
      });
    }

    function onDrillup(event: any, chart: any) {
      if (drillupEventID !== event.seriesOptions.id) {
        drilldownLevel--;
        drillupEventID = event.seriesOptions.id;
        event.target.xAxis[0].categories = categories[drilldownLevel];
      }
    }
  }

  getDowntimeDetail() {
    const formData = new FormData();
    formData.append('plant_id', this.plantId);
    formData.append('department_id', this.departmentId);
    formData.append('asset_group_id', this.assetGroupId);
    formData.append('asset_id', this.assetId);
    formData.append('group_by', this.groupBy);
    formData.append('report_type', 'cumulative');
    formData.append('period', this.periodId);
    formData.append('from_date', this.fromDate);
    formData.append('to_date', this.toDate);
    formData.append('user_login_id', this.loginId);
    this.report.breakdownReportData(formData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getMaxAssetBreakdown()
      } else {
        var breakdownList = res[0].breakdown_reportLists;
        this.getMaxAssetBreakdown();
        if (breakdownList.length > 0) {
          for (var i = 0; i < breakdownList.length; i++) {
            this.mttr = this.timeFormat.transformHM(breakdownList[i].mttr);
            this.mtbf = this.timeFormat.transformHM(breakdownList[i].mtbf);
            this.downtime = this.timeFormat.transformHM(breakdownList[i].sum_of_downtime);
          }
        } else {
          this.downtime = '00:00';
          this.mttr = '00:00';
          this.mtbf = '00:00';
        }
      }
    });
  }

  getMaxAssetBreakdown() {
    const formData = new FormData();
    formData.append('plant_id', this.plantId);
    formData.append('department_id', this.departmentId);
    formData.append('asset_group_id', this.assetGroupId);
    formData.append('asset_id', this.assetId);
    formData.append('group_by', 'asset');
    formData.append('report_type', 'cumulative');
    formData.append('limit_report_for', 'exception');
    formData.append('limit_exception_for', 'downtime');
    formData.append('limit_order_by', 'desc');
    formData.append('limit_operation_value', '10');
    formData.append('period', this.periodId);
    formData.append('from_date', this.fromDate);
    formData.append('to_date', this.toDate);
    formData.append('user_login_id', this.loginId);
    this.report.breakdownReportData(formData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getEngineerList();
      } else {
        var breakdownList = res[0].breakdown_reportLists;
        this.getEngineerList();
        let ticket_count: any = [];
        let xaxis: any = [];
        let downtime_duration: any = [];

        if (breakdownList.length > 0) {
          for (var i = 0; i < breakdownList.length; i++) {
            ticket_count.push(breakdownList[i].ticket_count);
            var downtime = breakdownList[i].sum_of_downtime / 3600;
            downtime_duration.push(Number(downtime.toFixed(1)));
            xaxis.push(breakdownList[i].asset_name)
          }
          this.loadMaxAssetChart(xaxis, ticket_count, downtime_duration)
          $("#asset_breakdown").show();
          $("#no_asset_breakdown").css('display', 'none');
        } else {
          $("#asset_breakdown").hide();
          $("#no_asset_breakdown").css('display', 'flex');
        }
      }
    });
  }

  loadMaxAssetChart(xaxis: any, yaxis: any, yaxis1: any) {
    $('#asset_breakdown').highcharts({
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 400
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

  getEngineerList() {
    const formdata = new FormData();
    formdata.append('plant_id', this.plantId);
    formdata.append('department_id', this.departmentId);
    formdata.append('asset_group_id', this.assetGroupId);
    formdata.append('asset_id', this.assetId);
    formdata.append('group_by', 'engineer');
    formdata.append('report_type', 'cumulative');
    formdata.append('period', this.periodId);
    formdata.append('from_date', this.fromDate);
    formdata.append('to_date', this.toDate);
    formdata.append('user_login_id', this.loginId);
    this.report.getEngineerList(formdata).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getTotalSpare();
      } else {
        this.engineerList = res[0].engineer_reportLists;
        this.getTotalSpare();
        if (this.engineerList.length > 0) {
          $("#engineer_div").show();
          $("#no_engineer_div").css('display', 'none');
          this.engineerList.forEach((element: any) => {
            element.avg_response_time = this.timeFormat.transform(element.avg_response_time);
            element.avg_resolve_time = this.timeFormat.transform(element.avg_resolve_time);
            element.engineer_perc = ((element.fixed / element.ticket_count) * 100).toFixed(0);
          });
        } else {
          $("#engineer_div").hide();
          $("#no_engineer_div").css('display', 'flex');
        }
      }
    });
  }

  getTotalSpare() {
    const spareData = new FormData();
    spareData.append('plant_id', this.plantId);
    spareData.append('department_id', this.departmentId);
    spareData.append('asset_group_id', this.assetGroupId);
    spareData.append('asset_id', this.assetId);
    spareData.append('group_by', this.groupBy);
    spareData.append('spare_type', 'all');
    spareData.append('report_type', 'cumulative');
    spareData.append('period', this.periodId);
    spareData.append('from_date', this.fromDate);
    spareData.append('to_date', this.toDate);
    spareData.append('report_for', 'regular');
    this.report.spareReportData(spareData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getBreakdownSpare();
      } else {
        var spareData = res[0].spare_reportLists;
        this.getBreakdownSpare();
        if (spareData.length > 0) {
          this.totalSpare = spareData[0].consumed_qty;
          this.totalCost = spareData[0].total_cost;
        } else {
          this.totalSpare = 0;
          this.totalCost = 0;
        }
      }
    });
  }

  getBreakdownSpare() {
    const spareData = new FormData();
    spareData.append('plant_id', this.plantId);
    spareData.append('department_id', this.departmentId);
    spareData.append('asset_group_id', this.assetGroupId);
    spareData.append('asset_id', this.assetId);
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
        this.getPMSpare();
      } else {
        var spareData = res[0].spare_reportLists;
        this.getPMSpare();
        if (spareData.length > 0) {
          this.breakdownSpare = spareData[0].consumed_qty;
          this.breakdownSpareCost = spareData[0].total_cost;
        } else {
          this.breakdownSpare = 0;
          this.breakdownSpareCost = 0;
        }
      }
    });
  }

  getPMSpare() {
    const spareData = new FormData();
    spareData.append('plant_id', this.plantId);
    spareData.append('department_id', this.departmentId);
    spareData.append('asset_group_id', this.assetGroupId);
    spareData.append('asset_id', this.assetId);
    spareData.append('group_by', this.groupBy);
    spareData.append('spare_type', 'pm');
    spareData.append('report_type', 'cumulative');
    spareData.append('period', this.periodId);
    spareData.append('from_date', this.fromDate);
    spareData.append('to_date', this.toDate);
    spareData.append('report_for', 'regular');
    this.report.spareReportData(spareData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
        this.getSpareChart();
      } else {
        var spareData = res[0].spare_reportLists;
        this.getSpareChart();
        if (spareData.length > 0) {
          this.pmSpare = spareData[0].consumed_qty;
          this.pmSpareCost = spareData[0].total_cost;
        } else {
          this.pmSpare = 0;
          this.pmSpareCost = 0;
        }
      }
    });
  }

  getSpareChart() {
    const spareData = new FormData();
    spareData.append('plant_id', this.plantId);
    spareData.append('department_id', this.departmentId);
    spareData.append('asset_group_id', this.assetGroupId);
    spareData.append('asset_id', this.assetId);
    spareData.append('group_by', this.groupBy);
    spareData.append('spare_type', 'all');
    spareData.append('report_type', 'cumulative');
    spareData.append('period', this.periodId);
    spareData.append('from_date', this.fromDate);
    spareData.append('to_date', this.toDate);
    spareData.append('limit_report_for', 'exception');
    spareData.append('limit_exception_for', 'consumed_qty');
    spareData.append('limit_order_by', 'desc');
    spareData.append('limit_operation_value', '10');
    this.report.spareReportData(spareData).subscribe((res: any) => {
      if (res.is_error) {
        this.common.toastdata(res.message, 'error');
      } else {
        var spareList = res[0].spare_reportLists;
        console.log(spareList)
        var xaxis: any = [];
        var yaxis: any = [];
        var series: any = [];
        if (spareList.length > 0) {
          for (var i = 0; i < spareList.length; i++) {
            xaxis.push(spareList[i].spare_name) 
            series.push({
              name: spareList[i].spare_name,
              data: [{
                y: spareList[i].consumed_qty,
                total_cost: spareList[i].total_cost,
              }],
            });
          }
          $("#spare_consumption").show();
          $("#no_spare_consumption").css('display', 'none');
          this.loadSpareChart(xaxis, series)

        } else {
          $("#spare_consumption").hide();
          $("#no_spare_consumption").css('display', 'flex');
        }
      }
    });
  }

  loadSpareChart(xaxis: any, series: any){
    $('#spare_consumption').highcharts({
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        height: 340
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
        crosshair: true,
        labels: {
          style: {
            color: '#009fff',
            textDecoration: 'none'
          }
        },
        gridLineWidth: 0
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: {
          text: 'Spare Cost',
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            color: '#c0aa07',
            fontWeight: 600
          }
        },
        gridLineWidth: 0
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: false
          }
        }
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<h5 class="mb-0" style="font-size: 1.2rem">{series.name}</h5>',
        pointFormat: '<p class="mb-1" style="font-size: 0.9rem;color:{point.color}">Consumed Qty : {point.y}</p>'+
        '<p class="mb-0" style="font-size: 0.9rem;color:{point.color}">Total Cost : ₹ {point.total_cost}</p>'
      },
      series: series
    });
  }
}
