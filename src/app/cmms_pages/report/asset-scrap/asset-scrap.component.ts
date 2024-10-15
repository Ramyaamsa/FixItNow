import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { CommonService } from '../../shared_services/common.service';
import { IframeCommunicationService } from '../../shared_services/iframe-communication.service';
import { ReportService } from '../../shared_services/report.service';

declare var $: any;

@Component({
  selector: 'app-asset-scrap',
  templateUrl: './asset-scrap.component.html',
  styleUrls: ['./asset-scrap.component.css']
})
export class AssetScrapComponent {

  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  assetgroupList: any = [];
  company_id: any= "";
  plant_id: any= "";
  bu_id: any= "";
  department_id: any= "";
  locationId= "";
  assetGroupId= "";
  assetList: any=[];
  assetId= "";  
  userLoginId: any=[];
  reportType = 'scrap';
  title = "";
  reportFormtitle = "Asset Scrap";

  constructor(private commonService: CommonService, private router: Router,private masterService:MasterService, private _iframeCom: IframeCommunicationService,private reportservice:ReportService) {}
  ngOnInit() {

	  this.userLoginId = localStorage.getItem('employee_id');
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
	
	$(".multiselect").bsMultiSelect({
		cssPatch: {
			choices: {
				columnCount: 3
			},
		}
	});

	var date = new Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    var today = (dd < 10 ? "0" + dd : dd) + '-' + (mm < 10 ? "0" + mm : mm) + '-' + yyyy;
	
    $("#from_date").val(today);
    $("#to_date").val(today);
    $('.datepicker').datepicker('setDate', today);

    $("#period_id").change(function() {
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

	this.getCompanyList();
    this.getAssetGroupList('', '', '', '', '');
	this.getAssetList('','', '', '', '', '');

	$('#company_name').change(() => {
		var company_id = $('#company_name').val();
		this.getBuList(company_id);
		this.getAssetGroupList(company_id, '', '', '', '');
		this.getAssetList(company_id,'', '', '', '', '')
	});

	$('#bu_name').change(() => {
		var company_id = $('#company_name').val();
		var bu_id = $('#bu_name').val();
		this.getPlantList(company_id, bu_id);
		this.getAssetGroupList(company_id, bu_id, '', '', '');
		this.getAssetList(company_id,'', bu_id, '', '', '');
	});

	$('#plant_name').change(() => {
		var company_id = $('#company_name').val();
		var bu_id = $('#bu_name').val();
		var plant_id = $('#plant_name').val();
		this.getDepartmentList(company_id, bu_id, plant_id)
		this.getAssetGroupList(company_id, bu_id, plant_id, '', '');
		this.getAssetList(company_id,'', bu_id, plant_id, '', '');
	});

	$('#department_name').change(() => {
		var company_id = $('#company_name').val();
		var bu_id = $('#bu_name').val();
		var plant_id = $('#plant_name').val();
		var department_id = $('#department_name').val();
		this.getLocationList(company_id, bu_id, plant_id, department_id);
		this.getAssetGroupList(company_id, bu_id, plant_id, department_id, '');
		this.getAssetList(company_id,'', bu_id, plant_id, department_id, '')
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
		this.getAssetList(company_id, bu_id, plant_id, department_id, location_id, asset_group_id)
	});
	
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
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
              this.getLocationList(company_id, bu_id, plant_id, this.department_id)
              this.getAssetGroupList(company_id, bu_id, plant_id, this.department_id, '');
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
              $("#location_name").val(this.locationId);
            }
            $('#location_name').chosen();
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
            $("#asset_group_name").val(this.assetGroupId);
          }
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
            $("#asset_name").val(this.assetId);
          }
          $("#asset_name").chosen();
          // $("#asset_name").bsMultiSelect("UpdateData");
          // $("#asset_name").trigger("change");
          // $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
          // $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
        }, 50);
      }
    });
    // }

    $(document).on('click', '.deselect_all', function () {
      $('#asset_name').bsMultiSelect('DeselectAll');
      $("#asset_name").bsMultiSelect("UpdateData");
      $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
      $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
    });

    $(document).on('click', '.select_all', function () {
      $('#asset_name').bsMultiSelect('selectAll');
      $("#asset_name").bsMultiSelect("UpdateData");
      $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
      $('#asset_name').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
    });
  }
  getReportType(event: Event, report_name: any) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    this.reportType = value;
    this.title = report_name;

    if (report_name == 'Detail') {
      this.reportFormtitle = 'Asset Detail';
      $('#asset_div').hide();
      $('#engineer_div').hide();
      $('#head_div').hide();
      $('.period_div').hide();
      $('.from_date_div').hide();
      $('.to_date_div').hide();
    } else if (report_name == 'Scrap') {
      this.reportFormtitle = 'Asset Scrap';
      $('#asset_div').show();
      $('#engineer_div').show();
      $('#head_div').show();
      $('.period_div').show();
      $('.from_date_div').show();
      $('.to_date_div').show();
    }
  }
  
  getAssetReport(): void {
    const date = new Date();
    var currentTime = date.toLocaleTimeString();
    var reportId = currentTime.replaceAll(':', '').split(' ')[0];
    this.userLoginId = [localStorage.getItem('employee_id')];
    var cri: any = {};

    var reportName = "Asset " + this.title + " Report";

    if(this.reportType == 'scrap'){
      if ($('#period_id').val() == "from_to") {
        reportName += " From " + $('#from_date').val() + " To " + $('#to_date').val();
      } else {
        reportName += " On " + $('#from_date').val();
      }
    }

    cri['company_id'] = $('#company_name').val();
    cri['bu_id'] = $('#bu_name').val();
    cri['plant_id'] = $('#plant_name').val();
    cri['department_id'] = $('#department_name').val();
    cri['location_id'] = $('#location_name').val();
    cri['asset_group_id'] = $('#asset_group_name').val();
    cri['asset_id'] = $('#asset_name').val();
    cri['responsible_head_id'] = $('#responsible_head_name').val();
    cri['responsible_person_id'] = $('#responsible_engineer_name').val();
    cri['group_by'] = 'asset';
    cri['report_type'] = this.reportType;
    cri['period'] = $('#period_id').val();
    cri['from_date'] = $('#from_date').val();
    cri['to_date'] = $('#to_date').val();
    cri['user_login_id'] = this.userLoginId;
    var reportData: any = {};
    reportData['formdata'] = cri;
    reportData['title'] = reportName;
    // Storing data in Local Storage
    const localStorageKey = 'assetScrapPrint_' + reportId;
    sessionStorage.setItem(localStorageKey, JSON.stringify(reportData));

    // Passing Data to Open new Tab on Iframe Concept
    var reportUrl = 'iframe/report/asset_report_print/' + reportId;
    let tabVal = {
      tabName: '<i class="far fa-chart-bar"></i> '+ this.reportFormtitle + ' Report',
      tabUrl: reportUrl,
      tabOpen: 1
    };
    this._iframeCom.setIframe(tabVal);
  }
}
