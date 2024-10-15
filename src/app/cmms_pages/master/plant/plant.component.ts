import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-plant',
  templateUrl: './plant.component.html',
  styleUrls: ['./plant.component.css']
})
export class PlantComponent {
  plantCard: boolean = false;
  listView: boolean = false;
  plantLists: any = [];
  companyLists: any = [];
  BuLists: any = [];
  masterOperation: any = [];

  company_id: any = "";
  plant_id: any = "";
  bu_id: any = "";
  bu_code: any = "";
  plant_code: any = "";
  plant_name: any = "";
  plant_address: any = "";
  plant_email: any = "";
  plant_state: any = "";
  plant_country: any = "";
  plant_contact_no: any = "";
  isTime: any = "";
  isAuto: any = "";
  created_on: any = "";
  created_by: any = "";
  modified_on: any = "";
  modified_by: any = "";
  plant_logo: any = "";
  plant_logo_old: any = "";
  plant_image_file: any = "assets/images/placeholder.gif";
  loginId: any = [];
  model_image: any = "";

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#plant_master_form").validate();
    this.masterOperation = this.settingService.masterOperation(4, this.loginId);

    $('.select2').chosen();
    this.commonService.upperCase();

    this.getCompanyLists();
    this.getPlantLists();

    $('#toggle_icon').on('click', () => {
      const toggleIcon = $('#toggleIcon');
      const dataElements = $('#dataTable, #dataTable_info, #dataTable_filter, #dataTable_paginate, #dataTable_length');
      if (toggleIcon.hasClass('fa-toggle-off')) {
        toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        this.listView = true;
        dataElements.hide();
      } else {
        toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        dataElements.show();
        this.listView = false;
      }
    });

    $('#company_name').change(() => {
      var company_id = $('#company_name').val();
      this.getBuLists(company_id);
    });

    $('#bu_name').change(() => {
      if (this.plant_code == '') {
        this.bu_code = $('#bu_name').find(':selected').attr('bu_code');
      }
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  addPlant() {
    this.plantCard = !this.plantCard;
  }

  /* For uppercase */
  convertToUpperCase() {
    this.plant_code = this.plant_code.toUpperCase();
  }

  getCompanyLists() {
    const companyForm = new FormData;
    companyForm.append('company_id', this.company_id);
    companyForm.append('status', 'active');

    this.masterService.getCompanyList(companyForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      }
      else {
        this.companyLists = res[0].companyLists;
        setTimeout(() => {
          $('#company_name').chosen('destroy');
          if (this.company_id != '') {
            $('#company_name').attr('disabled', true);
            $('#company_name').val(this.company_id);
            this.getBuLists(this.company_id);
          }
          $('#company_name').chosen();
        }, 50);
      }
    });
  }

  getBuLists(company_id: any) {
    if (company_id == '') {
      this.BuLists = [];
      setTimeout(() => {
        $("#bu_name").chosen('destroy');
        $("#bu_name").val(this.bu_id);
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
          this.BuLists = res[0].buLists;
          setTimeout(() => {
            $("#bu_name").chosen('destroy');
            if (this.bu_id != '') {
              $("#bu_name").attr('disabled', true);
              $("#bu_name").val(this.bu_id).trigger('change');
            }
            $("#bu_name").chosen();
          }, 50);
        }
      });
    }
  }

  getPlantLists() {
    const startTime = Date.now();
    const plantForm = new FormData;
    plantForm.append('company_id', this.company_id);
    plantForm.append('bu_id', this.bu_id);
    plantForm.append('plant_id', this.plant_id);
    plantForm.append('status', '');
    this.masterService.getPlantList(plantForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.plantLists = res[0].plantLists;
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

  savePlant() {
    let plant = "";

    if ($('#plant_master_form').valid()) {
      this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
      this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;

      if (this.bu_code != '' && this.plant_code != '') {
        plant = this.bu_code + "-" + this.plant_code;
      } else {
        plant = this.plant_code;
      }

      var isShift = $('#time_allocation').is(':checked') ? 'yes' : 'no';
      var isAuto = $('#auto_allocation').is(':checked') ? 'yes' : 'no';

      const newplant = new FormData();
      newplant.append('plant_id', this.plant_id);
      newplant.append('company_id', this.company_id);
      newplant.append('bu_id', this.bu_id);
      newplant.append('plant_code', plant);
      newplant.append('plant_name', this.plant_name);
      newplant.append('plant_address', this.plant_address);
      newplant.append('plant_state', this.plant_state);
      newplant.append('plant_country', this.plant_country);
      newplant.append('plant_contact_no', this.plant_contact_no);
      newplant.append('breakdown_auto_assign', isAuto);
      newplant.append('breakdown_shift_based_auto_assign', isShift);
      newplant.append('plant_logo_old', this.plant_logo_old);
      newplant.append('plant_logo', this.plant_logo);
      newplant.append('user_login_id', this.loginId);

      this.masterService.savePlant(newplant).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Plant Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-plant');
        }
      });
    }
  }

  editPlantLists(plantlist: any): void {
    this.plantCard = true;
    this.plant_id = plantlist.plant_id;
    this.company_id = plantlist.company_id;
    this.bu_id = plantlist.bu_id;
    this.plant_code = plantlist.plant_code;
    this.plant_name = plantlist.plant_name;
    this.plant_address = plantlist.plant_address;
    this.plant_logo_old = plantlist.plant_logo_old;

    this.created_on = this.datePipe.transform(plantlist.created_on, 'dd-MM-yyyy hh:mm:ss');
    this.created_by = plantlist.created_user;
    this.modified_on = this.datePipe.transform(plantlist.modified_on, 'dd-MM-yyyy hh:mm:ss');
    this.modified_by = plantlist.modified_user;

    var isShift = plantlist.breakdown_shift_based_auto_assign == 'yes' ? true : false;
    var isAuto = plantlist.breakdown_auto_assign == 'yes' ? true : false;

    $("#time_allocation").attr('checked', isShift);
    $("#auto_allocation").attr('checked', isAuto);

    if (isShift == false && isAuto == false) {
      $("#no_need").attr('checked', true);
    }

    $('#plant_code').attr('disabled', true);
    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.company_id).trigger('chosen:updated');

    this.getBuLists(this.company_id);
  }

  activeInactive(plant_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('plant_id', plant_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this Plant status?");
    } else {
      boolean = confirm("Do you want to delete this Plant?");
    }
    if (boolean) {
      this.masterService.changeStatusPlant(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-plant');
        }
      })
    }
  }

  modelImage(plantlist: any) {
    this.model_image = plantlist.plant_logo_url;
    $("#modal-image").modal("show");
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-plant');
  }
}
