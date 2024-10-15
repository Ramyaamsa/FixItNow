import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';
import { SettingService } from '../../shared_services/setting-service'; 
declare var $: any;

@Component({
  selector: 'app-spare-mail',
  templateUrl: './spare-mail.component.html',
  styleUrls: ['./spare-mail.component.css']
})

export class SpareMailComponent {

  spareMailLists :any = [];
  departmentLists :any = [];
  departmentId = "";
  departmentName = "";
  spareMailId = "";
  fromMail = "";
  toMail ="";
  fromMailPassword = "";
  mailSubject = "";
  mailMessage = "";

  constructor(private router: Router,private masterService:MasterService,private settingservice:SettingService){}

  ngOnInit() {
    $('.select2').chosen();
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })

    this.getSpareMailList();
  }

  getSpareMailList(){
    const startTime = Date.now();
    this.settingservice.getSpareMailList(this.spareMailLists).subscribe(res =>{
      if(res.length > 0){
        if(res[0].is_error == true){
          alert(res[0].message);
        }else{
          this.spareMailLists = res[0].spare_mail_Lists;
          const endTime = Date.now();
          var responseTime = Math.round((endTime - startTime) / 1000);
          setTimeout(function () {
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
      }
    })

    this.masterService.getDepartmentList(this.departmentLists).subscribe(res =>{
      if(res.length > 0){
        if(res[0].is_error == true){
          alert(res[0].message);
        }else{
          this.departmentLists = res[0].departmentLists;
          setTimeout(() => {
            $('#department_id').chosen('destroy');
            $('#department_id').chosen();
          }, 50);
        }
      }
    })
  }
  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }

  saveMail(){
    this.spareMailId = (document.getElementById('auto_mail_id') as HTMLInputElement).value;
    this.departmentId = (document.getElementById('department_id') as HTMLInputElement).value;
    this.fromMail = (document.getElementById('from_mail') as HTMLInputElement).value;
    // this.toMail = (document.getElementById('to_mail') as HTMLInputElement).value;
    this.fromMailPassword = (document.getElementById('from_mail_password') as HTMLInputElement).value;
    this.mailSubject = (document.getElementById('mail_subject') as HTMLInputElement).value;
    this.mailMessage = (document.getElementById('mail_message') as HTMLInputElement).value;

    if (this.fromMail != '') {
      var pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
      if (!pattern.test(this.fromMail)) {
        alert('Enter valid E-mail address');
        return;
      }
    }

    const newmail = new FormData();
    newmail.append('spare_mail_id', this.spareMailId);
    newmail.append('from_mail', this.fromMail);
    // newmail.append('to_mail', this.toMail);
    newmail.append('from_mail_password', this.fromMailPassword);
    newmail.append('mail_subject', this.mailSubject);
    newmail.append('mail_message', this.mailMessage);
    newmail.append('department_id', this.departmentId);

    this.settingservice.saveSpareMailList(newmail).subscribe(res =>{
      if(res.is_error == true){
        this.masterService.toastdata(res.message,'error');
      }else{
        if(this.spareMailId == ''){
          this.masterService.toastdata('Spare Mail Saved Successfully...' ,'success');
        }else{
          this.masterService.toastdata('Spare Mail Updated Successfully...' ,'success');
        }
        setTimeout(() => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            location.replace(location.href);
          });
        }, 2000);
      }
    })
  }
  editMail(mail:any):void{
    this.spareMailId =mail.id;
    this.departmentId =mail.department_id;
    this.fromMail =mail.from_mail;
    this.toMail = mail.to_mail;
    this.fromMailPassword =mail.from_mail_password;
    this.mailSubject =mail.mail_subject;
    this.mailMessage =mail.mail_message;
    $('#department_id').val(this.departmentId).trigger('chosen:updated').trigger('change');
  }
}
