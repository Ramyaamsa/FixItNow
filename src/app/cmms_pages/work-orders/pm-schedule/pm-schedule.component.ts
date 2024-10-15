import { Component } from '@angular/core';
import { SettingService } from '../../shared_services/setting-service';
import { MasterService } from '../../shared_services/master.service';
import { WorkOrderService } from '../../shared_services/work-order.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared_services/common.service';
import { DatePipe } from '@angular/common';
declare var $: any;

declare var $: any;
@Component({
  selector: 'app-pm-schedule',
  templateUrl: './pm-schedule.component.html',
  styleUrls: ['./pm-schedule.component.css']
})
export class PmScheduleComponent {
  listView: boolean = false;
  isPMScheduleDtl: boolean = false;
  masterOperation: any = [];

  pmScheduleList: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  assetGroupList: any = [];
  assetList: any = [];
  serviceList: any = [];
  engineerList: any = [];

  createdOn: any = '';
  createdBy: any = '';
  modifiedOn: any = '';
  modifiedBy: any = '';
  pmScheduleId: any = '';
  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  departmentId: any = '';
  locationId: any = '';
  assetGroupId: any = '';
  assetId: any = '';
  serviceId: any = '';
  assignOwnerId: any = '';
  estimateTime: any = 24;
  calendar: any = null;

  scheduleDate: any = [];
  loginId: any = '';

  constructor(private commonService: CommonService, private settingService: SettingService, private masterService: MasterService,
    private workOrder: WorkOrderService, private spinner: NgxSpinnerService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
    this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');

    this.masterOperation = this.settingService.masterOperation(36, this.loginId);

    var date = new Date();
    var currentYear = date.getFullYear();

    $('#select_month').datepicker({
      format: 'mm-yyyy',
      startView: "months",
      // minViewMode: "months",
      minViewMode: 1,
      startDate: '+0d',
      autoclose: true,
      orientation: 'bottom bottom'
    });
    $('#select_month').datepicker('setDate', '01-' + date.getMonth() + 1 + '-' + currentYear);
    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      startDate: '+0d',
      autoclose: true,
      orientation: 'top top'
    });

    $('.yearPicker').datepicker({
      format: 'yyyy',
      minViewMode: 2,
      startDate: '+0d',
      autoclose: true,
      orientation: 'top top'
    }).datepicker('setDate', '01-' + date.getMonth() + 1 + '-' + currentYear);

    this.commonService.numericOnly();
    this.getCompanyList();
    this.getPMSchedule();

    $('.select2').chosen();
    $(".multiselect").select2();
    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" })
    $("#pm_schedule_form").validate();


    $('#select_month').change(() => {
      this.pmScheduleList = [];
      this.getPMSchedule();
    });

    $('#select_schedule').change(() => {
      this.pmScheduleList = [];
      this.getPMSchedule();
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
      this.getDepartmentList(company_id, bu_id, plant_id);
      this.getEngineerList(company_id, bu_id, plant_id);
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id, department_id);
    });

    $('#location_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      this.getAssetGroupList(company_id, bu_id, plant_id, department_id, location_id);
    });

    $('#asset_group_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      var asset_group_id = $('#asset_group_name').val();
      this.getAssetList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id);
      this.getServiceList(plant_id, asset_group_id);
    });

    $('#schedule_type').change(() => {
      $('#week_div').hide();
      $('.month_div').hide();
      $('#year_div').hide();
      
      $('#calendar').show();
      this.calendar = $('#calendar').calendar('destroy');
      this.scheduleDate = [];
      $('#week_day').val('').trigger('chosen:updated');
      $('#start_month').val('').trigger('chosen:updated');
      $('#repeat_month').val(0).trigger('chosen:updated');
      $('#schedule_date').val('');

      var schedule_type = $('#schedule_type').val();
      if (schedule_type == 'Day') {
        this.getAllDate(Number($('#schedule_year').val()));
      } else if (schedule_type == 'Week') {
        $('#week_div').show();
      } else if (schedule_type == 'Month') {
        $('.month_div').show();
      } else if (schedule_type == 'Year') {
        $('#year_div').show()
        $('#calendar').hide();
      }
    });

    $('#week_day').change(() => {
      this.calendar = $('#calendar').calendar('destroy');
      this.scheduleDate = [];
      var day = $('#week_day').val();
      this.getWeekDay(Number($('#schedule_year').val()), day)
    });

    $('#repeat_month').change(() => {
      this.calendar = $('#calendar').calendar('destroy');
      this.scheduleDate = [];
      var repeat_month = $('#repeat_month').val();
      var start_month = 0;
      if ($('#start_month').val() == "January") {
        start_month = 0;
      }
      else if ($('#start_month').val() == "February") {
        start_month = 1;
      }
      else if ($('#start_month').val() == "March") {
        start_month = 2;
      }
      else if ($('#start_month').val() == "April") {
        start_month = 3;
      }
      else if ($('#start_month').val() == "May") {
        start_month = 4;
      }
      else if ($('#start_month').val() == "June") {
        start_month = 5;
      }
      else if ($('#start_month').val() == "July") {
        start_month = 6;
      }
      else if ($('#start_month').val() == "August") {
        start_month = 7;
      }
      else if ($('#start_month').val() == "September") {
        start_month = 8;
      }
      else if ($('#start_month').val() == "October") {
        start_month = 9;
      }
      else if ($('#start_month').val() == "November") {
        start_month = 10;
      }
      else if ($('#start_month').val() == "December") {
        start_month = 11;
      }
      this.getMonthDate(Number($('#schedule_year').val()), repeat_month, start_month)
    });
  }

  calendarLoad() {
    this.calendar = $('#calendar').calendar({
      startYear: $('#schedule_year').val(),
      enableContextMenu: false,
      enableRangeSelection: false,
      displayHeader: false,
      style: 'border',
      mouseOnDay: (e: any) => {
        if (e.events.length > 0) {
          var content = '';

          for (var i in e.events) {
            content += '<div class="event-tooltip-content">'
              + '<div class="event-name"><p class="mb-0 text-info">' + e.events[i].name + '</p></div>'
              + '</div>';
          }

          $(e.element).popover({
            trigger: 'manual',
            container: 'body',
            html: true,
            content: content
          });

          $(e.element).popover('show');
        }
      },
      mouseOutDay: (e: any) => {
        if (e.events.length > 0) {
          $(e.element).popover('hide');
        }
      },
      dayContextMenu: (e: any) => {
        $(e.element).popover('hide');
      },
      dataSource: this.scheduleDate
    });
  }

  toggleList() {
    const toggleIcon = $('#pmToggleIcon');
    const dataElements = $('#pm_schedule_table, #pm_schedule_table_info, #pm_schedule_table_paginate, #pm_schedule_table_length');
    if (toggleIcon.hasClass('fa-toggle-off')) {
      toggleIcon.removeClass('fa-toggle-off').addClass('fa-toggle-on');
      dataElements.hide();
      this.listView = true;
    } else {
      toggleIcon.removeClass('fa-toggle-on').addClass('fa-toggle-off');
      dataElements.show();
      this.listView = false;
    }
  }

  textWrap() {
    $('#pm_schedule_table th, #pm_schedule_table td').toggleClass('full-content');
  }

  getAllDate(year: any) {
    const dates = [];

    if (year == new Date().getFullYear()) {
      var getmonth = new Date().getMonth();
      // var getdate = (new Date().getDate()) + 1;
      var getdate = (new Date().getDate());
    } else {
      getdate = 1;
      getmonth = 0;
    }

    const startDate = new Date(year, getmonth, getdate); // January 1st
    const endDate = new Date(year + 1, 0, 1); // January 1st of the next year
    var i = 0;
    for (let currentDate = startDate; currentDate < endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      // Clone the current date and push to the array
      dates.push(new Date(currentDate));
      var cri: any = {};
      cri["id"] = i;
      cri["name"] = 'All Day'
      cri["startDate"] = new Date(currentDate);
      cri["endDate"] = new Date(currentDate);
      this.scheduleDate.push(cri);
      i++;
    }

    this.calendarLoad();
  }

  getWeekDay(year: any, day: any) {
    if (year == new Date().getFullYear()) {
      var getmonth = new Date().getMonth();
      // var getdate = (new Date().getDate()) + 1;
      var getdate = (new Date().getDate());
    } else {
      getdate = 1;
      getmonth = 0;
    }
    let date = new Date(year, getmonth, getdate); // January 1st of the given year

    // Adjust the date to the first Wednesday of the year
    while (date.getDay() !== Number(day)) { // 0=Sunday, 1=Monday, ..., 3=Wednesday, ..., 6=Saturday
      date.setDate(date.getDate() + 1);
    }

    var i = 0;
    // Collect all Wednesdays
    while (date.getFullYear() === year) {
      var cri: any = {};
      cri["id"] = i;
      cri["name"] = 'Week'
      cri["startDate"] = new Date(date);
      cri["endDate"] = new Date(date);
      this.scheduleDate.push(cri);
      i++;
      date.setDate(date.getDate() + 7);
    }

    this.calendarLoad();
  }

  getMonthDate(year: any, repeat_month: any, start_month: any) {
    if (year == new Date().getFullYear()) {
      var getmonth = new Date().getMonth();
    } else {
      getmonth = start_month;
    }
    var start_date = $('#start_date').val();
    if (start_date != '') {
      start_date = start_date.split('-');
      start_date = start_date[0];
      console.log();
      console.log(start_date);
    } else {
      start_date = 1;
    }
    var i = 0;
    for (let month = getmonth; month < 12; month += Number(repeat_month)) { // Increment by 2 to get every other month      
      var cri: any = {};
      cri["id"] = i;
      cri["name"] = 'Month'
      cri["startDate"] = new Date(year, month, start_date);
      cri["endDate"] = new Date(year, month, start_date);
      this.scheduleDate.push(cri);
      i++;
    }

    this.calendarLoad();
  }

  addPMSchedule() {
    this.isPMScheduleDtl = true;
  }

  getPMSchedule() {
    this.spinner.show();
    const startTime = Date.now();
    const serviceForm = new FormData();
    serviceForm.append('company_id', this.companyId);
    serviceForm.append('bu_id', this.buId);
    serviceForm.append('plant_id', this.plantId);
    serviceForm.append('department_id', this.departmentId);
    serviceForm.append('location_id', this.locationId);
    serviceForm.append('asset_group_id', this.assetGroupId);
    serviceForm.append('asset_id', this.assetId);
    serviceForm.append('month', $('#select_month').val());
    serviceForm.append('schedule_type', $('#select_schedule').val());
    serviceForm.append('status', '');
    this.workOrder.getPmScheduleLists(serviceForm).subscribe((res: any) => {
      if (res.iserror) {
        this.spinner.hide();
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.spinner.hide();
        this.pmScheduleList = res[0].pm_schedule_list;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);
        setTimeout(() => {
          $('#pm_schedule_table').tablesorter('destroy').tablesorter({
            sortReset: true,
            sortRestart: true
          })
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
        $("#bu_name").val('').trigger('change');
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
        $("#plant_name").val('').trigger('change');
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
              this.getEngineerList(company_id, bu_id, this.plantId);
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
        $("#department_name").val('').trigger('change');
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
        $("#location_name").val('').trigger('change');
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
              this.getAssetGroupList(company_id, bu_id, plant_id, department_id, this.locationId);
            }
            $('#location_name').chosen();
          }, 100);
        }
      });
    }
  }

  getAssetGroupList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any) {
    if (location_id == '') {
      this.assetGroupList = [];
      setTimeout(() => {
        $("#asset_group_name").chosen('destroy');
        $("#asset_group_name").val('').trigger('change');
        $("#asset_group_name").chosen();
      }, 50);
    } else {
      const agForm = new FormData;
      agForm.append('company_id', company_id);
      agForm.append('bu_id', bu_id);
      agForm.append('plant_id', plant_id);
      agForm.append('department_id', department_id);
      agForm.append('location_id', location_id);
      agForm.append('asset_group_id', '');
      agForm.append('status', 'active');
      this.masterService.getAssetGroupList(agForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.assetGroupList = res[0].asset_groupLists;
          setTimeout(() => {
            $('#asset_group_name').chosen('destroy');
            if (this.assetGroupId != '') {
              $("#asset_group_name").attr('disabled', true);
              $("#asset_group_name").val(this.assetGroupId);
              this.getAssetList(company_id, bu_id, plant_id, department_id, location_id, this.assetGroupId);
              this.getServiceList(plant_id, this.assetGroupId);
            }
            $('#asset_group_name').chosen();
          }, 100);
        }
      });
    }
  }

  getAssetList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any, asset_group_id: any) {
    if (asset_group_id == '') {
      this.assetList = [];
      setTimeout(() => {
        $("#asset_name").chosen('destroy');
        $("#asset_name").val('');
        $("#asset_name").chosen();
      }, 50);
    } else {
      const formData = new FormData;
      formData.append('company_id', company_id);
      formData.append('bu_id', bu_id);
      formData.append('plant_id', plant_id);
      formData.append('department_id', department_id);
      formData.append('location_id', location_id);
      formData.append('asset_group_id', asset_group_id);
      formData.append('status', 'active');
      this.masterService.getAssetList(formData).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.assetList = res[0].assetLists;
          setTimeout(() => {
            $("#asset_name").select2('destroy');
            if (this.assetId != '') {
              $("#asset_name").attr('disabled', true);
              $("#asset_name").val(this.assetId);
            }
            $("#asset_name").select2();
          }, 100);
        }
      })
    }
  }

  getServiceList(plant_id: any, asset_group_id: any) {
    if (asset_group_id == '') {
      this.serviceList = [];
      setTimeout(() => {
        $("#service_name").chosen('destroy');
        $("#service_name").val('');
        $("#service_name").chosen();
      }, 50);
    } else {
      const serviceForm = new FormData()
      serviceForm.append('service_id', '');
      serviceForm.append('plant_id', plant_id);
      serviceForm.append('asset_group_id', asset_group_id);
      serviceForm.append('status', 'active');
      this.masterService.getServiceList(serviceForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.serviceList = res[0].serviceLists;
          setTimeout(() => {
            $("#service_name").chosen('destroy');
            if (this.serviceId != '') {
              $("#service_name").attr('disabled', true);
              $("#service_name").val(this.serviceId);
            }
            $("#service_name").chosen();
          }, 100);
        }
      });
    }
  }

  getEngineerList(company_id: any, bu_id: any, plant_id: any) {
    const startTime = Date.now();
    const userForm = new FormData;
    userForm.append('company_id', company_id);
    userForm.append('bu_id', bu_id);
    userForm.append('plant_id', plant_id);
    userForm.append('is_engineer', 'yes');
    userForm.append('status', 'active');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
        this.spinner.hide();
      } else {
        this.spinner.hide();
        this.engineerList = res[0].employeeLists;
        setTimeout(() => {
          $('#assigned_owner').chosen('destroy');
          if (this.assignOwnerId != '') {
            $('#assigned_owner').val(this.assignOwnerId);
          }
          $('#assigned_owner').chosen();
        }, 100);
      }
    });
  }

  savePmSchedule() {
    if ($('#pm_schedule_form').valid()) {
      this.spinner.show();
      if ($('#schedule_type').val() != 'Year' && this.pmScheduleId == '') {
        var dataSource = this.calendar.getDataSource();
        var scheduleDate: any = [];

        for (var i = 0; i < dataSource.length; i++) {
          var date = dataSource[i].startDate.getDate().toString().padStart(2, '0') + '-' + (dataSource[i].startDate.getMonth() + 1).toString().padStart(2, '0') + '-' + dataSource[i].startDate.getFullYear();
          scheduleDate.push(date);
        }
      } else {
        scheduleDate = $('#schedule_date').val()
      }
      var estimate_time: any = (Number(this.estimateTime) * 3600)

      const formData = new FormData();
      formData.append('schedule_id', this.pmScheduleId)
      formData.append('company_id', $('#company_name').val())
      formData.append('bu_id', $('#bu_name').val())
      formData.append('plant_id', $('#plant_name').val())
      formData.append('department_id', $('#department_name').val())
      formData.append('asset_group_id', $('#asset_group_name').val())
      formData.append('location_id', $('#location_name').val())
      formData.append('service_id', $('#service_name').val())
      formData.append('asset_id', $('#asset_name').val())
      formData.append('schedule_type', $('#schedule_type').val())
      formData.append('schedule_date', scheduleDate)
      formData.append('estimated_time', estimate_time)
      formData.append('priority', $('#pm_priority').val())
      formData.append('start_month', $('#start_month').val())
      formData.append('repeat_month', $('#repeat_month').val())
      formData.append('assigned_owner', $('#assigned_owner').val())
      formData.append('login_id', this.loginId)
      this.workOrder.savePmSchedule(formData).subscribe((res: any) => {
        if (res.is_error) {
          this.spinner.hide();
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.spinner.hide();
          this.commonService.toastdata(res.message, 'success');
          this.commonService.reloadComponent('panel-iframe-work_order-pm_schedule');
        }
      })
    }
  }

  editPmSchedule(list: any) {
    this.isPMScheduleDtl = true;
    this.pmScheduleId = list.schedule_id;
    this.companyId = list.company_id;
    this.buId = list.bu_id;
    this.plantId = list.plant_id;
    this.departmentId = list.department_id;
    this.locationId = list.location_id;
    this.assetGroupId = list.asset_group_id;
    this.assetId = list.asset_id;
    this.serviceId = list.service_id;
    this.scheduleDate = list.schedule_date;
    this.estimateTime = (list.estimate_time) / 3600;
    this.assignOwnerId = list.assigned_owner;
    this.createdOn = this.datePipe.transform(list.created_on, 'dd-MM-yyyy HH:mm:ss')
    this.createdBy = list.created_user;
    this.modifiedOn = this.datePipe.transform(list.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedBy = list.modified_user;
    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');
    this.getBuList(this.companyId);
    $('#schedule_type').attr('disabled', true);
    $('#schedule_type').val(list.schedule_type).trigger('chosen:updated');

    $('#year_div').show();
    $("#schedule_date").datepicker("setDate", this.scheduleDate);
    $('#schedule_year').attr('disabled', true);
    $('#schedule_year').datepicker("setDate", this.scheduleDate.split('-')[2]);
    $('#pm_priority').val(list.priority).trigger('chosen:updated');
    if (list.schedule_type == 'Month') {
      $('.month_div').show();
      $('#start_month').attr('disabled', true);
      $('#start_month').val(list.start_month).trigger('chosen:updated');
      $('#repeat_month').attr('disabled', true);
      $('#repeat_month').val(list.repeat_month).trigger('chosen:updated');
    }
  }

  changePmScheduleStatus(id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const pmStatus = new FormData();
    pmStatus.append('schedule_id', id);
    pmStatus.append('status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this PM Schedule status?");
    } else {
      boolean = confirm("Do you want to delete this PM Schedule?");
    }
    if (boolean) {
      this.workOrder.changeStatusPmSchedule(pmStatus).subscribe((res: any) => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-work_order-pm_schedule');
        }
      })
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-work_order-pm_schedule');
  }
}
