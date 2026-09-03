import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LcamRouteComponent } from './lcam-route.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'lcam' },
  { path: 'lcam/api', pathMatch: 'full', component: LcamRouteComponent },
  { path: 'lcam', pathMatch: 'full', component: LcamRouteComponent },
  { path: 'lcam/:leadId', pathMatch: 'full', component: LcamRouteComponent },
  { path: 'lcam/:leadId/profile', pathMatch: 'full', component: LcamRouteComponent },
  { path: 'lcam/:leadId/proposals', pathMatch: 'full', component: LcamRouteComponent },
  { path: 'lcam/:leadId/applications', pathMatch: 'full', component: LcamRouteComponent },
  { path: '**', redirectTo: 'lcam' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
