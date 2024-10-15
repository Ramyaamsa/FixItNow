import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})

export class CompanyComponent {
  companyCard: boolean = false;
  listView: boolean = false;
  companyListdata: any = [];
  masterOperation: any = [];

  company_id: any = "";
  company_code: any = "";
  company_name: any = "";
  company_logo: any = "";
  company_logo_old: any = "placeholder.jpg";
  company_image_file: any = "assets/images/placeholder.jpg";
  created_on: any;
  created_by: any = "";
  modified_on: any = "";
  modified_by: any = "";
  userCount: any = 0;
  isTrail: boolean = false;
  trialDate: any = "01-01-1900";
  loginId: any = "";
  userType: any = "";
  model_image: any = "assets/images/placeholder.jpg";

  constructor(private masterService: MasterService, private commonService: CommonService, private datePipe: DatePipe, private settingService: SettingService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.userType = localStorage.getItem('employee_type');

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#company_master_form").validate();
    this.masterOperation = this.settingService.masterOperation(2, this.loginId);
    this.getCompanyLists();

    // this.commonService.upperCase();


    $('#toggle_icon').on('click', () => {
      const toggleIcon = $('#toggleIcon');
      const dataElements = $('#dataTable, #dataTable_info, #dataTable_filter, #dataTable_paginate, #dataTable_length');
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

    this.commonService.numericOnly();
    var date = new Date();
    const futureDate = new Date(date);
    futureDate.setDate(date.getDate() + 15);

    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      startDate: '+0d',
      endDate: '+30d',
      autoclose: true,
      orientation: 'top top'
    }).datepicker('setDate', String(futureDate.getDate()).padStart(2, '0') + String(futureDate.getMonth()).padStart(2, '0') + 1 + '-' + futureDate.getFullYear());
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  addCompany() {
    this.companyCard = true;
  }

  /* For uppercase */
  convertToUpperCase() {
    this.company_code = this.company_code.toUpperCase();
  }

  getCompanyLists() {
    const startTime = Date.now();
    const companyForm = new FormData;
    companyForm.append('company_id', this.company_id);
    companyForm.append('status', '');
    this.masterService.getCompanyList(companyForm).subscribe(res => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.companyListdata = res[0].companyLists;
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

  saveCompany() {
    var is_trial = this.isTrail ? 'yes' : 'no';
    if (this.userType == 'super admin') {
      this.trialDate = $('#trail_date').val();
    }
    if ($("#company_master_form").valid()) {
      const newcompany = new FormData();
      newcompany.append('company_id', this.company_id);
      newcompany.append('company_code', this.company_code);
      newcompany.append('company_name', this.company_name);
      newcompany.append('company_logo', this.company_logo);
      newcompany.append('company_logo_old', this.company_logo_old);
      newcompany.append('users_count', this.userCount);
      newcompany.append('is_trial', is_trial);
      newcompany.append('trial_date', this.trialDate);
      newcompany.append('user_login_id', this.loginId);

      this.masterService.saveCompany(newcompany).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Data Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-company');
        }
      })
    }
  }

  companyLogo(event: any) {
    const file = event.target.files[0];
    const ext = file.type;

    switch (ext) {
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
        if (file) {
          const reader = new FileReader();

          reader.onload = (e: any) => {
            const image = new Image();
            image.onload = () => {
              const width = image.width;
              const height = image.height;

              if (width <= 1200 && height <= 600) {
                this.company_logo = file;
                $("#company_logo_name").html(this.company_logo.name);
                this.company_image_file = e.target.result;
                this.company_logo_old = '';
              } else {
                alert('Please upload an image with resolution 1200 x 600.');
              }
            };
            image.src = e.target.result;
          };

          reader.readAsDataURL(file);
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  editCompanyLists(companylist: any) {
    this.companyCard = true;
    this.company_id = companylist.company_id;
    this.company_name = companylist.company_name;
    this.company_code = companylist.company_code;
    this.company_image_file = companylist.company_logo_url;
    this.company_logo_old = companylist.company_logo
    this.created_by = companylist.created_user;
    this.created_on = this.datePipe.transform(companylist.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_on = this.datePipe.transform(companylist.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = companylist.modified_user;
    this.userCount = companylist.users_count;
    this.isTrail = companylist.is_trial == 'yes' ? true : false;

    this.trialDate = this.datePipe.transform(companylist.trial_date, 'dd-MM-yyyy');
    $('#trail_date').datepicker({
      format: 'dd-mm-yyyy',
      endDate: '+30d'
    }).datepicker('setDate', this.trialDate);

    $("#company_logo_name").html(companylist.company_logo);
    $('#company_code').attr('disabled', true);
  }

  activeInactive(company_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('company_id', company_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change the Company status?");
    } else {
      boolean = confirm("Do you want to delete this Company?");
    }

    if (boolean) {
      this.masterService.changeStatusCompany(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-company');
        }
      })
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-company');
  }

  modelImage(companylist: any) {
    this.model_image = companylist.company_logo_url;
    $("#modal-image").modal("show");
  }
}
