import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VisitSummaryPagePage } from './visit-summary-page.page';

const routes: Routes = [
  {
    path: '',
    component: VisitSummaryPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VisitSummaryPagePageRoutingModule {}
