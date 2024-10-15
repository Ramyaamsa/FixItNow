import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { LayoutModule } from './layout/layout.module';
import { MasterModule } from './cmms_pages/master/master.module';
import { SettingsModule } from './cmms_pages/settings/settings.module';
import { WorkOrdersModule } from './cmms_pages/work-orders/work-orders.module';
import { ReportModule } from './cmms_pages/report/report.module';
import { DashboardModule } from './cmms_pages/dashboard/dashboard.module';
import { ChartsModule } from './cmms_pages/charts/charts.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { ActivityModule } from './cmms_pages/activity/activity.module';
import { TimeFormatPipe } from './cmms_pages/shared_services/time-format.pipe';
import { ResponseInterceptor } from './cmms_pages/shared_services/response.interceptor';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    LayoutModule,
    RouterModule,
    MasterModule,
    SettingsModule,
    WorkOrdersModule,
    ActivityModule,
    ReportModule,
    DashboardModule,
    ChartsModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
  ],
  providers: [{ provide: LocationStrategy, useClass: PathLocationStrategy },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ResponseInterceptor,
    multi: true
  }, TimeFormatPipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
