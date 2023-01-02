import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplyLeavePagePage } from './apply-leave-page.page';

const routes: Routes = [
  {
    path: '',
    component: ApplyLeavePagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplyLeavePagePageRoutingModule {}
