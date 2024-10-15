import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class dashboardService {

  constructor(private http:HttpClient) { }

  // Breakdown Report
  getBreakdownreportList(data: any) {
    return this.http.post<any>(environment.API_URL + 'breakdown_reportLists/', data)
  }

  // Asset Report
  getAssetReportlist(data: any) {
    return this.http.post(environment.API_URL + 'asset_reportLists/', data)
  }
}