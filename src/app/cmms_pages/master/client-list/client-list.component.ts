import { Component } from '@angular/core';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent {
  showCard1: boolean = false;

  constructor(private router: Router) { }
  ngOnInit() {
    $('.select2').chosen();
    $('#toggle_icon').on('click', (e: any) => {
      const toggleIcon = $('#toggleIcon');
      const listElements = $('.list_view');
      const dataElements = $('#dataTable, #dataTable_info, #dataTable_filter, #dataTable_paginate, #dataTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        listElements.show();
        dataElements.hide();
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        listElements.hide();
      }
    });
    setTimeout(function () {
      $('#dataTable').DataTable({
        "paging": true,
        "retrieve": true,
        "lengthChange": true,
        "searching": true,
        "ordering": true,
        "info": true
      });
    },);

    $(".inactive_status").hide();

    $(".active_status, .inactive_status").on("click", function (e: any) {
      var statusContainer = $(e.currentTarget).parent();

      if (statusContainer.closest("#dataTable").length > 0) {
        var row = statusContainer.closest("tr");
        var activeStatus = row.find(".active_status");
        var inactiveStatus = row.find(".inactive_status");
      } else if (statusContainer.closest("#list_view").length > 0) {
        var activeStatus = statusContainer.find(".active_status");
        var inactiveStatus = statusContainer.find(".inactive_status");
      }

      if (activeStatus.is(":visible")) {
        var userResponse = confirm("Are you sure you want to make the company inactive?");
        if (userResponse) {
          activeStatus.hide();
          inactiveStatus.show();
        }
      } else if (inactiveStatus.is(":visible")) {
        var userResponse = confirm("Are you sure you want to make the company active?");
        if (userResponse) {
          inactiveStatus.hide();
          activeStatus.show();
        }
      }
    });

    $(document).on('click', '.table_text_wrap', function () {
      $('.table-responsive .bootstrap-table .fixed-table-container .table td, .table-responsive .bootstrap-table .fixed-table-container .table th').toggleClass('table_text_ellipse_class');
    });

    $(document).ready(function () {
      var $dropdown = $('.btn-group.dropdown');
      var $paginationInfo = $('.pagination-info');
      var totalRows = 88;
      var pageSize = 10;
      $paginationInfo.html('Showing 1 to ' + pageSize + ' of ' + totalRows + ' rows');
      $dropdown.find('.dropdown-item').on('click', function (e: any) {
        e.preventDefault();
        pageSize = parseInt($(e.currentTarget).text());
        $paginationInfo.html('Showing 1 to ' + pageSize + ' of ' + totalRows + ' rows');
      });
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  cancel() {
    this.showCard1 = !this.showCard1;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }
}
