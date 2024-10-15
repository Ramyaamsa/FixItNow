import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { IframeComponent } from './layout/iframe/iframe.component';
import { AuthGuard } from './auth/auth.guard';
import { PmChecklistComponent } from './cmms_pages/work-orders/pm-checklist/pm-checklist.component';

const routes: Routes = [{
  path: 'auth',
  loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
}, {
  path: 'pm/:type/:login_id/:login_type',
  component: PmChecklistComponent
}, {
  path: '',
  canActivate: [AuthGuard],
  component: SidebarComponent
}, {
  path: 'iframe',
  canActivate: [AuthGuard],
  component: IframeComponent,
  children: [{
    path: 'dashboard',
    loadChildren: () => import("./cmms_pages/dashboard/dashboard.module").then(m => m.DashboardModule)
  }, {
    path: 'master',
    loadChildren: () => import("./cmms_pages/master/master.module").then(m => m.MasterModule)
  }, {
    path: 'report',
    loadChildren: () => import("./cmms_pages/report/report.module").then(m => m.ReportModule)
  }, {
    path: 'activity',
    loadChildren: () => import("./cmms_pages/activity/activity.module").then(m => m.ActivityModule)
  }, {
    path: 'settings',
    loadChildren: () => import("./cmms_pages/settings/settings.module").then(m => m.SettingsModule)
  }, {
    path: 'work_order',
    loadChildren: () => import("./cmms_pages/work-orders/work-orders.module").then(m => m.WorkOrdersModule)
  }, {
    path: 'charts',
    loadChildren: () => import("./cmms_pages/charts/charts.module").then(m => m.ChartsModule)
  }]
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
