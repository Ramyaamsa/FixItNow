import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class BreakdownService {

  constructor(private http: HttpClient) { }

  toastdata(t_text: any, t_icon: any, timer = 2000) {
    Swal.fire({
      icon: t_icon,
      text: t_text,
      position: 'top-end',
      toast: true,
      showConfirmButton: false,
      timer: timer,
      width: 'auto',
      timerProgressBar: true,
    })
  }

  /* For Asset Name  List */
  getAssetName(assetListsdata: any) {
    return this.http.post<any>(environment.API_URL + 'get_asset_name/', assetListsdata)
  }

    /* For Get Breakdown Ticket List */
  breakdownTicketdata(ticketListdata: any) {
    return this.http.post<any>(environment.API_URL + 'get_break_down_ticket_list/', ticketListdata)
  }
    /* For Save Breakdown Add */
  saveBreakdownTickets(newTicketdtl: any) {
    return this.http.post<any>(environment.API_URL + 'create_ticket/', newTicketdtl)
  }

  /* For Save Ticket Status */
  saveTicketStatus(ticketStatus: any) {
    return this.http.post<any>(environment.API_URL + 'save_ticket_status/', ticketStatus)
  }

  /* For Getiing Ticket Data */
  getTicketData(ticketNo: any) {
    return this.http.post<any>(environment.API_URL + 'get_ticket_data/', ticketNo)
  }
}