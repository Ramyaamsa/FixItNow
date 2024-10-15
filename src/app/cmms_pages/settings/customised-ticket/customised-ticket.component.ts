import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { SettingService } from '../../shared_services/setting-service';
import { CommonService } from '../../shared_services/common.service';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any;

@Component({
  selector: 'app-customised-ticket',
  templateUrl: './customised-ticket.component.html',
  styleUrls: ['./customised-ticket.component.css']
})

export class CustimisedTicket {
  customWOList: any = [];
  customId: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  masterOperation: any = [];
  
  customisedTicketId = "";
  companyId: any = '';
  buId: any = '';
  plantId: any = '';
  workorderType: any = '';
  loginId: any = '';
  constructor(private spinner: NgxSpinnerService, private masterService: MasterService, private settingService: SettingService, private commonService: CommonService) { }

  ngOnInit() {
    $('.select2').chosen();
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');

    this.masterOperation = this.settingService.masterOperation(32, this.loginId);

    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" });
    this.getCompanyList();
    this.getCustomWoList();

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

  getCustomWoList() {
    const startTime = Date.now();
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('bu_id', this.buId);
    userForm.append('plant_id', this.plantId);
    this.settingService.getCustomWo(userForm).subscribe((res: any) => {
      if (res.is_error) {
        this.commonService.toastdata(res.message, 'error');
      } else {
        this.customWOList = res[0].customized_ticket_noLists;
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
              $("#plant_name").val(this.plantId);
            }
            $("#plant_name").chosen();
          }, 50);
        }
      });
    }
  }

  saveCustomizeWo() {
    this.spinner.show();
    this.companyId = $('#company_name').val();
    this.buId = $('#bu_name').val();
    this.plantId = $('#plant_name').val();
    this.customisedTicketId = (document.getElementById('ticket_no_prefix') as HTMLInputElement).value;
    this.workorderType = (document.getElementById('wo_type') as HTMLInputElement).value;

    const newid = new FormData();
    newid.append('id', this.customId);
    newid.append('company_id', this.companyId);
    newid.append('bu_id', this.buId);
    newid.append('plant_id', this.plantId);
    newid.append('work_order_type', this.workorderType);
    newid.append('prefix_of_ticket_no', this.customisedTicketId);
    newid.append('user_login_id', this.loginId);

    this.settingService.saveCustomisedTicket(newid).subscribe(res => {
      if (res.is_error) {
        this.spinner.hide();
        this.masterService.toastdata(res.message, 'error');
      } else {
        this.spinner.hide();
        this.masterService.toastdata('Customised Ticket No Updated Successfully...', 'success');
        this.commonService.reloadComponent('panel-iframe-setting-customised_ticket');
      }
    })
  }

  editCustomWo(list: any) {
    this.customId = list.id;
    this.companyId = list.company_id;
    this.buId = list.bu_id;
    this.plantId = list.plant_id;
    $('#wo_type').attr('disabled', true);
    $('#wo_type').val(list.work_order_type).trigger('chosen:updated');
    $('#company_name').attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');
    this.getBuList(this.companyId);
    this.getPlantList(this.companyId, this.buId);
    $('#ticket_no_prefix').val(list.prefix_of_ticket_no)
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-setting-customised_ticket');
  }
}
