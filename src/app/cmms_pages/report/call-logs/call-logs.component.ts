import { Component } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-call-logs',
  templateUrl: './call-logs.component.html',
  styleUrls: ['./call-logs.component.css']
})
export class CallLogsComponent {

  constructor(private router: Router) {}
  ngOnInit() {
    $('.select2').chosen();

    $('#from_date').datepicker({
			format: 'yyyy',
			endDate: '+0d',
			autoclose: true,
			orientation: 'bottom right',
			minViewMode: "years",
			default: 'year'
		});
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }
}
