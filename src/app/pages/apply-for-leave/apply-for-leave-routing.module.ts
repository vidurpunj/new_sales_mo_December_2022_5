import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplyForLeavePage } from './apply-for-leave.page';

const routes: Routes = [
  {
    path: '',
    component: ApplyForLeavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplyForLeavePageRoutingModule {}
