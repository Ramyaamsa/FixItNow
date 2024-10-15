import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CommonService } from '../../shared_services/common.service';
import { WorkOrderService } from '../../shared_services/work-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-pm-calendar',
  templateUrl: './pm-calendar.component.html',
  styleUrls: ['./pm-calendar.component.css'],
})
export class PmCalendarComponent {
  loginId: any = '';
  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  departmentId: any = '';
  locationId: any = '';
  pmScheduleList: any = '';
  calendar: any = null;
  scheduleDate: any = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [
      { title: 'event 1', date: '2019-04-01' },
      { title: 'event 2', date: '2019-04-02' }
    ]
  };

  constructor(private commonService: CommonService, private workOrder: WorkOrderService, private spinner: NgxSpinnerService, private datePipe: DatePipe) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
    this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');

    this.getPMSchedule();
  }

  getPMSchedule() {
    this.spinner.show();
    const startTime = Date.now();
    const serviceForm = new FormData();
    serviceForm.append('company_id', this.companyId);
    serviceForm.append('bu_id', this.buId);
    serviceForm.append('plant_id', this.plantId);
    serviceForm.append('department_id', this.departmentId);
    serviceForm.append('location_id', this.locationId);
    serviceForm.append('asset_group_id', '');
    serviceForm.append('asset_id', '');
    serviceForm.append('status', '');
    this.workOrder.getPmScheduleLists(serviceForm).subscribe((res: any) => {
      if (res.iserror) {
        this.spinner.hide();
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.spinner.hide();
        this.pmScheduleList = res[0].pm_schedule_list;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          for (var i = 0; i < this.pmScheduleList.length; i++) { // Increment by 2 to get every other month      
            var cri: any = {};
            cri["id"] = i;
            cri["name"] = this.pmScheduleList[i].service_name;
            cri["asset_name"] = this.pmScheduleList[i].asset_name;
            cri["startDate"] = new Date(this.pmScheduleList[i].schedule_date);
            cri["endDate"] = new Date(this.pmScheduleList[i].schedule_date);
            this.scheduleDate.push(cri);

            if (i == this.pmScheduleList.length - 1) {
              this.calendarLoad();
            }
          }
        }, responseTime);
      }
    });
  }

  calendarLoad() {
    console.log(this.scheduleDate);
    this.calendar = $('#pm_calendar_view').calendar({
      startYear: '2024',
      enableContextMenu: false,
      enableRangeSelection: false,
      displayHeader: false,
      style: 'border',
      mouseOnDay: (e: any) => {
        if (e.events.length > 0) {
          var content = '';

          for (var i in e.events) {
            content += '<div class="event-tooltip-content">'
              + ' <div class="event-name"><p class="mb-0 text-info">' + e.events[i].name + '</p>'
              + '   <p class="mb-0 text-info">' + e.events[i].asset_name + '</p>'
              + '   <p class="mb-1 border"></p>'
              + ' </div>'
              + '</div>';
          }

          $(e.element).popover({
            trigger: 'manual',
            container: 'body',
            html: true,
            content: content
          });

          $(e.element).popover('show');
        }
      },
      mouseOutDay: (e: any) => {
        if (e.events.length > 0) {
          $(e.element).popover('hide');
        }
      },
      dayContextMenu: (e: any) => {
        $(e.element).popover('hide');
      },
      dataSource: this.scheduleDate
    });
  }

}
