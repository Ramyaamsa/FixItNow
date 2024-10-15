import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})

export class DepartmentComponent {
  departmentCard: boolean = false;
  listView: boolean = false;
  departmentList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  masterOperation: any = [];

  companyId: any = "";
  buId: any = "";
  plantId: any = "";
  departmentId: any = "";
  departmentCode: any = "";
  departmentName: any = "";
  plantCode: any = "";
  isMttr: boolean = false;
  isDowntime: boolean = false;
  isMultiple: boolean = false;
  createdOn: any = "";
  modifiedOn: any = "";
  createdBy: any = "";
  modifiedBy: any = "";
  loginId: any = "";

  constructor(private commonService: CommonService, private masterService: MasterService, private datepipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

    $('.select2').chosen();
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(6, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#department_form").validate();

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

    this.getDepartmentList();
    this.getCompanyList();

    $('#company_name').change(() => {
      var company_id = $('#company_name').val();
      this.getBuList(company_id);
    });

    $('#bu_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      this.getPlantList(company_id, bu_id);
    });

    $('#plant_name').change(() => {
      if (this.departmentCode == '') {
        this.plantCode = $('#plant_name').find(':selected').attr('plant_code');
      }
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.departmentCode = this.departmentCode.toUpperCase();
  }

  getDepartmentList() {
    const startTime = Date.now();
    const departmentForm = new FormData;
    departmentForm.append('company_id', this.companyId);
    departmentForm.append('bu_id', this.buId);
    departmentForm.append('plant_id', this.plantId);
    departmentForm.append('department_id', this.departmentId);
    departmentForm.append('status', '');
    this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.departmentList = res[0].departmentLists;
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
            this.getBuList(this.companyId);
          }
          $('#company_name').chosen();
        }, 50);
      }
    });
  }

  getBuList(company_id: any) {
    if (company_id == '') {
      this.buList = [];
      setTimeout(() => {
        $("#bu_name").chosen('destroy');
        $("#bu_name").val(this.buId).trigger('change');
        $("#bu_name").chosen();
      }, 50);
    } else {
      const buForm = new FormData();
      buForm.append('company_id', company_id);
      buForm.append('bu_id', this.buId);
      buForm.append('status', 'active');
      this.masterService.getBuList(buForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.buList = res[0].buLists;
          setTimeout(() => {
            $("#bu_name").chosen('destroy');
            if (this.buId != '') {
              $("#bu_name").attr('disabled', true);
              $("#bu_name").val(this.buId);
              this.getPlantList(company_id, this.buId);
            }
            $("#bu_name").chosen();
          }, 50);
        }
      });
    }
  }

  getPlantList(company_id: any, bu_id: any) {
    if (bu_id == '') {
      this.plantList = [];
      setTimeout(() => {
        $("#plant_name").chosen('destroy');
        $("#plant_name").val(this.plantId).trigger('change');
        $("#plant_name").chosen();
      }, 50);
    } else {
      const plantForm = new FormData;
      plantForm.append('company_id', company_id);
      plantForm.append('bu_id', bu_id);
      plantForm.append('plant_id', this.plantId);
      plantForm.append('status', 'active');
      this.masterService.getPlantList(plantForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.plantList = res[0].plantLists;
          setTimeout(() => {
            $("#plant_name").chosen('destroy');
            if (this.plantId != '') {
              $("#plant_name").attr('disabled', true);
              $("#plant_name").val(this.plantId).trigger('change');
            }
            $("#plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  addDepartment() {
    this.departmentCard = !this.departmentCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-department');
  }

  saveDepartment() {
    let department = "";
    if ($("#department_form").valid()) {
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;
      var isMttr = this.isMttr == true ? 'yes' : 'no';
      var isDowntime = this.isDowntime == true ? 'yes' : 'no';
      var isMultiple = this.isMultiple == true ? 'yes' : 'no';

      if (this.plantCode != '' && this.departmentCode != '') {
        department = this.plantCode + "-" + this.departmentCode;
      } else {
        department = this.departmentCode;
      }

      const newdepartment = new FormData();
      newdepartment.append('department_id', this.departmentId);
      newdepartment.append('company_id', this.companyId);
      newdepartment.append('bu_id', this.buId);
      newdepartment.append('plant_id', this.plantId);
      newdepartment.append('department_code', department);
      newdepartment.append('department_name', this.departmentName);
      newdepartment.append('is_mttr', isMttr);
      newdepartment.append('is_downtime', isDowntime);
      newdepartment.append('is_multiple', isMultiple);
      newdepartment.append('user_login_id', this.loginId);

      this.masterService.saveDepartment(newdepartment).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Department Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-department');
        }
      })
    }
  }

  editDepartment(departmentList: any) {
    this.departmentCard = true;
    this.departmentId = departmentList.department_id;
    this.companyId = departmentList.company_id;
    this.buId = departmentList.bu_id;
    this.plantId = departmentList.plant_id;

    this.departmentCode = departmentList.department_code;
    this.departmentName = departmentList.department_name;
    this.plantCode = "";
    this.createdBy = departmentList.created_user;
    this.modifiedBy = departmentList.modified_user;
    this.createdOn = this.datepipe.transform(departmentList.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedOn = this.datepipe.transform(departmentList.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.isMttr = departmentList.is_mttr == 'yes' ? true : false;
    this.isDowntime = departmentList.is_downtime == 'yes' ? true : false;
    this.isMultiple = departmentList.is_multiple == 'yes' ? true : false;

    $('#pwd_code').attr('disabled', true)
    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');

    this.getBuList(this.companyId);
  }

  statusDepartment(department_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('department_id', department_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change the Department status?");
    } else {
      var boolean = confirm("Do you want to delete this Department?");
    }

    if (boolean) {
      this.masterService.changeStatusDepartment(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-department');
        }
      })
    }
  }
}
