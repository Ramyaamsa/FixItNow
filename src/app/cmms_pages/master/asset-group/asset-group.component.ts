import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-asset-group',
  templateUrl: './asset-group.component.html',
  styleUrls: ['./asset-group.component.css']
})
export class AssetGroupComponent {
  isAssetGroupDtl: boolean = false;
  listView: boolean = false;
  isAssetShow: boolean = true;
  isAssetDetail: boolean = false;

  assetGroupList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  assetModelList: any = [];
  assetGroupSpareList: any = [];
  spareList: any = [];
  docAssetList: any = [];
  documentList: any = [];
  breakdownAssignList: any = [];
  breakdownCategoryList: any = [];
  breakdownList: any = [];
  masterOperation: any = [];
  spareMasterOperation: any = [];
  docMasterOperation: any = [];

  qrDepartmentList: any = [];
  qrLocationList: any = [];
  qrAssetList: any = [];
  qrAssetGroupList: any = [];
  assetQRList: any = [];

  createdOn: any = "";
  modifiedOn: any = "";
  createdBy: any = "";
  modifiedBy: any = "";

  companyId: any = "";
  buId: any = "";
  plantId: any = "";
  departmentId: any = "";
  locationId: any = "";
  assetModelId: any = "";
  assetGroupId: any = "";
  assetId: any = '';
  plantCode: any = "";
  assetGroupCode: any = "";
  assetGroupName: any = "";
  assetGroupSpareId: any = "";
  spareId: any = "";
  documentName: any = "";
  document: any = "";
  qrImage: any = ''
  loginId: any = [];
  modelImage: any = "assets/images/placeholder.gif";

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
    this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');

    $('.select2').chosen();
    $('.multiselect').select2();
    $.validator.setDefaults({ ignore: ":hidden:not(select)" });
    this.masterOperation = this.settingService.masterOperation(16, this.loginId);
    $("#asset_group_master").validate();
    $('#document_form').validate();
    $('#smartwizard').smartWizard({
      theme: 'square',
      enableUrlHash: false,
      anchor: {
        enableNavigationAlways: true,
      },
      toolbar: {
        showNextButton: false,
        showPreviousButton: false,
      }
    });

    this.commonService.upperCase();

    this.getAssetGroupList();
    this.getCompanyList();

    $('#toggle_icon').on('click', (e: any) => {
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
      if (this.assetGroupCode == '') {
        this.plantCode = $('#plant_name').find(':selected').attr('plant_code');
      }
      this.getDepartmentList(company_id, bu_id, plant_id);
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id, department_id);
    });

    $('#qr_department_name').change(() => {
      this.departmentId = $('#qr_department_name').val();
      this.departmentId = this.departmentId == 'all' ? '' : this.departmentId;
      this.getQrLocationList(this.departmentId);
      this.getQrAssetGroupList('');
      this.getQrAssetList('');
    })

    $('#qr_location_name').change(() => {
      var location_id = $('#qr_location_name').val();
      this.getQrAssetGroupList(location_id);
    })

    $('#qr_asset_group_name').change(() => {
      var asset_group_id = $('#qr_asset_group_name').val();
      this.getQrAssetList(asset_group_id);
    });

    $('#breakdown_category_name').change(() => {
      var breakdown_category_id = (document.getElementById('breakdown_category_name') as HTMLInputElement).value;
      this.getBreakdownList(breakdown_category_id);
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  assetGroupShow(e: any) {
    this.isAssetShow = !this.isAssetShow;
    $(e.target).toggleClass('fa-angle-down fa-angle-up');
  }

  /* For uppercase */
  convertToUpperCase() {
    this.assetGroupCode = this.assetGroupCode.toUpperCase();
  }

  getAssetGroupList() {
    const startTime = Date.now();
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('bu_id', this.buId);
    userForm.append('plant_id', this.plantId);
    userForm.append('department_id', this.departmentId);
    userForm.append('location_id', this.locationId);
    userForm.append('asset_group_id', '');
    userForm.append('status', '');
    this.masterService.getAssetGroupList(userForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetGroupList = res[0].asset_groupLists;
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
            $('#company_name').val(this.companyId);
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
            $('#department_name').chosen('destroy');
            if (this.departmentId != '') {
              $("#department_name").attr('disabled', true);
              $("#department_name").val(this.departmentId);
              this.getLocationList(company_id, bu_id, plant_id, this.departmentId)
            }
            $('#department_name').chosen();
          }, 100);
        }
      });
    }
  }

  getLocationList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.locationList = [];
      setTimeout(() => {
        $("#location_name").chosen('destroy');
        $("#location_name").val(this.locationId);
        $("#location_name").chosen();
      }, 50);
    } else {
      const locationForm = new FormData;
      locationForm.append('company_id', company_id);
      locationForm.append('bu_id', bu_id);
      locationForm.append('plant_id', plant_id);
      locationForm.append('department_id', department_id);
      locationForm.append('location_id', this.locationId);
      locationForm.append('status', 'active');
      this.masterService.getLocationList(locationForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.locationList = res[0].locationLists;
          setTimeout(() => {
            $('#location_name').chosen('destroy');
            if (this.locationId != '') {
              $("#location_name").attr('disabled', true);
              $("#location_name").val(this.locationId);
            }
            $('#location_name').chosen();
          }, 100);
        }
      });
    }
  }

  addAssetGroup() {
    this.isAssetGroupDtl = !this.isAssetGroupDtl;
  }

  saveAssetGroup() {
    let assetGroup = "";
    if ($("#asset_group_master").valid()) {
      if (this.plantCode != '' && this.assetGroupCode != '') {
        assetGroup = this.plantCode + "-" + this.assetGroupCode;
      } else {
        assetGroup = this.assetGroupCode;
      }
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.departmentId = (document.getElementById('department_name') as HTMLInputElement).value;
      this.locationId = (document.getElementById('location_name') as HTMLInputElement).value;
      // this.assetModelId = (document.getElementById('asset_model_name') as HTMLInputElement).value;

      const assetGroupForm = new FormData();
      assetGroupForm.append('asset_group_id', this.assetGroupId);
      assetGroupForm.append('company_id', this.companyId);
      assetGroupForm.append('bu_id', this.buId);
      assetGroupForm.append('plant_id', this.plantId);
      assetGroupForm.append('department_id', this.departmentId);
      assetGroupForm.append('location_id', this.locationId);
      assetGroupForm.append('asset_group_code', assetGroup);
      assetGroupForm.append('asset_group_name', this.assetGroupName);
      assetGroupForm.append('user_login_id', this.loginId);
      this.masterService.saveAssetGroup(assetGroupForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata(res.message, 'success');
          this.commonService.reloadComponent('panel-iframe-master-asset_group');
        }
      });
    }
  }

  editAssetGroup(data: any) {
    this.isAssetShow = !this.isAssetShow;
    this.isAssetGroupDtl = !this.isAssetGroupDtl;

    this.assetGroupId = data.asset_group_id;
    this.companyId = data.company_id;
    this.buId = data.bu_id;
    this.plantId = data.plant_id;
    this.departmentId = data.department_id;
    this.locationId = data.location_id;
    this.assetGroupCode = data.asset_group_code;
    this.assetGroupName = data.asset_group_name;
    this.createdBy = data.created_user;
    this.modifiedBy = data.modified_user;
    this.createdOn = this.datePipe.transform(data.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedOn = this.datePipe.transform(data.modified_on, 'dd-MM-yyyy HH:mm:ss');

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');
    $('#asset_group_code').attr('disabled', true);
    this.getBuList(this.companyId);
    setTimeout(() => {
      this.getAssetGroupSpareList(this.assetGroupId);
      this.getSpareList(this.companyId);
    }, 100);
    setTimeout(() => {
      this.getAssetGroupDocumentList(this.assetGroupId);
      this.spareMasterOperation = this.settingService.masterOperation(19, this.loginId);
      this.docMasterOperation = this.settingService.masterOperation(20, this.loginId);

    }, 1000);
    setTimeout(() => {
      this.getBreakdownAssignList();
      this.getBreakdownCatergory();
    }, 500);
    this.isAssetDetail = true;
  }

  changeStatus(id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const assetGroupStatus = new FormData();
    assetGroupStatus.append('asset_group_id', id);
    assetGroupStatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this Asset Group status?");
    } else {
      boolean = confirm("Do you want to delete this Asset Group?");
    }
    if (boolean) {
      this.masterService.changeStatusAssetGroup(assetGroupStatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-asset_group');
        }
      })
    }
  }

  /* --------------------------------------------- BREAKDOWN ASSIGNMENT --------------------------- */
  getBreakdownAssignList() {
    const startTime = Date.now();
    const breakdownsubCategoryForm = new FormData;
    breakdownsubCategoryForm.append('company_id', this.companyId);
    breakdownsubCategoryForm.append('bu_id', this.buId);
    breakdownsubCategoryForm.append('plant_id', this.plantId);
    breakdownsubCategoryForm.append('asset_group_id', this.assetGroupId);
    breakdownsubCategoryForm.append('status', '');
    this.masterService.getBreakdownAssign(breakdownsubCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.breakdownAssignList = res[0].breakdown_categoryLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#breakdown_assignment_table').DataTable({
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

  getBreakdownCatergory() {
    const breakdownCategoryForm = new FormData;
    breakdownCategoryForm.append('breakdown_category_id', '');
    breakdownCategoryForm.append('status', 'active');
    this.masterService.getBreakdownCategory(breakdownCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.breakdownCategoryList = res[0].breakdown_categoryLists;
        setTimeout(() => {
          $("#breakdown_category_name").chosen('destroy');
          $("#breakdown_category_name").chosen();
        }, 50);
      }
    });
  }

  getBreakdownList(breakdown_category_id: any = '') {
    if (breakdown_category_id == '') {
      this.breakdownList = [];
      setTimeout(() => {
        $("#breakdown_name").chosen('destroy');
        $("#breakdown_name").val('');
        $("#breakdown_name").chosen();
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
            $("#breakdown_name").chosen('destroy');
            $("#breakdown_name").chosen();
          }, 50);
        }
      })
    }
  }

  saveAssetGroupBreakdown() {
    if ($('#breakdown_assignment_form').valid()) {
      var breakdown_category_id = (document.getElementById('breakdown_category_name') as HTMLInputElement).value;
      var breakdown_sub_category_id = (document.getElementById('breakdown_name') as HTMLInputElement).value;

      const breakdownForm = new FormData();
      breakdownForm.append('breakdown_assignment_id', '');
      breakdownForm.append('company_id', this.companyId);
      breakdownForm.append('bu_id', this.buId);
      breakdownForm.append('plant_id', this.plantId);
      breakdownForm.append('asset_group_id', this.assetGroupId);
      breakdownForm.append('breakdown_category_id', breakdown_category_id);
      breakdownForm.append('breakdown_sub_category_id', breakdown_sub_category_id);
      breakdownForm.append('escalation_time', '0');
      breakdownForm.append('user_login_id', this.loginId);

      this.masterService.saveBreakdownAssign(breakdownForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Breakdown Saved Successfully...', 'success');
          this.getBreakdownAssignList();
          $('#breakdown_category_name').val('').trigger('chosen:updated')
          $('#breakdown_name').val('').trigger('chosen:updated')
        }
      });
    }
  }

  changeStatusBreakdownAssign(breakdown_assignment_id: any, status: any) {
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
          this.getBreakdownAssignList();
          $('#breakdown_category_name').val('').trigger('chosen:updated')
          $('#breakdown_name').val('').trigger('chosen:updated')
        }
      })
    }
  }

  /* -------------------------------- SPARE DETAIL ------------------------------------- */
  getSpareList(company_id: any) {
    const spareForm = new FormData;
    spareForm.append('company_id', this.companyId);
    spareForm.append('bu_id', this.buId);
    spareForm.append('plant_id', this.plantId);
    spareForm.append('department_id', this.departmentId);
    spareForm.append('spare_id', this.spareId);
    spareForm.append('status', 'active');
    this.masterService.getSpareList(spareForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.spareList = res[0].spareLists; setTimeout(() => {
          $('#spare_name').chosen('destroy');
          $('#spare_name').chosen();
        }, 100);
      }
    })
  }

  getAssetGroupSpareList(asset_group_id: any) {
    const startTime = Date.now();
    const assetSpareForm = new FormData;
    assetSpareForm.append('asset_group_id', asset_group_id);
    assetSpareForm.append('asset_group_spare_id', this.assetGroupSpareId);
    this.masterService.assetSpareList(assetSpareForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.assetGroupSpareList = res[0].asset_group_spare_Lists;

        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#spare_dataTable').DataTable({
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

  saveAssetGroupSpare() {
    this.spareId = (document.getElementById('spare_name') as HTMLInputElement).value;
    var asset_id = $('#spare_asset_name').val();

    const assetSpare = new FormData;
    assetSpare.append('asset_group_id', this.assetGroupId);
    assetSpare.append('asset_id', asset_id)
    assetSpare.append('spare_id', this.spareId);
    assetSpare.append('user_login_id', this.loginId);
    this.masterService.saveAssetGroupSpare(assetSpare).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'erroe');
      } else {
        this.commonService.toastdata(res.message, 'success');
        $('#spare_name').val('').trigger('chosen:updated');
        $('#spare_asset_name').val(0).trigger('chosen:updated');
        this.assetGroupSpareList = [];
        this.getAssetGroupSpareList(this.assetGroupId);
      }
    })
  }

  changeSpareStatus(id: any, status: any) {
    const spareStatus = new FormData();
    spareStatus.append('asset_group_spare_id', id);
    spareStatus.append('delete_status', status);
    this.masterService.activeinactiveEgSpare(spareStatus).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.commonService.toastdata(res.message, 'success');
        this.assetGroupSpareList = [];
        this.getAssetGroupSpareList(this.assetGroupId);
      }
    })
  }

  getAssetGroupDocumentList(asset_group_id: any) {
    const startTime = Date.now();
    const assetDocument = new FormData;
    assetDocument.append('asset_group_id', asset_group_id);
    this.masterService.assetDocumentList(assetDocument).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.documentList = res[0].asset_group_document_Lists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#document_dataTable').DataTable({
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

  //AssetList
  getDocAssetList() {
    const assetForm = new FormData;
    assetForm.append('department_id', this.departmentId);
    assetForm.append('location_id', this.locationId);
    assetForm.append('asset_group_id', this.assetGroupId);
    assetForm.append('status', 'active');
    this.masterService.getAssetList(assetForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.docAssetList = res[0].assetLists;
        setTimeout(() => {
          $('#doc_asset_name, #spare_asset_name').chosen('destroy');
          $('#doc_asset_name, #spare_asset_name').chosen();
        }, 500);
      }
    })
  }

  uploadDocument(event: any) {
    this.document = event.target.files[0];
    $("#assetgroup_document_name").html(this.document.name);
  }

  saveDocument() {
    if ($('#document_form').valid()) {
      this.documentName = (document.getElementById('document_name') as HTMLInputElement).value;
      var asset_id = $('#doc_asset_name').val();

      const saveDocument = new FormData();
      saveDocument.append('asset_group_id', this.assetGroupId);
      saveDocument.append('asset_id', asset_id);
      saveDocument.append('document_name', this.documentName);
      saveDocument.append('asset_group_document', this.document);
      saveDocument.append('user_login_id', this.loginId);
      this.masterService.saveAssetGroupDocument(saveDocument).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata(res[0].message, 'success');
          $('#document_name').val('');
          $('#doc_asset_name').val(0).trigger('chosen:updated');
          $('#assetgroup_document').val('');
          $('#assetgroup_document_name').text('Choose File');
          this.document = "";
          this.documentList = [];
          this.getAssetGroupDocumentList(this.assetGroupId);
        }
      })
    }
  }

  changeDocumentStatus(id: any, status: any) {
    const documentStatus = new FormData();
    documentStatus.append('asset_group_document_id', id);
    documentStatus.append('delete_status', status);
    this.masterService.activeinactiveDocument(documentStatus).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.commonService.toastdata(res.message, 'success');
        this.documentList = [];
        this.getAssetGroupDocumentList(this.assetGroupId);
      }
    })
  }

  documentShow(data: any) {
    var height = window.innerHeight - 150;
    $('#document_manual').css('height', height)
    $('#document_manual').prop('src', data.document_url);
    $('#modal_docs').modal('show');
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-asset_group');
  }


  /* ------------------------------------ QR Code Generation -------------------------------- */
  getQrDepartmentList() {
    const departmentForm = new FormData;
    departmentForm.append('company_id', this.companyId);
    departmentForm.append('bu_id', this.buId);
    departmentForm.append('plant_id', this.plantId);
    departmentForm.append('department_id', this.departmentId);
    departmentForm.append('status', 'active');
    this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.qrDepartmentList = res[0].departmentLists;
        setTimeout(() => {
          $('#qr_department_name').chosen('destroy');
          if (this.departmentId != '') {
            $("#qr_department_name").attr('disabled', true);
            $("#qr_department_name").val(this.departmentId);
            this.getQrLocationList(this.departmentId)
          }
          $('#qr_department_name').chosen();
        }, 100);
      }
    });
  }

  getQrLocationList(department_id: any) {
    const locationForm = new FormData;
    locationForm.append('department_id', department_id);
    locationForm.append('location_id', this.locationId);
    locationForm.append('status', 'active');
    this.masterService.getLocationList(locationForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.qrLocationList = res[0].locationLists;
        setTimeout(() => {
          $('#qr_location_name').chosen('destroy');
          if (this.locationId != '') {
            $("#qr_location_name").attr('disabled', true);
            $("#qr_location_name").val(this.locationId);
          } else {
            $("#qr_location_name").val(this.qrLocationList[0].location_id);
          }
          $('#qr_location_name').chosen();
        }, 100);
      }
    });
  }

  //AssetGroupList
  getQrAssetGroupList(location_id: any) {
    location_id = location_id == 'all' ? '' : location_id;
    const assetgroupForm = new FormData;
    assetgroupForm.append('company_id', this.companyId);
    assetgroupForm.append('bu_id', this.buId);
    assetgroupForm.append('plant_id', this.plantId);
    assetgroupForm.append('department_id', this.departmentId);
    assetgroupForm.append('location_id', location_id);
    assetgroupForm.append('status', 'active');
    this.masterService.getAssetGroupList(assetgroupForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.qrAssetGroupList = res[0].asset_groupLists;
        setTimeout(() => {
          $('#qr_asset_group_name').chosen('destroy');
          $('#qr_asset_group_name').chosen();
        }, 100);
      }
    })
  }

  //AssetList
  getQrAssetList(asset_group_id: any) {
    asset_group_id = asset_group_id == 'all' ? '' : asset_group_id;
    const assetForm = new FormData;
    assetForm.append('department_id', this.departmentId);
    assetForm.append('location_id', this.locationId);
    assetForm.append('asset_group_id', asset_group_id);
    assetForm.append('status', 'active');
    this.masterService.getAssetList(assetForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.qrAssetList = res[0].assetLists;
        setTimeout(() => {
          $('#qr_asset_name').select2('destroy');
          $('#qr_asset_name').select2();
        }, 100);
      }
    })
  }

  qrCodeModal() {
    this.getQrDepartmentList();
    $('#qr-modal').modal('show');
  }

  generateQR() {
    this.assetQRList = [];
    $('#qr_div').hide();
    var asset_group_id = (document.getElementById('qr_asset_group_name') as HTMLInputElement).value;
    var location_id = (document.getElementById('qr_location_name') as HTMLInputElement).value;
    var asset_id = $('#qr_asset_name').val();
    const qrform = new FormData();
    qrform.append('asset_id', asset_id);
    qrform.append('location_id', location_id);
    qrform.append('asset_group_id', asset_group_id);

    this.masterService.generateQrCode(qrform).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.commonService.toastdata(res[0].message, 'success');
        this.assetQRList = res[0].Asset_Location_path_dir;
        $('#qr_div').show();
      }
    })
  }

  printQR() {
    const printContents = document.getElementById('qr_div')?.innerHTML;
    if (printContents) {
      const popupWindow = window.open('', '_blank', '');
      popupWindow?.document.open();
      popupWindow?.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              @media print {
                #qr_div .flexbox {
                  display: flex;
                  flex-wrap: wrap;
                }
                #qr_div .qr_detail_div {
                  width: 200px;
                  border: 1px solid #000;
                  margin: 10px;
                }

                #qr_div .qr_detail_div p {
                  border-bottom: 1px solid #000;
                  margin: 0px;
                  padding: 5px;
                  text-align: center;
                }
              }
            </style>
          </head>
          <body onload="window.print();window.close()">
            <div id="qr_div">${printContents}</div>
          </body>
        </html>
      `);
      popupWindow?.document.close();
    }
  }
}