import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'HomePage',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'otp',
    loadChildren: () => import('./pages/otp/otp.module').then(m => m.OtpPageModule)
  },
  {
    path: 'forget-password',
    loadChildren: () => import('./pages/forget-password/forget-password.module').then(m => m.ForgetPasswordPageModule)
  }, {
    path: 'attendance',
    loadChildren: () => import('./pages/attendance/attendance.module').then(m => m.AttendancePageModule)
  },
  {
    path: 'ApplyLeavePage',
    loadChildren: () => import('./pages/apply-leave-page/apply-leave-page.module').then(m => m.ApplyLeavePagePageModule)
  },
  {
    path: 'calendar',
    loadChildren: () => import('./pages/calendar/calendar.module').then(m => m.CalendarPageModule)
  },
  {
    path: 'LeavePage',
    loadChildren: () => import('./pages/leave/leave.module').then(m => m.LeavePageModule)
  },
  {
    path: 'VisitSummaryPage',
    loadChildren: () => import('./pages/visit-summary/visit-summary.module').then( m => m.VisitSummaryPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
