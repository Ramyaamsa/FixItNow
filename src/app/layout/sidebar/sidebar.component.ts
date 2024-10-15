import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/cmms_pages/shared_services/common.service';
import { SettingService } from 'src/app/cmms_pages/shared_services/setting-service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})

export class SidebarComponent {
  currentDate: any = new Date();
  time = new Date();
  menuId: any = [];

  intervalId: any;
  employeeName: any = '';
  plantId: any = '';
  loginId: any = '';
  userType: any = '';
  fromDate: any = '';
  userDetail: any = [];
  notificationLists: any = [];
  homeUrl: any = 'iframe/dashboard/home';
  userImage: any = "assets/images/placeholder.gif";
  isTrailOpen: boolean = true;
  trial_date: any = '';

  trialStatement: any = 'Trial Period gets ended';
  constructor(private router: Router, private commonService: CommonService, private settingService: SettingService, private datepipe: DatePipe) { }

  ngOnInit() {
    this.employeeName = localStorage.getItem('employee_name');
    this.loginId = localStorage.getItem('employee_id');
    this.userType = localStorage.getItem('employee_type');
    this.plantId = localStorage.getItem('plant_id');
    var user_dtl: any = localStorage.getItem('user_dtl');
    this.userDetail = JSON.parse(user_dtl)[0];
    this.userImage = localStorage.getItem('image_url')
    this.fromDate = this.datepipe.transform(new Date(), 'dd-MM-yyyy');
    var is_trial = this.userDetail.is_trial;
    var date: any = this.userDetail.trial_date.split('-');

    this.trial_date = new Date(date[2], date[1] - 1, date[0]); // (year, month, day)
    if (is_trial == 'yes') {
      if (this.currentDate > this.trial_date) {
        this.isTrailOpen = false;
        $('#trial_over_modal').modal('show');
      } else {
        this.isTrailOpen = true;
        var differenceInMilliseconds = this.trial_date - this.currentDate;
        var differenceInDays = Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        if (differenceInDays > 0 && differenceInDays < 6) {
          if (differenceInDays == 1) {
            this.trialStatement = 'Trial Period gets over in ' + differenceInDays + 'day';
          } else {
            this.trialStatement = 'Trial Period gets over in ' + differenceInDays + 'days';
          }
          $('#trial_over_modal').modal('show');
        } else if (differenceInDays == 0) {
          this.trialStatement = 'Trial Period gets over by today';
          $('#trial_over_modal').modal('show');
        }

        setTimeout(() => {
          $('#trial_over_modal').modal('hide');
        }, 5000);
      }
    }

    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);

    this.menuRights();
    window.addEventListener('message', this.handleIframeMessage.bind(this), false);

    //  For refreshing the particular page inside tab concept
    $(document).on('click', '.btn-iframe-refresh , #refresh', () => {
      var $iframe = $('iframe');
      for (var i = 0; i < $iframe.length; i++) {
        var parent_class = $iframe.eq(i).parent().attr('class');
        if (parent_class.includes('active')) {
          $iframe[i].contentWindow.location.reload(true);
        }
      }
    });

    $(".password_show").click((e: any) => {
      var pass_id = $(e.currentTarget).attr('org_id')
      if ($(e.currentTarget).is(':checked')) {
        $("#" + pass_id + "password").attr('type', 'text');
        $("#" + pass_id + "password_icon").removeClass('fa-eye');
        $("#" + pass_id + "password_icon").addClass('fa-eye-slash');
      } else {
        $("#" + pass_id + "password").attr('type', 'password');
        $("#" + pass_id + "password_icon").removeClass('fa-eye-slash');
        $("#" + pass_id + "password_icon").addClass('fa-eye');
      }
    });
    this.getNotificationData();
  }

  handleIframeMessage(event: MessageEvent) {
    const data = event.data;
    this.open_mc_data_tab(data.tabName, data.tabUrl)
  }

  menuRights() {
    const formdata = new FormData();
    formdata.append('user_login_id', this.loginId);
    this.settingService.getUserMenuList(formdata).subscribe((data: any) => {
      if (data.is_error) {
        this.commonService.toastdata(data.message, 'error');
      } else {
        var menuData = data.get_user_menu_Lists;
        for (var i = 0; i < menuData.length; i++) {
          this.menuId[menuData[i].menu_id] = true;
        }
        if (this.isTrailOpen) {
          if (this.userType == 'Super Admin' || this.userType == 'Admin' || this.userType == 'Company Head' || this.userType == 'BU Head') {
            this.open_mc_data_tab('<i class="fas fa-home nav-icon"></i> Home', 'iframe/dashboard/home');
            this.homeUrl = 'iframe/dashboard/home';
          } else {
            this.open_mc_data_tab('<i class="fas fa-home nav-icon"></i> Home', 'iframe/dashboard/plant/' + this.plantId);
            this.homeUrl = 'iframe/dashboard/plant/' + this.plantId;
          }
        }
      }
    });
  }
  // For opening the Components in next by next tab - Adminlte.js function call
  open_mc_data_tab(machine_code: any, url: any) {
    if (url != '' && url != undefined) {
      var default_iframe_open = url;
      default_iframe_open = default_iframe_open.replaceAll(":", "-");
      default_iframe_open = default_iframe_open.replaceAll("//", "");
      default_iframe_open = default_iframe_open.replaceAll("/", "-");
      default_iframe_open = default_iframe_open.replaceAll(".", "-");
      if ($("#panel-" + default_iframe_open).length == 0) {
        $('.content-wrapper').IFrame('createTab', machine_code, url, default_iframe_open, true);
        return
      } else {
        $('.content-wrapper').IFrame('switchTab', "#tab-" + default_iframe_open);
      }
    }
  }

  getNotificationData() {
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

  logOut() {
    localStorage.clear();
    this.router.navigate(['auth']);
  }

  saveChangePassword() {
    const oldpassword = $("#oldpassword").val();
    const newPassword = $("#newpassword").val();
    const retypepassword = $("#retypepassword").val();

    if ($('#save_form').valid()) {
      if (newPassword != retypepassword) {
        this.commonService.toastdata('Kindly check the New and Retype Password', 'warning');
      } else if (oldpassword == newPassword) {
        this.commonService.toastdata('The Old and New Password are same', 'warning');
      }
      else {
        let passwordData = new FormData();
        passwordData.append('old_password', oldpassword);
        passwordData.append('new_password', newPassword);
        passwordData.append('retype_password', retypepassword);
        passwordData.append('employee_id', this.loginId);

        this.settingService.changePassword(passwordData).subscribe((res: any) => {
          if (res[0].iserror) {
            this.commonService.toastdata(res[0].message, 'error')
          } else {
            this.commonService.toastdata(res[0].message, 'success');
            $('#oldpassword').val('');
            $('#newpassword').val('');
            $('#retypepassword').val('');
            $('#change_password_modal').modal('hide');
          }
        });
      }
    }
  }

}
