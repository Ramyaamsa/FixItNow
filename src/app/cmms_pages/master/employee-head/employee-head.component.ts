import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';
declare var $: any;
@Component({
  selector: 'app-employee-head',
  templateUrl: './employee-head.component.html',
  styleUrls: ['./employee-head.component.css']
})
export class EmployeeHeadComponent {
  headCard: boolean = false;
  listView: boolean = false;

  departmentHeadList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  employeeList: any = [];
  masterOperation: any = [];

  department_head_id = "";
  company_id: any = "";
  bu_id: any = "";
  plant_id: any = "";
  department_id: any = "";
  employee_id: any = "";
  company_name: any = "";
  bu_name: any = "";
  plant_name: any = "";
  department_name: any = "";
  employee_name: any = "";
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
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.department_id = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

    $('.select2').chosen();
    $('.multiselect').select2();
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(11, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#department_head_form").validate();

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

    this.getCompanyList();
    this.getdepartmentHeadLists();

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
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      this.getDepartmentList(company_id, bu_id, plant_id)
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getUserList(company_id, bu_id, plant_id, department_id);
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  getdepartmentHeadLists() {
    const startTime = Date.now();
    const assignHeadForm = new FormData();
    assignHeadForm.append('company_id', this.company_id);
    assignHeadForm.append('bu_id', this.bu_id);
    assignHeadForm.append('plant_id', this.plant_id);
    assignHeadForm.append('department_id', this.department_id);
    assignHeadForm.append('department_head_id', this.department_head_id);
    assignHeadForm.append('status', '');
    this.masterService.getDepartmentHeadList(assignHeadForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.departmentHeadList = res[0].department_headLists;
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
    companyForm.append('company_id', this.company_id);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyList = res[0].companyLists;
        setTimeout(() => {
          $('#company_name').chosen('destroy');
          if (this.company_id != '') {
            $('#company_name').attr('disabled', true);
            $('#company_name').val(this.company_id)
            this.getBuList(this.company_id);
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
        $("#bu_name").val(this.bu_id).trigger('change');
        $("#bu_name").chosen();
      }, 50);
    } else {
      const buForm = new FormData();
      buForm.append('company_id', company_id);
      buForm.append('bu_id', this.bu_id);
      buForm.append('status', 'active');
      this.masterService.getBuList(buForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.buList = res[0].buLists;
          setTimeout(() => {
            $("#bu_name").chosen('destroy');
            if (this.bu_id != '') {
              $("#bu_name").attr('disabled', true);
              $("#bu_name").val(this.bu_id);
              this.getPlantList(company_id, this.bu_id);
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
        $("#plant_name").val(this.plant_id).trigger('change');
        $("#plant_name").chosen();
      }, 50);
    } else {
      const plantForm = new FormData;
      plantForm.append('company_id', company_id);
      plantForm.append('bu_id', bu_id);
      plantForm.append('plant_id', this.plant_id);
      plantForm.append('status', 'active');
      this.masterService.getPlantList(plantForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.plantList = res[0].plantLists;
          setTimeout(() => {
            $("#plant_name").chosen('destroy');
            if (this.plant_id != '') {
              $("#plant_name").attr('disabled', true);
              $("#plant_name").val(this.plant_id);
              this.getDepartmentList(company_id, bu_id, this.plant_id);
            }
            $("#plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  getDepartmentList(company_id: any, bu_id: any, plant_id: any) {
    if (plant_id == '') {
      this.departmentList = [];
      setTimeout(() => {
        $("#department_name").select2('destroy');
        $("#department_name").val(this.department_id).trigger('change');
        $("#department_name").select2();
      }, 50);
    } else {
      const departmentForm = new FormData;
      departmentForm.append('company_id', company_id);
      departmentForm.append('bu_id', bu_id);
      departmentForm.append('plant_id', plant_id);
      departmentForm.append('department_id', '');
      departmentForm.append('status', 'active');
      this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.departmentList = res[0].departmentLists;
          setTimeout(() => {
            $("#department_name").select2('destroy');
            if (this.department_id != '') {
              $("#department_name").val(this.department_id);
              this.getUserList(company_id, bu_id, plant_id, this.department_id);
            }
            $("#department_name").select2();
          }, 50);
        }
      });
    }
  }

  getUserList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.departmentHeadList = [];
      setTimeout(() => {
        $("#employee_name").chosen('destroy');
        $("#employee_name").val(this.employee_id).trigger('change');
        $("#employee_name").chosen();
      }, 50);
    } else {
      const headForm = new FormData;
      headForm.append('company_id', company_id);
      headForm.append('bu_id', bu_id);
      headForm.append('plant_id', plant_id);
      headForm.append('status', 'active');
      this.masterService.getUserList(headForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.employeeList = res[0].employeeLists.filter((employee: any) =>
            employee.employee_type == 'Department Head' || employee.employee_type == 'Head/Engineer'
          );
          setTimeout(() => {
            $("#employee_name").chosen('destroy');
            if (this.employee_id != '') {
              $("#employee_name").attr('disabled', true);
              $("#employee_name").val(this.employee_id);
            }
            $("#employee_name").chosen();
          }, 50);
        }
      });
    }
  }

  addemployeeHead() {
    this.headCard = !this.headCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-employee_head');
  }

  saveHead() {
    if ($('#department_head_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
      this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.department_id = $('#department_name').val();
      this.employee_id = (document.getElementById('employee_name') as HTMLInputElement).value;
      this.loginId = [localStorage.getItem('employee_id')];

      const newhead = new FormData();
      newhead.append('department_head_id', this.department_head_id);
      newhead.append('company_id', this.company_id);
      newhead.append('bu_id', this.bu_id);
      newhead.append('plant_id', this.plant_id);
      newhead.append('department_id', this.department_id);
      newhead.append('employee_id', this.employee_id);
      newhead.append('user_login_id', this.loginId);

      this.masterService.saveDepartmentHead(newhead).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Department Head Updated Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-employee_head');
        }
      })
    }
  }

  editHead(headlist: any): void {
    this.headCard = true;
    this.department_head_id = headlist.department_head_id;
    this.company_id = headlist.company_id;
    this.bu_id = headlist.bu_id;
    this.plant_id = headlist.plant_id;
    this.department_id = headlist.department_id;
    this.employee_id = headlist.employee_id;
    this.created_on = this.datePipe.transform(headlist.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = headlist.created_user;
    this.modified_on = this.datePipe.transform(headlist.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = headlist.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    this.getBuList(this.company_id);

    $('#employee_name').val(this.employee_id).trigger('chosen:updated');

  }

  statusDepartmentHead(department_head_id: any, status: any) {

    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('department_head_id', department_head_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Department Head status?");
    } else {
      message = confirm("Do you want to delete this Department Head?");
    }
    if (message) {
      this.masterService.changeStatusDepartmentHead(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-employee_head');
        }
      })
    }
  }
}
