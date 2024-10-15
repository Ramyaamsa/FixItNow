import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.css']
})
export class LocationComponent {
  locationCard: boolean = false;
  listView: boolean = false;
  locationList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  masterOperation: any = [];

  companyId: any = "";
  buId: any = "";
  plantId: any = "";
  departmentId: any = "";
  locationId: any = "";
  location_code: any = "";
  location_name: any = "";
  created_on: any = "";
  created_by: any = "";
  modified_on: any = "";
  modified_by: any = "";
  loginId: any = [];
  departmentCode: any = "";
  plantCode: any = "";

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

    $('.select2').chosen();
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(7, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#location_form").validate();

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
    this.getLocationLists();

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
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.location_code = this.location_code.toUpperCase();
  }

  getLocationLists() {
    const startTime = Date.now();
    const locationForm = new FormData();
    locationForm.append('company_id', this.companyId);
    locationForm.append('bu_id', this.buId);
    locationForm.append('plant_id', this.plantId);
    locationForm.append('department_id', this.departmentId);
    locationForm.append('location_id', this.locationId);
    this.masterService.getLocationList(locationForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.locationList = res[0].locationLists;
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
              $("#plant_name").val(this.plantId);
              this.getDepartmentList(company_id, bu_id, this.plantId);
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
        $("#department_name").val(this.departmentId).trigger('change');
        $("#department_name").chosen();
      }, 50);
    } else {
      const departmentForm = new FormData;
      departmentForm.append('company_id', company_id);
      departmentForm.append('bu_id', bu_id);
      departmentForm.append('plant_id', plant_id);
      departmentForm.append('department_id', this.departmentId);
      departmentForm.append('status', 'active');
      this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.departmentList = res[0].departmentLists;
          setTimeout(() => {
            $("#department_name").chosen('destroy');
            if (this.departmentId != '') {
              $("#department_name").attr('disabled', true);
              $("#department_name").val(this.departmentId);
            }
            $("#department_name").chosen();
          }, 50);
        }
      });
    }
  }

  addLocation() {
    this.locationCard = !this.locationCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-location');
  }

  saveLocation() {
    if ($("#location_form").valid()) {
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.departmentId = (document.getElementById('department_name') as HTMLInputElement).value;

      const newlocation = new FormData();
      newlocation.append('location_id', this.locationId);
      newlocation.append('location_name', this.location_name);
      newlocation.append('location_code', this.location_code);
      newlocation.append('company_id', this.companyId);
      newlocation.append('bu_id', this.buId);
      newlocation.append('plant_id', this.plantId);
      newlocation.append('department_id', this.departmentId);
      newlocation.append('user_login_id', this.loginId);

      this.masterService.saveLocation(newlocation).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Data Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-location');
        }
      })
    }
  }

  editLocation(locationLists: any): void {
    this.locationCard = true;
    this.locationId = locationLists.location_id;
    this.companyId = locationLists.company_id;
    this.buId = locationLists.bu_id;
    this.plantId = locationLists.plant_id;
    this.departmentId = locationLists.department_id;

    this.location_code = locationLists.location_code;
    this.location_name = locationLists.location_name;

    this.created_on = this.datePipe.transform(locationLists.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = locationLists.created_user;
    this.modified_on = this.datePipe.transform(locationLists.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = locationLists.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');

    $('#location_code').attr('disabled', true);
    
    this.getBuList(this.companyId);
  }

  statusLocation(locationId: any, status: any) {

    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('location_id', locationId);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Location status?");
    } else {
      message = confirm("Do you want to delete this Location?");
    }
    if (message) {
      this.masterService.changeStatusLocation(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-location');
        }
      })
    }
  }
}
