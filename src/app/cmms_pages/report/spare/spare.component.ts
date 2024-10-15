import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { IframeCommunicationService } from '../../shared_services/iframe-communication.service';
import { ReportService } from '../../shared_services/report.service';
declare var $: any;

@Component({
  selector: 'app-spare',
  templateUrl: './spare.component.html',
  styleUrls: ['./spare.component.css']
})
export class SpareComponent {
  companyList: any=[];
  buList: any=[];
  plantList: any=[];
  company_id: any = "";
  bu_id= "";
  plant_id= "";
  departmentList: any=[];
  department_id= "";
  locationList: any=[];
  locationId= "";
  assetGroupList: any=[];
  assetGroupId= "";
  assetList: any=[];
  assetId= "";
  spareList: any=[];
  spareId = "";
  userLoginId: any=[];
  reportType = 'detail';
  title = "";
  reportFilds: any = [];
  reportFieldOptions: any = [];
  employeeId = "";
  engineerList: any = [];

  constructor(private commonService: CommonService,private router: Router,private masterService:MasterService, private _iframeCom: IframeCommunicationService,private reportservice:ReportService) {}

  ngOnInit() {
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

    $(".multiselect").bsMultiSelect({
      cssPatch: {
        choices: {
          columnCount: '3'
        },
      }
    });
    
    this.getReportFields(13);
    
    
    $("#period_id").change(function () {
      if ($("#period_id").val() == "sel_date") {
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

    this.getCompanyList();

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
      this.getDepartmentList(company_id, bu_id, plant_id)
    });

    $('#department_name').change(()=>{
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id,department_id)
      this.getSpareList(company_id, bu_id, plant_id,department_id)
      this.getEngineerList(company_id, bu_id, plant_id, this.department_id)
    });

    $('#location_name').change(()=>{
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      this.getAssetGroupList(company_id, bu_id, plant_id,department_id,location_id)
    });

    $('#asset_group_name').change(()=>{
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      var location_id = $('#location_name').val();
      var asset_group_id = $('#asset_group_name').val();
      this.getAssetList(company_id, bu_id, plant_id,department_id,location_id,asset_group_id)
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
          }
          this.getBuList(this.company_id);
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
            }
            this.getPlantList(company_id, this.bu_id);
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
            this.getDepartmentList(company_id, bu_id, this.plant_id);
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
              this.getLocationList(company_id, bu_id, plant_id, this.department_id)
              this.getSpareList(company_id, bu_id, plant_id, this.department_id)
              this.getEngineerList(company_id, bu_id, plant_id, this.department_id)
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
        this.assetGroupList = res[0].asset_groupLists;
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
      this.getReportFields(13);
      $('#group_by_div').hide();
    }else if (report_name == 'Summary') {
      this.getReportFields(14);
      $('#group_by_div').show();
    }else if (report_name == 'Cumulative') {
      this.getReportFields(18);
      $('#group_by_div').show();
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

  getSpareReport(): void {
    // For generating unique Id to open the Breakdown Report in Another Tab
    if ($('#spare_report_form').valid()) {
      const date = new Date();
      var currentTime = date.toLocaleTimeString();
      var reportId = currentTime.replaceAll(':', '').split(' ')[0];
      this.userLoginId = [localStorage.getItem('employee_id')];
      var cri: any = {};

      // var reportFieldsOption = (document.getElementById('rpt_fields') as HTMLSelectElement).options;
      // for (var j = 0; j < reportFieldsOption.length; j++) {
      //   this.reportFieldOptions.push(reportFieldsOption[j].value);
      // }

      var reportName = "Spare " + this.title + " Report";

      if ($('#period_id').val() == "from_to") {
        reportName += " From " + $('#from_date').val() + " To " + $('#to_date').val();
      } else {
        reportName += " On " + $('#from_date').val();
      }

      var group_by = 'spare';
      if(this.reportType == 'summary' || this.reportType == 'cumulative'){
        group_by = $('#group_by').val();
      }else{
        group_by = 'spare';
      }
      
      cri['company_id'] = $('#company_name').val();
      cri['bu_id'] = $('#bu_name').val();
      cri['plant_id'] = $('#plant_name').val();
      cri['department_id'] = $('#department_name').val();
      cri['location_id'] = $('#location_name').val();
      cri['asset_group_id'] = $('#asset_group_name').val();
      cri['asset_id'] = $('#asset_name').val();
      cri['engineer_id'] = $('#engineer_name').val();
      cri['spare_name'] = $('#spare_name').val();
      cri['spare_type'] = $('#work_order_category').val();
      cri['group_by'] = group_by;
      cri['report_type'] = this.reportType;    
      cri['period'] = $('#period_id').val();
      cri['from_date'] = $('#from_date').val();
      cri['to_date'] = $('#to_date').val();
      // cri['report_for'] = $('#report_for').val();
      cri['exception_for'] = '';
      cri['operation'] = '';
      cri['operation_value'] = '';
      cri['limit_report_for'] = '';
      cri['limit_exception_for'] = '';
      cri['limit_order_by'] = '';
      cri['limit_operation_value'] = '';
      // cri['user_login_id'] = this.userLoginId;
      cri['selectFields'] = $('#rpt_fields').val();
      cri['report_fields'] = this.reportFilds;

      
      // To Store the Report Data Input in Localstorage as JSON
      var reportData: any = {};
      // reportData['fieldOptions'] = this.reportFieldOptions;
      // reportData['selectFields'] = $('#rpt_fields').val();
      reportData['formdata'] = cri;
      reportData['title'] = reportName;

      // Storing data in Local Storage
      const localStorageKey = 'sparePrint_' + reportId;
      sessionStorage.setItem(localStorageKey, JSON.stringify(reportData));
      var reportUrl = 'iframe/report/spare_report_print/' + reportId;
      let tabVal = {
        tabName: '<i class="far fa-chart-bar"></i> Spare Report',
        tabUrl: reportUrl,
        tabOpen: 1
      };
      this._iframeCom.setIframe(tabVal);
    }
  }
}4