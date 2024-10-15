import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http:HttpClient) { }
  
  /* For Breakdown Report Lists*/
  breakdownReportData(fields: any) {
    return this.http.post<any>(environment.API_URL + 'breakdown_reportLists/', fields)
  }
  /* For Pm Report Lists*/
  pmReportData(fields: any) {
    return this.http.post<any>(environment.API_URL + 'pm_reportLists/', fields)
  }
  /* For Breakdown Report Fields Form*/
  getReportFields(fields: any) {
    return this.http.post<any>(environment.API_URL + 'get_report_fields/', fields)
  }
  /* For Spare Report Fields Form*/
  spareReportData(fields: any) {
    return this.http.post<any>(environment.API_URL + 'spare_reportLists/', fields)
  }
  /* For Asset Scrap Report Fields Form*/
  assetReportData(fields: any) {
    return this.http.post<any>(environment.API_URL + 'asset_reportLists/', fields)
  }
  /* For Get Ticket No*/
  getTicketNumber(fields: any) {
    return this.http.post<any>(environment.API_URL + 'get_ticket_no_data/', fields)
  }
  /* For Get Ticket Status */
  getTicketStatusLists() {
    return this.http.post<any>(environment.API_URL + 'Breakdown_status_Lists/', '')
  }
  /* For Get Engineer Lists */
  getEngineerList(fields: any) {
    return this.http.post<any>(environment.API_URL + 'engineer_reportLists/', fields)
  }
}