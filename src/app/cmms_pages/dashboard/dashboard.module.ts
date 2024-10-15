import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivityModule } from '../activity/activity.module';
import { HomeComponent } from './home/home.component';
import { PlantComponent } from './plant/plant.component';

const routes: Routes = [ {
  path: 'home',
  component: HomeComponent
}, {
  path: 'plant/:plant_id',
  component: PlantComponent
}]

@NgModule({
  declarations: [
    HomeComponent,
    PlantComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ActivityModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
