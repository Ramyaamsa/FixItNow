import { Component } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-mttr',
  templateUrl: './mttr.component.html',
  styleUrls: ['./mttr.component.css']
})
export class MttrComponent {
  mttrCard: boolean = false;
  listView: boolean = false;
  mttrList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  asset_groupList: any = [];
  masterOperation: any = [];

  company_id: any = "";
  bu_id: any = "";
  plant_id: any = "";
  department_id: any = "";
  asset_group_id: any = "";
  mttr_id: any = "";
  mttr_code: any = "";
  mttr_name: any = "";
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
    this.masterOperation = this.settingService.masterOperation(23, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#breakdown_category_form").validate();

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
    this.getmttrLists();

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
      this.getEquipmentGroupList(company_id, bu_id, plant_id, department_id);
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.mttr_code = this.mttr_code.toUpperCase();
  }

  getmttrLists() {
    const startTime = Date.now();
    const mttrForm = new FormData();
    mttrForm.append('company_id', this.company_id);
    mttrForm.append('bu_id', this.bu_id);
    mttrForm.append('plant_id', this.plant_id);
    mttrForm.append('department_id', this.department_id);
    mttrForm.append('asset_group_id', this.asset_group_id);
    mttrForm.append('status', '');
    this.masterService.getMttrList(mttrForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error')
      } else {
        this.mttrList = res[0].mttrLists;
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
              this.getEquipmentGroupList(company_id, bu_id, plant_id, this.department_id)
            }
            $("#department_name").chosen();
          }, 50);
        }
      });
    }
  }

  getEquipmentGroupList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.asset_groupList = [];
      setTimeout(() => {
        $("#equipment_group").chosen('destroy');
        $("#equipment_group").val(this.asset_group_id).trigger('change');
        $("#equipment_group").chosen();
      }, 50);
    } else {
      const equipmentGroupForm = new FormData;
      equipmentGroupForm.append('company_id', company_id);
      equipmentGroupForm.append('bu_id', bu_id);
      equipmentGroupForm.append('plant_id', plant_id);
      equipmentGroupForm.append('department_id', department_id);
      equipmentGroupForm.append('asset_group_id', this.asset_group_id);
      equipmentGroupForm.append('status', 'active');
      this.masterService.getAssetGroupList(equipmentGroupForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.asset_groupList = res[0].asset_groupLists;
          setTimeout(() => {
            $("#equipment_group").chosen('destroy');
            if (this.asset_group_id != '') {
              $("#equipment_group").attr('disabled', true);
              $("#equipment_group").val(this.asset_group_id).trigger('change');;
            }
            $("#equipment_group").chosen();
          }, 50);
        }
      });
    }
  }

  addMttr() {
    this.mttrCard = !this.mttrCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-mttr');
  }

  saveMttr() {
    if ($('#mttr_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
      this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.department_id = (document.getElementById('department_name') as HTMLInputElement).value;
      this.asset_group_id = (document.getElementById('equipment_group') as HTMLInputElement).value;

      const newmttr = new FormData();
      newmttr.append('mttr_id', this.mttr_id);
      newmttr.append('mttr_name', this.mttr_name);
      newmttr.append('mttr_code', this.mttr_code);
      newmttr.append('company_id', this.company_id);
      newmttr.append('bu_id', this.bu_id);
      newmttr.append('plant_id', this.plant_id);
      newmttr.append('department_id', this.department_id);
      newmttr.append('asset_group_id', this.asset_group_id);
      newmttr.append('user_login_id', this.loginId);

      this.masterService.saveMttr(newmttr).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Mttr Updated Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-mttr');
        }
      })
    }
  }

  editMttr(mttrLists: any): void {
    this.mttrCard = true;
    this.mttr_id = mttrLists.mttr_id;
    this.mttr_code = mttrLists.mttr_code;
    this.mttr_name = mttrLists.mttr_name;
    this.company_id = mttrLists.company_id;
    this.bu_id = mttrLists.bu_id;
    this.plant_id = mttrLists.plant_id;
    this.department_id = mttrLists.department_id;
    this.asset_group_id = mttrLists.asset_group_id;
    this.created_on = this.datePipe.transform(mttrLists.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = mttrLists.created_user;
    this.modified_on = this.datePipe.transform(mttrLists.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = mttrLists.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    this.getBuList(this.company_id);

    $('#mttr_code').attr('disabled', true);
  }

  statusMttr(mttr_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('mttr_id', mttr_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this MTTR status?");
    } else {
      message = confirm("Do you want to delete this MTTR?");
    }
    if (message) {
      this.masterService.changeStatusMttr(userstatus).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error')
        } else {
          this.commonService.reloadComponent('panel-iframe-master-mttr');
        }
      })
    }
  }
}
