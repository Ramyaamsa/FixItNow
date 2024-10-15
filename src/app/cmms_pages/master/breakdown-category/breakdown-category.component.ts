import { Component, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-breakdown-category',
  templateUrl: './breakdown-category.component.html',
  styleUrls: ['./breakdown-category.component.css']
})
export class BreakdownCategoryComponent {

  breakdownCategoryCard: boolean = false;
  listView: boolean = false;

  breakdownCategoryList: any = [];
  companyList: any = [];
  masterOperation: any = [];

  companyId: any = "";
  companyCode: any = "";
  breakdownCategoryId: any = "";
  breakdownCategoryCode: any = "";
  breakdownCategoryName: any = "";
  createdOn: any = "";
  modifiedOn: any = "";
  createdBy: any = "";
  modifiedBy: any = "";
  loginId: any = [];

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');

    $('.select2').chosen();
    this.commonService.upperCase();
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#breakdown_category_form").validate();
    this.masterOperation = this.settingService.masterOperation(13, this.loginId);

    $('#toggle_icon').on('click', () => {
      const toggleIcon = $('#toggleIcon');
      const dataElements = $('#categoryTable, #categoryTable_info, #categoryTable_paginate, #categoryTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        dataElements.hide();
        this.listView = true;
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.listView = false;
      }
    });

    this.getCompanyList();
    this.getBreakdownCategoryLists();
  }

  textWrap() {
    $('#categoryTable th, #categoryTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.breakdownCategoryCode = this.breakdownCategoryCode.toUpperCase();
  }

  getBreakdownCategoryLists() {
    const startTime = Date.now();
    const breakdownCategoryForm = new FormData;
    breakdownCategoryForm.append('company_id', '');
    breakdownCategoryForm.append('breakdown_category_id', this.breakdownCategoryId);
    breakdownCategoryForm.append('status', '');
    this.masterService.getBreakdownCategory(breakdownCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error')
      } else {
        this.breakdownCategoryList = res[0].breakdown_categoryLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#categoryTable').DataTable({
            "paging": true,
            "retrieve": true,
            "lengthChange": true,
            "searching": true,
            "ordering": true,
            "info": true,
          });
        }, responseTime);
      }
    });
  }

  getCompanyList() {
    const companyForm = new FormData;
    companyForm.append('company_id', this.companyId);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyList = res[0].companyLists;
        setTimeout(() => {
          $('#company_name').chosen('destroy');
          if (this.companyId != '') {
            $('#company_name').attr('disabled', true);
            $('#company_name').val(this.companyId)
          }
          $('#company_name').chosen();
        }, 50);
      }
    });
  }

  addBreakdownCategory() {
    this.breakdownCategoryCard = !this.breakdownCategoryCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-breakdown_category');
  }

  saveBreakdownCategory() {
    if ($('#breakdown_category_form').valid()) {
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;

      const bCForm = new FormData();
      // bCForm.append('company_id', this.companyId);
      bCForm.append('breakdown_category_id', this.breakdownCategoryId);
      bCForm.append('breakdown_category_code', this.breakdownCategoryCode);
      bCForm.append('breakdown_category_name', this.breakdownCategoryName);
      bCForm.append('user_login_id', this.loginId);

      this.masterService.saveBreakdownCategory(bCForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Breakdown Category Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-breakdown_category');
        }
      });
    }
  }

  editBreakdownCategory(data: any) {
    this.breakdownCategoryCard = true;
    this.breakdownCategoryId = data.breakdown_category_id;
    this.companyId = data.company_id;

    this.breakdownCategoryCode = data.breakdown_category_code;
    this.breakdownCategoryName = data.breakdown_category_name;
    this.createdOn = this.datePipe.transform(data.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.createdBy = data.created_user;
    this.modifiedOn = this.datePipe.transform(data.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedBy = data.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');

    $('#breakdown_category_code').attr('disabled', true);
  }

  statusBreakdownCategory(breakdownCategoryId: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('breakdown_category_id', breakdownCategoryId);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Breakdown Category status?");
    } else {
      message = confirm("Do you want to delete this Breakdown Category?");
    }
    if (message) {
      this.masterService.changeStatusBreakdownCategory(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-breakdown_category');
        }
      })
    }
  }
}
