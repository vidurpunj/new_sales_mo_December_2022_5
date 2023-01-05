import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitSummaryPagePageRoutingModule } from './visit-summary-page-routing.module';

import { VisitSummaryPagePage } from './visit-summary-page.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitSummaryPagePageRoutingModule
  ],
  declarations: [VisitSummaryPagePage]
})
export class VisitSummaryPagePageModule {}
