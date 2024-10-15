import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-notification-view',
  templateUrl: './notification-view.component.html',
  styleUrls: ['./notification-view.component.css']
})
export class NotificationViewComponent {
  
  fromDate: any = '';
  loginId: any = '';
  notificationLists: any = [];

  constructor(private router: Router, private commonService: CommonService, private settingService: SettingService, private datepipe: DatePipe) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.fromDate = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
    this.getNotificationData();
  }

  getNotificationData(){
    let notificationData = new FormData();
    notificationData.append('from_date', this.fromDate);
    notificationData.append('to_date', '');
    notificationData.append('user_login_id', this.loginId);
    this.settingService.getNotificationLists(notificationData).subscribe((res: any) => {
      if (res[0].iserror) {
        this.commonService.toastdata(res[0].message, 'error')
      } else {
        this.notificationLists = res[0].get_notification_data;
      }
    });
  }

}
