import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-spares',
  templateUrl: './spares.component.html',
  styleUrls: ['./spares.component.css']
})
export class SparesComponent {
  spareCard: boolean = false;
  listView: boolean = false;
  spareList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  uomList: any = [];
  masterOperation: any = [];

  company_id: any = "";
  bu_id: any = "";
  plant_id: any = "";
  department_id: any = "";
  spare_id: any = "";
  spare_code: any = "";
  spare_name: any = "";
  spare_location: any = "";
  spare_hsn_code: any = "";
  spare_model: any = "";
  spare_make: any = "";
  spare_uom: any = "";
  spare_min_qty: any = "";
  spare_max_qty: any = "";
  spare_unit_price: any = "";
  spare_reorder_level: any = "";
  spare_gst: any = "";
  spare_stock: any = "";
  spare_image: any = "";
  spare_image_old: any = "placeholder.jpg";
  spare_image_file: any = "assets/images/placeholder.jpg";
  model_image: any = "assets/images/placeholder.jpg";
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
    this.commonService.numericDot();
    this.commonService.numericOnly();
    this.masterOperation = this.settingService.masterOperation(12, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" })
    $("#spares_form").validate();

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
    this.getspareLists();

    $('#company_name').change(() => {
      var company_id = $('#company_name').val();
      this.getBuList(company_id);
      this.getUomList();
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
    this.spare_code = this.spare_code.toUpperCase();
  }

  getspareLists() {
    const startTime = Date.now();
    const spareForm = new FormData;
    spareForm.append('company_id', this.company_id);
    spareForm.append('bu_id', this.bu_id);
    spareForm.append('plant_id', this.plant_id);
    spareForm.append('department_id', this.department_id);
    spareForm.append('spare_id', this.spare_id);
    spareForm.append('status', '');
    this.masterService.getSpareList(spareForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.spareList = res[0].spareLists;
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
            $('#company_name').val(this.company_id);
            this.getBuList(this.company_id);
            this.getUomList();
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
            }
            $("#department_name").chosen();
          }, 50);
        }
      });
    }
  }

  getUomList() {
    const uomForm = new FormData;
    uomForm.append('uom_id', '');
    uomForm.append('status', 'active');
    this.masterService.getUomList(uomForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.uomList = res[0].uomLists;
        setTimeout(() => {
          $('#spare_uom').chosen('destroy');
          if (this.spare_uom != '') {
            $('#spare_uom').val(this.spare_uom);
          }
          $('#spare_uom').chosen();
        }, 1000);
      }
    });
  }

  addSpare() {
    this.spareCard = !this.spareCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-spares');
  }

  saveSpare() {
    if ($('#spares_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
      this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.department_id = (document.getElementById('department_name') as HTMLInputElement).value;
      this.spare_uom = (document.getElementById('spare_uom') as HTMLInputElement).value;

      const newspare = new FormData();
      newspare.append('spare_id', this.spare_id);
      newspare.append('company_id', this.company_id);
      newspare.append('bu_id', this.bu_id);
      newspare.append('plant_id', this.plant_id);
      newspare.append('department_id', this.department_id);
      newspare.append('spare_name', this.spare_name);
      newspare.append('spare_code', this.spare_code);
      newspare.append('spare_location', this.spare_location);
      newspare.append('spare_hsn_code', this.spare_hsn_code);
      newspare.append('spare_reorder_level', this.spare_reorder_level);
      newspare.append('spare_model', this.spare_model);
      newspare.append('spare_make', this.spare_make);
      newspare.append('spare_uom', this.spare_uom);
      newspare.append('spare_min_qty', this.spare_min_qty);
      // newspare.append('spare_max_qty', this.spare_max_qty);
      newspare.append('spare_unit_price', this.spare_unit_price);
      newspare.append('spare_gst', this.spare_gst);
      newspare.append('spare_stock', this.spare_stock);
      newspare.append('spare_image', this.spare_image);
      newspare.append('spare_image_old', this.spare_image_old);
      newspare.append('user_login_id', this.loginId);

      this.masterService.saveSpare(newspare).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Data Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-spares');
        }
      })
    }
  }

  spareImage(event: any) {
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
                this.spare_image = file;
                $("spares_image_name").html(this.spare_image.name);
                this.spare_image_file = e.target.result;
                this.spare_image_old = '';
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

  editSpareLists(spareList: any): void {
    this.spareCard = true;
    this.spare_id = spareList.spare_id;
    this.spare_name = spareList.spare_name;
    this.spare_code = spareList.spare_code;
    this.spare_location = spareList.spare_location;
    this.spare_hsn_code = spareList.spare_hsn_code;
    this.spare_model = spareList.spare_model;
    this.spare_make = spareList.spare_make;
    this.spare_min_qty = spareList.spare_min_qty;
    this.spare_max_qty = spareList.spare_max_qty;
    this.spare_unit_price = spareList.spare_unit_price;
    this.spare_reorder_level = spareList.spare_reorder_level;
    this.spare_gst = spareList.spare_gst;
    this.spare_stock = spareList.spare_stock;
    this.created_by = spareList.created_user;
    this.created_on = this.datePipe.transform(spareList.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = spareList.modified_user;
    this.modified_on = this.datePipe.transform(spareList.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.spare_image_old = spareList.spare_image;
    this.company_id = spareList.company_id;
    this.bu_id = spareList.bu_id;
    this.plant_id = spareList.plant_id;
    this.department_id = spareList.department_id;
    this.spare_uom = spareList.spare_uom;
    $('#spare_code').attr('disabled', true);

    $("#spares_image_name").html(spareList.spare_image);    
    this.spare_image_file = spareList.spare_image_url;

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    this.getBuList(this.company_id);
    this.getUomList();
  }

  statusSpare(spare_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const userstatus = new FormData();
    userstatus.append('spare_id', spare_id);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Spare status?");
    } else {
      message = confirm("Do you want to delete this Spare?");
    }
    if (message) {
      this.masterService.changeStatusSpare(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-spares');
        }
      })
    }
  }
  modelImage(spareList: any) {
    this.model_image = spareList.spare_image_url;
    $("#modal-image").modal("show");
  }
}
