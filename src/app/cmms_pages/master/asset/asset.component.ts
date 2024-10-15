import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonService } from '../../shared_services/common.service';
import { MasterService } from '../../shared_services/master.service';
import { SettingService } from '../../shared_services/setting-service';
import { DatePipe } from '@angular/common';

declare var $: any;

@Component({
  selector: 'app-asset',
  templateUrl: './asset.component.html',
  styleUrls: ['./asset.component.css']
})

export class AssetComponent {
  showAsset: boolean = false;
  listView: boolean = false;

  assetList: any = [];
  assetModelList: any = [];
  engineerList: any = [];
  headList: any = [];
  masterOperation: any = [];

  @Input() companyId: any = '';
  @Input() buId: any = '';
  @Input() plantId: any = '';
  @Input() departmentId: any = '';
  @Input() locationId: any = '';
  @Input() assetGroupId: any = '';
  @Input() loginId: any = '';

  assetCreatedBy: any = '';
  assetModifiedBy: any = '';
  assetCreatedOn: any = '';
  assetModifiedOn: any = '';
  assetId: any = '';
  assetmodelId: any = '';
  assetCode: any = '';
  assetName: any = '';
  assetDescription: any = '';
  assetSerial: any = '';
  assetMake: any = '';
  manageableId: any = '';
  engineerId: any = '';
  headId: any = '';
  assetManufacturer: any = '';
  assetMfgDate: any = '';
  assetVendor: any = '';
  vendorMail: any = '';
  vendorContact: any = '';
  assetImage: any = '';
  assetImageOld: any = 'placeholder.jpg';
  assetImageUrl: any = "assets/images/placeholder.jpg";
  assetVideo: any = '';
  assetVideoOld: any = 'dummy.mp4';
  assetVideoUrl: any = "assets/video/dummy.mp4";
  assetManual: any = '';
  assetManualOld: any = 'dummy.pdf';
  assetManualUrl: any = "assets/document/dummy.pdf";
  model_image: any = "assets/images/placeholder.jpg";

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }

  ngOnInit() {
    this.commonService.upperCase();
    this.commonService.numericOnly();
    this.masterOperation = this.settingService.masterOperation(17, this.loginId);

    $('#asset_toggle_icon').on('click', (e: any) => {
      const toggleIcon = $('#asset_toggleIcon');
      const dataElements = $('#asset_dataTable, #asset_dataTable_info, #asset_dataTable_filter, #asset_dataTable_paginate, #asset_dataTable_length');
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

    $('.asset_select2').chosen();
    $('.multiselect').select2();
    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" })
    $("#asset_form").validate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.getAssetList();
    this.getAssetModelList(this.companyId, this.buId, this.plantId);
    this.getHeaderList();
    this.getEngineerList();
  }

  textWrap() {
    $('#asset_dataTable th, #asset_dataTable td').toggleClass('full-content');
  }

  addAsset() {
    this.showAsset = !this.showAsset;
  }

  /* For uppercase */
  convertToUpperCase() {
    this.assetCode = this.assetCode.toUpperCase();
  }

  getAssetList() {
    const startTime = Date.now();
    const formData = new FormData;
    formData.append('company_id', this.companyId);
    formData.append('bu_id', this.buId);
    formData.append('plant_id', this.plantId);
    formData.append('department_id', this.departmentId);
    formData.append('location_id', this.locationId);
    formData.append('asset_group_id', this.assetGroupId);
    formData.append('status', '');
    this.masterService.getAssetList(formData).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetList = res[0].assetLists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#asset_dataTable').DataTable({
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

  getAssetModelList(company_id: any, bu_id: any, plant_id: any) {
    const modelForm = new FormData;
    modelForm.append('company_id', company_id);
    modelForm.append('bu_id', bu_id);
    modelForm.append('plant_id', plant_id);
    modelForm.append('status', 'active');
    this.masterService.getAssetModelList(modelForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetModelList = res[0].asset_modelLists;
        setTimeout(() => {
          $("#asset_model_name").chosen('destroy');
          if (this.assetmodelId != '') {
            $("#asset_model_name").attr('disabled', true);
            $("#asset_model_name").val(this.assetmodelId).trigger('change');
          }
          $("#asset_model_name").chosen();
        }, 50);
      }
    });
  }

  getHeaderList() {
    const headForm = new FormData;
    headForm.append('company_id', this.companyId);
    headForm.append('bu_id', this.buId);
    headForm.append('plant_id', this.plantId);
    headForm.append('status', 'active');
    this.masterService.getUserList(headForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.headList = res[0].employeeLists.filter((employee: any) => employee.employee_type == 'Head/Engineer');
        setTimeout(() => {
          $("#asset_head").select2('destroy');
          $("#asset_head").select2();
        }, 50);
      }
    });
  }

  getEngineerList() {
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('bu_id', this.buId);
    userForm.append('plant_id', this.plantId);
    // userForm.append('department_id', this.departmentId);
    userForm.append('is_engineer', 'yes');
    userForm.append('status', 'active');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.engineerList = res[0].employeeLists;
        setTimeout(() => {
          $('#asset_engineer, #asset_manage').chosen('destroy');
          $('#asset_engineer, #asset_manage').chosen();
        }, 500);
      }
    })
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    const ext = file.type;

    switch (ext) {
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
        if (file) {
          const reader = new FileReader();

          reader.onload = (e: any) => {
            const image = new Image();
            image.onload = () => {
              const width = image.width;
              const height = image.height;

              if (width <= 1200 && height <= 600) {
                this.assetImage = file;
                $("#asset_image_name").html(this.assetImage.name);
                this.assetImageUrl = e.target.result;
                this.assetImageOld = '';
              } else {
                alert('Please upload an image with resolution 1200 x 600.');
              }
            };
            image.src = e.target.result;
          };

          reader.readAsDataURL(file);
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  uploadVideo(event: any) {
    const file = event.target.files[0];
    const ext = file.type;
    const maxSizeMB = 30;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    switch (ext) {
      case 'video/mp4':
      case 'video/m4v':
      case 'video/avi':
      case 'video/mov':
      case 'video/mpg':
      case 'video/mpeg':
        if (file) {
          if (file.size > maxSizeBytes) {
            alert('Please upload a video file smaller than 30MB.');
            return;
          }

          this.assetVideo = file;
          $("#asset_video_name").html(this.assetVideo.name);

          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.assetVideoUrl = e.target.result;
            $('#asset_video_file').attr('src', e.target.result)
          };
          reader.readAsDataURL(this.assetVideo);
          this.assetVideoOld = '';
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }


  uploadManual(event: any) {
    var ext = event.target.files[0].type;
    switch (ext) {
      case 'application/pdf':

        if (event.target.files && event.target.files[0]) {
          this.assetManual = event.target.files[0];
          $("#asset_manual_name").html(this.assetManual.name);
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.assetManualUrl = e.target.result;
            $('#asset_manual_file').attr('src', e.target.result)
          };
          reader.readAsDataURL(this.assetManual);
          this.assetManualOld = '';
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  saveAsset() {
    if ($('#asset_form').valid()) {
      var asset_model_id = $('#asset_model_name').val();
      var manageable_person = $('#asset_manage').val();
      var responsible_engineer = $('#asset_engineer').val();
      var responsible_head: any = new Array();
      var head: any = $('#asset_head').val();
      for (var i = 0; i < head.length; i++) {
        responsible_head.push(Number(head[i]));
      }

      if (asset_model_id == null) {
        asset_model_id = 0;
      }
      if (manageable_person == null) {
        manageable_person = 0;
      }
      if (responsible_engineer == null) {
        responsible_engineer = 0;
      }
      if (responsible_head == null) {
        responsible_head = [0];
      }

      const assetForm = new FormData;
      assetForm.append('asset_id', this.assetId);
      assetForm.append('company_id', this.companyId);
      assetForm.append('bu_id', this.buId);
      assetForm.append('plant_id', this.plantId);
      assetForm.append('department_id', this.departmentId);
      assetForm.append('location_id', this.locationId);
      assetForm.append('asset_model_id', asset_model_id);
      assetForm.append('asset_group_id', this.assetGroupId);
      assetForm.append('asset_code', this.assetCode);
      assetForm.append('asset_name', this.assetDescription);
      assetForm.append('asset_serial_no', this.assetSerial);
      assetForm.append('asset_make', this.assetMake);
      assetForm.append('asset_manageable_person', manageable_person);
      assetForm.append('asset_responsible_person', responsible_engineer);
      assetForm.append('asset_responsible_head', responsible_head);
      assetForm.append('asset_manufacturer', this.assetManufacturer);
      assetForm.append('asset_mfg_date', this.assetMfgDate);
      assetForm.append('asset_vendor_name', this.assetVendor);
      assetForm.append('asset_vendor_mail_id', this.vendorMail);
      assetForm.append('asset_vendor_contact', this.vendorContact);
      assetForm.append('asset_image_old', this.assetImageOld);
      assetForm.append('asset_image', this.assetImage);
      assetForm.append('asset_manual_old', this.assetManualOld);
      assetForm.append('asset_manual', this.assetManual);
      assetForm.append('asset_video_old', this.assetVideoOld);
      assetForm.append('asset_video', this.assetVideo);
      assetForm.append('user_login_id', this.loginId);
      this.masterService.saveAsset(assetForm).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata(res.message, 'success');

          this.showAsset = !this.showAsset;
          this.getAssetList();
          $('#asset_code').attr('disabled', null);

          $('.nav-link').removeClass('active');
          $('#general_link').addClass('active');
          $('.tab-pane').removeClass('active');
          $('#general_tab').addClass('show active');

          this.assetId = '';
          this.assetCreatedBy = '';
          this.assetModifiedBy = '';
          this.assetCreatedOn = '';
          this.assetModifiedOn = '';
          this.assetCode = '';
          this.assetDescription = '';
          this.assetSerial = '';
          this.assetMake = '';
          this.assetManufacturer = '';
          this.assetMfgDate = '';
          this.assetVendor = '';
          this.vendorMail = '';
          this.vendorContact = '';
          $('#asset_model_name').val('').trigger('chosen:updated');
          $('#asset_manage').val('').trigger('chosen:updated');
          $('#asset_engineer').val('').trigger('chosen:updated');
          $('#asset_head').val('').trigger('change');
          $('#asset_image').val('');
          $('#asset_image_name').text('Choose File');
          this.assetImage = '';
          this.assetImageOld = 'placeholder.jpg';
          this.assetImageUrl = "assets/images/placeholder.jpg";
          $('#asset_video').val('');
          $('#asset_video_name').text('Choose File');
          this.assetVideo = '';
          this.assetVideoOld = 'dummy.mp4';
          this.assetVideoUrl = "assets/video/dummy.mp4";
          $('#asset_manual').val('');
          $('#asset_manual_name').text('Choose File');
          this.assetManual = '';
          this.assetManualOld = 'dummy.pdf';
          this.assetManualUrl = "assets/document/dummy.pdf";
        }
      });
    }
  }

  editAsset(list: any) {
    this.showAsset = !this.showAsset;
    this.assetId = list.asset_id;
    this.assetCode = list.asset_code;
    this.assetDescription = list.asset_name;
    this.assetmodelId = list.asset_model_id;
    this.assetMake = list.asset_make;
    this.assetSerial = list.asset_serial_no;
    this.manageableId = list.asset_manageable_person;
    this.engineerId = list.asset_responsible_person;
    this.headId = list.asset_responsible_head;
    this.assetManufacturer = list.asset_manufacturer;
    this.assetMfgDate = list.asset_mfg_date;
    this.assetVendor = list.asset_vendor_name;
    this.vendorMail = list.asset_vendor_mail_id;
    this.vendorContact = list.asset_vendor_contact;
    this.assetImageUrl = list.asset_image_url;
    this.assetImageOld = list.asset_image;
    this.assetVideoUrl = list.asset_video_url;
    this.assetVideoOld = list.asset_video;
    this.assetManualUrl = list.asset_manual_url;
    this.assetManualOld = list.asset_manual;
    this.assetCreatedBy = list.created_user;
    this.assetModifiedBy = list.modified_user;
    this.assetCreatedOn = this.datePipe.transform(list.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.assetModifiedOn = this.datePipe.transform(list.modified_on, 'dd-MM-yyyy HH:mm:ss');

    $('#asset_image_name').html(this.assetImageOld);
    $('#asset_manual_name').html(this.assetManualOld);
    $('#asset_video_name').html(this.assetVideoOld);

    $('#asset_video_file').attr('src', list.asset_video_url);
    $('#asset_manual_file').attr('src', list.asset_manual_url);

    $('#asset_code').attr('disabled', true);
    $('#asset_model_name').val(this.assetmodelId).trigger('chosen:updated');
    $('#asset_manage').val(this.manageableId).trigger('chosen:updated');
    $('#asset_engineer').val(this.engineerId).trigger('chosen:updated');
    $('#asset_head').val(this.headId).trigger('change');
  }

  changeAssetStatus(id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const assetStatus = new FormData();
    assetStatus.append('asset_id', id);
    assetStatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this Asset status?");
    } else {
      boolean = confirm("Do you want to delete this Asset?");
    }
    if (boolean) {
      this.masterService.changeStatusAsset(assetStatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.getAssetList();
        }
      })
    }
  }

  modelImage(assetlist: any) {
    this.model_image = assetlist.asset_image_url;
    $("#modal-image").modal("show");
  }

  cancel() {
    this.showAsset = !this.showAsset;
    this.getAssetList();
    $('#asset_code').attr('disabled', null);

    $('.nav-link').removeClass('active');
    $('#general_link').addClass('active');
    $('.tab-pane').removeClass('active');
    $('#general_tab').addClass('show active');
    this.assetId = '';
    this.assetCreatedBy = '';
    this.assetModifiedBy = '';
    this.assetCreatedOn = '';
    this.assetModifiedOn = '';
    this.assetCode = '';
    this.assetDescription = '';
    this.assetSerial = '';
    this.assetMake = '';
    this.assetManufacturer = '';
    this.assetMfgDate = '';
    this.assetVendor = '';
    this.vendorMail = '';
    this.vendorContact = '';
    $('#asset_model_name').val('').trigger('chosen:updated');
    $('#asset_manage').val('').trigger('chosen:updated');
    $('#asset_engineer').val('').trigger('chosen:updated');
    $('#asset_head').val('').trigger('chosen:updated');
    $('#asset_image').val('');
    $('#asset_image_name').text('Choose File');
    this.assetImage = '';
    this.assetImageOld = 'placeholder.jpg';
    this.assetImageUrl = "assets/images/placeholder.jpg";
    $('#asset_video').val('');
    $('#asset_video_name').text('Choose File');
    this.assetVideo = '';
    this.assetVideoOld = 'dummy.mp4';
    this.assetVideoUrl = "assets/video/dummy.mp4";
    $('#asset_manual').val('');
    $('#asset_manual_name').text('Choose File');
    this.assetManual = '';
    this.assetManualOld = 'dummy.pdf';
    this.assetManualUrl = "assets/document/dummy.pdf";
  }
}
