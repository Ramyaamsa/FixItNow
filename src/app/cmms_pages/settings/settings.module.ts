import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRightsComponent } from './user-rights/user-rights.component';
import { CustimisedTicket } from './customised-ticket/customised-ticket.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SpareMailComponent } from './spare-mail/spare-mail.component';
import { NotificationComponent } from './notification/notification.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NotificationViewComponent } from './notification-view/notification-view.component';

const routes: Routes = [{
  path: 'userpage',
  component: UserRightsComponent
},{
  path:'auto_mail',
  component: SpareMailComponent
},{
  path:'customised_ticket',
  component: CustimisedTicket
},{
  path:'notification',
  component: NotificationComponent
},{
  path:'change_password',
  component: ChangePasswordComponent
},{
  path:'notification-view',
  component: NotificationViewComponent
}];

@NgModule({
  declarations: [UserRightsComponent,SpareMailComponent,CustimisedTicket, NotificationComponent, ChangePasswordComponent, NotificationViewComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class SettingsModule { }
