import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { SettingService } from '../../shared_services/setting-service';
import { CommonService } from '../../shared_services/common.service';
import { ReportService } from '../../shared_services/report.service';
declare var $: any;

@Component({
  selector: 'app-report-template',
  templateUrl: './report-template.component.html',
  styleUrls: ['./report-template.component.css']
})
export class ReportTemplateComponent {
  template: boolean = false;

  masterOperation: any = [];
  templateName: any = '';
  createdOn: any = '';
  modifiedOn: any = '';
  createdBy: any = '';
  modifiedBy: any = '';
  reportTemplateLists: any = [];
  reportTypeLists: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  locationList: any = [];
  departmentList: any = [];
  assetGroupList: any = [];
  assetList: any = [];
  breakdownCategoryList: any = [];
  breakdownList: any = [];
  reportFields: any = [];
  reportFieldOptions: any = [];

  login_id: any = '';
  templateId: any = '';
  company_id: any = '';
  bu_id: any = '';
  plant_id: any = '';
  department_id: any = '';
  asset_group_id: any = '';
  location_id: any = '';
  asset_id: any = '';
  group_by: any = '';
  breakdownCategoryId: any = '';
  breakdownId: any = '';
  report_type: any = '';
  field_code: any = '';
  isCsv: boolean = false;
  isPdf: boolean = false;
  isExcel: boolean = false;
  constructor(private commonService: CommonService, private masterService: MasterService, private settingService: SettingService,
    private reportservice: ReportService) { }

  ngOnInit() {
    this.login_id = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.department_id = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');

    this.masterOperation = this.settingService.masterOperation(30, this.login_id);
    $('.select2').chosen();
    $('.datepicker').datepicker({
      format: 'dd-mm-yyyy',
      endDate: '+0d',
      autoclose: true,
      orientation: 'bottom right'
    });
    $('.multi-select').select2();
    $(".multiselect").bsMultiSelect({
      cssPatch: {
        choices: {
          columnCount: '3'
        },
      }
    });

    this.getCompanyList();
    this.getReportTemplateList();

    $('#report_name').change(() => {
      this.getReportFields();
    });

    $('#report_type').change(() => {
      this.getReportFields();
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
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id, department_id)
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

  showtemplate() {
    this.template = !this.template
  }

  getReportTemplateList() {
    const startTime = Date.now();
    const formData = new FormData;
    formData.append('company_id', this.company_id)
    formData.append('bu_id', this.bu_id)
    formData.append('plant_id', this.plant_id)
    this.settingService.getReportTemplateLists(formData).subscribe((data: any) => {
      if (data.iserror) {
        this.masterService.toastdata(data.message, 'error')
      } else {
        this.reportTemplateLists = data.template_Lists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);

        setTimeout(function () {
          $('#report_dataTable').DataTable({
            "paging": true,
            "retrieve": true,
            "lengthChange": true,
            "searching": true,
            "ordering": true,
            "info": true
          });
        }, responseTime);
      }
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
              $("#breakdown_category_name").val(this.breakdownCategoryId);
              this.getBreakdownSubcategoryList(this.company_id, this.bu_id, this.plant_id, this.department_id, this.asset_group_id, this.breakdownCategoryId);
            }
            $("#breakdown_category_name").chosen();
          }, 50);
        }
      });
    }
  }

  getBreakdownSubcategoryList(company_id: any, bu_id: any, plant_id: any, department_id: any, assetGroupId: any, breakdownCategoryId: any) {
    const breakdownsubCategoryForm = new FormData;
    breakdownsubCategoryForm.append('company_id', company_id);
    breakdownsubCategoryForm.append('bu_id', bu_id);
    breakdownsubCategoryForm.append('plant_id', plant_id);
    breakdownsubCategoryForm.append('asset_group_id', assetGroupId);
    breakdownsubCategoryForm.append('breakdown_category_id', breakdownCategoryId);
    breakdownsubCategoryForm.append('breakdown_sub_category_id', '');
    breakdownsubCategoryForm.append('status', 'active');
    this.masterService.getBreakdownAssign(breakdownsubCategoryForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.breakdownList = res[0].breakdown_categoryLists;
        $("#breakdown_name").chosen('destroy');
        setTimeout(() => {
          $("#breakdown_name").attr('disabled', true);
          $("#breakdown_name").val(this.breakdownId);
        }, 1000);
        $("#breakdown_name").chosen();
      }
    })
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
        $("#location_name").val(this.location_id).trigger('change');
        $("#location_name").chosen();
      }, 50);
    } else {
      const locationForm = new FormData;
      locationForm.append('company_id', company_id);
      locationForm.append('bu_id', bu_id);
      locationForm.append('plant_id', plant_id);
      locationForm.append('department_id', department_id);
      // locationForm.append('location_id', this.location_id);
      locationForm.append('status', 'active');
      this.masterService.getLocationList(locationForm).subscribe((res: any) => {
        if (res[0].is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.locationList = res[0].locationLists;
          setTimeout(() => {
            $('#location_name').chosen('destroy');
            if (this.location_id != '') {
              // $("#location_name").attr('disabled', true);
              $("#location_name").val(this.location_id);
            }
            $('#location_name').chosen();
          }, 50);
        }
      });
    }
  }

  getAssetGroupList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any = []) {
    const assetGroupForm = new FormData;
    assetGroupForm.append('company_id', company_id);
    assetGroupForm.append('bu_id', bu_id);
    assetGroupForm.append('plant_id', plant_id);
    assetGroupForm.append('department_id', department_id);
    assetGroupForm.append('location_id', location_id);
    // assetGroupForm.append('asset_group_id', this.asset_group_id);/
    assetGroupForm.append('status', 'active');
    this.masterService.getAssetGroupList(assetGroupForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetGroupList = res[0].asset_groupLists;
        setTimeout(() => {
          $('#asset_group_name').chosen('destroy');
          if (this.asset_group_id != '') {
            // $("#asset_group_name").attr('disabled', true);
            $("#asset_group_name").val(this.asset_group_id);
          }
          $('#asset_group_name').chosen();
        }, 50);
      }
    });
    // }
  }

  getAssetList(company_id: any, bu_id: any, plant_id: any, department_id: any, location_id: any, asset_group_id: any) {
    const assetForm = new FormData;
    assetForm.append('company_id', company_id);
    assetForm.append('bu_id', bu_id);
    assetForm.append('plant_id', plant_id);
    assetForm.append('department_id', department_id);
    assetForm.append('location_id', location_id);
    // assetForm.append('asset_group_id', asset_group_id);
    assetForm.append('status', 'active');
    this.masterService.getAssetList(assetForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.assetList = res[0].assetLists;
        setTimeout(() => {
          $("#asset_name").select2('destroy');
          if (this.asset_id != '') {
            // $("#asset_name").attr('disabled', true);
            $("#asset_name").val(this.asset_id);
          }
          $("#asset_name").select2();
        }, 50);
      }
    });
    // }

  }

  getReportFields() {
    var report = $('#report_name').val();
    var id = report;/* 
    var report_type = $('#report_type').val();
    if (report_type == 'summary') {
      if (report == "1") {
        id = 2;
      } else if (report == "7") {
        id = 15;
      } else if (report == "13") {
        id = 14;
      }
    } */
    const reportId = new FormData();
    reportId.append('report_id', id);
    this.reportservice.getReportFields(reportId).subscribe((res: any) => {
      if (res[0].is_error) {
        alert(res[0].message)
      } else {
        this.reportFields = res[0].get_report_fields;
        setTimeout(() => {
          $("#rpt_fields").bsMultiSelect("UpdateData");
          $("#rpt_fields").trigger("change");
          $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
          $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
        }, 50);
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

  saveReportTemplate() {
    var report_id = (document.getElementById('report_name') as HTMLSelectElement).value;
    var reportName: any = (document.getElementById('report_name') as HTMLSelectElement).options;
    reportName = reportName[reportName.selectedIndex].text;
    var company_id = (document.getElementById('company_name') as HTMLSelectElement).value;
    var bu_id = (document.getElementById('bu_name') as HTMLSelectElement).value;
    var plant_id = (document.getElementById('plant_name') as HTMLSelectElement).value;
    var department_id = (document.getElementById('department_name') as HTMLSelectElement).value;
    var location_id = (document.getElementById('location_name') as HTMLSelectElement).value;
    var equipment_group_id = (document.getElementById('asset_group_name') as HTMLSelectElement).value;
    var equipment_name = $('#asset_name').val();
    var group_by = (document.getElementById('group_by') as HTMLSelectElement).value;
    var report_type = (document.getElementById('report_type') as HTMLSelectElement).value;
    // var main_loss_id = (document.getElementById('main_loss_id') as HTMLSelectElement).value;
    // var sub_loss_id = (document.getElementById('sub_loss_id') as HTMLSelectElement).value;
    var is_csv = (document.getElementById('report_csv') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_pdf = (document.getElementById('report_pdf') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_excel = (document.getElementById('report_excel') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var field_code = $('#rpt_fields').val();

    var cri: any = {};
    cri['company_id'] = company_id;
    cri['bu_id'] = bu_id;
    cri['plant_id'] = plant_id;
    cri['department_id'] = department_id;
    cri['location_id'] = location_id;
    cri['asset_group_id'] = equipment_group_id;
    cri['asset_id'] = equipment_name;
    // cri['breakdown_category_id'] = $('#breakdown_category_name').val();
    // cri['breakdown_subcategory_id'] = $('#breakdown_sub_category_name').val();
    cri['group_by'] = group_by;
    cri['report_type'] = report_type;
    cri['field_code'] = field_code;

    if ($('#report_template_form').valid()) {
      if (is_csv == 'no' && is_pdf == 'no' && is_excel == 'no') {
        this.masterService.toastdata('Kindly Choose any of the File Type', 'error')
      } else {
        const formData = new FormData();
        formData.append('template_id', this.templateId)
        formData.append('company_id', company_id)
        formData.append('bu_id', bu_id)
        formData.append('plant_id', plant_id)
        formData.append('template_name', this.templateName)
        formData.append('report_id', report_id)
        formData.append('report_name', reportName)
        formData.append('sub_report', '')
        formData.append('report_filters', JSON.stringify(cri))
        formData.append('is_csv', is_csv)
        formData.append('is_pdf', is_pdf)
        formData.append('is_excel', is_excel)
        formData.append('user_login_id', this.login_id)

        this.settingService.saveReportTemplate(formData).subscribe((data: any) => {
          if (data.iserror) {
            this.commonService.toastdata(data.message, 'error');
          } else {
            this.masterService.toastdata(data.message, 'success');
            this.commonService.reloadComponent('panel-iframe-activity-report_template');
          }
        })
      }
    }
  }

  editReportTemplate(list: any) {
    this.template = !this.template;
    this.templateId = list.template_id;
    this.templateName = list.template_name;
    this.createdOn = list.created_on.replace('T', ' ');
    this.createdBy = list.created_user;
    this.modifiedOn = list.modified_on.replace('T', ' ');
    this.modifiedBy = list.modified_user;
    this.isCsv = list.is_csv == 'yes' ? true : false;
    this.isPdf = list.is_pdf == 'yes' ? true : false;
    this.isExcel = list.is_excel == 'yes' ? true : false;

    (document.getElementById('report_name') as HTMLSelectElement).disabled = true;
    $('#report_name').val(list.report_id).trigger('chosen:updated').trigger('change');

    var report_filters = JSON.parse(list.report_filters);

    for (const key in report_filters) {
      if (key == 'company_id') {
        this.company_id = report_filters[key];
      }
      else if (key == 'bu_id') {
        this.bu_id = report_filters[key];
      }
      else if (key == 'plant_id') {
        this.plant_id = report_filters[key];
      }
      else if (key == 'department_id') {
        this.department_id = report_filters[key];
      }
      else if (key == 'location_id') {
        this.location_id = report_filters[key];
      }
      else if (key == 'asset_group_id') {
        this.asset_group_id = report_filters[key];
      }
      else if (key == 'asset_id') {
        this.asset_id = report_filters[key];
      }
      else if (key == 'group_by') {
        $('#group_by').val(report_filters[key]).trigger('chosen:updated');
      }
      else if (key == 'report_type') {
        this.report_type = report_filters[key];
      } else if (key == 'field_code') {
        this.field_code = report_filters[key];
        setTimeout(() => {
          $("#rpt_fields").val(this.field_code);
          $("#rpt_fields").bsMultiSelect("UpdateData");
          $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="deselect_all"> Deselect All </p>');
          $('#rpt_fields').next().children('.dropdown-menu').children().prepend('<p class="select_all"> Select All </p>');
        }, 2000);
      }
    }

    $("#company_name").val(this.company_id).trigger('chosen:updated').trigger('change');
    $('#report_type').val(this.report_type).trigger('chosen:updated').trigger('change');
  }

  templateStatus(id: any, status: any) {
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

  cancel() {
    this.commonService.reloadComponent('panel-iframe-activity-report_template');
  }
}
