import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ApplyForLeavePageRoutingModule } from './apply-for-leave-routing.module';

import { ApplyForLeavePage } from './apply-for-leave.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ApplyForLeavePageRoutingModule
  ],
  declarations: [ApplyForLeavePage]
})
export class ApplyForLeavePageModule {}
