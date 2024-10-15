import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {

  @Input() serviceCompanyId: any = "";
  @Input() serviceBuId: any = "";
  @Input() servicePlantId: any = "";
  @Input() serviceDepartmentId: any = "";
  @Input() serviceAssetGroupId: any = "";

  serviceChanges: boolean = false;
  serviceCard: boolean = false;
  listView: boolean = false;
  isTaskDetail: boolean = false;
  isServiceHide: boolean = false;

  serviceList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  assetGroupList: any = [];
  masterOperation: any = [];


  serviceId: any = "";
  serviceCode: any = "";
  serviceName: any = "";
  created_on: any = "";
  modified_on: any = "";
  created_by: any = "";
  modified_by: any = "";
  loginId: any = [];

  childFormCard: boolean = false;
  componentShow: boolean = false;
  serviceChildFormCard: boolean = false;
  serviceComponentShow: boolean = false

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.masterOperation = this.settingService.masterOperation(21, this.loginId);

    $('#service_toggle_icon').on('click', () => {
      const toggleIcon = $('#service_toggleIcon');
      const dataElements = $('#service_dataTable, #service_dataTable_info, #service_dataTable_filter, #service_dataTable_paginate, #service_dataTable_length');
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

    if (!this.serviceChanges) {
      this.serviceCompanyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
      this.serviceBuId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
      this.servicePlantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
      this.serviceDepartmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

      this.getCompanyList();
      this.getserviceLists();
    }

    $('#service_company_name').change(() => {
      var company_id = $('#service_company_name').val();
      this.getBuList(company_id);
    });

    $('#service_bu_name').change(() => {
      var company_id = $('#service_company_name').val();
      var bu_id = $('#service_bu_name').val();
      this.getPlantList(company_id, bu_id);
    });

    $('#service_plant_name').change(() => {
      var company_id = $('#service_company_name').val();
      var bu_id = $('#service_bu_name').val();
      var plant_id = $('#service_plant_name').val();
      this.getDepartmentList(company_id, bu_id, plant_id)
    });

    $('#service_department_name').change(() => {
      var company_id = $('#service_company_name').val();
      var bu_id = $('#service_bu_name').val();
      var plant_id = $('#service_plant_name').val();
      var department_id = $('#service_department_name').val();
      this.getEquipmentGroupList(company_id, bu_id, plant_id, department_id);
    });
    
    $('.service_select2').chosen();
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#service_form").validate();
    this.commonService.upperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.serviceChanges = true;
    this.getCompanyList();
    this.getserviceLists();
  }

  textWrap() {
    $('#service_dataTable th, #service_dataTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.serviceCode = this.serviceCode.toUpperCase();
  }

  serviceShow(e: any) {
    this.isServiceHide = !this.isServiceHide;
    $(e.target).toggleClass('fa-angle-down fa-angle-up');
  }

  getserviceLists() {
    const startTime = Date.now();
    const serviceForm = new FormData();
    serviceForm.append('service_id', this.serviceId);
    serviceForm.append('plant_id', this.servicePlantId);
    serviceForm.append('asset_group_id', this.serviceAssetGroupId);
    serviceForm.append('status', '');
    this.masterService.getServiceList(serviceForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.serviceList = res[0].serviceLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#service_dataTable').DataTable({
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
    companyForm.append('company_id', this.serviceCompanyId);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyList = res[0].companyLists;
        setTimeout(() => {
          $('#service_company_name').chosen('destroy');
          if (this.serviceCompanyId != '') {
            $('#service_company_name').attr('disabled', true);
            $('#service_company_name').val(this.serviceCompanyId)
            this.getBuList(this.serviceCompanyId);
          }
          $('#service_company_name').chosen();
        }, 50);
      }
    });
  }

  getBuList(company_id: any) {
    if (company_id == '') {
      this.buList = [];
      setTimeout(() => {
        $("#service_bu_name").chosen('destroy');
        $("#service_bu_name").val(this.serviceBuId).trigger('change');
        $("#service_bu_name").chosen();
      }, 50);
    } else {
      const buForm = new FormData();
      buForm.append('company_id', company_id);
      buForm.append('bu_id', this.serviceBuId);
      buForm.append('status', 'active');
      this.masterService.getBuList(buForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.buList = res[0].buLists;
          setTimeout(() => {
            $("#service_bu_name").chosen('destroy');
            if (this.serviceBuId != '') {
              $("#service_bu_name").attr('disabled', true);
              $("#service_bu_name").val(this.serviceBuId);
              this.getPlantList(company_id, this.serviceBuId);
            }
            $("#service_bu_name").chosen();
          }, 50);
        }
      });
    }
  }

  getPlantList(company_id: any, bu_id: any) {
    if (bu_id == '') {
      this.plantList = [];
      setTimeout(() => {
        $("#service_plant_name").chosen('destroy');
        $("#service_plant_name").val(this.servicePlantId).trigger('change');
        $("#service_plant_name").chosen();
      }, 50);
    } else {
      const plantForm = new FormData;
      plantForm.append('company_id', company_id);
      plantForm.append('bu_id', bu_id);
      plantForm.append('plant_id', this.servicePlantId);
      plantForm.append('status', 'active');
      this.masterService.getPlantList(plantForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.plantList = res[0].plantLists;
          setTimeout(() => {
            $("#service_plant_name").chosen('destroy');
            if (this.servicePlantId != '') {
              $("#service_plant_name").attr('disabled', true);
              $("#service_plant_name").val(this.servicePlantId);
              this.getDepartmentList(company_id, bu_id, this.servicePlantId);
            }
            $("#service_plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  getDepartmentList(company_id: any, bu_id: any, plant_id: any) {
    if (plant_id == '') {
      this.departmentList = [];
      setTimeout(() => {
        $("#service_department_name").chosen('destroy');
        $("#service_department_name").val(this.serviceDepartmentId).trigger('change');
        $("#service_department_name").chosen();
      }, 50);
    } else {
      const departmentForm = new FormData;
      departmentForm.append('company_id', company_id);
      departmentForm.append('bu_id', bu_id);
      departmentForm.append('plant_id', plant_id);
      departmentForm.append('department_id', this.serviceDepartmentId);
      departmentForm.append('status', 'active');
      this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.departmentList = res[0].departmentLists;
          setTimeout(() => {
            $("#service_department_name").chosen('destroy');
            if (this.serviceDepartmentId != '') {
              $("#service_department_name").attr('disabled', true);
              $("#service_department_name").val(this.serviceDepartmentId);
              this.getEquipmentGroupList(company_id, bu_id, plant_id, this.serviceDepartmentId);
            }
            $("#service_department_name").chosen();
          }, 50);
        }
      });
    }
  }

  getEquipmentGroupList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.assetGroupList = [];
      setTimeout(() => {
        $("#service_equipment_group").chosen('destroy');
        $("#service_equipment_group").val(this.serviceAssetGroupId).trigger('change');
        $("#service_equipment_group").chosen();
      }, 50);
    } else {
      const equipmentGroupForm = new FormData;
      equipmentGroupForm.append('company_id', company_id);
      equipmentGroupForm.append('bu_id', bu_id);
      equipmentGroupForm.append('plant_id', plant_id);
      equipmentGroupForm.append('department_id', department_id);
      equipmentGroupForm.append('asset_group_id', this.serviceAssetGroupId);
      equipmentGroupForm.append('status', 'active');
      this.masterService.getAssetGroupList(equipmentGroupForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.assetGroupList = res[0].asset_groupLists;
          setTimeout(() => {
            $("#service_equipment_group").chosen('destroy');
            if (this.serviceAssetGroupId != '') {
              $("#service_equipment_group").attr('disabled', true);
              $("#service_equipment_group").val(this.serviceAssetGroupId);
            }
            $("#service_equipment_group").chosen();
          }, 50);
        }
      });
    }
  }

  addService() {
    this.serviceCard = !this.serviceCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-service');
  }

  saveService() {
    if ($("#service_form").valid()) {
      this.serviceCompanyId = (document.getElementById('service_company_name') as HTMLInputElement).value;
      this.serviceBuId = (document.getElementById('service_bu_name') as HTMLInputElement).value;
      this.servicePlantId = (document.getElementById('service_plant_name') as HTMLInputElement).value;
      this.serviceDepartmentId = (document.getElementById('service_department_name') as HTMLInputElement).value;
      this.serviceAssetGroupId = (document.getElementById('service_equipment_group') as HTMLInputElement).value;

      const newservice = new FormData();
      newservice.append('service_id', this.serviceId);
      newservice.append('service_name', this.serviceName);
      newservice.append('service_code', this.serviceCode);
      newservice.append('company_id', this.serviceCompanyId);
      newservice.append('bu_id', this.serviceBuId);
      newservice.append('plant_id', this.servicePlantId);
      newservice.append('department_id', this.serviceDepartmentId);
      newservice.append('asset_group_id', this.serviceAssetGroupId);
      newservice.append('user_login_id', this.loginId);

      this.masterService.saveService(newservice).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Service Updated Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-service');
        }
      })
    }
  }

  editService(serviceLists: any): void {
    this.serviceCard = true;
    this.serviceId = serviceLists.service_id;
    this.serviceCode = serviceLists.service_code;
    this.serviceName = serviceLists.service_name;
    this.serviceCompanyId = serviceLists.company_id;
    this.serviceBuId = serviceLists.bu_id;
    this.servicePlantId = serviceLists.plant_id;
    this.serviceDepartmentId = serviceLists.department_id;
    this.serviceAssetGroupId = serviceLists.asset_group_id;
    this.created_on = this.datePipe.transform(serviceLists.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = serviceLists.created_user;
    this.modified_on = this.datePipe.transform(serviceLists.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = serviceLists.modified_user;

    $('#service_company_name').attr('disabled', true);
    $('#service_company_name').val(this.serviceCompanyId).trigger('chosen:updated');

    this.getBuList(this.serviceCompanyId);

    $('#service_code').attr('disabled', true);
    this.isTaskDetail = true;
    this.isServiceHide = true;
  }

  statusService(service_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('service_id', service_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Service status?");
    } else {
      message = confirm("Do you want to delete this Service?");
    }
    if (message) {
      this.masterService.changeStatusService(userstatus).subscribe(res => {
        if (res.is_error == true) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-service');
        }
      })
    }
  }
}
