import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../../shared_services/master.service';

declare var $: any;

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css']
})
export class DesignationComponent {
  showCard1: boolean = false;
  designationLists:any =[];
  companyLists:any =[];
  buLists:any =[];
  plantLists:any =[];
  company_id = "";
  bu_id = "";
  plant_id = "";
  designation_id = "";
  designation_code = "";
  designation_name = "";
  designation_type = "";
  created_on:any= "";
  modified_on:any = "";
  created_by = "";
  modified_by = "";
  user_login_id:any= [];

  constructor( private router: Router,private masterService:MasterService) {}
  ngOnInit() {
    $('.select2').chosen();
    $.validator.setDefaults({ ignore: ":hidden:not(select)" })
    $("#designation_master_form").validate();
    setTimeout(function () {
      $('#dataTable').DataTable({ 
        "paging": true,
        "lengthChange": true,
        "searching": true,
        "ordering": true,
        "info": true,
      });
    }, 500);
    // this.getlocationLists();
    this.masterService.getCompanyList(this.companyLists).subscribe((res: any) => {
      if (res.length > 0) {
        if (res[0].is_error == false) {        
          this.companyLists = res[0].companyLists.filter((company: any) => company.status === 'active');
          setTimeout(() => {
            $('#company_name').chosen('destroy');
            $('#company_name').chosen();
          }, 50);
        }
        else {
          alert(res[0].message)
        }
      }
    });

    $('#company_name').change(() => {
      var company_id = $("#company_name").val();
      if (company_id == '') {
        this.buLists = [];
        setTimeout(() => {
          $('#bu_name').chosen('destroy');
          $("#bu_name").val(this.bu_id).trigger('chosen: updated');
          $('#bu_name').chosen();
        }, 50);
      } else {
        this.masterService.getBuList(this.buLists).subscribe((res: any) => {
          if (res.length > 0) {
            if (res[0].is_error == true) {
              alert(res[0].message);
            } else {
              this.buLists = res[0].buLists.filter((bu: any) => bu.company_id == company_id && bu.status === 'active');
              setTimeout(() => {
                $('#bu_name').chosen('destroy');
                $("#bu_name").val(this.bu_id).trigger('change');
                $('#bu_name').chosen();
              }, 50);
            }
          }
        });
      }
    });

    $('#bu_name').change(()=>{
      var bu_id = $('#bu_name').val();
      if(bu_id == ''){
        this.plantLists = [];
        setTimeout(() => {
          $('#plant_name').chosen('destroy');
          $("#plant_name").val(this.plant_id).trigger('chosen: updated');
          $('#plant_name').chosen();
        }, 50);
      }else{
        this.masterService.getPlantList(this.plantLists).subscribe(res =>{
          if (res.length > 0) {
            if(res[0].is_error == true){
              alert(res[0].message);
            }else{
              this.plantLists = res[0].plantLists.filter((plant:any) => plant.bu_id == bu_id && plant.status === 'active');
              setTimeout(() => {
                $('#plant_name').chosen('destroy');
                $("#plant_name").val(this.plant_id).trigger('change');
                $('#plant_name').chosen();
              }, 50);
            }
          }
        })
      }
    });
  }

  openRights() {
    this.showCard1 = !this.showCard1;
  }

  cancel() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      location.replace(location.href);
    });
  }

  saveDesignation(){
    this.designation_name = (document.getElementById('designation_name') as HTMLInputElement).value;
    this.designation_code = (document.getElementById('designation_code') as HTMLInputElement).value;
    this.designation_type = (document.getElementById('designation_type') as HTMLInputElement).value;
    this.company_id = (document.getElementById('company_name') as HTMLInputElement).value;
    this.bu_id = (document.getElementById('bu_name') as HTMLInputElement).value;
    this.plant_id = (document.getElementById('plant_name') as HTMLInputElement).value;
    this.user_login_id = [localStorage.getItem('employee_id')];

    const newdesignation = new FormData();
    newdesignation.append('designation_name', this.designation_name);
    newdesignation.append('designation_code', this.designation_code);
    newdesignation.append('designation_type', this.designation_type);
    newdesignation.append('company_id', this.company_id);
    newdesignation.append('bu_id', this.bu_id);
    newdesignation.append('plant_id', this.plant_id);
    newdesignation.append('user_login_id', this.user_login_id);

    this.masterService.savenewdesignation(newdesignation).subscribe(res=>{
      if(res.is_error == true){
        this.masterService.toastdata(res.message,'error');
      }else{
        this.masterService.toastdata('Designation Saved Successfully...' ,'success');
        setTimeout(() => {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            location.replace(location.href);
          });
        }, 2000);
      }
    })
  }
}
