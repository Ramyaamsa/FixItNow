import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CommonService } from './common.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class ResponseInterceptor implements HttpInterceptor {

  constructor(private commonService: CommonService, private spinner: NgxSpinnerService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle error response
        if (error.statusText == null || error.statusText == "") {
        }
        else {
          if (error.error.iserror == true) {
          } else {
            this.commonService.toastdata(error.message, 'error', 3000);
            this.spinner.hide();
          }
        }
        return throwError(error);
      })
    );
  }
}
