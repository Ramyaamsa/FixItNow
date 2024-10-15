import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-asset-model',
  templateUrl: './asset-model.component.html',
  styleUrls: ['./asset-model.component.css']
})
export class AssetModelComponent {
  assetModelCard: boolean = false;
  listView: boolean = false;
  assetmodelList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  masterOperation: any = [];

  company_id: any = "";
  bu_id: any = "";
  plant_id: any = "";
  asset_model_id = "";
  asset_model_code = "";
  asset_model_name = "";
  created_on: any = "";
  modified_on: any = "";
  created_by = "";
  modified_by = "";
  loginId: any = [];

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

    $('.select2').chosen();
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(8, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#asset_model_form").validate();

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
    this.getassetModelLists();


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

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.asset_model_code = this.asset_model_code.toUpperCase();
  }

  getassetModelLists() {
    const startTime = Date.now();
    const assetModelForm = new FormData();
    assetModelForm.append('company_id', this.company_id);
    assetModelForm.append('bu_id', this.bu_id);
    assetModelForm.append('plant_id', this.plant_id);
    assetModelForm.append('asset_model_id', this.asset_model_id);
    this.masterService.getAssetModelList(assetModelForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetmodelList = res[0].asset_modelLists;
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
    })
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
            }
            $("#plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  assetModel() {
    this.assetModelCard = !this.assetModelCard;
  }

  cancel() {
    this.assetModelCard = !this.assetModelCard;
    this.commonService.reloadComponent('panel-iframe-master-asset_model');
  }

  saveAssetModel() {
    if ($('#asset_model_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
      this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;

      const newasset_model = new FormData();
      newasset_model.append('asset_model_id', this.asset_model_id);
      newasset_model.append('asset_model_name', this.asset_model_name);
      newasset_model.append('asset_model_code', this.asset_model_code);
      newasset_model.append('company_id', this.company_id);
      newasset_model.append('bu_id', this.bu_id);
      newasset_model.append('plant_id', this.plant_id);
      newasset_model.append('user_login_id', this.loginId);

      this.masterService.saveAssetModel(newasset_model).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Data Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-asset_model');
        }
      })
    }
  }

  editAssetModel(assetmodel_Lists: any): void {
    this.assetModelCard = true;
    this.asset_model_id = assetmodel_Lists.asset_model_id;
    this.company_id = assetmodel_Lists.company_id;
    this.bu_id = assetmodel_Lists.bu_id;
    this.plant_id = assetmodel_Lists.plant_id;

    this.asset_model_code = assetmodel_Lists.asset_model_code;
    this.asset_model_name = assetmodel_Lists.asset_model_name;

    this.created_on = this.datePipe.transform(assetmodel_Lists.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = assetmodel_Lists.created_user;
    this.modified_on = this.datePipe.transform(assetmodel_Lists.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = assetmodel_Lists.modified_user;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    $('#asset_model_code').attr('disabled', true);
    $('#asset_model_name').val(this.asset_model_name).trigger('chosen:updated');
    this.getBuList(this.company_id);
  }

  statusAssetModel(asset_model_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('asset_model_id', asset_model_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Asset Model status?");
    } else {
      message = confirm("Do you want to delete this Asset Model?");
    }
    if (message) {
      this.masterService.changeStatusAssetModel(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-asset_model');
        }
      })
    }
  }
}
