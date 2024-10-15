import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from './auth.service';
import { Location } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent {
  isNotification: boolean = false;
  isSuccess: boolean = false;
  logindata: any = [];
  returnUrl = "";
  username = "";
  password = "";
  captcha = "";
  errorCount = 0;
  isShow: boolean = false;
  isDisable: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService, private location: Location) { }

  ngOnInit(): void {
    $.validator.setDefaults({ ignore: ":hidden:not(select)" });
    $("#login_form").validate();
  }

  passwordShow(e: any) {
    if ($(e.currentTarget).is(':checked')) {
      $('#login_password').attr('type', 'text');
      $('#password_icon').removeClass('fa-eye').addClass('fa-eye-slash');
    } else {
      $('#login_password').attr('type', 'password');
      $('#password_icon').removeClass('fa-eye-slash').addClass('fa-eye');
    }
  }

  login() {
    this.username = (document.getElementById('login_username') as HTMLInputElement).value;
    this.password = (document.getElementById('login_password') as HTMLInputElement).value;

    if ($("#login_form").valid()) {
      const formData = new FormData();
      formData.append('username', this.username);
      formData.append('password', this.password);

      this.auth.getposts(formData).subscribe((res: any) => {
        this.isNotification = true;
        // Assuming 'res' is the variable holding the JSON response
        if (res.length > 0) {
          if (res[0].is_error) {
            this.isSuccess = false;
            this.errorCount ++;
            if (this.errorCount > 2) {
              this.isShow = true;
              this.isDisable = true;
              $("#login").css('transform','translate(37%, 16%)')
              this.getCaptcha();
            }else{
              $("#login").css('transform','translate(37%, 29%)')
            }
            $('#error_text').html(res.message);
            setTimeout(() => {
              this.isNotification = false;
            }, 1500);
          } else {
            this.isSuccess = true;
            this.logindata = res[0].data;
            localStorage.setItem('user_dtl', JSON.stringify(this.logindata));
            localStorage.setItem('employee_id', this.logindata[0].employee_id);
            localStorage.setItem('employee_name', this.logindata[0].employee_name);
            localStorage.setItem('employee_code', this.logindata[0].employee_code);
            localStorage.setItem('employee_type', this.logindata[0].employee_type);
            localStorage.setItem('employee_email', this.logindata[0].employee_email);
            localStorage.setItem('employee_mobile', this.logindata[0].employee_mobile);
            localStorage.setItem('image_name', this.logindata[0].employee_image);
            localStorage.setItem('image_url', this.logindata[0].employee_image_url);
            localStorage.setItem('company_id', this.logindata[0].company_id);
            localStorage.setItem('bu_id', this.logindata[0].bu_id);
            localStorage.setItem('plant_id', this.logindata[0].plant_id);
            localStorage.setItem('department_id', this.logindata[0].department_id);
            localStorage.setItem('location_id', this.logindata[0].location_id);
            sessionStorage.setItem('isLoggedIn', 'true');

            setTimeout(() => {
              this.router.navigate(['']);
              this.location.replaceState('');
              window.location.reload();
            }, 1500);
          }
        }
      });
    }
  }

  getCaptcha(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      captcha += characters[randomIndex];
    }
    this.captcha = captcha;
  }

  onBlur(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    
    if(this.captcha === value){
      this.isShow = false;
      this.isDisable = false;
      this.errorCount = 0;
      $("#login").css('transform','translate(37%, 29%)')
    }else{
      $('#captcha').val('');
      this.getCaptcha();
    }
  }
}
