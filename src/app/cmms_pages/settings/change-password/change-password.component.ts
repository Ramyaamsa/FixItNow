import { Component } from '@angular/core';
import { SettingService } from '../../shared_services/setting-service';
import { CommonService } from '../../shared_services/common.service';

declare var $: any;

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  loginId: any = ''

  constructor(private settingService: SettingService, private commonService: CommonService) {}

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');

    $(".password_show").click(function (e: any) {
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
  }

  save() {
    const oldpassword = $("#oldpassword").val();
    const newPassword = $("#newpassword").val();
    const retypepassword = $("#retypepassword").val();

    if (newPassword != retypepassword) {
      alert('Kindly check the new and retype password');
    } else if (oldpassword == newPassword) {
      alert('The old and new password are same');
    }
    else {
      if ($('#save_form').valid()) {
        let passwordData = new FormData();
        passwordData.append('old_password', oldpassword);
        passwordData.append('new_password', newPassword);
        passwordData.append('retype_password', retypepassword);
        passwordData.append('employee_id', this.loginId);

        this.settingService.changePassword(passwordData).subscribe((res: any) => {
          if (res.iserror) {
            this.commonService.toastdata(res.message, 'error')
          } else {
            setTimeout(() => {
              this.commonService.toastdata(res.message, 'success');
              this.commonService.reloadComponent('panel-iframe-settings-change_password');
            }, 1200);
          }
        });
      }
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-settings-change_password');
  }

}

