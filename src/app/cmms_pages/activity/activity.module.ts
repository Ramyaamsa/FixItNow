import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReportTemplateComponent } from './report-template/report-template.component';
import { QuickBallComponent } from './quick-ball/quick-ball.component';
import { MailTemplateComponent } from './mail-template/mail-template.component';

const routes: Routes = [{
  path: 'mail_template',
  component: MailTemplateComponent
}, {
  path: 'report_template',
  component: ReportTemplateComponent
}, {
  path: 'quick_ball',
  component: QuickBallComponent
}]

@NgModule({
  declarations: [
    ReportTemplateComponent,
    QuickBallComponent,
    MailTemplateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  exports: [QuickBallComponent]
})
export class ActivityModule { }
