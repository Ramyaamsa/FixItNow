import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { ClientListComponent } from './client-list/client-list.component';
import { ClientPageComponent } from './client-page/client-page.component';
import { CompanyComponent } from './company/company.component';
import { BuComponent } from './bu/bu.component';
import { PlantComponent } from './plant/plant.component';
import { ShiftComponent } from './shift/shift.component';
import { DepartmentComponent } from './department/department.component';
import { LocationComponent } from './location/location.component';
import { EmployeeHeadComponent } from './employee-head/employee-head.component';
import { EmployeeEngineerComponent } from './employee-engineer/employee-engineer.component';
import { AssetModelComponent } from './asset-model/asset-model.component';
import { ServicesComponent } from './services/services.component';
import { MttrComponent } from './mttr/mttr.component';
import { SparesComponent } from './spares/spares.component';
import { DesignationComponent } from './designation/designation.component';
import { BreakdownComponent } from './breakdown/breakdown.component';
import { BreakdownCategoryComponent } from './breakdown-category/breakdown-category.component';
import { UserComponent } from './user/user.component';
import { AssetGroupComponent } from './asset-group/asset-group.component';
import { UomComponent } from './uom/uom.component';
import { TaskComponent } from './task/task.component';
import { BreakdownStatusComponent } from './breakdown-status/breakdown-status.component';
import { PmStatusComponent } from './pm-status/pm-status.component';
import { AssetComponent } from './asset/asset.component';
import { BreakdownAssignmentComponent } from './breakdown-assignment/breakdown-assignment.component';

const routes: Routes = [{
  path: 'company',
  component: CompanyComponent
},{
  path: 'bu',
  component: BuComponent
},{
  path: 'plant',
  component: PlantComponent
},{
  path: 'shift',
  component: ShiftComponent
},{
  path: 'department',
  component: DepartmentComponent
},{
  path: 'location',
  component: LocationComponent
},{
  path: 'designation',
  component: DesignationComponent
},{
  path: 'user',
  component: UserComponent
},{
  path: 'employee_head',
  component: EmployeeHeadComponent
},{
  path: 'employee_engineer',
  component: EmployeeEngineerComponent
},{
  path: 'asset_model',
  component: AssetModelComponent
},{
  path: 'breakdown',
  component: BreakdownComponent 
},{
  path: 'breakdown_category',
  component: BreakdownCategoryComponent
},{
  path: 'breakdown_assign',
  component: BreakdownAssignmentComponent
},{
  path: 'spares',
  component: SparesComponent
},{
  path: 'services',
  component: ServicesComponent
},{
  path: 'mttr',
  component: MttrComponent
}, {
  path: 'client_page',
  component: ClientPageComponent
}, {
  path: 'client_list',
  component: ClientListComponent
}, {
  path: 'asset_group',
  component: AssetGroupComponent
}, {
  path: 'uom',
  component: UomComponent
}, {
  path: 'task',
  component: TaskComponent
}, {
  path: 'breakdown_status',
  component: BreakdownStatusComponent
}, {
  path: 'pm_status',
  component: PmStatusComponent
}, {
  path: 'asset',
  component: AssetComponent
}]
@NgModule({
  declarations: [
    CompanyComponent,
    BuComponent,
    PlantComponent,
    ShiftComponent,
    DepartmentComponent,
    LocationComponent,
    UserComponent,
    EmployeeHeadComponent,
    EmployeeEngineerComponent,
    AssetModelComponent,
    ServicesComponent,
    MttrComponent,
    SparesComponent,
    DesignationComponent,
    ClientListComponent,
    ClientPageComponent,
    BreakdownComponent,
    BreakdownCategoryComponent,
    AssetGroupComponent,
    UomComponent,
    TaskComponent,
    BreakdownStatusComponent,
    PmStatusComponent,
    AssetComponent,
    BreakdownAssignmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  providers:[DatePipe]
})
export class MasterModule { }
