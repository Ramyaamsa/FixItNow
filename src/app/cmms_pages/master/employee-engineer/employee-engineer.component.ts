import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { dE } from '@fullcalendar/core/internal-common';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-employee-engineer',
  templateUrl: './employee-engineer.component.html',
  styleUrls: ['./employee-engineer.component.css']
})
export class EmployeeEngineerComponent {
  engineerCard: boolean = false;
  listView: boolean = false;
  engineerList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  employeeList: any = [];
  masterOperation: any = [];

  engineer_id: any = "";
  company_id: any = "";
  bu_id: any = "";
  plant_id: any = "";
  department_id: any = "";
  employee_id : any= "";
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
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(0, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#maintenance_category_form").validate();

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
    this.getEngineerLists();

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
      this.getEngineerList(company_id, bu_id, plant_id, department_id);
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  getEngineerLists() {
    const startTime = Date.now();
    const assignEngineerForm = new FormData;
    assignEngineerForm.append('company_id', this.company_id);
    assignEngineerForm.append('bu_id', this.bu_id);
    assignEngineerForm.append('plant_id', this.plant_id);
    assignEngineerForm.append('department_engineer_id', this.engineer_id);
    assignEngineerForm.append('status', '');
    this.masterService.getengineerListdata(assignEngineerForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.engineerList = res[0].department_engineerLists;
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
        $("#department_name").chosen('destroy');
        $("#department_name").val(this.department_id).trigger('change');
        $("#department_name").chosen();
      }, 50);
    } else {
      const departmentForm = new FormData;
      departmentForm.append('company_id', company_id);
      departmentForm.append('bu_id', bu_id);
      departmentForm.append('plant_id', plant_id);
      departmentForm.append('department_id', this.department_id);
      departmentForm.append('status', 'active');
      this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.departmentList = res[0].departmentLists;
          setTimeout(() => {
            $("#department_name").chosen('destroy');
            if (this.department_id != '') {
              $("#department_name").attr('disabled', true);
              $("#department_name").val(this.department_id);
              this.getEngineerList(company_id, bu_id,plant_id,this.department_id);
            }
            $("#department_name").chosen();
          }, 50);
        }
      });
    }
  }

  getEngineerList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.engineerList = [];
      setTimeout(() => {
        $("#employee_name").chosen('destroy');
        $("#employee_name").val(this.employee_id).trigger('change');
        $("#employee_name").chosen();
      }, 50);
    } else {
      const engineerForm = new FormData;
      engineerForm.append('company_id', company_id);
      engineerForm.append('bu_id', bu_id);
      engineerForm.append('plant_id', plant_id);
      engineerForm.append('department_id', department_id);
      engineerForm.append('employee_id', this.employee_id);
      engineerForm.append('status', 'active');
      this.masterService.getengineerListdata(engineerForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.engineerList = res[0].department_engineerLists;
          setTimeout(() => {
            $("#employee_name").chosen('destroy');
            if (this.employee_id != '') {
              // $("#employee_name").attr('disabled', true);
              $("#employee_name").val(this.employee_id).trigger('change');
            }
            $("#employee_name").chosen();
          }, 50);
        }
      });
    }
  }

  employeeEngineer() {
    this.engineerCard = !this.engineerCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-employee-engineer');
  }

  saveEngineer() {
    this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
    this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
    this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;
    this.department_id = (document.getElementById('department_name') as HTMLInputElement).value;
    this.employee_id = (document.getElementById('employee_name') as HTMLInputElement).value;
    this.loginId = [localStorage.getItem('employee_id')];

    const newengineer = new FormData();
    newengineer.append('department_engineer_id', this.engineer_id);
    newengineer.append('company_id', this.company_id);
    newengineer.append('bu_id', this.bu_id);
    newengineer.append('plant_id', this.plant_id);
    newengineer.append('department_id', this.department_id);
    newengineer.append('employee_id', this.employee_id);
    newengineer.append('user_login_id', this.loginId);

    this.masterService.savenewengineer(newengineer).subscribe(res => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.commonService.toastdata('Engineer Updated Successfully...', 'success');
        this.commonService.reloadComponent('panel-iframe-master-employee-engineer');
      }
    })
  }

  editEngineer(engineerlist: any): void {
    this.engineerCard = true;
    this.engineer_id = engineerlist.department_engineer_id;
    this.company_id = engineerlist.company_id;
    this.bu_id = engineerlist.bu_id;
    this.plant_id = engineerlist.plant_id;
    this.department_id = engineerlist.department_id;
    this.employee_id = engineerlist.employee_id;
    this.created_on = this.datePipe.transform(engineerlist.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = engineerlist.created_user;
    this.modified_on = this.datePipe.transform(engineerlist.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = engineerlist.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    this.getBuList(this.company_id);

    $('#employee_name').val(this.employee_id).trigger('chosen:updated');
  }

  activeInactive(engineer_id: any, status: any) {

    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('department_engineer_id', engineer_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if(status == "active" || status =="inactive"){
      message = confirm("Do you want to change this Department Engineer status?");
    }else{
      message = confirm("Do you want to delete this Department Engineer?");
    }
    if(message){
      this.masterService.activeinactiveEngineer(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-employee-engineer');
        }
      })
    }
  }
}
