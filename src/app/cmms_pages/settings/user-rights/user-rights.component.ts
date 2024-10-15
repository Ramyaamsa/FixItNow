import { Component } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;
@Component({
  selector: 'app-user-rights',
  templateUrl: './user-rights.component.html',
  styleUrls: ['./user-rights.component.css']
})
export class UserRightsComponent {
  menuList: any = [];
  userList: any = [];
  companyList: any = [];
  loginId: any = '';

  constructor(private spinner: NgxSpinnerService, private commonService: CommonService,
    private settingService: SettingService) { }

  ngOnInit() {
    $('.select2').chosen();
    this.loginId = localStorage.getItem('employee_id');
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#menu_form").validate();

    // this.loadCompany();
    this.loadUsers();

    $('#user_name').on('change', () => {
      this.menuLists($('#user_name').val());
    })
  }

  menuLists(userId: any) {
    this.spinner.show();
    const menuList = new FormData;
    menuList.append('employee_id', userId);
    menuList.append('login_user_id', this.loginId);

    this.settingService.getRightsUserMenuList(menuList).subscribe((data: any) => {
      if (data.is_error) {
        this.spinner.hide();
        this.commonService.toastdata(data.message, 'error');
      } else {
        this.spinner.hide();
        this.menuList = data.get_rights_user_menuLists;
      }
    })
  }

  loadUsers() {
    const userList = new FormData;
    userList.append('user_login_id', this.loginId);

    this.settingService.employeePageList(userList).subscribe((data: any) => {
      if (data.is_error) {
        this.commonService.toastdata(data.message, 'error');
      } else {
        this.userList = data.get_employee_page_Lists;
        setTimeout(() => {
          $('#user_name').chosen('destroy');
          $('#user_name').chosen();
        }, 1000);
      }
    });
  }
  /* 
    loadCompany() {
      const companyList = new FormData;
      companyList.append('company_id', '')
      companyList.append('status', 'active')
  
      this.masterService.companyList(companyList).subscribe((data: any) => {
        if (data.is_error) {
          this.commonService.toastdata(data.message, 'error');
        } else {
          this.companyList = data.companyLists;
  
          setTimeout(() => {
            $('#company_name').chosen('destroy');
            $('#company_name').chosen();
          }, 1000);
        }
      })
    } */

  changeFunction(event: any) {
    if ($(event.currentTarget).attr('is_parent') == 'no') {
      return;
    }

    var curmenu_level = $(event.currentTarget).attr('menu_level');
    var curmenu_id = $(event.currentTarget).attr('menu_id');
    var status = false;
    if ($(event.currentTarget).is(':checked')) {
      status = true;
    }

    this.parentcheck(curmenu_level, curmenu_id, status);
  }

  parentcheck(curmenu_level: any, curmenu_id: any, status: any) {
    var startcheck = 0;
    const menu_table = document.getElementById('menu_table') as HTMLTableElement;
    $(".checkbox").each((e: any) => {
      const menucolumn = menu_table.rows[e + 1].cells;

      if (startcheck == 1) {
        if ($(menucolumn).find('input').attr('menu_level') == curmenu_level) {
          startcheck = 0;
        } else {
          var menuid = $(menucolumn).find('input');
          if (status == true) {
            menuid[0].checked = true;
          } else {
            menuid[0].checked = false;
          }
        }
      }
      if ($(menucolumn).find('input').attr('menu_id') == curmenu_id) {
        startcheck = 1;
      }
    });
  }

  isCheckboxDisabled(menu: any): boolean {
    if (menu.aed == 'yes') {
      return false;
    } else {
      return true;
    }
  }

  isOptionChecked(option: any, status: any): any {
    var status_name = 'option.' + status;
    if (status == 'u_r_id') {
      if (eval(status_name) == 0) {
        return false
      }
      else {
        return true
      }
    }
    else {
      if (eval(status_name) == 'yes') {
        return true
      }
      else {
        return false
      }
    }
  }

  saveUserRights(): void {
    this.spinner.show();
    var user_id = $("#user_name").val();
    var menu: any = [];
    const menu_table = document.getElementById('menu_table') as HTMLTableElement;
    const menurowlength: number = menu_table.rows.length;
    for (var i = 1; i < menurowlength; i++) {
      var cri: any = {};
      if ((document.getElementById('active_inactive_' + i) as HTMLInputElement).checked) {
        cri['menu_id'] = menu_table.rows[i].attributes[1].value;
        (document.getElementById('add_' + i) as HTMLInputElement).checked == true ? cri['add_op'] = 'yes' : cri['add_op'] = 'no';
        (document.getElementById('edit_' + i) as HTMLInputElement).checked == true ? cri['edit_op'] = 'yes' : cri['edit_op'] = 'no';
        (document.getElementById('delete_' + i) as HTMLInputElement).checked == true ? cri['delete_op'] = 'yes' : cri['delete_op'] = 'no';
        menu.push(cri);
      }
    }
    const menudata = new FormData();
    menudata.append('employee_id', user_id);
    menudata.append('obj', JSON.stringify(menu));

    this.settingService.saveUserpage(menudata).subscribe((data: any) => {
      if (data.is_error) {
        this.spinner.hide();
        this.commonService.toastdata(data.message, 'error');
      } else {
        this.spinner.hide();
        this.commonService.toastdata(data.message, 'success');
        this.commonService.reloadComponent('panel-iframe-setting-user_rights');
      }
    });
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-setting-user_rights');
  }
}
