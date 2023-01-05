import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VisitSummaryPageRoutingModule } from './visit-summary-routing.module';

import { VisitSummaryPage } from './visit-summary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VisitSummaryPageRoutingModule
  ],
  declarations: [VisitSummaryPage]
})
export class VisitSummaryPageModule {}
