import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';
declare var $: any;
@Component({
  selector: 'app-bu',
  templateUrl: './bu.component.html',
  styleUrls: ['./bu.component.css']
})
export class BuComponent {
  buCard: boolean = false;
  listView: boolean = false;
  buLists: any = [];
  companyLists: any = [];
  masterOperation: any = [];

  company_id: any = "";
  company_name: any = "";
  company_code: any = "";
  bu_id: any = "";
  bu_name: any = "";
  bu_code: any = "";
  created_on: any = "";
  modified_on: any = "";
  created_by: any = "";
  modified_by: any = "";
  loginId: any = [];

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#branch_master_form").validate();

    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(3, this.loginId);

    $('#toggle_icon').on('click', (e: any) => {
      const toggleIcon = $('#toggleIcon');
      const dataElements = $('#dataTable, #dataTable_info, #dataTable_filter, #dataTable_paginate, #dataTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        this.listView = true;
        dataElements.hide();
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.listView = false;        
      }
    });

    $('#company_name').change(() => {
      const dropDown = document.getElementById("company_name") as HTMLSelectElement;
      const selectedOption = dropDown.options[dropDown.selectedIndex] as HTMLOptionElement;
      const selectedAttribute = selectedOption.getAttribute("company_code");
      this.company_code = selectedAttribute;
    });

    $('.select2').chosen();
    this.getCompany();
    this.getBuLists();
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  addBu() {
    this.buCard = !this.buCard;
  }

  /* For uppercase */
  convertToUpperCase() {
    this.bu_code = this.bu_code.toUpperCase();
  }

  getCompany() {
    const companyForm = new FormData;
    companyForm.append('company_id', this.company_id);
    companyForm.append('status', 'active');
    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyLists = res[0].companyLists;
        setTimeout(() => {
          $('#company_name').chosen('destroy');
          $('#company_name').chosen();
        }, 500);
      }
    });
  }

  getBuLists() {
    const buForm = new FormData;
    buForm.append('company_id', this.company_id);
    buForm.append('bu_id', this.bu_id);
    buForm.append('status', '');
    const startTime = Date.now();
    this.masterService.getBuList(buForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.buLists = res[0].buLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#dataTable').DataTable({
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

  saveBu() {
    let bu = "";
    if ($('#branch_master_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLSelectElement).value;

      if (this.company_code != '' && this.bu_code != '') {
        bu = this.company_code + "-" + this.bu_code;
      }
      else {
        bu = this.bu_code;
      }

      const newbu = new FormData();
      newbu.append('bu_id', this.bu_id);
      newbu.append('company_id', this.company_id);
      newbu.append('bu_code', bu);
      newbu.append('bu_name', this.bu_name);
      newbu.append('user_login_id', this.loginId);

      this.masterService.saveBu(newbu).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('BU Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-bu');
        }
      })
    }
  }

  editBuLists(buLists: any) {
    this.buCard = true;
    this.bu_id = buLists.bu_id;
    this.company_id = buLists.company_id;
    this.company_code = "";
    this.bu_code = buLists.bu_code;
    this.bu_name = buLists.bu_name;

    $('#bu_code_prefix').attr('disabled', true);
    $('#bu_code').attr('disabled', true);

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');
    this.created_by = buLists.created_user;
    this.modified_by = buLists.modified_user;
    this.created_on = this.datePipe.transform(buLists.created_on, 'dd-MM-yyyy hh:mm:ss');
    this.modified_on = this.datePipe.transform(buLists.modified_on, 'dd-MM-yyyy hh:mm:ss');
  }

  activeInactive(bu_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('bu_id', bu_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change the BU status?");
    } else {
      boolean = confirm("Do you want to delete this BU?");
    }
    if (boolean) {
      this.masterService.changeStatusBu(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-bu');
        }
      })
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-bu');
  }
}
