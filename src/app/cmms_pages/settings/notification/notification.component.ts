import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  menuList: any = [];
  userList: any = [];
  companyList: any = [];
  employeeList: any = [];
  statusList: any = [];
  companyId: any = '';
  isNotification: boolean = false;
  loginId: any = '';

  constructor(private masterService: MasterService, private commonService: CommonService,
    private settingService: SettingService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    $('.select2').chosen();
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');

    $.validator.setDefaults({ ignore: ":hidden:not(select)" });
    $("#menu_form").validate();

    this.getCompanyList(this.companyId);
    $('#company_name').change(() => {
      this.getStatusList();
    })
  }

  getStatusList() {
    const startTime = Date.now();
    this.settingService.getBreakdownStatusList(this.statusList).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.statusList = res[0].Breakdown_status_Lists;
        this.statusList = this.statusList.filter((id: any) => id.id != 7);
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          this.getCustomMenuList();
        }, responseTime);
      }
    })
  }

  getCompanyList(company_id: any) {
    const employeeForm = new FormData;
    employeeForm.append('company_id', company_id);
    employeeForm.append('status', 'active');
    this.masterService.getCompanyList(this.companyList).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.companyList = res[0].companyLists;
        setTimeout(() => {
          $('#company_name').chosen('destroy');
          if (company_id != '') {
            $('#company_name').attr('disabled', true);
            $('#company_name').val(company_id).trigger('change');
          }
          $('#company_name').chosen();
        }, 1000);
      }
    })
  }

  getCustomMenuList() {
    this.spinner.show();
    const startTime = Date.now();
    const newForm = new FormData();
    newForm.append('company_id', $('#company_name').val());
    this.settingService.getCustomnotificationList(newForm).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.spinner.hide();
        this.menuList = res[0].Customized_notification_List;
        this.isNotification = this.menuList[0].is_notification == 'yes' ? true : false;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          for (var i = 0; i < this.menuList.length; i++) {
            $('#plant_head_app' + i).attr('checked', this.menuList[i].plant_head_app == 'yes' ? true : null)
            $('#plant_head_email' + i).attr('checked', this.menuList[i].plant_head_email == 'yes' ? true : null)
            $('#plant_head_push' + i).attr('checked', this.menuList[i].plant_head_push == 'yes' ? true : null)
            $('#department_head_email' + i).attr('checked', this.menuList[i].department_head_email == 'yes' ? true : null)
            $('#department_head_app' + i).attr('checked', this.menuList[i].department_head_app == 'yes' ? true : null)
            $('#department_head_push' + i).attr('checked', this.menuList[i].department_head_push == 'yes' ? true : null)
            $('#head_engineer_email' + i).attr('checked', this.menuList[i].head_engineer_email == 'yes' ? true : null)
            $('#head_engineer_app' + i).attr('checked', this.menuList[i].head_engineer_app == 'yes' ? true : null)
            $('#head_engineer_push' + i).attr('checked', this.menuList[i].head_engineer_push == 'yes' ? true : null)
            $('#engineer_email' + i).attr('checked', this.menuList[i].engineer_email == 'yes' ? true : null)
            $('#engineer_app' + i).attr('checked', this.menuList[i].engineer_app == 'yes' ? true : null)
            $('#engineer_push' + i).attr('checked', this.menuList[i].engineer_push == 'yes' ? true : null)
            console.log($('#engineer_push' + i).attr('checked', this.menuList[i].engineer_push == 'yes' ? true : null))
          }
        }, responseTime);
      }
    })
  }

  saveCustomnotification() {
    this.spinner.show();
    var menu: any = [];
    const menurowlength = this.statusList.length; // Assuming statusList is the data source for your table

    for (let i = 0; i < menurowlength; i++) {
      const cri: any = {};

      cri['status_name'] = $('#status_name' + i).text();
      cri['status_id'] = Number($('#status_id' + i).val());

      cri['plant_head_email'] = (document.getElementById('plant_head_email' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['plant_head_app'] = (document.getElementById('plant_head_app' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['plant_head_push'] = (document.getElementById('plant_head_push' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['department_head_email'] = (document.getElementById('department_head_email' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['department_head_app'] = (document.getElementById('department_head_app' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['department_head_push'] = (document.getElementById('department_head_push' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['head_engineer_email'] = (document.getElementById('head_engineer_email' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['head_engineer_app'] = (document.getElementById('head_engineer_app' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['head_engineer_push'] = (document.getElementById('head_engineer_push' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['engineer_email'] = (document.getElementById('engineer_email' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['engineer_app'] = (document.getElementById('engineer_app' + i) as HTMLInputElement).checked ? 'yes' : 'no';
      cri['engineer_push'] = (document.getElementById('engineer_push' + i) as HTMLInputElement).checked ? 'yes' : 'no';

      menu.push(cri);
    }
    var is_notification = this.isNotification == true ? "yes" : "no";
    const menudata = new FormData();
    menudata.append('company_id', $('#company_name').val());
    menudata.append('is_notification', is_notification);
    menudata.append('obj', JSON.stringify(menu));

    this.settingService.saveCustomNotification(menudata).subscribe((res: any) => {
      if (res.is_error) {
        this.spinner.hide();
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.spinner.hide();
        this.commonService.toastdata(res[0].message, 'success');
        this.commonService.reloadComponent('panel-iframe-setting-notification');
      }
    })
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-setting-notification');
  }
}
