import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

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

  // For reloading the Iframe component
  reloadComponent(iframeId: any) {
    var iframe: any = $(document).attr('id', iframeId);
    iframe[0].location.reload();
  }

  /* For ip address input field */
  numericDot() {
    $(".numeric_dot").on("input", (evt: any) => {
      var self = $(evt.currentTarget);
      self.val(self.val().replace(/[^0-9\.]/g, ''));
      if ((evt.which != 46 || self.val().indexOf('.') != -1) && (evt.which < 48 || evt.which > 57)) {
        evt.preventDefault();
      }
    });
  }
  
  /* For input field numeric only */
  numericOnly() {
    $(".numeric").on("input", (evt: any) => {
      var $input = $(evt.currentTarget);
      $input.val($input.val().replace(/[^\d]+/g, ''));
    })
  }

  upperCase() {
    $(".uppercase").on("input", (evt: any) => {
      var $input = $(evt.currentTarget);
      $input.val($input.val().toUpperCase());
    });
  }
}
