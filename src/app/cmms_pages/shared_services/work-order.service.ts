import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { en } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderService {

  constructor(private http: HttpClient) { }

  /* --------------------------------------- BREAKDOWN ---------------------------------  */
  getHeadDepartmentList(list: any) {
    return this.http.post(environment.API_URL + 'get_assign_department_head/', list);
  }
  // Asset based Sub Category
  getAssetBasedBreakdown(list: any) {
    return this.http.post(environment.API_URL + 'get_asset_based_sub_category_lists/', list);
  }

  // Breakdown List
  getBreakdownList(list: any) {
    return this.http.post(environment.API_URL + 'get_breakdown_detail_list/', list);
  }

  // Create Breakdown
  createBreakdown(data: any) {
    return this.http.post(environment.API_URL + 'create_ticket/', data)
  }

  // Update Breakdown
  updateBreakdown(data: any) {
    return this.http.post(environment.API_URL + 'save_ticket_status/', data)
  }

  // SPRAE DETAILS

  getBreakdownSpareList(data: any) {
    return this.http.post(environment.API_URL + 'get_ticket_spare_data/', data)
  }

  getSpareDetailList(data: any) {
    return this.http.post(environment.API_URL + 'get_spares_lists/', data);
  }
  // Save Spare Data

  saveSpareBreakdown(data: any) {
    return this.http.post(environment.API_URL + 'save_spare_data/', data)
  }

  // Save Solution Bank
  saveSolutionBank(data: any) {
    return this.http.post(environment.API_URL + 'save_solution_bank/', data)
  }

  // Get Breakdown Mttr
  getBreakdownMttr(data: any) {
    return this.http.post(environment.API_URL + 'show_mttr_data/', data)
  }

  // Get Mttr
  getMttr(data: any) {
    return this.http.post(environment.API_URL + 'get_mttr/', data)
  }

  // Save Mttr 
  saveMttr(data: any) {
    return this.http.post(environment.API_URL + 'save_mttr/', data)
  }

  // Save Mttr 
  getWorkLogDetail(data: any) {
    return this.http.post(environment.API_URL + 'get_breakdown_work_log_list/', data)
  }
  /* --------------------------------------------- Preventive Maintenance ------------------------------ */
  // PM Schedule
  getPmScheduleLists(data: any) {
    return this.http.post(environment.API_URL + 'pm_scheduleLists/', data);
  }

  // Save
  savePmSchedule(list: any) {
    return this.http.post(environment.API_URL + 'save_pm_schedule/', list);
  }

  // Status
  changeStatusPmSchedule(data: any) {
    return this.http.post(environment.API_URL + 'changestatus_pm_schedule/', data);
  }

  // PM Chacklist
  getPmCheckLists(data: any) {
    return this.http.post(environment.API_URL + 'get_pm_detail_list/', data);
  }

  // Save 
  savePmStatus(list: any) {
    return this.http.post(environment.API_URL + 'save_pm_status/', list);
  }

  // Save PM Spare
  savePMSpare(list: any) {
    return this.http.post(environment.API_URL + 'save_pm_spare_data/', list)
  }
  // List PM Spare
  getPMSpareList(list: any) {
    return this.http.post(environment.API_URL + 'get_pm_spare_data/', list)
  }
}
