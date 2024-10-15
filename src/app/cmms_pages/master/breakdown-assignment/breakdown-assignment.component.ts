import { Component, SimpleChanges } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-breakdown-assignment',
  templateUrl: './breakdown-assignment.component.html',
  styleUrls: ['./breakdown-assignment.component.css']
})
export class BreakdownAssignmentComponent {
  breakdownAssignCard: boolean = false;
  breakdownListView: boolean = false;
  breakdownChanges: boolean = false;

  breakdownAssignList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  assetGroupList: any = [];
  breakdownCategoryList: any = [];
  breakdownList: any = [];
  masterOperation: any = [];

  breakCompanyId: any = '';
  breakBuId: any = '';
  breakPlantId: any = '';
  breakAssetGroupId: any = '';

  breakdownCategoryId: any = "";
  breakdownId: any = "";
  breakdownSubCategoryId: any = ""
  escalationTime: any = "";
  breakdownCreatedOn: any = "";
  breakdownModifiedOn: any = "";
  breakdownCreatedBy: any = "";
  breakdownModifiedBy: any = "";
  loginId: any = "";

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.commonService.upperCase();
    this.commonService.numericDot();
    this.masterOperation = this.settingService.masterOperation(15, this.loginId);

    $('#breakdown_toggle').on('click', () => {
      const toggleIcon = $('#breakdownToggleIcon');
      const dataElements = $('#breakdownDatatable, #breakdownDatatable_info, #breakdownDatatable_filter, #breakdownDatatable_paginate, #breakdownDatatable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        dataElements.hide();
        this.breakdownListView = true;
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.breakdownListView = false;
      }
    });

    if (!this.breakdownChanges) {
      this.breakCompanyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
      this.breakBuId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
      this.breakPlantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

      this.getCompanyList();
      this.getBreakdownCatergory();
      this.getBreakdownAssignList();
    }
    $('#break_company_name').change(() => {
      var company_id = $('#break_company_name').val();
      this.getBuList(company_id);
    });

    $('#break_bu_name').change(() => {
      var company_id = $('#break_company_name').val();
      var bu_id = $('#break_bu_name').val();
      this.getPlantList(company_id, bu_id);
    });

    $('#break_plant_name').change(() => {
      var company_id = $('#break_company_name').val();
      var bu_id = $('#break_bu_name').val();
      var plant_id = $('#break_plant_name').val();
      this.getAssetGroupList(company_id, bu_id, plant_id)
    });

    $('#breakdown_category_name').change(() => {
      var breakdown_category_id = $('#breakdown_category_name').val();
      this.getBreakdownList(breakdown_category_id);
    });

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#breakdown_form").validate();
    $('.break_select2').chosen();

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.breakdownChanges = true;
    this.getCompanyList();
    this.getBreakdownCatergory();
    this.getBreakdownAssignList();
  }

  textWrap() {
    $('#breakdownDatatable th, #breakdownDatatable td').toggleClass('full-content');
  }

  getBreakdownAssignList() {
    const startTime = Date.now();
    const breakdownsubCategoryForm = new FormData;
    breakdownsubCategoryForm.append('company_id', this.breakCompanyId);
    breakdownsubCategoryForm.append('bu_id', this.breakBuId);
    breakdownsubCategoryForm.append('plant_id', this.breakPlantId);
    breakdownsubCategoryForm.append('asset_group_id', this.breakAssetGroupId);
    breakdownsubCategoryForm.append('breakdown_category_id', '');
    breakdownsubCategoryForm.append('breakdown_sub_category_id', '');
    breakdownsubCategoryForm.append('status', '');
    this.masterService.getBreakdownAssign(breakdownsubCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.breakdownAssignList = res[0].breakdown_categoryLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#breakdownDatatable').DataTable({
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
    companyForm.append('company_id', this.breakCompanyId);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyList = res[0].companyLists;
        setTimeout(() => {
          $('#break_company_name').chosen('destroy');
          if (this.breakCompanyId != '') {
            $('#break_company_name').attr('disabled', true);
            $('#break_company_name').val(this.breakCompanyId)
            this.getBuList(this.breakCompanyId);
          }
          $('#break_company_name').chosen();
        }, 50);
      }
    });
  }

  getBuList(company_id: any) {
    if (company_id == '') {
      this.buList = [];
      setTimeout(() => {
        $("#break_bu_name").chosen('destroy');
        $("#break_bu_name").val(this.breakBuId).trigger('change');
        $("#break_bu_name").chosen();
      }, 50);
    } else {
      const buForm = new FormData();
      buForm.append('company_id', company_id);
      buForm.append('bu_id', this.breakBuId);
      buForm.append('status', 'active');
      this.masterService.getBuList(buForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.buList = res[0].buLists;
          setTimeout(() => {
            $("#break_bu_name").chosen('destroy');
            if (this.breakBuId != '') {
              $("#break_bu_name").attr('disabled', true);
              $("#break_bu_name").val(this.breakBuId);
              this.getPlantList(company_id, this.breakBuId);
            }
            $("#break_bu_name").chosen();
          }, 50);
        }
      });
    }
  }

  getPlantList(company_id: any, bu_id: any) {
    if (bu_id == '') {
      this.plantList = [];
      setTimeout(() => {
        $("#break_plant_name").chosen('destroy');
        $("#break_plant_name").val(this.breakPlantId).trigger('change');
        $("#break_plant_name").chosen();
      }, 50);
    } else {
      const plantForm = new FormData;
      plantForm.append('company_id', company_id);
      plantForm.append('bu_id', bu_id);
      plantForm.append('plant_id', this.breakPlantId);
      plantForm.append('status', 'active');
      this.masterService.getPlantList(plantForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.plantList = res[0].plantLists;
          setTimeout(() => {
            $("#break_plant_name").chosen('destroy');
            if (this.breakPlantId != '') {
              $("#break_plant_name").attr('disabled', true);
              $("#break_plant_name").val(this.breakPlantId);
              this.getAssetGroupList(company_id, bu_id, this.breakPlantId);
            }
            $("#break_plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  getAssetGroupList(company_id: any, bu_id: any, plant_id: any) {
    if (plant_id == '') {
      this.assetGroupList = [];
      setTimeout(() => {
        $("#break_asset_group").chosen('destroy');
        $("#break_asset_group").val(this.breakAssetGroupId).trigger('change');
        $("#break_asset_group").chosen();
      }, 50);
    } else {
      const equipmentGroupForm = new FormData;
      equipmentGroupForm.append('company_id', company_id);
      equipmentGroupForm.append('bu_id', bu_id);
      equipmentGroupForm.append('plant_id', plant_id);
      equipmentGroupForm.append('asset_group_id', this.breakAssetGroupId);
      equipmentGroupForm.append('status', 'active');
      this.masterService.getAssetGroupList(equipmentGroupForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.assetGroupList = res[0].asset_groupLists;
          setTimeout(() => {
            $("#break_asset_group").chosen('destroy');
            if (this.breakAssetGroupId != '') {
              $("#break_asset_group").attr('disabled', true);
              $("#break_asset_group").val(this.breakAssetGroupId);
            }
            $("#break_asset_group").chosen();
          }, 50);
        }
      });
    }
  }

  getBreakdownCatergory() {
    const breakdownCategoryForm = new FormData;
    breakdownCategoryForm.append('breakdown_category_id', this.breakdownCategoryId);
    breakdownCategoryForm.append('status', 'active');
    this.masterService.getBreakdownCategory(breakdownCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.breakdownCategoryList = res[0].breakdown_categoryLists;
        setTimeout(() => {
          $("#breakdown_category_name").chosen('destroy');
          if (this.breakdownCategoryId != '') {
            $("#breakdown_category_name").attr('disabled', true);
            $("#breakdown_category_name").val(this.breakdownCategoryId);
            this.getBreakdownList(this.breakdownCategoryId);
          }
          $("#breakdown_category_name").chosen();
        }, 50);
      }
    });
  }

  getBreakdownList(breakdown_category_id: any = '') {
    if (breakdown_category_id == '') {
      this.breakdownList = [];
      setTimeout(() => {
        $("#breakdown_sub_category").chosen('destroy');
        $("#breakdown_sub_category").val('');
        $("#breakdown_sub_category").chosen();
      }, 50);
    } else {
      const breakdownsubCategoryForm = new FormData;
      breakdownsubCategoryForm.append('breakdown_category_id', breakdown_category_id);
      breakdownsubCategoryForm.append('breakdown_sub_category_id', '');
      breakdownsubCategoryForm.append('status', 'active');
      this.masterService.getBreakdownSubCatergory(breakdownsubCategoryForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.breakdownList = res[0].breakdown_sub_categoryLists;
          setTimeout(() => {
            $("#breakdown_sub_category").chosen('destroy');
            if (this.breakdownSubCategoryId != '') {
              $("#breakdown_sub_category").attr('disabled', true);
              $("#breakdown_sub_category").val(this.breakdownSubCategoryId);
            }
            $("#breakdown_sub_category").chosen();
          }, 50);
        }
      })
    }
  }

  breakdown() {
    this.breakdownAssignCard = !this.breakdownAssignCard;
  }

  saveBreakdown() {
    if ($('#breakdown_form').valid()) {
      this.breakCompanyId = (document.getElementById('break_company_name') as HTMLInputElement).value;
      this.breakBuId = (document.getElementById('break_bu_name') as HTMLInputElement).value;
      this.breakPlantId = (document.getElementById('break_plant_name') as HTMLInputElement).value;
      this.breakAssetGroupId = (document.getElementById('break_asset_group') as HTMLInputElement).value;
      this.breakdownCategoryId = (document.getElementById('breakdown_category_name') as HTMLInputElement).value;
      this.breakdownSubCategoryId = (document.getElementById('breakdown_sub_category') as HTMLInputElement).value;

      const breakdownForm = new FormData();
      breakdownForm.append('breakdown_assignment_id', this.breakdownId);
      breakdownForm.append('company_id', this.breakCompanyId);
      breakdownForm.append('bu_id', this.breakBuId);
      breakdownForm.append('plant_id', this.breakPlantId);
      breakdownForm.append('asset_group_id', this.breakAssetGroupId);
      breakdownForm.append('breakdown_category_id', this.breakdownCategoryId);
      breakdownForm.append('breakdown_sub_category_id', this.breakdownSubCategoryId);
      breakdownForm.append('escalation_time', this.escalationTime);
      breakdownForm.append('user_login_id', this.loginId);

      this.masterService.saveBreakdownAssign(breakdownForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Breakdown Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-breakdown');
        }
      });
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-breakdown');
  }

  editBreakdownSubcategory(data: any) {
    this.breakdownAssignCard = true;
    this.breakdownId = data.breakdown_assignment_id;
    this.breakCompanyId = data.company_id;
    this.breakdownSubCategoryId = data.breakdown_sub_category_id;
    this.breakdownCategoryId = data.breakdown_category_id;
    this.breakBuId = data.bu_id;
    this.breakPlantId = data.plant_id;
    this.breakAssetGroupId = data.asset_group_id;
    this.escalationTime = data.escalation_time;
    this.breakdownCreatedOn = this.datePipe.transform(data.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.breakdownCreatedBy = data.created_user;
    this.breakdownModifiedOn = this.datePipe.transform(data.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.breakdownModifiedBy = data.modified_user;

    $('#break_company_name').attr('disabled', true);
    $('#break_company_name').val(this.breakCompanyId).trigger('chosen:updated');

    this.getBuList(this.breakCompanyId);
    this.getBreakdownCatergory();
  }

  statusBreakdownSubcategory(breakdown_assignment_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('breakdown_assignment_id', breakdown_assignment_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Breakdown Assignment Status?");
    } else {
      message = confirm("Do you want to delete this Breakdown Assignment?");
    }
    if (message) {
      this.masterService.changeStatusBreakdownAssign(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-breakdown');
        }
      })
    }
  }
}
