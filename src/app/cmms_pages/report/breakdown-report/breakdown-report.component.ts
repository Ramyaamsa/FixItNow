import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { ReportService } from '../../shared_services/report.service';
import { IframeCommunicationService } from '../../shared_services/iframe-communication.service';
declare var $: any;

@Component({
  selector: 'app-breakdown-report',
  templateUrl: './breakdown-report.component.html',
  styleUrls: ['./breakdown-report.component.css']
})
export class BreakdownReportComponent {
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  assetgroupList: any = [];
  assetList: any = [];
  ticketNoList: any = [];
  dependGroupLists: any = [];
  breakdownCategoryList: any = [];
  breakdownSubcategoryList: any = [];
  engineerList: any = [];
  spareList: any = [];
  userLoginId: any = [];
  period = "";
  fromDate = "";
  toDate = "";
  department_id: any = "";
  plant_id: any = "";
  bu_id: any = "";
  locationId: any = "";
  employeeId: any = "";
  spareId: any = "";
  assetGroupId: any = "";
  assetId: any = "";
  breakdownCategoryId: any = "";
  breakdownSubcategoryId: any = "";
  reportType = "detail";
  reportFilds: any = [];
  title = "";
  loginId: any = [];
  company_id: any = "";
  breakdownStatusId: any = '';
  reportFieldOptions: any = [];

  constructor(private commonService: CommonService, private router: Router, private masterService: MasterService, private reportservice: ReportService, private _iframeCom: IframeCommunicationService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.department_id = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

    $('.select2').chosen();

    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      endDate: '+0d',
      autoclose: true,
      orientation: 'bottom right'
    });

    var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var today = (dd < 10 ? "0" + dd : dd) + '-' + (mm < 10 ? "0" + mm : mm) + '-' + yyyy;
    $("#from_date").val(today);
    $("#to_date").val(today);
    $('.datepicker').datepicker('setDate', today);

    // $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    // $("#breakdown_report_form").validate();

    $(".multiselect").bsMultiSelect({
      cssPatch: {
        choices: {
          columnCount: '3'
        },
      }
    });

    this.getReportFields(1);

    $("#period_id").change(function () {
      if ($("#period_id").val() == "date") {
        $(".from_date_label").html("Date");
        $(".from_date_div").css("display", "block");
        $(".to_date_div").css("display", "none");
        $(".shift_date_div").css("display", "none");
      } else if ($("#period_id").val() == "from_to") {
        $(".from_date_label").html("From Date");
        $(".from_date_div").css("display", "block");
        $(".to_date_div").css("display", "block");
        $(".shift_date_div").css("display", "block");
      }
    });

    $('#report_for').change(() => {
      var task_type = $("#report_for").val();
      if (task_type == 'regular') {
        $('#priority_div').show();
        $('#condition_div').hide();
        $('#duration_div').hide();
      } else if (task_type == 'exception') {
        $('#priority_div').show();
        $('#condition_div').show();
        $('#duration_div').show();
      }
    });

    this.getCompanyList();
    this.getAssetGroupList('', '', '', '', '');
    this.getAssetList('', '', '', '', '', '');
    this.getTicketNoList('', '', '', '', '', '', '');

    $('#company_name').change(() => {
      var company_id = $('#company_name').val();
      this.getBuList(company_id);
      this.getBreakdownCategoryList(company_id);
      this.getAssetGroupList(company_id, '', '', '', '');
      this.getAssetList(company_id, '', '', '', '', '');
      this.getTicketNoList(company_id, '', '', '', '', '', '');
    });

    $('#bu_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      this.getPlantList(company_id, bu_id);
      this.getAssetGroupList(company_id, bu_id, '', '', '');
      this.getAssetList(company_id, bu_id, '', '', '', '');
      this.getTicketNoList(company_id, bu_id, '', '', '', '', '');
    });

    $('#breakdown_category_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var asset_group_id = $('#asset_group_name').val();
      var breakdown_category_id = $('#breakdown_category_name').val();
      this.getBreakdownSubcategoryList(company_id, bu_id, plant_id, department_id, asset_group_id, breakdown_category_id);
    });

    $('#plant_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      this.getDepartmentList(company_id, bu_id, plant_id)
      this.getAssetGroupList(company_id, bu_id, plant_id, '', '');
      this.getAssetList(company_id, bu_id, plant_id, '', '', '');
      this.getTicketNoList(company_id, bu_id, plant_id, '', '', '', '');
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id, department_id)
      this.getEngineerList(company_id, bu_id, plant_id, department_id)
      this.getSpareList(company_id, bu_id, plant_id, department_id)
      this.getAssetGroupList(company_id, bu_id, plant_id, department_id, '');
      this.getAssetList(company_id, bu_id, plant_id, department_id, '', '');
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, '', '', '');
    });

    $('#location_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      this.getAssetGroupList(company_id, bu_id, plant_id, department_id, location_id);
      this.getAssetList(company_id, bu_id, plant_id, department_id, location_id, '');
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, '', '');
    });

    $('#asset_group_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      var asset_group_id = $('#asset_group_name').val();
      this.getAssetList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id)
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id, '');
    });
    
    $('#asset_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      var asset_group_id = $('#asset_group_name').val();
      var asset_id = $('#asset_name').val();
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id, asset_id);
    });
    $('.datepicker').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      var asset_group_id = $('#asset_group_name').val();
      var asset_id = $('#asset_name').val();
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id, asset_id);
    });
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
            this.getBreakdownCategoryList(this.company_id);
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

  getBreakdownCategoryList(company_id: any) {
    if (company_id == '') {
      this.breakdownCategoryList = [];
      setTimeout(() => {
        $("#breakdown_category_name").chosen('destroy');
        $("#breakdown_category_name").val(this.breakdownCategoryId).trigger('change');
        $("#breakdown_category_name").chosen();
      }, 50);
    } else {
      const breakdown_categoryForm = new FormData();
      breakdown_categoryForm.append('company_id', company_id);
      breakdown_categoryForm.append('breakdown_category_id', this.breakdownCategoryId);
      breakdown_categoryForm.append('status', 'active');
      this.masterService.getBreakdownCategory(breakdown_categoryForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.breakdownCategoryList = res[0].breakdown_categoryLists;
          setTimeout(() => {
            $("#breakdown_category_name").chosen('destroy');
            if (this.breakdownCategoryId != '') {
              $("#breakdown_category_name").attr('disabled', true);
            }
            $("#breakdown_category_name").val(this.breakdownCategoryId);
            this.getBreakdownSubcategoryList(this.company_id, this.bu_id, this.plant_id, this.department_id, this.assetGroupId, this.breakdownCategoryId);
            $("#breakdown_category_name").chosen();
          }, 50);
        }
      });
    }
  }

  getBreakdownSubcategoryList(company_id: any, bu_id: any, plant_id: any, department_id: any, asset_group_id: any, breakdown_category_id: any) {
    if (breakdown_category_id == '') {
      this.breakdownSubcategoryList = [];
      setTimeout(() => {
        $("#breakdown_subcategory_name").chosen('destroy');
        $("#breakdown_subcategory_name").val(this.breakdownSubcategoryId).trigger('change');
        $("#breakdown_subcategory_name").chosen();
      }, 50);
    } else {
      const breakdownSubcategoryForm = new FormData();
      breakdownSubcategoryForm.append('company_id', company_id);
      breakdownSubcategoryForm.append('bu_id', bu_id);
      breakdownSubcategoryForm.append('plant_id', plant_id);
      breakdownSubcategoryForm.append('department_id', department_id);
      breakdownSubcategoryForm.append('asset_group_id', asset_group_id);
      breakdownSubcategoryForm.append('breakdown_category_id', breakdown_category_id);
      breakdownSubcategoryForm.append('breakdown_subcategory_id', this.breakdownSubcategoryId);
      breakdownSubcategoryForm.append('status', 'active');
      this.masterService.getBreakdownSubCatergory(breakdownSubcategoryForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.breakdownSubcategoryList = res[0].breakdown_sub_categoryLists;
          setTimeout(() => {
            $("#breakdown_sub_category_name").chosen('destroy');
            $("#breakdown_sub_category_name").val(this.breakdownSubcategoryId);
            $("#breakdown_sub_category_name").chosen();
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
      plantForm.append('plant_id', '');
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
      departmentForm.append('department_id', '');
      departmentForm.append('status', 'active');
      this.masterService.getDepartmentList(departmentForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.departmentList = res[0].departmentLists;
          setTimeout(() => {
            $("#department_name").chosen('destroy');
            if (this.department_id != '') {
              // $("#department_name").attr('disabled', true);
              $("#department_name").val(this.department_id);
              this.getLocationList(company_id, bu_id, plant_id, this.department_id)
              this.getEngineerList(company_id, bu_id, plant_id, this.department_id)
              this.getSpareList(company_id, bu_id, plant_id, this.department_id)
              this.getAssetGroupList(company_id, bu_id, plant_id, this.department_id, '');
              this.getAssetList(company_id, bu_id, plant_id, this.department_id, '', '');
            }
            $("#department_name").chosen();
          }, 50);
        }
      });
    }
  }

  getLocationList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.locationList = [];
      setTimeout(() => {
        $("#location_name").chosen('destroy');
        $("#location_name").val(this.locationId).trigger('change');
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
            }
            $("#location_name").val(this.locationId);
            $('#location_name').chosen();
          }, 50);
        }
      });
    }
  }

  getEngineerList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.engineerList = [];
      setTimeout(() => {
        $("#engineer_name").chosen('destroy');
        $("#engineer_name").val(this.employeeId).trigger('change');
        $("#engineer_name").chosen();
      }, 50);
    } else {
      const engineerForm = new FormData;
      engineerForm.append('company_id', company_id);
      engineerForm.append('bu_id', bu_id);
      engineerForm.append('plant_id', plant_id);
      engineerForm.append('department_id', department_id);
      engineerForm.append('employee_id', this.employeeId);
      engineerForm.append('status', 'active');
      engineerForm.append('is_engineer', 'yes');
      this.masterService.getUserList(engineerForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.engineerList = res[0].employeeLists;
          setTimeout(() => {
            $('#engineer_name').chosen('destroy');
            if (this.employeeId != '') {
              $("#engineer_name").attr('disabled', true);
            }
            $("#engineer_name").val(this.employeeId);
            $('#engineer_name').chosen();
          }, 50);
        }
      });
    }
  }

  getSpareList(company_id: any, bu_id: any, plant_id: any, department_id: any) {
    if (department_id == '') {
      this.spareList = [];
      setTimeout(() => {
        $("#spare_name").chosen('destroy');
        $("#spare_name").val(this.spareId).trigger('change');
        $("#spare_name").chosen();
      }, 50);
    } else {
      const engineerForm = new FormData;
      engineerForm.append('company_id', company_id);
      engineerForm.append('bu_id', bu_id);
      engineerForm.append('plant_id', plant_id);
      engineerForm.append('department_id', department_id);
      engineerForm.append('spare_id', this.spareId);
      engineerForm.append('status', 'active');
      engineerForm.append('is_engineer', 'yes');
      this.masterService.getSpareList(engineerForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.spareList = res[0].spareLists;
          setTimeout(() => {
            $('#spare_name').chosen('destroy');
            if (this.spareId != '') {
              $("#spare_name").attr('disabled', true);
            }
            $("#spare_name").val(this.spareId);
            $('#spare_name').chosen();
          }, 50);
        }
      });
    }
  }

  getAssetGroupList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any = []) {
    // if (location_id == '') {
    //   this.assetgroupList = [];
    //   setTimeout(() => {
    //     $("#asset_group_name").chosen('destroy');
    //     $("#asset_group_name").val(this.assetGroupId)
    //     $("#asset_group_name").chosen();
    //   }, 50);
    // } else {  
    const assetGroupForm = new FormData;
    assetGroupForm.append('company_id', company_id);
    assetGroupForm.append('bu_id', bu_id);
    assetGroupForm.append('plant_id', plant_id);
    assetGroupForm.append('department_id', department_id);
    assetGroupForm.append('location_id', location_id);
    assetGroupForm.append('asset_group_id', this.assetGroupId);
    assetGroupForm.append('status', 'active');
    this.masterService.getAssetGroupList(assetGroupForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetgroupList = res[0].asset_groupLists;
        setTimeout(() => {
          $('#asset_group_name').chosen('destroy');
          if (this.assetGroupId != '') {
            $("#asset_group_name").attr('disabled', true);
          }
          $("#asset_group_name").val(this.assetGroupId);
          $('#asset_group_name').chosen();
        }, 50);
      }
    });
    // }
  }

  getAssetList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any, asset_group_id: any) {
    // if (asset_group_id == '') {
    //   this.assetList = [];
    //   setTimeout(() => {
    //     $("#asset_name").val(this.assetId)
    //     $("#asset_name").bsMultiSelect("UpdateData");
    //   }, 50);
    // } else {   
    const assetForm = new FormData;
    assetForm.append('company_id', company_id);
    assetForm.append('bu_id', bu_id);
    assetForm.append('plant_id', plant_id);
    assetForm.append('department_id', department_id);
    assetForm.append('location_id', location_id);
    assetForm.append('asset_group_id', asset_group_id);
    assetForm.append('asset_id', this.assetId);
    assetForm.append('status', 'active');
    this.masterService.getAssetList(assetForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetList = res[0].assetLists;
        setTimeout(() => {
          $("#asset_name").chosen('destroy');
          if (this.assetId != '') {
            $("#asset_name").attr('disabled', true);
          }
          $("#asset_name").val(this.assetId);
          $("#asset_name").chosen();
          // $("#asset_name").bsMultiSelect("UpdateData");
          // $("#asset_name").trigger("change");
          // $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
          // $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
        }, 50);
      }
    });
    // }

  }

  getTicketNoList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any, asset_group_id: any, asset_id: any) {
    const ticketNoForm = new FormData;
    ticketNoForm.append('company_id', company_id);
    ticketNoForm.append('bu_id', bu_id);
    ticketNoForm.append('plant_id', plant_id);
    ticketNoForm.append('department_id', department_id);
    ticketNoForm.append('location_id', location_id);
    ticketNoForm.append('asset_group_id', asset_group_id);
    ticketNoForm.append('asset_id', asset_id);
    ticketNoForm.append('period', $('#period_id').val());
    ticketNoForm.append('from_date', $('#from_date').val());
    ticketNoForm.append('to_date', $('#to_date').val());
    ticketNoForm.append('status_id', this.breakdownStatusId);

    this.reportservice.getTicketNumber(ticketNoForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.ticketNoList = res[0].ticket_no_data;
        setTimeout(() => {
          $('#ticket_id').chosen('destroy');
          $('#ticket_id').chosen();
        }, 50);
      }
    });
    // }
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }

  getReportType(event: Event, report_name: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.reportType = value;
    this.title = report_name;
    var company_id = $('#company_name').val();
    var bu_id = $('#bu_name').val();
    var plant_id = $('#plant_name').val();
    var department_id = $('#department_name').val();
    var location_id = $('#location_name').val();
    var asset_group_id = $('#asset_group_name').val();
    var asset_id = $('#asset_name').val();
    $('#ticket_id').val('').trigger('chosen:updated');

    if (report_name == '') {
      this.breakdownStatusId = '';
      this.getReportFields(1);
      $('#engineer_div').show();
      $('#breakdown_category_div').show();
      $('#breakdown_sub_category_div').show();
      $('#ticket_id_div').hide();
      $('#spare_div').hide();
      $('#group_by_div').hide();
    }else if (report_name == 'Summary') {
      this.breakdownStatusId = '';
      this.getReportFields(2);
      $('#engineer_div').show();
      $('#breakdown_category_div').show();
      $('#breakdown_sub_category_div').show();
      $('#ticket_id_div').hide();
      $('#spare_div').hide();
      $('#group_by_div').show();
    }else if (report_name == 'Cumulative') {
      this.breakdownStatusId = '';
      this.getReportFields(16);
      $('#engineer_div').show();
      $('#breakdown_category_div').show();
      $('#breakdown_sub_category_div').show();
      $('#ticket_id_div').hide();
      $('#spare_div').hide();
      $('#group_by_div').show();
    } else if (report_name == 'Solution Bank') {
      this.breakdownStatusId = 11;
      this.getReportFields(3);
      $('#engineer_div').show();
      $('#breakdown_category_div').show();
      $('#breakdown_sub_category_div').show();
      $('#ticket_id_div').show();
      $('#spare_div').hide();
      $('#group_by_div').hide();
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id, asset_id);
    } else if (report_name == 'MTTR') {
      this.breakdownStatusId = 11;
      this.getReportFields(4);
      $('#breakdown_category_div').hide();
      $('#breakdown_sub_category_div').hide();
      $('#ticket_id_div').show();
      $('#engineer_div').hide();
      $('#spare_div').hide();
      $('#group_by_div').hide();
    } else if (report_name == 'Delete Log') {
      this.breakdownStatusId = 14;
      this.getReportFields(6);
      $('#ticket_id_div').show();
      $('#engineer_div').hide();
      $('#breakdown_category_div').hide();
      $('#breakdown_sub_category_div').hide();
      $('#spare_div').hide();
      $('#group_by_div').hide();
      this.getTicketNoList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id, asset_id);
    } else if (report_name == 'Spare Consumption') {
      this.breakdownStatusId = 11;
      this.getReportFields(5);
      $('#ticket_id_div').hide();
      $('#engineer_div').hide();
      $('#breakdown_category_div').hide();
      $('#breakdown_sub_category_div').hide();
      $('#spare_div').show();
      $('#group_by_div').hide();
    }
  }

  getReportFields(id: any) {
    const reportId = new FormData();
    reportId.append('report_id', id);
    this.reportservice.getReportFields(reportId).subscribe(res => {
      if (res.length > 0) {
        if (res[0].is_error == true) {
          alert(res[0].message)
        } else {
          this.reportFilds = res[0].get_report_fields;
          setTimeout(() => {
            $("#rpt_fields").bsMultiSelect("UpdateData");
            $("#rpt_fields").trigger("change");
            $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
            $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
            $(".dashboardcode-bsmultiselect ul.form-control").sortable({
              stop: (event: any, ui: any) => {
                // var nextElement = ui.item[0].nextSibling.firstChild.innerText;
                var nextElement = $(ui.item[0]).next().children().eq(0).text();
                var prevElement = $(ui.item[0]).prev().children().eq(0).text();
                var draggedOption;
                var nextOption;
                var rpt_options = $('#rpt_fields option');
                for (var i = 0; i < rpt_options.length; i++) {
                  if (rpt_options[i].innerText === ui.item[0].firstChild.innerText) {
                    draggedOption = rpt_options[i];
                  } else if (rpt_options[i].innerText === nextElement && nextElement != '') {
                    nextOption = rpt_options[i].value;
                  } else if (nextElement == '' && rpt_options[i].innerText === prevElement) {
                    nextOption = rpt_options[i].value;
                  }
                }
                $('#rpt_fields').detach(draggedOption);
                if (nextElement != '') {
                  $('#rpt_fields option[value="' + nextOption + '"]').before(draggedOption);
                } else {
                  $('#rpt_fields option[value="' + nextOption + '"]').after(draggedOption);
                }
              }
            });
          }, 50);
        }
      }
    })
    
    $(document).on('click', '.deselect_all', function () {
      $('#rpt_fields').bsMultiSelect('DeselectAll');
      $("#rpt_fields").bsMultiSelect("UpdateData");
      $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
      $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
    });
    $(document).on('click', '.select_all', function () {
      $('#rpt_fields').bsMultiSelect('selectAll');
      $("#rpt_fields").bsMultiSelect("UpdateData");
      $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
      $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
    });
  }

  getBreakdownReport(): void {

    if ($('#breakdown_report_form').valid()) {
      // For generating unique Id to open the Breakdown Report in Another Tab
      const date = new Date();
      var currentTime = date.toLocaleTimeString();
      var reportId = currentTime.replaceAll(':', '').split(' ')[0];
      this.userLoginId = [localStorage.getItem('employee_id')];
      var cri: any = {};

      var reportFieldsOption = (document.getElementById('rpt_fields') as HTMLSelectElement).options;
      for (var j = 0; j < reportFieldsOption.length; j++) {
        this.reportFieldOptions.push(reportFieldsOption[j].value);
      }

      var reportName = "Breakdown " + this.title + " Report";

      if ($('#period_id').val() == "from_to") {
        reportName += " From " + $('#from_date').val() + " To " + $('#to_date').val();
      } else {
        reportName += " On " + $('#from_date').val();
      }

      var group_by = 'ticket';
      if(this.reportType == 'summary' || this.reportType == 'cumulative'){
        group_by = $('#group_by').val();
      }else{
        group_by = 'ticket';
      }

      cri['company_id'] = $('#company_name').val();
      cri['bu_id'] = $('#bu_name').val();
      cri['plant_id'] = $('#plant_name').val();
      cri['department_id'] = $('#department_name').val();
      cri['location_id'] = $('#location_name').val();
      cri['asset_group_id'] = $('#asset_group_name').val();
      cri['asset_id'] = $('#asset_name').val();
      cri['breakdown_category_id'] = $('#breakdown_category_name').val();
      cri['breakdown_subcategory_id'] = $('#breakdown_sub_category_name').val();
      cri['ticket_id'] = $('#ticket_id').val();
      cri['engineer_id'] = $('#engineer_name').val();
      cri['breakdown_status'] = this.breakdownStatusId;
      cri['group_by'] = group_by;
      cri['report_type'] = this.reportType;
      cri['period'] = $('#period_id').val();
      cri['from_date'] = $('#from_date').val();
      cri['to_date'] = $('#to_date').val();
      cri['report_for'] = $('#report_for').val();
      cri['exception_for'] = '';
      cri['operation'] = '';
      cri['operation_value'] = '';
      cri['limit_report_for'] = '';
      cri['limit_exception_for'] = '';
      cri['limit_order_by'] = '';
      cri['limit_operation_value'] = '';
      cri['priority_id'] = $('#priority_id').val();
      cri['asset_status'] = $('#asset_status').val();
      cri['on_off_time'] = $('#on_off_time').val();
      cri['time'] = $('#time').val();

      // To Store the Report Data Input in Localstorage as JSON
      var reportData: any = {};
      reportData['fieldOptions'] = this.reportFieldOptions;
      reportData['selectFields'] = $('#rpt_fields').val();
      reportData['formdata'] = cri;
      reportData['title'] = reportName;

      // Storing data in Local Storage
      const localStorageKey = 'breakdownPrint_' + reportId;
      sessionStorage.setItem(localStorageKey, JSON.stringify(reportData));

      // Passing Data to Open new Tab on Iframe Concept
      var reportUrl = 'iframe/report/breakdown_report_print/' + reportId;
      let tabVal = {
        tabName: '<i class="far fa-chart-bar"></i> Breakdown ' + this.title + ' Report',
        tabUrl: reportUrl,
        tabOpen: 1
      };
      this._iframeCom.setIframe(tabVal);
    }
  }
}
