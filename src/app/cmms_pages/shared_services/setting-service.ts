import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  menuList: any = [];
  operationData: any = [];

  constructor(private http: HttpClient) { }
  /* --------------------------- User Rights -------------------------------- */
  // For User Rights Menu List
  getRightsUserMenuList(rightsUserMenuList: any) {
    return this.http.post<any>(environment.API_URL + 'get_rights_user_menuLists/', rightsUserMenuList)
  }
  // For Save User
  saveUserpage(user: any) {
    return this.http.post<any>(environment.API_URL + 'save_user_rights/', user)
  }
  // For Employee page List
  employeePageList(employee: any) {
    return this.http.post<any>(environment.API_URL + 'get_employee_page_Lists/', employee)
  }
  // For User Menu List
  getUserMenuList(userMenuList: any) {
    return this.http.post<any>(environment.API_URL + 'get_user_menu_Lists/', userMenuList)
  }

  /* ---------------------------------------- CUSTOM WORK ORDER ------------------------- */

  // For Save Customised Ticket
  getCustomWo(data: any) {
    return this.http.post<any>(environment.API_URL + 'customized_ticket_noLists/', data)
  }

  // For Save Customised Ticket
  saveCustomisedTicket(ticketNo: any) {
    return this.http.post<any>(environment.API_URL + 'savecustomized_ticket_no/', ticketNo)
  }


  //Breakdown Status List
  getBreakdownStatusList(statusList: any) {
    return this.http.post<any>(environment.API_URL + 'Breakdown_status_Lists/', statusList)
  }
  /* ------------------------------ CUSTOM NOTIFICATION --------------------------------- */
  //Save Custom Notification
  saveCustomNotification(data: any) {
    return this.http.post<any>(environment.API_URL + 'save_customized_notification/', data)
  }

  //Custom Notification List
  getCustomnotificationList(notificationList: any) {
    return this.http.post<any>(environment.API_URL + 'Customized_notification_Lists/', notificationList)
  }

  //Save Custom Ticket
  saveCustomTicket(customTicket: any) {
    return this.http.post<any>(environment.API_URL + 'save_customized_ticket_no/', customTicket)
  }

  // Change Password
  changePassword(data: any) {
    return this.http.post(environment.API_URL + 'change_password/', data)
  }

  /* For Spare mail List */
  getSpareMailList(mailList: any) {
    return this.http.post<any>(environment.API_URL + 'spare_mail_Lists/', mailList)
  }
  /* For Save Spare Mail */
  saveSpareMailList(sparemail: any) {
    return this.http.post<any>(environment.API_URL + 'save_spare_mail/', sparemail)
  }

  // Master Operations For Menu
  masterOperation(menu_id: any, login_id: any) {
    var usertype = localStorage.getItem('employee_type');
    const formdata = new FormData();
    formdata.append('user_login_id', login_id);

    this.http.post<any>(environment.API_URL + 'get_user_menu_Lists/', formdata).subscribe(data => {
      if (data.is_error) { }
      else {
        this.menuList = data.get_user_menu_Lists;
        var data = this.menuList.filter((menu: any) => menu.menu_id == menu_id);
        if (usertype != "Super Admin") {
          const determineStatus = (op: string) => op == 'yes';
          this.operationData['add'] = determineStatus(data[0].add_op);
          this.operationData['edit'] = determineStatus(data[0].edit_op);
          this.operationData['delete'] = determineStatus(data[0].delete_op);
        } else {
          this.operationData['add'] = true;
          this.operationData['edit'] = true;
          this.operationData['delete'] = true;
        }
      }
    });
    return this.operationData;
  }

  /* ------------------------------ Report Template --------------------------- */

  /* Report Template API */
  // get List of Report Template
  getReportTemplateLists(list: any) {
    return this.http.post<any>(environment.API_URL + 'report_template_Lists/', list)
  }
  // save
  saveReportTemplate(data: any) {
    return this.http.post<any>(environment.API_URL + 'save_template/', data)
  }
  // Change Status of Report Template
  changeStatusReportTemplate(status: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_template/', status)
  }
  /* ------------------------------ Report Template --------------------------- */

  /* Report Template API */
  // get List of Report Template
  getMailLists(list: any) {
    return this.http.post<any>(environment.API_URL + 'mail_template_Lists/', list)
  }
  // save
  saveMailList(data: any) {
    return this.http.post<any>(environment.API_URL + 'save_mail_template/', data)
  }
  // Change Status of Report Template
  changeStatusMailList(status: any) {
    return this.http.post<any>(environment.API_URL + 'changestatus_mail_template/', status)
  }

  /* ------------------------------ Notification Data --------------------------- */

  getNotificationLists(list: any) {
    return this.http.post<any>(environment.API_URL + 'get_notification_data/', list)
  }
}