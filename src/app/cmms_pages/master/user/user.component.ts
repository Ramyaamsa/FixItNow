import { Component } from '@angular/core';
import { MasterService } from '../../shared_services/master.service';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../shared_services/common.service';
import { SettingService } from '../../shared_services/setting-service';

declare var $: any;
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  userDtl: boolean = false;
  listView: boolean = false;

  userLists: any = [];
  companyList: any = [];
  buList: any = [];
  plantList: any = [];
  departmentList: any = [];
  locationList: any = [];
  masterOperation: any = [];

  createdOn: any = "";
  modifiedOn: any = "";
  createdBy: any = "";
  modifiedBy: any = "";
  companyId: any = "";
  buId: any = "";
  plantId: any = "";
  departmentId: any = "";
  locationId: any = "";
  userId: any = "";
  userCode: any = "";
  userName: any = "";
  userGender: any = "";
  employeeType: any = "";
  userEmail: any = "";
  userMobile: any = "";
  userSkill: any = "";
  userAddress: any = "";
  loginPassword: any = "";
  employeeImage: any = "";
  employeeImageOld: any = "placeholder.jpg";
  userImage: any = "assets/images/placeholder.gif";
  modelImage: any = "assets/images/placeholder.gif";
  isLogin: boolean = true;
  isEngineer: boolean = false;
  loginId: any = [];
  isUserLimit: boolean = false;

  constructor(private commonService: CommonService, private masterService: MasterService, private datePipe: DatePipe, private settingService: SettingService) { }
  ngOnInit() {
    this.loginId = localStorage.getItem('employee_id');
    this.companyId = localStorage.getItem('company_id') == '0' ? '' : localStorage.getItem('company_id');
    this.buId = localStorage.getItem('bu_id') == '0' ? '' : localStorage.getItem('bu_id');
    this.plantId = localStorage.getItem('plant_id') == '0' ? '' : localStorage.getItem('plant_id');
    this.departmentId = localStorage.getItem('department_id') == '0' ? '' : localStorage.getItem('department_id');
    this.locationId = localStorage.getItem('location_id') == '0' ? '' : localStorage.getItem('location_id');
    var usertype = (localStorage.getItem('employee_type'));

    this.masterOperation = this.settingService.masterOperation(10, this.loginId);

    $.validator.setDefaults({ ignore: ":hidden:not(select, input)" });
    $("#employee_form").validate();

    if (usertype == "Super Admin") {
      $('#designation option[value="Admin"]').show();
      $('#designation').chosen('destroy');
      $('#designation').chosen();
    } else {
      $('#designation option[value="Admin"]').hide();
      $('#designation').chosen('destroy');
      $('#designation').chosen();
    }

    $("#password_show").change((e: any) => {
      if ($(e.currentTarget).is(':checked')) {
        $("#password").attr('type', 'text');
        $("#password_icon").removeClass('fa-eye');
        $("#password_icon").addClass('fa-eye-slash');
      } else {
        $("#password").attr('type', 'password');
        $("#password_icon").removeClass('fa-eye-slash');
        $("#password_icon").addClass('fa-eye');
      }
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

    $('#designation').on('change', () => {
      this.showUserLevel()
    });

    $('.select2').chosen();

    this.commonService.upperCase();
    this.commonService.numericOnly();
    this.getUserCount();
    this.getUserList();
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
      this.getDepartmentList(company_id, bu_id, plant_id);
    });

    $('#department_name').change(() => {
      var company_id = $('#company_name').val();
      var bu_id = $('#bu_name').val();
      var plant_id = $('#plant_name').val();
      var department_id = $('#department_name').val();
      this.getLocationList(company_id, bu_id, plant_id, department_id);
    });
  }

  textWrap() {
    $('#dataTable th, #dataTable td').toggleClass('full-content');
  }

  showUserLevel() {
    var user_type = $('#designation').val();
    if (this.userId == '') {
      this.isEngineer = false;
    }
    if (user_type == 'Company Head' || user_type == 'Admin') {
      $('#bu_div').hide();
      $('#plant_div').hide();
      $('#department_div').hide();
      $('#location_div').hide();

      $('#bu_name').removeClass('required');
      $('#plant_name').removeClass('required');
      $('#department_name').removeClass('required');
      $('#location_name').removeClass('required');
    } else if (user_type == 'BU Head') {
      $('#bu_div').show();
      $('#plant_div').hide();
      $('#department_div').hide();
      $('#location_div').hide();

      $('#bu_name').addClass('required');
      $('#plant_name').removeClass('required');
      $('#department_name').removeClass('required');
      $('#location_name').removeClass('required');
    } else if (user_type == 'Plant Head') {
      $('#bu_div').show();
      $('#plant_div').show();
      $('#department_div').hide();
      $('#location_div').hide();

      $('#bu_name').addClass('required');
      $('#plant_name').addClass('required');
      $('#department_name').removeClass('required');
      $('#location_name').removeClass('required');
    } else if (user_type == 'Location Head') {
      $('#bu_div').show();
      $('#plant_div').show();
      $('#department_div').show();
      $('#location_div').show();

      $('#bu_name').addClass('required');
      $('#plant_name').addClass('required');
      $('#department_name').addClass('required');
      $('#location_name').addClass('required');
    } else if (user_type == '') {
      $('#bu_div').hide();
      $('#plant_div').hide();
      $('#department_div').hide();
      $('#location_div').hide();
    } else {
      $('#bu_div').show();
      $('#plant_div').show();
      $('#department_div').show();
      $('#location_div').hide();

      $('#bu_name').addClass('required');
      $('#plant_name').addClass('required');
      $('#department_name').addClass('required');
      $('#location_name').removeClass('required');
      if (user_type == 'Engineer' && this.userId == '') {
        this.isEngineer = true;
      }
    }
  }

  /* For uppercase */
  convertToUpperCase() {
    this.userCode = this.userCode.toUpperCase();
  }

  getUserCount() {
    var loginDtl: any = localStorage.getItem('user_dtl');
    var userCount = JSON.parse(loginDtl)[0].users_count;
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('status', '');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        var userLists = res[0].employeeLists;
        var userLength = userLists.length;
        if (userLength >= userCount && userCount != 0) {
          this.isUserLimit = false;
        } else {
          this.isUserLimit = true;
        }
      }
    });
  }

  getUserList() {
    const startTime = Date.now();
    const userForm = new FormData;
    userForm.append('company_id', this.companyId);
    userForm.append('bu_id', this.buId);
    userForm.append('plant_id', this.plantId);
    userForm.append('department_id', this.departmentId);
    userForm.append('status', '');
    this.masterService.getUserList(userForm).subscribe((res: any) => {
      if (res[0].is_error) {
        this.commonService.toastdata(res[0].message, 'error');
      } else {
        this.userLists = res[0].employeeLists;
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
              this.getDepartmentList(company_id, bu_id, this.plantId)
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
        $("#department_name").val(this.departmentId).trigger('change');
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
        $("#location_name").val(this.locationId);
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
          }, 100);
        }
      });
    }
  }

  addEmployee() {
    this.userDtl = !this.userDtl;
  }

  cancel() {
    this.commonService.reloadComponent('panel-iframe-master-user');
  }

  saveEmployee() {
    if ($("#employee_form").valid()) {
      this.employeeType = (document.getElementById('designation') as HTMLInputElement).value;
      this.companyId = (document.getElementById('company_name') as HTMLInputElement).value;
      this.buId = (document.getElementById('bu_name') as HTMLInputElement).value;
      this.plantId = (document.getElementById('plant_name') as HTMLInputElement).value;
      this.departmentId = (document.getElementById('department_name') as HTMLInputElement).value;
      this.locationId = (document.getElementById('location_name') as HTMLInputElement).value;

      var employee_gender = $('input[name="employee_gender"]:checked').val();
      var is_login = this.isLogin == true ? 'yes' : 'no';
      var is_engineer = this.isEngineer == true ? 'yes' : 'no';

      const newemployee = new FormData();
      newemployee.append('employee_id', this.userId);
      newemployee.append('company_id', this.companyId);
      newemployee.append('bu_id', this.buId);
      newemployee.append('plant_id', this.plantId);
      newemployee.append('department_id', this.departmentId);
      newemployee.append('location_id', this.locationId);
      newemployee.append('designation_id', '');
      newemployee.append('employee_code', this.userCode);
      newemployee.append('employee_name', this.userName);
      newemployee.append('employee_type', this.employeeType);
      newemployee.append('employee_gender', employee_gender);
      newemployee.append('employee_email', this.userEmail);
      newemployee.append('employee_mobile', this.userMobile);
      newemployee.append('employee_skill', this.userSkill);
      newemployee.append('employee_address', this.userAddress);
      newemployee.append('is_login', is_login);
      newemployee.append('is_engineer', is_engineer);
      newemployee.append('user_name', this.userCode);
      newemployee.append('password_login', this.loginPassword);
      newemployee.append('employee_image_old', this.employeeImageOld);
      newemployee.append('employee_image', this.employeeImage);
      newemployee.append('user_login_id', this.loginId);

      this.masterService.saveUser(newemployee).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res.message, 'error');
        } else {
          this.commonService.toastdata('Employee Saved Successfully...', 'success');
          this.commonService.reloadComponent('panel-iframe-master-user');
        }
      });
    }
  }

  userUpload(event: any) {
    // var ext = event.target.files[0].type;
    // switch (ext) {
    //   case 'image/gif':
    //   case 'image/jpeg':
    //   case 'image/png':
    //   case 'image/jpg':

    //     if (event.target.files && event.target.files[0]) {
    //       this.employeeImage = event.target.files[0];
    //       $("#employee_image_name").html(this.employeeImage.name);
    //       const reader = new FileReader();
    //       reader.onload = (e: any) => {
    //         this.userImage = e.target.result;
    //       };
    //       reader.readAsDataURL(this.employeeImage);
    //       this.employeeImageOld = '';
    //     }
    //     break;
    //   default:
    //     alert('Please Choose Correct File Format')
    // }
    const file = event.target.files[0];
    const ext = file.type;

    switch (ext) {
      case 'image/gif':
      case 'image/jpeg':
      case 'image/png':
      case 'image/jpg':
        if (file) {
          const reader = new FileReader();

          reader.onload = (e: any) => {
            const image = new Image();
            image.onload = () => {
              const width = image.width;
              const height = image.height;

              if (width <= 1200 && height <= 600) {
                this.employeeImage = file;
                $("#employee_image_name").html(this.employeeImage.name);
                this.userImage = e.target.result;
                this.employeeImageOld = '';
              } else {
                alert('Please upload an image with resolution 300 x 250.');
              }
            };
            image.src = e.target.result;
          };

          reader.readAsDataURL(file);
        }
        break;
      default:
        alert('Please Choose Correct File Format');
    }
  }

  editEmployee(employeelist: any): void {
    this.userDtl = true;
    this.userId = employeelist.employee_id;
    this.employeeType = employeelist.employee_type;
    this.companyId = employeelist.company_id == '0' ? '' : employeelist.company_id;
    this.buId = employeelist.bu_id == '0' ? '' : employeelist.bu_id;
    this.plantId = employeelist.plant_id == '0' ? '' : employeelist.plant_id;
    this.departmentId = employeelist.department_id == '0' ? '' : employeelist.department_id;
    this.locationId = employeelist.location_id == '0' ? '' : employeelist.location_id;

    this.userName = employeelist.employee_name;
    this.userCode = employeelist.employee_code;
    this.userEmail = employeelist.employee_email;
    this.userMobile = employeelist.employee_mobile;
    this.userSkill = employeelist.employee_skill;
    this.userAddress = employeelist.employee_address;
    this.isLogin = employeelist.is_login == 'yes' ? true : false;
    this.isEngineer = employeelist.is_engineer == 'yes' ? true : false;
    this.loginPassword = employeelist.password_login;

    this.employeeImageOld = employeelist.employee_image;
    $("#employee_image_name").html(employeelist.employee_image);
    this.userImage = employeelist.employee_image_url;

    this.createdOn = this.datePipe.transform(employeelist.created_on, 'dd-MM-yyyy HH:mm:ss');
    this.createdBy = employeelist.created_user;
    this.modifiedOn = this.datePipe.transform(employeelist.modified_on, 'dd-MM-yyyy HH:mm:ss');
    this.modifiedBy = employeelist.modified_user;

    $('#employee_code').attr('disabled', true);
    if (employeelist.employee_gender == 'Male') {
      $("#employee_gender").attr('checked', true);
    } else {
      $("#employee_gender1").attr('checked', true);
    }

    $("#password").removeClass('required');
    $("#password").attr('disabled', true);

    $("#designation").attr('disabled', true);
    $("#designation").val(this.employeeType).trigger('chosen:updated');
    this.showUserLevel();

    $("#company_name").attr('disabled', true);
    $('#company_name').val(this.companyId).trigger('chosen:updated');

    if (this.companyId != 0) {
      this.getBuList(this.companyId);
    }
  }

  activeInactive(employee_id: any, status: any) {
    if (status == 'active') {
      status = 'inactive';
    } else if (status == 'inactive') {
      status = 'active';
    }

    const userstatus = new FormData();
    userstatus.append('employee_id', employee_id);
    userstatus.append('active_status', status);
    if (status != "delete") {
      var boolean = confirm("Do you want to change this User status?");
    } else {
      boolean = confirm("Do you want to delete this User?");
    }
    if (boolean) {
      this.masterService.changeStatusUser(userstatus).subscribe(res => {
        if (res.is_error) {
          this.commonService.toastdata(res[0].message, 'error');
        } else {
          this.commonService.reloadComponent('panel-iframe-master-user');
        }
      })
    }
  }
}