import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RouterModule, Routes } from '@angular/router';
import { PmScheduleComponent } from './pm-schedule/pm-schedule.component';
import { PmChecklistComponent } from './pm-checklist/pm-checklist.component';
import { PmCalendarComponent } from './pm-calendar/pm-calendar.component';
import { BreakdownComponent } from './breakdown/breakdown.component';
import { ActivityModule } from '../activity/activity.module';
import { TimeFormatPipe } from '../shared_services/time-format.pipe';

const routes: Routes = [{
  path: 'breakdown',
  component: BreakdownComponent
},{
  path: 'pm_schedule',
  component: PmScheduleComponent
},{
  path: 'pm_checklist',
  component: PmChecklistComponent
},{
  path: 'pm_calendar',
  component: PmCalendarComponent
}]

@NgModule({
  declarations: [
    PmScheduleComponent,
    PmChecklistComponent,
    PmCalendarComponent,
    BreakdownComponent,
    TimeFormatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    FullCalendarModule,
    ActivityModule,
    RouterModule.forChild(routes)
  ],
  providers: [],
})
export class WorkOrdersModule { }
