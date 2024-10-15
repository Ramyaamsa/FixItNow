import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-uom',
  templateUrl: './uom.component.html',
  styleUrls: ['./uom.component.css']
})
export class UomComponent {
  uomCard: boolean = false;
  uomListView: boolean = false;

  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  uomList: any = [];
  masterOperation: any = [];

  uomId: any = '';
  createdOn: any = '';
  createdBy: any = '';
  modifiedOn: any = '';
  modifiedBy: any = '';
  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  uomCode: any = '';
  uomName: any = '';
  loginId: any = '';
  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    $('.select2').chosen();
    
    this.masterOperation = this.settingService.masterOperation(9, this.loginId);

    $('#toggle_icon').on('click', (e: any) => {
      const toggleIcon = $('#toggleIcon');
      const dataElements = $('#dataTable, #dataTable_info, #dataTable_filter, #dataTable_paginate, #dataTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        this.uomListView = true;
        dataElements.hide();
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.uomListView = false;
      }
    });

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#uom_master_form").validate();
    this.commonService.upperCase();

    this.getUomList();
    // this.getCompanyList();

    $('#company_name').change(() => {
      var company_id = $('#company_name').val();
      this.getBuList(company_id);
    });

    $('#bu_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      this.getPlantList(company_id, bu_id);
    });
  }

  /* For uppercase */
  convertToUpperCase() {
    this.uomCode = this.uomCode.toUpperCase();
  }

  getUomList() {
    const startTime = Date.now();
    const uomForm = new FormData;
    uomForm.append('uom_id', this.uomId);
    uomForm.append('status', '');
    this.masterService.getUomList(uomForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.uomList = res[0].uomLists;
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

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  addUom() {
    this.uomCard = !this.uomCard;
  }

  saveUom() {
    if ($('#uom_master_form').valid()) {
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;

      const newUom = new FormData();
      newUom.append('uom_id', this.uomId);
      // newUom.append('company_id', this.companyId);
      // newUom.append('bu_id', this.buId);
      // newUom.append('plant_id', this.plantId);
      newUom.append('uom_code', this.uomCode);
      newUom.append('uom_name', this.uomName);
      newUom.append('user_login_id', this.loginId);

      this.masterService.saveUom(newUom).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('UOM Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-uom');
        }
      })
    }
  }

  editUom(list: any) {
    this.uomCard = true;
    this.uomId = list.uom_id;
    this.companyId = list.company_id;
    this.buId = list.bu_id;
    this.plantId = list.plant_id;

    this.uomCode = list.uom_code;
    this.uomName = list.uom_name;
    this.createdBy = list.created_user;
    this.modifiedBy = list.modified_user;
    this.createdOn = this.datePipe.transform(list.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedOn = this.datePipe.transform(list.modified_on, 'dd-MM-yyyy HH:mm:ss');

    $('#uom_code').attr('disabled', true)
    // $('#company_name').attr('disabled', true);
    // $('#company_name').val(this.companyId).trigger('chosen:updated');

    // this.getBuList(this.companyId);
  }

  statusUom(uom_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('uom_id', uom_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change the UOM status?");
    } else {
      var boolean = confirm("Do you want to delete this UOM?");
    }

    if (boolean) {
      this.masterService.changeStatusUom(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-uom');
        }
      })
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-uom');
  }
}