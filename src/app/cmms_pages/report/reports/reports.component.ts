import { Component } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {

  constructor(private router: Router) { }
  ngOnInit() {
    $('.select2').chosen();
    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      endDate: '+0d',
      autoclose: true,
      orientation: 'bottom right'
    });
    $(".multiselect").bsMultiSelect({
      cssPatch: {
        choices: {
          columnCount: '3'
        },
      }
    });

    $("#report_type_detail").on("click", function () {
      $('#issue_div').show();
      $('#workorder_div').show();
    });
    $("#report_type_summary").on("click", function () {
      $('#issue_div').hide();
      $('#workorder_div').hide();
    });

    $("#period_id").change(function () {
      if ($("#period_id").val() == "sel_date") {
        $(".from_date_label").html("Date");
        $(".from_date_div").css("display", "block");
        $(".to_date_div").css("display", "none");
        $(".shift_date_div").css("display", "none");
      } else if ($("#period_id").val() == "from_to") {
        $(".from_date_label").html("From Date");
        $(".from_date_div").css("display", "block");
        $(".to_date_div").css("display", "block");
        $(".shift_date_div").css("display", "block");
      }
    });

    $('#report_for').change(() => {
      var report_for = $('#report_for').val();
      if (report_for == 'regular') {
        $('#condition_div').hide();
        $('#duration_div').hide();
      } else if (report_for == 'exception') {
        $('#condition_div').show();
        $('#duration_div').show();
      }
    })

    const showElements: { [key: string]: string[] } = {
      '': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div',],
      'Transaction': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#issue_div', '#group_by_div', '#depend_group_div', '#peroid_div', '#from_date_div', '#to_date_div', '#filter_option', '.transaction'],
      'Call Log': ['#company_div', '#bu_div', '#plant_div', '#year_div', '#report_div'],
      'Spare': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#asset_div', '#spares_div', '#workorder_div', '#peroid_div', '#from_date_div', '#to_date_div', '#filter_option', '#asset_div'],
      'PM': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#group_by_div', '#asset_div', '#service_div', '#peroid_div', '#from_date_div', '#to_date_div', '#filter_option'],
      'Asset Scrap': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#asset_code_div', '#peroid_div', '#from_date_div', '#to_date_div'],
      'Log': ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#asset_code_div', '#peroid_div', '#from_date_div', '#to_date_div']
    };

    const allElementsToHide: string[] = ['#company_div', '#bu_div', '#plant_div', '#department_div', '#location_div', '#report_div', '#asset_group_div', '#issue_div', '#group_by_div', '#depend_group_div', '#asset_div', '#spares_div', '#workorder_div', '#service_div', '#asset_div', '#peroid_div', '#from_date_div', '#to_date_div', '#year_div', '#asset_code_div', '#filter_option', '.card-tools', '.transaction'];

    $(document).ready(function () {
      $('#report_name').change(() => {
        var task_type = $("#report_name").val();
        $(allElementsToHide.join(', ')).hide();
        if (showElements.hasOwnProperty(task_type)) {
          $(showElements[task_type].join(', ')).show();
        }
      });
    });
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }
}
