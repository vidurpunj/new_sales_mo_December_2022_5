import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplyLeavePagePageRoutingModule } from './apply-leave-page-routing.module';

import { ApplyLeavePagePage } from './apply-leave-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplyLeavePagePageRoutingModule
  ],
  declarations: [ApplyLeavePagePage]
})
export class ApplyLeavePagePageModule {}
