import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { ActivatedRouteSnapshot } from '@angular/router';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-breakdown-status',
  templateUrl: './breakdown-status.component.html',
  styleUrls: ['./breakdown-status.component.css']
})
export class BreakdownStatusComponent {
  showCard1: boolean = false;
  breakdown_statusLists: any = [];
  companyLists: any = [];
  buLists: any = [];
  plantLists: any = [];
  departmentLists: any = [];
  asset_groupLists: any = [];
  masterOperation: any = [];

  companyId = "";
  buId = "";
  plantId = "";
  departmentId = "";
  assetGroupId = "";
  asset_group_code: any = "";
  breakdown_status_id = "";
  breakdown_status_code = "";
  breakdown_status_name = "";
  category_image: any = "";
  category_image_old: any = "";
  category_image_file: any = "assets/images/placeholder.gif";
  created_on: any = "";
  modified_on: any = "";
  created_by = "";
  modified_by = "";
  loginId: any = [];
  model_image: any = "assets/images/placeholder.gif";
  id: any = "";

  constructor(private router: Router, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    $('.select2').chosen();
    $('#dataTable').DataTable({
      "paging": true,
      "retrieve": true,
      "lengthChange": true,
      "searching": true,
      "ordering": true,
      "info": true
    });
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

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#breakdown_status_master_form").validate();
    this.masterOperation = this.settingService.masterOperation(20, this.loginId);
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  addbreakdownStatus() {
    this.showCard1 = !this.showCard1;
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }
}
