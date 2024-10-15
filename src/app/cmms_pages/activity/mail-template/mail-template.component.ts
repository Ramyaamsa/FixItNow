import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { SettingService } from '../../shared_services/setting-service';
import { CommonService } from '../../shared_services/common.service';
declare var $: any;

@Component({
  selector: 'app-mail-template',
  templateUrl: './mail-template.component.html',
  styleUrls: ['./mail-template.component.css']
})
export class MailTemplateComponent {
  isMailDtlShow: boolean = false;
  masterOperation: any = [];
  companyList: any = [];
  plantList: any = [];
  branchList: any = [];
  mailTemplateLists: any = [];
  reportTemplateLists: any = [];
  breakdownTemplateList: any = [];
  pmTemplateList: any = [];
  spareTemplateList: any = [];
  defectTemplateList: any = [];
  mailId: any = '';
  login_id: any = '';
  company_id: any = '';
  bu_id: any = '';
  plant_id: any = '';
  createdOn: any = '';
  modifiedOn: any = '';
  createdBy: any = '';
  modifiedBy: any = '';
  template_id: any = [];
  isShift: boolean = false;
  isDaily: boolean = false;
  isWeek: boolean = false;
  isMonth: boolean = false;
  isYear: boolean = false;

  constructor(private commonService: CommonService, private masterService: MasterService, private settingService: SettingService) { }

  ngOnInit() {
    this.login_id = localStorage.getItem('employee_id');
    this.company_id = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.bu_id = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plant_id = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

    this.masterOperation = this.settingService.masterOperation(28, this.login_id);
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#mail_template_form").validate();
    $('#mail_content').summernote();

    $('.select2').chosen();
    $('.multi-select').select2();
    this.getMailLists();
    this.getCompanyList();

    $('#company_name').change(() => {
      this.getBuList($('#company_name').val());
      this.getReportTemplateLists();
    });

    $('#bu_name').change(() => {
      this.getPlantList($('#company_name').val(), $('#bu_name').val());
    });
  }

  mailShow() {
    this.isMailDtlShow = true;
  }

  dropTemplate(event: any, div_id: any) {
    $('#' + div_id).toggle('slow');
    var icon = $(event.currentTarget).find('i').eq(1);
    if (icon.hasClass('fa-caret-down')) {
      icon.removeClass('fa-caret-down');
      icon.addClass('fa-caret-up');
    } else {
      icon.removeClass('fa-caret-up');
      icon.addClass('fa-caret-down');
    }
  }

  getMailLists() {
    const startTime = Date.now();
    const formData = new FormData;
    formData.append('company_id', this.company_id)
    formData.append('bu_id', this.bu_id)
    formData.append('plant_id', this.plant_id)
    this.settingService.getMailLists(formData).subscribe((data: any) => {
      if (data.is_error) {
        this.commonService.toastdata(data.message, 'error')
      } else {
        this.mailTemplateLists = data.mail_Lists;
        const endTime = Date.now();
        var responseTime = Math.round((endTime - startTime) / 1000);

        setTimeout(function () {
          $('#mail_dataTable').DataTable({
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
            this.getBuList(this.company_id);
          }
          $('#company_name').chosen();
        }, 50);
      }
    });
  }

  getBuList(company_id: any) {
    if (company_id == '') {
      this.branchList = [];
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
          this.branchList = res[0].buLists;
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
            }
            $("#plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  getReportTemplateLists() {
    var company_id = (document.getElementById('company_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('company_name') as HTMLSelectElement).value
    var bu_id = (document.getElementById('bu_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('bu_name') as HTMLSelectElement).value
    var plant_id = (document.getElementById('plant_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('plant_name') as HTMLSelectElement).value

    const formData = new FormData;
    formData.append('company_id', '')
    formData.append('bu_id', '')
    formData.append('plant_id', '')
    this.settingService.getReportTemplateLists(formData).subscribe((data: any) => {
      if (data.is_error) {
        this.commonService.toastdata(data.message, 'error')
      } else {
        this.reportTemplateLists = data.template_Lists;
        this.breakdownTemplateList = this.reportTemplateLists.filter((template: any) => (template.report_id == '2' && template.company_id == company_id));
        this.pmTemplateList = this.reportTemplateLists.filter((template: any) => (template.report_id == '15' && template.company_id == company_id));
        this.spareTemplateList = this.reportTemplateLists.filter((template: any) => (template.report_id == '14' && template.company_id == company_id));

        setTimeout(() => {
          if (this.template_id != '') {
            for (var i = 0; i < this.template_id.length; i++) {
              $('#template_check_' + this.template_id[i]).prop("checked", true);
            }
          }
        }, 3000);
      }
    });
  }

  saveMailTemplate() {
    this.template_id = [];
    this.reportTemplateLists.forEach((element: any) => {
      if ($('#template_check_' + element.template_id).is(':checked')) {
        this.template_id.push(element.template_id);
      }
    });
    var company_id = (document.getElementById('company_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('company_name') as HTMLSelectElement).value;
    var bu_id = (document.getElementById('bu_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('bu_name') as HTMLSelectElement).value;
    var plant_id = (document.getElementById('plant_name') as HTMLSelectElement).value == 'all' ? '' : (document.getElementById('plant_name') as HTMLSelectElement).value;
    var to_mail = (document.getElementById('to_mail') as HTMLTextAreaElement).value;
    var cc_mail = (document.getElementById('cc_mail') as HTMLTextAreaElement).value;
    var subject = (document.getElementById('subject') as HTMLInputElement).value;
    var mail_content = (document.getElementById('mail_content') as HTMLTextAreaElement).value;
    var is_shift = (document.getElementById('period_shift') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_daily = (document.getElementById('period_daily') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_weekly = (document.getElementById('period_weekly') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_monthly = (document.getElementById('period_monthly') as HTMLInputElement).checked == true ? 'yes' : 'no';
    var is_yearly = (document.getElementById('period_yearly') as HTMLInputElement).checked == true ? 'yes' : 'no';

    if ($('#mail_template_form').valid()) {
      if (this.template_id == '') {
        this.commonService.toastdata('Kindly choose any one of the Report Template', 'error');
      } else if (is_shift == 'no' && is_daily == 'no' && is_weekly == 'no' && is_monthly == 'no' && is_yearly == 'no') {
        this.commonService.toastdata('Kindly choose any one of the Schedule Type', 'error');
      } else {
        const formData = new FormData;
        formData.append('mail_id', this.mailId);
        formData.append('template_id', this.template_id);
        formData.append('company_id', company_id);
        formData.append('bu_id', bu_id);
        formData.append('plant_id', plant_id);
        formData.append('to_mail', to_mail);
        formData.append('cc', cc_mail);
        formData.append('subject', subject);
        formData.append('content', mail_content);
        formData.append('is_shift', is_shift);
        formData.append('is_daily', is_daily);
        formData.append('is_weekly', is_weekly);
        formData.append('is_monthly', is_monthly);
        formData.append('is_yearly', is_yearly);
        formData.append('user_login_id', this.login_id);

        this.settingService.saveMailList(formData).subscribe((data: any) => {
          if (data.iserror) {
            this.commonService.toastdata(data.message, 'error');
          } else {
            this.commonService.toastdata(data.message, 'success');
            this.commonService.reloadComponent('panel-iframe-activity-mail_template');
          }
        })
      }
    }
  }

  editMailTemplate(list: any) {
    this.isMailDtlShow = true;
    this.mailId = list.mail_id;
    this.createdBy = list.created_user;
    this.createdOn = list.created_on.replace('T', ' ');
    this.modifiedBy = list.modified_user;
    this.modifiedOn = list.modified_on.replace('T', ' ');
    this.company_id = list.company_id;
    this.bu_id = list.bu_id;
    this.plant_id = list.plant_id;
    (document.getElementById('to_mail') as HTMLTextAreaElement).value = list.to_mail;
    (document.getElementById('cc_mail') as HTMLTextAreaElement).value = list.cc;
    (document.getElementById('subject') as HTMLInputElement).value = list.subject;
    (document.getElementById('mail_content') as HTMLTextAreaElement).value = list.content;
    $('.note-editable').html(list.content);
    this.isShift = list.is_shift == 'yes' ? true : false;
    this.isDaily = list.is_daily == 'yes' ? true : false;
    this.isWeek = list.is_weekly == 'yes' ? true : false;
    this.isMonth = list.is_monthly == 'yes' ? true : false;
    this.isYear = list.is_yearly == 'yes' ? true : false;
    this.template_id.push(list.template_id);
    if (this.template_id.length == 1) {
      this.template_id = this.template_id;
    } else {
      this.template_id = list.template_id.split(',')
    }

    $('#company_name').val(this.company_id).trigger('chosen:updated');
    this.getReportTemplateLists();
    this.getBuList(this.company_id);
  }


  mailTemplateStatus(id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }
    const formData = new FormData();
    formData.append('mail_id', id);
    formData.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this Mail status?");
    } else {
      boolean = confirm("Do you want to delete this Mail?");
    }
    if (boolean) {
      this.settingService.changeStatusMailList(formData).subscribe((res: any) => {
        if (res.iserror) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-activity-mail_template');
        }
      })
    }
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-activity-mail_template');
  }
}