import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IframeComponent } from './iframe/iframe.component';
import { RouterModule } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    SidebarComponent,
    IframeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgxSpinnerModule
  ],
})
export class LayoutModule { }
