import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;

@Component({
  selector: 'app-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.css']
})

export class ShiftComponent {
  shiftCard: boolean = false;
  listView: boolean = false;
  shiftList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  masterOperation: any = [];

  companyId: any = "";
  buId: any = "";
  plantId: any = "";
  shiftId: any = "";
  no_of_shifts: any = "";
  shift1_start_time: any = "";
  shift1_end_time: any = "";
  shift2_start_time: any = "";
  shift2_end_time: any = "";
  shift3_start_time: any = "";
  shift3_end_time: any = "";
  created_on: any = "";
  created_by: any = "";
  modified_on: any = "";
  modified_by: any = "";
  loginId: any = [];

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

    $('.select2').chosen();
    this.commonService.upperCase();
    this.masterOperation = this.settingService.masterOperation(5, this.loginId);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#shift_form").validate();

    $('.timepicker').mdtimepicker({
      format: 'hh:mm',
      readOnly: true,
    });

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

    $('#no_of_shifts').change(() => {
      var shift_no = $("#no_of_shifts").val();
      if (shift_no == '1') {
        $('#c_shift_div').hide();
        $('#b_shift_div').hide();
      } else if (shift_no == '2') {
        $('#c_shift_div').hide();
        $('#b_shift_div').show();
      }
      else {
        $('#b_shift_div').show();
        $('#c_shift_div').show();
      }
    });

    this.getCompanyList();
    this.getShiftLists();

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

  getShiftLists() {
    const startTime = Date.now();
    const shiftForm = new FormData;
    shiftForm.append('company_id', this.companyId);
    shiftForm.append('bu_id', this.buId);
    shiftForm.append('plant_id', this.plantId);
    shiftForm.append('shift_id', this.shiftId);
    shiftForm.append('status', '');
    this.masterService.getShiftList(shiftForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.shiftList = res[0].shift_Lists;
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

  addShift() {
    this.shiftCard = !this.shiftCard;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-shift');
  }

  saveShift() {
    if ($("#shift_form").valid()) {
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.no_of_shifts = (document.getElementById('no_of_shifts') as HTMLInputElement).value;
      this.shift1_start_time = (document.getElementById('a_shift_start_time') as HTMLInputElement).value;
      this.shift1_end_time = (document.getElementById('a_shift_end_time') as HTMLInputElement).value;
      this.shift2_start_time = (document.getElementById('b_shift_start_time') as HTMLInputElement).value;
      this.shift2_end_time = (document.getElementById('b_shift_end_time') as HTMLInputElement).value;
      this.shift3_start_time = (document.getElementById('c_shift_start_time') as HTMLInputElement).value;
      this.shift3_end_time = (document.getElementById('c_shift_end_time') as HTMLInputElement).value;

      if (this.no_of_shifts == '1') {
        this.shift2_start_time = "";
        this.shift2_end_time = "";
        this.shift3_start_time = "";
        this.shift3_end_time = "";
      }else if (this.no_of_shifts == '2') {
        this.shift3_start_time = "";
        this.shift3_end_time = "";
      }

      const newshift = new FormData();
      newshift.append('shift_id', this.shiftId);
      newshift.append('company_name', this.companyId);
      newshift.append('bu_name', this.buId);
      newshift.append('plant_name', this.plantId);
      newshift.append('no_of_shifts', this.no_of_shifts);
      newshift.append('a_shift_start_time', this.shift1_start_time);
      newshift.append('b_shift_start_time', this.shift2_start_time);
      newshift.append('c_shift_start_time', this.shift3_start_time);
      newshift.append('a_shift_end_time', this.shift1_end_time);
      newshift.append('b_shift_end_time', this.shift2_end_time);
      newshift.append('c_shift_end_time', this.shift3_end_time);
      newshift.append('user_login_id', this.loginId);

      this.masterService.saveShift(newshift).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Data Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-shift');
        }
      })
    }
  }

  editShift(shiftlists: any): void {
    this.shiftCard = true;
    this.shiftId = shiftlists.shift_id;
    this.companyId = shiftlists.company_id;
    this.buId = shiftlists.bu_id;
    this.plantId = shiftlists.plant_id;

    this.no_of_shifts = shiftlists.no_of_shifts;
    this.shift1_start_time = shiftlists.a_shift_start_time;
    this.shift1_end_time = shiftlists.a_shift_end_time;
    this.shift2_start_time = shiftlists.b_shift_start_time;
    this.shift2_end_time = shiftlists.b_shift_end_time;
    this.shift3_start_time = shiftlists.c_shift_start_time;
    this.shift3_end_time = shiftlists.c_shift_end_time;

    this.created_on = this.datePipe.transform(shiftlists.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.created_by = shiftlists.created_user;
    this.modified_on = this.datePipe.transform(shiftlists.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modified_by = shiftlists.modified_user;

    $('#no_of_shifts').val(this.no_of_shifts).trigger('chosen:updated');
    $("#no_of_shifts").val(this.no_of_shifts).trigger('change');

    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');

    this.getBuList(this.companyId);

    setTimeout(() => {
      $('.timepicker').mdtimepicker('destroy');
      $('.timepicker').mdtimepicker({
        format: 'hh:mm',
        readOnly: true
      });
    }, 500);
  }

  statusShift(shiftId: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('shift_id', shiftId);
    userstatus.append('active_status', status);
    let message: any = '';
    if (status == "active" || status == "inactive") {
      message = confirm("Do you want to change this Shift status?");
    } else {
      message = confirm("Do you want to delete this Shift?");
    }
    if (message) {
      this.masterService.changeStatusShift(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-shift');
        }
      })
    }
  }
}
