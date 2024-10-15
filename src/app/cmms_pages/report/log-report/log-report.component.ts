import { Component } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-log-report',
  templateUrl: './log-report.component.html',
  styleUrls: ['./log-report.component.css']
})
export class LogReportComponent {

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
          columnCount: 3
        },
      }
    });

    $("#period_id").change(function() {
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
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }
}
