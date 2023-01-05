import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitSummaryPage } from './visit-summary.page';

const routes: Routes = [
  {
    path: '',
    component: VisitSummaryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitSummaryPageRoutingModule {}
